const Router = require("express");
const User = require("../models/User");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const router = new Router();
const authMiddleware = require('../middleware/auth.middleware')
const fileService = require('../services/fileService')
const File = require('../models/File')

router.post(
  "/registration",
  // валидация
  [
    check("email", "Uncorrect email").isEmail(),
    check(
      "password",
      "Password must be longer than 3 and shorter than 12"
    ).isLength({ min: 3, max: 12 }),
  ],
  async (req, res) => {
    try {
      console.log(req.body);
      // получим результат валидации
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ message: "Uncorrect request", errors });
      }

      const { email, password } = req.body;
      // проверяем существует ли пользователь с такой почтой в БД
      // все функции с БД асинхронные
      const candidate = await User.findOne({ email });

      if (candidate) {
        return res
          .status(400)
          .json({ message: `User with email ${email} already exist` });
      }
      // хешируем пароль
      const hashPassword = await bcrypt.hash(password, 15);
      // Создадим нового пользователя
      const user = new User({ email, password: hashPassword });
      // сохраним пользователя в БД
      await user.save();
      // При регистрации для каждого пользователя будет создаваться папка,
      // в которой будут храниться все его файлы. 
      // после того как пользователь был сохранен в БД, 
      // создаем для него отдельнуюю папку по названию id этого пользователя
      await fileService.createDir(new File({user:user.id, name: ''}))
      return res.json({ message: "User was created" });
    } catch (e) {
      console.log(e);
      res.send({ message: "Server error" });
    }
  }
);

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    // сравним пароль который пришел с тем, который хранится в БД
    const isPassValid = bcrypt.compareSync(password, user.password);
    if (!isPassValid) {
      return res.status(400).json({ message: "Invalid password" });
    }
    // создадим токен
    const token = jwt.sign({ id: user.id }, config.get("secretKey"), {
      expiresIn: "1h", // чколько времени будет существовать токен
    });
    // вернем токен обратно на клиент
    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        diskSpace: user.diskSpace,
        usedSpace: user.usedSpace,
        avatar: user.avatar,
      },
    });
  } catch (e) {
    console.log(e);
    res.send({ message: "Server error" });
  }
});

router.get('/auth', authMiddleware,
    async (req, res) => {
        try {
          // получим пользвателя по id, который достали из токена (токен получаем)
            const user = await User.findOne({_id: req.user.id})
          // перезапишем токен 
            const token = jwt.sign({id: user.id}, config.get("secretKey"), {expiresIn: "1h"})
            return res.json({
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    diskSpace: user.diskSpace,
                    usedSpace: user.usedSpace,
                    avatar: user.avatar
                }
            })
        } catch (e) {
            console.log(e)
            res.send({message: "Server error"})
        }
    })

module.exports = router;

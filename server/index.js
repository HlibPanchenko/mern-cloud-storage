// password mongoDb^ jgwj7kYb2ZbFY9XQ
// username glebpanchenk7
// url: mongodb+srv://glebpanchenk7:<password>@cloud.nwobqez.mongodb.net/?retryWrites=true&w=majority

const express = require("express");
const mongoose = require("mongoose");
const config = require("config");
const authRouter = require("./routes/auth.routes");

const app = express();
// с помощью config можем получать данные из файла default.json в папке config
const PORT = config.get("serverPort");
const corsMiddleware = require("./middleware/cors.middleware");

app.use(corsMiddleware);
app.use(express.json());
app.use("/api/auth", authRouter);

// функция подключения к БД и запуск сервера
const start = async () => {
  try {
    await mongoose.connect(config.get("dbUrl"));

    app.listen(PORT, () => {
      console.log("Server started on port ", PORT);
    });
  } catch (e) {}
};

start();

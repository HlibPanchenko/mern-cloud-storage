const fileService = require("../services/fileService");
const User = require("../models/User");
const File = require("../models/File");
const config = require("config");
const fs = require("fs");

class FileController {
  async createDir(req, res) {
    try {
      // получим с тела запроса название,тип,родительскую папку файла
      const { name, type, parent } = req.body;
      // создадим новый файл и передадим тудаа новые данные
      // id пользователя получим из поля user, которое мы добавояем когда разпарсиваем токен
      const file = new File({ name, type, parent, user: req.user.id });
      // найдем родительский файл по id полученому с запроса
      const parentFile = await File.findOne({ _id: parent });
      if (!parentFile) {
        // если родителя нет, то фаайл будет добавлен в корневую диретокрию
        file.path = name;
        await fileService.createDir(file);
      } else {
        // если родитель есть, то формируем путь: "путь родителя + файл"
        file.path = `${parentFile.path}\\${file.name}`;
        await fileService.createDir(file);
        // в массив родительского файла childs пушим id новосозданного файла
        parentFile.childs.push(file._id);
        await parentFile.save();
      }
      // сохраняем родительский файл
      await file.save();
      return res.json(file);
    } catch (e) {
      console.log(e);
      return res.status(400).json(e);
    }
  }

  // получение файлов
  async getFiles(req, res) {
    try {
      // сортировка
      // так как это get запрос, будем передавать информацию в строке запроса
      const { sort } = req.query;
      let files;
      switch (sort) {
        case "name":
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ name: 1 });
          break;
        case "type":
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ type: 1 });
          break;
        case "date":
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          }).sort({ date: 1 });
          break;
        default:
          // ищем файлы по id пользователя и id родительской папки
          files = await File.find({
            user: req.user.id,
            parent: req.query.parent,
          });
          break;
      }
      // Вариант без сортировки когда мы просто возвращали все файлы
      // const files = await File.find({
      //   user: req.user.id,
      //   parent: req.query.parent,
      // });
      return res.json(files);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Can not get files" });
    }
  }
  // функцию загрузки файла
  async uploadFile(req, res) {
    try {
      // в запросе будем указывать файл, который надо скачать
      const file = req.files.file;
      // найдем родительскую директорию, в которую будем сохранять этот файл
      // ищем по id пользователя и id директории
      const parent = await File.findOne({
        user: req.user.id,
        _id: req.body.parent,
      });
      // найдем пользователя чтобы проверить есть ли у него свободное место на диске
      const user = await User.findOne({ _id: req.user.id });
      // если нету места на диске
      if (user.usedSpace + file.size > user.diskSpace) {
        return res.status(400).json({ message: "There no space on the disk" });
      }
      // если есть место
      user.usedSpace = user.usedSpace + file.size;
      // путь по которому будем сохранять файл
      let path;
      if (parent) {
        path = `${config.get("filePath")}\\${user._id}\\${parent.path}\\${
          file.name
        }`;
      } else {
        // если родителя нет
        path = `${config.get("filePath")}\\${user._id}\\${file.name}`;
      }
      // проверяем существует ли уже файл по такому пути с таким названием
      if (fs.existsSync(path)) {
        return res.status(400).json({ message: "File already exist" });
      }
      // переместим файл по ранее созданному пути
      file.mv(path);
      // получим расширение файла (нам надо слово после последней точки)
      const type = file.name.split(".").pop();
      let filePath = file.name;
      if (parent) {
        filePath = parent.path + "\\" + file.name;
      }
      // создадим модель файла которую будем сохранять в БД
      const dbFile = new File({
        name: file.name,
        type,
        size: file.size,
        path: filePath,
        parent: parent?._id,
        user: user._id,
      });
      // сохраним этот файл в БД
      await dbFile.save();
      // так как мы меняли поля пользователя, то его также надо сохранить
      await user.save();

      res.json(dbFile);
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Upload error" });
    }
  }

  // функцию скачивания файлов
  async downloadFile(req, res) {
    try {
      // получим файл с БД по id файла и пользователя
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      // путь до файла который хранится на сервере
      // req.user.id - папка каждого пользователя имеет название в виде его id
      // const path =
      //   config.get("filePath") +
      //   "\\" +
      //   req.user.id +
      //   "\\" +
      //   file.path +
      //   "\\" +
      //   file.name;
      const path = fileService.getPath(file)
      // если файл по такому пути существует, то мы отправляем его на клиент
      if (fs.existsSync(path)) {
        return res.download(path, file.name);
      }
      // если файл не найден
      return res.status(400).json({ message: "Download error" });
    } catch (e) {
      console.log(e);
      res.status(500).json({ message: "Download error" });
    }
  }
  // функция удаления файла
  async deleteFile(req, res) {
    try {
      const file = await File.findOne({ _id: req.query.id, user: req.user.id });
      if (!file) {
        return res.status(400).json({ message: "file not found" });
      }
      // удалим физический файл на сервере
      fileService.deleteFile(file);
      // удаляем модель файла из БД
      await file.deleteOne();
      return res.json({ message: "File was deleted" });
    } catch (e) {
      console.log(e);
      return res.status(400).json({ message: "Dir is not empty" });
    }
  }

  async searchFile(req, res) {
    try {
        const searchName = req.query.search
        // сначала получим все файлы которые есть у пользователя
        let files = await File.find({user: req.user.id})
        files = files.filter(file => file.name.includes(searchName))
        return res.json(files)
    } catch (e) {
        console.log(e)
        return res.status(400).json({message: 'Search error'})
    }
}
}

module.exports = new FileController();

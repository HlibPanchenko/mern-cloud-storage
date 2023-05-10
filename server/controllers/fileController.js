const fileService = require("../services/fileService");
const User = require("../models/User");
const File = require("../models/File");

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
	// ищем файлы по id пользователя и id родительской папки	
      const files = await File.find({
        user: req.user.id,
        parent: req.query.parent,
      });
      return res.json({ files });
    } catch (e) {
      console.log(e);
      return res.status(500).json({ message: "Can not get files" });
    }
  }
}

module.exports = new FileController();

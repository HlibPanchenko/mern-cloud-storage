const fs = require("fs");
const File = require("../models/File");
const config = require("config");

class FileService {
  // функция которая создает папки
  createDir(file) {
    // путь к файлу, который будем создавать
    const filePath = `${config.get("filePath")}\\${file.user}\\${file.path}`;
    return new Promise((resolve, reject) => {
      try {
        // если файл по такому пути существует, то тогда будем создавать папку
        if (!fs.existsSync(filePath)) {
          fs.mkdirSync(filePath);
          return resolve({ message: "File was created" });
        } else {
          return reject({ message: "File already exist" });
        }
      } catch (e) {
        return reject({ message: "File error" });
      }
    });
  }
  // принимает модель файла из БД
  deleteFile(file) {
    const path = this.getPath(file);
    if (file.type === "dir") {
      fs.rmdirSync(path);
    } else {
      fs.unlinkSync(path);
    }
  }

  getPath(file) {
    return config.get("filePath") + "\\" + file.user + "\\" + file.path;
  }
}

module.exports = new FileService();

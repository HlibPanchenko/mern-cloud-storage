const fs = require('fs')
const File = require('../models/File')
const config = require('config')

class FileService {
	// функция которая создает папки
    createDir(file) {
   // путь к файлу, который будем создавать
        const filePath = `${config.get('filePath')}\\${file.user}\\${file.path}`
        return new Promise(((resolve, reject) => {
            try {
	// если файл по такому пути существует, то тогда будем создавать папку
                if (!fs.existsSync(filePath)) {
                    fs.mkdirSync(filePath)
                    return resolve({message: 'File was created'})
                } else {
                    return reject({message: "File already exist"})
                }
            } catch (e) {
                return reject({message: 'File error'})
            }
        }))
    }

}


module.exports = new FileService()
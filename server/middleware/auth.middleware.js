// каждый раз когда открываем приложение в браузере, будем получать данные о пользователе
// по токену будем получать пользователя и возвращать его
const jwt = require('jsonwebtoken')
const config = require('config')

module.exports = (req, res, next) => {
    if (req.method === 'OPTIONS') {
       return next()
    }

    try {
		// получим токен из заголовка запроса Authorization Bearer
        const token = req.headers.authorization.split(' ')[1]
        if (!token) {
            return res.status(401).json({message: 'Auth error'})
        }
		  // разкодируем токен
        const decoded = jwt.verify(token, config.get('secretKey'))
		  // в запрос поместим даные о токене (токен кладем)
        req.user = decoded
        next()
    } catch (e) {
        return res.status(401).json({message: 'Auth error'})
    }
}
const redisClient = require('../service/redis')

module.exports = (req, res, next) => {
    next()
    redisClient.del(JSON.stringify(req.body.userId))
}
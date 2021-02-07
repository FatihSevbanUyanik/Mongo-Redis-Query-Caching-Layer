// ============================
// IMPORTS
// ============================
const keys = require('../util/keys')
const redis = require('redis')

// ============================
// REDIS CACHE CONNECTION
// ============================
const redisClient = redis.createClient(keys.REDIS_HOST, {
    port: keys.REDIS_PORT
})

module.exports = redisClient
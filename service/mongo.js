// ============================
// IMPORTS
// ============================
const keys = require('../util/keys')
const redisClient = require('./redis')
const mongoose = require('mongoose')
const { promisify } = require('util')

// ============================
// SETUP QUERY CACHING LAYER
// ============================

// retrieve exec function
const exec = mongoose.Query.prototype.exec;
redisClient.get = promisify(redisClient.get);


// define cache chain function during queries
mongoose.Query.prototype.cache = function(option = { key: 'default' }) {
    this.needCache = true
    this.cacheKey = option.cacheKey
    return this
}

// modify exec function to retrieve cached query
mongoose.Query.prototype.exec = async function() {

    if (!this.needCache) { // cache not need
        return exec.apply(this, arguments)
    }

    const key = Object.assign({}, 
        this.getFilter(), 
        { cacheKey: this.cacheKey },
        { collection: this.mongooseCollection.name })

    const keyStr = JSON.stringify(key)
    
    // retrieve the cached result
    let redisResult = await redisClient.get(keyStr)


    if (redisResult) {
        redisResult = JSON.parse(redisResult)
        console.log("LOG: SERVING FROM CACHE")

        // convert JSON to mongoose document
        return Array.isArray(redisResult) ?
            redisResult.map(obj => new this.model(obj)) :
            new this.model(redisResult) 
    }
    
    // query result not in cache, hence database query initiated
    console.log("LOG: SERVING FROM MONGO")
    const queryResult = await exec.apply(this, arguments)

    // cache the obtained db result
    redisClient.setex(keyStr, keys.CACHE_DURATION, JSON.stringify(queryResult))
    return queryResult
}

// ============================
// SETUP SCHEMAS
// ============================
require('../model/Blog')


// ============================
// DATABASE CONNECTION
// ============================
mongoose.connect(keys.MONGO_HOST, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(result => {
    console.log('DB connection successful')
}).catch(error => {
    console.error(error)
})

module.exports = mongoose
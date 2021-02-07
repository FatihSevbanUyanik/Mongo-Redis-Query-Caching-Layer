// config
require('./service/mongo')

// imports
const clearHash = require('./middleware/clearHash') 
const keys = require('./util/keys') 
const express = require('express')
const mongoose = require('mongoose')
const app = express()

// middlewares
app.use(express.json());

// model
const Blog = mongoose.model('Blog')

app.post('/blog/create', clearHash, async (req, res) => {
    const { userId, title, content } = req.body 
    let blog = new Blog({ title, content, userId })
    await blog.save()

    res.status(200).send({
        status: 200,
        data: {
            message: 'success'
        }
    })
})


app.post('/blog/retrieve', async (req, res) => {
    const { userId } = req.body 
    let blogs = await Blog
                        .find({ userId })
                        .cache({ cacheKey: userId })

    res.status(200).send({
        status: 200,
        data: { blogs }
    })
})


// ========================================
// EXCEPTION CATCHER
// ========================================
process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥')
    console.log(err.name, err.message)
})
 
// ============================
// SERVER CONNECTION
// ============================
const server = app.listen(keys.SERVER_PORT, () => {
    console.log(`Server running on Port ${keys.SERVER_PORT}`)
})


module.exports = {app, server}
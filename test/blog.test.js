const {app, server} = require('../index')
const keys = require('../util/keys')
const request = require('supertest')
const mongoose = require('mongoose')
const redisClient = require('../service/redis')
const { delay } = require('../util/utils')

const Blog = mongoose.model('Blog')
jest.setTimeout(30000);


afterAll(async () => {
    await Blog.deleteMany({})
    redisClient.quit()
    mongoose.connection.close()
    server.close()
})
  

test('POST: /blog/create', async () => {
    for (let i = 0; i < 21; i++) {
        await request(app)
            .post('/blog/create')
            .send({
                title: `title${i}`,
                content: `content${i}`,
                userId: (i / 7)
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    }        
});


test('POST: /blog/retrieve', async () => {
    for (let i = 0; i < 6; i++) {
        await request(app)
            .post('/blog/retrieve')
            .send({
                userId: Math.floor(i / 2)
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    }      
    
    const delayDuration = Number(keys.CACHE_DURATION) * 2 * 1000
    await delay(delayDuration);

    for (let i = 0; i < 3; i++) {
        await request(app)
            .post('/blog/retrieve')
            .send({
                userId: i
            })
            .set('Accept', 'application/json')
            .expect('Content-Type', /json/)
            .expect(200)
    }  
});

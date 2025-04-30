import { Db,Collection } from "mongodb"
import { closeConnection, connectDb, getDb } from "../src/mongodb"
import { deleteUser, insertUser } from "../src/db/user"
import request from 'supertest'
import app from "../src/app"

beforeAll(async () => {
    await connectDb()
}, 10000)


describe('POST /auth/register', () => {
    
    it('should allow users to sign up', async () => {
        const response = await request(app).post('/auth/register').send({username: 'test', password: 'test'})
        expect(response.statusCode).toBe(200)
        expect(response.headers['set-cookie'][0]).toContain('sessionToken')
        expect(response.body).toHaveProperty('id')
    })

    it('should not allow duplicate usernames', async () => {
        const response = await request(app).post('/auth/register').send({username: 'test', password: 'test'})
        expect(response.statusCode).toBe(400)
        expect(response.body.error).toMatch('User already exists, sorry!')
    })

    it('should not allow empty usernames or passwords', async () => {
        const emptyUserResponse = await request(app).post('/auth/register').send({username: '', password: 'test'})
        expect(emptyUserResponse.statusCode).toBe(400)
        expect(emptyUserResponse.body.error).toMatch('Username or Password missing')
        
        const emptyPasswordResponse = await request(app).post('/auth/register').send({username: 'iShouldReallyMockMyDatabaseCalls', password: ''})
        expect(emptyPasswordResponse.statusCode).toBe(400)
        expect(emptyPasswordResponse.body.error).toMatch('Username or Password missing')
    })
}) 

afterAll(async () => {
    await deleteUser('test')
    await closeConnection()
})

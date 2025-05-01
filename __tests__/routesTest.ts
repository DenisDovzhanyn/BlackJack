
import { closeConnection, connectDb } from "../src/mongodb"
import { deleteUser, findByUsername } from "../src/db/user"
import request, { Response } from 'supertest'
import app from "../src/app"
import { User } from "../src/models/user"

beforeAll(async () => {
    await connectDb()
}, 10000)


describe('POST /auth/register', () => {
    
    it('should allow users to sign up', async () => {
        const response = await request(app).post('/auth/register').send({username: 'test', password: 'test'})
        expect(response.statusCode).toBe(200)
        expect(response.headers['set-cookie'][0]).toContain('sessionToken')
        expect(response.body).toHaveProperty('id')
        expect(response.body).toHaveProperty('username')
        expect(response.body).toHaveProperty('balance')
        expect(response.body).toHaveProperty('totalProfits')

    })

    it('should not allow duplicate usernames', async () => {
        const response = await request(app).post('/auth/register').send({username: 'test', password: 'test'})
        expect(response.statusCode).toBe(400)
        expect(response.body.error).toMatch('User already exists, sorry!')
    })

    it('should not allow empty username', async () => {
        const emptyUserResponse = await request(app).post('/auth/register').send({username: '', password: 'test'})
        expect(emptyUserResponse.statusCode).toBe(400)
        expect(emptyUserResponse.body.error).toMatch('Username or Password missing')
    })

    it('should not allow empty password', async () => {
        const emptyPasswordResponse = await request(app).post('/auth/register').send({username: 'iShouldReallyMockMyDatabaseCalls', password: ''})
        expect(emptyPasswordResponse.statusCode).toBe(400)
        expect(emptyPasswordResponse.body.error).toMatch('Username or Password missing')
    })
}) 

describe('POST /auth/login', () => {
    
    let response: Response

    it('should allow users to log in', async () => {
        response = await request(app).post('/auth/login').send({username: 'test', password: 'test'})
        expect(response.statusCode).toBe(200)
        expect(response.headers['set-cookie'][0]).toContain('sessionToken')
        expect(response.body).toHaveProperty('id')
        expect(response.body).toHaveProperty('username')
        expect(response.body).toHaveProperty('balance')
        expect(response.body).toHaveProperty('totalProfits')
    })

    it('should update the users cookie in mongodb', async () => {
        const user: User = await findByUsername('test') as User
        const lastLetterOfCookieIndex = response.headers['set-cookie'][0].indexOf(';')
        // substring(12) because response.headers['set-cookie'][0] will look something like 'sessionToken=blahblahblah'
        expect(user.authorization.sessionToken).toMatch(response.headers['set-cookie'][0].substring(13, lastLetterOfCookieIndex))
    })
})

afterAll(async () => {
    await deleteUser('test')
    await closeConnection()
})

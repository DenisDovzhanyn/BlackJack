import { connectDb } from "../src/mongodb"

beforeAll(async () => {
    await connectDb()
})

test('no duplicate usernames', () => {
    
})

import { createClient } from "redis";
import { BlackJackDocument, BlackJackGame } from "./game/game";
import { ObjectId } from "mongodb";

const client = createClient({
    username: process.env.REDIS_USERNAME!,
    password: process.env.REDIS_PASSWORD!,
    socket: {
        host: process.env.REDIS_HOST!,
        port: Number(process.env.REDIS_PORT!)
    }
})
client.on('error', err => console.log('Redis Client Error', err));
client.on('ready', () => console.log('Redis client connected and ready for commands'))

export const connectToRedis = async () => {
    await client.connect()
}

export const setGameState = async (game: BlackJackGame) => {
    if (!client.isReady) throw new Error('Redis client not ready')
    // we set the game id to the users id since a user can only have one game
    // going on at once

    await client.set(game.playerId.toString(), JSON.stringify(game), {expiration: {type: 'EX' , value: 600}})
}

export const getGameState = async (userId: ObjectId) => {
    if (!client.isReady) throw new Error('Redis client not ready')
    
    const stringifiedState =  await client.get(userId.toString())
    if (!stringifiedState) throw new Error('Error getting state or game does not exist')

    const gameStateDocument: BlackJackDocument = JSON.parse(stringifiedState)
    return new BlackJackGame(gameStateDocument)
}
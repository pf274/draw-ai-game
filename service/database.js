
const { MongoClient } = require("mongodb");
const bcrypt = require('bcrypt');
const uuid = require('uuid');

let gameCollection;
let userCollection;
const username = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const hostname = process.env.MONGOHOSTNAME;

const url = `mongodb+srv://${username}:${password}@${hostname}`;
const client = new MongoClient(url);
gameCollection = client.db('startup').collection('games');
userCollection = client.db('startup').collection('users');

// ----------- Users -----------

async function getUser(username) {
    const cursor = userCollection.find({ username });
    return cursor.toArray().then(results => results.length > 0 ? results[0] : false);
}
async function getUsers() {
    const cursor = userCollection.find();
    return cursor.toArray();
}
async function newUser(username, password) {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = { username, password: passwordHash, token: uuid.v4() };
    await userCollection.insertOne(user);
    return user;
}
async function getUserByToken(token) {
    return userCollection.findOne({ token });
}

// ----------- Games -----------

async function getGames() {
    const cursor = gameCollection.find();
    return cursor.toArray();
}
async function getGame(game_id) {
    const cursor = gameCollection.find({ id: game_id });
    return cursor.toArray().then(results => results.length > 0 ? results[0] : false);
}
async function clearAllGames() {
    try {
        await gameCollection.deleteMany({});
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
async function startGame(game_id) {
    try {
        userCollection.updateOne({ id: game_id }, { $set: { status: "started" } });
        return true;
    } catch (err) {
        console.log(err);
        return false;
    }
}
async function hostGame(game_info) {
    const game_exists = await getGame(game_info.id);
    if (!game_exists) {
        await gameCollection.insertOne(game_info);
        return true;
    }
    return false;
}

async function joinGame(id, connection) {
    await gameCollection.updateOne({ id }, { $push: { participants: connection } });
}
async function leaveGame(id, connection) {
    await gameCollection.updateOne({ id }, { $pull: { participants: connection } });
}
async function endGame(game_id) {
    const game_exists = await getGame(game_id);
    if (game_exists) {
        await gameCollection.deleteOne({ id: game_id });
        return true;
    }
    return false;
}
async function updateGame(game_data) {
    await gameCollection.updateOne({ id: game_data.id }, game_data);
}

async function keepConnectionAlive(game_id, connection) {
    await gameCollection.updateOne(
        { id: game_id, 'participants.id': connection.id },
        { $set: { 'participants.$.alive': true } }
    );
}

module.exports = {
    getUser,
    getUsers,
    getGame,
    getGames,
    clearAllGames,
    startGame,
    hostGame,
    endGame,
    newUser,
    getUserByToken,
    joinGame,
    leaveGame,
    updateGame,
    keepConnectionAlive,
}
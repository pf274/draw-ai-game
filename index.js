const { MongoClient } = require('mongodb');
require("dotenv").config({path: '.env'});
async function testMongo() {
    const username = process.env.username;
    const password = process.env.password;
    const hostname = 'mongodb.com';
    const uri = `mongodb+srv://${username}:${password}@${hostname}`;
    const client = new MongoClient(uri);

    let usersCollection = client.db('startup').collection('users');
    const testUser = {
        username: 'Test',
        password: 'asdf1234'
    }
    await usersCollection.insertOne(testUser);


    console.log(client);
}

testMongo();
const { MongoClient } = require('mongodb');
const uri = `mongodb+srv://${process.env.MONGOUSER}:${process.env.MONGOPASSWORD}@${process.env.MONGOHOSTNAME}/?retryWrites=true&w=majority`;

/**
 * Post an array of objects to mongodb
 * @param {string} dbName 
 * @param {string} colName 
 * @param {array<object>} data 
 * @returns 
 */
async function mongoPostObjects(dbName, colName, data) {
    const client = new MongoClient(uri);
    try {
        await client.connect();
        const result = client.db(dbName).collection(colName).insertMany(data);
        console.log(result);
        return result;
    } catch (err) {
        console.log(`Error with mongodb: ${err}`);
    }
}
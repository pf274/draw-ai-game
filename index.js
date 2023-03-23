const express = require('express');
const {MongoClient} = require("mongodb");
const app = express();


// ------------- Express -------------


// Static file hosting
app.use(express.static('public'));
app.use(express.json());

// APIs
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

apiRouter.get('/games/list', async (req, res) => {
  let all_games = await getGames();
  res.send(all_games);
});

apiRouter.get('/games/:game', async (req, res) => {
  let game = await getGame(req.params.game);
  res.send(game);
});

apiRouter.delete('/games/clear', async (req, res) => {
  let cleared_all = await clearAllGames();
  res.send(cleared_all);
})

apiRouter.post('/games/host', async (req, res) => {
  let game_info = req.body;
  let response = await hostGame(game_info);
  res.send(response);
});

apiRouter.post('/games/start/:game_id', async (req, res) => {
  let response = await startGame(req.params.game_id);
  res.send(response);
});

apiRouter.get('/users/list', async (req, res) => {
  let users = await getUsers();
  res.send(users);
});

apiRouter.post('/users/register', async (req, res) => {
  let user_exists = await getUser(req.body.username);
  if (!user_exists) {
    await userCollection.insertOne(req.body);
    return true;
  }
  return false;
});

apiRouter.get('/users/login/:username/:password', async (req, res) => {
  let user_info = await getUser(req.params.username);
  if (user_info) {
    let password_matches = (user_info.password == req.params.password);
    if (password_matches) {
      res.send({status: "successful"});
    } else {
      res.send({status: "invalid password"});
    }
  } else {
    res.send({status: "invalid username"});
  }
});

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
    userCollection.updateOne({id: game_id}, {$set: {status: "started"}});
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }

}
async function getUser(username) {
  let cursor = userCollection.find({username: username});
  return cursor.toArray().then(results => results.length > 0 ? results[0] : false);
}

async function getUsers() {
  let cursor = userCollection.find();
  return cursor.toArray();
}

async function hostGame(game_info) {
  let game_exists = await getGame(game_info.id);
  if (!game_exists) {
    await gameCollection.insertOne(game_info);
    return true;
  }
  return false;
}

async function endGame(game_info) {
  let game_exists = await getGame(game_info.id);
  if (game_exists) {
    await gameCollection.deleteOne({id: game_info});
    return true;
  }
  return false;
}

async function getGames() {
  let cursor = gameCollection.find();
  return cursor.toArray();
}

async function getGame(game_id) {
  let cursor = gameCollection.find({id: game_id});
  return cursor.toArray().then(results => results.length > 0 ? results[0] : false);
}



// Listening to a network port
const port = 4000;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

// ------------- MongoDB -------------

let gameCollection;
let userCollection;
const username = process.env.MONGOUSER;
const password = process.env.MONGOPASSWORD;
const hostname = process.env.MONGOHOSTNAME;

async function dbSetup() {
  const url = `mongodb+srv://${username}:${password}@${hostname}`;
  const client = new MongoClient(url);
  gameCollection = client.db('startup').collection('games');
  userCollection = client.db('startup').collection('users');
}

dbSetup();
const express = require('express');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const DB = require('./database.js');

// ----------- Express Settings and Setup -----------
app.use(express.static('../public'));
app.use(express.json());
app.use(cookieParser());
const apiRouter = express.Router();
app.use(`/api`, apiRouter);

// ----------- Authorization -----------
const authCookieName = 'token';

function setAuthCookie(res, authToken) {
  res.cookie(authCookieName, authToken, {
    secure: true,
    httpOnly: true,
    sameSite: 'strict',
  });
}

// CreateAuth token for a new user
apiRouter.post('/auth/create', async (req, res) => {
  let userExists = await DB.getUser(req.body.username);
  if (userExists) {
    res.status(409).send({ msg: 'User already exists' });
  } else {
    const user = await DB.newUser(req.body.username, req.body.password);

    // Set the cookie
    setAuthCookie(res, user.token);

    res.send({
      id: user._id,
    });
  }
});

// GetAuth token for the provided credentials
apiRouter.post('/auth/login', async (req, res) => {
  const user = await DB.getUser(req.body.username);
  if (user) {
    if (await bcrypt.compare(req.body.password, user.password)) {
      setAuthCookie(res, user.token);
      res.send({ id: user._id });
      return;
    }
  }
  res.status(401).send({ msg: 'Unauthorized' });
});

// DeleteAuth token if stored in cookie
apiRouter.delete('/auth/logout', (_req, res) => {
  res.clearCookie(authCookieName);
  res.status(204).end();
});

// GetUser returns information about a user
apiRouter.get('/user/:username', async (req, res) => {
  const user_info = await DB.getUser(req.params.username);
  if (user_info) {
    const token = req?.cookies.token;
    res.send({ username: user_info.username, authenticated: token === user_info.token });
    return;
  }
  res.status(404).send({ msg: 'Unknown' });
});

// secureApiRouter verifies credentials for endpoints
var secureApiRouter = express.Router();
apiRouter.use(secureApiRouter);

secureApiRouter.use(async (req, res, next) => {
  let authToken = req.cookies[authCookieName];
  const user = await DB.getUserByToken(authToken);
  if (user) {
    next();
  } else {
    res.status(401).send({ msg: 'Unauthorized' });
  }
});

// ----------- User APIs -----------

secureApiRouter.get('/users/list', async (req, res) => {
  let users = await DB.getUsers();
  res.send(users);
});

secureApiRouter.post('/users/register', async (req, res) => {
  let user_exists = await DB.getUser(req.body.username);
  if (!user_exists) {
    await DB.newUser(req.body.username, req.body.password);
    res.send(true);
  }
  res.send(false);
});

secureApiRouter.get('/users/login/:username/:password', async (req, res) => {
  let user_info = await DB.getUser(req.params.username);
  if (user_info) {
    let password_matches = await bcrypt.compare(user_info.password, req.params.password);
    if (password_matches) {
      setAuthCookie(res, user_info.token);
      res.status(200).send({msg: "successful"});
    } else {
      res.status(401).send({msg: "invalid password"});
    }
  } else {
    res.status(401).send({msg: "invalid username"});
  }
});

// ----------- Game APIs -----------

secureApiRouter.get('/games/list', async (req, res) => {
  let all_games = await DB.getGames();
  res.send(all_games);
});

secureApiRouter.get('/games/:game', async (req, res) => {
  let game = await DB.getGame(req.params.game);
  res.send(game);
});

secureApiRouter.delete('/games/clear', async (req, res) => {
  let cleared_all = await DB.clearAllGames();
  res.send(cleared_all);
})

secureApiRouter.post('/games/host', async (req, res) => {
  let game_info = req.body;
  let response = await DB.hostGame(game_info);
  res.send(response);
});

secureApiRouter.post('/games/start/:game_id', async (req, res) => {
  let response = await DB.startGame(req.params.game_id);
  res.send(response);
});

// ----------- Final Setup -----------

// Default error handler
app.use(function (err, req, res, next) {
  res.status(500).send({ type: err.name, message: err.message });
});

// Return the application's default page if the path is unknown
app.use((_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

const port = process.argv.length > 2 ? process.argv[2] : 3000;
app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
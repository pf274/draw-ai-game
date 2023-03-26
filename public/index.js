// import { classDisplay, elementDisplay, modalDisplay, generateCode } from "./local_modules/helper_functions";


// initialization
// async function checkCredentials() {
//     let loggedIn = false;
//     if (localStorage.getItem("username")) {
//         let username = localStorage.getItem("username");
//         let verified = await fetch(`/api/users/login/${username}/${PASSWORDPASSWORD}`);
//         loggedIn = (verified.msg == "successful");
//         if (!loggedIn) {
//             localStorage.removeItem("username");
//         }
//     }
//     if (loggedIn) {
//         let username = localStorage.getItem("username");
//         classDisplay("loggedIn", "block");
//         classDisplay("noCredentials", "none");

//         let lobbyTitle = document.getElementById("LobbyTitle");
//         lobbyTitle.innerText = `Welcome, ${username}!`;
//     } else {
//         classDisplay("loggedIn", "none");
//         classDisplay("noCredentials", "block");
//     }
// }

// checkCredentials();
classDisplay("loggedIn", "none");
classDisplay("noCredentials", "block");

// Start entering credentials
let startCredentialsButton = document.getElementById("startCredentialsButton");
startCredentialsButton.addEventListener('click', () => {
    let fields = [];
    fields.push(document.getElementById("LoginUsernameField"));
    fields.push(document.getElementById("LoginPasswordField"));
    fields.push(document.getElementById("SignupUsernameField"));
    fields.push(document.getElementById("SignupPasswordField"));
    fields.push(document.getElementById("SignupReenterPasswordField"));
    fields.forEach((field) => {
        field.value = "";
    });
    elementDisplay("loginCredentialsAlert", "none");
    elementDisplay("signupCredentialsAlert", "none");
})

// logging in
let loginButton = document.getElementById("LoginSubmitButton");
loginButton.addEventListener('click', async () => {
    let usernameField = document.getElementById("LoginUsernameField");
    let passwordField = document.getElementById("LoginPasswordField");

    let username = usernameField.value;
    let password = passwordField.value;

    let response = await fetch('/api/auth/login', {
        method: "post",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: username,
            password: password,
        })
    });
    let body = await response.json();

    if (response.status == 200) {
        console.log("Login Successful!");
        localStorage.setItem("username", username);
        modalDisplay("loginModal", false);
        classDisplay("loggedIn", "block");
        classDisplay("noCredentials", "none");
        let lobbyTitle = document.getElementById("LobbyTitle");
        lobbyTitle.innerText = `Welcome, ${username}!`;
        elementDisplay("loginCredentialsAlert", "none");
    } else {
        console.log(body.msg);
        let alert = document.getElementById('loginCredentialsAlert');
        alert.innerHTML = body.msg;
        elementDisplay("loginCredentialsAlert", "block");
    }
});

// signing up
let signupButton = document.getElementById("SignupSubmitButton");
signupButton.addEventListener('click', async () => {
    let usernameField = document.getElementById("SignupUsernameField");
    let passwordField = document.getElementById("SignupPasswordField");
    let reenterPasswordField = document.getElementById("SignupReenterPasswordField");

    let username = usernameField.value;
    let password = passwordField.value;
    let reenteredPassword = reenterPasswordField.value;

    if (password !== reenteredPassword) {
        console.log("Passwords do not match!");
        let alert = document.getElementById('signupCredentialsAlert');
        alert.innerHTML = "Passwords do not match. Please try again.";
        elementDisplay("signupCredentialsAlert", "block");
        return;
    }
    if (password.length == 0) {
        let alert = document.getElementById('signupCredentialsAlert');
        alert.innerHTML = "Please provide a password.";
        elementDisplay("signupCredentialsAlert", "block");
        return;
    }
    let response = await fetch('/api/auth/create', {
        method: "post",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: username,
            password: password,
        })
    });
    let body = await response.json();

    if (response.status == 200) {
        console.log(response);
        console.log("Signup successful!");
        // TODO: SKIP SIGNING IN WHEN REGISTERED
        modalDisplay("signupModal", false);
        modalDisplay("loginModal", true);
        elementDisplay("signupCredentialsAlert", "none");
    } else {
        console.log("User already exists!");
        let alert = document.getElementById('signupCredentialsAlert');
        alert.innerHTML = body.msg;
        elementDisplay("signupCredentialsAlert", "block");
    }
})

// logging out
let logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener('click', () => {
    localStorage.removeItem("username");
    classDisplay("loggedIn", "none");
    classDisplay("noCredentials", "block");
});

async function pruneGames() {
    // TODO: get rid of games that don't have their participants or hosts on the network
}

// Joining a game
let joinGameButton = document.getElementById("joinGameButton");
joinGameButton.addEventListener('click', async () => {
    let gameCodeField = document.getElementById("joinGameCodeField");

    let gameCode = gameCodeField.value;

    let games = await fetch('/api/games/list').then(response => response.json());
    let gamesMap = {};
    for (const game of games) {
        gamesMap[game.id] = game;
    }
    if (gameCode in gamesMap) {
        let limit = 100;
        if (gamesMap[gameCode].participants.length < limit) {
            console.log("Join Game Successful!");
            elementDisplay("joinGameAlert", "none");
            // TODO: ADD PERSON TO PARTICIPANTS LIST
        } else {
            console.log(`Game is limited to ${limit} people`);
            let alert = document.getElementById('joinGameAlert');
            alert.innerHTML = `Game is at capacity. (${limit} people)`;
            elementDisplay("joinGameAlert", "block");
        }
    } else {
        console.log("Invalid game code!");
        let alert = document.getElementById('joinGameAlert');
        alert.innerHTML = `Invalid Game Code`;
        elementDisplay("joinGameAlert", "block");
    }
})



// Hosting a game
let hostGameModalButton = document.getElementById("hostGameModalButton");
hostGameModalButton.addEventListener('click', async () => {
    await pruneGames();
    let generatedCodeElement = document.getElementById("generatedCode");
    let generatedCode = generateCode(); // Generates a random game code four characters long, using chars 0-9 and A-Z.

    let all_games = await fetch("api/games/list").then(response => response.json());
    // console.log(all_games);
    let games_map = {};
    for (const game of all_games) {
        games_map[game.id] = game;
    }
    while (generatedCode in games_map) {
        generatedCode = generateCode();
    }
    let username = localStorage.getItem("username");
    let hosted_game = await fetch("/api/games/host", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            id: generatedCode,
            host: username,
            participants: [],
            status: "lobby",
        })
    }).then(response => {
        if (response.ok) return response.json();
    });
    // console.log(hosted_game);
    generatedCodeElement.innerText = generatedCode;
});

// start hosted game
let startHostedGameButton = document.getElementById("startHostedGameButton");
startHostedGameButton.addEventListener('click', async () => {
    let generatedCodeElement = document.getElementById("generatedCode");
    let game_id = generatedCodeElement.innerText;
    // let username = localStorage.getItem("username");
    let started_game = await fetch(`/api/games/start/${game_id}`, {method: "POST"}).then(response => response.json());
    let game_info = await fetch(`api/games/${game_id}`).then(response => response.json());
    localStorage.setItem("game", JSON.stringify(game_info));
    // TODO: Tell other players' webpages to start game.
    window.location.href = "./Pages/PartyDraw/draw.html";
});

// start free draw
let freeDrawButton = document.getElementById("freeDrawButton");
freeDrawButton.addEventListener('click', () => {
    let generatedCode = generateCode(); // Generates a random game code four characters long, using chars 0-9 and A-Z.
    let username = localStorage.getItem("username");
    let local_game = {
        game_code: generatedCode,
        host: username,
        participants: {
            [username]: {},
        },
        game_type: "local",
    }
    localStorage.setItem("game", JSON.stringify(local_game));
    window.location.href = "./Pages/FreeDraw/draw.html";
});
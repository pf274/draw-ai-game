// import { classDisplay, elementDisplay, modalDisplay, generateCode } from "./local_modules/helper_functions";


// initialization
async function checkCredentials() {
    let loggedIn = false;
    if (localStorage.getItem("user_data")) {
        let user_data = JSON.parse(localStorage.getItem("user_data"));
        let verified = await fetch(`/api/users/login/${user_data?.username}/${user_data?.password}`);
        loggedIn = (verified.msg == "successful");
        if (!loggedIn) {
            localStorage.removeItem("user_data");
        }
    }
    if (loggedIn) {
        let user_data = JSON.parse(localStorage.getItem("user_data"));
        classDisplay("loggedIn", "block");
        classDisplay("noCredentials", "none");

        let lobbyTitle = document.getElementById("LobbyTitle");
        lobbyTitle.innerText = `Welcome, ${user_data?.username}!`;
    } else {
        classDisplay("loggedIn", "none");
        classDisplay("noCredentials", "block");
    }
}

checkCredentials();


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
    let users = await fetch('/api/users/list').then(response => response.json());
    let users_map = {};
    for (const user of users) {
        users_map[user.username] = user;
    }
    if (username in users_map) {
        if (users_map[username]?.password === password) {
             console.log("Login Successful!");
            localStorage.setItem("user_data", JSON.stringify(users_map[username]));
            modalDisplay("loginModal", false);
            classDisplay("loggedIn", "block");
            classDisplay("noCredentials", "none");
            let lobbyTitle = document.getElementById("LobbyTitle");
            lobbyTitle.innerText = `Welcome, ${username}!`;
            elementDisplay("loginCredentialsAlert", "none");
        } else {
             console.log("Invalid Password, scrub!");
            let alert = document.getElementById('loginCredentialsAlert');
            alert.innerHTML = "Invalid password. Please try again.";
            elementDisplay("loginCredentialsAlert", "block");
        }
    } else {
        console.log("unrecognized user!");
        let alert = document.getElementById('loginCredentialsAlert');
        alert.innerHTML = "Invalid username. Please try again.";
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

    let users = await fetch('/api/users/list').then(response => response.json());
    let users_map = {};
    for (const user of users) {
        users_map[user.username] = user;
    }

    if (!(username in users_map)) {
        if (password.length > 0) {
            if (password === reenteredPassword) {
                let response = await fetch(`api/users/register`, {
                    method: "POST",
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({
                        username: username,
                        password: password,
                    })
                });
                console.log(response);
                console.log("Signup successful!");
                // TODO: SKIP SIGNING IN WHEN REGISTERED
                modalDisplay("signupModal", false);
                modalDisplay("loginModal", true);
                elementDisplay("signupCredentialsAlert", "none");
            } else {
                 console.log("Passwords do not match!");
                let alert = document.getElementById('signupCredentialsAlert');
                alert.innerHTML = "Passwords do not match. Please try again.";
                elementDisplay("signupCredentialsAlert", "block");
            }
        } else {
            let alert = document.getElementById('signupCredentialsAlert');
            alert.innerHTML = "Please provide a password.";
            elementDisplay("signupCredentialsAlert", "block");
        }

    } else {
         // console.log("User already exists!");
        let alert = document.getElementById('signupCredentialsAlert');
        alert.innerHTML = "Username already in use. Please try again.";
        elementDisplay("signupCredentialsAlert", "block");
    }
})

// logging out
let logoutButton = document.getElementById("logoutButton");
logoutButton.addEventListener('click', () => {
    localStorage.removeItem("user_data");
    classDisplay("loggedIn", "none");
    classDisplay("noCredentials", "block");
});

// Joining a game
let joinGameButton = document.getElementById("joinGameButton");
joinGameButton.addEventListener('click', () => {
    let gameCodeField = document.getElementById("joinGameCodeField");

    let gameCode = gameCodeField.value;
    let alert = document.getElementById('joinGameAlert');
    alert.innerHTML = "Joining unavaliable until networking is programmed.";
    elementDisplay("joinGameAlert", "block");
    if (gameCode in games) {
         console.log("Join Game Successful!");
    } else {
         console.log("Invalid game code!");
    }
})



// Hosting a game
let hostGameModalButton = document.getElementById("hostGameModalButton");
hostGameModalButton.addEventListener('click', async () => {
    let deleted = await fetch("api/games/clear", {method: "DELETE"}).then(response => response.json());
    let generatedCodeElement = document.getElementById("generatedCode");
    let generatedCode = generateCode(); // Generates a random game code four characters long, using chars 0-9 and A-Z.

    let all_games = await fetch("api/games/list").then(response => response.json());
    console.log(all_games);
    let games_map = {};
    for (const game of all_games) {
        games_map[game.id] = game;
    }
    while (generatedCode in games_map) {
        generatedCode = generateCode();
    }
    let username = JSON.parse(localStorage.getItem("user_data")).username;
    let hosted_game = await fetch("/api/games/host", {
        method: "POST",
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            id: generatedCode,
            host: username,
            participants: [],
            status: "starting",
        })
    }).then(response => {
        if (response.ok) return response.json();
    });
    console.log(hosted_game);
    generatedCodeElement.innerText = generatedCode;
});

// start hosted game
let startHostedGameButton = document.getElementById("startHostedGameButton");
startHostedGameButton.addEventListener('click', async () => {
    let generatedCodeElement = document.getElementById("generatedCode");
    let game_id = generatedCodeElement.innerText;
    // let username = JSON.parse(localStorage.getItem("user_data")).username;
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
    let username = JSON.parse(localStorage.getItem("user_data")).username;
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
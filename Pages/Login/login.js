/**
 * Redirects to the home page.
**/
function goToHome() {
  console.log("Going to home page...")
  window.location.assign('../../index.html');
}
/**
 * 
 * 
**/
function manageLogin() {
  if (verifyLogin()) {
    let username = document.getElementById("UsernameField").value;
    let password = document.getElementById("PasswordField").value;
    attemptLogin(username, password);
  }
}

/**
 * Verifies if a valid username and password were entered.
 * @return {boolean} success
 */
function verifyLogin() {
  console.log("Verifying Login Credentials...");
  let username = document.getElementById("UsernameField").value;
  let password = document.getElementById("PasswordField").value;
  console.log(`Username: ${JSON.stringify(username)}, Password: ${JSON.stringify(password)}`);
  // username
  let UsernameSection = document.getElementById("UsernameSection");
  UsernameSection.style.border = `${username ? "0px" : "2px"} solid red`;
  // password
  let PasswordSection = document.getElementById("PasswordSection");
  PasswordSection.style.border = `${password ? "0px" : "2px"} solid red`;
  // Notification
  let Notification = document.getElementById("Notification");
  if (!username && password) {
    Notification.innerHTML = "Please provide a username.";
  } else if (username && !password) {
    Notification.innerHTML = "Please provide a password.";
  } else if (!username && !password) {
    Notification.innerHTML = "Please provide a username and password.";
  } else {
    Notification.innerHTML = "";
  }
  console.log(`${username && password ? "V" : "Inv"}alid credentials`);
  return (username && password);
}

/**
 * Attempts to log in with the provided username and password
 * @param {string} username
 * @param {string} password
 * @return {boolean} success
 */
function attemptLogin(username, password) {
  console.log("Attempting Login...");
  // TODO: see if username exists in database. If so, check to see if password matches before logging in.
}
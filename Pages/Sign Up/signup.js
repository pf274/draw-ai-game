
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
function manageSignup() {
  if (verifySignup()) {
    let username = document.getElementById("UsernameField").value;
    let password = document.getElementById("PasswordField").value;
    attemptSignup(username, password);
  }
}

/**
 * Verifies if a valid username and password were entered.
 * @return {boolean} success
 */
function verifySignup() {
  console.log("Verifying Signup Credentials...");
  let username = document.getElementById("UsernameField").value;
  let password = document.getElementById("PasswordField").value;
  let reenteredPassword = document.getElementById("ReenterPasswordField").value;

  console.log(`Username: ${JSON.stringify(username)}, Password: ${JSON.stringify(password)}`);
  // username
  let UsernameSection = document.getElementById("UsernameSection");
  UsernameSection.style.border = `${username ? "0px" : "2px"} solid red`;
  // password
  let PasswordSection = document.getElementById("PasswordSection");
  PasswordSection.style.border = `${password && (password === reenteredPassword) ? "0px" : "2px"} solid red`;
  // Notification
  let Notification = document.getElementById("Notification");
  if (!username && password) {
    Notification.innerHTML = "Please provide a username.";
  } else if (username && !password) {
    Notification.innerHTML = "Please provide a password.";
  } else if (!username && !password) {
    Notification.innerHTML = "Please provide a username and password.";
  } else if (!reenteredPassword) {
    Notification.innerHTML = "Please re-enter your password."
  } else if (reenteredPassword != password) {
    Notification.innerHTML = "Passwords do not match."
  } else {
    Notification.innerHTML = "";
  }
  let success = username && password && (password == reenteredPassword);
  console.log(`${success ? "V" : "Inv"}alid credentials`);
  return (username && password && (password == reenteredPassword));
}

/**
 * Attempts to log in with the provided username and password
 * @param {string} username
 * @param {string} password
 * @return {boolean} success
 */
function attemptSignup(username, password) {
  console.log("Attempting Signup...");
  // TODO: check to see if username is taken.
  // If not, set up new user.
}
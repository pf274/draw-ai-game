
function goToHome() {
  console.log("Going to home page...")
  window.location.assign('../../index.html');
}
function attemptLogin() {
  console.log("Attempting login...");
  let username = document.getElementById("UsernameField").value;
  let password = document.getElementById("PasswordField").value;
  console.log(`Username: ${JSON.stringify(username)}, Password: ${JSON.stringify(password)}`);
  if (!username) {
    console.log('Username field is empty!');
    // document.getElementById("UsernameSection").setAttribute("border-radius", "2px");
    // document.getElementById("UsernameSection").setAttribute("border-style", 1);
    // document.getElementById("UsernameSection").setAttribute("border-color", "#FF0000");
  }
  if (!password) {
    console.log('Password field is empty!');
  }
}

// document.getElementById("BackButton").onclick = goToHome;
// document.getElementById("SubmitButton").onclick = attemptLogin;
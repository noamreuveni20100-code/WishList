import { send } from "clientUtilities";
import { get } from "componentUtilities";
import { createBar } from "script/funcs";
import { User } from "script/types";

var usernameInput = get("input", "usernameInput");
var passwordInput = get("input", "passwordInput");
var confirmInput = get("input", "confirmInput");
var submitButton = get("button", "submitButton");
var errorDiv = get("div", "errorDiv");

var token = localStorage.getItem("token");
var user = await send<User | null>("getUser", token);

document.body.prepend(createBar(user));

submitButton.onclick = async function () {
  // בדיקה בסיסית שהשדות מלאים
  if (!usernameInput.value || !passwordInput.value || !confirmInput.value) {
    errorDiv.innerText = "Please fill in all fields.";
    return;
  }

  // בדיקה שהסיסמאות תואמות
  if (passwordInput.value != confirmInput.value) {
    errorDiv.innerText = "Passwords do not match.";
    return;
  }

  // שליחת בקשת הרשמה לשרת
  var token = await send<string | null>("signUp", usernameInput.value, passwordInput.value);
  if (token == null) {
    errorDiv.innerText = "A user with this username already exists.";
    return;
  }

  // שמירה וכניסה לאתר
  localStorage.setItem("token", token);
  location.href = "index.html";
};
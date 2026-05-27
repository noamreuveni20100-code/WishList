import { send } from "clientUtilities";
import { get } from "componentUtilities";
import { createBar } from "script/funcs";
import { User } from "script/types";

var usernameInput = get("input", "usernameInput");
var passwordInput = get("input", "passwordInput");
var submitButton = get("button", "submitButton");
var errorDiv = get("div", "errorDiv");

// בדיקה אם המשתמש כבר מחובר, כדי להציג את הבר העליון של mywishlist
var token = localStorage.getItem("token");
var user = await send<User | null>("getUser", token);

document.body.prepend(createBar(user));

submitButton.onclick = async function () {
  if (!usernameInput.value || !passwordInput.value) {
    errorDiv.innerText = "Please fill in all fields.";
    return;
  }

  var token = await send<string | null>("logIn", usernameInput.value, passwordInput.value);

  if (token == null) {
    errorDiv.innerText = "Invalid username or password.";
    return;
  }

  // שמירת הטוקן ומעבר לדף הבית של רשימת המשאלות
  localStorage.setItem("token", token);
  location.href = "index.html";
};
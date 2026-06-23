import { send } from "clientUtilities";
import { createBar } from "script/funcs";
import { User } from "script/types";

const token = localStorage.getItem("token");
let user: User | null = null;

// בדיקה אם המשתמש כבר מחובר
if (token && token.trim() !== "") {
    const response = await send<any>("getUser", token);
    if (response && response !== "") {
        user = response as User;
        // אם הוא מחובר, נעביר אותו ישר לדף הבית
        location.href = "index.html";
    }
}

// טעינת הבר העליון
document.body.prepend(createBar(user));

// 🌟 ה-IDs המדויקים מה-HTML שלך!
const usernameInput = document.querySelector<HTMLInputElement>("#usernameInput")!;
const passwordInput = document.querySelector<HTMLInputElement>("#passwordInput")!;
const loginButton = document.querySelector<HTMLButtonElement>("#submitButton")!;

loginButton.onclick = async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        alert("Please fill in all fields");
        return;
    }

    const returnedToken = await send<string | null>("logIn", username, password);

    if (returnedToken == null || returnedToken === "") {
        alert("Invalid username or password");
    } else {
        localStorage.setItem("token", returnedToken);
        location.href = "index.html";
    }
};
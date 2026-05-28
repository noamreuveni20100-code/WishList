import { send } from "clientUtilities";
import { createBar } from "script/funcs"; // 🌟 ייבוא הבר
import { User } from "script/types";

// --- 1. טעינת הבר העליון החכם ---
const token = localStorage.getItem("token");
let user: User | null = null;

if (token && token !== "") {
    const response = await send<any>("getUser", token);
    if (response && response !== "") {
        user = response as User;
    }
}
document.body.prepend(createBar(user)); 


const usernameInput = document.querySelector<HTMLInputElement>("#username")!;
const passwordInput = document.querySelector<HTMLInputElement>("#password")!;
const signupButton = document.querySelector<HTMLButtonElement>("#signup-btn")!;

signupButton.onclick = async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (!username || !password) {
        alert("Please fill in all fields");
        return;
    }

    const returnedToken = await send<string>("signUp", username, password);

    if (returnedToken === "") {
        alert("Username already exists!");
    } else {
        localStorage.setItem("token", returnedToken);
        alert("Registered and logged in successfully!");
        location.href = "index.html"; // מעבר לדף הבית
    }
};
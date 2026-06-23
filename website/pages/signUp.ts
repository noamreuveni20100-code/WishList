import { send } from "clientUtilities";
import { createBar } from "script/funcs"; 
import { User } from "script/types";

const token = localStorage.getItem("token");
let user: User | null = null;

if (token && token.trim() !== "") {
    const response = await send<User | null>("getUser", token);

    if (response != null) {
        user = response;
        location.href = "index.html";
    }
}

document.body.prepend(createBar(user)); 

const usernameInput = document.querySelector<HTMLInputElement>("#usernameInput")!;
const passwordInput = document.querySelector<HTMLInputElement>("#passwordInput")!;
const confirmPasswordInput = document.querySelector<HTMLInputElement>("#confirmPasswordInput")!;
const signupButton = document.querySelector<HTMLButtonElement>("#submitButton")!;
const errorDiv = document.querySelector<HTMLDivElement>("#errorDiv")!;

const clearError = () => {
    errorDiv.innerText = "";
};

usernameInput.oninput = clearError;
passwordInput.oninput = clearError;
confirmPasswordInput.oninput = clearError;

signupButton.onclick = async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!username || !password || !confirmPassword) {
        errorDiv.innerText = "Please fill in all fields.";
        return;
    }

    if (password !== confirmPassword) {
        errorDiv.innerText = "Passwords do not match! Please try again.";
        return;
    }

    errorDiv.innerText = "";

    const returnedToken = await send<string | null>("signUp", username, password);

    if (returnedToken == null || returnedToken === "") {
        errorDiv.innerText = "Username already exists!";
    } else {
        localStorage.setItem("token", returnedToken);
        location.href = "index.html"; 
    }
};
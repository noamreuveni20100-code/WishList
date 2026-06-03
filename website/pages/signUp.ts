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
        location.href = "index.html";
    }
}

// טעינת הבר העליון
document.body.prepend(createBar(user)); 

// חיבור האלמנטים מה-HTML
const usernameInput = document.querySelector<HTMLInputElement>("#usernameInput")!;
const passwordInput = document.querySelector<HTMLInputElement>("#passwordInput")!;
const confirmPasswordInput = document.querySelector<HTMLInputElement>("#confirmPasswordInput")!;
const signupButton = document.querySelector<HTMLButtonElement>("#submitButton")!;
const errorDiv = document.querySelector<HTMLDivElement>("#errorDiv")!; // 🌟 חיבור דיב השגיאות

// פונקציית עזר קטנה כדי לנקות את השגיאה כשהמשתמש מתחיל לתקן ולהקליד בשדות
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

    // 1. בדיקה שכל השדות מלאים
    if (!username || !password || !confirmPassword) {
        errorDiv.innerText = "Please fill in all fields."; // 🌟 הצגה בדיב במקום אלרט
        return;
    }

    // 2. בדיקת אבטחה: האם הסיסמאות תואמות?
    if (password !== confirmPassword) {
        errorDiv.innerText = "Passwords do not match! Please try again."; // 🌟 הצגה באדום בדף
        return;
    }

    // מנקים שגיאות קודמות לפני השליחה לשרת
    errorDiv.innerText = "";

    // 3. שליחה לשרת
    const returnedToken = await send<string>("signUp", username, password);

    if (returnedToken === "") {
        errorDiv.innerText = "Username already exists!"; // 🌟 הצגה בדיב אם המשתמש תפוס
    } else {
        localStorage.setItem("token", returnedToken);
        location.href = "index.html"; 
    }
};
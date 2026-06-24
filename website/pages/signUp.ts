import { send } from "clientUtilities";
import { createBar } from "script/funcs";
import { User } from "script/types";

// מקבל את ה-token שנשמר בדפדפן, אם המשתמש כבר התחבר בעבר
const token = localStorage.getItem("token");

// בהתחלה אין לנו עדיין משתמש
let user: User | null = null;

// אם יש token, בודקים מול השרת אם המשתמש באמת מחובר
if (token && token.trim() !== "") {
    const response = await send<User | null>("getUser", token);

    // אם השרת החזיר משתמש תקין
    if (response != null) {
        user = response;

        // אם המשתמש כבר מחובר, אין צורך שיישאר בדף הרשמה
        location.href = "index.html";
    }
}

// יוצר את הבר העליון
document.body.prepend(createBar(user));

// קישור לאינפוטים ולכפתור מתוך ה-HTML
const usernameInput = document.querySelector<HTMLInputElement>("#usernameInput")!;
const passwordInput = document.querySelector<HTMLInputElement>("#passwordInput")!;
const confirmPasswordInput = document.querySelector<HTMLInputElement>("#confirmPasswordInput")!;
const signupButton = document.querySelector<HTMLButtonElement>("#submitButton")!;
const errorDiv = document.querySelector<HTMLDivElement>("#errorDiv")!;

// פונקציה שמנקה את הודעת השגיאה
const clearError = () => {
    errorDiv.innerText = "";
};

// כל פעם שהמשתמש מקליד באחד השדות, הודעת השגיאה נעלמת
usernameInput.oninput = clearError;
passwordInput.oninput = clearError;
confirmPasswordInput.oninput = clearError;

// מה קורה כשלוחצים על כפתור ההרשמה
signupButton.onclick = async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    // בדיקה שכל השדות מלאים
    if (!username || !password || !confirmPassword) {
        errorDiv.innerText = "Please fill in all fields.";
        return;
    }

    // בדיקה שהסיסמה ואימות הסיסמה זהים
    if (password !== confirmPassword) {
        errorDiv.innerText = "Passwords do not match! Please try again.";
        return;
    }

    // מנקה שגיאה קודמת לפני שליחת הבקשה לשרת
    errorDiv.innerText = "";

    // שולח לשרת שם משתמש וסיסמה כדי ליצור משתמש חדש
    const returnedToken = await send<string | null>("signUp", username, password);

    // אם לא חזר token, כנראה ששם המשתמש כבר קיים
    if (returnedToken == null || returnedToken === "") {
        errorDiv.innerText = "Username already exists!";
    } else {
        // שומר את ה-token כדי שהמשתמש ייחשב מחובר
        localStorage.setItem("token", returnedToken);

        // מעביר לעמוד הראשי אחרי הרשמה מוצלחת
        location.href = "index.html";
    }
};
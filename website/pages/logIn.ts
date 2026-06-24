import { send } from "clientUtilities";
import { createBar } from "script/funcs";
import { User } from "script/types";

// מקבל את ה-token שנשמר בדפדפן אחרי התחברות
const token = localStorage.getItem("token");

// המשתמש מתחיל כ-null, כלומר בהתחלה לא יודעים אם הוא מחובר
let user: User | null = null;

// אם יש token, נבדוק מול השרת אם הוא באמת שייך למשתמש קיים
if (token && token.trim() !== "") {
    const response = await send<any>("getUser", token);

    // אם השרת החזיר משתמש תקין
    if (response && response !== "") {
        user = response as User;

        // אם המשתמש כבר מחובר, אין צורך שיישאר בדף התחברות
        location.href = "index.html";
    }
}

// יוצר את הבר העליון לפי מצב המשתמש
document.body.prepend(createBar(user));

// קישור לאינפוטים ולכפתור מתוך ה-HTML לפי ה-id שלהם
const usernameInput = document.querySelector<HTMLInputElement>("#usernameInput")!;
const passwordInput = document.querySelector<HTMLInputElement>("#passwordInput")!;
const loginButton = document.querySelector<HTMLButtonElement>("#submitButton")!;

// מה קורה כשלוחצים על כפתור ההתחברות
loginButton.onclick = async () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    // בדיקה שלא השאירו שדות ריקים
    if (!username || !password) {
        alert("Please fill in all fields");
        return;
    }

    // שולח לשרת את שם המשתמש והסיסמה ומקבל token אם ההתחברות הצליחה
    const returnedToken = await send<string | null>("logIn", username, password);

    // אם לא חזר token, ההתחברות נכשלה
    if (returnedToken == null || returnedToken === "") {
        alert("Invalid username or password");
    } else {
        // שומר את ה-token כדי שהאתר יזכור שהמשתמש מחובר
        localStorage.setItem("token", returnedToken);

        // מעביר לעמוד הראשי אחרי התחברות
        location.href = "index.html";
    }
};
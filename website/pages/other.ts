import { send } from "clientUtilities";
import { createBar } from "script/funcs";
import { User } from "script/types";

// קישור לאינפוטים ולכפתור מתוך ה-HTML
const nameInput = document.querySelector<HTMLInputElement>("#product-name")!;
const priceInput = document.querySelector<HTMLInputElement>("#product-price")!;
const imageInput = document.querySelector<HTMLInputElement>("#product-image")!;
const descInput = document.querySelector<HTMLTextAreaElement>("#product-description")!;
const linkInput = document.querySelector<HTMLInputElement>("#product-link")!;
const addButton = document.querySelector<HTMLButtonElement>("#add-btn")!;

// מקבל את ה-token שנשמר בדפדפן אחרי התחברות
const token = localStorage.getItem("token");

// אם אין token, המשתמש לא מחובר ולכן מחזירים אותו לעמוד התחברות
if (!token || token === "") {
    location.href = "logIn.html";
    alert("You must be logged in to add products to your wishlist!");
}

// בהתחלה אין עדיין משתמש
let user: User | null = null;

// אם יש token, בודקים מול השרת מי המשתמש המחובר
if (token && token !== "") {
    const response = await send<any>("getUser", token);

    // אם השרת החזיר תשובה ריקה, כנראה שה-session כבר לא תקין
    if (response === "") {
        alert("Your session has expired. Please log in again.");

        // מוחק את ה-token הישן מהדפדפן
        localStorage.removeItem("token");

        // מחזיר את המשתמש להתחברות
        location.href = "logIn.html";
    } else if (response) {
        // אם חזר משתמש תקין, שומרים אותו במשתנה user
        user = response as User;
    }
}

// מוסיף את הבר העליון לדף
document.body.prepend(createBar(user));

// מה קורה כשלוחצים על כפתור הוספת מוצר
addButton.onclick = async () => {
    // בדיקה נוספת שהמשתמש באמת מחובר
    if (!token || token === "") {
        alert("Please log in first.");
        location.href = "logIn.html";
        return;
    }

    // בדיקה שחייבים לפחות שם מוצר ומחיר
    if (!nameInput.value || !priceInput.value) {
        alert("Please fill in at least the product name and price.");
        return;
    }

    try {
        // מנטרל את הכפתור כדי שלא ילחצו עליו כמה פעמים בזמן ההוספה
        addButton.disabled = true;
        addButton.innerText = "Adding...";

        // שולח לשרת את פרטי המוצר ואת ה-token של המשתמש
        await send(
            "addProduct",
            nameInput.value,
            Number(priceInput.value),
            imageInput.value,
            linkInput.value,
            descInput.value,
            token
        );

        alert("Product added to your wishlist!");

        // אחרי שהמוצר נוסף, חוזרים לעמוד הראשי
        location.href = "index.html";

    } catch (error) {
        // אם הייתה שגיאה, מחזירים את הכפתור למצב רגיל
        alert("Something went wrong. Please try again.");
        addButton.disabled = false;
        addButton.innerText = "Add Product";
    }
};
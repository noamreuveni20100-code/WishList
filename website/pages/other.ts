import { send } from "clientUtilities";
import { createBar } from "script/funcs"; // ייבוא הבר העליון
import { User } from "script/types";

const nameInput = document.querySelector<HTMLInputElement>("#product-name")!;
const priceInput = document.querySelector<HTMLInputElement>("#product-price")!;
const imageInput = document.querySelector<HTMLInputElement>("#product-image")!;
const descInput = document.querySelector<HTMLTextAreaElement>("#product-description")!;
const linkInput = document.querySelector<HTMLInputElement>("#product-link")!;
const addButton = document.querySelector<HTMLButtonElement>("#add-btn")!;

// 1. בדיקת אבטחה: משיכת הטוקן מה-LocalStorage
const token = localStorage.getItem("token");

// אם אין טוקן בכלל, או שהוא ריק - המשתמש לא מחובר! נעביר אותו ישר ללוגין
if (!token || token === "") {
     location.href = "logIn.html"; 
     alert("You must be logged in to add products to your wishlist!");
}

let user: User | null = null;

// 2. אם יש טוקן, נבדוק מול השרת שהוא אכן תקין
if (token && token !== "") {
    const response = await send<any>("getUser", token);
    
    // רשת ביטחון: אם יש משהו ב-LocalStorage אבל השרת מחזיר ריק (למשל אם הטוקן פג תוקף)
    if (response === "") {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("token"); // מנקים את הטוקן הישן
        location.href = "logIn.html";
    } else if (response) {
        user = response as User;
    }
}

// 3. טעינת הבר העליון החכם (עכשיו בטוח יש משתמש מחובר)
document.body.prepend(createBar(user));

// 4. טיפול בלחיצה על כפתור ההוספה
addButton.onclick = async () => {
  // בדיקת ביטחון נוספת ברגע הלחיצה
  if (!token || token === "") {
    alert("Please log in first.");
    location.href = "logIn.html";
    return;
  }

  // בדיקה שהמשתמש מילא לפחות שם ומחיר
  if (!nameInput.value || !priceInput.value) {
    alert("Please fill in at least the product name and price.");
    return;
  }

  try {
    // ניטרול הכפתור כדי למנוע לחיצות כפולות בזמן השליחה לשרת
    addButton.disabled = true;
    addButton.innerText = "Adding...";

    // שליחת המוצר לשרת יחד עם הטוקן של המשתמש
    await send("addProduct",
      nameInput.value,
      Number(priceInput.value),
      imageInput.value,
      linkInput.value,
      descInput.value,
      token
    );

    alert("Product added to your wishlist!");
    
    // מעבר חזרה לדף הבית כדי לראות את הרשימה המעודכנת
    location.href = "index.html";

  } catch (error) {
    alert("Something went wrong. Please try again.");
    addButton.disabled = false;
    addButton.innerText = "Add Product";
  }
};
import { send } from "clientUtilities";
import { createBar } from "script/funcs";
import { User } from "script/types";

// מקבל את ה-token שנשמר בדפדפן אחרי התחברות
const token = localStorage.getItem("token");

// בהתחלה אין עדיין משתמש מחובר
let user: User | null = null;

// אם יש token, בודקים מול השרת אם הוא באמת תקין
if (token != null && token.trim() !== "") {
    const response = await send<User | null>("getUser", token);

    // אם השרת החזיר משתמש, שומרים אותו במשתנה user
    if (response != null) {
        user = response;
    }
}

// מוסיף את הבר העליון לתחילת הדף
document.body.prepend(createBar(user));

// קישור לאלמנטים מתוך ה-HTML
const welcomeMessage = document.getElementById("welcomeMessage") as HTMLDivElement | null;
const plusButton = document.getElementById("plusBtn") as HTMLButtonElement | null;
const productsList = document.getElementById("productsList") as HTMLUListElement | null;

// יוצר דיב חדש שיופיע רק כשמשתמש מחובר ואין לו עדיין מוצרים
const firstProductMessage = document.createElement("div");

// נותן לדיב id כדי שה-CSS יוכל לעצב אותו
firstProductMessage.id = "firstProductMessage";

// מכניס לתוך הדיב את הטקסט שיוצג למשתמש
firstProductMessage.innerHTML = `
    <h2>You are logged in!</h2>
    <p>Now is the perfect time to add your first product to your wishlist.</p>
`;

// שם את הדיב לפני רשימת המוצרים
if (productsList != null) {
    productsList.before(firstProductMessage);
}

// אם המשתמש מחובר, מסתירים את הודעת הפתיחה של אורחים
if (welcomeMessage) {
    if (token != null && token.trim() !== "") {
        welcomeMessage.style.display = "none";
    } else {
        welcomeMessage.style.display = "block";
        firstProductMessage.style.display = "none";
    }
}

// כשלוחצים על כפתור הפלוס
if (plusButton) {
    plusButton.addEventListener("click", () => {
        const token = localStorage.getItem("token");

        // אם המשתמש מחובר, מעבירים אותו לעמוד הוספת מוצר
        if (token != null && token.trim() !== "") {
            window.location.href = "other.html";
        } else {
            // אם המשתמש לא מחובר, מעבירים אותו להתחברות
            window.location.href = "logIn.html";
        }
    });
}

// אם המשתמש מחובר ויש רשימת מוצרים בדף, טוענים את המוצרים שלו
if (token != null && token.trim() !== "" && productsList != null) {
    loadProducts();
}

// פונקציה שמביאה מהשרת את המוצרים של המשתמש ומציגה אותם בדף
async function loadProducts() {
    const products = await send<any[]>("getProducts", token);

    // מנקה את הרשימה לפני שמכניסים מוצרים חדשים
    productsList!.innerHTML = "";

    // אם אין מוצרים, מציגים את הודעת ההתחלה
    if (products.length === 0) {
        firstProductMessage.style.display = "block";
    } else {
        // אם יש מוצרים, מסתירים את ההודעה
        firstProductMessage.style.display = "none";
    }

    // עובר על כל המוצרים שהגיעו מהשרת
    for (let i = 0; i < products.length; i++) {
        const li = document.createElement("li");

        // מכניס לתוך כל li את פרטי המוצר
        li.innerHTML = `
            <h3>${products[i].name}</h3>
            <img src="${products[i].imageUrl}" width="150">
            <p>Price: ${products[i].price}</p>
            <p>${products[i].description}</p>
            <a href="${products[i].pageUrl}" target="_blank">Product Link</a>
        `;

        // מוסיף את המוצר לרשימה בדף
        productsList!.appendChild(li);
    }
}
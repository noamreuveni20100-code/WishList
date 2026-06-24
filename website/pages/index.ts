import { send } from "clientUtilities";
import { createBar } from "script/funcs";
import { User } from "script/types";

// שליפת הטוקן מהאחסון המקומי של הדפדפן
const token = localStorage.getItem("token");

// יצירת משתנה למשתמש שמתחיל בתור ריק
let user: User | null = null;

// בדיקה אם קיים טוקן ואם הוא לא מחרוזת ריקה או רווחים
if (token != null && token.trim() !== "") {
    // שליחת בקשה לשרת לקבלת נתוני המשתמש בעזרת הטוקן
    const response = await send<User | null>("getUser", token);

    // אם השרת החזיר תשובה תקינה עם משתמש
    if (response != null) {
        // שמירת נתוני המשתמש שקיבלנו מהשרת
        user = response;
    }
}

// יצירת סרגל הניווט והוספתו לראש עמוד ה-HTML
document.body.prepend(createBar(user));

// תפיסת אלמנט הודעת הברוך הבא מה-HTML
const welcomeMessage = document.getElementById("welcomeMessage") as HTMLDivElement | null;
// תפיסת כפתור הפלוס מה-HTML
const plusButton = document.getElementById("plusBtn") as HTMLButtonElement | null;
// תפיסת אלמנט רשימת המוצרים מה-HTML
const productsList = document.getElementById("productsList") as HTMLUListElement | null;

// בדיקה אם אלמנט הודעת הברוך הבא קיים בעמוד
if (welcomeMessage) {
    // אם המשתמש מחובר ויש טוקן תקין
    if (token != null && token.trim() !== "") {
        // נסתיר את הודעת הברוך הבא מהמסך
        welcomeMessage.style.display = "none";
    } else {
        // אם המשתמש לא מחובר נציג את הודעת הברוך הבא
        welcomeMessage.style.display = "block";
    }
}

// בדיקה אם כפתור הפלוס קיים בעמוד
if (plusButton) {
    // הוספת האזנה לאירוע לחיצה על כפתור הפלוס
    plusButton.addEventListener("click", () => {
        // שליפת הטוקן מחדש מהאחסון כדי לבדוק מצב עדכני בלחיצה
        const token = localStorage.getItem("token");

        // אם המשתמש מחובר בזמן הלחיצה
        if (token != null && token.trim() !== "") {
            // נעביר אותו לעמוד הוספת מוצר
            window.location.href = "other.html";
        } else {
            // אם המשתמש אינו מחובר נעביר אותו לעמוד התחברות
            window.location.href = "logIn.html";
        }
    });
}

// אם המשתמש מחובר וגם אלמנט הרשימה קיים בעמוד אז נטען את המוצרים
if (token != null && token.trim() !== "" && productsList != null) {
    // קריאה לפונקציה שטוענת ומציגה את המוצרים
    loadProducts();
}

// הגדרת פונקציה אסינכרונית לטעינת המוצרים מהשרת והצגתם
async function loadProducts() {
    // שליחת בקשה לשרת לקבלת מערך של כל המוצרים
    const products = await send<any[]>("getProducts", token);

    // ניקוי ואיפוס כל התוכן הקיים בתוך הרשימה ב-HTML
    productsList!.innerHTML = "";

    // לולאה שרצה על כל המוצרים שחזרו מהשרת
    for (let i = 0; i < products.length; i++) {
        // שמירת המידע של המוצר הנוכחי בסיבוב
        const product = products[i];

        // יצירת אלמנט רשימה חדש ב-HTML
        const li = document.createElement("li");
        // הוספת מחלקת עיצוב של סיאסאס לאלמנט הרשימה החדש
        li.className = "product-item";

        // יצירת אלמנט טקסט מסוג ספאן להצגת פרטי המוצר
        const productText = document.createElement("span");
        // הזרקת שם המוצר והמחיר שלו לתוך הטקסט
        productText.innerText = `${product.name} - ${product.price}`;

        // יצירת אלמנט תמונה עבור כפתור המחיקה
        const deleteImage = document.createElement("img");
        // הגדרת נתיב הקובץ לתמונת הפח
        deleteImage.src = "../images/trash.png";
        // הוספת מחלקת עיצוב לתמונת הפח
        deleteImage.className = "delete-product-img";

        // הכנסת טקסט המוצר לתוך שורת המוצר
        li.appendChild(productText);
        // הכנסת תמונת הפח לתוך שורת המוצר
        li.appendChild(deleteImage);

        // הגדרת אירוע לחיצה על שורת המוצר עצמה
        li.onclick = () => {
            // מעבר לעמוד המוצר הספציפי יחד עם האיידי שלו בכתובת
            window.location.href = `product.html?id=${product.id}`;
        };

        // הגדרת אירוע לחיצה על תמונת הפח למחיקת המוצר
        deleteImage.onclick = async (event) => {
            // עצירת אירוע הלחיצה שלא יפעיל בטעות גם את הלחיצה על השורה כולה
            event.stopPropagation();

            // שליחת בקשה לשרת למחיקת המוצר הספציפי לפי האיידי שלו
            await send("deleteProduct", product.id);

            // קריאה מחדש לפונקציה כדי לרענן את הרשימה ולהעלים את המוצר שנמחק
            loadProducts();
        };

        // הוספת שורת המוצר המוכנה אל תוך אלמנט הרשימה הראשי בעמוד
        productsList!.appendChild(li);
    }
}
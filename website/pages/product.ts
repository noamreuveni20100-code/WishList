// --- יבוא (Imports) של פונקציות וטיפוסים מקבצים אחרים בפרויקט ---
import { send } from "clientUtilities"; // פונקציה לשליחת בקשות לשרת (API)
import { createBar } from "script/funcs"; // פונקציה שיוצרת את סרגל הניווט או ה-Bar העליון
import { User } from "script/types"; // הטיפוס (Type) שמגדיר איך נראה אובייקט של משתמש

// --- ניהול התחברות ומשתמש ---
// שליפת טוקן האימות מהאחסון המקומי של הדפדפן (אם המשתמש מחובר)
const token = localStorage.getItem("token");

// הגדרת משתנה שיחזיק את נתוני המשתמש. בהתחלה הוא ריק (null)
let user: User | null = null;

// בדיקה: אם קיים טוקן והוא לא מחרוזת ריקה, ננסה להביא את נתוני המשתמש מהשרת
if (token && token !== "") {
    // שליחת בקשה לשרת לקבלת נתוני המשתמש בעזרת הטוקן
    const response = await send<any>("getUser", token);

    // אם השרת החזיר תשובה תקינה שאינה ריקה
    if (response && response !== "") {
        // שמירת נתוני המשתמש והמרתם לטיפוס המוגדר User
        user = response as User;
    }
}

// יצירת סרגל הניווט (בעזרת נתוני המשתמש, אם ישנם) והוספתו לראש עמוד ה-HTML (בתחילת ה-body)
document.body.prepend(createBar(user));

// --- שליפת נתוני המוצר מהשרת ---
// קריאת הפרמטרים מתוך שורת הכתובת (URL) של הדפדפן
const params = new URLSearchParams(location.search);
// שליפת המזהה (id) של המוצר מהכתובת והמרתו מרוחזת למספר (Number)
const id = Number(params.get("id"));

// שליחת בקשה לשרת כדי לקבל את פרטי המוצר הספציפי לפי ה-id שלו
const product = await send<any>("getProductById", id);

// --- תפיסת אלמנטים מה-DOM (עמוד ה-HTML) ---
// איתור אלמנטי ה-HTML השונים בעמוד לפי המזהים שלהם (ID) כדי שנוכל להזריק אליהם מידע
const nameElement = document.querySelector<HTMLHeadingElement>("#product-name")!;        // כותרת שם המוצר
const imageElement = document.querySelector<HTMLImageElement>("#product-image")!;       // תמונת המוצר
const priceElement = document.querySelector<HTMLHeadingElement>("#product-price")!;      // כותרת מחיר המוצר
const descriptionElement = document.querySelector<HTMLParagraphElement>("#product-description")!; // פסקת תיאור המוצר
const linkElement = document.querySelector<HTMLAnchorElement>("#product-link")!;        // קישור לעמוד המוצר
// הערה: הסימן ! בסוף אומר ל-TypeScript שאנחנו בטוחים שהאלמנט קיים ב-HTML ולא יהיה null

// --- הזרקת נתוני המוצר לתוך ה-HTML ---
nameElement.innerText = product.name; // השמת שם המוצר בתוך כותרת השם
imageElement.src = product.imageUrl;  // הגדרת נתיב התמונה של המוצר
imageElement.alt = product.name;      // הגדרת טקסט חלופי (alt) לתמונה למקרה שלא תיטען
priceElement.innerText = `${product.price}₪`; // השמת המחיר כולל סימן השקל
descriptionElement.innerText = product.description; // השמת תיאור המוצר בפסקה
linkElement.href = product.pageUrl;   // הגדרת הכתובת שאליה הקישור יוביל
linkElement.target = "_blank";         // הגדרה שהקישור ייפתח בלשונית חדשה בדפדפן
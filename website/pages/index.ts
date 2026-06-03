import { send } from "clientUtilities";
import { create } from "componentUtilities";
import { createBar } from "script/funcs";
import { User } from "script/types"; 

const productsList = document.querySelector<HTMLUListElement>("#productsList")!;
// 🌟 מחברים את דיב הטקסט מה-HTML
const welcomeMessage = document.querySelector<HTMLDivElement>("#welcomeMessage")!;

// 1. משיכת הטוקן ובדיקה מול השרת מי המשתמש המחובר
const token = localStorage.getItem("token");
let user: User | null = null;

if (token && token !== "") {
    const response = await send<any>("getUser", token);
    if (response && response !== "") {
        user = response as User;
    }
}

// 2. העברת המשתמש האמיתי (או null) לבר העליון
document.body.prepend(createBar(user));

// 🌟 3. שליטה בנראות האלמנטים לפי מצב החיבור
if (user) {
    // אם המשתמש מחובר: נעלים את טקסט ההסבר ונציג את רשימת המוצרים
    welcomeMessage.style.display = "none";
    productsList.style.display = "block";
} else {
    // אם המשתמש מנותק: נציג את טקסט ההסבר ונעלים את רשימת המוצרים הריקה
    welcomeMessage.style.display = "block";
    productsList.style.display = "none";
}

// 4. טעינת המוצרים מהשרת - שולחים את הטוקן כדי לקבל רק את המוצרים של המשתמש הזה
const products = await send("getProducts", token || "");

for (const p of products) {
    const li = create("li");
    li.className = "product-item";

    li.innerText = `${p.name} - ${p.price}₪`;

    li.onclick = () => {
        location.href = `product.html?id=${p.id}`;
    };
    
    // כפתור מחיקה
    const deleteBtn = create("button", { className: "deleteBtn" },
        create("img", { src: "../images/trash.png" })
    );
    
    deleteBtn.onclick = async (event) => {
        event.stopPropagation();
        await send("deleteProduct", p.id);
        location.reload(); 
    };

    li.append(deleteBtn);
    productsList.append(li);
}
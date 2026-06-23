import { User } from "./types";

export function createBar(user: User | null): HTMLElement {
    const bar = document.createElement("div");
    bar.className = "main-nav-bar"; // הקלאס שקיבל את הרקע והפס התחתון
    
    // שמירה על היישור שהיה לך
    bar.style.display = "flex";
    bar.style.justifyContent = "space-between";
    bar.style.alignItems = "center";
    
    const logo = document.createElement("a");
    logo.innerText = "mywishlist";
    logo.href = "index.html";
    logo.className = "nav-logo"; // עיצוב הפונט הגדול (70px)
    bar.appendChild(logo);

    const userArea = document.createElement("div");
    userArea.className = "nav-user-area"; // אזור המשתמש (50px)

    if (user) {
        // יוצרים אלמנט span לשם המשתמש כדי שנוכל לעצב אותו יפה ב-CSS
        const welcomeSpan = document.createElement("span");
        welcomeSpan.innerText = `Hello, ${user.Username} | `;
        userArea.appendChild(welcomeSpan);
        
        const logoutBtn = document.createElement("button");
        logoutBtn.innerText = "Logout";
        logoutBtn.className = "logout-btn";
        logoutBtn.onclick = () => {
            localStorage.removeItem("token");
            location.reload();
        };
        userArea.appendChild(logoutBtn);
    } else {
        // אם המשתמש לא מחובר, הקישורים נוצרים כאן ומקבלים אוטומטית 50px מה-CSS
        userArea.innerHTML = `
            <a href="logIn.html" style="margin-right: 25px;">Log In</a>
            <a href="signUp.html">Sign Up</a>
        `;
    }
    
    bar.appendChild(userArea);
    return bar;
}
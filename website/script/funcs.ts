import { User } from "./types";

// פונקציה שיוצרת את הבר העליון של האתר
// היא מקבלת user:
// אם יש משתמש מחובר → מציגה Hello + שם משתמש + Logout
// אם אין משתמש מחובר → מציגה קישורים ל-Log In ול-Sign Up
export function createBar(user: User | null): HTMLElement {
    // יוצר div חדש שישמש כבר העליון
    const bar = document.createElement("div");

    // נותן לבר class כדי שנוכל לעצב אותו ב-CSS
    bar.className = "main-nav-bar";

    // גורם לכל הדברים בתוך הבר להיות בשורה
    bar.style.display = "flex";

    // שם את הלוגו בצד אחד ואת אזור המשתמש בצד השני
    bar.style.justifyContent = "space-between";

    // ממרכז את הדברים בתוך הבר לגובה
    bar.style.alignItems = "center";

    // יוצר קישור שישמש כלוגו של האתר
    const logo = document.createElement("a");

    // הטקסט שיופיע בלוגו
    logo.innerText = "mywishlist";

    // כשלוחצים על הלוגו עוברים לעמוד הראשי
    logo.href = "index.html";

    // class לעיצוב הלוגו ב-CSS
    logo.className = "nav-logo";

    // מוסיף את הלוגו לתוך הבר
    bar.appendChild(logo);

    // יוצר div לאזור של המשתמש בצד השני של הבר
    const userArea = document.createElement("div");

    // class לעיצוב אזור המשתמש ב-CSS
    userArea.className = "nav-user-area";

    // אם יש משתמש מחובר
    if (user) {
        // יוצר span בשביל הודעת שלום למשתמש
        const welcomeSpan = document.createElement("span");

        // מציג את שם המשתמש בתוך הבר
        welcomeSpan.innerText = `Hello, ${user.username} | `;

        // מוסיף את הודעת השלום לאזור המשתמש
        userArea.appendChild(welcomeSpan);

        // יוצר כפתור התנתקות
        const logoutBtn = document.createElement("button");

        // הטקסט שיופיע על הכפתור
        logoutBtn.innerText = "Logout";

        // class לעיצוב כפתור ההתנתקות ב-CSS
        logoutBtn.className = "logout-btn";

        // מה יקרה כאשר לוחצים על Logout
        logoutBtn.onclick = () => {
            // מוחק את ה-token מהדפדפן, כלומר המשתמש כבר לא מחובר
            localStorage.removeItem("token");

            // מרענן את העמוד כדי שהבר יתעדכן למצב לא מחובר
            location.reload();
        };

        // מוסיף את כפתור ההתנתקות לאזור המשתמש
        userArea.appendChild(logoutBtn);
    } else {
        // אם אין משתמש מחובר, מציג קישורים להתחברות ולהרשמה
        userArea.innerHTML = `
            <a href="logIn.html" style="margin-right: 25px;">Log In</a>
            <a href="signUp.html">Sign Up</a>
        `;
    }

    // מוסיף את אזור המשתמש לתוך הבר
    bar.appendChild(userArea);

    // מחזיר את הבר כדי שיהיה אפשר להוסיף אותו לעמוד
    return bar;
}
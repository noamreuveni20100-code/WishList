import { User } from "./types";

export function createBar(user: User | null): HTMLElement {
    const bar = document.createElement("div");
    bar.className = "main-nav-bar"; // הקלאס מעיצוב ה-shared.css שלך
    
    bar.style.display = "flex";
    bar.style.justifyContent = "space-between";
    bar.style.alignItems = "center";

    const logo = document.createElement("a");
    logo.innerText = "mywishlist 🎁";
    logo.href = "index.html";
    logo.className = "nav-logo"; 
    bar.appendChild(logo);

    const userArea = document.createElement("div");
    userArea.className = "nav-user-area";

    console.log(user)
    if (user) {
        userArea.innerText = `Hello, ${user.username} | `;
        
        const logoutBtn = document.createElement("button");
        logoutBtn.innerText = "Logout";
        logoutBtn.className = "logout-btn";
        logoutBtn.onclick = () => {
            localStorage.removeItem("token");
            location.reload();
        };
        userArea.appendChild(logoutBtn);
    } else {
        userArea.innerHTML = `
            <a href="logIn.html" style="margin-right: 15px;">Log In</a>
            <a href="signUp.html">Sign Up</a>
        `;
    }
    
    bar.appendChild(userArea);
    return bar;
}
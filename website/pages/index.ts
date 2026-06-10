import { send } from "clientUtilities";
import { create } from "componentUtilities";
import { createBar } from "script/funcs";
import { User } from "script/types"; 

const productsList = document.querySelector<HTMLUListElement>("#productsList")!;
const welcomeMessage = document.querySelector<HTMLDivElement>("#welcomeMessage")!;

const token = localStorage.getItem("token");
let user: User | null = null;

if (token && token !== "") {
    const response = await send<any>("getUser", token);
    if (response && response !== "") {
        user = response as User;
    }
}

document.body.prepend(createBar(user));

if (user) {
    welcomeMessage.style.display = "none";
    productsList.style.display = "block";
} else {
    welcomeMessage.style.display = "block";
    productsList.style.display = "none";
}

const products = await send<any[]>("getProducts", token || "");

for (const p of products) {
    const li = create("li");
    li.className = "product-item";
    li.innerText = `${p.name} - ${p.price}₪`;

    li.onclick = () => {
        location.href = `product.html?id=${p.id}`;
    };
    
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
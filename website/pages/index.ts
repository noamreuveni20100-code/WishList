import { send } from "clientUtilities";
import { createBar } from "script/funcs";
import { User } from "script/types";

const token = localStorage.getItem("token");

let user: User | null = null;

if (token != null && token.trim() !== "") {
    const response = await send<User | null>("getUser", token);

    if (response != null) {
        user = response;
    }
}

document.body.prepend(createBar(user));

const welcomeMessage = document.getElementById("welcomeMessage") as HTMLDivElement | null;
const plusButton = document.getElementById("plusBtn") as HTMLButtonElement | null;
const productsList = document.getElementById("productsList") as HTMLUListElement | null;

if (welcomeMessage) {
    if (token != null && token.trim() !== "") {
        welcomeMessage.style.display = "none";
    } else {
        welcomeMessage.style.display = "block";
    }
}

if (plusButton) {
    plusButton.addEventListener("click", () => {
        const token = localStorage.getItem("token");

        if (token != null && token.trim() !== "") {
            window.location.href = "other.html";
        } else {
            window.location.href = "logIn.html";
        }
    });
}

if (token != null && token.trim() !== "" && productsList != null) {
    loadProducts();
}

async function loadProducts() {
    const products = await send<any[]>("getProducts", token);

    productsList!.innerHTML = "";

    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        const li = document.createElement("li");
        li.className = "product-item";

        const productText = document.createElement("span");
        productText.innerText = `${product.name} - ${product.price}`;

        const deleteImage = document.createElement("img");
        deleteImage.src = "../images/trash.png";
        deleteImage.className = "delete-product-img";

        li.appendChild(productText);
        li.appendChild(deleteImage);

        li.onclick = () => {
            window.location.href = `product.html?id=${product.id}`;
        };

        deleteImage.onclick = async (event) => {
            event.stopPropagation();

            await send("deleteProduct", product.id);

            loadProducts();
        };

        productsList!.appendChild(li);
    }
}
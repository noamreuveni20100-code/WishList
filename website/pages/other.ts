import { send } from "clientUtilities";
import { createBar } from "script/funcs"; 
import { User } from "script/types";

const nameInput = document.querySelector<HTMLInputElement>("#product-name")!;
const priceInput = document.querySelector<HTMLInputElement>("#product-price")!;
const imageInput = document.querySelector<HTMLInputElement>("#product-image")!;
const descInput = document.querySelector<HTMLTextAreaElement>("#product-description")!;
const linkInput = document.querySelector<HTMLInputElement>("#product-link")!;
const addButton = document.querySelector<HTMLButtonElement>("#add-btn")!;

const token = localStorage.getItem("token");

if (!token || token === "") {
     location.href = "logIn.html"; 
     alert("You must be logged in to add products to your wishlist!");
}

let user: User | null = null;

if (token && token !== "") {
    const response = await send<any>("getUser", token);
    
    if (response === "") {
        alert("Your session has expired. Please log in again.");
        localStorage.removeItem("token"); 
        location.href = "logIn.html";
    } else if (response) {
        user = response as User;
    }
}

document.body.prepend(createBar(user));

addButton.onclick = async () => {
  if (!token || token === "") {
    alert("Please log in first.");
    location.href = "logIn.html";
    return;
  }

  if (!nameInput.value || !priceInput.value) {
    alert("Please fill in at least the product name and price.");
    return;
  }

  try {
    addButton.disabled = true;
    addButton.innerText = "Adding...";

    await send("addProduct",
      nameInput.value,
      Number(priceInput.value),
      imageInput.value,
      linkInput.value,
      descInput.value,
      token
    );

    alert("Product added to your wishlist!");
    location.href = "index.html";

  } catch (error) {
    alert("Something went wrong. Please try again.");
    addButton.disabled = false;
    addButton.innerText = "Add Product";
  }
};
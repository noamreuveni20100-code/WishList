import { send } from "clientUtilities";

const nameInput = document.querySelector<HTMLInputElement>("#product-name")!;
const priceInput = document.querySelector<HTMLInputElement>("#product-price")!;
const imageInput = document.querySelector<HTMLInputElement>("#product-image")!;
const descInput = document.querySelector<HTMLTextAreaElement>("#product-description")!;
const addButton = document.querySelector<HTMLButtonElement>("#add-btn")!;

addButton.onclick = async () => {
  await send("addProduct",
    nameInput.value,
    Number(priceInput.value),
    imageInput.value,
    descInput.value
  );

  alert("Product added!");
  location.reload();
};

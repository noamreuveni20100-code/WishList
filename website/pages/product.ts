import { send } from "clientUtilities";

const params = new URLSearchParams(location.search);

const id = Number(params.get("id"));

const product = await send("getProductById", id);

const nameElement = document.querySelector<HTMLHeadingElement>("#product-name")!;

const imageElement = document.querySelector<HTMLImageElement>("#product-image")!;

const priceElement = document.querySelector<HTMLHeadingElement>("#product-price")!;

const descriptionElement = document.querySelector<HTMLParagraphElement>("#product-description")!;

nameElement.innerText = product.name;

imageElement.src = product.imageUrl;

priceElement.innerText = `${product.price}₪`;

descriptionElement.innerText = product.description;
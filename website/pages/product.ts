import { send } from "clientUtilities";

const params = new URLSearchParams(location.search);

const id = Number(params.get("id"));

const product = await send("getProductById", id);
console.log(product);

const nameElement = document.querySelector<HTMLHeadingElement>("#product-name")!;

const imageElement = document.querySelector<HTMLImageElement>("#product-image")!;

const priceElement = document.querySelector<HTMLHeadingElement>("#product-price")!;

const descriptionElement = document.querySelector<HTMLParagraphElement>("#product-description")!;

// התיקון כאן: שינוי הטיפוס ל-HTMLAnchorElement כדי שהקוד יזהה שמדובר בקישור
const linkElement = document.querySelector<HTMLAnchorElement>("#product-link")!;

nameElement.innerText = product.name;

imageElement.src = product.imageUrl;

priceElement.innerText = `${product.price}₪`;

descriptionElement.innerText = product.description;

// התיקון כאן: עדכון ה-href (כתובת הקישור) של האלמנט במקום ה-innerText
linkElement.href = product.pageUrl;

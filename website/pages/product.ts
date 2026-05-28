import { send } from "clientUtilities";
import { createBar } from "script/funcs"; // ייבוא של הבר
import { User } from "script/types";

// 1. טעינת הבר העליון החכם גם בעמוד המוצר
const token = localStorage.getItem("token");
let user: User | null = null;

if (token && token !== "") {
    const response = await send<any>("getUser", token);
    if (response && response !== "") {
        user = response as User;
    }
}
document.body.prepend(createBar(user)); // הוספת הבר לראש העמוד

// 2. טעינת פרטי המוצר כרגיל
const params = new URLSearchParams(location.search);
const id = Number(params.get("id"));

const product = await send("getProductById", id);
console.log(product);

const nameElement = document.querySelector<HTMLHeadingElement>("#product-name")!;
const imageElement = document.querySelector<HTMLImageElement>("#product-image")!;
const priceElement = document.querySelector<HTMLHeadingElement>("#product-price")!;
const descriptionElement = document.querySelector<HTMLParagraphElement>("#product-description")!;
const linkElement = document.querySelector<HTMLAnchorElement>("#product-link")!;

nameElement.innerText = product.name;
imageElement.src = product.imageUrl;
priceElement.innerText = `${product.price}₪`;
descriptionElement.innerText = product.description;
linkElement.href = product.pageUrl;
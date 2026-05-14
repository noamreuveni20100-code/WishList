import { send } from "clientUtilities";

const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  alert("No product ID provided");
}

const product = await send("getProductById", Number(id));

(document.getElementById("name") as HTMLElement).innerText = product.name;
(document.getElementById("image") as HTMLImageElement).src = product.imageUrl;
(document.getElementById("price") as HTMLElement).innerText = product.price + "₪";
(document.getElementById("description") as HTMLElement).innerText = product.description;





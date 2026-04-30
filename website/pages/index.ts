import { send } from "clientUtilities";
import { create } from "componentUtilities";

const productsList = document.querySelector<HTMLUListElement>("#productsList")!;

const products = await send("getProducts");


    for (const p of products) {
    const li = create("li");
    li.className = "product-item";

    li.innerText = `${p.name} - ${p.price}₪ `;

    // כפתור מחיקה
    const deleteBtn = create("button");
    deleteBtn.innerText = "❌";
    deleteBtn.onclick = async () => {
        await send("deleteProduct", p.id);
        location.reload();
    };

    li.append(deleteBtn);
    productsList.append(li);
}


  


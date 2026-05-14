import { send } from "clientUtilities";
import { create } from "componentUtilities";

const productsList = document.querySelector<HTMLUListElement>("#productsList")!;

const products = await send("getProducts");


for (const p of products) {
    const li = create("li");
    li.className = "product-item";

li.innerText = `${p.name} - ${p.price}₪`;

li.onclick = () => {
    location.href = `product.html?id=${p.id}`;
};
    // כפתור מחיקה
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





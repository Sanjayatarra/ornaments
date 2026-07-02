function getImageList(product) {
    if (!product) return [];
    if (Array.isArray(product.Img) && product.Img.length) return product.Img;
    if (typeof product.Img === "string" && product.Img) return [product.Img];
    return ["https://via.placeholder.com/320?text=Jewellery"];
}

async function ensureProductData() {
    let product = JSON.parse(localStorage.getItem("productDetails") || "null");

    if (!product) {
        let data = JSON.parse(localStorage.getItem("database") || "[]");
        if (!data.length) {
            try {
                data = await window.BackendApi.fetchLegacyProducts();
            } catch (e) {
                data = [];
            }
        }
        if (data.length) {
            product = data[0];
            localStorage.setItem("productDetails", JSON.stringify(product));
        }
    }

    return product;
}

function setMiniSpec(product) {
    const images = getImageList(product);
    let img = document.querySelector("#div-below-addtocart>div>img");
    img.src = images[0];
    img.style.width = "390px";
    img.style.height = "390px";

    let td1 = document.querySelector("#designtd");
    let td2 = document.querySelector("#typetd");
    td1.innerText = product.Type || "-";
    td2.innerText = product.Type || "-";
    td1.style.fontSize = "15px";
    td2.style.fontSize = "15px";
}

function bindInfoTabs(product) {
    const moreInfo = () => {
        let div = document.getElementById("everything-goes-here");
        div.innerHTML = null;
        div.style.display = "block";

        document.getElementById("productSpecifications").style.textDecoration = "none";
        document.getElementById("moreInfo").style.textDecoration = "underline";

        let p1 = document.createElement("p");
        p1.innerText = "Titan Company Limited, Jewellery Division 29, Sipcot Industrial Complex, Hosur - 635126, Krishnagiri District, Tamil Nadu.";
        let p2 = document.createElement("p");
        p2.innerText = "Country Of Origin - India";
        let p3 = document.createElement("p");
        p3.innerText = "Imported By - Titan Company Limited, Jewellery Division 29, Sipcot Industrial Complex, Hosur - 635126, Krishnagiri District, Tamil Nadu.";
        let p4 = document.createElement("p");
        p4.innerText = "Net Quantity: 1 N";
        let p5 = document.createElement("p");
        p5.innerText = "Contact customer care executive at the manufacturing address above or call us at 1800-266-0123.";

        div.append(p1, p2, p3, p4, p5);
    };

    const productSpecifications = () => {
        let div = document.getElementById("everything-goes-here");
        div.innerHTML = null;
        div.style.display = "flex";

        document.getElementById("moreInfo").style.textDecoration = "none";
        document.getElementById("productSpecifications").style.textDecoration = "underline";

        let div1 = document.createElement("div");
        let table1 = document.createElement("table");

        function addRow(label, value) {
            let tr = document.createElement("tr");
            tr.setAttribute("class", "tr-row-height-set");
            let td1 = document.createElement("td");
            let td2 = document.createElement("td");
            td1.innerText = label;
            td2.innerText = value;
            tr.append(td1, td2);
            table1.append(tr);
        }

        addRow("PURITY", "22.00");
        addRow("TYPE", product.Type || "-");
        addRow("COLLECTION", "Shagun");
        addRow("FINDING", "B");
        addRow("PRODUCT", "Earring");
        addRow("OCCASION", "Modern Wear");
        addRow("PRODUCT WIDTH", "8 mm");

        div1.append(table1);
        div1.style.flex = "1";
        div1.style.marginRight = "30%";
        div.append(div1);

        let div2 = document.createElement("div");
        let table2 = document.createElement("table");

        function addRow2(label, value) {
            let tr = document.createElement("tr");
            tr.setAttribute("class", "tr-row-height-set");
            let td1 = document.createElement("td");
            let td2 = document.createElement("td");
            td1.innerText = label;
            td2.innerText = value;
            tr.append(td1, td2);
            table2.append(tr);
        }

        addRow2("BRAND", product.Brand || "-");
        addRow2("GENDER", "Women");
        addRow2("METAL", "Gold");
        addRow2("JEWELLLERY TYPE", "Gold Jewellery");
        addRow2("METAL COLOR", "Yellow");
        addRow2("HEIGHT", "34 mm");

        div2.append(table2);
        div2.style.flex = "1";
        div.append(div2);
    };

    document.getElementById("productSpecifications").addEventListener("click", productSpecifications);
    document.getElementById("moreInfo").addEventListener("click", moreInfo);
    productSpecifications();
}

function renderYouMayLike(product) {
    let data = JSON.parse(localStorage.getItem("database") || "[]");
    data = data.filter(function (el) {
        return el.Type === product.Type && el.Title !== product.Title;
    }).slice(0, 4);

    let appendHere = document.getElementById("you-may-like");
    appendHere.innerHTML = "";

    data.forEach(function (el) {
        let div = document.createElement("div");
        let img = document.createElement("img");
        img.src = getImageList(el)[0];
        img.style.height = "273px";
        img.style.width = "273px";

        let title = document.createElement("h3");
        if (el.Title.length >= 30) {
            title.innerText = el.Title.slice(0, 20).toUpperCase() + "...";
        } else {
            title.innerText = el.Title;
        }
        title.style.textAlign = "center";
        title.style.fontFamily = "Times New Roman";
        title.style.color = "gray";

        let price = document.createElement("h3");
        price.innerText = "?" + el.Price;
        price.style.fontFamily = "Times New Roman";
        price.style.textAlign = "center";
        price.style.color = "gray";

        div.append(img, title, price);
        div.addEventListener("click", function () {
            localStorage.setItem("productDetails", JSON.stringify(el));
            window.location.href = "productsDetail.html";
        });
        div.setAttribute("class", "shadow-on-hover");
        appendHere.append(div);
    });
}

function display(product) {
    const imagesList = getImageList(product);

    document.getElementById("Image_box").innerHTML = null;
    document.getElementById("product_details").innerHTML = null;
    document.getElementById("price_div").innerHTML = null;
    document.getElementById("discription").innerHTML = null;
    document.getElementById("name").innerHTML = null;

    let div1 = document.createElement("div");
    let div2 = document.createElement("div");
    let div3 = document.createElement("div");
    let div4 = document.createElement("div");
    let div5 = document.createElement("div");
    let frame = document.createElement("div");
    frame.setAttribute("id", "frame");

    let images = document.createElement("img");
    images.src = imagesList[0];

    let images_box = document.getElementById("imges_4box");
    images_box.innerHTML = "";
    for (let i = 0; i < imagesList.length; i++) {
        let smallDiv = document.createElement("div");
        let img = document.createElement("img");
        img.src = imagesList[i];
        img.style.height = "66px";
        img.style.width = "66px";
        smallDiv.append(img);
        smallDiv.style.border = "1px solid lightgray";
        smallDiv.addEventListener("click", function () {
            images.src = imagesList[i];
            smallDiv.style.border = "1px solid black";
        });
        images_box.append(smallDiv);
    }

    let name = document.createElement("p");
    name.innerText = "HOME > PRODUCT >" + (product.Description || "");

    let title = document.createElement("h4");
    title.innerText = product.Title;

    let price = document.createElement("h3");
    price.innerText = "PRICE ? " + product.Price;

    let description = document.createElement("p");
    description.innerText = product.Description;

    div1.append(images);
    frame.append(div1);
    div2.append(description);
    div3.append(price);
    div4.append(title);
    div5.append(name);

    document.getElementById("Image_box").append(frame);
    document.getElementById("product_details").append(div2);
    document.getElementById("price_div").append(div3);
    document.getElementById("discription").append(title);
    document.getElementById("name").append(div5);
}

async function bindActions(product) {
    let btn = document.getElementById("btn");
    btn.addEventListener("click", async function () {
        const token = window.BackendApi.getToken();
        if (!token) {
            alert("Please login first");
            window.location.href = "login.html";
            return;
        }

        if (!product.id) {
            alert("Product identifier missing");
            return;
        }

        try {
            await window.BackendApi.addToCart(product.id, 1);
            const cart = await window.BackendApi.syncLegacyCartFromBackend();
            let a = document.getElementById("cart1");
            if (a) a.innerText = "CART(" + cart.length + ")";
            alert("Added to cart");
        } catch (err) {
            alert(err && err.message ? err.message : "Unable to add to cart");
        }
    });

    let btn1 = document.getElementById("btn1");
    btn1.addEventListener("click", function () {
        alert("Please use Book An Appointment option from homepage.");
    });
}

(async function init() {
    let product = await ensureProductData();
    if (!product) {
        alert("No product selected");
        window.location.href = "products.html";
        return;
    }

    setMiniSpec(product);
    bindInfoTabs(product);
    display(product);
    renderYouMayLike(product);
    await bindActions(product);
})();

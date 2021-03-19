let cartCounter = document.querySelector(".items-in-cart");

function updateCart(dish) {
    axios.post("/updateCart", dish).then((res) => {
        // console.log(res);
        toastr.options.showMethod = 'slideDown';
        toastr.options.hideMethod = 'slideUp';
        toastr.options.progressBar = true;
        cartCounter.innerText = res.data.totalQty;
        toastr.success("Added to cart successfully!");
    }).catch(err => {
        console.log(err);
        toastr.options.progressBar = true;
        toastr.error("Something went wrong!");
    });
}

// This script is for sending data to backend
let addToCart = document.querySelectorAll(".addToCartBtn");
addToCart.forEach((btn) => {
    btn.addEventListener("click", (e) => {
        let dish = JSON.parse(btn.dataset.dish);
        updateCart(dish);
    });
});
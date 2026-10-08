(function () {
    "use strict";

    // =========================================================
    // FOOTRA - GLOBAL HELPERS
    // =========================================================

    const $ = (id) => document.getElementById(id);

    function safeElement(id) {
        return document.getElementById(id);
    }

    function getStoredJSON(key, fallback = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : fallback;
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return fallback;
        }
    }

    function setStoredJSON(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (error) {
            console.error(`Error saving ${key}:`, error);
        }
    }


    // =========================================================
    // CART DATA
    // =========================================================

    let cartItems = getStoredJSON("footraCart", []) || [];

    if (!Array.isArray(cartItems)) {
        cartItems = [];
    }

    let cartTotal = cartItems.reduce((total, item) => {
        return total + Number(item.price || 0);
    }, 0);


    // =========================================================
    // CART UI
    // =========================================================

    function renderCart() {
        const cartDiv = $("cartItems");
        const cartCount = $("cartCount");
        const cartTotalElement = $("cartTotal");

        if (!cartDiv) return;

        cartItems = cartItems.filter(item => item && item.name);

        cartTotal = cartItems.reduce((total, item) => {
            return total + Number(item.price || 0);
        }, 0);

        if (cartCount) {
            cartCount.textContent = cartItems.length;
        }

        if (cartTotalElement) {
            cartTotalElement.textContent = cartTotal;
        }

        if (cartItems.length === 0) {
            cartDiv.innerHTML = "<p>Your cart is empty.</p>";
            return;
        }

        cartDiv.innerHTML = cartItems.map((item, index) => `
            <div class="cart-item">
                <img 
                    src="${item.image || ""}" 
                    alt="${item.name || "Product"}"
                >

                <div class="cart-info">
                    <h5>${item.name}</h5>
                    <p>₹${Number(item.price).toLocaleString("en-IN")}</p>
                </div>

                <button
                    type="button"
                    class="remove-item"
                    data-index="${index}"
                    aria-label="Remove ${item.name}"
                >
                    <i class="fa-solid fa-xmark"></i>
                </button>
            </div>
        `).join("");

        setStoredJSON("footraCart", cartItems);
    }


    function addToCart(name, price, image) {
        const numericPrice = Number(
            String(price)
                .replace(/[₹,\s]/g, "")
        );

        if (!name || !numericPrice) {
            alert("Unable to add this product to cart.");
            return;
        }

        cartItems.push({
            name: name,
            price: numericPrice,
            image: image || ""
        });

        setStoredJSON("footraCart", cartItems);
        renderCart();
        openCart();
    }


    window.removeFromCart = function (index) {
        if (typeof index !== "number") {
            index = Number(index);
        }

        if (index < 0 || index >= cartItems.length) return;

        cartItems.splice(index, 1);

        setStoredJSON("footraCart", cartItems);
        renderCart();
    };


    // =========================================================
    // OPEN / CLOSE CART
    // =========================================================

    window.openCart = function () {
        const cartDrawer = $("cartDrawer");
        const cartOverlay = $("cartOverlay");

        if (!cartDrawer || !cartOverlay) return;

        closeWishlist();

        renderCart();

        cartDrawer.classList.add("active");
        cartOverlay.classList.add("active");
    };


    window.closeCart = function () {
        const cartDrawer = $("cartDrawer");
        const cartOverlay = $("cartOverlay");

        if (cartDrawer) {
            cartDrawer.classList.remove("active");
        }

        if (cartOverlay) {
            cartOverlay.classList.remove("active");
        }
    };


    // =========================================================
    // CART CHECKOUT
    // =========================================================

    window.checkout = function () {
        if (cartItems.length === 0) {
            alert("Your cart is empty.");
            return;
        }

        localStorage.setItem("cartTotalAmount", cartTotal);

        window.location.href = "checkout.html";
    };


    // =========================================================
    // CART ICONS
    // =========================================================

    function initializeCartButtons() {
        document.querySelectorAll(".cart-icon").forEach(icon => {

            icon.addEventListener("click", function (event) {
                event.preventDefault();
                event.stopPropagation();

                const card = this.closest(".shoe-card");

                if (!card) return;

                const nameElement = card.querySelector("h4");
                const priceElement = card.querySelector("p");
                const imageElement = card.querySelector(".img-default");

                if (!nameElement || !priceElement || !imageElement) {
                    return;
                }

                addToCart(
                    nameElement.textContent.trim(),
                    priceElement.textContent.trim(),
                    imageElement.src
                );
            });
        });
    }


    // =========================================================
    // CART REMOVE BUTTON
    // =========================================================

    function initializeCartRemove() {
        const cartDiv = $("cartItems");

        if (!cartDiv) return;

        cartDiv.addEventListener("click", function (event) {

            const removeButton = event.target.closest(".remove-item");

            if (!removeButton) return;

            event.preventDefault();

            const index = Number(removeButton.dataset.index);

            window.removeFromCart(index);
        });
    }


    // =========================================================
    // CART CHECKOUT BUTTON
    // =========================================================

    function initializeCartCheckout() {
        const checkoutButton = $("cartCheckoutBtn");

        if (!checkoutButton) return;

        checkoutButton.addEventListener("click", function () {

            if (cartItems.length === 0) {
                alert("Your cart is empty.");
                return;
            }

            localStorage.setItem("cartTotalAmount", cartTotal);

            window.location.href = "checkout.html";
        });
    }


    // =========================================================
// WISHLIST
// =========================================================

let wishlist = getStoredJSON("footraWishlist", []) || [];

if (!Array.isArray(wishlist)) {
    wishlist = [];
}


function saveWishlist() {
    setStoredJSON("footraWishlist", wishlist);
}


// ---------------------------------------------------------
// RENDER WISHLIST
// ---------------------------------------------------------

function renderWishlist() {

    const container = $("wishlistItems");

    if (!container) return;

    if (wishlist.length === 0) {
        container.innerHTML = `
            <p class="wishlist-empty">
                Your wishlist is empty.
            </p>
        `;
        return;
    }

    container.innerHTML = wishlist.map((item, index) => `
        <div class="wishlist-item" data-index="${index}">

            <img
                src="${item.image || ""}"
                alt="${item.name || "Product"}"
            >

            <div class="wishlist-info">
                <h5>${item.name || ""}</h5>
                <p>${item.price || ""}</p>
            </div>

            <button
                type="button"
                class="remove-wishlist"
                data-index="${index}"
                aria-label="Remove ${item.name || "item"}"
            >
                <i class="fa-solid fa-xmark"></i>
            </button>

        </div>
    `).join("");

    updateWishlistHearts();
}


// ---------------------------------------------------------
// OPEN WISHLIST
// ---------------------------------------------------------

window.openWishlist = function () {

    const wishlistDrawer = $("wishlistDrawer");
    const wishlistOverlay = $("wishlistOverlay");

    if (!wishlistDrawer || !wishlistOverlay) return;

    closeCart();

    renderWishlist();

    wishlistDrawer.classList.add("active");
    wishlistOverlay.classList.add("active");
};


// ---------------------------------------------------------
// CLOSE WISHLIST
// ---------------------------------------------------------

window.closeWishlist = function () {

    const wishlistDrawer = $("wishlistDrawer");
    const wishlistOverlay = $("wishlistOverlay");

    if (wishlistDrawer) {
        wishlistDrawer.classList.remove("active");
    }

    if (wishlistOverlay) {
        wishlistOverlay.classList.remove("active");
    }
};


// ---------------------------------------------------------
// UPDATE HEART ICONS
// ---------------------------------------------------------

function updateWishlistHearts() {

    document.querySelectorAll(".shoe-card").forEach(card => {

        const nameElement = card.querySelector("h4");
        const heart = card.querySelector(".wishlist-icon");

        if (!nameElement || !heart) return;

        const name = nameElement.textContent.trim();

        const exists = wishlist.some(
            item => item.name === name
        );

        if (exists) {

            heart.classList.remove("fa-regular");
            heart.classList.add("fa-solid", "active");

        } else {

            heart.classList.remove("fa-solid", "active");
            heart.classList.add("fa-regular");
        }
    });
}


// ---------------------------------------------------------
// WISHLIST BUTTONS
// ---------------------------------------------------------

function initializeWishlistButtons() {

    document.querySelectorAll(".wishlist-icon").forEach(icon => {

        icon.addEventListener("click", function (event) {

            event.preventDefault();
            event.stopPropagation();

            const card = this.closest(".shoe-card");

            if (!card) return;

            const nameElement =
                card.querySelector("h4");

            const priceElement =
                card.querySelector("p");

            const imageElement =
                card.querySelector(".img-default");

            if (
                !nameElement ||
                !priceElement ||
                !imageElement
            ) {
                return;
            }

            const item = {
                name: nameElement.textContent.trim(),
                price: priceElement.textContent.trim(),
                image: imageElement.src
            };


            const existingIndex = wishlist.findIndex(
                product => product.name === item.name
            );


            // REMOVE
            if (existingIndex !== -1) {

                wishlist.splice(existingIndex, 1);

                this.classList.remove(
                    "fa-solid",
                    "active"
                );

                this.classList.add(
                    "fa-regular"
                );

            }

            // ADD
            else {

                wishlist.push(item);

                this.classList.remove(
                    "fa-regular"
                );

                this.classList.add(
                    "fa-solid",
                    "active"
                );
            }


            saveWishlist();

            renderWishlist();

            openWishlist();
        });
    });
}


// ---------------------------------------------------------
// REMOVE WISHLIST ITEM
// ---------------------------------------------------------

function initializeWishlistRemove() {

    const container = $("wishlistItems");

    if (!container) return;

    container.addEventListener(
        "click",
        function (event) {

            const removeButton =
                event.target.closest(".remove-wishlist");

            if (!removeButton) return;

            event.preventDefault();
            event.stopPropagation();

            const index =
                Number(removeButton.dataset.index);

            if (
                Number.isNaN(index) ||
                index < 0 ||
                index >= wishlist.length
            ) {
                return;
            }

            wishlist.splice(index, 1);

            saveWishlist();

            renderWishlist();

            updateWishlistHearts();
        }
    );
}

    // =========================================================
    // SEARCH
    // =========================================================

    window.toggleSearch = function () {

        const searchBar = $("searchBar");

        if (!searchBar) return;

        searchBar.classList.toggle("active");

        if (searchBar.classList.contains("active")) {

            const input = searchBar.querySelector("input");

            if (input) {
                setTimeout(() => input.focus(), 100);
            }
        }
    };


    // =========================================================
    // USER MENU
    // =========================================================

    window.toggleUserMenu = function (event) {

        if (event) {
            event.stopPropagation();
        }

        const userMenu = $("userMenu");

        if (!userMenu) return;

        userMenu.classList.toggle("active");
    };


    function closeUserMenu() {

        const userMenu = $("userMenu");

        if (userMenu) {
            userMenu.classList.remove("active");
        }
    }


    // =========================================================
    // MOBILE MENU
    // =========================================================

    window.toggleMobileMenu = function () {

        const menu = $("mainMenu");
        const overlay = $("mobileMenuOverlay");

        if (!menu || !overlay) return;

        menu.classList.toggle("show");
        overlay.classList.toggle("active");

        document.body.style.overflow =
            menu.classList.contains("show")
                ? "hidden"
                : "";
    };


    function closeMobileMenu() {

        const menu = $("mainMenu");
        const overlay = $("mobileMenuOverlay");

        if (menu) {
            menu.classList.remove("show");
        }

        if (overlay) {
            overlay.classList.remove("active");
        }

        document.body.style.overflow = "";
    }


    // =========================================================
    // AUTH MODAL
    // =========================================================

    window.openLogin = function () {

        const modal = $("authModal");

        if (!modal) return;

        modal.style.display = "flex";

        window.showLogin();
        closeUserMenu();
    };


    window.openRegister = function () {

        const modal = $("authModal");

        if (!modal) return;

        modal.style.display = "flex";

        window.showRegister();
        closeUserMenu();
    };


    window.openAccount = function () {

        const modal = $("authModal");

        if (!modal) return;

        modal.style.display = "flex";

        const loginSection = $("loginSection");
        const registerSection = $("registerSection");
        const accountSection = $("accountSection");

        if (loginSection) {
            loginSection.style.display = "none";
        }

        if (registerSection) {
            registerSection.style.display = "none";
        }

        if (accountSection) {
            accountSection.style.display = "block";
        }

        closeUserMenu();
    };


    window.closeModal = function () {

        const modal = $("authModal");

        if (modal) {
            modal.style.display = "none";
        }
    };


    window.showLogin = function () {

        const loginSection = $("loginSection");
        const registerSection = $("registerSection");
        const accountSection = $("accountSection");

        if (loginSection) {
            loginSection.style.display = "block";
        }

        if (registerSection) {
            registerSection.style.display = "none";
        }

        if (accountSection) {
            accountSection.style.display = "none";
        }
    };


    window.showRegister = function () {

        const loginSection = $("loginSection");
        const registerSection = $("registerSection");
        const accountSection = $("accountSection");

        if (loginSection) {
            loginSection.style.display = "none";
        }

        if (registerSection) {
            registerSection.style.display = "block";
        }

        if (accountSection) {
            accountSection.style.display = "none";
        }
    };


    window.logout = function () {

        alert("Logged out successfully.");

        window.closeModal();
    };


    // =========================================================
    // NEWSLETTER
    // =========================================================

    window.subscribeNewsletter = function () {

        const nameInput = $("newsletterName");
        const emailInput = $("newsletterEmail");

        if (!nameInput || !emailInput) return;

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();

        if (!name || !email) {
            alert("Please fill in both name and email fields.");
            return;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        alert(
            `Thank you for subscribing, ${name}! Check your inbox for updates.`
        );

        nameInput.value = "";
        emailInput.value = "";
    };


    // =========================================================
    // CONTACT FORM
    // =========================================================

    function initializeContactForm() {

        const contactForm = $("contactForm");

        if (!contactForm) return;

        contactForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const firstName =
                $("firstName")?.value.trim() || "";

            const lastName =
                $("lastName")?.value.trim() || "";

            const email =
                $("contactEmail")?.value.trim() ||
                $("email")?.value.trim() ||
                "";

            const successMessage = $("successMessage");

            if (!firstName || !lastName || !email) {
                alert("Please fill in all required fields.");
                return;
            }

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }

            if (successMessage) {
                successMessage.style.display = "block";

                setTimeout(() => {
                    successMessage.style.display = "none";
                }, 5000);
            }

            contactForm.reset();
        });
    }


    // =========================================================
    // BUY NOW
    // =========================================================

    function initializeBuyButtons() {

        document.querySelectorAll(".buy-btn").forEach(button => {

            button.addEventListener("click", function (event) {

                event.preventDefault();

                const card = this.closest(".shoe-card");

                if (!card) return;

                const name =
                    card.querySelector("h4")?.textContent.trim();

                const price =
                    card.querySelector("p")?.textContent.trim();

                const image =
                    card.querySelector(".img-default")?.src;

                if (!name || !price || !image) {
                    alert("Unable to open this product.");
                    return;
                }

                const product = {
                    name: name,
                    price: price,
                    image: image
                };

                setStoredJSON("selectedProduct", product);

                window.location.href = "product.html";
            });
        });
    }


    // =========================================================
    // PRODUCT PAGE
    // =========================================================

    function initializeProductPage() {

        const productName = $("productName");
        const productPrice = $("productPrice");
        const productImage = $("productImage");

        // Not product page
        if (!productName || !productPrice || !productImage) {
            return;
        }

        const product =
            getStoredJSON("selectedProduct", null);

        if (!product) {
            productName.textContent = "Product not found";
            productPrice.textContent = "";
            return;
        }

        productName.textContent = product.name || "";
        productPrice.textContent = product.price || "";
        productImage.src = product.image || "";
        productImage.alt = product.name || "Product";

        let selectedSize = null;

        // Size selection
        document
            .querySelectorAll(".size-options button, .size-btn")
            .forEach(button => {

                button.addEventListener("click", function () {

                    document
                        .querySelectorAll(".size-options button, .size-btn")
                        .forEach(btn => {
                            btn.classList.remove("active");
                        });

                    this.classList.add("active");

                    selectedSize =
                        this.dataset.size ||
                        this.textContent.trim();
                });
            });


        // Checkout
        const checkoutButton =
            $("productCheckoutBtn") ||
            document.querySelector(".checkout-btn");

        if (checkoutButton) {

            checkoutButton.addEventListener("click", function (event) {

                event.preventDefault();

                if (!selectedSize) {
                    alert("Please select a size first.");
                    return;
                }

                const checkoutData = {
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    size: selectedSize
                };

                setStoredJSON(
                    "checkoutProduct",
                    checkoutData
                );

                window.location.href = "checkout.html";
            });
        }
    }


    // =========================================================
    // PRODUCT BACK BUTTON
    // =========================================================

    window.goBack = function () {

        if (document.referrer) {
            window.history.back();
        } else {
            window.location.href = "index.html";
        }
    };


    // =========================================================
    // CHECKOUT PAGE
    // =========================================================

    function initializeCheckoutPage() {

        const checkoutForm = $("checkoutForm");

        if (!checkoutForm) {
            return;
        }

        const checkoutData =
            getStoredJSON("checkoutProduct", null);

        // Display product summary
        if (checkoutData) {

            if ($("summaryImage")) {
                $("summaryImage").src =
                    checkoutData.image || "";

                $("summaryImage").alt =
                    checkoutData.name || "Product";
            }

            if ($("summaryName")) {
                $("summaryName").textContent =
                    checkoutData.name || "";
            }

            if ($("summarySize")) {
                $("summarySize").textContent =
                    "Size: " + (checkoutData.size || "");
            }

            if ($("summaryPrice")) {
                $("summaryPrice").textContent =
                    checkoutData.price || "";
            }

            if ($("summaryTotal")) {
                $("summaryTotal").textContent =
                    checkoutData.price || "";
            }
        }


        checkoutForm.addEventListener("submit", function (event) {

            event.preventDefault();

            const email =
                $("email")?.value.trim() || "";

            const fullname =
                $("fullname")?.value.trim() || "";

            const address =
                $("address")?.value.trim() || "";

            const city =
                $("city")?.value.trim() || "";

            const pincode =
                $("pincode")?.value.trim() || "";

            const phone =
                $("phone")?.value.trim() || "";


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            const namePattern =
                /^[A-Za-z ]+$/;

            const phonePattern =
                /^[0-9]{10}$/;

            const pinPattern =
                /^[0-9]{6}$/;


            // Required fields
            if (
                !email ||
                !fullname ||
                !address ||
                !city ||
                !pincode ||
                !phone
            ) {
                alert("Please fill all fields.");
                return;
            }


            // Email
            if (!emailPattern.test(email)) {
                alert("Please enter a valid email address.");
                return;
            }


            // Name
            if (!namePattern.test(fullname)) {
                alert(
                    "Full name should contain letters and spaces only."
                );
                return;
            }


            // PIN
            if (!pinPattern.test(pincode)) {
                alert("PIN Code must be 6 digits.");
                return;
            }


            // Phone
            if (!phonePattern.test(phone)) {
                alert("Phone number must be 10 digits.");
                return;
            }


            // Payment success
            alert("Payment Successful! 🎉");

            // Clear checkout product
            localStorage.removeItem("checkoutProduct");

            // Clear cart if checkout came from cart
            if (localStorage.getItem("cartTotalAmount")) {
                localStorage.removeItem("cartTotalAmount");
            }

            // Redirect home
            window.location.href = "index.html";
        });
    }


    // =========================================================
    // CHECKOUT BACK BUTTON
    // =========================================================

    window.goBackToProduct = function () {

        if (localStorage.getItem("selectedProduct")) {
            window.location.href = "product.html";
        } else {
            window.location.href = "index.html";
        }
    };


    // =========================================================
    // COUNTDOWN
    // =========================================================

    function initializeCountdown() {

        const countdownElement = $("countdown");

        if (!countdownElement) {
            return;
        }

        let countdownSeconds =
            Number(localStorage.getItem("footraCountdown"));

        if (
            !countdownSeconds ||
            countdownSeconds <= 0
        ) {
            countdownSeconds = 24 * 60 * 60;
        }


        function updateCountdown() {

            const hours =
                Math.floor(countdownSeconds / 3600);

            const minutes =
                Math.floor(
                    (countdownSeconds % 3600) / 60
                );

            const seconds =
                countdownSeconds % 60;


            countdownElement.textContent =
                `${String(hours).padStart(2, "0")}:` +
                `${String(minutes).padStart(2, "0")}:` +
                `${String(seconds).padStart(2, "0")}`;


            if (countdownSeconds > 0) {
                countdownSeconds--;

                localStorage.setItem(
                    "footraCountdown",
                    countdownSeconds
                );
            }
        }


        updateCountdown();

        setInterval(updateCountdown, 1000);
    }


    // =========================================================
    // CLOSE OVERLAYS
    // =========================================================

    function initializeGlobalClickHandlers() {

        window.addEventListener("click", function (event) {

            // Close user menu
            if (!event.target.closest(".user-dropdown")) {
                closeUserMenu();
            }


            // Close cart/wishlist when overlay is clicked
            if (
                event.target.classList.contains("cart-overlay") ||
                event.target.classList.contains("wishlist-overlay")
            ) {
                closeCart();
                closeWishlist();
            }
        });


        // Close mobile menu links
        document.querySelectorAll(".menu a").forEach(link => {

            link.addEventListener("click", function () {
                closeMobileMenu();
            });
        });


        // Mobile overlay
        const mobileOverlay =
            $("mobileMenuOverlay");

        if (mobileOverlay) {
            mobileOverlay.addEventListener(
                "click",
                closeMobileMenu
            );
        }


        // Close auth modal by clicking outside
        const authModal = $("authModal");

        if (authModal) {

            authModal.addEventListener(
                "click",
                function (event) {

                    if (event.target === authModal) {
                        window.closeModal();
                    }
                }
            );
        }
    }


    // =========================================================
    // SMOOTH SCROLL
    // =========================================================

    function initializeSmoothScroll() {

        document
            .querySelectorAll('a[href^="#"]')
            .forEach(anchor => {

                anchor.addEventListener(
                    "click",
                    function (event) {

                        const targetId =
                            this.getAttribute("href");

                        if (
                            !targetId ||
                            targetId === "#"
                        ) {
                            return;
                        }

                        const target =
                            document.querySelector(targetId);

                        if (!target) {
                            return;
                        }

                        event.preventDefault();

                        target.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });
                    }
                );
            });
    }


    // =========================================================
    // INITIALIZE EVERYTHING
    // =========================================================

    function initialize() {

        renderCart();
        renderWishlist();

        initializeCartButtons();
        initializeCartRemove();
        initializeCartCheckout();

        initializeWishlistButtons();
        initializeWishlistRemove();

        initializeBuyButtons();

        initializeContactForm();

        initializeProductPage();
        initializeCheckoutPage();

        initializeCountdown();

        initializeGlobalClickHandlers();
        initializeSmoothScroll();
    }


    // Run after HTML has loaded
    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initialize
        );

    } else {

        initialize();
    }

})();

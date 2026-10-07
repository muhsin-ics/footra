 (function() {
    // ---------- GLOBAL VARIABLES ----------
    let cartTotal = 0;
    let countdownSeconds = 24 * 60 * 60; // 24h

    // ---------- HELPER: OPEN/CLOSE CART & WISHLIST ----------
    window.openCart = function() {
      closeWishlist();
      document.getElementById('cartDrawer').classList.add('active');
      document.getElementById('cartOverlay').classList.add('active');
    };
    window.closeCart = function() {
      document.getElementById('cartDrawer').classList.remove('active');
      document.getElementById('cartOverlay').classList.remove('active');
    };
    window.openWishlist = function() {
      closeCart();
      document.getElementById('wishlistDrawer').classList.add('active');
      document.getElementById('wishlistOverlay').classList.add('active');
    };
    window.closeWishlist = function() {
      document.getElementById('wishlistDrawer').classList.remove('active');
      document.getElementById('wishlistOverlay').classList.remove('active');
    };

    // ---------- SEARCH BAR ----------
    window.toggleSearch = function() {
      document.getElementById('searchBar').classList.toggle('active');
    };

    // ---------- USER DROPDOWN ----------
    window.toggleUserMenu = function(e) {
      document.getElementById('userMenu').classList.toggle('active');
      e?.stopPropagation();
    };
    window.addEventListener('click', function(e) {
      if (!e.target.closest('.user-dropdown')) {
        document.getElementById('userMenu').classList.remove('active');
      }
    });

    // ---------- MOBILE MENU (FIXED) ----------
    window.toggleMobileMenu = function() {
      const menu = document.getElementById('mainMenu');
      const overlay = document.getElementById('mobileMenuOverlay');
      menu.classList.toggle('show');
      overlay.classList.toggle('active');
      
      // Prevent body scrolling when menu is open
      if (menu.classList.contains('show')) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    };
    
    // Close menu when clicking on a link
    document.querySelectorAll('.menu a').forEach(link => {
      link.addEventListener('click', function() {
        document.getElementById('mainMenu').classList.remove('show');
        document.getElementById('mobileMenuOverlay').classList.remove('active');
        document.body.style.overflow = '';
      });
    });

    // ---------- MODAL ----------
    window.openLogin = function() { 
      document.getElementById('authModal').style.display = 'flex'; 
      showLogin(); 
    };
    window.openRegister = function() { 
      document.getElementById('authModal').style.display = 'flex'; 
      showRegister(); 
    };
    window.openAccount = function() { 
      document.getElementById('authModal').style.display = 'flex'; 
      document.getElementById('loginSection').style.display = 'none'; 
      document.getElementById('registerSection').style.display = 'none'; 
      document.getElementById('accountSection').style.display = 'block'; 
    };
    window.closeModal = function() { 
      document.getElementById('authModal').style.display = 'none'; 
    };
    window.showLogin = function() { 
      document.getElementById('loginSection').style.display = 'block'; 
      document.getElementById('registerSection').style.display = 'none'; 
      document.getElementById('accountSection').style.display = 'none'; 
    };
    window.showRegister = function() { 
      document.getElementById('loginSection').style.display = 'none'; 
      document.getElementById('registerSection').style.display = 'block'; 
      document.getElementById('accountSection').style.display = 'none'; 
    };
    window.logout = function() { 
      alert('Logged out!'); 
      closeModal(); 
    };

    // ---------- COUNTDOWN ----------
    function updateCountdown() {
      const h = Math.floor(countdownSeconds / 3600);
      const m = Math.floor((countdownSeconds % 3600) / 60);
      const s = countdownSeconds % 60;
      document.getElementById('countdown').innerText = `${h.toString().padStart(2,'0')}:${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
      if (countdownSeconds > 0) countdownSeconds--;
    }
    setInterval(updateCountdown, 1000);
    updateCountdown();

    // ---------- CART FUNCTIONALITY ----------
    function addToCart(name, priceText, imgSrc) {
      const price = parseInt(priceText.replace('₹',''));
      const cartDiv = document.getElementById('cartItems');
      if (cartDiv.innerHTML.includes('empty')) cartDiv.innerHTML = '';
      cartDiv.innerHTML += `
        <div class="cart-item">
          <img src="${imgSrc}" alt="${name}">
          <div class="cart-info"><h5>${name}</h5><p>₹${price}</p></div>
          <i class="fa-solid fa-xmark remove-item" data-price="${price}"></i>
        </div>`;
      cartTotal += price;
      document.getElementById('cartTotal').innerText = cartTotal;
      document.getElementById('cartCount').innerText = cartDiv.children.length;
    }

    document.querySelectorAll('.cart-icon').forEach(icon => {
      icon.addEventListener('click', function(e) {
        e.stopPropagation();
        const card = this.closest('.shoe-card');
        const name = card.querySelector('h4').innerText;
        const price = card.querySelector('p').innerText;
        const img = card.querySelector('.img-default').src;
        addToCart(name, price, img);
        openCart();
      });
    });

    document.getElementById('cartItems').addEventListener('click', function(e) {
      if (e.target.classList.contains('remove-item')) {
        const price = parseInt(e.target.dataset.price);
        cartTotal -= price;
        e.target.closest('.cart-item').remove();
        document.getElementById('cartTotal').innerText = cartTotal;
        document.getElementById('cartCount').innerText = this.children.length;
        if (this.children.length === 0) this.innerHTML = '<p>Your cart is empty.</p>';
      }
    });

    document.getElementById('cartCheckoutBtn').addEventListener('click', function() {
      if (cartTotal <= 0) { alert('Cart empty'); return; }
      localStorage.setItem('cartTotalAmount', cartTotal);
      window.location.href = 'checkout.html';
    });

    // ---------- WISHLIST ----------
    function removeWishlistItemByName(name) {
      const items = document.querySelectorAll('.wishlist-item');
      items.forEach(item => { if (item.dataset.name === name) item.remove(); });
      const container = document.getElementById('wishlistItems');
      if (container.children.length === 0) container.innerHTML = '<p>Your wishlist is empty.</p>';
    }

    document.querySelectorAll('.wishlist-icon').forEach(icon => {
      icon.addEventListener('click', function(e) {
        e.stopPropagation();
        const card = this.closest('.shoe-card');
        const name = card.querySelector('h4').innerText;
        const price = card.querySelector('p').innerText;
        const img = card.querySelector('.img-default').src;

        if (this.classList.contains('active')) { // remove
          this.classList.remove('fa-solid', 'active');
          this.classList.add('fa-regular');
          removeWishlistItemByName(name);
        } else { // add
          this.classList.remove('fa-regular');
          this.classList.add('fa-solid', 'active');
          const wishDiv = document.getElementById('wishlistItems');
          if (wishDiv.innerHTML.includes('empty')) wishDiv.innerHTML = '';
          wishDiv.innerHTML += `
            <div class="wishlist-item" data-name="${name}">
              <img src="${img}"><div><h5>${name}</h5><p>${price}</p></div>
              <i class="fa-solid fa-xmark remove-wishlist"></i>
            </div>`;
          openWishlist();
        }
      });
    });

    document.getElementById('wishlistItems').addEventListener('click', function(e) {
      if (e.target.classList.contains('remove-wishlist')) {
        const item = e.target.closest('.wishlist-item');
        const name = item.dataset.name;
        item.remove();
        // unhighlight heart on card
        document.querySelectorAll('.shoe-card').forEach(card => {
          if (card.querySelector('h4').innerText === name) {
            const heart = card.querySelector('.wishlist-icon');
            heart.classList.remove('fa-solid', 'active');
            heart.classList.add('fa-regular');
          }
        });
        if (this.children.length === 0) this.innerHTML = '<p>Your wishlist is empty.</p>';
      }
    });

    // ---------- BUY NOW (redirect) ----------
    document.querySelectorAll('.buy-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const card = this.closest('.shoe-card');
        const product = {
          name: card.querySelector('h4').innerText,
          price: card.querySelector('p').innerText,
          image: card.querySelector('.img-default').src
        };
        localStorage.setItem('selectedProduct', JSON.stringify(product));
        window.location.href = 'product.html';
      });
    });

    // ---------- CLOSE OVERLAYS WHEN CLICKED ----------
    window.addEventListener('click', function(e) {
      if (e.target.classList.contains('cart-overlay')) {
        closeCart(); 
        closeWishlist();
      }
    });
  })();

//about

  // ========== GLOBAL VARIABLES ==========
        let cartTotal = 0;
        let cartItems = [];

        // ========== NAVBAR FUNCTIONS ==========
        window.toggleSearch = function() {
            document.getElementById('searchBar').classList.toggle('active');
        };

        window.toggleUserMenu = function(e) {
            e?.stopPropagation();
            document.getElementById('userMenu').classList.toggle('active');
        };

        window.addEventListener('click', function(e) {
            if (!e.target.closest('.user-dropdown')) {
                document.getElementById('userMenu').classList.remove('active');
            }
        });

        window.toggleMobileMenu = function() {
            const menu = document.getElementById('mainMenu');
            const overlay = document.getElementById('mobileMenuOverlay');
            menu.classList.toggle('show');
            overlay.classList.toggle('active');
            document.body.style.overflow = menu.classList.contains('show') ? 'hidden' : '';
        };

        document.querySelectorAll('.menu a').forEach(link => {
            link.addEventListener('click', function() {
                document.getElementById('mainMenu').classList.remove('show');
                document.getElementById('mobileMenuOverlay').classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // ========== CART FUNCTIONS ==========
        window.openCart = function() {
            closeWishlist();
            document.getElementById('cartDrawer').classList.add('active');
            document.getElementById('cartOverlay').classList.add('active');
        };

        window.closeCart = function() {
            document.getElementById('cartDrawer').classList.remove('active');
            document.getElementById('cartOverlay').classList.remove('active');
        };

        window.openWishlist = function() {
            closeCart();
            document.getElementById('wishlistDrawer').classList.add('active');
            document.getElementById('wishlistOverlay').classList.add('active');
        };

        window.closeWishlist = function() {
            document.getElementById('wishlistDrawer').classList.remove('active');
            document.getElementById('wishlistOverlay').classList.remove('active');
        };

        window.checkout = function() {
            if (cartTotal <= 0) {
                alert('Your cart is empty');
                return;
            }
            alert('Proceeding to checkout...');
        };

        // ========== MODAL FUNCTIONS ==========
        window.openLogin = function() {
            document.getElementById('authModal').style.display = 'flex';
            showLogin();
            closeUserMenu();
        };

        window.openRegister = function() {
            document.getElementById('authModal').style.display = 'flex';
            showRegister();
            closeUserMenu();
        };

        window.openAccount = function() {
            document.getElementById('authModal').style.display = 'flex';
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('registerSection').style.display = 'none';
            closeUserMenu();
        };

        window.closeModal = function() {
            document.getElementById('authModal').style.display = 'none';
        };

        window.showLogin = function() {
            document.getElementById('loginSection').style.display = 'block';
            document.getElementById('registerSection').style.display = 'none';
        };

        window.showRegister = function() {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('registerSection').style.display = 'block';
        };

        function closeUserMenu() {
            document.getElementById('userMenu').classList.remove('active');
        }

        // ========== NEWSLETTER ==========
        window.subscribeNewsletter = function() {
            const name = document.getElementById('newsletterName').value;
            const email = document.getElementById('newsletterEmail').value;
            
            if (!name || !email) {
                alert('Please fill in both name and email fields');
                return;
            }
            
            if (!email.includes('@') || !email.includes('.')) {
                alert('Please enter a valid email address');
                return;
            }
            
            alert(`Thank you for subscribing, ${name}! Check your inbox for updates.`);
            
            document.getElementById('newsletterName').value = '';
            document.getElementById('newsletterEmail').value = '';
        };

        // ========== CLOSE OVERLAYS ==========
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('cart-overlay')) {
                closeCart();
                closeWishlist();
            }
        });

        // ========== UPDATE CART COUNT FROM LOCAL STORAGE ==========
        function updateCartCount() {
            const savedCart = localStorage.getItem('footraCart');
            if (savedCart) {
                const items = JSON.parse(savedCart);
                cartItems = items;
                cartTotal = items.reduce((sum, item) => sum + item.price, 0);
                document.getElementById('cartCount').textContent = items.length;
                document.getElementById('cartTotal').textContent = cartTotal;
                
                const cartDiv = document.getElementById('cartItems');
                if (items.length > 0) {
                    cartDiv.innerHTML = '';
                    items.forEach(item => {
                        cartDiv.innerHTML += `
                            <div class="cart-item">
                                <img src="${item.image}" alt="${item.name}">
                                <div><h5>${item.name}</h5><p>₹${item.price}</p></div>
                                <i class="fa-solid fa-xmark remove-item" onclick="removeFromCart(${item.price})"></i>
                            </div>`;
                    });
                }
            }
        }

        window.removeFromCart = function(price) {
            cartItems = cartItems.filter(item => item.price !== price);
            localStorage.setItem('footraCart', JSON.stringify(cartItems));
            updateCartCount();
        };

        // Initialize
        updateCartCount();

//contact

// ========== GLOBAL VARIABLES ==========
        let cartTotal = 0;
        let cartItems = [];

        // ========== NAVBAR FUNCTIONS ==========
        window.toggleSearch = function() {
            document.getElementById('searchBar').classList.toggle('active');
        };

        window.toggleUserMenu = function(e) {
            e?.stopPropagation();
            document.getElementById('userMenu').classList.toggle('active');
        };

        window.addEventListener('click', function(e) {
            if (!e.target.closest('.user-dropdown')) {
                document.getElementById('userMenu').classList.remove('active');
            }
        });

        window.toggleMobileMenu = function() {
            const menu = document.getElementById('mainMenu');
            const overlay = document.getElementById('mobileMenuOverlay');
            menu.classList.toggle('show');
            overlay.classList.toggle('active');
            document.body.style.overflow = menu.classList.contains('show') ? 'hidden' : '';
        };

        document.querySelectorAll('.menu a').forEach(link => {
            link.addEventListener('click', function() {
                document.getElementById('mainMenu').classList.remove('show');
                document.getElementById('mobileMenuOverlay').classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // ========== CART FUNCTIONS ==========
        window.openCart = function() {
            closeWishlist();
            document.getElementById('cartDrawer').classList.add('active');
            document.getElementById('cartOverlay').classList.add('active');
        };

        window.closeCart = function() {
            document.getElementById('cartDrawer').classList.remove('active');
            document.getElementById('cartOverlay').classList.remove('active');
        };

        window.openWishlist = function() {
            closeCart();
            document.getElementById('wishlistDrawer').classList.add('active');
            document.getElementById('wishlistOverlay').classList.add('active');
        };

        window.closeWishlist = function() {
            document.getElementById('wishlistDrawer').classList.remove('active');
            document.getElementById('wishlistOverlay').classList.remove('active');
        };

        window.checkout = function() {
            if (cartTotal <= 0) {
                alert('Your cart is empty');
                return;
            }
            alert('Proceeding to checkout...');
        };

        // ========== MODAL FUNCTIONS ==========
        window.openLogin = function() {
            document.getElementById('authModal').style.display = 'flex';
            showLogin();
            closeUserMenu();
        };

        window.openRegister = function() {
            document.getElementById('authModal').style.display = 'flex';
            showRegister();
            closeUserMenu();
        };

        window.openAccount = function() {
            document.getElementById('authModal').style.display = 'flex';
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('registerSection').style.display = 'none';
            closeUserMenu();
        };

        window.closeModal = function() {
            document.getElementById('authModal').style.display = 'none';
        };

        window.showLogin = function() {
            document.getElementById('loginSection').style.display = 'block';
            document.getElementById('registerSection').style.display = 'none';
        };

        window.showRegister = function() {
            document.getElementById('loginSection').style.display = 'none';
            document.getElementById('registerSection').style.display = 'block';
        };

        function closeUserMenu() {
            document.getElementById('userMenu').classList.remove('active');
        }

        // ========== CONTACT FORM ==========
        document.getElementById('contactForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const successMsg = document.getElementById('successMessage');
            successMsg.style.display = 'block';
            this.reset();
            
            setTimeout(() => {
                successMsg.style.display = 'none';
            }, 5000);
        });

        // ========== NEWSLETTER ==========
        window.subscribeNewsletter = function() {
            const name = document.getElementById('newsletterName').value;
            const email = document.getElementById('newsletterEmail').value;
            
            if (!name || !email) {
                alert('Please fill in both name and email fields');
                return;
            }
            
            if (!email.includes('@') || !email.includes('.')) {
                alert('Please enter a valid email address');
                return;
            }
            
            alert(`Thank you for subscribing, ${name}! Check your inbox for updates.`);
            
            document.getElementById('newsletterName').value = '';
            document.getElementById('newsletterEmail').value = '';
        };

        // ========== SMOOTH SCROLL ==========
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // ========== CLOSE OVERLAYS ==========
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('cart-overlay')) {
                closeCart();
                closeWishlist();
            }
        });

        // ========== UPDATE CART COUNT FROM LOCAL STORAGE ==========
        function updateCartCount() {
            const savedCart = localStorage.getItem('footraCart');
            if (savedCart) {
                const items = JSON.parse(savedCart);
                cartItems = items;
                cartTotal = items.reduce((sum, item) => sum + item.price, 0);
                document.getElementById('cartCount').textContent = items.length;
                document.getElementById('cartTotal').textContent = cartTotal;
                
                const cartDiv = document.getElementById('cartItems');
                if (items.length > 0) {
                    cartDiv.innerHTML = '';
                    items.forEach(item => {
                        cartDiv.innerHTML += `
                            <div class="cart-item">
                                <img src="${item.image}" alt="${item.name}">
                                <div><h5>${item.name}</h5><p>₹${item.price}</p></div>
                                <i class="fa-solid fa-xmark remove-item" data-price="${item.price}"></i>
                            </div>`;
                    });
                }
            }
        }

        // Initialize
        updateCartCount();

//Product

const product = JSON.parse(localStorage.getItem("selectedProduct"));

let selectedSize = null;

if(product){
    document.getElementById("productName").innerText = product.name;
    document.getElementById("productPrice").innerText = product.price;
    document.getElementById("productImage").src = product.image;
}

// Size selection
document.querySelectorAll(".size-options button").forEach(btn=>{
    btn.addEventListener("click",function(){
        document.querySelectorAll(".size-options button")
        .forEach(b=>b.classList.remove("active"));

        this.classList.add("active");
        selectedSize = this.innerText;
    });
});

// Checkout button
document.querySelector(".checkout-btn").addEventListener("click", function(){

    if(!selectedSize){
        alert("Please select a size first.");
        return;
    }

    const checkoutData = {
        name: product.name,
        price: product.price,
        image: product.image,
        size: selectedSize
    };

    localStorage.setItem("checkoutProduct", JSON.stringify(checkoutData));

    window.location.href = "checkout.html";
});

function goBack(){
    window.location.href = "index.html"; 
}

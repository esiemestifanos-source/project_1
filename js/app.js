// ========================================
// GEARSOULS - MAIN APPLICATION
// Firebase Auth + Shopify Checkout (FIXED)
// ========================================

// ---------- STORAGE KEYS ----------
const STORAGE = {
  CART: 'gearsouls_cart',
  ORDERS: 'gearsouls_orders'
};

// ---------- GLOBAL STATE ----------
let cart = [];
let orders = [];
let currentUser = null;
let currentPage = 'home';

// ---------- HELPER FUNCTIONS ----------
function showToast(msg, isError = false) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.background = isError ? '#D9534F' : 'var(--gold)';
  toast.style.color = isError ? 'white' : 'black';
  toast.style.opacity = '1';
  setTimeout(() => toast.style.opacity = '0', 2500);
}

function saveToLocalStorage() {
  localStorage.setItem(STORAGE.CART, JSON.stringify(cart));
  localStorage.setItem(STORAGE.ORDERS, JSON.stringify(orders));
}

function loadFromLocalStorage() {
  cart = JSON.parse(localStorage.getItem(STORAGE.CART)) || [];
  orders = JSON.parse(localStorage.getItem(STORAGE.ORDERS)) || [];
}

// ---------- CART FUNCTIONS ----------
function addToCart(product, size, color) {
  if (!size || !color) {
    showToast("Please select size and color", true);
    return false;
  }
  
  const existingIndex = cart.findIndex(item => 
    item.id === product.id && item.selectedSize === size && item.selectedColor === color
  );
  
  if (existingIndex !== -1) {
    cart[existingIndex].quantity++;
  } else {
    cart.push({
      ...product,
      selectedSize: size,
      selectedColor: color,
      quantity: 1
    });
  }
  
  saveToLocalStorage();
  updateCartUI();
  renderCartSidebar();
  showToast(`✓ ${product.name} added (${size} / ${color})`);
  return true;
}

function updateQuantity(id, size, color, delta) {
  const index = cart.findIndex(item => 
    item.id === id && item.selectedSize === size && item.selectedColor === color
  );
  if (index !== -1) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    saveToLocalStorage();
    updateCartUI();
    renderCartSidebar();
  }
}

function removeCartItem(id, size, color) {
  const index = cart.findIndex(item => 
    item.id === id && item.selectedSize === size && item.selectedColor === color
  );
  if (index !== -1) {
    cart.splice(index, 1);
    saveToLocalStorage();
    updateCartUI();
    renderCartSidebar();
    showToast("Item removed");
  }
}

function updateCartUI() {
  const count = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.querySelectorAll('.cart-count').forEach(el => el.textContent = count);
}

function getCartTotal() {
  return cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
}

function renderCartSidebar() {
  const container = document.getElementById('cartItemsList');
  if (!container) return;
  
  if (cart.length === 0) {
    container.innerHTML = '<div style="padding:2rem; text-align:center; color:#666;">⚡ YOUR ARCHIVE IS EMPTY</div>';
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.innerText = '$0';
    return;
  }
  
  let html = '';
  let total = 0;
  cart.forEach(item => {
    total += item.price * item.quantity;
    html += `
      <div class="cart-item">
        <img class="cart-item-img" src="${item.image}" onerror="this.src='https://placehold.co/100x100?text=GS'">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.name}</div>
          <div class="cart-item-price">$${item.price}</div>
          <div class="cart-item-variant">${item.selectedSize} / ${item.selectedColor}</div>
          <div class="cart-qty">
            <button class="qty-btn" data-id="${item.id}" data-size="${item.selectedSize}" data-color="${item.selectedColor}" data-delta="-1">−</button>
            <span class="qty-num">${item.quantity}</span>
            <button class="qty-btn" data-id="${item.id}" data-size="${item.selectedSize}" data-color="${item.selectedColor}" data-delta="1">+</button>
            <button class="remove-item" data-id="${item.id}" data-size="${item.selectedSize}" data-color="${item.selectedColor}"><i class="fas fa-trash-alt"></i></button>
          </div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.innerText = `$${total}`;
  
  document.querySelectorAll('.qty-btn[data-delta]').forEach(btn => {
    btn.addEventListener('click', () => {
      updateQuantity(btn.dataset.id, btn.dataset.size, btn.dataset.color, parseInt(btn.dataset.delta));
    });
  });
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      removeCartItem(btn.dataset.id, btn.dataset.size, btn.dataset.color);
    });
  });
}

// ---------- SHOPIFY CHECKOUT (REQUIRES LOGIN) - FIXED ----------
async function checkout() {
  if (!currentUser) {
    showToast("Please sign in to continue with checkout", true);
    navigateTo('account');
    return;
  }
  if (cart.length === 0) {
    showToast("Your cart is empty", true);
    return;
  }
  
  showToast("Redirecting to secure checkout...", false);
  
  // Build the correct Shopify cart URL format: /cart/VARIANT_ID:QUANTITY
  let variantString = '';
  cart.forEach(item => {
    if (item.shopifyVariantId) {
      variantString += `${item.shopifyVariantId}:${item.quantity},`;
    }
  });
  // Remove trailing comma
  variantString = variantString.slice(0, -1);
  
  // Save order to history
  const order = {
    id: 'ORD-' + Date.now(),
    userEmail: currentUser.email,
    items: JSON.parse(JSON.stringify(cart)),
    total: getCartTotal(),
    date: new Date().toLocaleString()
  };
  orders.push(order);
  saveToLocalStorage();
  
  // Build the checkout URL (direct to Shopify checkout)
  const checkoutUrl = `https://${SHOPIFY_CONFIG.domain}/cart/${variantString}`;
  
  // Clear cart
  cart = [];
  saveToLocalStorage();
  updateCartUI();
  renderCartSidebar();
  
  // Close sidebar before redirect
  const sidebar = document.getElementById('cartSidebar');
  if (sidebar) sidebar.classList.remove('open');
  
  // Redirect to Shopify checkout
  window.location.href = checkoutUrl;
}

// ---------- FIREBASE AUTH FUNCTIONS ----------
async function signup(name, email, password) {
  try {
    const userCredential = await auth.createUserWithEmailAndPassword(email, password);
    await userCredential.user.updateProfile({ displayName: name });
    showToast("Account created successfully! Please sign in.");
    return true;
  } catch (error) {
    let message = error.message;
    if (error.code === 'auth/email-already-in-use') message = "Email already registered";
    else if (error.code === 'auth/weak-password') message = "Password too weak (min 6 characters)";
    showToast(message, true);
    return false;
  }
}

async function signin(email, password) {
  try {
    await auth.signInWithEmailAndPassword(email, password);
    showToast("Welcome back!");
    return true;
  } catch (error) {
    let message = error.message;
    if (error.code === 'auth/user-not-found') message = "No account found with this email";
    else if (error.code === 'auth/wrong-password') message = "Incorrect password";
    else if (error.code === 'auth/invalid-email') message = "Invalid email format";
    showToast(message, true);
    return false;
  }
}

async function logout() {
  await auth.signOut();
  showToast("Logged out");
  navigateTo('home');
}

async function resetPassword(email) {
  if (!email) {
    showToast("Please enter your email address", true);
    return false;
  }
  try {
    await auth.sendPasswordResetEmail(email);
    showToast("Password reset email sent! Check your inbox.");
    return true;
  } catch (error) {
    showToast(error.message, true);
    return false;
  }
}

// ---------- PRODUCT DETAIL MODAL ----------
function openProductModal(product) {
  const modal = document.createElement('div');
  modal.className = 'product-modal';
  
  let selectedSize = product.sizes[0];
  let selectedColor = product.colors[0];
  let currentImageIndex = 0;
  
  modal.innerHTML = `
    <div class="modal-container">
      <button class="modal-close" id="closeModalBtn"><i class="fas fa-times"></i></button>
      <div class="modal-gallery">
        <div class="modal-main-image">
          <img id="modalMainImage" src="${product.images[currentImageIndex] || product.image}" alt="${product.name}">
        </div>
        <div class="modal-thumbnails" id="modalThumbnails">
          ${product.images.map((img, idx) => `
            <img class="modal-thumb ${idx === currentImageIndex ? 'active' : ''}" src="${img}" data-index="${idx}">
          `).join('')}
        </div>
      </div>
      <div class="modal-info">
        <div class="modal-brand">GEARSOULS</div>
        <h2 class="modal-title">${product.name}</h2>
        <div class="modal-price">$${product.price}</div>
        <p class="modal-description">${product.description}</p>
        <div class="modal-details">
          <h4>DETAILS</h4>
          <p>${product.details}</p>
        </div>
        <div class="option-group">
          <div class="option-label">SIZE</div>
          <div class="size-buttons" id="modalSizeButtons">
            ${product.sizes.map(size => `
              <button class="size-option ${size === selectedSize ? 'selected' : ''}" data-size="${size}">${size}</button>
            `).join('')}
          </div>
        </div>
        <div class="option-group">
          <div class="option-label">COLOR</div>
          <div class="color-buttons" id="modalColorButtons">
            ${product.colors.map(color => {
              const colorLower = color.toLowerCase();
              let bgColor = '#1a1a1a';
              if (colorLower === 'black') bgColor = '#111111';
              else if (colorLower === 'white') bgColor = '#f5f5f5';
              else if (colorLower === 'charcoal') bgColor = '#4a4a4a';
              else if (colorLower === 'dark grey') bgColor = '#555555';
              else if (colorLower === 'navy') bgColor = '#1a2a4f';
              else if (colorLower === 'olive') bgColor = '#4a5a3a';
              else if (colorLower === 'tan') bgColor = '#c4a47c';
              else if (colorLower === 'silver') bgColor = '#b0b0b0';
              return `
                <button class="color-option ${color === selectedColor ? 'selected' : ''}" data-color="${color}" style="background: ${bgColor};">
                  <span class="color-check"><i class="fas fa-check"></i></span>
                </button>
              `;
            }).join('')}
          </div>
        </div>
        <div class="modal-add-section">
          <button class="modal-add-btn" id="modalAddToCart">
            <span>ADD TO BAG — $${product.price}</span>
            <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
  setTimeout(() => modal.classList.add('active'), 10);
  
  modal.querySelector('#closeModalBtn').addEventListener('click', () => {
    modal.classList.remove('active');
    setTimeout(() => { modal.remove(); document.body.style.overflow = ''; }, 300);
  });
  
  modal.querySelectorAll('.modal-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      currentImageIndex = parseInt(thumb.dataset.index);
      modal.querySelector('#modalMainImage').src = product.images[currentImageIndex];
      modal.querySelectorAll('.modal-thumb').forEach(t => t.classList.remove('active'));
      thumb.classList.add('active');
    });
  });
  
  modal.querySelectorAll('.size-option').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedSize = btn.dataset.size;
    });
  });
  
  modal.querySelectorAll('.color-option').forEach(btn => {
    btn.addEventListener('click', () => {
      modal.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedColor = btn.dataset.color;
    });
  });
  
  modal.querySelector('#modalAddToCart').addEventListener('click', () => {
    addToCart(product, selectedSize, selectedColor);
    modal.classList.remove('active');
    setTimeout(() => { modal.remove(); document.body.style.overflow = ''; }, 300);
  });
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      setTimeout(() => { modal.remove(); document.body.style.overflow = ''; }, 300);
    }
  });
}

// ---------- RENDER PRODUCT GRID ----------
function renderProductGrid(containerId, productList) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.innerHTML = productList.map((product, index) => `
    <div class="product-card" data-product-id="${product.id}" style="animation-delay: ${index * 0.05}s">
      <div class="product-image-wrapper">
        <img class="product-img" src="${product.image}" onerror="this.src='https://placehold.co/400x500?text=GEARSOULS'">
        <div class="product-quick-view">QUICK VIEW</div>
      </div>
      <div class="product-info">
        <div class="product-brand">GEARSOULS</div>
        <div class="product-title">${product.name}</div>
        <div class="product-price">$${product.price}</div>
        <div class="product-options-panel">
          <div class="option-group">
            <div class="option-label">SIZE</div>
            <div class="size-buttons">
              ${product.sizes.map(size => `<button class="size-option" data-size="${size}">${size}</button>`).join('')}
            </div>
          </div>
          <div class="option-group">
            <div class="option-label">COLOR</div>
            <div class="color-buttons">
              ${product.colors.map(color => {
                const colorLower = color.toLowerCase();
                let bgColor = '#1a1a1a';
                if (colorLower === 'black') bgColor = '#111111';
                else if (colorLower === 'white') bgColor = '#f5f5f5';
                else if (colorLower === 'charcoal') bgColor = '#4a4a4a';
                else if (colorLower === 'dark grey') bgColor = '#555555';
                else if (colorLower === 'navy') bgColor = '#1a2a4f';
                else if (colorLower === 'olive') bgColor = '#4a5a3a';
                else if (colorLower === 'tan') bgColor = '#c4a47c';
                else if (colorLower === 'silver') bgColor = '#b0b0b0';
                return `<button class="color-option" data-color="${color}" style="background: ${bgColor};"><span class="color-check"><i class="fas fa-check"></i></span></button>`;
              }).join('')}
            </div>
          </div>
        </div>
        <button class="add-to-cart-btn" data-id="${product.id}" data-name="${product.name}" data-price="${product.price}" data-img="${product.image}">
          <span>ADD TO BAG</span>
          <i class="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `).join('');
  
  document.querySelectorAll(`#${containerId} .product-card`).forEach(card => {
    const productId = card.dataset.productId;
    const product = productList.find(p => p.id === productId);
    if (!product) return;
    
    let selectedSize = product.sizes[0];
    let selectedColor = product.colors[0];
    
    card.querySelector('.product-image-wrapper').addEventListener('click', (e) => {
      e.stopPropagation();
      openProductModal(product);
    });
    
    card.querySelectorAll('.size-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.querySelectorAll('.size-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedSize = btn.dataset.size;
      });
      if (btn.dataset.size === product.sizes[0]) btn.classList.add('selected');
    });
    
    card.querySelectorAll('.color-option').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        card.querySelectorAll('.color-option').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        selectedColor = btn.dataset.color;
      });
      if (btn.dataset.color === product.colors[0]) btn.classList.add('selected');
    });
    
    card.querySelector('.add-to-cart-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      addToCart(product, selectedSize, selectedColor);
      const btn = e.currentTarget;
      btn.classList.add('added');
      setTimeout(() => btn.classList.remove('added'), 500);
    });
  });
}

// ---------- PAGE RENDERING ----------
function renderHomePage() {
  const featured = PRODUCTS.filter(p => FEATURED_IDS.includes(p.id));
  return `
    <div class="hero">
      <div class="hero-content">
        <div class="hero-sub">EST. 2026</div>
        <h1 class="hero-title">ENGINEER YOUR <i>DESTINY</i></h1>
        <p class="hero-desc">Minimalist Armor for the modern wanderer. Each piece forged with raw soul and industrial precision.</p>
        <button class="btn-primary" id="exploreShopBtn">EXPLORE ARCHIVE →</button>
      </div>
    </div>
    <div class="section-title">SIGNATURE <span>DROP</span></div>
    <div class="products-grid" id="featuredGrid"></div>
  `;
}

function renderShopPage() {
  return `
    <div class="hero shop-hero" style="min-height: 40vh;">
      <div class="hero-content">
        <h1 class="hero-title" style="font-size: 3rem;">THE <span style="color: #C5A059;">ARCHIVE</span></h1>
        <p class="hero-desc">Ready to wear. Eternal quality.</p>
      </div>
    </div>
    <div class="products-grid" id="allProductsGrid"></div>
  `;
}

function renderAccountPage() {
  if (currentUser) {
    const userOrders = orders.filter(o => o.userEmail === currentUser.email);
    return `
      <div class="account-section">
        <div class="user-greeting">
          <i class="fas fa-crown" style="color: var(--gold);"></i> 
          <strong>${currentUser.displayName?.toUpperCase() || currentUser.email?.split('@')[0].toUpperCase()}</strong>
          <small>${currentUser.email}</small>
        </div>
        <div class="order-history">
          <h4>📦 ORDER HISTORY</h4>
          ${userOrders.length === 0 ? '<p style="color:#888; padding:1rem; text-align:center;">No orders yet. Complete checkout to see history.</p>' : 
            userOrders.map(o => `<div class="order-item">#${o.id} — $${o.total} — ${o.date}</div>`).join('')}
        </div>
        <button class="auth-btn logout-btn" id="logoutBtn">LOGOUT</button>
        <button class="auth-btn" id="resetPasswordBtn" style="margin-top: 10px; background: #333;">RESET PASSWORD</button>
      </div>
    `;
  } else {
    return `
      <div class="account-section">
        <div class="form-toggle">
          <button id="showSignInBtn" class="active-form">SIGN IN</button>
          <button id="showSignUpBtn">CREATE ACCOUNT</button>
          <button id="showResetBtn">FORGOT PASSWORD?</button>
        </div>
        <div id="signinForm" class="auth-form active">
          <input type="email" id="signinEmail" placeholder="Email address">
          <input type="password" id="signinPassword" placeholder="Password">
          <button class="auth-btn" id="doSignin">SIGN IN</button>
        </div>
        <div id="signupForm" class="auth-form">
          <input type="text" id="signupName" placeholder="Full name">
          <input type="email" id="signupEmail" placeholder="Email">
          <input type="password" id="signupPassword" placeholder="Password (min 6)">
          <button class="auth-btn" id="doSignup">CREATE ACCOUNT</button>
        </div>
        <div id="resetForm" class="auth-form">
          <input type="email" id="resetEmail" placeholder="Email address">
          <button class="auth-btn" id="doReset">SEND RESET LINK</button>
        </div>
      </div>
    `;
  }
}

// ---------- ROUTING & NAVIGATION ----------
function navigateTo(page) {
  currentPage = page;
  const app = document.getElementById('app');
  if (!app) return;
  
  let mainContent = '';
  if (page === 'home') mainContent = renderHomePage();
  else if (page === 'shop') mainContent = renderShopPage();
  else if (page === 'account') mainContent = renderAccountPage();
  
  app.innerHTML = `
    <nav class="navbar">
      <div class="brand" id="navHome">
        <img src="img/0000.jpeg" class="brand-logo" onerror="this.src='https://placehold.co/100x100?text=GS'">
        <div class="brand-text">GEAR<span>SOULS</span></div>
      </div>
      <div class="menu-toggle" id="menuToggle"><i class="fas fa-bars"></i></div>
      <div class="nav-links" id="navLinks">
        <a data-page="home" class="${page === 'home' ? 'active' : ''}">HOME</a>
        <a data-page="shop" class="${page === 'shop' ? 'active' : ''}">SHOP</a>
        <a data-page="account" class="${page === 'account' ? 'active' : ''}">ACCOUNT</a>
        <div class="cart-icon" id="cartIcon">
          <i class="fas fa-bag-shopping"></i>
          <span class="cart-count" id="cartCountNav">0</span>
        </div>
      </div>
    </nav>
    <main>${mainContent}</main>
    <footer class="footer">
      <p>© 2026 GEARSOULS — INDUSTRIAL LUXURY LAB</p>
    </footer>
    <div id="cartSidebar" class="cart-overlay">
      <div class="cart-header">
        <h3>YOUR BAG <i class="fas fa-shopping-bag"></i></h3>
        <button class="close-cart" id="closeCartBtn">&times;</button>
      </div>
      <div class="cart-items" id="cartItemsList"></div>
      <div class="cart-footer">
        <div class="cart-subtotal">SUBTOTAL: <strong id="cartTotal">$0</strong></div>
        <button class="checkout-btn" id="checkoutBtnSidebar">CHECKOUT →</button>
      </div>
    </div>
  `;
  
  setTimeout(() => {
    document.querySelectorAll('[data-page]').forEach(el => {
      el.addEventListener('click', () => navigateTo(el.dataset.page));
    });
    document.getElementById('navHome')?.addEventListener('click', () => navigateTo('home'));
    document.getElementById('exploreShopBtn')?.addEventListener('click', () => navigateTo('shop'));
    
    document.getElementById('cartIcon')?.addEventListener('click', () => {
      document.getElementById('cartSidebar').classList.add('open');
      renderCartSidebar();
    });
    document.getElementById('closeCartBtn')?.addEventListener('click', () => {
      document.getElementById('cartSidebar').classList.remove('open');
    });
    document.getElementById('checkoutBtnSidebar')?.addEventListener('click', () => {
      document.getElementById('cartSidebar').classList.remove('open');
      checkout();
    });
    
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');
    menuToggle?.addEventListener('click', () => navLinks.classList.toggle('open'));
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => navLinks.classList.remove('open'));
    });
    
    document.getElementById('showSignInBtn')?.addEventListener('click', () => {
      document.getElementById('signinForm').classList.add('active');
      document.getElementById('signupForm').classList.remove('active');
      document.getElementById('resetForm').classList.remove('active');
      document.getElementById('showSignInBtn').classList.add('active-form');
      document.getElementById('showSignUpBtn').classList.remove('active-form');
      document.getElementById('showResetBtn').classList.remove('active-form');
    });
    document.getElementById('showSignUpBtn')?.addEventListener('click', () => {
      document.getElementById('signupForm').classList.add('active');
      document.getElementById('signinForm').classList.remove('active');
      document.getElementById('resetForm').classList.remove('active');
      document.getElementById('showSignUpBtn').classList.add('active-form');
      document.getElementById('showSignInBtn').classList.remove('active-form');
      document.getElementById('showResetBtn').classList.remove('active-form');
    });
    document.getElementById('showResetBtn')?.addEventListener('click', () => {
      document.getElementById('resetForm').classList.add('active');
      document.getElementById('signinForm').classList.remove('active');
      document.getElementById('signupForm').classList.remove('active');
      document.getElementById('showResetBtn').classList.add('active-form');
      document.getElementById('showSignInBtn').classList.remove('active-form');
      document.getElementById('showSignUpBtn').classList.remove('active-form');
    });
    
    document.getElementById('doSignin')?.addEventListener('click', async () => {
      const email = document.getElementById('signinEmail')?.value;
      const pwd = document.getElementById('signinPassword')?.value;
      if (await signin(email, pwd)) navigateTo('account');
    });
    document.getElementById('doSignup')?.addEventListener('click', async () => {
      const name = document.getElementById('signupName')?.value;
      const email = document.getElementById('signupEmail')?.value;
      const pwd = document.getElementById('signupPassword')?.value;
      if (await signup(name, email, pwd)) {
        document.getElementById('showSignInBtn')?.click();
      }
    });
    document.getElementById('doReset')?.addEventListener('click', async () => {
      const email = document.getElementById('resetEmail')?.value;
      await resetPassword(email);
    });
    document.getElementById('logoutBtn')?.addEventListener('click', () => logout());
    document.getElementById('resetPasswordBtn')?.addEventListener('click', async () => {
      if (currentUser?.email) {
        await resetPassword(currentUser.email);
      }
    });
    
    const handleEnter = (e, action) => {
      if (e.key === 'Enter') action();
    };
    document.getElementById('signinEmail')?.addEventListener('keypress', (e) => handleEnter(e, () => document.getElementById('doSignin')?.click()));
    document.getElementById('signinPassword')?.addEventListener('keypress', (e) => handleEnter(e, () => document.getElementById('doSignin')?.click()));
    document.getElementById('signupEmail')?.addEventListener('keypress', (e) => handleEnter(e, () => document.getElementById('doSignup')?.click()));
    document.getElementById('signupPassword')?.addEventListener('keypress', (e) => handleEnter(e, () => document.getElementById('doSignup')?.click()));
    document.getElementById('resetEmail')?.addEventListener('keypress', (e) => handleEnter(e, () => document.getElementById('doReset')?.click()));
    
    if (page === 'home') {
      renderProductGrid('featuredGrid', PRODUCTS.filter(p => FEATURED_IDS.includes(p.id)));
    } else if (page === 'shop') {
      renderProductGrid('allProductsGrid', PRODUCTS);
    }
    
    updateCartUI();
    renderCartSidebar();
  }, 10);
}

// ---------- AUTH STATE LISTENER ----------
function initAuth() {
  auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (currentPage === 'account') {
      navigateTo('account');
    }
    updateCartUI();
  });
}

// ---------- INITIALIZE ----------
loadFromLocalStorage();
initAuth();
navigateTo('home');
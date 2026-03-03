if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/service-worker.js')
    .then((registration) => {
      console.log('Service Worker registered with scope:', registration.scope);
    })
    .catch((error) => {
      console.log('Service Worker registration failed:', error);
    });
}

// Simple cart implementation
const CART_STORAGE_KEY = 'bloom_blossom_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.warn('Could not parse cart from storage', e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

function calculateCartCount(cart) {
  return cart.reduce((sum, item) => sum + (item.qty || 0), 0);
}

function calculateCartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * (item.qty || 0), 0);
}

function renderCart(cart) {
  const countEl = document.querySelector('.cart-count');
  const itemsContainer = document.querySelector('.cart-items');
  const totalEl = document.querySelector('.cart-total-amount');

  if (!countEl || !itemsContainer || !totalEl) return;

  const itemCount = calculateCartCount(cart);
  countEl.textContent = itemCount.toString();

  itemsContainer.innerHTML = '';

  if (cart.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'cart-empty';
    empty.textContent = 'Your cart is empty.';
    itemsContainer.appendChild(empty);
  } else {
    cart.forEach((item) => {
      const row = document.createElement('div');
      row.className = 'cart-item';

      const details = document.createElement('div');
      details.className = 'cart-item-details';

      const nameEl = document.createElement('div');
      nameEl.className = 'cart-item-name';
      nameEl.textContent = item.name;

      const metaEl = document.createElement('div');
      metaEl.className = 'cart-item-meta';
      metaEl.textContent = `${item.emoji || ''} ${item.qty} × $${item.price.toFixed(2)}`;

      details.appendChild(nameEl);
      details.appendChild(metaEl);

      const priceEl = document.createElement('div');
      priceEl.className = 'cart-item-price';
      priceEl.textContent = `$${(item.price * item.qty).toFixed(2)}`;

      row.appendChild(details);
      row.appendChild(priceEl);

      itemsContainer.appendChild(row);
    });
  }

  const total = calculateCartTotal(cart);
  totalEl.textContent = `$${total.toFixed(2)}`;
}

function addProductToCart(product) {
  const cart = loadCart();
  const existing = cart.find((item) => item.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart(cart);
  renderCart(cart);
}

function initCart() {
  const cartToggle = document.getElementById('cart-toggle');
  const cartPanel = document.getElementById('cart-panel');
  const cartClose = document.querySelector('.cart-close');

  const cart = loadCart();
  renderCart(cart);

  if (cartToggle && cartPanel) {
    const toggle = () => {
      cartPanel.classList.toggle('open');
    };
    cartToggle.addEventListener('click', toggle);
  }

  if (cartClose && cartPanel) {
    cartClose.addEventListener('click', () => {
      cartPanel.classList.remove('open');
    });
  }

  document.addEventListener('click', (event) => {
    if (!cartPanel || !cartPanel.classList.contains('open')) return;
    const target = event.target;
    if (
      !cartPanel.contains(target) &&
      !(cartToggle && cartToggle.contains(target))
    ) {
      cartPanel.classList.remove('open');
    }
  });

  const addButtons = document.querySelectorAll('.btn-add-cart');
  addButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.product-card');
      if (!card) return;

      const nameEl = card.querySelector('.product-info h3');
      const priceEl = card.querySelector('.price');
      const emojiEl = card.querySelector('.product-image');

      if (!nameEl || !priceEl) return;

      const name = nameEl.textContent.trim();
      const priceText = priceEl.textContent.replace(/[^0-9.]/g, '');
      const price = parseFloat(priceText) || 0;
      const emoji = emojiEl ? emojiEl.textContent.trim() : '';

      const product = {
        id: name.toLowerCase().replace(/\s+/g, '-'),
        name,
        price,
        emoji,
      };

      addProductToCart(product);
      if (cartPanel && !cartPanel.classList.contains('open')) {
        cartPanel.classList.add('open');
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', initCart);

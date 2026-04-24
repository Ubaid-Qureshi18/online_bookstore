/* ═══════════════════════════════════════════════
   ARCANUM — Rare Books Digital Archive
   Main Application Logic (API-Connected)
   ═══════════════════════════════════════════════ */

const SERVER_BASE = (!window.location.hostname || ((window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') && window.location.port !== '3000'))
  ? 'http://localhost:3000'
  : window.location.origin;

const API_BASE = SERVER_BASE + '/api';

// ─── AUTH HELPERS ─────────────────────────────
function getToken() {
  return localStorage.getItem('arcanum_token');
}

function getUser() {
  const u = localStorage.getItem('arcanum_user');
  return u ? JSON.parse(u) : null;
}

function isLoggedIn() {
  return !!getToken();
}

function authHeaders() {
  const token = getToken();
  return token ? { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
}

async function apiFetch(url, options = {}) {
  try {
    const res = await fetch(API_BASE + url, {
      ...options,
      headers: { ...authHeaders(), ...(options.headers || {}) }
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  } catch (err) {
    console.error('API Error:', err.message);
    throw err;
  }
}

// ─── CART STATE ───────────────────────────────
let cart = JSON.parse(localStorage.getItem('arcanum_cart')) || [];

function saveCart() {
  localStorage.setItem('arcanum_cart', JSON.stringify(cart));
}

function addToCart(bookId) {
  if (cart.find(item => item.id === bookId)) return;
  // We need the book data from the page
  const bookEl = document.querySelector(`[data-book-id="${bookId}"]`);
  if (!bookEl) return;

  // Get book info from data attributes or from cached books
  const book = window._booksCache ? window._booksCache.find(b => b.id === bookId) : null;
  if (book) {
    cart.push({
      id: book.id,
      title: book.title,
      author: book.author,
      price: parseFloat(book.price),
      cover: book.cover_image_path ? (book.cover_image_path.startsWith('http') ? book.cover_image_path : `${SERVER_BASE}/${book.cover_image_path.startsWith('uploads/') ? book.cover_image_path : 'uploads/' + book.cover_image_path}`) : (BOOK_COVER_MAP[((book.id - 1) % 20) + 1] || FALLBACK_COVER)
    });
  } else {
    // fallback
    cart.push({ id: bookId, title: 'Book', author: '', price: 0, cover: '' });
  }

  saveCart();
  updateCartUI();
  showToast(`Added to cart`);

  // Update button state
  const btn = document.querySelector(`[data-book-id="${bookId}"]`);
  if (btn) {
    btn.classList.add('added');
    btn.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Added`;
  }
}

function removeFromCart(bookId) {
  cart = cart.filter(item => item.id !== bookId);
  saveCart();
  updateCartUI();
  const btn = document.querySelector(`[data-book-id="${bookId}"]`);
  if (btn) {
    btn.classList.remove('added');
    btn.innerHTML = `<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 01-8 0"></path></svg> Add to Cart`;
  }
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price, 0);
}

// ─── COVER IMAGE HELPERS ─────────────────────
// Thematically curated covers matched to each book's subject
const BOOK_COVER_MAP = {
  // Ancient Civilizations
  1:  'https://images.unsplash.com/photo-1562979314-bee7453e911c?w=600&h=800&fit=crop', // Gilgamesh — ancient Mesopotamian ruins
  2:  'https://images.unsplash.com/photo-1539650116574-8efeb43e2750?w=600&h=800&fit=crop', // Egyptian Book of Dead — Egyptian artifacts
  3:  'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&h=800&fit=crop', // Arthashastra — Taj Mahal / Indian heritage
  4:  'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=600&h=800&fit=crop', // Codex Mendoza — Mexican/Aztec art
  // Archaeological Texts
  5:  'https://images.unsplash.com/photo-1618053448492-2b629c2c912a?w=600&h=800&fit=crop', // Voynich — mysterious old manuscript
  6:  'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=600&h=800&fit=crop', // Indus Valley — archaeological excavation
  7:  'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?w=600&h=800&fit=crop', // Rongorongo — Easter Island moai
  8:  'https://images.unsplash.com/photo-1504457047772-27faf1c00561?w=600&h=800&fit=crop', // Popol Vuh — Maya pyramid ruins
  // Medical & Healing Arts
  9:  'https://images.unsplash.com/photo-1585521551237-aade4bbd7acb?w=600&h=800&fit=crop', // De Materia Medica — botanical herbs
  10: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=800&fit=crop', // Charaka Samhita — Ayurvedic herbs/spices
  11: 'https://images.unsplash.com/photo-1564399580075-5dfe19c205f0?w=600&h=800&fit=crop', // Canon of Medicine — Islamic geometric art
  12: 'https://images.unsplash.com/photo-1551076805-e1869033e561?w=600&h=800&fit=crop', // Sushruta Samhita — ancient medical/surgical
  // Occult Manuscripts
  13: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&h=800&fit=crop', // Key of Solomon — mystical old book
  14: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&h=800&fit=crop', // Picatrix — starry sky, astrology
  15: 'https://images.unsplash.com/photo-1553729784-e91953dec042?w=600&h=800&fit=crop', // Codex Gigas — dark gothic book
  16: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=600&h=800&fit=crop', // Ars Notoria — sacred geometry patterns
  // Forbidden Sciences
  17: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?w=600&h=800&fit=crop', // Vesalius — anatomical study
  18: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=800&fit=crop', // Copernicus — galaxy/cosmos
  19: 'https://images.unsplash.com/photo-1532693322450-2cb5c511067d?w=600&h=800&fit=crop', // Galileo — moon surface
  20: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&h=800&fit=crop'  // Von Guericke — science experiments
};

const COVER_IMAGES = {
  'Ancient Civilizations': 'https://images.unsplash.com/photo-1562979314-bee7453e911c?w=600&h=800&fit=crop',
  'Archaeological Texts': 'https://images.unsplash.com/photo-1566438480900-0609be27a4be?w=600&h=800&fit=crop',
  'Medical & Healing Arts': 'https://images.unsplash.com/photo-1585521551237-aade4bbd7acb?w=600&h=800&fit=crop',
  'Occult Manuscripts': 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=600&h=800&fit=crop',
  'Forbidden Sciences': 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=600&h=800&fit=crop'
};

const FALLBACK_COVER = 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=800&fit=crop';

function getBookCover(book) {
  // 1. Use uploaded cover from database if available
  if (book.cover_image_path) {
    return book.cover_image_path.startsWith('http') ? book.cover_image_path : `${SERVER_BASE}/${book.cover_image_path.startsWith('uploads/') ? book.cover_image_path : 'uploads/' + book.cover_image_path}`;
  }
  // 2. Use thematic cover matched to book ID
  const mappedId = ((book.id - 1) % 20) + 1; // wrap for IDs > 20
  return BOOK_COVER_MAP[mappedId] || FALLBACK_COVER;
}

function getCoverPlaceholder(category) {
  return COVER_IMAGES[category] || FALLBACK_COVER;
}

// ─── CART UI ──────────────────────────────────
function updateCartUI() {
  const badges = document.querySelectorAll('.cart-badge');
  badges.forEach(b => b.textContent = cart.length);

  const cartBody = document.getElementById('cart-body');
  if (!cartBody) return;

  if (cart.length === 0) {
    cartBody.innerHTML = `
      <div class="cart-empty">
        <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p>Your cart is empty</p>
      </div>`;
  } else {
    cartBody.innerHTML = cart.map(item => `
      <div class="cart-item">
        <img src="${item.cover}" alt="${item.title}" class="cart-item-cover" onerror="this.onerror=null;this.src='${FALLBACK_COVER}'">
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title}</div>
          <div class="cart-item-author">${item.author}</div>
          <div class="cart-item-price">₹${item.price.toLocaleString('en-IN')}</div>
          <button class="cart-item-remove" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
      </div>
    `).join('');
  }

  const totalEl = document.getElementById('cart-total');
  if (totalEl) totalEl.textContent = `₹${getCartTotal().toLocaleString('en-IN')}`;
}

// ─── CART SIDEBAR TOGGLE ─────────────────────
function openCart() {
  document.getElementById('cart-sidebar')?.classList.add('open');
  document.getElementById('cart-overlay')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-sidebar')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('active');
  document.body.style.overflow = '';
}

// ─── TOAST ───────────────────────────────────
function showToast(message) {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> ${message}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

// ─── RENDER HELPERS ──────────────────────────
function renderBookCard(book) {
  const inCart = cart.find(item => item.id === book.id);
  const rarityClass = book.rarity_level.toLowerCase().replace(/\s+/g, '-');
  const yearDisplay = book.year_published < 0 ? `${Math.abs(book.year_published)} BCE` : `${book.year_published} CE`;
  const cover = getBookCover(book);
  const catName = book.category_name || '';

  return `
    <article class="book-card">
      <div class="book-cover-wrap">
        <img src="${cover}" alt="${book.title}" class="book-cover" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_COVER}'">
        <span class="book-rarity-badge ${rarityClass}">${book.rarity_level}</span>
        <button class="book-preview-btn" onclick="window.location.href='book-detail.html?id=${book.id}'">View Details</button>
      </div>
      <div class="book-info">
        <div class="book-category-label">${catName}</div>
        <h3>${book.title}</h3>
        <p class="book-author">${book.author}</p>
        <div class="book-meta-row">
          <span class="book-meta-tag">${yearDisplay}</span>
          <span class="book-meta-tag">${book.language}</span>
          <span class="book-meta-tag">${book.origin_region || ''}</span>
        </div>
        <div class="book-footer">
          <div class="book-price">₹${parseFloat(book.price).toLocaleString('en-IN')} <small>Digital Access</small></div>
          <button class="add-cart-btn ${inCart ? 'added' : ''}" data-book-id="${book.id}" onclick="addToCart(${book.id})">
            ${inCart
              ? `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Added`
              : `<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 01-8 0"></path></svg> Add to Cart`
            }
          </button>
        </div>
      </div>
    </article>`;
}

function renderCategoryCard(cat) {
  return `
    <div class="category-card" onclick="window.location.href='books.html?category=${cat.slug}'">
      <span class="category-icon">${cat.icon_emoji}</span>
      <h3>${cat.name}</h3>
      <p>${cat.description}</p>
      <span class="category-count">${cat.book_count || 0} Volumes</span>
    </div>`;
}

// ─── PAGE: HOME ──────────────────────────────
async function initHome() {
  try {
    // Load categories
    const catData = await apiFetch('/books/categories');
    const catGrid = document.getElementById('category-grid');
    if (catGrid && catData.categories) {
      catGrid.innerHTML = catData.categories.map(renderCategoryCard).join('');
    }

    // Load featured books (first 6)
    const bookData = await apiFetch('/books?sort=newest');
    const featGrid = document.getElementById('featured-books');
    if (featGrid && bookData.books) {
      window._booksCache = bookData.books;
      // Pick one from each category for variety
      const featured = [];
      const seen = new Set();
      for (const b of bookData.books) {
        if (!seen.has(b.category_id) && featured.length < 6) {
          featured.push(b);
          seen.add(b.category_id);
        }
      }
      // Fill remainder
      for (const b of bookData.books) {
        if (featured.length >= 6) break;
        if (!featured.find(f => f.id === b.id)) featured.push(b);
      }
      featGrid.innerHTML = featured.map(renderBookCard).join('');
    }
  } catch (err) {
    console.error('Home init error:', err);
  }
}

// ─── PAGE: CATALOG ───────────────────────────
async function initCatalog() {
  const grid = document.getElementById('catalog-books');
  const resultsCount = document.getElementById('results-count');
  if (!grid) return;

  // Check URL params for pre-set filter
  const params = new URLSearchParams(window.location.search);
  const presetCategory = params.get('category');
  const presetSearch = params.get('search');

  let activeFilter = presetCategory || 'all';
  let searchTerm = presetSearch || '';

  // Set active pill
  if (presetCategory) {
    document.querySelectorAll('.filter-pill').forEach(pill => {
      pill.classList.remove('active');
      if (pill.dataset.filter === presetCategory) pill.classList.add('active');
    });
  }

  // Set search input
  const searchInput = document.getElementById('catalog-search');
  if (searchInput && searchTerm) {
    searchInput.value = searchTerm;
  }

  async function render(categorySlug, search) {
    try {
      let url = '/books?';
      if (categorySlug && categorySlug !== 'all') url += `category=${categorySlug}&`;
      if (search) url += `search=${encodeURIComponent(search)}&`;

      const data = await apiFetch(url);
      window._booksCache = data.books;

      grid.innerHTML = data.books.map(renderBookCard).join('');
      if (resultsCount) resultsCount.textContent = `Showing ${data.books.length} volumes`;

      if (data.books.length === 0) {
        grid.innerHTML = `<div style="text-align:center;padding:4rem;color:var(--ink-muted);grid-column:1/-1;">
          <p>No books found matching your criteria.</p>
        </div>`;
      }
    } catch (err) {
      grid.innerHTML = `<div style="text-align:center;padding:4rem;color:var(--ink-muted);grid-column:1/-1;">
        <p>Failed to load books. Please try again.</p>
      </div>`;
    }
  }

  render(activeFilter, searchTerm);

  // Filter pills
  document.querySelectorAll('.filter-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.filter-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      activeFilter = pill.dataset.filter;
      render(activeFilter, searchTerm);
    });
  });

  // Search
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        searchTerm = searchInput.value.trim();
        render(activeFilter, searchTerm);
      }, 400);
    });
  }
}

// ─── PAGE: BOOK DETAIL ──────────────────────
async function initBookDetail() {
  const params = new URLSearchParams(window.location.search);
  const bookId = parseInt(params.get('id'));

  if (!bookId) {
    document.getElementById('detail-content').innerHTML = '<p style="text-align:center;padding:4rem;">Book not found.</p>';
    return;
  }

  try {
    const data = await apiFetch(`/books/${bookId}`);
    const book = data.book;
    window._booksCache = [book];

    const inCart = cart.find(item => item.id === book.id);
    const yearDisplay = book.year_published < 0 ? `${Math.abs(book.year_published)} BCE` : `${book.year_published} CE`;
    const rarityClass = book.rarity_level.toLowerCase().replace(/\s+/g, '-');
    const cover = getBookCover(book);

    document.title = `${book.title} — Arcanum`;

    // Check if user owns this book
    let owned = false;
    if (isLoggedIn()) {
      try {
        const checkData = await apiFetch(`/my-library/check/${bookId}`);
        owned = checkData.owned;
      } catch (e) { /* ignore */ }
    }

    document.getElementById('detail-content').innerHTML = `
      <div class="detail-layout">
        <div class="detail-cover-wrap">
          <img src="${cover}" alt="${book.title}" class="detail-cover" onerror="this.onerror=null;this.src='${FALLBACK_COVER}'">
        </div>
        <div class="detail-info">
          <div class="book-category-label">${book.category_name || ''}</div>
          <h1>${book.title}</h1>
          <p class="detail-author">${book.author}</p>
          <div class="detail-meta">
            <div class="detail-meta-item"><strong>Rarity</strong> <span class="book-rarity-badge ${rarityClass}" style="position:static;display:inline-block;">${book.rarity_level}</span></div>
            <div class="detail-meta-item"><strong>Year</strong> ${yearDisplay}</div>
            <div class="detail-meta-item"><strong>Language</strong> ${book.language}</div>
            <div class="detail-meta-item"><strong>Origin</strong> ${book.origin_region || 'Unknown'}</div>
          </div>
          <p class="detail-desc">${book.description}</p>
          <div class="detail-price">₹${parseFloat(book.price).toLocaleString('en-IN')}</div>
          <p class="detail-price-note">One-time payment for permanent digital access</p>
          <div class="detail-actions">
            ${owned
              ? `<button class="btn btn-primary" onclick="readBook(${book.id})">
                  <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
                  Read Full Book
                </button>`
              : `<button class="btn btn-primary add-cart-btn ${inCart ? 'added' : ''}" data-book-id="${book.id}" onclick="handleBuyBook(${book.id})">
                  ${inCart
                    ? `<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Added to Cart`
                    : `<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 01-8 0"></path></svg> Unlock Full Book`
                  }
                </button>`
            }
            <button class="btn" onclick="previewBook(${book.id})">
              <svg viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              Preview ${book.preview_pages || 3} Pages
            </button>
          </div>
        </div>
      </div>`;
  } catch (err) {
    document.getElementById('detail-content').innerHTML = '<p style="text-align:center;padding:4rem;color:var(--ink-muted);">Book not found or server error.</p>';
  }
}

// ─── PAYMENT MODAL ──────────────────────────
let _paymentPendingItems = []; // items to purchase after payment

function createPaymentModal() {
  if (document.getElementById('payment-modal')) return;
  const modal = document.createElement('div');
  modal.id = 'payment-modal';
  modal.className = 'payment-modal-overlay';
  modal.innerHTML = `
    <div class="payment-modal">
      <div class="payment-header">
        <h2>Payment Details</h2>
        <button class="payment-close" onclick="closePaymentModal()">&times;</button>
      </div>
      <div class="payment-body">
        <div class="payment-summary" id="payment-summary"></div>
        <form id="payment-form" onsubmit="return processPayment(event)">
          <div class="payment-cards-strip">
            <span class="card-brand">💳 Credit / Debit Card</span>
            <div class="card-logos">
              <span>VISA</span><span>MC</span><span>RuPay</span>
            </div>
          </div>
          <div class="pf-group">
            <label for="pf-name">Cardholder Name</label>
            <input type="text" id="pf-name" placeholder="Name on card" required autocomplete="cc-name">
          </div>
          <div class="pf-group">
            <label for="pf-card">Card Number</label>
            <input type="text" id="pf-card" placeholder="1234  5678  9012  3456" maxlength="19" required autocomplete="cc-number" inputmode="numeric">
          </div>
          <div class="pf-row">
            <div class="pf-group">
              <label for="pf-expiry">Expiry Date</label>
              <input type="text" id="pf-expiry" placeholder="MM / YY" maxlength="7" required autocomplete="cc-exp">
            </div>
            <div class="pf-group">
              <label for="pf-cvv">CVV</label>
              <input type="password" id="pf-cvv" placeholder="•••" maxlength="4" required autocomplete="cc-csc" inputmode="numeric">
            </div>
          </div>
          <div class="pf-group">
            <label for="pf-email">Email for Receipt</label>
            <input type="email" id="pf-email" placeholder="you@email.com" required>
          </div>
          <div class="payment-demo-note">
            <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Demo Mode — No real charges. Enter any valid-format card details.</span>
          </div>
          <button type="submit" class="btn btn-primary payment-submit-btn" id="payment-submit-btn">
            <svg viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
            Pay <span id="payment-amount">₹0</span>
          </button>
        </form>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  // Card number formatting (add spaces every 4 digits)
  document.getElementById('pf-card').addEventListener('input', function(e) {
    let v = this.value.replace(/\D/g, '').substring(0, 16);
    this.value = v.replace(/(\d{4})(?=\d)/g, '$1  ');
  });

  // Expiry formatting (MM / YY)
  document.getElementById('pf-expiry').addEventListener('input', function(e) {
    let v = this.value.replace(/\D/g, '').substring(0, 4);
    if (v.length >= 2) v = v.substring(0, 2) + ' / ' + v.substring(2);
    this.value = v;
  });

  // CVV - numbers only
  document.getElementById('pf-cvv').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '').substring(0, 4);
  });

  // Pre-fill email if logged in
  const user = getUser();
  if (user && user.email) {
    document.getElementById('pf-email').value = user.email;
  }
}

function openPaymentModal(items, totalAmount) {
  createPaymentModal();
  _paymentPendingItems = items;

  // Update summary
  const summaryEl = document.getElementById('payment-summary');
  summaryEl.innerHTML = items.map(item => `
    <div class="payment-item">
      <span>${item.title}</span>
      <span>₹${item.price ? item.price.toLocaleString('en-IN') : '0'}</span>
    </div>
  `).join('') + `
    <div class="payment-total">
      <span>Total</span>
      <span>₹${totalAmount.toLocaleString('en-IN')}</span>
    </div>
  `;

  document.getElementById('payment-amount').textContent = `₹${totalAmount.toLocaleString('en-IN')}`;
  document.getElementById('payment-modal').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
  const modal = document.getElementById('payment-modal');
  if (modal) modal.classList.remove('active');
  document.body.style.overflow = '';
  _paymentPendingItems = [];
}

async function processPayment(e) {
  e.preventDefault();

  // Validate card
  const cardNum = document.getElementById('pf-card').value.replace(/\s/g, '');
  const expiry = document.getElementById('pf-expiry').value.replace(/\s/g, '');
  const cvv = document.getElementById('pf-cvv').value;
  const name = document.getElementById('pf-name').value.trim();

  if (cardNum.length < 13) { showToast('Please enter a valid card number'); return false; }
  if (expiry.length < 4) { showToast('Please enter a valid expiry date'); return false; }
  if (cvv.length < 3) { showToast('Please enter a valid CVV'); return false; }
  if (name.length < 2) { showToast('Please enter the cardholder name'); return false; }

  const btn = document.getElementById('payment-submit-btn');
  btn.innerHTML = '<span class="spinner"></span> Processing Payment...';
  btn.disabled = true;

  // Simulate payment processing delay
  await new Promise(r => setTimeout(r, 1500));

  // Process all pending items
  let successCount = 0;
  for (const item of _paymentPendingItems) {
    try {
      const orderData = await apiFetch('/orders/create', {
        method: 'POST',
        body: JSON.stringify({ book_id: item.id })
      });

      if (orderData.demo_mode) {
        await apiFetch('/orders/verify', {
          method: 'POST',
          body: JSON.stringify({
            order_id: orderData.order_id,
            payment_id: orderData.payment_id
          })
        });
        successCount++;
      }
    } catch (err) {
      console.error(`Payment for ${item.title} failed:`, err.message);
    }
  }

  if (successCount > 0) {
    // Show success state
    btn.innerHTML = '<svg viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12"></polyline></svg> Payment Successful!';
    btn.classList.add('success');

    // Clear cart
    cart = cart.filter(c => !_paymentPendingItems.find(p => p.id === c.id));
    saveCart();
    updateCartUI();
    closeCart();

    showToast(`${successCount} book(s) unlocked!`);

    setTimeout(() => {
      closePaymentModal();
      window.location.href = 'library.html';
    }, 1500);
  } else {
    btn.innerHTML = 'Payment Failed — Retry';
    btn.disabled = false;
    showToast('Payment failed. Please try again.');
  }

  return false;
}

// ─── BUY / UNLOCK BOOK ──────────────────────
async function handleBuyBook(bookId) {
  if (!isLoggedIn()) {
    showToast('Please sign in to purchase');
    setTimeout(() => window.location.href = 'login.html', 800);
    return;
  }

  // Get the book details
  const book = window._booksCache ? window._booksCache.find(b => b.id === bookId) : null;
  const item = book ? { id: book.id, title: book.title, price: parseFloat(book.price) } : { id: bookId, title: 'Book', price: 0 };

  openPaymentModal([item], item.price);
}

// ─── PREVIEW BOOK ───────────────────────────
function previewBook(bookId) {
  window.open(`${API_BASE}/books/${bookId}/preview`, '_blank');
}

// ─── READ FULL BOOK (owned) ─────────────────
async function readBook(bookId) {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return;
  }

  try {
    const data = await apiFetch(`/my-library/read/${bookId}`);
    if (data.access_token) {
      window.open(`${API_BASE}/my-library/pdf/${data.access_token}`, '_blank');
    }
  } catch (err) {
    showToast('Failed to access book. Please try again.');
  }
}

// ─── CHECKOUT HANDLER ───────────────────────
async function handleCheckout() {
  if (!isLoggedIn()) {
    closeCart();
    window.location.href = 'login.html';
    return;
  }

  if (cart.length === 0) {
    showToast('Your cart is empty');
    return;
  }

  closeCart();
  const items = cart.map(c => ({ id: c.id, title: c.title, price: c.price }));
  const total = getCartTotal();
  openPaymentModal(items, total);
}

// ─── NAV UPDATE ─────────────────────────────
function updateNav() {
  const navLinks = document.querySelector('.nav-links');
  if (!navLinks) return;

  const user = getUser();
  if (user) {
    // Replace Sign In with My Library and user name
    const signInLink = navLinks.querySelector('a[href="login.html"]');
    if (signInLink) {
      signInLink.textContent = 'My Library';
      signInLink.href = 'library.html';
    }
  }
}

// ─── MOBILE NAV TOGGLE ─────────────────────
function initMobileNav() {
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('show-mobile');
    });
  }
}

// ─── GLOBAL INIT ─────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  updateNav();
  initMobileNav();

  // Cart open/close
  document.getElementById('cart-trigger')?.addEventListener('click', openCart);
  document.getElementById('cart-close')?.addEventListener('click', closeCart);
  document.getElementById('cart-overlay')?.addEventListener('click', closeCart);

  // Checkout button
  const checkoutBtn = document.querySelector('.cart-checkout-btn');
  if (checkoutBtn) {
    checkoutBtn.onclick = handleCheckout;
  }

  // Check which page and init
  const page = document.body.dataset.page;
  if (page === 'home') initHome();
  if (page === 'catalog') initCatalog();
  if (page === 'detail') initBookDetail();
});


const API_BASE = '';

/* -------------------------------------------------------------------------
   STATE
   ------------------------------------------------------------------------- */
const state = {
    user: null,
    currentPage: 0,
    pageSize: 12,
    search: '',
    category: '',
    products: [],
    cart: [],
    totalPages: 0,
    totalElements: 0,

    // Thêm
    suggestions: [],
};
/* -------------------------------------------------------------------------
   API LAYER
   Mọi endpoint bám sát đúng OpenAPI spec đã cung cấp:
   - POST /auth/register        body: {username,password,fullName,email,role} -> string (token)
   - POST /auth/login           body: {username,password}                     -> string (token)
   - GET  /api/products         ?page&size                                    -> PageProduct
   - GET  /api/products/{id}                                                  -> Product
   - GET  /api/products/search  ?name&page&size                               -> PageProduct
   - GET  /api/products/category/{category} ?page&size                       -> PageProduct
   - POST /api/cart/add         ?username&productId   (QUERY PARAM, no body) -> string
   - GET  /api/cart             ?username                                    -> array
   - POST /api/cart/update      ?cartId&quantity       (QUERY PARAM)         -> string
   - DELETE /api/cart/delete    ?cartId                                      -> string
   ------------------------------------------------------------------------- */

async function apiCall(endpoint, options = {}) {
    const method = options.method || 'GET';
    console.log(`📡 ${method} ${API_BASE}${endpoint}`);

    const res = await fetch(`${API_BASE}${endpoint}`, {
        headers: options.body ? { 'Content-Type': 'application/json' } : {},
        ...options,
    });

    console.log(`  ↳ status ${res.status}`);

    if (!res.ok) {
        let detail = '';
        try { detail = await res.text(); } catch (_) {}
        throw new Error(`HTTP ${res.status}${detail ? ' — ' + detail : ''}`);
    }

    // Một số endpoint (auth, cart/add, cart/update, cart/delete) trả về text thuần,
    // không phải JSON — nên đọc dạng text rồi thử parse JSON nếu có thể.
    const raw = await res.text();
    if (!raw) return null;
    try {
        return JSON.parse(raw);
    } catch (_) {
        return raw; // trả string thô (token, message...)
    }
}

/* ---- Auth --------------------------------------------------------------- */
async function apiLogin(username, password) {
    return apiCall('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
    });
}

async function apiRegister(username, password, email, fullName) {
    return apiCall('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password, email, fullName }),
    });
}

/* ---- Products ------------------------------------------------------------ */
async function apiListProducts(page, size) {
    return apiCall(`/api/products?page=${page}&size=${size}`);
}

async function apiSearchProducts(name, page, size) {
    return apiCall(`/api/products/search?name=${encodeURIComponent(name)}&page=${page}&size=${size}`);
}
async function fetchSuggestions(keyword) {

    keyword = keyword.trim();

    if (keyword.length < 2) {
        state.suggestions = [];
        renderSuggestions();
        return;
    }

    try {

        const data = await apiSearchProducts(keyword, 0, 5);

        state.suggestions = data.content || [];

        renderSuggestions();

    } catch (e) {

        console.error(e);

    }

}
function renderSuggestions() {

    const box = document.getElementById("search-suggestions");

    if (!box) return;

    if (state.suggestions.length === 0) {

        box.style.display = "none";
        box.innerHTML = "";

        return;

    }

    box.innerHTML = state.suggestions.map(product => `

        <div class="suggestion-item"
             onclick="chooseSuggestion('${product.name.replace(/'/g,"\\'")}')">

            🔍 ${escapeHtml(product.name)}

        </div>

    `).join("");

    box.style.display = "block";

}
function chooseSuggestion(name) {

    document.querySelector('input[type="search"]').value = name;

    state.search = name;

    document.getElementById("search-suggestions").style.display = "none";

    submitSearch();

}

async function apiProductsByCategory(category, page, size) {
    return apiCall(`/api/products/category/${encodeURIComponent(category)}?page=${page}&size=${size}`);
}

async function apiGetProduct(id) {
    return apiCall(`/api/products/${id}`);
}

/* ---- Cart (QUERY PARAMS — không gửi JSON body) --------------------------- */
async function apiAddToCart(username, productId) {
    const params = new URLSearchParams({ username, productId });
    return apiCall(`/api/cart/add?${params}`, { method: 'POST' });
}

async function apiGetCart(username) {
    const params = new URLSearchParams({ username });
    return apiCall(`/api/cart?${params}`);
}

async function apiUpdateCartQty(cartId, quantity) {
    const params = new URLSearchParams({ cartId, quantity });
    return apiCall(`/api/cart/update?${params}`, { method: 'POST' });
}

async function apiDeleteFromCart(cartId) {
    const params = new URLSearchParams({ cartId });
    return apiCall(`/api/cart/delete?${params}`, { method: 'DELETE' });
}

/* -------------------------------------------------------------------------
   ACTIONS (kết hợp API + cập nhật state + render)
   ------------------------------------------------------------------------- */

async function login(username, password) {
    try {
        const token = await apiLogin(username, password);
        if (!token) throw new Error('Không nhận được token');
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ username }));
        state.user = { username };
        showToast('Đăng nhập thành công', `Xin chào ${username}`, 'ok');
        return true;
    } catch (err) {
        console.error('Login error:', err);
        showAuthError('Sai tên đăng nhập hoặc mật khẩu');
        return false;
    }
}

async function register(username, password, email, fullName) {
    try {
        await apiRegister(username, password, email, fullName);
        showToast('Đăng ký thành công', 'Vui lòng đăng nhập', 'ok');
        return true;
    } catch (err) {
        console.error('Register error:', err);
        showAuthError('Đăng ký thất bại — tên đăng nhập có thể đã tồn tại');
        return false;
    }
}

async function loadProducts() {
    try {
        let data;
        if (state.search) {
            data = await apiSearchProducts(state.search, state.currentPage, state.pageSize);
        } else if (state.category) {
            data = await apiProductsByCategory(state.category, state.currentPage, state.pageSize);
        } else {
            data = await apiListProducts(state.currentPage, state.pageSize);
        }

        state.products = data?.content || [];
        state.totalPages = data?.totalPages || 0;
        state.totalElements = data?.totalElements || 0;

        renderCatalog();
        renderPagination();
        updateResultMeta();
    } catch (err) {
        console.error('Load products error:', err);
        showToast('Không tải được sản phẩm', err.message, 'err');
        state.products = [];
        renderCatalog();
    }
}

async function addToCart(productId) {
    if (!state.user) {
        openModal();
        switchAuthTab('login');
        showToast('Cần đăng nhập', 'Vui lòng đăng nhập để thêm vào giỏ', 'info');
        return;
    }

    try {
        await apiAddToCart(state.user.username, productId);
        await loadCart();
        showToast('Đã thêm vào giỏ', '', 'ok');
    } catch (err) {
        console.error('Add to cart error:', err);
        showToast('Không thể thêm vào giỏ', err.message, 'err');
    }
}

async function loadCart() {
    if (!state.user) return;
    try {
        const cart = await apiGetCart(state.user.username);
        state.cart = Array.isArray(cart) ? cart : [];
        updateCartBadge();
        renderCart();
    } catch (err) {
        console.error('Load cart error:', err);
        state.cart = [];
        updateCartBadge();
        renderCart();
    }
}

async function updateCartQty(cartId, quantity) {
    if (quantity < 1) {
        await removeFromCart(cartId);
        return;
    }
    try {
        await apiUpdateCartQty(cartId, quantity);
        await loadCart();
    } catch (err) {
        console.error('Update cart error:', err);
        showToast('Không cập nhật được số lượng', err.message, 'err');
    }
}

async function removeFromCart(cartId) {
    try {
        await apiDeleteFromCart(cartId);
        await loadCart();
        showToast('Đã xóa sản phẩm', '', 'ok');
    } catch (err) {
        console.error('Remove from cart error:', err);
        showToast('Không xóa được sản phẩm', err.message, 'err');
    }
}

/* -------------------------------------------------------------------------
   RENDERING
   ------------------------------------------------------------------------- */
function renderCatalog() {
    const grid = document.querySelector('.grid');
    if (!grid) return;

    if (!state.products || state.products.length === 0) {
        grid.innerHTML = `
      <div style="grid-column:1/-1;" class="empty">
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
        </svg>
        <h3>Không tìm thấy sản phẩm</h3>
        <p>Thử từ khóa khác hoặc kiểm tra kết nối API</p>
      </div>`;
        return;
    }

    grid.innerHTML = state.products.map((p, i) => `
    <div class="product-card" style="animation-delay:${i * 40}ms">
      <div class="card-media">
        ${p.imageUrl ? `<img src="${p.imageUrl}" alt="${escapeHtml(p.name)}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'ph',textContent:'${escapeHtml((p.name || '?').charAt(0).toUpperCase())}'}))">` : `<div class="ph">${escapeHtml((p.name || '?').charAt(0).toUpperCase())}</div>`}
        <div class="corners"></div>
        <span class="card-cat">${escapeHtml(p.category || 'N/A')}</span>
      </div>
      <div class="card-body">
        <div class="card-brand">${escapeHtml(p.brand || '—')}</div>
        <h3 class="card-name">${escapeHtml(p.name || '')}</h3>
        <div class="card-meta">
          <div class="stars" style="--r:${p.rating || 0}">
            <span class="rate-num">${(p.rating || 0).toFixed(1)}</span>
          </div>
          <div class="sold">${p.sold || 0} đã bán</div>
        </div>
        <div class="card-foot">
          <div class="price">${(p.price || 0).toLocaleString('vi-VN')}đ</div>
          <button type="button" class="add-btn" onclick="addToCart(${p.id})" title="Thêm vào giỏ">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

function renderPagination() {
    const pager = document.querySelector('.pager');
    if (!pager) return;

    if (state.totalPages <= 1) { pager.innerHTML = ''; return; }

    let html = '';
    if (state.currentPage > 0) html += `<button type="button" onclick="goPage(${state.currentPage - 1})">&lt;</button>`;

    const start = Math.max(0, state.currentPage - 1);
    const end = Math.min(state.totalPages, state.currentPage + 2);

    if (start > 0) html += `<button type="button" onclick="goPage(0)">1</button>`;
    if (start > 1) html += `<span class="dots">…</span>`;
    for (let i = start; i < end; i++) {
        html += `<button type="button" class="${i === state.currentPage ? 'active' : ''}" onclick="goPage(${i})">${i + 1}</button>`;
    }
    if (end < state.totalPages - 1) html += `<span class="dots">…</span>`;
    if (end < state.totalPages) html += `<button type="button" onclick="goPage(${state.totalPages - 1})">${state.totalPages}</button>`;
    if (state.currentPage < state.totalPages - 1) html += `<button type="button" onclick="goPage(${state.currentPage + 1})">&gt;</button>`;

    pager.innerHTML = html;
}

function renderCart() {
    const cartItems = document.querySelector('.cart-items');
    const cartEmpty = document.querySelector('.cart-empty');
    if (!cartItems) return;

    if (!state.cart || state.cart.length === 0) {
        cartItems.style.display = 'none';
        if (cartEmpty) cartEmpty.style.display = 'flex';
        updateCartTotal();
        return;
    }

    cartItems.style.display = 'flex';
    if (cartEmpty) cartEmpty.style.display = 'none';

    cartItems.innerHTML = state.cart.map(item => {
        // Backend trả cấu trúc cart item chưa được đặc tả rõ (schema là object tự do).
        // Cố gắng đọc theo các field phổ biến, fallback an toàn nếu thiếu.
        const product = item.product || item;
        const name = product.name || item.productName || 'Sản phẩm';
        const price = product.price ?? item.price ?? 0;
        const qty = item.quantity ?? 1;
        const cartId = item.id ?? item.cartId;

        return `
      <div class="cart-item">
        <div class="thumb">${escapeHtml((name || '?').charAt(0).toUpperCase())}</div>
        <div class="ci-body">
          <div class="ci-name">${escapeHtml(name)}</div>
          <div class="ci-price">${Number(price).toLocaleString('vi-VN')}đ</div>
          <div class="ci-foot">
            <div class="stepper">
              <button type="button" onclick="updateCartQty(${cartId}, ${qty - 1})">−</button>
              <div class="qty">${qty}</div>
              <button type="button" onclick="updateCartQty(${cartId}, ${qty + 1})">+</button>
            </div>
            <button type="button" class="ci-remove" onclick="removeFromCart(${cartId})">
              <svg fill="currentColor" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              Xóa
            </button>
          </div>
        </div>
      </div>`;
    }).join('');

    updateCartTotal();
}

function updateCartBadge() {
    const badge = document.querySelector('.cart-badge');
    if (!badge) return;
    const count = state.cart.length;
    if (count > 0) { badge.textContent = count; badge.classList.add('show'); }
    else { badge.classList.remove('show'); }
}

function updateCartTotal() {
    const subtotal = state.cart.reduce((sum, item) => {
        const product = item.product || item;
        const price = product.price ?? item.price ?? 0;
        const qty = item.quantity ?? 1;
        return sum + (Number(price) * Number(qty));
    }, 0);
    const totalEl = document.querySelector('.subtotal-row .val');
    if (totalEl) totalEl.textContent = subtotal.toLocaleString('vi-VN') + 'đ';
}

function updateResultMeta() {
    const meta = document.querySelector('.result-meta');
    const statEl = document.getElementById('statProducts');
    if (statEl) statEl.textContent = state.totalElements.toLocaleString('vi-VN');
    if (!meta) return;
    if (state.totalElements === 0) {
        meta.innerHTML = `Không có sản phẩm nào`;
        return;
    }
    const from = state.currentPage * state.pageSize + 1;
    const to = Math.min((state.currentPage + 1) * state.pageSize, state.totalElements);
    meta.innerHTML = `Hiển thị <b>${from}</b>–<b>${to}</b> của <b>${state.totalElements}</b> sản phẩm`;
}

function updateFilterPill() {
    const pill = document.querySelector('.filter-pill');
    if (!pill) return;
    if (state.search) {
        pill.classList.add('show');
        pill.innerHTML = `"${escapeHtml(state.search)}" <button type="button" onclick="clearSearch()">✕</button>`;
    } else if (state.category) {
        pill.classList.add('show');
        pill.innerHTML = `Danh mục: <b>${escapeHtml(state.category)}</b> <button type="button" onclick="clearCategory()">✕</button>`;
    } else {
        pill.classList.remove('show');
    }
}

function escapeHtml(str) {
    return String(str ?? '').replace(/[&<>"']/g, s => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[s]));
}

/* -------------------------------------------------------------------------
   UI INTERACTIONS
   ------------------------------------------------------------------------- */
function goPage(page) {
    state.currentPage = page;
    loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function clearSearch() {
    state.search = '';
    state.currentPage = 0;
    const input = document.querySelector('input[type="search"]');
    if (input) input.value = '';
    updateFilterPill();
    loadProducts();
}

function clearCategory() {
    state.category = '';
    state.currentPage = 0;
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    updateFilterPill();
    loadProducts();
}

function filterByCategory(cat) {
    state.category = (cat === state.category) ? '' : cat;
    state.currentPage = 0;
    state.search = '';
    const input = document.querySelector('input[type="search"]');
    if (input) input.value = '';
    document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.textContent.trim() === cat && state.category !== ''));
    updateFilterPill();
    loadProducts();
}

function submitSearch() {
    const input = document.querySelector('input[type="search"]');
    state.search = input ? input.value.trim() : '';
    state.currentPage = 0;
    state.category = '';
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    updateFilterPill();
    loadProducts();
}

function toggleCart() {
    const drawer = document.getElementById('drawer');
    if (!drawer) return;
    drawer.classList.contains('open') ? closeDrawer() : openDrawer();
}

function openDrawer() {
    document.getElementById('drawer')?.classList.add('open');
    document.getElementById('backdrop')?.classList.add('show');
    document.body.classList.add('locked');
    if (state.user) loadCart();
}

function closeDrawer() {
    document.getElementById('drawer')?.classList.remove('open');
    document.getElementById('backdrop')?.classList.remove('show');
    document.body.classList.remove('locked');
}

function toggleAccountMenu() {
    document.querySelector('.account-menu')?.classList.toggle('open');
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    state.user = null;
    state.cart = [];
    updateCartBadge();
    renderCart();
    document.querySelector('.account-menu')?.classList.remove('open');
    showToast('Đã đăng xuất', '', 'ok');
    setTimeout(() => location.reload(), 400);
}

function openModal() {
    document.getElementById('modal')?.classList.add('open');
    document.getElementById('backdrop')?.classList.add('show');
    document.body.classList.add('locked');
}

function closeModal() {
    document.getElementById('modal')?.classList.remove('open');
    document.getElementById('backdrop')?.classList.remove('show');
    document.body.classList.remove('locked');
}

function switchAuthTab(tab) {
    const loginTab = document.querySelector('[data-tab="login"]');
    const registerTab = document.querySelector('[data-tab="register"]');
    const loginForm = document.querySelector('[data-form="login"]');
    const registerForm = document.querySelector('[data-form="register"]');
    const authError = document.querySelector('.auth-error');

    loginTab?.classList.remove('active');
    registerTab?.classList.remove('active');
    if (loginForm) loginForm.style.display = 'none';
    if (registerForm) registerForm.style.display = 'none';

    if (tab === 'login') {
        loginTab?.classList.add('active');
        if (loginForm) loginForm.style.display = 'block';
    } else {
        registerTab?.classList.add('active');
        if (registerForm) registerForm.style.display = 'block';
    }
    authError?.classList.remove('show');
}

function showAuthError(msg) {
    const err = document.querySelector('.auth-error');
    if (err) { err.textContent = msg; err.classList.add('show'); }
}

function showToast(title, msg, type = 'ok') {
    const toasts = document.querySelector('.toasts');
    if (!toasts) return;
    const icon = type === 'err' ? '⚠' : type === 'info' ? 'ℹ' : '✓';
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `
    <svg fill="currentColor" viewBox="0 0 24 24"><text x="0" y="20" font-size="24">${icon}</text></svg>
    <div><div class="t-title">${escapeHtml(title)}</div>${msg ? `<div class="t-msg">${escapeHtml(msg)}</div>` : ''}</div>`;
    toasts.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 300); }, 3500);
}

/* ---- Form handlers (gọi trực tiếp từ onsubmit trong HTML) --------------- */
async function handleLoginSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    const ok = await login(fd.get('username'), fd.get('password'));
    if (ok) {
        closeModal();
        updateAccountUI();
        await loadCart();
    }
}

async function handleRegisterSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.target);
    if (fd.get('password') !== fd.get('confirm')) {
        showAuthError('Mật khẩu không khớp');
        return;
    }
    const ok = await register(fd.get('username'), fd.get('password'), fd.get('email'), fd.get('fullName'));
    if (ok) switchAuthTab('login');
}

function updateAccountUI() {
    const nameEl = document.querySelector('.account-menu .who .name');
    const roleEl = document.querySelector('.account-menu .who .role');
    const loginItem = document.querySelector('[data-menu="login"]');
    if (state.user) {
        if (nameEl) nameEl.textContent = state.user.username;
        if (roleEl) roleEl.textContent = 'Đã đăng nhập';
        if (loginItem) loginItem.style.display = 'none';
    } else {
        if (nameEl) nameEl.textContent = 'Khách';
        if (roleEl) roleEl.textContent = 'Chưa đăng nhập';
        if (loginItem) loginItem.style.display = 'flex';
    }
}

/* -------------------------------------------------------------------------
   EVENT SETUP (chỉ cho các phần tử KHÔNG dùng inline onclick)
   ------------------------------------------------------------------------- */
function setupEventListeners() {

    const searchInput = document.querySelector('input[type="search"]');

    let debounceTimer;

    if (searchInput) {

        searchInput.addEventListener('input', (e) => {

            const keyword = e.target.value.trim();

            const clear = document.querySelector('.search-clear');

            if (clear) {
                clear.style.display = keyword ? 'inline-flex' : 'none';
            }

            clearTimeout(debounceTimer);

            debounceTimer = setTimeout(() => {

                fetchSuggestions(keyword);

            }, 300);

        });

        searchInput.addEventListener('keydown', (e) => {

            if (e.key === 'Enter') {

                const box = document.getElementById("search-suggestions");

                if (box) {
                    box.style.display = "none";
                }

                submitSearch();

            }

        });

        searchInput.addEventListener("blur", () => {

            setTimeout(() => {

                const box = document.getElementById("search-suggestions");

                if (box) {
                    box.style.display = "none";
                }

            }, 200);

        });

        searchInput.addEventListener("focus", () => {

            if (state.suggestions.length > 0) {

                renderSuggestions();

            }

        });

    }

}

    const backdrop = document.getElementById('backdrop');
    if (backdrop) {
        backdrop.addEventListener('click', () => {
            const drawer = document.getElementById('drawer');
            const modal = document.getElementById('modal');
            if (drawer?.classList.contains('open')) closeDrawer();
            else if (modal?.classList.contains('open')) closeModal();
        });
    }

    document.addEventListener('click', (e) => {
        const menu = document.querySelector('.account-menu');
        const accountBtn = document.querySelector('.account-btn');
        if (menu && menu.classList.contains('open') && !menu.contains(e.target) && !accountBtn.contains(e.target)) {
            menu.classList.remove('open');
        }
    });


/* -------------------------------------------------------------------------
   INIT
   ------------------------------------------------------------------------- */
async function init() {
    console.log('════════════════════════════════════');
    console.log('🚀 VOLT App — API:', API_BASE);
    console.log('════════════════════════════════════');

    const stored = localStorage.getItem('user');
    if (stored) {
        try { state.user = JSON.parse(stored); } catch (_) { localStorage.removeItem('user'); }
    }

    setupEventListeners();
    updateAccountUI();
    await loadProducts();
    if (state.user) await loadCart();

    console.log('✓ App ready');
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
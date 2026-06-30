const BASE_URL = '';
let activeProductId = null;
let activeCategory = 'All';

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('login-form').addEventListener('submit', login);
    document.getElementById('register-form').addEventListener('submit', register);
    document.getElementById('show-register').addEventListener('click', (event) => {
        event.preventDefault();
        showRegisterForm();
    });
    document.getElementById('show-login').addEventListener('click', (event) => {
        event.preventDefault();
        showLoginForm();
    });
    document.getElementById('logout-button').addEventListener('click', showLoginForm);
    document.getElementById('search-button').addEventListener('click', () => {
        loadProducts(activeCategory, document.getElementById('search-input').value);
    });
    document.getElementById('back-to-grid').addEventListener('click', () => {
        document.getElementById('detail-view').style.display = 'none';
        document.getElementById('product-grid').style.display = 'grid';
    });
    loadProducts('All', '');
    document.getElementById('add-cart-button').addEventListener('click', async () => {
        if (activeProductId) {
            await addCartItem(activeProductId);
        }
    });
    document.getElementById('buy-now-button').addEventListener('click', () => {
        if (activeProductId) {
            alert('Tính năng mua ngay chưa được hỗ trợ trong bản demo.');
        }
    });

    document.getElementById('product-grid').addEventListener('click', (event) => {
        const card = event.target.closest('.product-card');
        if (!card) return;
        const productId = card.dataset.productId;
        if (productId) {
            loadProductDetail(productId);
        }
    });

    document.querySelectorAll('.category-button').forEach((button) => {
        button.addEventListener('click', () => {
            document.querySelectorAll('.category-button').forEach((btn) => btn.classList.remove('active'));
            button.classList.add('active');
            activeCategory = button.dataset.category;
            loadProducts(activeCategory, document.getElementById('search-input').value);
        });
    });

    setupEnterToNextInput('login-form');
    setupEnterToNextInput('register-form');
});

function showLoginForm() {
    document.getElementById('login-form').style.display = 'block';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('main-screen').style.display = 'none';
    setMessage('');
    document.getElementById('login-form').reset();
    document.getElementById('login-username').focus();
}

function showRegisterForm() {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'block';
    document.getElementById('main-screen').style.display = 'none';
    setMessage('');
    document.getElementById('register-form').reset();
    document.getElementById('reg-username').focus();
}

function showMainScreen(username) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('main-screen').style.display = 'block';
    document.getElementById('welcome-message').innerText = `Xin chào, ${username}`;
    document.getElementById('search-input').value = '';
    activeCategory = 'All';
    document.querySelectorAll('.category-button').forEach((button) => {
        button.classList.toggle('active', button.dataset.category === 'All');
    });
    setMessage('');
    loadProducts('All', '');
}

async function register(event) {
    event.preventDefault();

    const userData = {
        username: document.getElementById('reg-username').value.trim(),
        password: document.getElementById('reg-password').value.trim(),
        fullName: document.getElementById('reg-fullname').value.trim(),
        email: document.getElementById('reg-email').value.trim(),
        role: 'USER'
    };

    if (!userData.username || !userData.password || !userData.fullName || !userData.email) {
        setMessage('Không được để trống các trường');
        return;
    }

    try {
        const message = await postJson('/auth/register', userData);
        if (message === 'Đăng ký thành công') {
            alert(message);
            showLoginForm();
            return;
        }
        setMessage(message);
    } catch (error) {
        setMessage('Không thể kết nối máy chủ');
    }
}

async function login(event) {
    event.preventDefault();

    const userData = {
        username: document.getElementById('login-username').value.trim(),
        password: document.getElementById('login-password').value.trim()
    };

    if (!userData.username || !userData.password) {
        setMessage('Vui lòng nhập tên đăng nhập và mật khẩu');
        return;
    }

    try {
        const message = await postJson('/auth/login', userData);
        if (message === 'Đăng nhập thành công') {
            showMainScreen(userData.username);
            return;
        }
        setMessage(message);
    } catch (error) {
        setMessage('Không thể kết nối máy chủ');
    }
}

async function loadProducts(category, searchTerm) {
    try {
        setMessage('');
        let url = '/api/products';

        if (searchTerm && searchTerm.trim()) {
            url = `/api/products/search?name=${encodeURIComponent(searchTerm.trim())}`;
        } else if (category && category !== 'All') {
            url = `/api/products/category/${encodeURIComponent(category)}`;
        }

        const response = await fetch(`${BASE_URL}${url}`);
        if (!response.ok) {
            throw new Error('Không tải được danh sách sản phẩm');
        }

        const result = await response.json();
        const products = Array.isArray(result) ? result : (result.content || []);
        renderProductGrid(products);
        document.getElementById('detail-view').style.display = 'none';
        document.getElementById('product-grid').style.display = 'grid';
    } catch (error) {
        setMessage(error.message);
    }
}

function renderProductGrid(products) {
    const grid = document.getElementById('product-grid');
    if (!Array.isArray(products) || products.length === 0) {
        grid.innerHTML = '<p style="grid-column: 1 / -1; color: #475569;">Không tìm thấy sản phẩm nào.</p>';
        return;
    }

    grid.innerHTML = products.map((product) => {
        const price = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
        return `
            <article class="product-card" data-product-id="${product.id}">
                <img src="${product.imageUrl || 'https://via.placeholder.com/320x240?text=No+Image'}" alt="${product.name}">
                <div>
                    <h3>${product.name}</h3>
                    <p class="product-meta">${product.brand || 'Thương hiệu không xác định'}</p>
                    <p class="product-meta">${product.category}</p>
                    <p class="product-price">${price}</p>
                    <button type="button">Xem chi tiết</button>
                </div>
            </article>
        `;
    }).join('');
}

async function loadProductDetail(productId) {
    try {
        setMessage('');
        const response = await fetch(`${BASE_URL}/api/products/${productId}`);
        if (!response.ok) {
            throw new Error('Không tải được chi tiết sản phẩm');
        }

        const product = await response.json();
        activeProductId = product.id;

        document.getElementById('detail-image').src = product.imageUrl || 'https://via.placeholder.com/480x360?text=No+Image';
        document.getElementById('detail-name').innerText = product.name;
        document.getElementById('detail-brand').innerText = `Thương hiệu: ${product.brand || 'Không xác định'}`;
        document.getElementById('detail-category').innerText = `Danh mục: ${product.category}`;
        document.getElementById('detail-price').innerText = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.price);
        document.getElementById('detail-description').innerText = product.description || 'Không có mô tả.';
        document.getElementById('detail-rating').innerText = `Đánh giá: ${product.rating || 0}`;
        document.getElementById('detail-sold').innerText = `Đã bán: ${product.sold || 0}`;

        document.getElementById('detail-view').style.display = 'block';
        document.getElementById('product-grid').style.display = 'none';
    } catch (error) {
        setMessage(error.message);
    }
}

async function addCartItem(productId) {
    try {
        setMessage('');
        const response = await fetch(`${BASE_URL}/api/cart/add?productId=${productId}`, {
            method: 'POST'
        });

        if (!response.ok) {
            throw new Error('Không thể thêm vào giỏ hàng');
        }

        const payload = await response.json();
        if (payload && payload.message) {
            alert(payload.message);
        } else {
            alert('Đã thêm sản phẩm vào giỏ hàng');
        }
    } catch (error) {
        setMessage(error.message);
    }
}

async function postJson(path, data) {
    const res = await fetch(`${BASE_URL}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });

    return res.text();
}

function setupEnterToNextInput(formId) {
    const form = document.getElementById(formId);
    const inputs = Array.from(form.querySelectorAll('input'));

    inputs.forEach((input, index) => {
        input.addEventListener('keydown', (event) => {
            if (event.key !== 'Enter') {
                return;
            }

            event.preventDefault();
            const nextInput = inputs[index + 1];
            if (nextInput) {
                nextInput.focus();
            } else {
                form.requestSubmit();
            }
        });
    });
}

function setMessage(message) {
    document.getElementById('result').innerText = message;
}

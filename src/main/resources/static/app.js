const BASE_URL = 'http://localhost:8080';

// Hàm chuyển đổi form
function toggleForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        registerForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        registerForm.style.display = 'block';
    }
}

// Hàm Register
async function register() {
    const userData = {
        username: document.getElementById('reg-username').value,
        password: document.getElementById('reg-password').value,
        fullName: document.getElementById('reg-fullname').value,
        email: document.getElementById('reg-email').value,
        role: "USER"
    };

    const res = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    document.getElementById('result').innerText = await res.text();
}

// Hàm Login
async function login() {
    const userData = {
        username: document.getElementById('login-username').value,
        password: document.getElementById('login-password').value
    };

    const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
    });

    document.getElementById('result').innerText = await res.text();
}
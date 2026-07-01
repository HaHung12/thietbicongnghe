const BASE_URL = '';

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

    setupEnterToNextInput('login-form');
    setupEnterToNextInput('register-form');
});

function showLoginForm() {
    setMessage('');
    document.getElementById('login-username').focus();
}

function showRegisterForm() {
    const registerForm = document.getElementById('register-form');

    document.getElementById('login-form').style.display = 'none';
    document.getElementById('main-screen').style.display = 'none';
    setMessage('');
    document.getElementById('reg-username').focus();
}

function showMainScreen(username) {
    document.getElementById('login-form').style.display = 'none';
    document.getElementById('register-form').style.display = 'none';
    document.getElementById('main-screen').style.display = 'block';
    document.getElementById('welcome-message').innerText = `Xin chào, ${username}`;
    setMessage('');
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

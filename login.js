const loginContainer = document.getElementById('login-container');
const signupContainer = document.getElementById('signup-container');

const API_BASE = 'http://localhost:5000/api/auth';

function toggleAuth() {
  loginContainer.classList.toggle('hidden');
  signupContainer.classList.toggle('hidden');
}

async function handleLogin(event) {
  event.preventDefault();

  const mobile = document.getElementById('login-mobile').value.trim();
  const password = document.getElementById('login-password').value.trim();
  const msgEl = document.getElementById('login-msg');

  try {
    const res = await fetch(`${API_BASE}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userMobile", data.user.mobile);
      msgEl.className = "message success";
      msgEl.textContent = "Login Successful! Redirecting...";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      msgEl.className = "message";
      msgEl.textContent = data.message || "Login failed";
    }
  } catch (error) {
    msgEl.className = "message";
    msgEl.textContent = "Server Error. Is the backend running?";
  }
}

async function handleSignup(event) {
  event.preventDefault();

  const name = document.getElementById('signup-name').value.trim();
  const mobile = document.getElementById('signup-mobile').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value.trim();
  const msgEl = document.getElementById('signup-msg');

  try {
    const res = await fetch(`${API_BASE}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, mobile, email, password })
    });

    const data = await res.json();
    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.user.name);
      localStorage.setItem("userMobile", data.user.mobile);
      msgEl.className = "message success";
      msgEl.textContent = "Registration Successful! Redirecting...";
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1000);
    } else {
      msgEl.className = "message";
      msgEl.textContent = data.message || "Registration failed";
    }
  } catch (error) {
    msgEl.className = "message";
    msgEl.textContent = "Server Error. Is the backend running?";
  }
}

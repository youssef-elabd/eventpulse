const API_BASE = '/api';

const Store = {
  getToken: () => localStorage.getItem('ep_token'),
  setToken: (t) => localStorage.setItem('ep_token', t),
  clearToken: () => localStorage.removeItem('ep_token'),
  getUser: () => {
    try { return JSON.parse(localStorage.getItem('ep_user') || 'null'); } catch { return null; }
  },
  setUser: (u) => localStorage.setItem('ep_user', JSON.stringify(u)),
  clearUser: () => localStorage.removeItem('ep_user'),
};
// localStorage here only ever holds the JWT + a cached user profile,
// never event/registration data — that's always fetched live from the API.

async function apiFetch(path, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const token = Store.getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message = data.message || (data.errors && data.errors.map((e) => e.message).join(', ')) || 'Something went wrong.';
    throw new Error(message);
  }
  return data;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}
function formatDateTime(d) {
  return new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

function toast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3000);
}

function requireLogin(redirectTo) {
  if (!Store.getToken()) {
    window.location.href = `login.html?next=${encodeURIComponent(redirectTo || window.location.pathname)}`;
    return false;
  }
  return true;
}

function renderHeaderAuthState() {
  const authArea = document.getElementById('auth-area');
  if (!authArea) return;
  const user = Store.getUser();
  if (user) {
    authArea.innerHTML = `
      <span class="hi-user">Hi, ${user.name.split(' ')[0]}</span>
      <a href="my-events.html">My events</a>
      ${user.role === 'admin' ? '<a href="admin.html">Admin</a>' : ''}
      <button id="logout-btn" class="link-btn">Log out</button>
    `;
    document.getElementById('logout-btn').addEventListener('click', () => {
      Store.clearToken();
      Store.clearUser();
      toast('Logged out.', 'info');
      setTimeout(() => (window.location.href = 'index.html'), 350);
    });
  } else {
    authArea.innerHTML = `<a href="login.html">Log in</a><a href="register.html">Sign up</a>`;
  }
}

document.addEventListener('DOMContentLoaded', renderHeaderAuthState);

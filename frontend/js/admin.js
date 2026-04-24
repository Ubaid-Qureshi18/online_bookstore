/* ═══════════════════════════════════════════════
   ADMIN PANEL — API-Connected JS Logic
   ═══════════════════════════════════════════════ */

const SERVER_BASE = (!window.location.hostname || ((window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost') && window.location.port !== '3000'))
  ? 'http://localhost:3000'
  : window.location.origin;

const API_BASE = SERVER_BASE + '/api';

// ─── Auth Helpers ───
function getAdminToken() {
  return localStorage.getItem('arcanum_admin_token');
}

function adminHeaders() {
  return {
    'Authorization': `Bearer ${getAdminToken()}`,
    'Content-Type': 'application/json'
  };
}

async function adminFetch(url, options = {}) {
  const res = await fetch(API_BASE + url, {
    ...options,
    headers: { ...adminHeaders(), ...(options.headers || {}) }
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('arcanum_admin_token');
      window.location.href = 'login.html';
      return;
    }
    throw new Error(data.error || 'Request failed');
  }
  return data;
}

// ─── Helpers ───
function formatINR(n) {
  return '₹' + parseFloat(n).toLocaleString('en-IN');
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function getStatusBadge(status) {
  const map = { completed: 'badge-green', pending: 'badge-gold', failed: 'badge-red' };
  return `<span class="badge ${map[status] || 'badge-blue'}">${status}</span>`;
}

// ─── Admin Auth ───
function checkAdminAuth() {
  const token = getAdminToken();
  if (!token && !window.location.pathname.includes('login')) {
    window.location.href = 'login.html';
  }
}

function adminLogout() {
  localStorage.removeItem('arcanum_admin_token');
  window.location.href = 'login.html';
}

// ─── Sidebar Template ───
function renderSidebar(activePage) {
  return `
  <div class="admin-sidebar">
    <div class="sidebar-brand">
      <h2>ARCANUM</h2>
      <span>Admin Portal</span>
    </div>
    <nav class="sidebar-nav">
      <div class="sidebar-section">Overview</div>
      <a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">
        <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
        Dashboard
      </a>
      <div class="sidebar-section">Management</div>
      <a href="books.html" class="${activePage === 'books' ? 'active' : ''}">
        <svg viewBox="0 0 24 24"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>
        Books
      </a>
      <a href="users.html" class="${activePage === 'users' ? 'active' : ''}">
        <svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>
        Users
      </a>
      <a href="orders.html" class="${activePage === 'orders' ? 'active' : ''}">
        <svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        Orders
      </a>
      <div class="sidebar-section">Analytics</div>
      <a href="earnings.html" class="${activePage === 'earnings' ? 'active' : ''}">
        <svg viewBox="0 0 24 24"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
        Earnings
      </a>
    </nav>
    <div class="sidebar-footer">
      <a href="../index.html">
        <svg viewBox="0 0 24 24"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
        View Storefront
      </a>
    </div>
  </div>`;
}

// ─── CSV Export ───
function exportCSV(data, filename) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const csv = [
    headers.join(','),
    ...data.map(row => headers.map(h => `"${row[h]}"`).join(','))
  ].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

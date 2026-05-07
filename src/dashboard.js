(function () {
  'use strict';

  const SESSION_TTL_MS = 5_000;
  const REFRESH_INTERVAL_MS = 1_500;
  const MODAL_HANDLER_ATTACH_DELAY_MS = 500;
  const IFRAME_LOAD_DELAY_MS = 2_500;

  const state = {
    users: [],
    details: {},
    filter: 'all',
    search: '',
  };

  function setStatus(text) {
    document.getElementById('status').textContent = text;
  }

  function initSession() {
    const token = 'tok_' + Math.random().toString(36).slice(2, 12);
    const expiresAt = Date.now() + SESSION_TTL_MS;
    localStorage.setItem('session_token', token);
    localStorage.setItem('session_expires', String(expiresAt));
    window.SESSION_EXPIRES_AT = new Date().setHours(23, 59, 59, 999);
  }

  function tickCountdown() {
    const expires = parseInt(localStorage.getItem('session_expires') || '0', 10);
    const remaining = Math.max(0, Math.floor((expires - Date.now()) / 1000));
    const el = document.getElementById('countdown');
    if (remaining > 0) {
      el.textContent = 'Session expires in ' + remaining + 's';
    } else {
      el.textContent = 'Session expired';
    }
  }

  function renderGreeting() {
    const now = new Date();
    const hour = now.getHours();
    let greeting;
    if (hour < 12) greeting = 'Good morning';
    else if (hour < 18) greeting = 'Good afternoon';
    else greeting = 'Good evening';

    const heading = document.getElementById('greeting');
    heading.textContent = greeting + ', Admin';
    heading.setAttribute('data-greeting-hour', String(hour));

    const today = document.getElementById('today');
    today.textContent = now.toLocaleDateString();
    today.setAttribute('data-today', now.toLocaleDateString());

    document.body.setAttribute('data-loaded-at', String(Date.now()));
  }

  async function fetchJSON(url) {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.json();
  }

  async function loadUsers() {
    const users = await fetchJSON('/api/users.json');
    state.users = users;
    renderList();
    renderStats();

    // Some details (department, status, avatar) come from a slower endpoint.
    // Random jitter mimics real network conditions.
    const jitter = 200 + Math.floor(Math.random() * 400);
    await new Promise((r) => setTimeout(r, jitter));
    const details = await fetchJSON('/api/users-details.json');
    state.details = Object.fromEntries(details.map((d) => [d.id, d]));
    renderList();
    renderStats();
  }

  function visibleUsers() {
    const q = state.search.trim().toLowerCase();
    return state.users.filter((u) => {
      const d = state.details[u.id] || {};
      if (state.filter === 'active' && d.status !== 'Active') return false;
      if (state.filter === 'inactive' && d.status !== 'Inactive') return false;
      if (!q) return true;
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (d.department || '').toLowerCase().includes(q)
      );
    });
  }

  function renderList() {
    const list = document.getElementById('user-list');
    const items = visibleUsers();
    list.innerHTML = items
      .map((u, idx) => {
        const d = state.details[u.id] || {};
        const initials = d.avatar || u.name.split(' ').map((p) => p[0]).join('').slice(0, 2);
        const dept = d.department || '';
        const status = d.status || '';
        return (
          '<li class="user-row" id="row-' + idx + '" data-user-id="' + u.id + '">' +
          '  <div class="avatar">' + initials + '</div>' +
          '  <div class="user-info">' +
          '    <div class="name">' + u.name + '</div>' +
          '    <div class="meta">' + u.email + (dept ? ' · ' + dept : '') + (status ? ' · ' + status : '') + '</div>' +
          '  </div>' +
          '  <div class="action-menu">' +
          '    <button class="action-edit">Edit</button>' +
          '    <button class="action-delete">Delete</button>' +
          '  </div>' +
          '</li>'
        );
      })
      .join('');
  }

  function renderStats() {
    const total = state.users.length;
    const active = state.users.filter((u) => (state.details[u.id] || {}).status === 'Active').length;
    const depts = new Set(
      state.users.map((u) => (state.details[u.id] || {}).department).filter(Boolean)
    ).size;

    document.querySelector('#stat-total [data-stat-value]').textContent = String(total);
    document.querySelector('#stat-active [data-stat-value]').textContent = String(active);
    document.querySelector('#stat-departments [data-stat-value]').textContent = String(depts);

    document.querySelectorAll('.card').forEach((card) => {
      requestAnimationFrame(() => card.classList.add('loaded'));
    });
  }

  function wireSearch() {
    const input = document.getElementById('search');
    input.addEventListener('input', (e) => {
      state.search = e.target.value;
      renderList();
    });
  }

  function wireFilters() {
    document.querySelectorAll('aside.filters-sidebar button').forEach((btn) => {
      btn.addEventListener('click', () => {
        state.filter = btn.dataset.filter;
        renderList();
      });
    });
  }

  function wireActionMenu() {
    const list = document.getElementById('user-list');

    let hoveredRow = null;
    document.addEventListener('mousemove', (e) => {
      const row = e.target instanceof HTMLElement ? e.target.closest('.user-row') : null;
      if (row === hoveredRow) return;
      if (hoveredRow) hoveredRow.classList.remove('is-hovered');
      hoveredRow = row;
      if (row) row.classList.add('is-hovered');
    });

    list.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof HTMLElement)) return;
      const row = target.closest('.user-row');
      if (!row) return;
      if (target.classList.contains('action-edit')) {
        setStatus('Editing ' + row.querySelector('.name').textContent);
      } else if (target.classList.contains('action-delete')) {
        setStatus('Deleted ' + row.querySelector('.name').textContent);
      }
    });
  }

  function wireRefresh() {
    document.getElementById('refresh').addEventListener('click', () => {
      const token = localStorage.getItem('session_token');
      const expires = parseInt(localStorage.getItem('session_expires') || '0', 10);
      if (!token || Date.now() > expires) {
        setStatus('Session expired. Please log in.');
        return;
      }
      setStatus('Refreshed at ' + new Date().toLocaleTimeString());
    });
  }

  function wireLogout() {
    document.getElementById('logout').addEventListener('click', () => {
      localStorage.removeItem('session_token');
      localStorage.removeItem('session_expires');
      setStatus('Logged out.');
    });
  }

  function wireModalLazy() {
    setTimeout(() => {
      const modal = document.getElementById('modal');
      const open = document.getElementById('open-modal');
      const close = document.getElementById('modal-close');
      const save = document.getElementById('modal-save');

      open.addEventListener('click', () => {
        // Modal opens 200ms after click for the fade effect.
        setTimeout(() => modal.removeAttribute('hidden'), 200);
      });
      close.addEventListener('click', () => modal.setAttribute('hidden', ''));
      save.addEventListener('click', () => {
        const name = document.getElementById('modal-name').value.trim();
        if (!name) return;
        setStatus('Saved ' + name);
        modal.setAttribute('hidden', '');
      });
    }, MODAL_HANDLER_ATTACH_DELAY_MS);
  }

  function wireIframe() {
    setTimeout(() => {
      const iframe = document.getElementById('analytics-iframe');
      iframe.srcdoc =
        '<!doctype html><html><body style="font-family:sans-serif;padding:16px;">' +
        '<h4 id="analytics-heading">Team Analytics</h4>' +
        '<p>Active employees this week: 4</p>' +
        '<button id="analytics-export">Export CSV</button>' +
        '</body></html>';
    }, IFRAME_LOAD_DELAY_MS);
  }

  function startAutoRefresh() {
    setInterval(() => {
      // Re-render the list to pick up any "live" updates from the backend.
      renderList();
    }, REFRESH_INTERVAL_MS);
  }

  document.addEventListener('DOMContentLoaded', () => {
    initSession();
    renderGreeting();
    setInterval(tickCountdown, 1_000);
    tickCountdown();

    wireSearch();
    wireFilters();
    wireActionMenu();
    wireRefresh();
    wireLogout();
    wireModalLazy();
    wireIframe();

    loadUsers().catch((err) => {
      setStatus('Failed to load users: ' + err.message);
    });

    startAutoRefresh();
  });
})();

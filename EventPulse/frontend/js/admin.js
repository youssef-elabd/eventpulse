function guardAdmin() {
  if (!requireLogin('admin.html')) return false;
  const user = Store.getUser();
  if (!user || user.role !== 'admin') {
    document.querySelector('main').innerHTML = `<div class="empty-state">
      <h3>Admins only</h3><p>You don't have permission to view this page.</p>
      <a href="index.html" class="btn btn-outline" style="margin-top:14px;">Back to events</a>
    </div>`;
    return false;
  }
  return true;
}

let categoriesCache = [];

async function loadCategoriesInto(selectEl) {
  const { data } = await apiFetch('/categories');
  categoriesCache = data.categories;
  selectEl.innerHTML = data.categories.map((c) => `<option value="${c._id}">${c.name}</option>`).join('');
}

async function loadEventsTable() {
  const el = document.getElementById('events-table');
  try {
    const { data } = await apiFetch('/events?limit=50&sort=-date');
    if (data.events.length === 0) {
      el.innerHTML = '<p style="color:#6b7280;">No events yet.</p>';
      return;
    }
    el.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Name</th><th>Category</th><th>City</th><th>Date</th><th>Capacity</th><th></th></tr></thead>
        <tbody>
          ${data.events.map((ev) => `
            <tr>
              <td>${ev.name}</td>
              <td>${ev.category ? ev.category.name : '—'}</td>
              <td>${ev.city}</td>
              <td>${formatDate(ev.date)}</td>
              <td>${ev.registrationsCount}/${ev.capacity}</td>
              <td><div class="row-actions">
                <button class="icon-btn" data-view="${ev._id}">View</button>
                <button class="icon-btn" data-delete="${ev._id}" style="color:var(--danger);">Delete</button>
              </div></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    el.querySelectorAll('[data-view]').forEach((b) => b.addEventListener('click', () => window.location.href = `event.html?id=${b.dataset.view}`));
    el.querySelectorAll('[data-delete]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('Delete this event? This cannot be undone.')) return;
      try {
        await apiFetch(`/events/${b.dataset.delete}`, { method: 'DELETE' });
        toast('Event deleted.', 'info');
        loadEventsTable();
      } catch (err) {
        toast(err.message, 'error');
      }
    }));
  } catch (err) {
    el.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

async function loadCategoriesTable() {
  const el = document.getElementById('categories-table');
  try {
    const { data } = await apiFetch('/categories');
    if (data.categories.length === 0) {
      el.innerHTML = '<p style="color:#6b7280;">No categories yet.</p>';
      return;
    }
    el.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Name</th><th>Description</th><th></th></tr></thead>
        <tbody>
          ${data.categories.map((c) => `
            <tr>
              <td>${c.name}</td>
              <td>${c.description || '—'}</td>
              <td><button class="icon-btn" data-delete="${c._id}" style="color:var(--danger);">Delete</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    el.querySelectorAll('[data-delete]').forEach((b) => b.addEventListener('click', async () => {
      if (!confirm('Delete this category?')) return;
      try {
        await apiFetch(`/categories/${b.dataset.delete}`, { method: 'DELETE' });
        toast('Category deleted.', 'info');
        loadCategoriesTable();
      } catch (err) {
        toast(err.message, 'error');
      }
    }));
  } catch (err) {
    el.innerHTML = `<p style="color:var(--danger);">${err.message}</p>`;
  }
}

document.querySelectorAll('.admin-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach((t) => t.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('tab-events').style.display = tab.dataset.tab === 'events' ? 'block' : 'none';
    document.getElementById('tab-categories').style.display = tab.dataset.tab === 'categories' ? 'block' : 'none';
  });
});

document.getElementById('event-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const errorBox = document.getElementById('event-error');
  errorBox.classList.remove('show');

  const payload = {
    name: document.getElementById('ev-name').value.trim(),
    description: document.getElementById('ev-description').value.trim(),
    category: document.getElementById('ev-category').value,
    city: document.getElementById('ev-city').value.trim(),
    date: new Date(document.getElementById('ev-date').value).toISOString(),
    capacity: Number(document.getElementById('ev-capacity').value),
  };

  try {
    await apiFetch('/events', { method: 'POST', body: JSON.stringify(payload) });
    toast('Event created.', 'success');
    document.getElementById('event-form').reset();
    loadEventsTable();
  } catch (err) {
    errorBox.textContent = err.message;
    errorBox.classList.add('show');
  }
});

document.getElementById('category-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('cat-name').value.trim();
  const description = document.getElementById('cat-description').value.trim();
  try {
    await apiFetch('/categories', { method: 'POST', body: JSON.stringify({ name, description }) });
    toast('Category added.', 'success');
    document.getElementById('category-form').reset();
    loadCategoriesTable();
    loadCategoriesInto(document.getElementById('ev-category'));
  } catch (err) {
    toast(err.message, 'error');
  }
});

document.addEventListener('DOMContentLoaded', () => {
  if (!guardAdmin()) return;
  loadCategoriesInto(document.getElementById('ev-category'));
  loadEventsTable();
  loadCategoriesTable();
});

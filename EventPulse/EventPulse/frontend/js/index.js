let state = { page: 1, limit: 9 };

async function loadCategories() {
  try {
    const { data } = await apiFetch('/categories');
    const sel = document.getElementById('f-category');
    data.categories.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = c._id;
      opt.textContent = c.name;
      sel.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
  }
}

function eventCardHTML(ev) {
  const spotsLeft = ev.capacity - ev.registrationsCount;
  const isFull = spotsLeft <= 0;
  return `
    <a href="event.html?id=${ev._id}" class="event-card">
      <div class="date-tag">
        <span>${formatDate(ev.date)}</span>
        <span>${ev.city}</span>
      </div>
      <div class="body">
        <span class="cat">${ev.category ? ev.category.name : 'Event'}</span>
        <h3>${ev.name}</h3>
        <div class="meta"><span>${ev.registrationsCount} registered</span></div>
        <div class="cap-row">
          <span class="badge ${isFull ? 'full' : 'spots'}">${isFull ? 'Full' : spotsLeft + ' spots left'}</span>
          <span class="btn btn-sm btn-outline">View</span>
        </div>
      </div>
    </a>
  `;
}

async function loadEvents() {
  const grid = document.getElementById('event-grid');
  grid.innerHTML = '<div class="loading-row">Loading events…</div>';

  const params = new URLSearchParams();
  const search = document.getElementById('f-search').value.trim();
  const category = document.getElementById('f-category').value;
  const city = document.getElementById('f-city').value.trim();
  const sort = document.getElementById('f-sort').value;

  if (search) params.set('search', search);
  if (category) params.set('category', category);
  if (city) params.set('city', city);
  if (sort) params.set('sort', sort);
  params.set('page', state.page);
  params.set('limit', state.limit);

  try {
    const { data, pagination } = await apiFetch(`/events?${params.toString()}`);
    document.getElementById('results-count').textContent = `${pagination.total} event${pagination.total === 1 ? '' : 's'}`;

    if (data.events.length === 0) {
      grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
        <h3>No events match those filters</h3>
        <p>Try widening your search or clearing a filter.</p>
      </div>`;
    } else {
      grid.innerHTML = data.events.map(eventCardHTML).join('');
    }

    renderPagination(pagination);
  } catch (err) {
    grid.innerHTML = `<div class="empty-state" style="grid-column:1/-1"><h3>Couldn't load events</h3><p>${err.message}</p></div>`;
  }
}

function renderPagination(pagination) {
  const el = document.getElementById('pagination');
  if (pagination.pages <= 1) { el.innerHTML = ''; return; }

  let html = '';
  for (let p = 1; p <= pagination.pages; p++) {
    html += `<button class="btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-outline'}" data-page="${p}">${p}</button>`;
  }
  el.innerHTML = html;
  el.querySelectorAll('button').forEach((btn) => {
    btn.addEventListener('click', () => {
      state.page = Number(btn.dataset.page);
      loadEvents();
      window.scrollTo({ top: document.getElementById('browse').offsetTop - 80, behavior: 'smooth' });
    });
  });
}

let debounceTimer;
function debouncedReload() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => { state.page = 1; loadEvents(); }, 350);
}

document.addEventListener('DOMContentLoaded', () => {
  loadCategories();
  loadEvents();
  document.getElementById('f-search').addEventListener('input', debouncedReload);
  document.getElementById('f-city').addEventListener('input', debouncedReload);
  document.getElementById('f-category').addEventListener('change', () => { state.page = 1; loadEvents(); });
  document.getElementById('f-sort').addEventListener('change', () => { state.page = 1; loadEvents(); });
});

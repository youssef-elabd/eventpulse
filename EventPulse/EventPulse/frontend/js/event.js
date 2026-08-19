const params = new URLSearchParams(window.location.search);
const eventId = params.get('id');
let currentEvent = null;

function announcementHTML(a) {
  return `
    <div class="announcement">
      <div class="meta"><span class="sender">${a.sender?.name || 'Admin'}</span><span>${formatDateTime(a.createdAt)}</span></div>
      <div>${a.text}</div>
    </div>
  `;
}

async function loadEvent() {
  if (!eventId) {
    document.getElementById('ev-name').textContent = 'Event not found';
    return;
  }
  try {
    const { data } = await apiFetch(`/events/${eventId}`);
    currentEvent = data.event;
    renderEvent(currentEvent);
    loadAnnouncements();
    connectSocket();
  } catch (err) {
    document.getElementById('ev-name').textContent = 'Event not found';
    document.getElementById('ev-description').textContent = err.message;
  }
}

function renderEvent(ev) {
  document.getElementById('ev-cat').textContent = ev.category ? ev.category.name : 'Event';
  document.getElementById('ev-name').textContent = ev.name;
  document.getElementById('ev-date').textContent = formatDate(ev.date);
  document.getElementById('ev-city').textContent = ev.city;
  document.getElementById('ev-description').textContent = ev.description;

  const spotsLeft = ev.capacity - ev.registrationsCount;
  const isFull = spotsLeft <= 0;
  const pct = Math.min(100, Math.round((ev.registrationsCount / ev.capacity) * 100));

  const fill = document.getElementById('cap-fill');
  fill.style.width = `${pct}%`;
  fill.classList.toggle('full', isFull);
  document.getElementById('cap-text').textContent = isFull
    ? `Full — ${ev.registrationsCount}/${ev.capacity} registered`
    : `${spotsLeft} of ${ev.capacity} spots left`;

  const btn = document.getElementById('register-btn');
  const note = document.getElementById('reg-note');
  const user = Store.getUser();

  if (isFull) {
    btn.disabled = true;
    btn.textContent = 'Event full';
  }

  btn.addEventListener('click', async () => {
    if (!requireLogin(window.location.pathname + window.location.search)) return;
    btn.disabled = true;
    btn.textContent = 'Registering…';
    try {
      await apiFetch(`/events/${eventId}/register`, { method: 'POST' });
      toast('You\'re registered! 🎉', 'success');
      btn.textContent = 'Registered ✓';
      note.textContent = 'See it under "My events".';
      currentEvent.registrationsCount += 1;
      renderCapacityOnly(currentEvent);
    } catch (err) {
      toast(err.message, 'error');
      btn.disabled = false;
      btn.textContent = 'Register';
    }
  });

  if (user && user.role === 'admin') {
    document.getElementById('admin-announce').style.display = 'block';
  }
}

function renderCapacityOnly(ev) {
  const spotsLeft = ev.capacity - ev.registrationsCount;
  const isFull = spotsLeft <= 0;
  const pct = Math.min(100, Math.round((ev.registrationsCount / ev.capacity) * 100));
  const fill = document.getElementById('cap-fill');
  fill.style.width = `${pct}%`;
  fill.classList.toggle('full', isFull);
  document.getElementById('cap-text').textContent = isFull
    ? `Full — ${ev.registrationsCount}/${ev.capacity} registered`
    : `${spotsLeft} of ${ev.capacity} spots left`;
}

async function loadAnnouncements() {
  if (!Store.getToken()) return; // announcements require auth per the API
  try {
    const { data } = await apiFetch(`/events/${eventId}/announcements`);
    const list = document.getElementById('announcement-list');
    if (data.messages.length === 0) {
      list.innerHTML = '<p style="color:#6b7280;font-size:0.88rem;">No announcements yet.</p>';
    } else {
      list.innerHTML = data.messages.slice().reverse().map(announcementHTML).join('');
    }
  } catch (err) {
    // Silently ignore — likely just not logged in
  }
}

function connectSocket() {
  if (typeof io === 'undefined') return;
  const socket = io({ transports: ['websocket', 'polling'] });
  socket.on('connect', () => socket.emit('joinEvent', eventId));
  socket.on('announcement', (msg) => {
    const list = document.getElementById('announcement-list');
    if (list.querySelector('p')) list.innerHTML = '';
    list.insertAdjacentHTML('afterbegin', announcementHTML(msg));
    toast('New announcement posted', 'info');
  });
}

document.getElementById('announce-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const input = document.getElementById('announce-text');
  const text = input.value.trim();
  if (!text) return;
  try {
    await apiFetch(`/events/${eventId}/announcements`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    input.value = '';
  } catch (err) {
    toast(err.message, 'error');
  }
});

document.addEventListener('DOMContentLoaded', loadEvent);


kfOnAuth(async (u)=>{
  if (!u){ location.href='/auth.html'; return; }
  document.getElementById('pName').textContent = u.displayName || u.name || '';
  document.getElementById('pEmail').textContent = u.email || '';
  document.getElementById('logoutBtn').onclick = kfLogout;

  const grid = document.getElementById('favGrid');
  const res = await fetch('/data/movies.json');
  const all = await res.json();
  const ids = new Set(await kfGetFavIds());
  const items = all.filter(m => ids.has(m.id));
  grid.innerHTML = items.length ? items.map(m=>`
    <a class="card" href="/movie.html?id=${m.id}">
      <span class="rating">★ ${m.rating}</span>
      <img src="${m.poster}"><div class="body"><div style="font-weight:700">${m.title}</div>
      <div style="color:var(--muted);font-size:12px">${m.year}</div></div>
    </a>`).join('') : '<p style="color:var(--muted)">Пока пусто.</p>';
});

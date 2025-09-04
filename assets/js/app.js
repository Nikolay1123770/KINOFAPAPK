
// PWA install button
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.style.display = 'inline-flex';
});
if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installBtn.style.display = 'none';
  });
}

// Auth state
const authLink = document.getElementById('authLink');
const profileLink = document.getElementById('profileLink');
function getUser(){ return JSON.parse(localStorage.getItem('kf_user')||'null'); } catch(e){ return null; }
}
function setUser(u){ localStorage.setItem('kf_user', JSON.stringify(u)); }
function logout(){ localStorage.removeItem('kf_user'); location.href='/index.html'; }

function applyAuthToNav(){
  const u = getUser();
  if (u){
    if (authLink) authLink.classList.add('hidden');
    if (profileLink) profileLink.classList.remove('hidden');
  } else {
    if (authLink) authLink.classList.remove('hidden');
    if (profileLink) profileLink.classList.add('hidden');
  }
}
// Apply auth state from Firebase
kfOnAuth((u)=>{
  const authLink = document.getElementById('authLink');
  const profileLink = document.getElementById('profileLink');
  if (u){ if (authLink) authLink.classList.add('hidden'); if (profileLink) profileLink.classList.remove('hidden'); }
  else { if (authLink) authLink.classList.remove('hidden'); if (profileLink) profileLink.classList.add('hidden'); }
});

// Render helpers
function cardHtml(m){
  return `
  <a class="card" href="/movie.html?id=${m.id}">
    <span class="badge">${m.genreName||''}</span>
    <span class="rating">★ ${m.rating}</span>
    <img src="${m.poster}" alt="${m.title}">
    <div class="body">
      <div style="font-weight:700">${m.title}</div>
      <div style="color:var(--muted);font-size:12px">${m.year}</div>
    </div>
  </a>`;
}

async function loadMovies(query = "", genre = "", sort = "rating.kp") {
  const url = new URL("https://api.kinopoisk.dev/v1.4/movie");
  url.searchParams.set("limit", 20);
  url.searchParams.set("sortField", sort);
  url.searchParams.set("sortType", "-1");
  if (query) {
    url.searchParams.set("field", "name");
    url.searchParams.set("search", query);
  }
  if (genre && genre !== "all") {
    url.searchParams.set("field", "genres.name");
    url.searchParams.set("search", genre);
  }
  const response = await fetch(url, {
    headers: {
      "X-API-KEY": "960dc4e3-9eae-4072-8f0c-98a5ed6c0d2a",
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();
  return data.docs.map(m => ({
    id: m.id,
    title: m.name || m.alternativeName,
    year: m.year,
    poster: m.poster?.url || "",
    rating: m.rating?.kp || 0,
    overview: m.description || "",
    genre: m.genres?.[0]?.name || "другое",
    genreName: m.genres?.[0]?.name || "другое",
    popularity: m.votes?.kp || 0,
    watchUrl: `https://www.kinopoisk.ru/film/${m.id}/`
  }));
}


// Home
async function initHome(){
  const popular = document.getElementById('popular');
  const search = document.getElementById('search');
  const searchBtn = document.getElementById('searchBtn');
  if (!popular) return;
  const all = await loadMovies();
  popular.innerHTML = all.sort((a,b)=>b.popularity-a.popularity).slice(0,10).map(cardHtml).join('');
  function go(){
    const q = (search.value||'').toLowerCase().trim();
    if (!q) return;
    location.href = '/catalog.html?q='+encodeURIComponent(q);
  }
  if (searchBtn) searchBtn.onclick=go;
  if (search) search.onkeydown=(e)=>{ if(e.key==='Enter') go(); };
}
initHome();

// Catalog
async function initCatalog(){
  const grid = document.getElementById('catalog');
  if (!grid) return;
  const params = new URLSearchParams(location.search);
  const qParam = (params.get('q')||'').toLowerCase();
  const all = await loadMovies();
  const byIdGenre={action:'Боевик',comedy:'Комедия',drama:'Драма','sci-fi':'Фантастика',horror:'Ужасы'};
  all.forEach(m=>m.genreName = byIdGenre[m.genre]||'Другое');
  let items = all.slice();
  if (qParam) items = items.filter(m => m.title.toLowerCase().includes(qParam));
  // Filters
  const filters = document.getElementById('filters');
  const qInput = document.getElementById('q');
  const sort = document.getElementById('sort');
  if (qInput) qInput.value = qParam;
  function render(){
    grid.innerHTML = items.map(cardHtml).join('');
  }
  render();
  if (filters){
    filters.onclick = (e)=>{
      const btn = e.target.closest('.filter'); if (!btn) return;
      filters.querySelectorAll('.filter').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const g = btn.dataset.genre;
      items = all.filter(m => g==='all' ? true : m.genre===g);
      if (qInput && qInput.value) items = items.filter(m => m.title.toLowerCase().includes(qInput.value.toLowerCase()));
      applySort(); render();
    };
  }
  function applySort(){
    const v = sort.value;
    if (v==='rating') items.sort((a,b)=>b.rating-a.rating);
    else if (v==='year') items.sort((a,b)=>b.year-a.year);
    else items.sort((a,b)=>b.popularity-a.popularity);
  }
  if (sort){ sort.onchange=()=>{ applySort(); render(); }; }
  if (qInput){
    qInput.oninput=()=>{
      const gBtn = document.querySelector('.filter.active');
      const g = gBtn ? gBtn.dataset.genre : 'all';
      items = all.filter(m => (g==='all'||m.genre===g) && m.title.toLowerCase().includes(qInput.value.toLowerCase()));
      applySort(); render();
    };
  }
}

// Favorites helpers
function getFav(){ return []; }catch(e){return []} }
function setFav(arr){ /* replaced by Firestore */ }
async function toggleFav(id){ return await kfToggleFav(id); }


async function initFavorites(){
  const grid = document.getElementById('favGrid');
  if (!grid) return;
  const all = await loadMovies();
  const ids = new Set(await kfGetFavIds());
  const items = all.filter(m => ids.has(m.id));
  grid.innerHTML = items.length ? items.map(cardHtml).join('') : '<p style="color:var(--muted)">Пока пусто.</p>';
}


// Router-ish
window.addEventListener('DOMContentLoaded', ()=>{
  initCatalog();
  initFavorites();
});

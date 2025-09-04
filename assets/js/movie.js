async function loadMovie(id){
  const response = await fetch(`https://api.kinopoisk.dev/v1.4/movie/${id}`, {
    headers: {
      "X-API-KEY": "960dc4e3-9eae-4072-8f0c-98a5ed6c0d2a",
      "Content-Type": "application/json"
    }
  });
  return await response.json();
}

async function loadSimilar(genre){
  const url = new URL("https://api.kinopoisk.dev/v1.4/movie");
  url.searchParams.set("limit", 10);
  url.searchParams.set("field", "genres.name");
  url.searchParams.set("search", genre);
  const response = await fetch(url, {
    headers: {
      "X-API-KEY": "960dc4e3-9eae-4072-8f0c-98a5ed6c0d2a",
      "Content-Type": "application/json"
    }
  });
  const data = await response.json();
  return data.docs;
}

(async function(){
  const params = new URLSearchParams(location.search);
  const id = params.get('id');
  const m = await loadMovie(id);
  document.getElementById('poster').src = m.poster?.url || "";
  document.getElementById('title').textContent = m.name || m.alternativeName;
  document.getElementById('meta').textContent = `${m.year} • ${(m.genres && m.genres[0]?.name)||''} • ★ ${m.rating?.kp||0}`;
  document.getElementById('overview').textContent = m.description || "";
  const favBtn = document.getElementById('favBtn');
  const watchBtn = document.getElementById('watchBtn');
  watchBtn.href = `https://www.kinopoisk.ru/film/${m.id}/`;
  async function updateFavBtn(){ 
    const ids = await kfGetFavIds(); 
    favBtn.textContent = ids.includes(m.id) ? 'Убрать из избранного' : 'В избранное'; 
  }
  favBtn.onclick = async ()=>{ await kfToggleFav(m.id); updateFavBtn(); };
  updateFavBtn();
  const similar = document.getElementById('similar');
  const sim = await loadSimilar((m.genres && m.genres[0]?.name)||"");
  similar.innerHTML = sim.filter(x=>x.id!==m.id).map(x=>`
    <a class="card" href="/movie.html?id=${x.id}">
      <span class="rating">★ ${x.rating?.kp||0}</span>
      <img src="${x.poster?.url||''}"><div class="body"><div style="font-weight:700">${x.name||x.alternativeName}</div>
      <div style="color:var(--muted);font-size:12px">${x.year||''}</div></div>
    </a>`).join('');
})();
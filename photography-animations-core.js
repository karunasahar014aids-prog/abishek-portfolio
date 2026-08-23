/* ABISHEK STUDIO — PHOTOGRAPHY GALLERY FILTER FIX */
(function(){
 const SUPABASE_URL='https://jaryhmtzzassnzomtsch.supabase.co',SUPABASE_KEY='sb_publishable_7VIks8jFhtcJtJOMzI5CKA_fPLazRUA';
 let liveItems=[],client=null,activeFilter='all';
 const gallery=()=>document.getElementById('gallery');
 const esc=v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
 function clean(v){return String(v??'').trim().toLowerCase().replace(/[_-]+/g,' ').replace(/\s+/g,' ')}
 function categoryKey(v){const c=clean(v);if(c==='all')return'all';if(c.includes('street'))return'street';if(c.includes('cover'))return'covers';if(c.includes('picsart')||c.includes('pics arts')||c.includes('pics art'))return'picsarts';if(c.includes('poster'))return'posters';return c.replace(/ /g,'')}
 function label(v){const k=categoryKey(v);return({all:'All',street:'Street',covers:'Covers',picsarts:'Picsarts',posters:'Posters'})[k]||String(v||'Photography')}
 function ensureFilters(){
  const g=gallery();if(!g)return;
  let bar=document.getElementById('live-photo-filters');
  if(!bar){bar=document.createElement('div');bar.id='live-photo-filters';g.parentNode.insertBefore(bar,g)}
  document.querySelectorAll('.filter-btn,.filter-button,[data-filter]').forEach(b=>{if(!bar.contains(b))b.style.display='none'});
  if(bar.dataset.ready==='true'){updateFilterState();return}
  bar.innerHTML='';
  [['all','All'],['street','Street'],['covers','Covers'],['picsarts','Picsarts'],['posters','Posters']].forEach(([value,text])=>{const b=document.createElement('button');b.type='button';b.className='filter-btn';b.dataset.cat=value;b.textContent=text;bar.appendChild(b)});
  bar.dataset.ready='true';
  bar.addEventListener('click',e=>{const b=e.target.closest('.filter-btn');if(!b)return;activeFilter=b.dataset.cat;updateFilterState();applyFilter()});
  updateFilterState();
 }
 function updateFilterState(){document.querySelectorAll('#live-photo-filters .filter-btn').forEach(b=>{const selected=b.dataset.cat===activeFilter;b.classList.toggle('active',selected);b.setAttribute('aria-selected',selected?'true':'false')})}
 function createCard(item){const card=document.createElement('div');card.className='g-card reveal live-admin-photo';card.dataset.category=categoryKey(item.category);card.innerHTML=`<div class="g-card-img"><img src="${esc(item.image_url)}" alt="${esc(item.title||'Photograph')}" loading="lazy"><div class="g-overlay"><div class="g-cat">${esc(label(item.category))}</div><div class="g-title">${esc(item.title||'New Photograph')}</div><div class="g-loc">${esc(item.location||'Studio')} · ${esc(item.date||'')}</div></div></div>`;return card}
 function getStaticCategory(card){
   const values=[card.dataset.category,card.dataset.cat,card.getAttribute('data-filter'),card.querySelector('.g-cat')?.textContent,card.querySelector('.category')?.textContent,card.querySelector('.tag')?.textContent];
   return values.map(categoryKey).find(v=>['street','covers','picsarts','posters'].includes(v)) || '';
 }
 function applyFilter(){
   const g=gallery();if(!g)return;
   /* Keep existing/static portfolio photos and filter them by their category label. */
   g.querySelectorAll('.g-card:not(.live-admin-photo), .portfolio-card, .photo-card, [data-category]').forEach(card=>{
     if(card.closest('#live-photo-filters'))return;
     const key=getStaticCategory(card);
     const show=activeFilter==='all'||key===activeFilter;
     card.style.display=show?'':'none';
   });
   /* Live/admin photos are filtered from Supabase when available. */
   g.querySelectorAll('.live-admin-photo').forEach(card=>{card.style.display=(activeFilter==='all'||categoryKey(card.dataset.category)===activeFilter)?'':'none'});
   updateFilterState();
 }
 function renderLiveCards(){
   const g=gallery();if(!g)return;
   g.querySelectorAll('.live-admin-photo').forEach(e=>e.remove());
   liveItems.forEach(x=>g.appendChild(createCard(x)));
   applyFilter();
 }
 function render(){ensureFilters();applyFilter();if(liveItems.length)renderLiveCards()}
 async function load(){
   if(!window.supabase){setTimeout(load,400);return}
   try{
     client=client||window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
     const r=await client.from('posters').select('id,title,category,location,date,description,image_url,display_order,published').eq('published',true).not('image_url','is',null).order('display_order',{ascending:true});
     if(r.error)throw r.error;
     liveItems=(r.data||[]).filter(x=>x.image_url);
     render();
   }catch(e){console.warn('Photography gallery live data unavailable; using existing portfolio photos:',e);render()}
 }
 function style(){const s=document.createElement('style');s.textContent=`#live-photo-filters{display:flex;gap:10px;flex-wrap:wrap;justify-content:center;margin:0 auto 28px;padding:0 16px}#live-photo-filters .filter-btn{cursor:pointer;padding:10px 18px;border:1px solid rgba(212,175,55,.35);border-radius:999px;background:transparent;color:inherit;font:inherit;transition:.25s}#live-photo-filters .filter-btn:hover{transform:translateY(-2px);border-color:#d4af37;color:#d4af37}#live-photo-filters .filter-btn.active,#live-photo-filters .filter-btn[aria-selected="true"]{background:#d4af37!important;color:#050505!important;border-color:#d4af37!important;box-shadow:0 7px 24px rgba(212,175,55,.28)!important;font-weight:700}.live-admin-photo{cursor:pointer}.live-admin-photo .g-card-img{position:relative;overflow:hidden}.live-admin-photo img{width:100%;display:block;object-fit:cover;transition:transform .7s ease}.live-admin-photo:hover img{transform:scale(1.035)}`;document.head.appendChild(s)}
 function start(){style();setTimeout(load,300)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
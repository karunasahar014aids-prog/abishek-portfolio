/* ============================================================
   ABISHEK STUDIO — LIVE PHOTOGRAPHY GALLERY
   Main-page upload studio removed.
============================================================ */
(function () {
  const SUPABASE_URL = 'https://jaryhmtzzassnzomtsch.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_7VIks8jFhtcJtJOMzI5CKA_fPLazRUA';
  const gallery = () => document.getElementById('gallery');
  let liveItems = [];
  let client = null;

  function escapeHTML(value){return String(value??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
  function category(value){return String(value||'other').toLowerCase();}

  function createCard(item){
    const card=document.createElement('div');
    card.className='g-card reveal live-admin-photo';
    card.dataset.livePhoto='true';
    card.dataset.category=category(item.category);
    card.innerHTML=`<div class="g-card-img"><img src="${escapeHTML(item.image_url)}" alt="${escapeHTML(item.title||'Photograph')}" loading="lazy"><div class="g-overlay"><div class="g-cat">${escapeHTML(item.category||'Photography')}</div><div class="g-title">${escapeHTML(item.title||'New Photograph')}</div><div class="g-loc">${escapeHTML(item.location||'Studio')} · ${escapeHTML(item.date||'')}</div></div></div>`;
    const img=card.querySelector('img');
    img.addEventListener('error',()=>{img.style.display='none';card.classList.add('live-photo-error')});
    card.addEventListener('click',()=>openLiveViewer(item));
    return card;
  }

  function openLiveViewer(item){
    let modal=document.getElementById('live-admin-photo-viewer');
    if(!modal){
      modal=document.createElement('div');
      modal.id='live-admin-photo-viewer';
      modal.innerHTML=`<div class="live-viewer-backdrop"><button class="live-viewer-close" type="button">×</button><div class="live-viewer-box"><img id="live-viewer-img" alt=""><div class="live-viewer-info"><span id="live-viewer-cat"></span><h3 id="live-viewer-title"></h3><p id="live-viewer-meta"></p><p id="live-viewer-desc"></p></div></div></div>`;
      document.body.appendChild(modal);
      modal.querySelector('.live-viewer-close').onclick=()=>modal.remove();
      modal.querySelector('.live-viewer-backdrop').onclick=e=>{if(e.target.classList.contains('live-viewer-backdrop'))modal.remove()};
    }
    modal.querySelector('#live-viewer-img').src=item.image_url;
    modal.querySelector('#live-viewer-title').textContent=item.title||'New Photograph';
    modal.querySelector('#live-viewer-cat').textContent=item.category||'Photography';
    modal.querySelector('#live-viewer-meta').textContent=`${item.location||'Studio'} · ${item.date||''}`;
    modal.querySelector('#live-viewer-desc').textContent=item.description||'';
    modal.style.display='block';
  }

  function renderLivePhotos(){
    const host=gallery();
    if(!host)return;
    host.querySelectorAll('.live-admin-photo').forEach(el=>el.remove());
    const active=document.querySelector('.filter-btn.active');
    const filter=active?active.dataset.cat:'all';
    const visible=filter==='all'?liveItems:liveItems.filter(item=>category(item.category)===filter);
    visible.forEach(item=>host.appendChild(createCard(item)));
    if(typeof refreshRevealTargets==='function')refreshRevealTargets();
    if(typeof bindMagnetic==='function')bindMagnetic();
  }

  async function loadLivePhotos(){
    if(!window.supabase||typeof window.supabase.createClient!=='function'){setTimeout(loadLivePhotos,400);return}
    try{
      client=client||window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
      const {data,error}=await client.from('posters').select('id,title,category,location,date,description,image_url,display_order,published').eq('published',true).not('image_url','is',null).order('display_order',{ascending:true});
      if(error)throw error;
      liveItems=Array.isArray(data)?data.filter(x=>x.image_url):[];
      renderLivePhotos();
      console.log(`Live photography gallery: ${liveItems.length} published photo(s) loaded.`)
    }catch(error){console.warn('Live photography gallery could not load:',error)}
  }

  function watchFilters(){
    document.addEventListener('click',event=>{
      if(event.target.closest('.filter-btn'))setTimeout(renderLivePhotos,80);
      if(event.target.closest('#load-more-btn'))setTimeout(renderLivePhotos,80)
    })
  }

  function injectStyles(){
    const style=document.createElement('style');
    style.textContent=`.live-admin-photo{cursor:pointer;animation:livePhotoIn .7s ease both}.live-admin-photo .g-card-img{position:relative;overflow:hidden}.live-admin-photo img{width:100%;display:block;object-fit:cover;transition:transform .7s cubic-bezier(.2,.7,.2,1)}.live-admin-photo:hover img{transform:scale(1.035)}.live-photo-error{background:#111;min-height:260px;display:flex;align-items:center;justify-content:center}#live-admin-photo-viewer{display:none;position:fixed;inset:0;z-index:99999}.live-viewer-backdrop{position:absolute;inset:0;background:rgba(0,0,0,.88);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:24px}.live-viewer-box{width:min(1000px,96vw);max-height:92vh;overflow:auto;background:#101010;border:1px solid rgba(212,175,55,.28);border-radius:18px}.live-viewer-box>img{width:100%;max-height:68vh;object-fit:contain;background:#050505;display:block}.live-viewer-info{padding:20px 22px 24px;color:#fff}.live-viewer-info span{color:#d4af37;text-transform:uppercase;letter-spacing:2px;font-size:10px}.live-viewer-info h3{margin:7px 0;font-size:25px}.live-viewer-info p{color:#aaa;line-height:1.6;margin:5px 0}.live-viewer-close{position:fixed;right:24px;top:20px;width:44px;height:44px;border-radius:50%;border:1px solid rgba(212,175,55,.45);background:#111;color:#f2cf5b;font-size:28px;cursor:pointer;z-index:2}@keyframes livePhotoIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}`;
    document.head.appendChild(style)
  }

  function start(){injectStyles();watchFilters();setTimeout(loadLivePhotos,500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

/* ABISHEK STUDIO — PHOTOGRAPHY GALLERY CONTROLLER */
(function(){
  'use strict';
  const SUPABASE_URL='https://jaryhmtzzassnzomtsch.supabase.co';
  const SUPABASE_KEY='sb_publishable_7VIks8jFhtcJtJOMzI5CKA_fPLazRUA';
  const CATEGORIES=[['all','All'],['street','Street'],['covers','Covers'],['picsarts','Picsarts'],['posters','Posters']];
  let liveItems=[]; let activeFilter='all'; let client=null; let applying=false;
  const gallery=()=>document.getElementById('gallery');
  const filterBar=()=>document.getElementById('filter-bar');
  function clean(v){return String(v??'').trim().toLowerCase().replace(/[\\_-]+/g,' ').replace(/\s+/g,' ');}
  function categoryKey(v){const c=clean(v);if(c==='all')return'all';if(c.includes('street'))return'street';if(c.includes('cover'))return'covers';if(c.includes('picsart')||c.includes('pics art'))return'picsarts';if(c.includes('poster'))return'posters';return c.replace(/ /g,'');}
  function categoryFromImage(card){
    const src=String(card.querySelector('img')?.getAttribute('src')||card.querySelector('img')?.currentSrc||'').toLowerCase().replace(/\\/g,'/');
    if(src.includes('/street/'))return'street'; if(src.includes('/gallery/street-'))return'street';
    if(src.includes('/covers/'))return'covers'; if(src.includes('/picsarts/')||src.includes('/picsart/'))return'picsarts'; if(src.includes('/posters/'))return'posters';
    const dataCat=card.dataset.category||card.dataset.cat||card.getAttribute('data-filter');
    const label=card.querySelector('.g-cat')?.textContent||''; return categoryKey(dataCat||label);
  }
  function updateButtons(){const bar=filterBar();if(!bar)return;bar.querySelectorAll('.filter-btn').forEach(b=>{const key=categoryKey(b.dataset.cat||b.textContent);b.dataset.cat=key;b.classList.toggle('active',key===activeFilter);b.setAttribute('aria-selected',key===activeFilter?'true':'false');});}
  function ensureFilterButtons(){
    const bar=filterBar(); if(!bar)return false;
    if(!bar.dataset.finalGalleryController){
      bar.dataset.finalGalleryController='1'; bar.innerHTML='';
      CATEGORIES.forEach(([value,text])=>{const b=document.createElement('button');b.type='button';b.className='filter-btn';b.dataset.cat=value;b.textContent=text;bar.appendChild(b);});
      bar.addEventListener('click',e=>{
        const b=e.target.closest('.filter-btn'); if(!b)return; e.preventDefault(); e.stopImmediatePropagation();
        activeFilter=categoryKey(b.dataset.cat);
        /* Important: the old handler was stopped here without rendering the
           selected category. That caused every category to show only the few
           cards from the initial All view. Render the selected category first. */
        try{activeCat=activeFilter;visibleCount=PAGE_SIZE;}catch(_e){}
        if(typeof window.renderGallery==='function')window.renderGallery(activeFilter);
        updateButtons(); applyFilter();
      },true);
    }
    updateButtons(); return true;
  }
  function staticCards(){const g=gallery();return g?Array.from(g.querySelectorAll('.g-card:not(.live-admin-photo)')):[];}
  function applyFilter(){
    const g=gallery(); if(!g||applying)return; applying=true;
    try{
      ensureFilterButtons();
      staticCards().forEach(card=>{const key=categoryFromImage(card);const show=activeFilter==='all'||key===activeFilter;card.dataset.category=key;card.style.display=show?'':'none';if(show){card.style.visibility='visible';card.style.opacity='1';}});
      g.querySelectorAll('.live-admin-photo').forEach(card=>{const key=categoryKey(card.dataset.category||'');const show=activeFilter==='all'||key===activeFilter;card.style.display=show?'':'none';if(show){card.style.visibility='visible';card.style.opacity='1';}});
      updateButtons();
    }finally{applying=false;}
  }
  function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');}
  function createLiveCard(item){const card=document.createElement('div');card.className='g-card reveal live-admin-photo';card.dataset.category=categoryKey(item.category);card.innerHTML=`<div class="g-card-img"><img src="${esc(item.image_url)}" alt="${esc(item.title||'Photograph')}" loading="lazy"><div class="g-overlay"><div class="g-cat">${esc(item.category||'Photography')}</div><div class="g-title">${esc(item.title||'New Photograph')}</div><div class="g-loc">${esc(item.location||'Studio')} · ${esc(item.date||'')}</div></div></div>`;return card;}
  function renderLiveCards(){const g=gallery();if(!g)return;g.querySelectorAll('.live-admin-photo').forEach(x=>x.remove());liveItems.forEach(item=>g.appendChild(createLiveCard(item)));applyFilter();}
  function observeGallery(){const g=gallery();if(!g||g.dataset.finalObserver)return;g.dataset.finalObserver='1';new MutationObserver(()=>{if(!applying)requestAnimationFrame(applyFilter);}).observe(g,{childList:true,subtree:true});}
  function style(){if(document.getElementById('final-gallery-style'))return;const s=document.createElement('style');s.id='final-gallery-style';s.textContent='#filter-bar{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}#filter-bar .filter-btn{cursor:pointer}#filter-bar .filter-btn.active{font-weight:700}#gallery .g-card{visibility:visible}#gallery .g-card img{display:block;width:100%}';document.head.appendChild(s);}
  async function loadLive(){
    if(!window.supabase)return;
    try{client=client||window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);const r=await client.from('posters').select('id,title,category,location,date,description,image_url,display_order,published').eq('published',true).not('image_url','is',null).order('display_order',{ascending:true});if(r.error)throw r.error;liveItems=(r.data||[]).filter(x=>x.image_url);renderLiveCards();}
    catch(e){console.warn('[Abishek Studio] Live photography data unavailable; keeping static gallery.',e);}
  }
  function start(){
    const bar=filterBar(),g=gallery();if(!bar||!g){setTimeout(start,100);return;}style();ensureFilterButtons();observeGallery();
    setTimeout(()=>{if(typeof window.renderGallery==='function'){try{window.renderGallery('all');}catch(_e){}}applyFilter();},150);
    setTimeout(()=>applyFilter(),500);setTimeout(()=>applyFilter(),1500);loadLive();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

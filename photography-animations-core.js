/* ABISHEK STUDIO — PHOTOGRAPHY GALLERY CONTROLLER */
(function(){
  'use strict';
  const SUPABASE_URL='https://jaryhmtzzassnzomtsch.supabase.co';
  const SUPABASE_KEY='sb_publishable_7VIks8jFhtcJtJOMzI5CKA_fPLazRUA';
  const CATEGORIES=[['all','All'],['street','Street'],['covers','Covers'],['picsarts','Picsarts'],['posters','Posters']];
  let liveItems=[]; let activeFilter='all'; let client=null; let applying=false;
  const gallery=()=>document.getElementById('gallery');
  const filterBar=()=>document.getElementById('filter-bar');
  function clean(v){return String(v??'').trim().toLowerCase().replace(/[\_-]+/g,' ').replace(/\s+/g,' ');}
  function categoryKey(v){const c=clean(v);if(c==='all')return'all';if(c.includes('street'))return'street';if(c.includes('cover'))return'covers';if(c.includes('picsart')||c.includes('pics art'))return'picsarts';if(c.includes('poster'))return'posters';return c.replace(/ /g,'');}
  function categoryFromImage(card){
    const dataCat=card.dataset.category||card.dataset.cat||card.getAttribute('data-filter');
    const label=card.querySelector('.g-cat')?.textContent||'';
    const src=String(card.querySelector('img')?.getAttribute('src')||card.querySelector('img')?.currentSrc||'').toLowerCase().replace(/\\/g,'/');
    if(src.includes('/street/')||src.includes('/gallery/street-'))return'street';
    if(src.includes('/covers/'))return'covers';
    if(src.includes('/picsarts/')||src.includes('/picsart/'))return'picsarts';
    if(src.includes('/posters/'))return'posters';
    return categoryKey(dataCat||label);
  }
  function updateButtons(){const bar=filterBar();if(!bar)return;bar.querySelectorAll('.filter-btn').forEach(b=>{const key=categoryKey(b.dataset.cat||b.textContent);b.dataset.cat=key;b.classList.toggle('active',key===activeFilter);b.setAttribute('aria-selected',key===activeFilter?'true':'false');});}
  function ensureFilterButtons(){
    const bar=filterBar();if(!bar)return false;
    if(!bar.dataset.finalGalleryController){
      bar.dataset.finalGalleryController='1';bar.innerHTML='';
      CATEGORIES.forEach(([value,text])=>{const b=document.createElement('button');b.type='button';b.className='filter-btn';b.dataset.cat=value;b.textContent=text;bar.appendChild(b);});
      bar.addEventListener('click',e=>{
        const b=e.target.closest('.filter-btn');if(!b)return;
        e.preventDefault();e.stopImmediatePropagation();
        activeFilter=categoryKey(b.dataset.cat);
        try{activeCat=activeFilter;visibleCount=PAGE_SIZE;}catch(_e){}
        if(typeof window.renderGallery==='function')window.renderGallery(activeFilter);
        renderLiveCards();
        updateButtons();
      },true);
    }
    updateButtons();return true;
  }
  function staticCards(){const g=gallery();return g?Array.from(g.querySelectorAll('.g-card:not(.live-admin-photo)')):[];}
  function applyFilter(){
    const g=gallery();if(!g||applying)return;applying=true;
    try{
      ensureFilterButtons();
      staticCards().forEach(card=>{const key=categoryFromImage(card);const show=activeFilter==='all'||key===activeFilter;card.dataset.category=key;card.style.display=show?'':'none';if(show){card.style.visibility='visible';card.style.opacity='1';}});
      g.querySelectorAll('.live-admin-photo').forEach(card=>{const key=categoryKey(card.dataset.category||'');const show=activeFilter==='all'||key===activeFilter;card.style.display=show?'':'none';if(show){card.style.visibility='visible';card.style.opacity='1';}});
      updateButtons();
    }finally{applying=false;}
  }
  function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;');}
  function freshImageUrl(url){
    const raw=String(url||'');
    if(!raw)return raw;
    return raw+(raw.includes('?')?'&':'?')+'v='+Date.now();
  }
  function createLiveCard(item){
    const card=document.createElement('div');
    card.className='g-card reveal live-admin-photo';
    card.dataset.category=categoryKey(item.category);
    card.dataset.liveId=String(item.id||'');
    card.innerHTML=`<div class="g-card-img"><img src="${esc(freshImageUrl(item.image_url))}" alt="${esc(item.title||'Photograph')}" loading="lazy"><div class="g-overlay"><div class="g-cat">${esc(item.category||'Photography')}</div><div class="g-title">${esc(item.title||'New Photograph')}</div><div class="g-loc">${esc(item.location||'Studio')} · ${esc(item.date||'')}</div></div></div>`;
    card.addEventListener('click',e=>{
      if(e.target.closest('.g-dots,.g-menu,.g-fav-badge'))return;
      e.preventDefault();e.stopPropagation();
      openLiveModal(item);
    },true);
    return card;
  }
  function openLiveModal(item){
    const back=document.getElementById('modal-backdrop');
    const img=document.getElementById('modal-img');
    if(!back||!img)return;
    img.src=freshImageUrl(item.image_url);
    img.alt=item.title||'Photograph';
    const cat=document.getElementById('modal-cat');if(cat)cat.textContent=item.category||'Photography';
    const title=document.getElementById('modal-title');if(title)title.textContent=item.title||'Photograph';
    const desc=document.getElementById('modal-desc');if(desc)desc.textContent=item.description||'';
    const story=document.getElementById('modal-story');if(story)story.textContent='';
    const specs=document.getElementById('modal-specs');
    if(specs)specs.innerHTML=[['Location',item.location||'Studio'],['Date',item.date||'']].map(([l,v])=>`<div class="spec-item"><div class="spec-label">${esc(l)}</div><div class="spec-val">${esc(v)}</div></div>`).join('');
    const tags=document.getElementById('modal-tags');if(tags)tags.innerHTML='';
    const related=document.getElementById('modal-related-row');if(related)related.innerHTML='';
    if(!back.classList.contains('open')&&typeof lockPageScroll==='function')lockPageScroll();
    back.classList.add('open');
  }
  function renderLiveCards(){
    const g=gallery();if(!g)return;
    /* Keep every bundled/static photograph. Admin/Supabase photographs are
       additional gallery items, not replacements for the existing images. */
    g.querySelectorAll('.live-admin-photo').forEach(x=>x.remove());
    liveItems.forEach(item=>g.appendChild(createLiveCard(item)));
    applyFilter();
  }
  function observeGallery(){const g=gallery();if(!g||g.dataset.finalObserver)return;g.dataset.finalObserver='1';new MutationObserver(()=>{if(!applying)requestAnimationFrame(applyFilter);}).observe(g,{childList:true,subtree:true});}
  function style(){if(document.getElementById('final-gallery-style'))return;const s=document.createElement('style');s.id='final-gallery-style';s.textContent='#filter-bar{display:flex;gap:10px;flex-wrap:wrap;justify-content:center}#filter-bar .filter-btn{cursor:pointer}#filter-bar .filter-btn.active{font-weight:700}#gallery .g-card{visibility:visible}#gallery .g-card img{display:block;width:100%}#modal .modal-img{overflow:hidden!important;display:flex!important;align-items:center!important;justify-content:center!important;background:#080808!important}#modal #modal-img{display:block!important;width:100%!important;height:100%!important;max-width:100%!important;max-height:100%!important;object-fit:contain!important;object-position:center center!important;transform-origin:center center;transition:transform .22s ease;cursor:zoom-in!important;image-rendering:auto!important}.photo-zoom-controls{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);display:flex;gap:6px;z-index:20;padding:6px;border:1px solid rgba(255,255,255,.18);border-radius:999px;background:rgba(0,0,0,.72);backdrop-filter:blur(10px)}.photo-zoom-controls button{border:0;border-radius:999px;padding:6px 11px;background:transparent;color:#fff;font:600 12px/1 system-ui,sans-serif;cursor:pointer}.photo-zoom-controls button.active{background:#FFD400;color:#080808}.photo-zoom-controls button:hover{background:rgba(255,255,255,.15)}.photo-zoom-controls button.active:hover{background:#FFD400}.modal-img.zoom-scroll{overflow:auto!important;overscroll-behavior:contain}';document.head.appendChild(s);}
  function initPhotoZoom(){
    const wrap=document.querySelector('.modal-img');
    const img=document.getElementById('modal-img');
    const modal=document.getElementById('modal');
    if(!wrap||!img||!modal)return;
    if(wrap.dataset.zoomReady==='1')return;
    wrap.dataset.zoomReady='1';
    wrap.classList.add('zoom-scroll');
    let level=1;
    const controls=document.createElement('div');
    controls.className='photo-zoom-controls';
    controls.setAttribute('aria-label','Photo zoom');
    [1,2,3].forEach(value=>{
      const btn=document.createElement('button');
      btn.type='button';btn.textContent=value+'x';btn.dataset.zoom=String(value);btn.setAttribute('aria-label','Zoom '+value+'x');
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();setZoom(value);});
      controls.appendChild(btn);
    });
    wrap.appendChild(controls);
    function setZoom(value){
      level=Math.max(1,Math.min(3,value));
      img.style.transform='scale('+level+')';
      img.style.transformOrigin='center center';
      img.style.cursor=level>1?'zoom-out':'zoom-in';
      controls.querySelectorAll('button').forEach(b=>b.classList.toggle('active',Number(b.dataset.zoom)===level));
    }
    img.addEventListener('click',()=>setZoom(level===1?2:1));
    wrap.addEventListener('wheel',e=>{
      if(!document.getElementById('modal-backdrop')?.classList.contains('open'))return;
      e.preventDefault();
      setZoom(level+(e.deltaY<0?1:-1));
    },{passive:false});
    setZoom(1);
    const reset=()=>setZoom(1);
    const observer=new MutationObserver(()=>{if(img.getAttribute('src')){reset();}});
    observer.observe(img,{attributes:true,attributeFilter:['src']});
    modal.addEventListener('click',e=>{if(e.target===modal)reset();});
  }
  function observeModal(){
    const back=document.getElementById('modal-backdrop');
    if(!back||back.dataset.zoomObserver==='1')return;
    back.dataset.zoomObserver='1';
    const tryInit=()=>setTimeout(initPhotoZoom,30);
    new MutationObserver(tryInit).observe(back,{attributes:true,childList:true,subtree:true,attributeFilter:['class','style','src']});
    document.addEventListener('click',e=>{if(e.target.closest('.g-card,.modal-next,.modal-prev,.modal-related-row'))tryInit();},true);
    tryInit();
  }
  async function loadLive(){
    if(!window.supabase)return;
    try{client=client||window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);const r=await client.from('posters').select('id,title,category,location,date,description,image_url,display_order,published').eq('published',true).not('image_url','is',null).order('display_order',{ascending:true});if(r.error)throw r.error;liveItems=(r.data||[]).filter(x=>x.image_url);renderLiveCards();}
    catch(e){console.warn('[Abishek Studio] Live photography data unavailable; keeping static gallery.',e);}
  }
  function start(){
    const bar=filterBar(),g=gallery();if(!bar||!g){setTimeout(start,100);return;}style();ensureFilterButtons();observeGallery();observeModal();
    setTimeout(()=>{if(typeof window.renderGallery==='function'){try{window.renderGallery('all');}catch(_e){}}renderLiveCards();applyFilter();},150);
    setTimeout(()=>applyFilter(),500);setTimeout(()=>applyFilter(),1500);loadLive();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
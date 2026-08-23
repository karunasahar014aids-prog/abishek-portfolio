/* ABISHEK STUDIO — LIVE PORTFOLIO CONTENT SYNC */
(function(){
  const URL='https://jaryhmtzzassnzomtsch.supabase.co';
  const KEY='sb_publishable_7VIks8jFhtcJtJOMzI5CKA_fPLazRUA';
  let sb;

  function setText(s,v){if(v==null||v==='')return;const e=document.querySelector(s);if(e)e.textContent=v}
  function setAttr(s,a,v){if(!v)return;const e=document.querySelector(s);if(e)e.setAttribute(a,v)}
  function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/\"/g,'&quot;').replace(/'/g,'&#039;')}

  function apply(c){
    setText('.hero-eyebrow',c.heroEyebrow);setText('.hero-title .line span',c.heroTitle);setText('.hero-role',c.heroRole);setText('.hero-desc',c.heroDescription);
    setText('.a-title',c.aboutTitle);setText('.a-body-in',c.aboutDescription);setText('.footer-cta-title',c.footerTitle);setText('.footer-cta-desc',c.footerDescription);
    setAttr('.hero-portrait-frame img','src',c.heroImage);
    if(Array.isArray(c.projects)&&c.projects.length){
      const g=document.getElementById('projects-grid');
      if(g)g.innerHTML=c.projects.map(p=>`<div class="p-card reveal"><div class="p-cover"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"></div><div class="p-body"><div class="p-role">${esc(p.role)}</div><h3 class="p-title">${esc(p.title)}</h3><p class="p-desc">${esc(p.description)}</p><div class="p-meta"><span>${esc(p.software)}</span><span>${esc(p.duration)}</span></div>${p.link?`<a href="${esc(p.link)}" target="_blank" rel="noopener" class="p-link">View Case Study ↗</a>`:''}</div></div>`).join('');
      if(typeof refreshRevealTargets==='function')refreshRevealTargets();
    }
  }

  function addLiveGalleryStyles(){
    if(document.getElementById('live-gallery-styles'))return;
    const s=document.createElement('style');s.id='live-gallery-styles';
    s.textContent=`
      #gallery .live-admin-photo{position:relative;overflow:hidden;border-radius:18px;background:#eef2f7;margin:0 0 22px;break-inside:avoid;cursor:pointer;box-shadow:0 10px 30px rgba(17,24,39,.10);transform:translateY(18px);opacity:0;transition:transform .7s ease,opacity .7s ease,box-shadow .3s ease}
      #gallery .live-admin-photo.live-visible{transform:translateY(0);opacity:1}
      #gallery .live-admin-photo:hover{box-shadow:0 18px 45px rgba(17,24,39,.18)}
      #gallery .live-admin-photo img{display:block;width:100%;height:auto;min-height:220px;object-fit:cover;transition:transform .7s ease;}
      #gallery .live-admin-photo:hover img{transform:scale(1.045)}
      #gallery .live-admin-photo .live-photo-info{position:absolute;left:0;right:0;bottom:0;padding:28px 18px 16px;color:#fff;background:linear-gradient(transparent,rgba(0,0,0,.78));}
      #gallery .live-admin-photo .live-photo-cat{font-size:10px;letter-spacing:.16em;text-transform:uppercase;opacity:.8}
      #gallery .live-admin-photo .live-photo-title{margin:5px 0 2px;font-size:18px;font-weight:700}
      #gallery .live-admin-photo .live-photo-meta{font-size:12px;opacity:.8}
      .live-gallery-empty{padding:18px;border:1px dashed #dbe1ea;border-radius:14px;color:#667085;font-size:13px}
    `;
    document.head.appendChild(s);
  }

  function addLivePhotoToGallery(p){
    const gallery=document.getElementById('gallery');
    if(!gallery || !p || !p.image_url)return;
    if(gallery.querySelector(`[data-admin-photo-id="${esc(p.id)}"]`))return;

    const card=document.createElement('article');
    card.className='live-admin-photo';
    card.dataset.adminPhotoId=p.id;
    card.dataset.cat=(p.category||'other').toLowerCase();
    card.innerHTML=`<img src="${esc(p.image_url)}" alt="${esc(p.title||'Photography')}" loading="lazy"><div class="live-photo-info"><div class="live-photo-cat">${esc(p.category||'Photography')}</div><div class="live-photo-title">${esc(p.title||'Untitled Photograph')}</div><div class="live-photo-meta">${esc(p.location||'')} ${p.date?'• '+esc(p.date):''}</div></div>`;
    card.addEventListener('click',()=>{
      if(typeof window.openGalleryModal==='function')window.openGalleryModal(p.image_url,p.title||'Photography');
      else window.open(p.image_url,'_blank','noopener');
    });
    gallery.prepend(card);
    requestAnimationFrame(()=>requestAnimationFrame(()=>card.classList.add('live-visible')));
  }

  async function syncPublishedPhotos(){
    const gallery=document.getElementById('gallery');
    if(!gallery || !sb)return;
    try{
      const {data,error}=await sb.from('posters').select('id,title,category,location,date,description,image_url,display_order,published').eq('published',true).not('image_url','is',null).order('display_order',{ascending:true});
      if(error)throw error;
      addLiveGalleryStyles();
      (data||[]).forEach(addLivePhotoToGallery);
      window.__liveAdminPhotos=data||[];
      console.log('[Abishek Studio] Published admin photos synced:',(data||[]).length);
    }catch(error){console.warn('[Abishek Studio] Gallery sync failed:',error)}
  }

  async function start(){
    try{
      if(!window.supabase){console.warn('[Abishek Studio] Supabase SDK not available');return;}
      sb=window.supabase.createClient(URL,KEY);
      const r=await sb.from('portfolio_settings').select('content').limit(1).maybeSingle();
      if(r.data?.content)apply(r.data.content);
      syncPublishedPhotos();
      setTimeout(syncPublishedPhotos,1000);
      setTimeout(syncPublishedPhotos,3000);
    }catch(e){console.warn('Portfolio content sync failed:',e)}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

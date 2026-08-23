(function(){
  const URL='https://jaryhmtzzassnzomtsch.supabase.co';
  const KEY='sb_publishable_7VIks8jFhtcJtJOMzI5CKA_fPLazRUA';
  let client;
  function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');}
  function setText(s,v){if(v==null||v==='')return;const e=document.querySelector(s);if(e)e.textContent=v;}
  function setAttr(s,a,v){if(!v)return;const e=document.querySelector(s);if(e)e.setAttribute(a,v);}
  async function start(){
    if(!window.supabase)return;
    client=window.supabase.createClient(URL,KEY);
    try{
      const r=await client.from('portfolio_settings').select('content').limit(1).maybeSingle();
      if(r.data&&r.data.content)apply(r.data.content);
    }catch(e){console.warn('Settings sync failed',e);}
    try{
      const r=await client.from('posters').select('*').eq('published',true).order('display_order',{ascending:true});
      if(r.data&&r.data.length)photos(r.data);
    }catch(e){console.warn('Photo sync failed',e);}
  }
  function apply(c){
    setText('.hero-eyebrow',c.heroEyebrow);setText('.hero-title .line span',c.heroTitle);setText('.hero-role',c.heroRole);setText('.hero-desc',c.heroDescription);
    setText('.a-title',c.aboutTitle);setText('.a-body-in',c.aboutDescription);setText('.footer-cta-title',c.footerTitle);setText('.footer-cta-desc',c.footerDescription);
    setAttr('.hero-portrait-frame img','src',c.heroImage);
    if(Array.isArray(c.projects)&&c.projects.length){const g=document.getElementById('projects-grid');if(g)g.innerHTML=c.projects.map(p=>`<div class="p-card reveal"><div class="p-cover"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"></div><div class="p-body"><div class="p-role">${esc(p.role)}</div><h3 class="p-title">${esc(p.title)}</h3><p class="p-desc">${esc(p.description)}</p><div class="p-meta"><span>${esc(p.software)}</span><span>${esc(p.duration)}</span></div>${p.link?`<a href="${esc(p.link)}" target="_blank" rel="noopener" class="p-link">View Case Study ↗</a>`:''}</div></div>`).join('');}}
  }
  function photos(items){
    const g=document.getElementById('gallery');if(!g)return;
    g.querySelectorAll('.remote-admin-photo').forEach(e=>e.remove());
    items.filter(p=>p.image_url).slice().reverse().forEach(p=>{const c=document.createElement('div');c.className='g-card reveal remote-admin-photo';c.innerHTML=`<div class="g-card-img"><img src="${esc(p.image_url)}" style="height:520px;object-fit:cover" alt="${esc(p.title)}" loading="lazy"><div class="g-overlay"><div class="g-cat">${esc(p.category||'Photography')}</div><div class="g-title">${esc(p.title)}</div><div class="g-loc">${esc(p.location||'')} ${p.date?'· '+esc(p.date):''}</div></div></div>`;c.onclick=()=>modal(p);g.prepend(c);});
  }
  function modal(p){const old=document.getElementById('remote-photo-modal');if(old)old.remove();const m=document.createElement('div');m.id='remote-photo-modal';m.innerHTML=`<div class="remote-photo-backdrop"><div class="remote-photo-box"><button>×</button><img src="${esc(p.image_url)}" alt="${esc(p.title)}"><div><span>${esc(p.category||'Photography')}</span><h2>${esc(p.title)}</h2><p>${esc(p.description||'')}</p><small>${esc(p.location||'')} ${p.date?'· '+esc(p.date):''}</small></div></div></div>`;document.body.appendChild(m);m.querySelector('button').onclick=()=>m.remove();m.querySelector('.remote-photo-backdrop').onclick=e=>{if(e.target===e.currentTarget)m.remove();};}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
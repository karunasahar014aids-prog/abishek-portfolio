/* ABISHEK STUDIO — LIVE PORTFOLIO CONTENT SYNC */
(function(){
  const URL='https://jaryhmtzzassnzomtsch.supabase.co';
  const KEY='sb_publishable_7VIks8jFhtcJtJOMzI5CKA_fPLazRUA';
  function setText(s,v){if(v==null||v==='')return;const e=document.querySelector(s);if(e)e.textContent=v}
  function setAttr(s,a,v){if(!v)return;const e=document.querySelector(s);if(e)e.setAttribute(a,v)}
  function esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;')}
  function apply(c){
    setText('.hero-eyebrow',c.heroEyebrow);setText('.hero-title .line span',c.heroTitle);setText('.hero-role',c.heroRole);setText('.hero-desc',c.heroDescription);
    setText('.a-title',c.aboutTitle);setText('.a-body-in',c.aboutDescription);setText('.footer-cta-title',c.footerTitle);setText('.footer-cta-desc',c.footerDescription);
    setAttr('.hero-portrait-frame img','src',c.heroImage);
    if(Array.isArray(c.projects)&&c.projects.length){const g=document.getElementById('projects-grid');if(g)g.innerHTML=c.projects.map(p=>`<div class="p-card reveal"><div class="p-cover"><img src="${esc(p.image)}" alt="${esc(p.title)}" loading="lazy"></div><div class="p-body"><div class="p-role">${esc(p.role)}</div><h3 class="p-title">${esc(p.title)}</h3><p class="p-desc">${esc(p.description)}</p><div class="p-meta"><span>${esc(p.software)}</span><span>${esc(p.duration)}</span></div>${p.link?`<a href="${esc(p.link)}" target="_blank" rel="noopener" class="p-link">View Case Study ↗</a>`:''}</div></div>`).join('');if(typeof refreshRevealTargets==='function')refreshRevealTargets()}
  }
  async function start(){if(!window.supabase)return;const sb=window.supabase.createClient(URL,KEY);try{const r=await sb.from('portfolio_settings').select('content').limit(1).maybeSingle();if(r.data?.content)apply(r.data.content)}catch(e){console.warn('Portfolio content sync failed:',e)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();

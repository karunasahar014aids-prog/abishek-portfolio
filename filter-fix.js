/* ABISHEK STUDIO — FINAL HARD PHOTOGRAPHY FILTER */
(function(){
  'use strict';
  const LABELS={all:'All',street:'Street',covers:'Covers',picsarts:'Picsarts',posters:'Posters'};
  const SIZE=8;
  let active='all';
  let limit=SIZE;
  let rendering=false;

  const norm=v=>String(v??'').toLowerCase().trim().replace(/[\s_-]+/g,'');
  const canonical=v=>{
    const x=norm(v);
    if(x==='street'||x==='streetphotography'||x==='streetphoto')return 'street';
    if(x==='cover'||x==='covers'||x==='coverphoto'||x==='coverphotos')return 'covers';
    if(x==='picsart'||x==='picsarts'||x==='picsartphoto'||x==='picsartphotos')return 'picsarts';
    if(x==='poster'||x==='posters'||x==='posterphoto'||x==='posterphotos')return 'posters';
    return x==='all'?'all':x;
  };
  const data=()=>typeof galleryData!=='undefined'&&Array.isArray(galleryData)?galleryData:[];
  const items=cat=>data().filter(x=>canonical(x.cat)===cat);

  function galleryEl(){return document.getElementById('gallery');}
  function filterBar(){return document.getElementById('filter-bar');}

  function setupButtons(){
    const bar=filterBar(); if(!bar)return;
    bar.style.display='flex';bar.style.visibility='visible';bar.style.opacity='1';
    bar.querySelectorAll('.filter-btn').forEach(btn=>{
      const c=canonical(btn.dataset.cat||btn.textContent||'all');
      btn.dataset.cat=c;
      btn.textContent=LABELS[c]||btn.textContent;
      btn.style.display='inline-flex';btn.style.visibility='visible';btn.style.opacity='1';
    });
  }

  function buildCard(item,index){
    const gid=data().indexOf(item);
    const card=document.createElement('div');
    card.className='g-card reveal';
    card.dataset.gid=String(gid);
    card.dataset.category=canonical(item.cat);
    card.dataset.idx=String(index);
    const src=item.img||'';
    card.innerHTML=`<div class="g-card-img"><img src="${src}" alt="${item.title||''}" loading="lazy" style="height:${item.h||520}px;object-fit:cover"><div class="g-overlay"><div class="g-cat">${item.cat||''}</div><div class="g-title">${item.title||''}</div><div class="g-loc">${item.loc||''} · ${item.date||''}</div></div></div><div class="g-dots" aria-label="Photo menu" role="button" tabindex="0"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></div><div class="g-menu"><button data-act="view">View Details</button><button data-act="share">Share</button><button data-act="download">Download</button></div>`;
    if(typeof withFallback==='function')withFallback(card.querySelector('img'),'gal-'+gid);
    return card;
  }

  function cardCategory(card){
    const gid=Number(card.dataset.gid);
    if(Number.isInteger(gid)&&data()[gid])return canonical(data()[gid].cat);
    const declared=canonical(card.dataset.category||'');
    if(['street','covers','picsarts','posters'].includes(declared))return declared;
    const img=(card.querySelector('img')?.getAttribute('src')||'').toLowerCase();
    if(/(?:^|[\/])street(?:-|[\/]|photo)/.test(img))return 'street';
    if(/(?:^|[\/])covers?(?:-|[\/])/.test(img))return 'covers';
    if(/(?:^|[\/])picsarts?(?:-|[\/])/.test(img))return 'picsarts';
    if(/(?:^|[\/])posters?(?:-|[\/])/.test(img))return 'posters';
    const text=norm(card.querySelector('.g-cat')?.textContent||'');
    return canonical(text);
  }

  /* Remove/hide every card that does not belong to the selected category.
     This also protects against the original gallery renderer adding cards
     after this file has rendered the selected category. */
  function hardPrune(){
    const g=galleryEl();if(!g)return;
    g.querySelectorAll('.g-card').forEach(card=>{
      const ok=active==='all'||cardCategory(card)===active;
      card.hidden=!ok;
      card.style.display=ok?'':'none';
      card.setAttribute('aria-hidden',ok?'false':'true');
    });
  }

  function render(){
    const g=galleryEl();if(!g||!data().length)return;
    const selected=items(active);
    rendering=true;
    g.innerHTML='';
    selected.slice(0,limit).forEach((item,i)=>g.appendChild(buildCard(item,i)));
    const wrap=document.querySelector('.view-more-wrap');
    let more=document.getElementById('load-more-btn');
    if(!more&&wrap){
      more=document.createElement('button');
      more.id='load-more-btn';more.type='button';more.className='btn btn-outline magnetic';
      more.textContent='View More';wrap.appendChild(more);
    }
    if(more){
      more.style.display=limit<selected.length?'inline-flex':'none';
      more.dataset.category=active;
    }
    rendering=false;
    hardPrune();
    if(typeof refreshRevealTargets==='function')refreshRevealTargets();
    if(typeof bindMagnetic==='function')bindMagnetic();
  }

  function choose(cat){
    active=canonical(cat||'all');
    limit=SIZE;
    const bar=filterBar();
    bar?.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',canonical(b.dataset.cat)===active));
    render();
  }

  function bind(){
    setupButtons();
    const bar=filterBar();
    if(bar&&!bar.dataset.finalGalleryFilter){
      bar.dataset.finalGalleryFilter='1';
      bar.addEventListener('click',e=>{
        const btn=e.target.closest('.filter-btn');if(!btn)return;
        e.preventDefault();e.stopImmediatePropagation();
        choose(btn.dataset.cat||'all');
      },true);
    }
    document.addEventListener('click',e=>{
      const more=e.target.closest('#load-more-btn');if(!more)return;
      e.preventDefault();e.stopImmediatePropagation();
      const selected=items(active);limit=Math.min(limit+SIZE,selected.length);render();
    },true);
    const g=galleryEl();
    if(g&&!g.dataset.finalGalleryObserver){
      g.dataset.finalGalleryObserver='1';
      new MutationObserver(()=>{if(!rendering)hardPrune()}).observe(g,{childList:true,subtree:true});
    }
    choose(filterBar()?.querySelector('.filter-btn.active')?.dataset.cat||'all');
    /* Keep the selected category isolated even if another legacy handler
       redraws the gallery after navigation/hash changes. */
    let ticks=0;
    const timer=setInterval(()=>{hardPrune();if(++ticks>30)clearInterval(timer)},200);
  }

  function wait(){
    setupButtons();
    if(typeof galleryData==='undefined'||!galleryEl()){setTimeout(wait,100);return;}
    bind();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();
})();
/* ABISHEK STUDIO — STABLE PHOTOGRAPHY FILTER */
(function(){
  'use strict';
  const LABELS={all:'All',street:'Street',covers:'Covers',picsarts:'Picsarts',posters:'Posters'};
  let active='all';

  const normalize=v=>String(v??'').toLowerCase().trim().replace(/[\s_-]+/g,'');
  const canonical=v=>{
    const x=normalize(v);
    if(x==='street'||x==='streetphotography'||x==='streetphoto')return 'street';
    if(x==='cover'||x==='covers'||x==='coverphoto'||x==='coverphotos')return 'covers';
    if(x==='picsart'||x==='picsarts'||x==='picsartphoto'||x==='picsartphotos')return 'picsarts';
    if(x==='poster'||x==='posters'||x==='posterphoto'||x==='posterphotos')return 'posters';
    return x==='all'?'all':x;
  };
  const data=()=>Array.isArray(window.galleryData)?window.galleryData:(typeof galleryData!=='undefined'?galleryData:[]);
  const listFor=cat=>{
    const c=canonical(cat);
    return data().filter(item=>c==='all'||canonical(item.cat)===c);
  };
  const galleryEl=()=>document.getElementById('gallery');
  const barEl=()=>document.getElementById('filter-bar');

  function setupButtons(){
    const bar=barEl();if(!bar)return;
    bar.style.display='flex';bar.style.visibility='visible';bar.style.opacity='1';
    bar.querySelectorAll('.filter-btn').forEach(btn=>{
      const c=canonical(btn.dataset.cat||btn.textContent||'all');
      btn.dataset.cat=c;
      btn.textContent=LABELS[c]||btn.textContent;
      btn.style.display='inline-flex';btn.style.visibility='visible';btn.style.opacity='1';
    });
  }

  function makeCard(item,index){
    const all=data();
    const gid=all.indexOf(item);
    const fav=typeof isFavorited==='function'&&isFavorited(gid);
    const raw=item.img||'';
    const src=typeof IMG==='function'?IMG(raw,700):raw;
    const card=document.createElement('div');
    card.className='g-card reveal';
    card.dataset.gid=String(gid);
    card.dataset.category=canonical(item.cat);
    card.dataset.idx=String(index);
    card.innerHTML=`<div class="g-card-img"><img src="${src}" alt="${item.title||''}" loading="lazy" style="height:${item.h||520}px;object-fit:cover;display:block;width:100%;"><button class="g-fav-badge${fav?' favorited':''}" data-act="favorite" aria-label="Favorite this photo"><svg width="16" height="16" viewBox="0 0 24 24" fill="${fav?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5 5 0 00-7.1 0L12 6.3l-1.7-1.7a5 5 0 00-7.1 7.1L12 21l8.8-9.3a5 5 0 000-7.1z"/></svg></button><div class="g-overlay"><div class="g-cat">${item.cat||''}</div><div class="g-title">${item.title||''}</div><div class="g-loc">${item.loc||''} · ${item.date||''}</div></div></div><div class="g-dots" aria-label="Photo menu" role="button" tabindex="0"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></div><div class="g-menu"><button data-act="view">View Details</button><button data-act="share">Share</button><button data-act="download">Download</button><button class="fav-menu-item${fav?' favorited':''}" data-act="favorite">${fav?'Favorited':'Favorite'}</button></div>`;
    const img=card.querySelector('img');
    if(typeof withFallback==='function')withFallback(img,'gal-'+gid);
    return card;
  }

  function removeViewMore(){
    document.querySelectorAll('#load-more-btn,.view-more-wrap').forEach(el=>el.remove());
  }

  function render(){
    const g=galleryEl();if(!g)return;
    const selected=listFor(active);
    g.innerHTML='';
    selected.forEach((item,i)=>g.appendChild(makeCard(item,i)));
    removeViewMore();
    if(typeof refreshRevealTargets==='function')refreshRevealTargets();
    if(typeof bindMagnetic==='function')bindMagnetic();
  }

  function choose(cat){
    active=canonical(cat||'all');
    const bar=barEl();
    bar?.querySelectorAll('.filter-btn').forEach(btn=>btn.classList.toggle('active',canonical(btn.dataset.cat)===active));
    render();
  }

  function bind(){
    setupButtons();
    removeViewMore();
    const bar=barEl();
    if(bar&&!bar.dataset.stablePhotographyFilter){
      bar.dataset.stablePhotographyFilter='1';
      bar.addEventListener('click',e=>{
        const btn=e.target.closest('.filter-btn');if(!btn)return;
        e.preventDefault();e.stopImmediatePropagation();
        choose(btn.dataset.cat||'all');
      },true);
    }
    const initial=bar?.querySelector('.filter-btn.active')?.dataset.cat||'all';
    choose(initial);
  }

  function wait(){
    setupButtons();
    const g=galleryEl();
    if(!g||typeof galleryData==='undefined'){setTimeout(wait,100);return;}
    bind();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wait);else wait();
})();
/* ABISHEK STUDIO — PHOTOGRAPHY CATEGORY ISOLATION FIX */
(function(){
'use strict';
const PAGE_SIZE=4;
let active='all',visibleCount=PAGE_SIZE;

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

/* The image folder is the source of truth. This prevents an incorrectly
   saved admin category from putting a photo into another category. */
const categoryFromImage=item=>{
  const src=String(item?.img||'').toLowerCase().replace(/\\/g,'/');
  if(src.includes('/street/'))return 'street';
  if(src.includes('/covers/'))return 'covers';
  if(src.includes('/picsarts/')||src.includes('/picsart/'))return 'picsarts';
  if(src.includes('/posters/'))return 'posters';
  return canonical(item?.cat||'all');
};

const cleanData=()=>{
  const seen=new Set();
  return data().filter(item=>{
    if(!item||!item.img)return false;
    const key=String(item.img).trim().toLowerCase();
    if(seen.has(key))return false;
    seen.add(key);
    return true;
  }).map(item=>({...item,cat:categoryFromImage(item)}));
};

const selected=()=>{
  const c=canonical(active);
  return cleanData().filter(x=>c==='all'||x.cat===c);
};

const gallery=()=>document.getElementById('gallery');
const bar=()=>document.getElementById('filter-bar');

function render(){
  const g=gallery();
  if(!g)return;
  const list=selected();
  g.innerHTML='';

  list.slice(0,visibleCount).forEach(item=>{
    const originalIndex=data().indexOf(item);
    const gid=originalIndex>=0?originalIndex:0;
    const src=typeof IMG==='function'?IMG(item.img||'',700):(item.img||'');
    const card=document.createElement('div');
    card.className='g-card reveal';
    card.dataset.gid=gid;
    card.dataset.category=item.cat;
    card.dataset.image=item.img;
    card.innerHTML='<div class="g-card-img"><img src="'+src+'" alt="'+(item.title||'')+'" loading="lazy" style="height:'+(item.h||520)+'px;object-fit:cover;display:block;width:100%"><div class="g-overlay"><div class="g-cat">'+(item.cat||'')+'</div><div class="g-title">'+(item.title||'')+'</div><div class="g-loc">'+(item.loc||'')+' · '+(item.date||'')+'</div></div></div><div class="g-dots" aria-label="Photo menu" role="button" tabindex="0"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></div>';
    if(typeof withFallback==='function')withFallback(card.querySelector('img'),'gal-'+gid);
    g.appendChild(card);
  });

  document.querySelectorAll('#load-more-btn,.view-more-wrap').forEach(x=>x.remove());
  if(visibleCount<list.length){
    const w=document.createElement('div');
    w.className='view-more-wrap';
    const b=document.createElement('button');
    b.id='load-more-btn';
    b.type='button';
    b.className='btn btn-outline magnetic';
    b.textContent='View More';
    w.appendChild(b);
    g.parentElement.appendChild(w);
  }
  if(typeof refreshRevealTargets==='function')refreshRevealTargets();
}

function choose(cat){
  active=canonical(cat||'all');
  visibleCount=PAGE_SIZE;
  const b=bar();
  if(b)b.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.classList.toggle('active',canonical(btn.dataset.cat||btn.textContent)===active);
  });
  render();
}

function start(){
  const b=bar();
  if(!b||!gallery()||typeof galleryData==='undefined'){
    setTimeout(start,100);
    return;
  }

  b.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.dataset.cat=canonical(btn.dataset.cat||btn.textContent);
  });

  if(!b.dataset.categoryIsolated){
    b.dataset.categoryIsolated='1';
    b.addEventListener('click',e=>{
      const btn=e.target.closest('.filter-btn');
      if(!btn)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      choose(btn.dataset.cat);
    },true);
  }

  if(!document.documentElement.dataset.moreIsolated){
    document.documentElement.dataset.moreIsolated='1';
    document.addEventListener('click',e=>{
      const btn=e.target.closest('#load-more-btn');
      if(!btn)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      const list=selected();
      visibleCount=Math.min(visibleCount+PAGE_SIZE,list.length);
      render();
    },true);
  }

  choose(b.querySelector('.filter-btn.active')?.dataset.cat||'all');
}

if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
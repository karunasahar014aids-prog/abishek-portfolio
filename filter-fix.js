/* ABISHEK STUDIO — STRICT PHOTOGRAPHY CATEGORY FILTER */
(function(){
  const labels={all:'All',street:'Street',covers:'Covers',picsarts:'Picsarts',posters:'Posters'};
  const PAGE_SIZE=8;
  let activeCategory='all';
  let visibleLimit=PAGE_SIZE;
  let syncing=false;

  const normalize=v=>String(v||'').trim().toLowerCase().replace(/[\s_-]+/g,'');
  const aliases={
    street:['street','streetphotography','streetphoto'],
    covers:['cover','covers','coverphoto','coverphotos'],
    picsarts:['picsart','picsarts','picsartphoto','picsartphotos'],
    posters:['poster','posters','posterphoto','posterphotos']
  };
  const matches=(cat,selected)=>{
    const c=normalize(cat),s=normalize(selected);
    return s==='all'||(aliases[s]||[s]).includes(c);
  };
  function list(cat){
    if(typeof galleryData==='undefined')return [];
    return galleryData.filter(x=>matches(x.cat,cat));
  }

  function setup(){
    const bar=document.getElementById('filter-bar');if(!bar)return;
    bar.style.display='flex';bar.style.visibility='visible';bar.style.opacity='1';
    bar.querySelectorAll('.filter-btn').forEach(b=>{
      const k=normalize(b.dataset.cat||'all');
      b.dataset.cat=k;b.textContent=labels[k]||b.textContent;
      b.style.display='inline-flex';b.style.visibility='visible';b.style.opacity='1';
    });
  }

  function buildCard(g,index){
    const gid=galleryData.indexOf(g),card=document.createElement('div');
    card.className='g-card reveal';card.dataset.idx=index;card.dataset.gid=gid;card.dataset.category=normalize(g.cat);
    card.innerHTML=`<div class="g-card-img"><img src="${typeof IMG==='function'?IMG(g.img,700):g.img}" style="height:${g.h||520}px;object-fit:cover" alt="${g.title||''}" loading="lazy"><div class="g-overlay"><div class="g-cat">${g.cat||''}</div><div class="g-title">${g.title||''}</div><div class="g-loc">${g.loc||''} · ${g.date||''}</div></div></div><div class="g-dots" aria-label="Photo menu" role="button" tabindex="0"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></div><div class="g-menu"><button data-act="view">View Details</button><button data-act="share">Share</button><button data-act="download">Download</button></div>`;
    if(typeof withFallback==='function')withFallback(card.querySelector('img'),'gal-'+gid);
    return card;
  }

  /* Detect the card category from the card itself. Never trust a filtered-list
     index as the category, because the original gallery renderer may reuse
     indexes and can otherwise make a Poster look like a Street photo. */
  function categoryOfCard(card){
    const src=(card.querySelector('img')?.getAttribute('src')||'').toLowerCase();
    const text=normalize(card.querySelector('.g-cat')?.textContent||'');
    const declared=normalize(card.dataset.category||'');

    if(src.includes('/street/')||src.includes('/street-')||src.includes('streetphoto'))return 'street';
    if(src.includes('/covers/')||src.includes('/cover-')||src.includes('covers-'))return 'covers';
    if(src.includes('/picsarts/')||src.includes('/picsart-')||src.includes('picsart'))return 'picsarts';
    if(src.includes('/posters/')||src.includes('/poster-')||src.includes('posters-'))return 'posters';

    if(text.includes('street'))return 'street';
    if(text.includes('cover'))return 'covers';
    if(text.includes('picsart'))return 'picsarts';
    if(text.includes('poster'))return 'posters';
    if(['street','covers','picsarts','posters'].includes(declared))return declared;
    return '';
  }

  function applyStrictFilter(){
    const target=document.getElementById('gallery');if(!target)return;
    target.querySelectorAll('.g-card').forEach(card=>{
      const detected=categoryOfCard(card);
      const allowed=activeCategory==='all'||detected===activeCategory;
      card.hidden=!allowed;
      card.style.display=allowed?'':'none';
      card.setAttribute('aria-hidden',allowed?'false':'true');
    });
  }

  function render(){
    if(typeof galleryData==='undefined')return;
    const target=document.getElementById('gallery');if(!target)return;
    syncing=true;
    const items=list(activeCategory);
    target.innerHTML='';
    items.slice(0,visibleLimit).forEach((g,i)=>target.appendChild(buildCard(g,i)));
    const old=document.getElementById('load-more-btn'),more=old||document.createElement('button');
    more.id='load-more-btn';more.type='button';more.className='btn btn-outline magnetic';more.textContent='View More';
    if(!old){const wrap=document.querySelector('.view-more-wrap');if(wrap)wrap.appendChild(more);}
    more.style.display=visibleLimit<items.length?'inline-flex':'none';
    more.setAttribute('data-category',activeCategory);
    syncing=false;
    applyStrictFilter();
    if(typeof refreshRevealTargets==='function')refreshRevealTargets();
    if(typeof bindMagnetic==='function')bindMagnetic();
  }

  function choose(cat){
    activeCategory=normalize(cat||'all');visibleLimit=PAGE_SIZE;
    const bar=document.getElementById('filter-bar');
    bar?.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',normalize(b.dataset.cat)===activeCategory));
    render();
  }

  function start(){
    setup();
    const bar=document.getElementById('filter-bar');
    if(bar&&!bar.dataset.strictFilter){
      bar.dataset.strictFilter='1';
      bar.addEventListener('click',e=>{
        const b=e.target.closest('.filter-btn');if(!b)return;
        e.preventDefault();e.stopPropagation();e.stopImmediatePropagation();choose(b.dataset.cat||'all');
      },true);
    }
    document.addEventListener('click',e=>{
      const more=e.target.closest('#load-more-btn');if(!more)return;
      e.preventDefault();e.stopImmediatePropagation();
      const total=list(activeCategory).length;visibleLimit=Math.min(visibleLimit+PAGE_SIZE,total);render();
    },true);
    const galleryEl=document.getElementById('gallery');
    if(galleryEl&&!galleryEl.dataset.strictObserver){
      galleryEl.dataset.strictObserver='1';
      new MutationObserver(()=>{if(!syncing)applyStrictFilter()}).observe(galleryEl,{childList:true,subtree:true});
    }
    const active=bar?.querySelector('.filter-btn.active');choose(active?.dataset.cat||'all');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
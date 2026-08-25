/* ABISHEK STUDIO — PHOTOGRAPHY FILTER + GALLERY FIX */
(function(){
  const labels={all:'All',street:'Street',covers:'Covers',picsarts:'Picsarts',posters:'Posters'};
  const order=['street','covers','picsarts','posters'];
  const PAGE_SIZE=8;
  let activeCategory='all';
  let visibleLimit=PAGE_SIZE;

  function setup(){
    const bar=document.getElementById('filter-bar');
    if(!bar)return;
    bar.style.display='flex';bar.style.visibility='visible';bar.style.opacity='1';
    bar.querySelectorAll('.filter-btn').forEach(btn=>{
      const key=String(btn.dataset.cat||'all').toLowerCase();
      btn.textContent=labels[key]||key;
      btn.style.display='inline-flex';btn.style.visibility='visible';btn.style.opacity='1';
      btn.setAttribute('aria-label',labels[key]||key);
    });
  }

  function orderedData(){
    if(typeof galleryData==='undefined')return [];
    const rank={};order.forEach((c,i)=>rank[c]=i);
    return galleryData.map((item,index)=>({item,index})).sort((a,b)=>{
      const ca=String(a.item.cat||'').toLowerCase(), cb=String(b.item.cat||'').toLowerCase();
      const ra=ca==='all'?-1:(rank[ca]??99), rb=cb==='all'?-1:(rank[cb]??99);
      return ra-rb || a.index-b.index;
    }).map(x=>x.item);
  }

  function categoryList(cat){
    const key=String(cat||'all').toLowerCase();
    const source=orderedData();
    return key==='all'?source:source.filter(item=>String(item.cat||'').toLowerCase()===key);
  }

  function makeCard(g,index){
    const gid=galleryData.indexOf(g);
    const fav=typeof isFavorited==='function'&&isFavorited(gid);
    const card=document.createElement('div');
    card.className='g-card reveal';card.dataset.idx=index;card.dataset.gid=gid;
    card.innerHTML=`<div class="g-card-img"><img src="${typeof IMG==='function'?IMG(g.img,700):g.img}" style="height:${g.h||520}px;object-fit:cover;" alt="${g.title||''}" loading="lazy"><button class="g-fav-badge${fav?' favorited':''}" data-act="favorite" aria-label="Favorite this photo"><svg width="16" height="16" viewBox="0 0 24 24" fill="${fav?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5 5 0 00-7.1 0L12 6.3l-1.7-1.7a5 5 0 00-7.1 7.1L12 21l8.8-9.3a5 5 0 000-7.1z"/></svg></button><div class="g-overlay"><div class="g-cat">${g.cat||''}</div><div class="g-title">${g.title||''}</div><div class="g-loc">${g.loc||''} · ${g.date||''}</div></div></div><div class="g-dots" aria-label="Photo menu" role="button" tabindex="0"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></div><div class="g-menu"><button data-act="view">View Details</button><button data-act="share">Share</button><button data-act="download">Download</button><button class="fav-menu-item${fav?' favorited':''}" data-act="favorite">${fav?'Favorited':'Favorite'}</button></div>`;
    if(typeof withFallback==='function')withFallback(card.querySelector('img'),'gal-'+gid);
    return card;
  }

  function updateMoreButton(total){
    let more=document.getElementById('load-more-btn');
    if(!more){
      more=document.createElement('button');
      more.id='load-more-btn';
      more.className='btn-outline load-more-btn';
      more.type='button';
      more.textContent='View More';
      const wrap=document.getElementById('gallery')?.parentElement;
      if(wrap)wrap.appendChild(more);
    }
    const remaining=total-visibleLimit;
    more.style.display=remaining>0?'inline-flex':'none';
    more.textContent=remaining>0?'View More':'View More';
    more.setAttribute('aria-label',`View more photos (${remaining} remaining)`);
  }

  function renderCategory(cat){
    if(typeof galleryData==='undefined'||typeof gallery==='undefined')return;
    activeCategory=String(cat||'all').toLowerCase();
    const list=categoryList(activeCategory);
    if(typeof currentFilteredList!=='undefined')currentFilteredList=list;
    gallery.innerHTML='';
    list.slice(0,visibleLimit).forEach((g,index)=>gallery.appendChild(makeCard(g,index)));
    updateMoreButton(list.length);
    if(typeof refreshRevealTargets==='function')refreshRevealTargets();
    if(typeof bindMagnetic==='function')bindMagnetic();
  }

  function bind(){
    const bar=document.getElementById('filter-bar');
    if(!bar||bar.dataset.repaired)return;
    bar.dataset.repaired='1';
    bar.addEventListener('click',function(e){
      const btn=e.target.closest('.filter-btn');if(!btn)return;
      e.preventDefault();e.stopImmediatePropagation();
      const cat=String(btn.dataset.cat||'all').toLowerCase();
      bar.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b===btn));
      visibleLimit=PAGE_SIZE;
      renderCategory(cat);
    },true);
  }

  function bindMore(){
    document.addEventListener('click',function(e){
      const btn=e.target.closest('#load-more-btn');
      if(!btn)return;
      e.preventDefault();
      const list=categoryList(activeCategory);
      if(visibleLimit<list.length){
        visibleLimit=Math.min(visibleLimit+PAGE_SIZE,list.length);
        renderCategory(activeCategory);
        document.getElementById('load-more-btn')?.scrollIntoView({behavior:'smooth',block:'nearest'});
      }
    });
  }

  function start(){
    setup();bind();bindMore();
    const active=document.querySelector('#filter-bar .filter-btn.active');
    renderCategory(active?active.dataset.cat:'all');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
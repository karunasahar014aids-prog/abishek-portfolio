/* ABISHEK STUDIO — PHOTOGRAPHY FILTER + GALLERY FIX */
(function(){
  const labels = { all:'All', street:'Street', covers:'Covers', picsarts:'Picsarts', posters:'Posters' };

  function fixFilters(){
    const bar = document.getElementById('filter-bar');
    if(!bar) return;
    bar.querySelectorAll('.filter-btn').forEach(btn=>{
      const key = String(btn.dataset.cat || '').trim().toLowerCase();
      if(labels[key]) btn.textContent = labels[key];
      btn.setAttribute('aria-label', labels[key] || btn.textContent.trim());
    });
  }

  function repairGallery(){
    try{
      if(typeof galleryData === 'undefined' || typeof renderGallery !== 'function') return;
      /* The old All filter used find(), which kept only one photo per category.
         Force All to use every gallery item while preserving the existing
         renderer, modal, favorite, download and navigation behaviour. */
      const original = renderGallery;
      window.renderAllPhotos = function(){
        try{
          if(typeof gallery === 'undefined') return;
          gallery.innerHTML = '';
          currentFilteredList = galleryData.slice();
          const items = currentFilteredList.slice(0, visibleCount);
          items.forEach(g=>{
            const gid = galleryData.indexOf(g);
            const favActive = isFavorited(gid);
            const card = document.createElement('div');
            card.className = 'g-card reveal';
            card.dataset.idx = currentFilteredList.indexOf(g);
            card.dataset.gid = gid;
            card.innerHTML = `<div class="g-card-img"><img src="${IMG(g.img,700)}" style="height:${g.h}px;object-fit:cover;" alt="${g.title}" loading="lazy"><button class="g-fav-badge${favActive?' favorited':''}" data-act="favorite" aria-label="Favorite this photo"><svg width="16" height="16" viewBox="0 0 24 24" fill="${favActive?'currentColor':'none'}" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5 5 0 00-7.1 0L12 6.3l-1.7-1.7a5 5 0 00-7.1 7.1L12 21l8.8-9.3a5 5 0 000-7.1z"/></svg></button><div class="g-overlay"><div class="g-cat">${g.cat}</div><div class="g-title">${g.title}</div><div class="g-loc">${g.loc} · ${g.date}</div></div></div><div class="g-dots"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg></div><div class="g-menu"><button data-act="view">View Details</button><button data-act="share">Share</button><button data-act="download">Download</button><button class="fav-menu-item${favActive?' favorited':''}" data-act="favorite">${favActive?'Favorited':'Favorite'}</button></div>`;
            withFallback(card.querySelector('img'),'gal-'+gid);
            gallery.appendChild(card);
          });
          const more=document.getElementById('load-more-btn');
          if(more) more.style.display=currentFilteredList.length>visibleCount?'inline-flex':'none';
          if(typeof refreshRevealTargets==='function') refreshRevealTargets();
          if(typeof bindMagnetic==='function') bindMagnetic();
        }catch(err){ console.warn('Gallery All repair failed:',err); original('all'); }
      };

      /* Re-bind the filter bar so each category always renders its own photos. */
      const bar=document.getElementById('filter-bar');
      if(bar && !bar.dataset.galleryRepairBound){
        bar.dataset.galleryRepairBound='1';
        bar.addEventListener('click',e=>{
          const btn=e.target.closest('.filter-btn');
          if(!btn) return;
          const cat=String(btn.dataset.cat||'all').toLowerCase();
          if(cat==='all') window.renderAllPhotos();
          else original(cat);
        });
      }
      window.renderAllPhotos();
    }catch(err){ console.warn('Photography gallery repair failed:',err); }
  }

  function start(){
    fixFilters();
    repairGallery();
    setTimeout(fixFilters,300);
    setTimeout(repairGallery,500);
    setTimeout(repairGallery,1200);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',start);
  else start();
})();

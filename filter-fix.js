/* ABISHEK STUDIO — PHOTOGRAPHY FILTER + GALLERY FIX */
(function(){
  const labels={all:'All',street:'Street',covers:'Covers',picsarts:'Picsarts',posters:'Posters'};
  function setup(){
    const bar=document.getElementById('filter-bar');
    if(!bar)return;
    bar.style.display='flex';
    bar.style.visibility='visible';
    bar.style.opacity='1';
    bar.querySelectorAll('.filter-btn').forEach(btn=>{
      const key=String(btn.dataset.cat||'all').toLowerCase();
      btn.textContent=labels[key]||key;
      btn.style.display='inline-flex';
      btn.style.visibility='visible';
      btn.style.opacity='1';
      btn.setAttribute('aria-label',labels[key]||key);
    });
    const live=document.getElementById('live-photo-filters');
    if(live)live.remove();
  }
  function bind(){
    const bar=document.getElementById('filter-bar');
    if(!bar||bar.dataset.repaired)return;
    bar.dataset.repaired='1';
    bar.addEventListener('click',function(e){
      const btn=e.target.closest('.filter-btn');
      if(!btn)return;
      const cat=String(btn.dataset.cat||'all').toLowerCase();
      bar.querySelectorAll('.filter-btn').forEach(b=>b.classList.toggle('active',b===btn));
      if(typeof visibleCount!=='undefined')visibleCount=8;
      if(typeof renderGallery==='function')renderGallery(cat);
    });
  }
  function start(){setup();bind();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
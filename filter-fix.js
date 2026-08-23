/* ABISHEK STUDIO — PHOTOGRAPHY FILTER FIX */
(function(){
  const labels = {
    all: 'All',
    street: 'Street',
    covers: 'Covers',
    picsarts: 'Picsarts',
    posters: 'Posters'
  };

  function fixFilters(){
    const bar = document.getElementById('filter-bar');
    if(!bar) return;

    bar.querySelectorAll('.filter-btn').forEach(btn=>{
      const key = String(btn.dataset.cat || '').trim().toLowerCase();
      if(labels[key]) btn.textContent = labels[key];
      btn.setAttribute('aria-label', labels[key] || btn.textContent.trim());
    });
  }

  function start(){
    fixFilters();
    setTimeout(fixFilters, 300);
    setTimeout(fixFilters, 1000);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', start);
  }else{
    start();
  }
})();

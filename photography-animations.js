/* ABISHEK STUDIO — PHOTOGRAPHY PLUGIN LOADER */
(function(){
  function load(src){
    return new Promise((resolve,reject)=>{
      const s=document.createElement('script');
      s.src=src;
      s.onload=resolve;
      s.onerror=reject;
      document.head.appendChild(s);
    });
  }

  /* One gallery controller only. The old filter-fix.js duplicated the
     filter/render logic and could make categories fight over the gallery. */
  load('photography-animations-core.js')
    .then(()=>load('portfolio-sync.js'))
    .then(()=>load('feedback-submit-fix.js'))
    .then(()=>load('feedback-persistence-fix.js'))
    .then(()=>load('hire-me-scroll-fix.js'))
    .catch(err=>console.error('Photography plugin load failed:',err));

  /* Hide the Related Photos section from every photography modal.
     Keep the DOM node because the main gallery script still writes into
     #modal-related-row when a photo is opened. */
  function hideRelatedPhotos(){
    if(document.getElementById('hide-related-photos-style')) return;
    const style=document.createElement('style');
    style.id='hide-related-photos-style';
    style.textContent='#modal .modal-related,#modal .modal-related-label,#modal #modal-related-row{display:none!important;visibility:hidden!important;height:0!important;min-height:0!important;margin:0!important;padding:0!important;overflow:hidden!important}';
    document.head.appendChild(style);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',hideRelatedPhotos);
  else hideRelatedPhotos();
})();

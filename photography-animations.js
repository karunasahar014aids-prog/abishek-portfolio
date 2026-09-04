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

  /* The uploaded hero portrait is a relatively small raster image. Keep the
     web display closer to its native resolution so it is not unnecessarily
     enlarged and softened on desktop/mobile. */
  function sharpenHero(){
    if(document.getElementById('hero-clarity-style')) return;
    const style=document.createElement('style');
    style.id='hero-clarity-style';
    style.textContent=`
      .hero-portrait-frame{
        width:300px!important;
        height:345px!important;
        border-radius:150px 150px 22px 22px!important;
      }
      .hero-portrait-frame img{
        width:100%!important;
        height:100%!important;
        object-fit:cover!important;
        object-position:center 15%!important;
        transform:none!important;
        image-rendering:auto!important;
        filter:contrast(1.03) saturate(1.02)!important;
      }
      @media (max-width:980px){
        .hero-portrait-frame{
          width:240px!important;
          height:285px!important;
          border-radius:120px 120px 18px 18px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function init(){
    hideRelatedPhotos();
    sharpenHero();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

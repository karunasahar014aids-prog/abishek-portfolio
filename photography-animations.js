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
    .catch(err=>console.error('Photography plugin load failed:',err));
})();

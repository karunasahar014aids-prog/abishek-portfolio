/* ABISHEK STUDIO — PHOTOGRAPHY PLUGIN LOADER */
(function(){
  function load(src){return new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)})}
  load('photography-animations-core.js')
    .then(()=>load('portfolio-sync.js'))
    .catch(err=>console.error('Photography plugin load failed:',err));
})();

/* ABISHEK STUDIO — HIRE ME SCROLL FIX */
(function(){
  function init(){
    const links=document.querySelectorAll('a[href="#contact"]');
    const contact=document.getElementById('contact');
    if(!contact) return;
    contact.style.scrollMarginTop='110px';
    links.forEach(link=>{
      if(link.dataset.hireScrollFix==='1') return;
      link.dataset.hireScrollFix='1';
      link.addEventListener('click',function(e){
        e.preventDefault();
        contact.scrollIntoView({behavior:'smooth',block:'start'});
        history.replaceState(null,'','#contact');
        setTimeout(()=>{
          try{ contact.querySelectorAll('.reveal').forEach(el=>el.classList.add('active')); }catch(_e){}
        },450);
      });
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
  setTimeout(init,500);
})();

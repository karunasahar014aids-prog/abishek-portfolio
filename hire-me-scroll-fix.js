/* ABISHEK STUDIO — HIRE ME / CONTACT VISIBILITY FIX */
(function(){
  function revealContact(contact){
    if(!contact) return;
    contact.style.display='block';
    contact.style.visibility='visible';
    contact.style.opacity='1';
    contact.style.transform='none';
    contact.querySelectorAll('.reveal').forEach(el=>{
      el.classList.add('active');
      el.style.visibility='visible';
      el.style.opacity='1';
      el.style.transform='none';
    });
  }

  function goContact(e){
    const contact=document.getElementById('contact');
    if(!contact) return;
    if(e){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
    }
    revealContact(contact);
    history.replaceState(null,'','#contact');

    /* Lenis/other smooth-scroll handlers can interfere with the normal
       anchor jump. Use the native scroll position as the final fallback. */
    const header=document.getElementById('site-header');
    const offset=(header?.getBoundingClientRect().height||90)+18;
    const y=window.scrollY+contact.getBoundingClientRect().top-offset;
    try{
      if(window.lenis && typeof window.lenis.scrollTo==='function') window.lenis.scrollTo(y,{duration:.7,lock:true});
      else window.scrollTo({top:Math.max(0,y),behavior:'smooth'});
    }catch(_e){ window.scrollTo(0,Math.max(0,y)); }

    setTimeout(()=>revealContact(contact),100);
    setTimeout(()=>revealContact(contact),500);
    setTimeout(()=>revealContact(contact),1000);
  }

  function init(){
    const contact=document.getElementById('contact');
    if(!contact) return;
    contact.style.scrollMarginTop='120px';
    document.querySelectorAll('a[href="#contact"]').forEach(link=>{
      if(link.dataset.hireScrollFix==='2') return;
      link.dataset.hireScrollFix='2';
      link.addEventListener('click',goContact,true);
    });
    if(location.hash==='#contact') setTimeout(()=>revealContact(contact),100);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
  setTimeout(init,300);
  setTimeout(init,1000);
})();

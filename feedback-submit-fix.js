/* ABISHEK STUDIO — FEEDBACK PERSISTENCE + DELETE FIX
   Keeps feedback after refresh and makes PIN-delete permanent for local fallback.
*/
(function(){
  const KEY='abishek_feedbacks';
  const CLEANUP='abishek_feedback_cleanup_v3';

  function read(){
    try{
      const v=JSON.parse(localStorage.getItem(KEY)||'[]');
      return Array.isArray(v)?v:[];
    }catch(_e){ return []; }
  }
  function write(list){
    try{ localStorage.setItem(KEY,JSON.stringify(list.slice(0,100))); }catch(_e){}
  }

  /* Remove the stale feedback records created by the earlier broken versions.
     This runs only once; new feedback is not affected afterwards. */
  function clearLegacyOnce(){
    try{
      if(localStorage.getItem(CLEANUP)!=='1'){
        localStorage.removeItem(KEY);
        localStorage.setItem(CLEANUP,'1');
      }
    }catch(_e){}
  }

  function renderSaved(){
    const list=read();
    if(typeof window.renderFeedback==='function') window.renderFeedback(list);
  }

  function init(){
    const form=document.getElementById('fb-form');
    if(!form || form.dataset.feedbackFix==='1') return;
    form.dataset.feedbackFix='1';
    clearLegacyOnce();

    form.addEventListener('submit', async function(e){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();

      const name=(document.getElementById('fb-name')?.value||'').trim();
      const phone=(document.getElementById('fb-phone')?.value||'').trim();
      const email=(document.getElementById('fb-email')?.value||'').trim();
      const message=(document.getElementById('fb-message')?.value||'').trim();
      const rating=Number(document.getElementById('fb-rating')?.value||0);
      const pin=(document.getElementById('fb-pin')?.value||'').trim();
      const error=document.getElementById('fb-error');
      const success=document.getElementById('fb-success');
      const submit=document.getElementById('fb-submit-btn');

      if(error) error.textContent='';
      if(!name || !phone || !message || !/^\d{4}$/.test(pin) || rating<1 || rating>5){
        if(error) error.textContent='Please fill all required fields, choose a rating, and enter a 4-digit PIN.';
        return false;
      }
      if(submit){submit.disabled=true;submit.textContent='Submitting…';}

      try{
        const list=read();
        const item={id:'local-'+Date.now(),full_name:name,phone,email:email||null,rating,message,_localPin:pin,pin_hash:pin,created_at:new Date().toISOString()};
        list.unshift(item);
        write(list);
        if(typeof window.renderFeedback==='function') window.renderFeedback(list);

        if(success) success.classList.add('show');
        form.reset();
        const ratingInput=document.getElementById('fb-rating');
        if(ratingInput) ratingInput.value='0';
        document.querySelectorAll('#fb-star-input .star').forEach(s=>s.classList.remove('active'));
        setTimeout(()=>{if(success) success.classList.remove('show');},2200);
      }catch(err){
        console.error('[Feedback] submit failed:',err);
        if(error) error.textContent='Could not submit feedback. Please try again.';
      }finally{
        if(submit){submit.disabled=false;submit.textContent='Submit Feedback';}
      }
      return false;
    },true);

    /* Permanently delete locally stored feedback when the user confirms the PIN.
       The old handler only removed an in-memory copy, so deleted feedback came
       back after refresh. */
    const del=document.getElementById('fb-delete-confirm');
    if(del){
      del.addEventListener('click',function(e){
        const pin=(document.getElementById('fb-delete-pin')?.value||'').trim();
        const name=(document.getElementById('fb-view-name')?.textContent||'').trim();
        const quote=(document.getElementById('fb-view-quote')?.textContent||'').trim();
        const message=quote.replace(/^\"|\"$/g,'').trim();
        if(!/^\d{4}$/.test(pin)) return;

        const list=read();
        const idx=list.findIndex(f=>(f._localPin===pin||f.pin_hash===pin) && (f.full_name||f.name||'').trim()===name && (f.message||'').trim()===message);
        if(idx<0) return;

        e.preventDefault();
        e.stopPropagation();
        if(e.stopImmediatePropagation) e.stopImmediatePropagation();
        list.splice(idx,1);
        write(list);
        renderSaved();
        document.getElementById('fb-view-close')?.click();
      },true);
    }

    /* Restore the persistent list after the original page initializer runs. */
    setTimeout(renderSaved,500);
    setTimeout(renderSaved,1200);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
  setTimeout(init,300);
})();

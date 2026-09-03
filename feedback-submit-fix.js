/* ABISHEK STUDIO — FEEDBACK SUBMIT FIX
   Prevents the feedback form from navigating/reloading the page.
   Saves feedback permanently in this browser when Supabase is not configured.
*/
(function(){
  function init(){
    const form=document.getElementById('fb-form');
    if(!form || form.dataset.noRefreshFix==='1') return;
    form.dataset.noRefreshFix='1';

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

      if(submit){ submit.disabled=true; submit.textContent='Submitting…'; }

      try{
        if(window.sb && typeof window.sb.from==='function'){
          const {error:dbError}=await window.sb.from('feedbacks').insert([{
            full_name:name, phone, email:email||null, rating, message
          }]);
          if(dbError) throw dbError;
          if(typeof window.loadFeedback==='function') await window.loadFeedback();
        }else{
          /* Supabase is currently not configured in script.js, so use
             localStorage as the persistent fallback instead of memory. */
          const key='abishek_feedbacks';
          let list=[];
          try{ list=JSON.parse(localStorage.getItem(key)||'[]'); }catch(_e){ list=[]; }
          if(!Array.isArray(list)) list=[];
          const item={
            id:'local-'+Date.now(),
            full_name:name,
            phone,
            email:email||null,
            rating,
            message,
            _localPin:pin,
            pin_hash:pin,
            created_at:new Date().toISOString()
          };
          list.unshift(item);
          localStorage.setItem(key,JSON.stringify(list.slice(0,100)));

          /* Render the same persistent list immediately. */
          if(typeof window.renderFeedback==='function') window.renderFeedback(list.slice(0,100));
        }

        if(success) success.classList.add('show');
        form.reset();
        const ratingInput=document.getElementById('fb-rating');
        if(ratingInput) ratingInput.value='0';
        document.querySelectorAll('#fb-star-input .star').forEach(s=>s.classList.remove('active'));

        setTimeout(()=>{
          if(success) success.classList.remove('show');
        },2200);
      }catch(err){
        console.error('[Feedback] submit failed:',err);
        if(error) error.textContent='Could not submit feedback. Please try again.';
      }finally{
        if(submit){ submit.disabled=false; submit.textContent='Submit Feedback'; }
      }
      return false;
    }, true);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
  setTimeout(init,300);
})();

/* ABISHEK STUDIO — FEEDBACK SUBMIT FIX
   Prevents the feedback form from navigating/reloading the page.
   Runs in capture phase so the original submit handler cannot trigger a refresh.
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
        /* Reuse the existing Supabase client when the portfolio has one. */
        if(window.sb && typeof window.sb.from==='function'){
          const {error:dbError}=await window.sb.from('feedbacks').insert([{
            full_name:name, phone, email:email||null, rating, message
          }]);
          if(dbError) throw dbError;
        }else{
          /* Keep the feedback available for this browser session when Supabase
             is not configured, matching the portfolio's existing fallback. */
          const key='abishek_feedbacks';
          const list=JSON.parse(localStorage.getItem(key)||'[]');
          list.unshift({id:'local-'+Date.now(),full_name:name,phone,email,rating,message,created_at:new Date().toISOString()});
          localStorage.setItem(key,JSON.stringify(list));
        }

        if(success) success.classList.add('show');
        form.reset();
        const ratingInput=document.getElementById('fb-rating');
        if(ratingInput) ratingInput.value='0';
        document.querySelectorAll('#fb-star-input .star').forEach(s=>s.classList.remove('active'));

        /* Refresh only the feedback list in-place, never the whole page. */
        if(typeof window.loadFeedback==='function'){
          try{ await window.loadFeedback(); }catch(_e){}
        }else if(typeof window.renderFeedback==='function'){
          try{ window.renderFeedback(); }catch(_e){}
        }

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

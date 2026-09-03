/* ABISHEK STUDIO — FEEDBACK PERSISTENCE FIX
   Keeps feedback available after refresh when the database is unavailable.
   Supabase remains the primary source when it is working.
*/
(function(){
  const KEY='abishek_feedbacks';

  function readSaved(){
    try{
      const raw=localStorage.getItem(KEY);
      const saved=raw?JSON.parse(raw):[];
      return Array.isArray(saved)?saved:[];
    }catch(err){
      console.warn('[Feedback] local read failed:',err);
      return [];
    }
  }

  function writeSaved(item){
    try{
      const saved=readSaved();
      const key=(item.id||item.created_at||'')+'|'+(item.message||'');
      const exists=saved.some(x=>((x.id||x.created_at||'')+'|'+(x.message||''))===key);
      if(!exists){
        saved.unshift(item);
        localStorage.setItem(KEY,JSON.stringify(saved.slice(0,100)));
      }
    }catch(err){ console.warn('[Feedback] local save failed:',err); }
  }

  function restoreLocal(){
    try{
      if(typeof localFeedbacks==='undefined') return;
      const saved=readSaved();
      if(saved.length){
        localFeedbacks.splice(0,localFeedbacks.length,...saved);
      }
    }catch(err){ console.warn('[Feedback] restore failed:',err); }
  }

  function bind(){
    const form=document.getElementById('fb-form');
    if(!form || form.dataset.persistenceBound==='1') return;
    form.dataset.persistenceBound='1';

    /* Save a local copy before the existing submit handler runs.
       This guarantees a refresh-safe fallback even if Supabase is offline. */
    form.addEventListener('submit',function(){
      try{
        const name=document.getElementById('fb-name')?.value.trim();
        const phone=document.getElementById('fb-phone')?.value.trim();
        const email=document.getElementById('fb-email')?.value.trim();
        const message=document.getElementById('fb-message')?.value.trim();
        const rating=parseInt(document.getElementById('fb-rating')?.value||'0',10);
        const pin=document.getElementById('fb-pin')?.value.trim();
        if(!name || !message || !rating || !/^\d{4}$/.test(pin||'')) return;
        writeSaved({
          id:'local-'+Date.now(),
          full_name:name,
          phone:phone||'',
          email:email||null,
          rating,
          message,
          pin_hash:pin,
          _localPin:pin,
          created_at:new Date().toISOString()
        });
      }catch(err){ console.warn('[Feedback] submit backup failed:',err); }
    },true);

    restoreLocal();
  }

  function init(){
    bind();
    setTimeout(bind,100);
    setTimeout(bind,500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

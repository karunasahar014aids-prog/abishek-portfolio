/* ABISHEK STUDIO — FEEDBACK PERSISTENCE FIX
   Keeps locally stored feedback visible after a page refresh when Supabase
   is not configured. Supabase-backed feedback continues to use the database.
*/
(function(){
  const KEY='abishek_feedbacks';

  function restore(){
    try{
      if(typeof sb !== 'undefined' && sb) return;
      const raw=localStorage.getItem(KEY);
      if(!raw) return;
      const saved=JSON.parse(raw);
      if(!Array.isArray(saved)) return;
      if(typeof localFeedbacks !== 'undefined'){
        localFeedbacks.splice(0, localFeedbacks.length, ...saved);
      }
      if(typeof loadFeedback==='function') loadFeedback();
    }catch(err){ console.warn('[Feedback] local restore failed:',err); }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(restore,50));
  else setTimeout(restore,50);
})();

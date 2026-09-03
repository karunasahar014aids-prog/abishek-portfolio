/* ABISHEK STUDIO — FEEDBACK PERSISTENCE FIX
   Restores feedback from localStorage after a full page refresh.
*/
(function(){
  const KEY='abishek_feedbacks';
  const RESET_KEY='abishek_feedback_reset_v1';

  /* One-time cleanup of the old test feedback that was stored in browsers
     before the persistence fix. New feedback is not removed after this. */
  function clearOldTestFeedbackOnce(){
    try{
      if(localStorage.getItem(RESET_KEY)!=='1'){
        localStorage.removeItem(KEY);
        localStorage.setItem(RESET_KEY,'1');
      }
    }catch(err){
      console.warn('[Feedback] cleanup failed:',err);
    }
  }

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

  function restoreAndRender(){
    const saved=readSaved();
    try{
      if(typeof localFeedbacks!=='undefined'){
        localFeedbacks.splice(0,localFeedbacks.length,...saved);
      }
    }catch(err){
      console.warn('[Feedback] restore failed:',err);
    }

    try{
      if(typeof window.renderFeedback==='function') window.renderFeedback(saved);
    }catch(err){
      console.warn('[Feedback] render restore failed:',err);
    }
  }

  function init(){
    clearOldTestFeedbackOnce();
    restoreAndRender();
    setTimeout(restoreAndRender,250);
    setTimeout(restoreAndRender,800);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

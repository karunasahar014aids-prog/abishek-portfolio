/* ABISHEK STUDIO — FEEDBACK PERSISTENCE FIX
   Restores feedback from localStorage after a full page refresh.
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

  function restoreAndRender(){
    const saved=readSaved();
    try{
      /* localFeedbacks is declared by script.js. */
      if(typeof localFeedbacks!=='undefined'){
        localFeedbacks.splice(0,localFeedbacks.length,...saved);
      }
    }catch(err){
      console.warn('[Feedback] restore failed:',err);
    }

    /* Important: restoring the array alone is not enough. The old page
       rendered before this helper loaded, so explicitly redraw the cards. */
    try{
      if(typeof window.renderFeedback==='function') window.renderFeedback(saved);
    }catch(err){
      console.warn('[Feedback] render restore failed:',err);
    }
  }

  function init(){
    restoreAndRender();
    setTimeout(restoreAndRender,250);
    setTimeout(restoreAndRender,800);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init);
  else init();
})();

/* ABISHEK STUDIO — PHOTOGRAPHY CATEGORY FIX */
(function(){
  const CATEGORIES=[
    ['street','Street'],
    ['covers','Covers'],
    ['picsarts','Picsarts'],
    ['posters','Posters']
  ];

  function apply(){
    const select=document.getElementById('posterCategory');
    if(!select) return false;
    const current=String(select.value||'').toLowerCase();
    select.innerHTML=CATEGORIES.map(([value,text])=>`<option value="${value}">${text}</option>`).join('');
    select.value=CATEGORIES.some(([v])=>v===current)?current:'street';
    return true;
  }

  function watch(){
    if(apply()) return;
    setTimeout(watch,150);
  }

  document.addEventListener('DOMContentLoaded',watch);
})();

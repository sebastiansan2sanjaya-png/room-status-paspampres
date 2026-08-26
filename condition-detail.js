/* Room Status — mobile modal safety fix
   The native unit modal already renders Rincian Kondisi.
   This module must NOT render another condition card. */
(function(){
  if(window.__conditionDetailSafetyV6)return;
  window.__conditionDetailSafetyV6=true;

  function removeDuplicateDetails(){
    const boxes=[...document.querySelectorAll('.condition-detail-box')];
    if(boxes.length>1){
      boxes.slice(1).forEach(el=>el.remove());
    }
  }

  function closeSheet(){
    const sheet=document.querySelector('.sheet');
    const overlay=document.querySelector('.overlay');
    if(sheet){
      sheet.classList.remove('show');
      sheet.style.display='none';
    }
    if(overlay){
      overlay.classList.remove('show');
      overlay.style.display='none';
    }
    document.body.style.overflow='';
    document.getElementById('conditionDetailBox')?.remove();
  }

  function bind(){
    // IMPORTANT: handle only the final click. On mobile, closing on
    // pointerdown/touchstart can expose the unit card underneath and the
    // following click can reopen the modal immediately.
    document.addEventListener('click',e=>{
      const btn=e.target?.closest?.('.sheet .close,[data-close-sheet],#sheetClose');
      if(!btn)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      closeSheet();
    },true);

    const observer=new MutationObserver(removeDuplicateDetails);
    observer.observe(document.body,{childList:true,subtree:true});
    removeDuplicateDetails();
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',bind,{once:true});
  }else{
    bind();
  }
})();

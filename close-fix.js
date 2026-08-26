/* Room Status close + duplicate condition fix */
(function(){
  if(window.__roomStatusCloseFixV1)return;
  window.__roomStatusCloseFixV1=true;

  function closeSheet(){
    const overlay=document.getElementById('overlay');
    const sheet=document.getElementById('sheet');
    if(overlay){overlay.classList.remove('show');overlay.style.display='none';}
    if(sheet){sheet.classList.remove('show');sheet.style.display='none';}
    document.body.style.overflow='';
    document.getElementById('conditionDetailBox')?.remove();
    document.getElementById('hkFixReceptionInfo')?.remove();
  }

  function bind(){
    document.addEventListener('click',function(e){
      const btn=e.target.closest?.('#closeSheet,.close,.modal-close');
      if(btn){e.preventDefault();e.stopPropagation();closeSheet();}
    },true);
    document.addEventListener('pointerup',function(e){
      const btn=e.target.closest?.('#closeSheet,.close');
      if(btn){e.preventDefault();e.stopPropagation();closeSheet();}
    },true);
  }

  bind();
})();

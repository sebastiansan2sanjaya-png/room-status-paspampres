/* Mobile modal safety fix — Room Status Paspampres */
(function(){
  if(window.__mobileModalFixV1)return;
  window.__mobileModalFixV1=true;

  function closeRoom(){
    const sheet=document.getElementById('sheet')||document.querySelector('.sheet');
    const overlay=document.getElementById('overlay')||document.querySelector('.overlay');
    if(sheet){
      sheet.style.display='none';
      sheet.classList.remove('show');
    }
    if(overlay){
      overlay.classList.remove('show');
      overlay.style.display='none';
    }
    document.body.style.overflow='';
    document.getElementById('conditionDetailBox')?.remove();
    document.getElementById('hkConditionDetail')?.remove();
    document.getElementById('receptionHKFollowup')?.remove();
  }

  function dedupe(){
    const boxes=[...document.querySelectorAll('.condition-detail-box,#hkConditionDetail')];
    if(boxes.length>1)boxes.slice(0,-1).forEach(x=>x.remove());
  }

  function init(){
    document.addEventListener('click',function(e){
      const btn=e.target?.closest?.('#close,.sheet .close');
      if(!btn)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      closeRoom();
    },true);

    document.addEventListener('touchend',function(e){
      const btn=e.target?.closest?.('#close,.sheet .close');
      if(!btn)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      closeRoom();
    },true);

    const mo=new MutationObserver(dedupe);
    mo.observe(document.body,{childList:true,subtree:true});
    dedupe();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

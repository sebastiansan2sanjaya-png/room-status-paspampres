/* Mobile modal safety fix — Room Status Paspampres v4 */
(function(){
  if(window.__mobileModalFixV4)return;
  window.__mobileModalFixV4=true;

  function closeRoom(){
    const sheet=document.getElementById('sheet');
    const overlay=document.getElementById('overlay');
    if(sheet){sheet.classList.remove('show');sheet.style.setProperty('display','none','important');sheet.style.setProperty('visibility','hidden','important');sheet.style.setProperty('pointer-events','none','important');}
    if(overlay){overlay.classList.remove('show');overlay.style.setProperty('display','none','important');overlay.style.setProperty('visibility','hidden','important');overlay.style.setProperty('pointer-events','none','important');}
    document.body.style.overflow='';
    document.body.classList.remove('modal-open');
    document.getElementById('conditionDetailBox')?.remove();
    document.getElementById('hkConditionDetail')?.remove();
    document.getElementById('receptionHKFollowup')?.remove();
    window.dispatchEvent(new Event('room-status-modal-closed'));
  }

  function restoreRoom(){
    const sheet=document.getElementById('sheet');
    const overlay=document.getElementById('overlay');
    if(sheet){sheet.style.removeProperty('display');sheet.style.removeProperty('visibility');sheet.style.removeProperty('pointer-events');}
    if(overlay){overlay.style.removeProperty('display');overlay.style.removeProperty('visibility');overlay.style.removeProperty('pointer-events');}
  }

  function bind(){
    const btn=document.getElementById('close');
    if(!btn)return;
    btn.dataset.mobileCloseBound='4';
    btn.style.position='relative';
    btn.style.zIndex='9999';
    btn.style.pointerEvents='auto';
    btn.style.touchAction='manipulation';
    const handler=function(e){
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      closeRoom();
      return false;
    };
    if(!btn.__roomCloseHandlers){
      btn.__roomCloseHandlers=[];
      ['pointerdown','pointerup','touchstart','touchend','click'].forEach(type=>{
        const h=handler.bind(btn);
        btn.addEventListener(type,h,{capture:true,passive:false});
        btn.__roomCloseHandlers.push([type,h]);
      });
    }
  }

  function globalClose(e){
    const btn=e.target?.closest?.('#close');
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    closeRoom();
    return false;
  }

  function init(){
    document.addEventListener('pointerdown',globalClose,true);
    document.addEventListener('touchstart',globalClose,true);
    document.addEventListener('click',globalClose,true);
    bind();
    const observer=new MutationObserver(bind);
    observer.observe(document.body,{childList:true,subtree:true});
    const originalOpen=window.openSheet;
    if(typeof originalOpen==='function'&&!originalOpen.__mobileWrappedV4){
      const wrapped=function(){restoreRoom();return originalOpen.apply(this,arguments);};
      wrapped.__mobileWrappedV4=true;
      window.openSheet=wrapped;
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

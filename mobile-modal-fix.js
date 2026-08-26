/* Mobile modal safety fix — Room Status Paspampres v2 */
(function(){
  if(window.__mobileModalFixV2)return;
  window.__mobileModalFixV2=true;

  function closeRoom(){
    const sheet=document.getElementById('sheet')||document.querySelector('.sheet');
    const overlay=document.getElementById('overlay')||document.querySelector('.overlay');
    if(sheet){
      sheet.classList.remove('show');
      sheet.style.setProperty('display','none','important');
      sheet.style.setProperty('visibility','hidden','important');
      sheet.style.setProperty('pointer-events','none','important');
    }
    if(overlay){
      overlay.classList.remove('show');
      overlay.style.setProperty('display','none','important');
      overlay.style.setProperty('visibility','hidden','important');
      overlay.style.setProperty('pointer-events','none','important');
    }
    document.body.style.overflow='';
    document.body.classList.remove('modal-open');
    document.getElementById('conditionDetailBox')?.remove();
    document.getElementById('hkConditionDetail')?.remove();
    document.getElementById('receptionHKFollowup')?.remove();
  }

  function restoreRoom(){
    const sheet=document.getElementById('sheet');
    const overlay=document.getElementById('overlay');
    if(sheet){sheet.style.removeProperty('display');sheet.style.removeProperty('visibility');sheet.style.removeProperty('pointer-events');}
    if(overlay){overlay.style.removeProperty('display');overlay.style.removeProperty('visibility');overlay.style.removeProperty('pointer-events');}
  }

  function bind(){
    const btn=document.getElementById('close');
    if(!btn || btn.dataset.mobileCloseBound==='2')return;
    btn.dataset.mobileCloseBound='2';
    const handler=function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      closeRoom();
      return false;
    };
    btn.addEventListener('pointerdown',handler,{capture:true,passive:false});
    btn.addEventListener('touchstart',handler,{capture:true,passive:false});
    btn.addEventListener('pointerup',handler,{capture:true,passive:false});
    btn.addEventListener('touchend',handler,{capture:true,passive:false});
    btn.addEventListener('click',handler,{capture:true,passive:false});
  }

  function init(){
    bind();
    const observer=new MutationObserver(bind);
    observer.observe(document.body,{childList:true,subtree:true});
    const originalOpen=window.openSheet;
    if(typeof originalOpen==='function' && !originalOpen.__mobileWrappedV2){
      const wrapped=function(){
        restoreRoom();
        return originalOpen.apply(this,arguments);
      };
      wrapped.__mobileWrappedV2=true;
      window.openSheet=wrapped;
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

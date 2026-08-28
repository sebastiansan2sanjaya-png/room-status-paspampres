/* Room Status — restore legacy role feature layers without replacing app shell */
(function(){
  if(window.__roomStatusRoleRestore)return;
  window.__roomStatusRoleRestore=true;

  const scripts=[
    'condition-detail.js?v=20260828-restore',
    'guest-audit.js?v=20260828-restore',
    'hk-inline-condition.js?v=20260828-restore',
    'close-fix.js?v=20260828-restore'
  ];

  function load(src){
    return new Promise((resolve,reject)=>{
      const clean=src.split('?')[0];
      if(document.querySelector('script[data-role-restore="'+clean+'"]')){resolve();return}
      const s=document.createElement('script');
      s.src=src;
      s.dataset.roleRestore=clean;
      s.onload=resolve;
      s.onerror=reject;
      document.body.appendChild(s);
    });
  }

  async function init(){
    for(const src of scripts){
      try{await load(src)}catch(e){console.warn('Role restore module failed:',src,e)}
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,250),{once:true});
  else setTimeout(init,250);
})();

/* Room Status — Glassmorphism Brand UI */
(function(){
  if(window.__roomStatusBrandUI)return;
  window.__roomStatusBrandUI=true;

  const logo=`<svg class="rs-logo-svg" viewBox="0 0 100 100" aria-label="Room Status logo" role="img">
    <path d="M25 18v64M25 18h34c18 0 28 10 28 24s-10 24-28 24H43" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M43 66c9-10 18-10 26-2l16 16" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round"/>
    <path d="M26 84h38c10 0 17-6 17-15 0-8-5-13-13-13H49c-10 0-16-6-16-14" fill="none" stroke="currentColor" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" opacity=".72"/>
  </svg>`;

  const style=document.createElement('style');
  style.id='roomStatusGlassUI';
  style.textContent=`
    :root{
      --glass-bg:rgba(255,255,255,.72);
      --glass-strong:rgba(255,255,255,.84);
      --glass-line:rgba(255,255,255,.88);
      --glass-shadow:0 14px 38px rgba(34,53,84,.09);
      --glass-blur:20px;
    }
    body{
      background:
        radial-gradient(circle at 8% 4%,rgba(79,125,242,.10),transparent 30%),
        radial-gradient(circle at 92% 18%,rgba(34,170,168,.08),transparent 28%),
        linear-gradient(180deg,#f8faff 0%,#f3f6fb 100%) !important;
    }
    .header{
      background:rgba(255,255,255,.62) !important;
      backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);
      border-bottom:1px solid rgba(255,255,255,.82);
      position:sticky;top:0;z-index:10;
    }
    .brand{gap:10px}
    .rs-brand-mark{
      width:46px;height:46px;flex:0 0 46px;border-radius:15px;
      display:grid;place-items:center;color:#263548;
      background:linear-gradient(145deg,rgba(255,255,255,.92),rgba(235,241,250,.62));
      border:1px solid rgba(255,255,255,.95);
      box-shadow:0 8px 22px rgba(35,54,84,.10),inset 0 1px 0 rgba(255,255,255,.95);
      backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);
    }
    .rs-logo-svg{width:31px;height:31px;display:block}
    .header h1{font-size:22px;letter-spacing:-.6px}
    .header .subtitle{font-size:12px}
    .searchbar,.filters select,.card,.tower-chip,.unit,.pdf-btn{
      background:var(--glass-bg) !important;
      backdrop-filter:blur(var(--glass-blur));-webkit-backdrop-filter:blur(var(--glass-blur));
      border-color:var(--glass-line) !important;
      box-shadow:var(--glass-shadow) !important;
    }
    .searchbar{border-radius:16px}
    .filters select{box-shadow:0 8px 25px rgba(34,53,84,.06) !important}
    .card{border-radius:20px}
    .status-card{background:rgba(255,255,255,.64) !important;border-color:rgba(255,255,255,.9) !important;box-shadow:0 8px 22px rgba(34,53,84,.06)}
    .tower-chip.active{background:rgba(247,250,255,.84) !important}
    .unit{background:rgba(255,255,255,.68) !important}
    #occupancyRecapBtn{background:rgba(255,255,255,.70) !important;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-color:rgba(255,255,255,.92) !important;box-shadow:0 12px 30px rgba(34,53,84,.08) !important;border-radius:16px}
    #occupancyRecapModal{background:rgba(23,34,51,.20) !important;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
    #occupancyRecapModal .occ-sheet{background:rgba(255,255,255,.86) !important;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.9);box-shadow:0 -15px 50px rgba(24,38,62,.14)}
    #occupancyRecapModal .occ-stats>div,#occupancyRecapModal .occ-search,#occupancyRecapModal .occ-tower,#occupancyRecapModal .occ-history{background:rgba(255,255,255,.58);border-color:rgba(220,227,238,.78)}
    .rs-recap-brand{display:flex;align-items:center;gap:9px;margin-bottom:14px}
    .rs-recap-brand .rs-brand-mark{width:36px;height:36px;flex-basis:36px;border-radius:11px}
    .rs-recap-brand .rs-logo-svg{width:24px;height:24px}
    .rs-recap-brand strong{font-size:10px;letter-spacing:1.1px;color:#536174}
    @media(max-width:390px){.rs-brand-mark{width:42px;height:42px;flex-basis:42px}.header h1{font-size:20px}}
  `;
  document.head.appendChild(style);

  function apply(){
    const brand=document.querySelector('.brand');
    if(brand && !brand.querySelector('.rs-brand-mark')){
      const mark=document.createElement('span');
      mark.className='rs-brand-mark';mark.innerHTML=logo;
      brand.insertBefore(mark,brand.firstChild);
    }
    const recap=document.getElementById('occupancyRecapBody');
    if(recap && !recap.querySelector('.rs-recap-brand')){
      const head=recap.querySelector('.occ-stats');
      if(head){
        const b=document.createElement('div');
        b.className='rs-recap-brand';
        b.innerHTML=`<span class="rs-brand-mark">${logo}</span><strong>ROOM STATUS · REKAP PENGHUNI</strong>`;
        recap.insertBefore(b,head);
      }
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,500),{once:true});else setTimeout(apply,500);
  new MutationObserver(()=>apply()).observe(document.body,{childList:true,subtree:true});
})();

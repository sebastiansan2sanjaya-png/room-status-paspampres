/* Room Status — Glassmorphism UI / PDF Branding */
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

    /* Logo intentionally hidden from normal application UI. */
    .rs-brand-mark,.rs-recap-brand{display:none !important}

    /* Official Room Status branding appears only in generated/printed PDF. */
    .rs-pdf-brand{display:none}
    .rs-pdf-brand .rs-logo-svg{width:54px;height:54px;color:#263548;display:block}
    .rs-pdf-brand-name{font-size:16px;font-weight:800;letter-spacing:2px;color:#18212f;margin-top:4px}
    .rs-pdf-brand-sub{font-size:9px;color:#687386;margin-top:2px}
    @media print{
      .rs-pdf-brand{display:flex !important;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:9px;border-bottom:1px solid #e2e7ee}
      .rs-pdf-brand-copy{display:flex;flex-direction:column}
    }
  `;
  document.head.appendChild(style);

  function addPdfBrand(){
    const area=document.querySelector('.print-area');
    if(!area || area.querySelector('.rs-pdf-brand'))return;
    const brand=document.createElement('div');
    brand.className='rs-pdf-brand';
    brand.innerHTML=`${logo}<div class="rs-pdf-brand-copy"><div class="rs-pdf-brand-name">ROOM STATUS</div><div class="rs-pdf-brand-sub">Unit Hunian Rusun Paspampres</div></div>`;
    area.insertBefore(brand,area.firstChild);
  }

  function cleanLegacyBrand(){
    document.querySelectorAll('.rs-brand-mark,.rs-recap-brand').forEach(el=>el.remove());
  }

  function apply(){
    cleanLegacyBrand();
    addPdfBrand();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,300),{once:true});else setTimeout(apply,300);
  new MutationObserver(()=>apply()).observe(document.body,{childList:true,subtree:true});
})();

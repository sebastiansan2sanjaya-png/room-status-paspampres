/* Rekap Data Tamu & Pax Terhuni — OD + guest name only */
(function(){
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let units=[], guests=[];

  async function load(){
    if(typeof supabaseClient==='undefined') throw new Error('Koneksi Supabase belum tersedia.');
    const {data,error}=await supabaseClient.rpc('get_occupancy_recap');
    if(error) throw error;
    let payload=data||{};
    if(typeof payload==='string'){try{payload=JSON.parse(payload);}catch(e){payload={};}}
    if(Array.isArray(payload)&&payload.length===1&&payload[0]&&typeof payload[0]==='object') payload=payload[0];
    units=Array.isArray(payload.units)?payload.units:[];
    const odIds=new Set(units.map(u=>String(u.id)));
    guests=(Array.isArray(payload.guests)?payload.guests:[]).filter(g=>odIds.has(String(g.unit_id))&&String(g.guest_name||'').trim());
    return {units,guests};
  }

  function build(){
    const byUnit={};
    guests.forEach(g=>(byUnit[g.unit_id]??=[]).push(g));
    const occupiedUnits=units.filter(u=>(byUnit[u.id]||[]).length>0);
    const tower={};
    occupiedUnits.forEach(u=>{
      const pax=(byUnit[u.id]||[]).length;
      (tower[u.tower]??={units:0,pax:0,rows:[]});
      tower[u.tower].units++; tower[u.tower].pax+=pax;
      tower[u.tower].rows.push({...u,pax,names:(byUnit[u.id]||[]).sort((a,b)=>Number(a.guest_order)-Number(b.guest_order)).map(x=>x.guest_name)});
    });
    return {tower,totalUnits:occupiedUnits.length,totalPax:guests.length};
  }

  function open(){const modal=document.getElementById('occupancyRecapModal');if(modal)modal.style.display='flex';refresh();}

  async function refresh(){
    const list=document.getElementById('occupancyRecapBody'); if(!list)return;
    list.innerHTML='<div class="occ-loading">Memuat rekap...</div>';
    try{
      await load(); const d=build();
      const towers=Object.keys(d.tower).sort((a,b)=>Number(a)-Number(b));
      list.innerHTML=`<div class="occ-summary"><div class="occ-stat"><span class="occ-icon">⌂</span><div><b>${d.totalUnits}</b><span>UNIT TERHUNI</span></div></div><div class="occ-stat"><span class="occ-icon">●</span><div><b>${d.totalPax}</b><span>PAX TERHUNI</span></div></div></div><div class="occ-section-head"><div><h3>Rekap Per Tower</h3><p>Unit dengan data penghuni aktif</p></div><span>${towers.length} Tower</span></div>`+
      (towers.length?towers.map(t=>{const x=d.tower[t];return `<details class="occ-tower"><summary><div class="occ-tower-name"><span class="occ-dot"></span><strong>TOWER ${esc(String(t).padStart(2,'0'))}</strong></div><span class="occ-tower-meta"><b>${x.units}</b> Unit&nbsp; · &nbsp;<b>${x.pax}</b> Pax <i>⌄</i></span></summary><div class="occ-tower-body">${x.rows.map(r=>`<div class="occ-unit"><div class="occ-unit-top"><strong>T${esc(String(r.tower).padStart(2,'0'))}-${esc(r.unit_number)}</strong><span>${r.pax} Pax</span></div><small>${r.names.map(esc).join(' · ')}</small></div>`).join('')}</div></details>`}).join(''):'<div class="occ-empty">Belum ada data penghuni.</div>');
    }catch(e){console.error('Occupancy recap failed:',e);list.innerHTML=`<div class="occ-error">Gagal memuat rekap: ${esc(e?.message||'Error tidak diketahui')}</div>`;}
  }

  function inject(){
    if(document.getElementById('occupancyRecapBtn'))return;
    const style=document.createElement('style');style.textContent=`
      #occupancyRecapBtn{display:block;width:calc(100% - 32px);margin:0 16px 12px;height:46px;border:1px solid #b8c9f7;background:#fff;color:#356ff2;border-radius:12px;font-weight:800;cursor:pointer;box-shadow:0 2px 8px rgba(35,55,90,.05)}
      #occupancyRecapBtn:active{transform:scale(.99)}
      #occupancyRecapModal{position:fixed;inset:0;background:rgba(20,29,43,.34);backdrop-filter:blur(3px);z-index:45;display:none;align-items:flex-end;justify-content:center}
      .occ-sheet{width:min(560px,100%);max-height:90vh;overflow:auto;background:#f7f9fc;border-radius:26px 26px 0 0;padding:18px 16px 28px;box-shadow:0 -8px 30px rgba(25,45,75,.12)}
      .occ-head{display:flex;justify-content:space-between;align-items:center;margin:0 2px 18px}.occ-head h2{margin:0;font-size:20px;letter-spacing:-.2px;color:#172033}.occ-close{border:0;background:#eaf0f7;color:#536174;border-radius:50%;width:38px;height:38px;font-size:22px;cursor:pointer}
      .occ-summary{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px}.occ-stat{background:#fff;border:1px solid #e6ebf2;border-radius:17px;padding:15px;display:flex;align-items:center;gap:12px;box-shadow:0 3px 12px rgba(40,60,90,.04)}.occ-icon{width:38px;height:38px;border-radius:12px;background:#eef4ff;color:#356ff2;display:grid;place-items:center;font-weight:900}.occ-stat b{display:block;font-size:29px;line-height:1;color:#172033}.occ-stat>div>span{display:block;margin-top:5px;font-size:9px;color:#758197;font-weight:900;letter-spacing:.55px}
      .occ-section-head{display:flex;justify-content:space-between;align-items:flex-end;margin:2px 2px 9px}.occ-section-head h3{margin:0;font-size:14px;color:#172033}.occ-section-head p{margin:3px 0 0;color:#8a95a6;font-size:10px}.occ-section-head>span{font-size:10px;font-weight:800;color:#356ff2;background:#eef4ff;padding:6px 9px;border-radius:9px}
      .occ-tower{background:#fff;border:1px solid #e4e9f0;border-radius:15px;margin-bottom:9px;overflow:hidden;box-shadow:0 2px 8px rgba(35,55,90,.025)}.occ-tower summary{padding:14px;cursor:pointer;display:flex;justify-content:space-between;align-items:center;list-style:none}.occ-tower summary::-webkit-details-marker{display:none}.occ-tower-name{display:flex;align-items:center;gap:9px}.occ-dot{width:8px;height:8px;border-radius:50%;background:#22aaa8}.occ-tower-name strong{font-size:12px;color:#263247}.occ-tower-meta{color:#7b8798;font-size:10px}.occ-tower-meta b{color:#356ff2}.occ-tower-meta i{font-style:normal;margin-left:5px;color:#9aa5b4}.occ-tower-body{border-top:1px solid #edf0f4}.occ-unit{padding:11px 14px;border-bottom:1px solid #f0f2f6}.occ-unit:last-child{border-bottom:0}.occ-unit-top{display:flex;justify-content:space-between;align-items:center}.occ-unit-top strong{font-size:12px;color:#273348}.occ-unit-top span{font-size:10px;font-weight:900;color:#22aaa8;background:#eefaf9;padding:4px 7px;border-radius:7px}.occ-unit small{display:block;color:#687386;font-size:10px;margin-top:5px;line-height:1.45}.occ-loading,.occ-empty,.occ-error{padding:30px;text-align:center;color:#687386;background:#fff;border-radius:15px}.occ-error{color:#c33}
      @media(max-width:420px){.occ-summary{gap:8px}.occ-stat{padding:13px}.occ-stat b{font-size:26px}.occ-tower summary{padding:13px}.occ-tower-meta{font-size:9px}}
    `;document.head.appendChild(style);
    const btn=document.createElement('button');btn.id='occupancyRecapBtn';btn.type='button';btn.textContent='📊 Rekap Data Tamu & Pax';const anchor=document.querySelector('.pdf-btn')||document.querySelector('.card');if(anchor)anchor.parentNode.insertBefore(btn,anchor);else document.body.appendChild(btn);btn.onclick=open;
    const modal=document.createElement('div');modal.id='occupancyRecapModal';modal.innerHTML='<div class="occ-sheet"><div class="occ-head"><h2>Rekap Data Tamu</h2><button class="occ-close" type="button">×</button></div><div id="occupancyRecapBody"></div></div>';document.body.appendChild(modal);modal.querySelector('.occ-close').onclick=()=>modal.style.display='none';modal.addEventListener('click',e=>{if(e.target===modal)modal.style.display='none'});
  }

  window.openOccupancyRecap=open; window.refreshOccupancyRecap=refresh;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(inject,400));else setTimeout(inject,400);
})();

/* Rekap Data Tamu & Pax Terhuni — OD + guest name only */
(function(){
  const esc=v=>String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  let units=[], guests=[], currentRole='', lastData=null;

  async function load(){
    if(typeof supabaseClient==='undefined') throw new Error('Koneksi Supabase belum tersedia.');
    const {data,error}=await supabaseClient.rpc('get_occupancy_recap');
    if(error) throw error;
    let payload=data||{};
    if(typeof payload==='string'){
      try{payload=JSON.parse(payload);}catch(e){payload={};}
    }
    if(Array.isArray(payload) && payload.length===1 && payload[0] && typeof payload[0]==='object') payload=payload[0];
    units=Array.isArray(payload.units)?payload.units:[];
    const odIds=new Set(units.map(u=>String(u.id)));
    guests=(Array.isArray(payload.guests)?payload.guests:[])
      .filter(g=>odIds.has(String(g.unit_id)) && String(g.guest_name||'').trim());

    currentRole='';
    try{
      const {data:{user}}=await supabaseClient.auth.getUser();
      if(user?.id){
        const {data:profile}=await supabaseClient.from('user_profiles').select('role').eq('id',user.id).maybeSingle();
        currentRole=String(profile?.role||'').toLowerCase().trim();
      }
    }catch(e){ console.warn('Role lookup failed:',e); }
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
      tower[u.tower].units++;
      tower[u.tower].pax+=pax;
      tower[u.tower].rows.push({
        ...u,pax,
        names:(byUnit[u.id]||[])
          .sort((a,b)=>Number(a.guest_order)-Number(b.guest_order))
          .map(x=>x.guest_name)
      });
    });
    return {byUnit,tower,totalUnits:occupiedUnits.length,totalPax:guests.length};
  }

  function canShowGuestNames(){
    return currentRole==='editor' || currentRole==='receptionist';
  }

  function displayGuestNames(names){
    return canShowGuestNames()
      ? names.map(esc).join(' · ')
      : names.map(()=> '••••••').join(' · ');
  }

  function searchTerm(){
    return String(document.getElementById('occGuestSearch')?.value||'').trim().toLowerCase();
  }

  function renderTowers(d,term=''){
    const target=document.getElementById('occTowerList');
    if(!target)return;
    const towers=Object.keys(d.tower).sort((a,b)=>Number(a)-Number(b));
    const filtered=[];
    towers.forEach(t=>{
      const x=d.tower[t];
      const rows=x.rows.filter(r=>!term || r.names.some(n=>String(n).toLowerCase().includes(term)));
      if(rows.length) filtered.push({t,rows});
    });

    target.innerHTML=filtered.length
      ? filtered.map(({t,rows})=>`<details class="occ-tower" ${term?'open':''}><summary><strong>TOWER ${esc(String(t).padStart(2,'0'))}</strong><span>${rows.length} Unit · ${rows.reduce((s,r)=>s+r.pax,0)} Pax</span></summary><div>${rows.map(r=>`<div class="occ-unit"><div><strong>T${esc(String(r.tower).padStart(2,'0'))}-${esc(r.unit_number)}</strong><span>${r.pax} Pax</span></div><small>${displayGuestNames(r.names)}</small><button class="occ-history-btn" type="button" data-unit-id="${esc(r.id)}">Riwayat Penghuni</button><div class="occ-history" data-history-for="${esc(r.id)}" hidden></div></div>`).join('')}</div></details>`).join('')
      : `<div style="padding:25px;text-align:center;color:#687386">${term?'Nama penghuni tidak ditemukan.':'Belum ada data penghuni.'}</div>`;
  }

  function renderData(d){
    const list=document.getElementById('occupancyRecapBody');
    if(!list)return;

    const searchHtml=canShowGuestNames()
      ? `<div class="occ-search"><span>⌕</span><input id="occGuestSearch" type="search" autocomplete="off" placeholder="Cari nama penghuni..."><button id="occGuestClear" type="button" aria-label="Hapus pencarian">×</button></div>`
      : '';

    list.innerHTML=`<div class="occ-stats"><div><b>${d.totalUnits}</b><span>UNIT TERHUNI</span></div><div><b>${d.totalPax}</b><span>PAX TERHUNI</span></div></div>${searchHtml}<div class="occ-title">REKAP PER TOWER</div><div id="occTowerList"></div>`;
    renderTowers(d,'');

    list.onclick=async(e)=>{
      const btn=e.target.closest('.occ-history-btn');
      if(!btn)return;
      const unitId=btn.dataset.unitId;
      const box=list.querySelector(`.occ-history[data-history-for="${CSS.escape(unitId)}"]`);
      if(!box)return;
      const opening=box.hidden;
      box.hidden=!opening;
      if(opening){
        btn.textContent='Tutup Riwayat';
        if(typeof window.loadGuestAudit==='function') await window.loadGuestAudit(unitId,box);
        else box.innerHTML='<div class="guest-audit-empty">Modul riwayat belum siap.</div>';
      }else btn.textContent='Riwayat Penghuni';
    };

    if(canShowGuestNames()){
      const input=document.getElementById('occGuestSearch');
      const clear=document.getElementById('occGuestClear');
      if(input) input.addEventListener('input',()=>renderTowers(lastData,searchTerm()));
      if(clear) clear.addEventListener('click',()=>{input.value='';renderTowers(lastData,'');input.focus();});
    }
  }

  function closeModal(modal){
    if(!modal)return;
    modal.style.display='none';
    modal.setAttribute('aria-hidden','true');
    const active=document.activeElement;
    if(active && modal.contains(active)) active.blur();
  }

  function open(){
    const modal=document.getElementById('occupancyRecapModal');
    if(modal){
      modal.style.display='flex';
      modal.setAttribute('aria-hidden','false');
    }
    refresh();
  }

  async function refresh(){
    const list=document.getElementById('occupancyRecapBody');
    if(!list)return;
    list.innerHTML='<div style="padding:25px;text-align:center;color:#687386">Memuat rekap...</div>';
    try{
      await load();
      lastData=build();
      renderData(lastData);
    }catch(e){
      console.error('Occupancy recap failed:',e);
      list.innerHTML=`<div style="padding:25px;text-align:center;color:#c33">Gagal memuat rekap: ${esc(e?.message||'Error tidak diketahui')}</div>`;
    }
  }

  function inject(){
    if(document.getElementById('occupancyRecapBtn'))return;
    const style=document.createElement('style');style.textContent=`#occupancyRecapBtn{display:block;width:calc(100% - 32px);margin:0 16px 12px;height:46px;border:1px solid #b8c9f7;background:#fff;color:#356ff2;border-radius:12px;font-weight:800;cursor:pointer}#occupancyRecapBtn:active{transform:scale(.99)}#occupancyRecapModal{position:fixed;inset:0;background:rgba(21,29,42,.28);z-index:45;display:none;align-items:flex-end;justify-content:center;touch-action:manipulation}.occ-sheet{width:min(520px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:24px 24px 0 0;padding:18px 16px 25px}.occ-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.occ-head h2{margin:0;font-size:20px}.occ-close{border:0;background:#f1f5f9;border-radius:50%;width:38px;height:38px;font-size:22px;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}.occ-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}.occ-stats>div{border:1px solid #e6eaf0;border-radius:14px;padding:14px}.occ-stats b{display:block;font-size:30px}.occ-stats span{font-size:10px;color:#687386;font-weight:800}.occ-search{display:flex;align-items:center;gap:8px;border:1px solid #dfe5ee;border-radius:12px;padding:0 10px;height:44px;margin:0 0 14px;background:#fff}.occ-search span{font-size:22px;color:#687386}.occ-search input{border:0;outline:0;width:100%;font-size:14px;background:transparent}.occ-search button{border:0;background:#eef2f7;border-radius:50%;width:25px;height:25px;font-size:16px;color:#687386}.occ-title{font-size:11px;color:#687386;font-weight:800;letter-spacing:.5px;margin:12px 0 8px}.occ-tower{border:1px solid #e6eaf0;border-radius:13px;margin-bottom:8px;overflow:hidden}.occ-tower summary{padding:13px;cursor:pointer;display:flex;justify-content:space-between;list-style:none}.occ-tower summary::-webkit-details-marker{display:none}.occ-tower summary span{color:#356ff2;font-size:12px;font-weight:700}.occ-unit{padding:10px 13px;border-top:1px solid #eef1f5}.occ-unit>div{display:flex;justify-content:space-between;font-size:13px}.occ-unit>div span{font-weight:800;color:#22aaa8}.occ-unit small{display:block;color:#687386;font-size:10px;margin-top:4px}.occ-history-btn{margin-top:9px;border:1px solid #dbe4f4;background:#f7f9fd;color:#356ff2;border-radius:8px;padding:6px 9px;font-size:10px;font-weight:800;cursor:pointer;touch-action:manipulation}.occ-history{margin-top:8px;padding-top:7px;border-top:1px dashed #e2e7ef}.guest-audit-item{padding:8px 0;border-bottom:1px solid #eef1f5}.guest-audit-top{display:flex;justify-content:space-between;font-size:9px}.guest-audit-action{font-weight:800}.guest-audit-action.add{color:#16805f}.guest-audit-action.update{color:#16805f}.guest-audit-action.delete{color:#c44}.guest-audit-time{color:#8a94a5}.guest-audit-detail{font-size:11px;font-weight:700;margin-top:3px}.guest-audit-by{font-size:9px;color:#7b8493;margin-top:3px}.guest-audit-empty,.guest-audit-loading{font-size:10px;color:#687386;padding:8px 0}`;document.head.appendChild(style);
    const btn=document.createElement('button');btn.id='occupancyRecapBtn';btn.type='button';btn.textContent='📊 Rekap Data Tamu & Pax';
    const anchor=document.querySelector('.pdf-btn')||document.querySelector('.card');if(anchor)anchor.parentNode.insertBefore(btn,anchor);else document.body.appendChild(btn);btn.onclick=open;
    const modal=document.createElement('div');modal.id='occupancyRecapModal';modal.setAttribute('aria-hidden','true');modal.innerHTML='<div class="occ-sheet"><div class="occ-head"><h2>Rekap Data Tamu</h2><button class="occ-close" type="button" aria-label="Tutup">×</button></div><div id="occupancyRecapBody"></div></div>';document.body.appendChild(modal);
    const close=()=>closeModal(modal);
    const closeBtn=modal.querySelector('.occ-close');
    ['pointerdown','touchstart','click'].forEach(type=>{
      closeBtn.addEventListener(type,e=>{e.preventDefault();e.stopPropagation();close();},{passive:false});
    });
    modal.addEventListener('pointerdown',e=>{if(e.target===modal)close();},{passive:true});
    modal.addEventListener('click',e=>{if(e.target===modal)close();});
  }

  window.openOccupancyRecap=open;
  window.refreshOccupancyRecap=refresh;
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>setTimeout(inject,400));
  else setTimeout(inject,400);
})();

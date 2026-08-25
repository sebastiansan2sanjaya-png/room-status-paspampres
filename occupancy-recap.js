/* Rekap Data Tamu & Pax Terhuni — OD only */
(function(){
  const esc=v=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  let units=[], guests=[];

  async function load(){
    if(!window.supabaseClient) return {units:[],guests:[]};

    const {data,error}=await window.supabaseClient.rpc('get_occupancy_recap');
    if(error) throw error;

    // PostgREST normally returns jsonb as an object, but accept a JSON string too.
    let payload=data||{};
    if(typeof payload==='string'){
      try{ payload=JSON.parse(payload); }catch(e){ payload={}; }
    }
    // Be tolerant of a one-row wrapper as well.
    if(Array.isArray(payload) && payload.length===1 && payload[0] && typeof payload[0]==='object') payload=payload[0];

    units=Array.isArray(payload.units)?payload.units:[];
    const odIds=new Set(units.map(u=>String(u.id)));
    guests=(Array.isArray(payload.guests)?payload.guests:[])
      .filter(g=>odIds.has(String(g.unit_id)) && String(g.guest_name||'').trim());

    return {units,guests};
  }

  function build(){
    const byUnit={};
    guests.forEach(g=>(byUnit[g.unit_id]??=[]).push(g));

    const tower={};
    units.forEach(u=>{
      const pax=(byUnit[u.id]||[]).length;
      (tower[u.tower]??={units:0,pax:0,rows:[]});
      tower[u.tower].units++;
      tower[u.tower].pax+=pax;
      tower[u.tower].rows.push({
        ...u,
        pax,
        names:(byUnit[u.id]||[])
          .sort((a,b)=>Number(a.guest_order)-Number(b.guest_order))
          .map(x=>x.guest_name)
      });
    });

    return {byUnit,tower,totalUnits:units.length,totalPax:guests.length};
  }

  function open(){
    const modal=document.getElementById('occupancyRecapModal');
    if(modal) modal.style.display='flex';
    refresh();
  }

  async function refresh(){
    const list=document.getElementById('occupancyRecapBody');
    if(!list)return;
    list.innerHTML='<div style="padding:25px;text-align:center;color:#687386">Memuat rekap...</div>';
    try{
      await load();
      const d=build();
      const towers=Object.keys(d.tower).sort((a,b)=>Number(a)-Number(b));
      list.innerHTML=`<div class="occ-stats"><div><b>${d.totalUnits}</b><span>UNIT TERHUNI</span></div><div><b>${d.totalPax}</b><span>PAX TERHUNI</span></div></div><div class="occ-title">REKAP PER TOWER</div>`+
        (towers.length?towers.map(t=>{const x=d.tower[t];return `<details class="occ-tower"><summary><strong>TOWER ${esc(String(t).padStart(2,'0'))}</strong><span>${x.units} Unit · ${x.pax} Pax</span></summary><div>${x.rows.map(r=>`<div class="occ-unit"><div><strong>T${esc(String(r.tower).padStart(2,'0'))}-${esc(r.unit_number)}</strong><span>${r.pax} Pax</span></div>${r.names.length?`<small>${r.names.map(esc).join(' · ')}</small>`:'<small class="muted">Belum ada nama tamu</small>'}</div>`).join('')}</div></details>`}).join(''):'<div style="padding:25px;text-align:center;color:#687386">Belum ada unit OD.</div>');
    }catch(e){
      console.error('Occupancy recap failed:',e);
      list.innerHTML=`<div style="padding:25px;text-align:center;color:#c33">Gagal memuat rekap: ${esc(e?.message||'Error tidak diketahui')}</div>`;
    }
  }

  function inject(){
    if(document.getElementById('occupancyRecapBtn'))return;
    const style=document.createElement('style');style.textContent=`#occupancyRecapBtn{display:block;width:calc(100% - 32px);margin:0 16px 12px;height:46px;border:1px solid #b8c9f7;background:#fff;color:#356ff2;border-radius:12px;font-weight:800;cursor:pointer}#occupancyRecapBtn:active{transform:scale(.99)}#occupancyRecapModal{position:fixed;inset:0;background:rgba(21,29,42,.28);z-index:45;display:none;align-items:flex-end;justify-content:center}.occ-sheet{width:min(520px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:24px 24px 0 0;padding:18px 16px 25px}.occ-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.occ-head h2{margin:0;font-size:20px}.occ-close{border:0;background:#f1f5f9;border-radius:50%;width:38px;height:38px;font-size:22px}.occ-stats{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px}.occ-stats>div{border:1px solid #e6eaf0;border-radius:14px;padding:14px}.occ-stats b{display:block;font-size:30px}.occ-stats span{font-size:10px;color:#687386;font-weight:800}.occ-title{font-size:11px;color:#687386;font-weight:800;letter-spacing:.5px;margin:12px 0 8px}.occ-tower{border:1px solid #e6eaf0;border-radius:13px;margin-bottom:8px;overflow:hidden}.occ-tower summary{padding:13px;cursor:pointer;display:flex;justify-content:space-between;list-style:none}.occ-tower summary::-webkit-details-marker{display:none}.occ-tower summary span{color:#356ff2;font-size:12px;font-weight:700}.occ-unit{padding:10px 13px;border-top:1px solid #eef1f5}.occ-unit>div{display:flex;justify-content:space-between;font-size:13px}.occ-unit>div span{font-weight:800;color:#22aaa8}.occ-unit small{display:block;color:#687386;font-size:10px;margin-top:4px}.occ-unit .muted{opacity:.65}`;document.head.appendChild(style);
    const btn=document.createElement('button');btn.id='occupancyRecapBtn';btn.type='button';btn.textContent='📊 Rekap Data Tamu & Pax';
    const anchor=document.querySelector('.pdf-btn')||document.querySelector('.card');if(anchor)anchor.parentNode.insertBefore(btn,anchor);else document.body.appendChild(btn);btn.onclick=open;
    const modal=document.createElement('div');modal.id='occupancyRecapModal';modal.innerHTML='<div class="occ-sheet"><div class="occ-head"><h2>Rekap Data Tamu</h2><button class="occ-close" type="button">×</button></div><div id="occupancyRecapBody"></div></div>';document.body.appendChild(modal);modal.querySelector('.occ-close').onclick=()=>modal.style.display='none';modal.addEventListener('click',e=>{if(e.target===modal)modal.style.display='none'});
  }

  window.openOccupancyRecap=open;window.refreshOccupancyRecap=refresh;
  document.addEventListener('DOMContentLoaded',()=>setTimeout(inject,400));
})();

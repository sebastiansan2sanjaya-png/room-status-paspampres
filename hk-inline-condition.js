(function(){
  if(window.__hkInlineConditionV2)return;
  window.__hkInlineConditionV2=true;

  const isHK=()=>{
    const t=(document.body.innerText||'').toLowerCase();
    return t.includes('housekeeping')&&!t.includes('supervisor hk');
  };
  const isHKRole=()=>{
    const t=(document.body.innerText||'').toLowerCase();
    return t.includes('housekeeping')||t.includes('supervisor hk');
  };
  const isReception=()=>/resepsionis/i.test(document.body.innerText||'');
  const canViewCondition=()=>isHKRole()||isReception();

  function getClient(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(e){return null}}
  function selected(){return document.querySelector('#statusOptions .status-option.selected')?.dataset.status||''}
  function unitContext(){
    const title=document.getElementById('sheetTitle')?.textContent||'';
    const sub=document.getElementById('sheetSub')?.textContent||'';
    const um=title.match(/UNIT\s+(.+)/i);
    const tm=sub.match(/Tower\s*0*(\d+)/i);
    if(!um||!tm)return null;
    return{unit:um[1].trim(),tower:Number(tm[1])};
  }
  function esc(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]))}
  function statusFromSheet(){
    const current=document.getElementById('currentStatus');
    const text=(current?.innerText||'').toLowerCase();
    if(/out\s+of\s+order/.test(text))return 'OO';
    if(/out\s+of\s+service/.test(text))return 'OS';
    return '';
  }

  function injectFields(){
    if(!isHK())return;
    const grid=document.getElementById('statusOptions');if(!grid)return;
    const s=selected();
    let box=document.getElementById('hkInlineCondition');
    if(!['OS','OO'].includes(s)){if(box)box.remove();return}
    if(box)return;
    box=document.createElement('div');
    box.id='hkInlineCondition';
    box.style.cssText='margin-top:14px;padding:13px;border:1px solid #e1e6ef;border-radius:14px;background:rgba(255,255,255,.7)';
    box.innerHTML='<div class="section-label">Rincian Kondisi</div><input id="hkInlineReason" class="meta-input" style="width:100%;padding:11px 12px;border:1px solid #dfe5ee;border-radius:11px;background:#fff" placeholder="Reason — contoh: Electrical, Plumbing, HVAC"><textarea id="hkInlineNote" style="width:100%;min-height:82px;margin-top:8px;padding:11px 12px;border:1px solid #dfe5ee;border-radius:11px;background:#fff;resize:vertical;outline:0" placeholder="Note — jelaskan kondisi aktual yang ditemukan..."></textarea><div style="font-size:10px;color:#687386;margin-top:7px">Wajib diisi untuk status OS / OO.</div>';
    grid.parentNode.insertBefore(box,grid.nextSibling);
  }

  async function currentUnit(){
    const client=getClient();if(!client)throw new Error('Koneksi database belum siap. Silakan coba lagi.');
    const ctx=unitContext();if(!ctx)return null;
    const {data,error}=await client.from('room_units').select('id,unit_number,tower,floor,status').eq('unit_number',ctx.unit).eq('tower',ctx.tower).maybeSingle();
    if(error)throw error;return data;
  }

  async function loadConditionDetail(){
    if(!canViewCondition())return;
    const client=getClient();if(!client)return;
    const ctx=unitContext();if(!ctx)return;
    document.getElementById('hkConditionDetail')?.remove();

    const currentStatus=statusFromSheet();
    if(!['OS','OO'].includes(currentStatus))return;

    const unit=await currentUnit().catch(()=>null);if(!unit)return;
    const {data,error}=await client.from('room_condition_reports')
      .select('id,status,current_status,reason,note,reported_at,resolution_status,validated_at,resolved_status')
      .eq('unit_id',unit.id)
      .in('resolution_status',['open','in_progress'])
      .order('reported_at',{ascending:false})
      .limit(1);
    if(error||!data?.length)return;

    const r=data[0];
    const status=(r.status||r.current_status||currentStatus).toUpperCase();
    if(!['OS','OO'].includes(status))return;

    const anchor=document.getElementById('historyBtn')||document.querySelector('.history-btn');
    if(!anchor)return;

    const box=document.createElement('div');
    box.id='hkConditionDetail';
    box.style.cssText='margin-top:14px;padding:14px;border:1px solid #e1e6ef;border-radius:14px;background:#f8fafc';
    const dt=new Date(r.reported_at);
    const when=isNaN(dt)?r.reported_at:dt.toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
    const color=status==='OO'?'#ef5558':'#8c62d7';
    const viewerLabel=isReception()?'Rincian Kondisi':'Laporan Kondisi Aktif';
    box.innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px"><b style="font-size:11px;color:#566274;letter-spacing:.5px">${viewerLabel}</b><b style="color:${color};font-size:13px">${esc(status)}</b></div><div style="font-size:10px;color:#687386;text-transform:uppercase;font-weight:800">Reason</div><div style="font-size:12px;font-weight:800;margin:4px 0 10px">${esc(r.reason||'-')}</div><div style="font-size:10px;color:#687386;text-transform:uppercase;font-weight:800">Note</div><div style="font-size:12px;line-height:1.5;margin-top:4px;white-space:pre-wrap">${esc(r.note||'-')}</div><div style="font-size:10px;color:#8b95a3;margin-top:10px">Dilaporkan: ${esc(when)} · Status laporan: ${esc(r.resolution_status||'-')}</div>`;
    anchor.parentNode.insertBefore(box,anchor);
  }

  async function saveHKReport(e){
    if(!isHK())return;
    const s=selected();
    if(!['OS','OO'].includes(s))return;
    e.preventDefault();e.stopImmediatePropagation();
    const saveBtn=document.getElementById('save');
    if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='Menyimpan...'}
    try{
      const reason=document.getElementById('hkInlineReason')?.value.trim()||'';
      const note=document.getElementById('hkInlineNote')?.value.trim()||'';
      if(!reason||!note){showToast('Reason dan Note wajib diisi untuk OS / OO.');return}
      const client=getClient();if(!client)throw new Error('Koneksi database belum siap. Silakan coba lagi.');
      const u=await currentUnit();if(!u)throw new Error('Unit tidak ditemukan.');
      const {error}=await client.rpc('report_room_condition',{p_unit_id:Number(u.id),p_status:s,p_reason:reason,p_note:note});
      if(error)throw error;
      closeSheet();
      showToast(`Status ${s} tersimpan beserta Reason & Note.`);
    }catch(err){
      console.error(err);showToast(err.message||'Gagal menyimpan laporan kondisi.');
    }finally{
      if(saveBtn){saveBtn.disabled=false;saveBtn.textContent='Simpan Perubahan'}
    }
  }

  function removeLegacy(){
    if(isHK()){
      document.getElementById('hkConditionBtn')?.remove();
      document.querySelectorAll('#hkConditionModal').forEach(x=>x.remove());
    }
  }

  function scheduleConditionLoad(delay=180){
    clearTimeout(window.__conditionDetailTimer);
    window.__conditionDetailTimer=setTimeout(()=>loadConditionDetail().catch(()=>{}),delay);
  }

  function init(){
    removeLegacy();
    const mo=new MutationObserver(()=>{removeLegacy();injectFields()});
    mo.observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['style']});

    document.addEventListener('click',e=>{
      if(e.target?.id==='save'||e.target?.closest?.('#save'))saveHKReport(e);
      if(e.target?.closest?.('.unit'))scheduleConditionLoad(220);
      if(e.target?.closest?.('.status-option'))scheduleConditionLoad(120);
    },true);

    // Fallback for opening the sheet from other UI controls.
    scheduleConditionLoad(300);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

(function(){
  if(window.__hkWorkflowFixV1)return;
  window.__hkWorkflowFixV1=true;
  const c=()=>{try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(e){return null}};
  const esc=v=>String(v??'').replace(/[&<>\"]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[x]));
  const fmt=v=>{const d=new Date(v);return isNaN(d)?String(v||''):d.toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false})};
  const reception=()=>/resepsionis/i.test(document.body.innerText||'');
  const supervisor=()=>/supervisor hk/i.test(document.body.innerText||'');
  const hk=()=>/housekeeping/i.test(document.body.innerText||'')&&!supervisor()&&!reception();
  const ctx=()=>{const t=document.getElementById('sheetTitle')?.textContent||'',s=document.getElementById('sheetSub')?.textContent||'',u=t.match(/UNIT\s+(.+)/i),tw=s.match(/Tower\s*0*(\d+)/i);return u&&tw?{unit:u[1].trim(),tower:Number(tw[1])}:null};
  const currentStatus=()=>{const x=(document.getElementById('currentStatus')?.innerText||'').toLowerCase();return /out\s+of\s+order/.test(x)?'OO':/out\s+of\s+service/.test(x)?'OS':''};
  async function unit(){const q=ctx(),db=c();if(!q||!db)return null;const {data}=await db.from('room_units').select('id,unit_number,tower,floor,status').eq('unit_number',q.unit).eq('tower',q.tower).maybeSingle();return data||null}
  async function report(id){const db=c();if(!db)return null;const {data}=await db.from('room_condition_reports').select('id,status,current_status,reason,note,reported_at,resolution_status').eq('unit_id',id).in('resolution_status',['open','in_progress']).order('reported_at',{ascending:false}).limit(1);return data?.[0]||null}
  async function follow(id){const db=c();if(!db)return null;const {data}=await db.from('room_condition_followups').select('action,note,updated_at,updated_by').eq('report_id',id).order('updated_at',{ascending:false}).limit(1);return data?.[0]||null}

  async function showCondition(){
    if(!(reception()||supervisor()))return;
    const st=currentStatus();if(!['OS','OO'].includes(st))return;
    const u=await unit();if(!u)return;const r=await report(u.id);if(!r)return;
    document.getElementById('hkConditionDetail')?.remove();document.getElementById('receptionHKFollowup')?.remove();
    const anchor=document.getElementById('historyBtn')||document.querySelector('.history-btn');if(!anchor?.parentNode)return;
    const box=document.createElement('div');box.id='hkConditionDetail';box.style.cssText='margin-top:14px;padding:14px;border:1px solid #e1e6ef;border-radius:14px;background:#f8fafc;width:100%;box-sizing:border-box;';
    const color=st==='OO'?'#ef5558':'#8c62d7';
    box.innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:10px"><b style="font-size:11px;color:#566274;letter-spacing:.5px">RINCIAN KONDISI</b><b style="color:${color};font-size:13px">${esc(r.current_status||st)}</b></div><div style="font-size:10px;color:#687386;text-transform:uppercase;font-weight:800">Reason</div><div style="font-size:12px;font-weight:800;margin:4px 0 10px">${esc(r.reason||'-')}</div><div style="font-size:10px;color:#687386;text-transform:uppercase;font-weight:800">Note</div><div style="font-size:12px;line-height:1.5;white-space:pre-wrap;margin-top:4px">${esc(r.note||'-')}</div><div style="font-size:10px;color:#8b95a3;margin-top:10px">Dilaporkan: ${esc(fmt(r.reported_at))}</div>`;
    anchor.parentNode.insertBefore(box,anchor);
    const f=await follow(r.id);
    if(f){const fb=document.createElement('div');fb.id='receptionHKFollowup';fb.style.cssText='margin-top:10px;padding:12px;border:1px solid #e1e6ef;border-radius:14px;background:#fff;width:100%;box-sizing:border-box;';fb.innerHTML=`<div style="font-size:10px;color:#687386;text-transform:uppercase;font-weight:800">TINDAK LANJUT SUPERVISOR HK</div><div style="font-size:12px;font-weight:800;margin-top:5px">${esc(f.action)}</div><div style="font-size:12px;line-height:1.5;margin-top:4px;white-space:pre-wrap">${esc(f.note)}</div><div style="font-size:10px;color:#8b95a3;margin-top:8px">${esc(fmt(f.updated_at))}</div>`;anchor.parentNode.insertBefore(fb,anchor);}
  }

  function injectReporter(){
    if(!hk())return;const grid=document.getElementById('statusOptions');if(!grid)return;const s=grid.querySelector('.status-option.selected')?.dataset.status||'';let box=document.getElementById('hkInlineCondition');
    if(!['OS','OO'].includes(s)){box?.remove();return}if(box)return;
    box=document.createElement('div');box.id='hkInlineCondition';box.style.cssText='margin-top:14px;padding:13px;border:1px solid #e1e6ef;border-radius:14px;background:#fff';box.innerHTML='<div class="section-label">Rincian Kondisi</div><input id="hkInlineReason" class="meta-input" style="width:100%;padding:11px 12px;border:1px solid #dfe5ee;border-radius:11px;background:#fff" placeholder="Reason — contoh: Electrical, Plumbing, HVAC"><textarea id="hkInlineNote" style="width:100%;min-height:82px;margin-top:8px;padding:11px 12px;border:1px solid #dfe5ee;border-radius:11px;background:#fff;resize:vertical;outline:0" placeholder="Note — jelaskan kondisi aktual yang ditemukan..."></textarea><div style="font-size:10px;color:#687386;margin-top:7px">Wajib diisi untuk status OS / OO.</div>';grid.parentNode.insertBefore(box,grid.nextSibling);
  }
  async function saveReporter(e){if(!hk())return;const s=document.querySelector('#statusOptions .status-option.selected')?.dataset.status||'';if(!['OS','OO'].includes(s))return;e.preventDefault();e.stopImmediatePropagation();const btn=document.getElementById('save');if(btn){btn.disabled=true;btn.textContent='Menyimpan...'}try{const reason=document.getElementById('hkInlineReason')?.value.trim(),note=document.getElementById('hkInlineNote')?.value.trim();if(!reason||!note){showToast('Reason dan Note wajib diisi untuk OS / OO.');return}const u=await unit();if(!u)throw Error('Unit tidak ditemukan.');const {error}=await c().rpc('report_room_condition',{p_unit_id:Number(u.id),p_status:s,p_reason:reason,p_note:note});if(error)throw error;closeSheet();showToast(`Status ${s} tersimpan beserta Reason & Note.`)}catch(err){showToast(err.message||'Gagal menyimpan laporan kondisi.')}finally{if(btn){btn.disabled=false;btn.textContent='Simpan Perubahan'}}}

  async function enhanceSupervisor(){
    if(!supervisor())return;const body=document.getElementById('hkBody');if(!body)return;
    for(const card of [...body.querySelectorAll('.hk-report')]){const b=card.querySelector('.hk-report-btn');if(!b)continue;const id=Number(b.dataset.reportId);if(!id)continue;let f=await follow(id);card.querySelector('.hk-followup-readonly')?.remove();if(f){const x=document.createElement('div');x.className='hk-followup-readonly';x.style.cssText='margin-top:10px;padding:10px;border-radius:10px;background:#f1f5f9;border:1px solid #e2e8f0';x.innerHTML=`<div style="font-size:9px;font-weight:800;color:#687386;text-transform:uppercase">TINDAK LANJUT TERAKHIR</div><div style="font-size:11px;font-weight:800;margin-top:4px">${esc(f.action)}</div><div style="font-size:10px;color:#566274;margin-top:3px;white-space:pre-wrap">${esc(f.note)}</div><div style="font-size:9px;color:#8b95a3;margin-top:4px">${esc(fmt(f.updated_at))}</div>`;card.insertBefore(x,b)}}
  }
  function hideReceptionFollowup(){if(reception())document.getElementById('hkConditionBtn')?.remove()}
  function watch(){const mo=new MutationObserver(()=>{injectReporter();hideReceptionFollowup();showCondition().catch(()=>{});enhanceSupervisor().catch(()=>{})});mo.observe(document.body,{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest?.('#save'))saveReporter(e);if(e.target.closest?.('.unit')||e.target.closest?.('.status-option'))setTimeout(()=>showCondition().catch(()=>{}),250);if(e.target.closest?.('#hkConditionBtn'))setTimeout(()=>enhanceSupervisor().catch(()=>{}),500)},true);setTimeout(()=>{injectReporter();hideReceptionFollowup();showCondition().catch(()=>{});enhanceSupervisor().catch(()=>{})},700)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',watch,{once:true});else watch();
})();

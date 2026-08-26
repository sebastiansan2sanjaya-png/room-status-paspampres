(function(){
 if(window.__hkInlineConditionV5)return;window.__hkInlineConditionV5=true;
 const C=()=>{try{return typeof supabaseClient!=='undefined'?supabaseClient:null}catch(e){return null}},R=()=>/resepsionis/i.test(document.body.innerText||''),S=()=>/supervisor hk/i.test(document.body.innerText||''),H=()=>/housekeeping/i.test(document.body.innerText||'')&&!R()&&!S();
 const esc=v=>String(v??'').replace(/[&<>\"]/g,x=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[x])),fmt=v=>{const d=new Date(v);return isNaN(d)?String(v||''):d.toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false})};
 const ctx=()=>{const a=document.getElementById('sheetTitle')?.textContent||'',b=document.getElementById('sheetSub')?.textContent||'',u=a.match(/UNIT\s+(.+)/i),t=b.match(/Tower\s*0*(\d+)/i);return u&&t?{unit:u[1].trim(),tower:Number(t[1])}:null};
 async function unit(){const q=ctx(),c=C();if(!q||!c)return null;const {data}=await c.from('room_units').select('id,unit_number,tower,floor,status').eq('unit_number',q.unit).eq('tower',q.tower).maybeSingle();return data||null}
 async function report(id){const c=C();if(!c)return null;const {data}=await c.from('room_condition_reports').select('id,status,current_status,reason,note,reported_at,resolution_status').eq('unit_id',id).in('resolution_status',['open','in_progress']).order('reported_at',{ascending:false}).limit(1);return data?.[0]||null}
 async function follow(id){const c=C();if(!c)return null;const {data}=await c.from('room_condition_followups').select('action,note,updated_at').eq('report_id',id).order('updated_at',{ascending:false}).limit(1);return data?.[0]||null}
 function status(){const x=(document.getElementById('currentStatus')?.innerText||'').toLowerCase();return /out\s+of\s+order/.test(x)?'OO':/out\s+of\s+service/.test(x)?'OS':''}
 function inject(){if(!H())return;const g=document.getElementById('statusOptions');if(!g)return;const s=g.querySelector('.status-option.selected')?.dataset.status||'';let b=document.getElementById('hkInlineCondition');if(!['OS','OO'].includes(s)){b?.remove();return}if(b)return;b=document.createElement('div');b.id='hkInlineCondition';b.style.cssText='margin-top:14px;padding:13px;border:1px solid #e1e6ef;border-radius:14px;background:#fff';b.innerHTML='<div class="section-label">Rincian Kondisi</div><input id="hkInlineReason" class="meta-input" style="width:100%;padding:11px 12px;border:1px solid #dfe5ee;border-radius:11px;background:#fff" placeholder="Reason — contoh: Electrical, Plumbing, HVAC"><textarea id="hkInlineNote" style="width:100%;min-height:82px;margin-top:8px;padding:11px 12px;border:1px solid #dfe5ee;border-radius:11px;background:#fff;resize:vertical;outline:0" placeholder="Note — jelaskan kondisi aktual yang ditemukan..."></textarea><div style="font-size:10px;color:#687386;margin-top:7px">Wajib diisi untuk status OS / OO.</div>';g.parentNode.insertBefore(b,g.nextSibling)}
 async function saveHK(e){if(!H())return;const s=document.querySelector('#statusOptions .status-option.selected')?.dataset.status||'';if(!['OS','OO'].includes(s))return;e.preventDefault();e.stopImmediatePropagation();const btn=document.getElementById('save');if(btn){btn.disabled=true;btn.textContent='Menyimpan...'}try{const reason=document.getElementById('hkInlineReason')?.value.trim(),note=document.getElementById('hkInlineNote')?.value.trim();if(!reason||!note){showToast('Reason dan Note wajib diisi untuk OS / OO.');return}const u=await unit();if(!u)throw Error('Unit tidak ditemukan.');const {error}=await C().rpc('report_room_condition',{p_unit_id:Number(u.id),p_status:s,p_reason:reason,p_note:note});if(error)throw error;closeSheet();showToast(`Status ${s} tersimpan beserta Reason & Note.`)}catch(err){showToast(err.message||'Gagal menyimpan laporan kondisi.')}finally{if(btn){btn.disabled=false;btn.textContent='Simpan Perubahan'}}}
 async function viewDetail(){if(R()||(!S()&&!H()))return;const st=status();if(!['OS','OO'].includes(st))return;const u=await unit();if(!u)return;const r=await report(u.id);if(!r)return;document.getElementById('hkConditionDetail')?.remove();document.getElementById('receptionHKFollowup')?.remove();const a=document.getElementById('historyBtn')||document.querySelector('.history-btn');if(!a?.parentNode)return;const b=document.createElement('div');b.id='hkConditionDetail';b.style.cssText='margin-top:14px;padding:14px;border:1px solid #e1e6ef;border-radius:14px;background:#f8fafc;width:100%;box-sizing:border-box';const color=st==='OO'?'#ef5558':'#8c62d7';b.innerHTML=`<div style="display:flex;justify-content:space-between;margin-bottom:10px"><b style="font-size:11px;color:#566274;letter-spacing:.5px">RINCIAN KONDISI</b><b style="color:${color};font-size:13px">${esc(r.current_status||st)}</b></div><div style="font-size:10px;color:#687386;text-transform:uppercase;font-weight:800">Reason</div><div style="font-size:12px;font-weight:800;margin:4px 0 10px">${esc(r.reason||'-')}</div><div style="font-size:10px;color:#687386;text-transform:uppercase;font-weight:800">Note</div><div style="font-size:12px;line-height:1.5;white-space:pre-wrap;margin-top:4px">${esc(r.note||'-')}</div><div style="font-size:10px;color:#8b95a3;margin-top:10px">Dilaporkan: ${esc(fmt(r.reported_at))}</div>`;a.parentNode.insertBefore(b,a);const f=await follow(r.id);if(f){const x=document.createElement('div');x.id='receptionHKFollowup';x.style.cssText='margin-top:10px;padding:12px;border:1px solid #e1e6ef;border-radius:14px;background:#fff;width:100%;box-sizing:border-box';x.innerHTML=`<div style="font-size:10px;color:#687386;text-transform:uppercase;font-weight:800">TINDAK LANJUT SUPERVISOR HK</div><div style="font-size:12px;font-weight:800;margin-top:5px">${esc(f.action)}</div><div style="font-size:12px;line-height:1.5;margin-top:4px;white-space:pre-wrap">${esc(f.note)}</div><div style="font-size:10px;color:#8b95a3;margin-top:8px">${esc(fmt(f.updated_at))}</div>`;a.parentNode.insertBefore(x,a)}}
 function restoreRoleVisibility(){
   try{
     if(typeof STATUS==='undefined')return;
     window.visibleStatuses=()=>Object.entries(STATUS);
     const sf=document.getElementById('statusFilter');
     if(sf){
       const current=sf.value;
       sf.innerHTML='<option value="ALL">Semua Status</option>';
       Object.entries(STATUS).forEach(([code,s])=>sf.insertAdjacentHTML('beforeend',`<option value="${code}">${code} — ${s.name}</option>`));
       sf.value=current||'ALL';
     }
     if(typeof window.renderAll==='function')window.renderAll();
   }catch(e){console.error('Role visibility restore failed:',e)}
 }
 function restoreReceptionistSheetAccess(){
   if(typeof window.openSheet!=='function')return;
   const original=window.openSheet;
   if(original.__roleFixV5)return;
   const wrapped=function(id){
     const u=typeof units!=='undefined'?units.find(x=>x.id===id):null;
     const restricted=u&&['OS','OO'].includes(u.status)&&/resepsionis/i.test(document.body.innerText||'');
     if(!restricted)return original(id);
     const old=window.isRestrictedReceptionistStatus;
     window.isRestrictedReceptionistStatus=()=>false;
     try{original(id)}finally{window.isRestrictedReceptionistStatus=old}
     document.getElementById('statusOptions')?.closest('.sheet-section')?.classList.add('hidden');
     document.getElementById('updatedBy')?.closest('.meta')?.classList.add('hidden');
     document.querySelector('.actions')?.classList.add('hidden');
     document.getElementById('guestSection')?.classList.add('hidden');
     setTimeout(()=>viewDetail().catch(()=>{}),150);
   };
   wrapped.__roleFixV5=true;
   window.openSheet=wrapped;
 }
 function loadFix(){if(document.getElementById('hkWorkflowFixScript'))return;const s=document.createElement('script');s.id='hkWorkflowFixScript';s.src='hk-workflow-fix.js?v=20260826-1';document.head.appendChild(s)}
 function loadMobileFix(){if(document.getElementById('mobileModalFixScript'))return;const s=document.createElement('script');s.id='mobileModalFixScript';s.src='mobile-modal-fix.js?v=20260826-1';document.head.appendChild(s)}
 function init(){restoreRoleVisibility();restoreReceptionistSheetAccess();loadFix();loadMobileFix();const mo=new MutationObserver(()=>{restoreReceptionistSheetAccess();inject();if(R())document.getElementById('hkConditionBtn')?.remove()});mo.observe(document.body,{childList:true,subtree:true});document.addEventListener('click',e=>{if(e.target.closest?.('#save'))saveHK(e);if(e.target.closest?.('.unit')||e.target.closest?.('.status-option'))setTimeout(()=>viewDetail().catch(()=>{}),250)},true);setTimeout(()=>{restoreRoleVisibility();restoreReceptionistSheetAccess();inject();viewDetail().catch(()=>{})},700)}
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

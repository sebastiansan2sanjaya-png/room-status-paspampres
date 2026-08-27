/* Room Status — clean HK workflow layer */
(function(){
  if(window.__roomStatusHKWorkflowV1)return;
  window.__roomStatusHKWorkflowV1=true;

  const isHK=()=>window.currentProfile?.role==='housekeeping';
  const isSHK=()=>window.currentProfile?.role==='supervisor_hk';
  const isEditor=()=>window.currentProfile?.role==='editor';
  const db=()=>window.supabaseClient;
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));
  const fmt=v=>{const d=new Date(v);return isNaN(d)?'—':d.toLocaleString('id-ID',{day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit'})+' WITA'};
  const currentUnit=()=>{
    const title=document.getElementById('sheetTitle')?.textContent||'';
    const sub=document.getElementById('sheetSub')?.textContent||'';
    const m=title.match(/UNIT\s+(.+)/i),t=sub.match(/Tower\s*0*(\d+)/i);
    if(!m||!t)return null;
    const number=m[1].trim(),tower=Number(t[1]);
    return window.units?.find(u=>u.number===number&&Number(u.tower.slice(1))===tower)||null;
  };
  const reportFor=async unit=>{
    if(!unit?.dbId||!db())return null;
    const {data,error}=await db().from('room_condition_reports')
      .select('id,current_status,reason,note,reported_at,reported_by,resolution_status,validated_at,resolved_status')
      .eq('unit_id',unit.dbId)
      .order('reported_at',{ascending:false}).limit(1);
    if(error)throw error;
    return data?.[0]||null;
  };
  const followFor=async reportId=>{
    if(!db())return null;
    const {data,error}=await db().from('room_condition_followups')
      .select('action,note,updated_at,updated_by').eq('report_id',reportId)
      .order('updated_at',{ascending:false}).limit(1);
    if(error)throw error;
    return data?.[0]||null;
  };

  function style(){
    if(document.getElementById('hkWorkflowStyle'))return;
    const s=document.createElement('style');s.id='hkWorkflowStyle';
    s.textContent=`
      .hk-detail-card{margin-top:14px;padding:13px;border:1px solid #e2e7ee;border-radius:14px;background:#f8fafc}
      .hk-detail-head{display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:10px}
      .hk-detail-title{font-size:11px;font-weight:800;letter-spacing:.04em;color:#566274}
      .hk-detail-pill{font-size:10px;font-weight:800;padding:5px 8px;border-radius:8px}
      .hk-detail-pill.os{background:#f0eafd;color:#744cc0}.hk-detail-pill.oo{background:#ffe8e9;color:#c33d42}
      .hk-detail-label{font-size:9px;color:#7a8492;text-transform:uppercase;font-weight:800;margin-top:9px}
      .hk-detail-value{font-size:12px;color:#253042;line-height:1.5;margin-top:3px;white-space:pre-wrap}
      .hk-detail-meta{font-size:9px;color:#94a3b8;margin-top:9px}
      .hk-condition-form{margin-top:12px;padding:12px;border:1px solid #e2e7ee;border-radius:13px;background:#fff}
      .hk-condition-input{width:100%;box-sizing:border-box;border:1px solid #dfe5ee;border-radius:10px;padding:10px 11px;background:#fff;outline:0;font-size:12px;color:#18212f}
      .hk-condition-input:focus{border-color:#356ff2;box-shadow:0 0 0 3px #edf3ff}
      .hk-condition-note{min-height:78px;resize:vertical;margin-top:8px}
      .hk-condition-help{font-size:9px;color:#8b95a3;margin-top:7px}
      .hk-follow-card{margin-top:10px;padding:11px;border:1px solid #dce5f0;border-radius:12px;background:#fff}
      .hk-follow-title{font-size:9px;font-weight:800;color:#687386;text-transform:uppercase}
      .hk-follow-action{font-size:12px;font-weight:800;color:#253042;margin-top:4px}
      .hk-follow-note{font-size:11px;color:#566274;line-height:1.5;margin-top:3px;white-space:pre-wrap}
      .hk-follow-meta{font-size:9px;color:#94a3b8;margin-top:6px}
      .hk-task-btn{display:none;width:calc(100% - 32px);margin:0 16px 12px;height:46px;border:1px solid #dbe4f4;background:#fff;color:#356ff2;border-radius:14px;font-weight:800;cursor:pointer}
      .hk-task-btn.show{display:block}
      .hk-modal{position:fixed;inset:0;z-index:120;display:none;align-items:flex-end;justify-content:center;background:rgba(15,23,42,.32);backdrop-filter:blur(3px)}
      .hk-modal.show{display:flex}.hk-modal-sheet{width:min(520px,100%);max-height:88vh;overflow:auto;background:#fff;border-radius:24px 24px 0 0;padding:17px 16px 28px;box-shadow:0 -14px 45px rgba(15,23,42,.16)}
      .hk-modal-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:13px}.hk-modal-head h2{margin:0;font-size:19px}.hk-modal-close{width:38px;height:38px;border:0;border-radius:50%;background:#f1f5f9;font-size:23px;color:#566274}
      .hk-report{border:1px solid #e2e7ee;border-radius:14px;padding:12px;margin-bottom:10px;background:#fff}.hk-report-top{display:flex;justify-content:space-between;align-items:center;gap:8px}.hk-report-unit{font-size:14px;font-weight:800}.hk-report-status{font-size:10px;font-weight:800;padding:5px 8px;border-radius:8px}.hk-report-status.os{background:#f0eafd;color:#744cc0}.hk-report-status.oo{background:#ffe8e9;color:#c33d42}.hk-report-meta{font-size:9px;color:#94a3b8;margin-top:5px}.hk-report-label{font-size:9px;color:#7a8492;text-transform:uppercase;font-weight:800;margin-top:10px}.hk-report-text{font-size:11px;line-height:1.5;margin-top:3px;white-space:pre-wrap;color:#253042}.hk-validate-btn{width:100%;height:42px;margin-top:11px;border:0;border-radius:11px;background:#356ff2;color:#fff;font-weight:800}.hk-empty{text-align:center;color:#8b95a3;font-size:11px;padding:22px 10px;border:1px dashed #dbe2ea;border-radius:12px}.hk-validation{padding-top:4px}.hk-back{border:0;background:transparent;color:#356ff2;font-weight:800;padding:0 0 10px}.hk-status-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:7px}.hk-status-btn{border:1px solid #dfe5ee;background:#fff;border-radius:11px;padding:10px;text-align:left;font-weight:800}.hk-status-btn small{display:block;font-size:9px;color:#8b95a3;font-weight:500;margin-top:3px}.hk-status-btn.sel{border-color:#356ff2;box-shadow:inset 0 0 0 1.5px #356ff2;background:#f8fbff}.hk-field-label{font-size:9px;text-transform:uppercase;font-weight:800;color:#687386;margin-top:11px;margin-bottom:5px}.hk-save-validation{width:100%;height:44px;border:0;border-radius:11px;background:#356ff2;color:#fff;font-weight:800;margin-top:12px}`;
    document.head.appendChild(s);
  }

  async function injectDetail(){
    if(!(isHK()||isSHK()||isEditor()))return;
    const u=currentUnit();if(!u||!['OS','OO'].includes(u.status))return;
    const sheet=document.getElementById('sheet');if(!sheet)return;
    document.getElementById('hkDetailCard')?.remove();
    try{
      const r=await reportFor(u);if(!r)return;
      const f=await followFor(r.id);
      const card=document.createElement('div');card.id='hkDetailCard';card.className='hk-detail-card';
      card.innerHTML=`<div class="hk-detail-head"><div class="hk-detail-title">RINCIAN KONDISI</div><span class="hk-detail-pill ${String(r.current_status).toLowerCase()}">${esc(r.current_status)}</span></div><div class="hk-detail-label">Reason</div><div class="hk-detail-value">${esc(r.reason||'—')}</div><div class="hk-detail-label">Note</div><div class="hk-detail-value">${esc(r.note||'—')}</div><div class="hk-detail-meta">Dilaporkan ${esc(fmt(r.reported_at))} · ${esc(r.resolution_status||'—')}</div>${f?`<div class="hk-follow-card"><div class="hk-follow-title">Tindak Lanjut Supervisor HK</div><div class="hk-follow-action">${esc(f.action||'—')}</div><div class="hk-follow-note">${esc(f.note||'—')}</div><div class="hk-follow-meta">Update ${esc(fmt(f.updated_at))}</div></div>`:''}`;
      const current=document.getElementById('currentStatus');current?.parentNode?.insertAdjacentElement('afterend',card);
    }catch(e){console.warn('HK detail load failed',e)}
  }

  function syncConditionForm(){
    if(!isHK())return;
    const selected=document.querySelector('#statusOptions .status-option.selected')?.dataset.status||'';
    let box=document.getElementById('hkConditionForm');
    if(!['OS','OO'].includes(selected)){box?.remove();return}
    if(box)return;
    box=document.createElement('div');box.id='hkConditionForm';box.className='hk-condition-form';
    box.innerHTML='<div class="section-label">Rincian Kondisi</div><input id="hkReason" class="hk-condition-input" placeholder="Reason — contoh: Electrical, Plumbing, HVAC"><textarea id="hkNote" class="hk-condition-input hk-condition-note" placeholder="Note — jelaskan kondisi aktual yang ditemukan..."></textarea><div class="hk-condition-help">Reason dan Note wajib diisi untuk OS / OO.</div>';
    const g=document.getElementById('statusOptions');g?.parentNode?.insertAdjacentElement('afterend',box);
  }

  async function saveHK(e){
    if(!isHK())return;
    const selected=document.querySelector('#statusOptions .status-option.selected')?.dataset.status||'';
    if(!['OS','OO'].includes(selected))return;
    e.preventDefault();e.stopImmediatePropagation();e.stopPropagation();
    const reason=document.getElementById('hkReason')?.value.trim()||'',note=document.getElementById('hkNote')?.value.trim()||'';
    if(!reason||!note){window.showToast?.('Reason dan Note wajib diisi untuk OS / OO.');return}
    const u=currentUnit();if(!u?.dbId){window.showToast?.('Unit tidak ditemukan.');return}
    const btn=document.getElementById('save');if(btn){btn.disabled=true;btn.textContent='Menyimpan...'}
    try{
      const {error}=await db().rpc('report_room_condition',{p_unit_id:Number(u.dbId),p_status:selected,p_reason:reason,p_note:note});
      if(error)throw error;
      u.status=selected;u.updated=new Date();u.updatedBy=window.currentProfile?.username||'';
      window.closeSheet?.();window.renderAll?.();window.showToast?.(`Unit ${u.number} → ${selected} tersimpan.`);
    }catch(err){window.showToast?.(err.message||'Gagal menyimpan laporan kondisi.');if(btn){btn.disabled=false;btn.textContent='Simpan Perubahan'}}
  }

  async function reports(){
    const {data,error}=await db().from('room_condition_reports')
      .select('id,unit_id,current_status,reason,note,reported_at,resolution_status,room_units(unit_number,tower,floor)')
      .in('resolution_status',['open','in_progress']).order('reported_at',{ascending:false});
    if(error)throw error;return data||[];
  }

  async function openTaskList(){
    const modal=document.getElementById('hkTaskModal');if(!modal)return;modal.classList.add('show');
    const body=document.getElementById('hkTaskBody');body.innerHTML='<div class="hk-empty">Memuat laporan OS / OO...</div>';
    try{
      const rs=await reports();
      if(!rs.length){body.innerHTML='<div class="hk-empty">Tidak ada OS / OO yang menunggu tindak lanjut.</div>';return}
      body.innerHTML=rs.map(r=>{const s=String(r.current_status).toLowerCase();return `<div class="hk-report"><div class="hk-report-top"><div class="hk-report-unit">T${String(r.room_units?.tower??'').padStart(2,'0')}-${esc(r.room_units?.unit_number||r.unit_id)}</div><span class="hk-report-status ${s}">${esc(r.current_status)} · ${esc(r.resolution_status)}</span></div><div class="hk-report-meta">Dilaporkan ${esc(fmt(r.reported_at))}</div><div class="hk-report-label">Reason</div><div class="hk-report-text">${esc(r.reason)}</div><div class="hk-report-label">Note</div><div class="hk-report-text">${esc(r.note)}</div><button class="hk-validate-btn" data-report="${r.id}">Validasi / Tindak Lanjut</button></div>`}).join('');
      body.querySelectorAll('.hk-validate-btn').forEach(b=>b.onclick=()=>openValidation(Number(b.dataset.report)));
    }catch(e){body.innerHTML=`<div class="hk-empty">Gagal memuat: ${esc(e.message)}</div>`}
  }

  async function openValidation(id){
    const body=document.getElementById('hkTaskBody');
    const {data:r,error}=await db().from('room_condition_reports').select('id,current_status,reason,note,reported_at,resolution_status,room_units(unit_number,tower,floor)').eq('id',id).maybeSingle();
    if(error||!r){body.innerHTML='<div class="hk-empty">Laporan tidak ditemukan.</div>';return}
    const f=await followFor(id);let selected=r.current_status;
    body.innerHTML=`<div class="hk-validation"><button class="hk-back" id="hkBack">← Kembali</button><div class="hk-report"><div class="hk-report-top"><div class="hk-report-unit">T${String(r.room_units?.tower??'').padStart(2,'0')}-${esc(r.room_units?.unit_number||'')}</div><span class="hk-report-status ${String(r.current_status).toLowerCase()}">${esc(r.current_status)}</span></div><div class="hk-report-label">Reason</div><div class="hk-report-text">${esc(r.reason)}</div><div class="hk-report-label">Note</div><div class="hk-report-text">${esc(r.note)}</div>${f?`<div class="hk-follow-card"><div class="hk-follow-title">Tindak Lanjut Tersimpan</div><div class="hk-follow-action">${esc(f.action)}</div><div class="hk-follow-note">${esc(f.note)}</div></div>`:''}</div><div class="hk-field-label">Hasil Validasi</div><div class="hk-status-grid">${[['OS','Tetap Out of Service'],['OO','Tetap Out of Order'],['VC','Selesai — Vacant Clean'],['VD','Selesai — Vacant Dirty']].map(([v,d])=>`<button class="hk-status-btn ${selected===v?'sel':''}" data-status="${v}">${v}<small>${d}</small></button>`).join('')}</div><div class="hk-field-label">Tindakan</div><input id="hkAction" class="hk-condition-input" placeholder="Contoh: Pemeriksaan teknisi"><div class="hk-field-label">Follow Up Note</div><textarea id="hkFollowNote" class="hk-condition-input hk-condition-note" placeholder="Jelaskan hasil tindak lanjut..."></textarea><button id="hkSaveValidation" class="hk-save-validation">Simpan Tindak Lanjut</button></div>`;
    body.querySelectorAll('.hk-status-btn').forEach(b=>b.onclick=()=>{selected=b.dataset.status;body.querySelectorAll('.hk-status-btn').forEach(x=>x.classList.remove('sel'));b.classList.add('sel')});
    document.getElementById('hkBack').onclick=openTaskList;
    document.getElementById('hkSaveValidation').onclick=async()=>{
      const action=document.getElementById('hkAction').value.trim(),note=document.getElementById('hkFollowNote').value.trim();
      if(!action||!note){alert('Tindakan dan Follow Up Note wajib diisi.');return}
      const b=document.getElementById('hkSaveValidation');b.disabled=true;b.textContent='Menyimpan...';
      const {error}=await db().rpc('validate_room_condition',{p_report_id:id,p_new_status:selected,p_action:action,p_note:note});
      if(error){alert(error.message||'Gagal menyimpan.');b.disabled=false;b.textContent='Simpan Tindak Lanjut';return}
      await openTaskList();window.renderAll?.();
    };
  }

  function ensureTaskUI(){
    const btn=document.getElementById('hkTaskBtn');
    if(!btn)return;
    btn.classList.toggle('show',!!isSHK());
  }

  function buildTaskUI(){
    style();
    if(!document.getElementById('hkTaskBtn')){
      const b=document.createElement('button');b.id='hkTaskBtn';b.className='hk-task-btn';b.textContent='Tindak Lanjut OS / OO';
      const anchor=document.getElementById('permissionNotice')||document.querySelector('.pdf-btn');anchor?.parentNode?.insertBefore(b,anchor.nextSibling);
      b.onclick=openTaskList;
    }
    if(!document.getElementById('hkTaskModal')){
      const m=document.createElement('div');m.id='hkTaskModal';m.className='hk-modal';m.innerHTML='<div class="hk-modal-sheet"><div class="hk-modal-head"><h2>Tindak Lanjut OS / OO</h2><button class="hk-modal-close" id="hkTaskClose">×</button></div><div style="font-size:11px;color:#687386;margin-bottom:13px">Supervisor HK · Validator / Follow Up</div><div id="hkTaskBody"></div></div>';
      document.body.appendChild(m);m.querySelector('#hkTaskClose').onclick=()=>m.classList.remove('show');m.onclick=e=>{if(e.target===m)m.classList.remove('show')};
    }
    ensureTaskUI();
  }

  function wrapOpenSheet(){
    if(typeof window.openSheet!=='function'||window.openSheet.__hkWrapped)return;
    const original=window.openSheet;
    const wrapped=function(id){const r=original.apply(this,arguments);setTimeout(()=>{injectDetail().catch(()=>{});syncConditionForm()},180);return r};
    wrapped.__hkWrapped=true;window.openSheet=wrapped;
  }

  function init(){
    style();buildTaskUI();wrapOpenSheet();ensureTaskUI();
    document.addEventListener('click',e=>{
      if(e.target?.closest?.('#save'))saveHK(e);
      if(e.target?.closest?.('.status-option'))setTimeout(()=>{syncConditionForm();if(['housekeeping','supervisor_hk','editor'].includes(window.currentProfile?.role))injectDetail().catch(()=>{})},80);
    },true);
    const mo=new MutationObserver(()=>{buildTaskUI();wrapOpenSheet()});mo.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>{buildTaskUI();wrapOpenSheet()},500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

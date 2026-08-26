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
    :root{--glass-bg:rgba(255,255,255,.72);--glass-strong:rgba(255,255,255,.84);--glass-line:rgba(255,255,255,.88);--glass-shadow:0 14px 38px rgba(34,53,84,.09);--glass-blur:20px}
    body{background:radial-gradient(circle at 8% 4%,rgba(79,125,242,.10),transparent 30%),radial-gradient(circle at 92% 18%,rgba(34,170,168,.08),transparent 28%),linear-gradient(180deg,#f8faff 0%,#f3f6fb 100%) !important}
    .header{background:rgba(255,255,255,.62) !important;backdrop-filter:blur(20px);-webkit-backdrop-filter:blur(20px);border-bottom:1px solid rgba(255,255,255,.82);position:sticky;top:0;z-index:10}
    .searchbar,.filters select,.card,.tower-chip,.unit,.pdf-btn{background:var(--glass-bg) !important;backdrop-filter:blur(var(--glass-blur));-webkit-backdrop-filter:blur(var(--glass-blur));border-color:var(--glass-line) !important;box-shadow:var(--glass-shadow) !important}
    .searchbar{border-radius:16px}.filters select{box-shadow:0 8px 25px rgba(34,53,84,.06) !important}.card{border-radius:20px}.status-card{background:rgba(255,255,255,.64) !important;border-color:rgba(255,255,255,.9) !important;box-shadow:0 8px 22px rgba(34,53,84,.06)}.tower-chip.active{background:rgba(247,250,255,.84) !important}.unit{background:rgba(255,255,255,.68) !important}
    #occupancyRecapBtn{background:rgba(255,255,255,.70) !important;backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);border-color:rgba(255,255,255,.92) !important;box-shadow:0 12px 30px rgba(34,53,84,.08) !important;border-radius:16px}
    #occupancyRecapModal{background:rgba(23,34,51,.20) !important;backdrop-filter:blur(4px);-webkit-backdrop-filter:blur(4px)}
    #occupancyRecapModal .occ-sheet{background:rgba(255,255,255,.86) !important;backdrop-filter:blur(24px);-webkit-backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.9);box-shadow:0 -15px 50px rgba(24,38,62,.14)}
    .rs-brand-mark,.rs-recap-brand{display:none !important}
    .rs-pdf-brand{display:none}.rs-pdf-brand .rs-logo-svg{width:54px;height:54px;color:#263548;display:block}.rs-pdf-brand-name{font-size:16px;font-weight:800;letter-spacing:2px;color:#18212f;margin-top:4px}.rs-pdf-brand-sub{font-size:9px;color:#687386;margin-top:2px}
    @media print{.rs-pdf-brand{display:flex !important;align-items:center;gap:12px;margin-bottom:12px;padding-bottom:9px;border-bottom:1px solid #e2e7ee}.rs-pdf-brand-copy{display:flex;flex-direction:column}}

    #hkConditionBtn{display:none;width:calc(100% - 32px);margin:0 16px 12px;height:46px;border:1px solid rgba(255,255,255,.92);background:rgba(255,255,255,.72);color:#356ff2;border-radius:16px;font-weight:800;cursor:pointer;backdrop-filter:blur(18px);box-shadow:0 12px 30px rgba(34,53,84,.08)}
    #hkConditionModal{position:fixed;inset:0;z-index:70;display:none;align-items:flex-end;justify-content:center;background:rgba(23,34,51,.24);backdrop-filter:blur(5px)}
    #hkConditionModal.show{display:flex}
    .hk-sheet{width:min(520px,100%);max-height:88vh;overflow:auto;padding:18px 16px 28px;border-radius:24px 24px 0 0;background:rgba(255,255,255,.88);backdrop-filter:blur(26px);-webkit-backdrop-filter:blur(26px);border:1px solid rgba(255,255,255,.9);box-shadow:0 -15px 50px rgba(24,38,62,.14)}
    .hk-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}.hk-head h2{margin:0;font-size:20px}.hk-close{border:0;background:#eef3f9;width:38px;height:38px;border-radius:50%;font-size:22px;color:#566274;cursor:pointer}
    .hk-role{font-size:11px;color:#687386;margin:-6px 0 15px}.hk-label{font-size:11px;font-weight:800;color:#566274;text-transform:uppercase;letter-spacing:.4px;margin:13px 0 7px}.hk-field,.hk-select,.hk-textarea{width:100%;border:1px solid #dfe5ee;border-radius:12px;background:rgba(255,255,255,.76);padding:11px 12px;outline:0;color:#18212f}.hk-textarea{min-height:88px;resize:vertical}.hk-status-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.hk-status{border:1px solid #e0e6ef;border-radius:12px;padding:12px;background:rgba(255,255,255,.7);font-weight:800;text-align:left;cursor:pointer}.hk-status small{display:block;color:#687386;font-weight:500;margin-top:3px}.hk-status.selected{box-shadow:inset 0 0 0 2px #356ff2;border-color:#356ff2}.hk-primary{width:100%;height:46px;border:0;border-radius:12px;background:#356ff2;color:#fff;font-weight:800;margin-top:14px;cursor:pointer}.hk-muted{font-size:11px;color:#687386;text-align:center;padding:14px}.hk-report{border:1px solid rgba(255,255,255,.95);border-radius:15px;padding:13px;background:rgba(255,255,255,.66);box-shadow:0 8px 22px rgba(34,53,84,.06);margin-bottom:9px}.hk-report-top{display:flex;justify-content:space-between;align-items:center}.hk-pill{font-size:10px;font-weight:800;padding:5px 8px;border-radius:8px}.hk-pill.os{background:#f0eafd;color:#744cc0}.hk-pill.oo{background:#ffe8e9;color:#c33d42}.hk-unit-name{font-weight:800;font-size:14px}.hk-report-meta{font-size:10px;color:#687386;margin-top:5px}.hk-report-reason{font-size:11px;font-weight:800;margin-top:8px}.hk-report-note{font-size:11px;color:#4f5c6e;margin-top:3px;line-height:1.45}.hk-report-btn{margin-top:10px;width:100%;height:38px;border:1px solid #dbe3ef;background:#f8faff;color:#356ff2;border-radius:10px;font-weight:800;cursor:pointer}.hk-back{border:0;background:transparent;color:#356ff2;font-weight:800;padding:0;margin-bottom:10px;cursor:pointer}
  `;
  document.head.appendChild(style);

  function addPdfBrand(){
    const area=document.querySelector('.print-area');
    if(!area || area.querySelector('.rs-pdf-brand'))return;
    const brand=document.createElement('div');brand.className='rs-pdf-brand';brand.innerHTML=`${logo}<div class="rs-pdf-brand-copy"><div class="rs-pdf-brand-name">ROOM STATUS</div><div class="rs-pdf-brand-sub">Unit Hunian Rusun Paspampres</div></div>`;area.insertBefore(brand,area.firstChild);
  }
  function cleanLegacyBrand(){document.querySelectorAll('.rs-brand-mark,.rs-recap-brand').forEach(el=>el.remove())}

  async function getRole(){
    try{if(typeof supabaseClient==='undefined')return '';const {data:{user}}=await supabaseClient.auth.getUser();if(!user)return '';const {data:p}=await supabaseClient.from('user_profiles').select('role').eq('id',user.id).maybeSingle();return String(p?.role||'').toLowerCase().trim()}catch(e){console.warn('HK role lookup failed',e);return ''}
  }
  const esc=v=>String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'&#92;','"':'&quot;'}[c]));
  const fmtDate=v=>{try{return new Intl.DateTimeFormat('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(new Date(v))}catch(e){return v||''}};

  async function loadUnits(){
    const {data,error}=await supabaseClient.from('room_units').select('id,unit_number,tower,floor,status').order('tower').order('floor').order('unit_number');
    if(error)throw error;return data||[];
  }
  function closeHK(){const m=document.getElementById('hkConditionModal');if(m)m.classList.remove('show')}
  function openHK(){const m=document.getElementById('hkConditionModal');if(m)m.classList.add('show')}

  async function submitReport(){
    const unit=document.getElementById('hkUnitSelect')?.value;const status=document.getElementById('hkStatus')?.value;const reason=document.getElementById('hkReason')?.value.trim();const note=document.getElementById('hkNote')?.value.trim();
    if(!unit||!status||!reason||!note){alert('Unit, status, Reason dan Note wajib diisi.');return}
    const {error}=await supabaseClient.rpc('report_room_condition',{p_unit_id:Number(unit),p_status:status,p_reason:reason,p_note:note});
    if(error){alert(error.message||'Gagal membuat laporan.');return}
    closeHK();location.reload();
  }

  async function renderSupervisor(){
    const body=document.getElementById('hkBody');if(!body)return;
    body.innerHTML='<div class="hk-muted">Memuat laporan OS/OO...</div>';
    const {data,error}=await supabaseClient.from('room_condition_reports').select('id,unit_id,status,current_status,reason,note,reported_at,resolution_status,room_units(unit_number,tower,floor)').in('resolution_status',['open','in_progress']).order('reported_at',{ascending:false});
    if(error){body.innerHTML=`<div class="hk-muted">Gagal memuat: ${esc(error.message)}</div>`;return}
    if(!data?.length){body.innerHTML='<div class="hk-muted">Tidak ada laporan OS/OO yang menunggu tindak lanjut.</div>';return}
    body.innerHTML=data.map(r=>`<div class="hk-report"><div class="hk-report-top"><div class="hk-unit-name">T${String(r.room_units?.tower??'').padStart(2,'0')}-${esc(r.room_units?.unit_number||r.unit_id)}</div><span class="hk-pill ${String(r.current_status).toLowerCase()}">${esc(r.current_status)} · ${esc(r.resolution_status)}</span></div><div class="hk-report-meta">Dilaporkan ${fmtDate(r.reported_at)}</div><div class="hk-report-reason">${esc(r.reason)}</div><div class="hk-report-note">${esc(r.note)}</div><button class="hk-report-btn" data-report-id="${r.id}">Validasi / Tindak Lanjut</button></div>`).join('');
    body.querySelectorAll('.hk-report-btn').forEach(b=>b.addEventListener('click',()=>showValidation(Number(b.dataset.reportId))));
  }

  async function showValidation(reportId){
    const body=document.getElementById('hkBody');if(!body)return;body.innerHTML='<div class="hk-muted">Memuat laporan...</div>';
    const {data:r,error}=await supabaseClient.from('room_condition_reports').select('id,unit_id,status,current_status,reason,note,reported_at,resolution_status,room_units(unit_number,tower,floor)').eq('id',reportId).maybeSingle();
    if(error||!r){body.innerHTML='<div class="hk-muted">Laporan tidak ditemukan.</div>';return}
    body.innerHTML=`<button class="hk-back" id="hkBack">← Kembali ke daftar</button><div class="hk-report"><div class="hk-report-top"><div class="hk-unit-name">T${String(r.room_units?.tower??'').padStart(2,'0')}-${esc(r.room_units?.unit_number||r.unit_id)}</div><span class="hk-pill ${String(r.current_status).toLowerCase()}">${esc(r.current_status)}</span></div><div class="hk-report-meta">${fmtDate(r.reported_at)}</div><div class="hk-report-reason">${esc(r.reason)}</div><div class="hk-report-note">${esc(r.note)}</div></div><div class="hk-label">Hasil Validasi</div><div class="hk-status-grid"><button class="hk-status selected" data-v="OS">OS<small>Ringan</small></button><button class="hk-status" data-v="OO">OO<small>Berat</small></button><button class="hk-status" data-v="VC">VC<small>Vacant Clean</small></button><button class="hk-status" data-v="VD">VD<small>Vacant Dirty</small></button></div><input type="hidden" id="hkValidationStatus" value="${esc(r.current_status)}"><div class="hk-label">Tindakan</div><input id="hkAction" class="hk-field" placeholder="Contoh: Pemeriksaan teknisi"><div class="hk-label">Follow Up Note</div><textarea id="hkFollowNote" class="hk-textarea" placeholder="Jelaskan hasil tindak lanjut..."></textarea><button class="hk-primary" id="hkSaveValidation">Simpan Validasi</button>`;
    const current=r.current_status;body.querySelectorAll('.hk-status').forEach(b=>{if(b.dataset.v===current)b.classList.add('selected');else b.classList.remove('selected');b.onclick=()=>{body.querySelectorAll('.hk-status').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');document.getElementById('hkValidationStatus').value=b.dataset.v}});
    document.getElementById('hkBack').onclick=renderSupervisor;document.getElementById('hkSaveValidation').onclick=async()=>{const ns=document.getElementById('hkValidationStatus').value;const action=document.getElementById('hkAction').value.trim();const note=document.getElementById('hkFollowNote').value.trim();if(!action||!note){alert('Tindakan dan Follow Up Note wajib diisi.');return}const {error}=await supabaseClient.rpc('validate_room_condition',{p_report_id:reportId,p_new_status:ns,p_action:action,p_note:note});if(error){alert(error.message||'Gagal menyimpan validasi.');return}await renderSupervisor();};
  }

  async function injectHK(){
    if(document.getElementById('hkConditionBtn'))return;
    const role=await getRole();if(role!=='housekeeping'&&role!=='supervisor_hk')return;
    const btn=document.createElement('button');btn.id='hkConditionBtn';btn.type='button';btn.textContent=role==='housekeeping'?'🧹 Laporan Kondisi Kamar':'🛠️ Tindak Lanjut HK';
    const anchor=document.querySelector('.pdf-btn')||document.querySelector('#occupancyRecapBtn')||document.querySelector('.card');if(anchor)anchor.parentNode.insertBefore(btn,anchor);else document.body.appendChild(btn);btn.style.display='block';
    const modal=document.createElement('div');modal.id='hkConditionModal';modal.innerHTML=`<div class="hk-sheet"><div class="hk-head"><h2>${role==='housekeeping'?'Laporan Kondisi Kamar':'Tindak Lanjut Supervisor HK'}</h2><button class="hk-close" type="button">×</button></div><div class="hk-role">${role==='housekeeping'?'User HK · Penemu / Reporter':'Supervisor HK · Validator / Follow Up'}</div><div id="hkBody"></div></div>`;document.body.appendChild(modal);
    btn.onclick=async()=>{openHK();if(role==='housekeeping')await renderHKReporter();else await renderSupervisor()};modal.querySelector('.hk-close').onclick=closeHK;modal.addEventListener('click',e=>{if(e.target===modal)closeHK()});
  }
  async function renderHKReporter(){
    const body=document.getElementById('hkBody');body.innerHTML='<div class="hk-muted">Memuat unit...</div>';try{const units=await loadUnits();body.innerHTML=`<div class="hk-label">Unit</div><select id="hkUnitSelect" class="hk-select"><option value="">Pilih unit...</option>${units.map(u=>`<option value="${u.id}">T${String(u.tower).padStart(2,'0')}-${esc(u.unit_number)} · ${esc(u.status)}</option>`).join('')}</select><div class="hk-label">Status Kondisi</div><div class="hk-status-grid"><button class="hk-status selected" data-v="OS">OS<small>Gangguan ringan</small></button><button class="hk-status" data-v="OO">OO<small>Kerusakan berat</small></button></div><input type="hidden" id="hkStatus" value="OS"><div class="hk-label">Reason</div><input id="hkReason" class="hk-field" placeholder="Contoh: HVAC, Plumbing, Electrical"><div class="hk-label">Note</div><textarea id="hkNote" class="hk-textarea" placeholder="Jelaskan kondisi aktual yang ditemukan..."></textarea><button id="hkSubmit" class="hk-primary">Kirim Laporan</button>`;body.querySelectorAll('.hk-status').forEach(b=>b.onclick=()=>{body.querySelectorAll('.hk-status').forEach(x=>x.classList.remove('selected'));b.classList.add('selected');document.getElementById('hkStatus').value=b.dataset.v});document.getElementById('hkSubmit').onclick=submitReport}catch(e){body.innerHTML=`<div class="hk-muted">Gagal memuat unit: ${esc(e.message)}</div>`}}

  function apply(){cleanLegacyBrand();addPdfBrand();if(!window.__hkWorkflowInit){window.__hkWorkflowInit=true;setTimeout(injectHK,500)}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(apply,300),{once:true});else setTimeout(apply,300);
  new MutationObserver(()=>{cleanLegacyBrand();addPdfBrand()}).observe(document.body,{childList:true,subtree:true});
})();

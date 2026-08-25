/* Guest Audit Trail UI — Room Status Paspampres */
(function(){
  const esc=(v)=>String(v??'').replace(/[&<>'\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','\"':'&quot;'}[c]));
  const fmt=(v)=>{const d=new Date(v);return isNaN(d)?'—':d.toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});};
  async function canShowNames(client){
    try{
      const {data:{user}}=await client.auth.getUser();
      if(!user?.id)return false;
      const {data:profile}=await client.from('user_profiles').select('role').eq('id',user.id).maybeSingle();
      const role=String(profile?.role||'').toLowerCase().trim();
      return role==='editor'||role==='receptionist';
    }catch(e){return false;}
  }
  window.loadGuestAudit=async function(unitId,target){
    if(!unitId||!target)return;
    const client=(typeof supabaseClient!=='undefined')?supabaseClient:window.supabaseClient;
    if(!client){target.innerHTML='<div class="guest-audit-empty">Koneksi database belum siap.</div>';return;}
    target.innerHTML='<div class="guest-audit-loading">Memuat riwayat...</div>';
    const [result,showNames]=await Promise.all([
      client.from('room_guest_audit').select('changed_at,guest_order,old_guest_name,new_guest_name,action,changed_by').eq('unit_id',unitId).order('changed_at',{ascending:false}).order('guest_order',{ascending:true}).limit(100),
      canShowNames(client)
    ]);
    const {data,error}=result;
    if(error){target.innerHTML='<div class="guest-audit-empty">Riwayat belum dapat dimuat.</div>';console.error('Guest audit load failed:',error);return;}
    if(!data?.length){target.innerHTML='<div class="guest-audit-empty">Belum ada riwayat perubahan.</div>';return;}
    target.innerHTML=data.map(r=>{
      const action=r.action||'UPDATE';
      const oldName=r.old_guest_name?(showNames?esc(r.old_guest_name):'••••••'):'—';
      const newName=r.new_guest_name?(showNames?esc(r.new_guest_name):'••••••'):'—';
      const detail=action==='ADD'?`+ ${newName}`:action==='DELETE'?`${oldName} → —`:`${oldName} → ${newName}`;
      return `<div class="guest-audit-item"><div class="guest-audit-top"><span class="guest-audit-action ${action.toLowerCase()}">${esc(action)}</span><span class="guest-audit-time">${fmt(r.changed_at)}</span></div><div class="guest-audit-detail">${detail}</div><div class="guest-audit-by">Oleh <strong>${esc(r.changed_by||'—')}</strong> · Tamu ${Number(r.guest_order)||'—'}</div></div>`;
    }).join('');
  };

  // Fast mobile close handlers: respond on pointer/touch before async audit work can interfere.
  function fastCloseGuestOverlay(e){
    const btn=e.target?.closest?.('#guestClose,#guestCancel');
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    const overlay=document.getElementById('guestOverlay');
    if(overlay)overlay.style.display='none';
  }
  function fastCloseHistory(e){
    const btn=e.target?.closest?.('#historyClose,.history-close');
    if(!btn)return;
    e.preventDefault();
    e.stopPropagation();
    const overlay=document.getElementById('historyOverlay');
    if(overlay)overlay.classList.remove('show');
  }
  function bindFastClose(){
    document.addEventListener('pointerdown',fastCloseGuestOverlay,true);
    document.addEventListener('pointerdown',fastCloseHistory,true);
    document.addEventListener('keydown',e=>{
      if(e.key!=='Escape')return;
      const guest=document.getElementById('guestOverlay');
      if(guest?.style.display==='flex')guest.style.display='none';
      const history=document.getElementById('historyOverlay');
      if(history?.classList.contains('show'))history.classList.remove('show');
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bindFastClose,{once:true});else bindFastClose();

  const loadRecap=()=>{
    if(document.querySelector('script[src*="occupancy-recap.js"]'))return;
    if(document.querySelector('script[data-occupancy-recap]'))return;
    const s=document.createElement('script');s.src='occupancy-recap.js?v=20260825-6';s.dataset.occupancyRecap='1';s.defer=true;document.head.appendChild(s);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',loadRecap,{once:true});else loadRecap();
})();

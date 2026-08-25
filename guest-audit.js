/* Guest Audit Trail UI — Room Status Paspampres */
(function(){
  const esc=(v)=>String(v??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const fmt=(v)=>{const d=new Date(v);return isNaN(d)?'—':d.toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});};
  window.loadGuestAudit=async function(unitId,target){
    if(!unitId||!target)return;
    const client=(typeof supabaseClient!=='undefined')?supabaseClient:window.supabaseClient;
    if(!client){target.innerHTML='<div class="guest-audit-empty">Koneksi database belum siap.</div>';return;}
    target.innerHTML='<div class="guest-audit-loading">Memuat riwayat...</div>';
    const {data,error}=await client.from('room_guest_audit').select('changed_at,guest_order,old_guest_name,new_guest_name,action,changed_by').eq('unit_id',unitId).order('changed_at',{ascending:false}).order('guest_order',{ascending:true}).limit(100);
    if(error){target.innerHTML='<div class="guest-audit-empty">Riwayat belum dapat dimuat.</div>';console.error('Guest audit load failed:',error);return;}
    if(!data?.length){target.innerHTML='<div class="guest-audit-empty">Belum ada riwayat perubahan.</div>';return;}
    target.innerHTML=data.map(r=>{
      const action=r.action||'UPDATE';
      const oldName=r.old_guest_name?esc(r.old_guest_name):'—';
      const newName=r.new_guest_name?esc(r.new_guest_name):'—';
      const detail=action==='ADD'?`+ ${newName}`:action==='DELETE'?`${oldName} → —`:`${oldName} → ${newName}`;
      return `<div class="guest-audit-item"><div class="guest-audit-top"><span class="guest-audit-action ${action.toLowerCase()}">${esc(action)}</span><span class="guest-audit-time">${fmt(r.changed_at)}</span></div><div class="guest-audit-detail">${detail}</div><div class="guest-audit-by">Oleh <strong>${esc(r.changed_by||'—')}</strong> · Tamu ${Number(r.guest_order)||'—'}</div></div>`;
    }).join('');
  };
})();

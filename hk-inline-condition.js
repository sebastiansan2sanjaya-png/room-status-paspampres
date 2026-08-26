(function(){
  if(window.__hkInlineCondition) return;
  window.__hkInlineCondition=true;
  const isHK=()=>{const t=(document.body.innerText||'').toLowerCase(); return t.includes('housekeeping') && !t.includes('supervisor hk');};
  function selected(){return document.querySelector('#statusOptions .status-option.selected')?.dataset.status||'';}
  function injectFields(){
    if(!isHK()) return;
    const grid=document.getElementById('statusOptions'); if(!grid) return;
    const s=selected(); let box=document.getElementById('hkInlineCondition');
    if(!['OS','OO'].includes(s)){ if(box) box.remove(); return; }
    if(box) return;
    box=document.createElement('div'); box.id='hkInlineCondition'; box.style.cssText='margin-top:14px;padding:13px;border:1px solid #e1e6ef;border-radius:14px;background:rgba(255,255,255,.7)';
    box.innerHTML='<div class="section-label">Rincian Kondisi</div><input id="hkInlineReason" class="meta-input" style="width:100%;padding:11px 12px;border:1px solid #dfe5ee;border-radius:11px;background:#fff" placeholder="Reason — contoh: Electrical, Plumbing, HVAC"><textarea id="hkInlineNote" style="width:100%;min-height:82px;margin-top:8px;padding:11px 12px;border:1px solid #dfe5ee;border-radius:11px;background:#fff;resize:vertical;outline:0" placeholder="Note — jelaskan kondisi aktual yang ditemukan..."></textarea><div style="font-size:10px;color:#687386;margin-top:7px">Wajib diisi untuk status OS / OO.</div>';
    grid.parentNode.insertBefore(box,grid.nextSibling);
  }
  async function currentUnit(){
    const title=document.getElementById('sheetTitle')?.textContent||''; const m=title.match(/UNIT\s+(.+)/i); if(!m)return null;
    const unitNo=m[1].trim(); const {data,error}=await window.supabaseClient.from('room_units').select('id,unit_number,tower,floor,status').eq('unit_number',unitNo).maybeSingle(); if(error)throw error; return data;
  }
  async function saveHKReport(e){
    if(!isHK()) return;
    const s=selected(); if(!['OS','OO'].includes(s)) return;
    e.preventDefault(); e.stopImmediatePropagation();
    const saveBtn=document.getElementById('save'); if(saveBtn){saveBtn.disabled=true;saveBtn.textContent='Menyimpan...';}
    try{
      const reason=document.getElementById('hkInlineReason')?.value.trim()||''; const note=document.getElementById('hkInlineNote')?.value.trim()||'';
      if(!reason||!note){alert('Reason dan Note wajib diisi untuk OS / OO.');return;}
      const u=await currentUnit(); if(!u)throw new Error('Unit tidak ditemukan.');
      const {error}=await window.supabaseClient.rpc('report_room_condition',{p_unit_id:Number(u.id),p_status:s,p_reason:reason,p_note:note});
      if(error)throw error;
      alert(`Status ${s} tersimpan beserta Reason & Note.`); location.reload();
    }catch(err){console.error(err);alert(err.message||'Gagal menyimpan laporan kondisi.');}
    finally{if(saveBtn){saveBtn.disabled=false;saveBtn.textContent='Simpan Perubahan';}}
  }
  function removeLegacy(){if(isHK()){document.getElementById('hkConditionBtn')?.remove();document.querySelectorAll('#hkConditionModal').forEach(x=>x.remove());}}
  function init(){
    removeLegacy();
    const mo=new MutationObserver(()=>{removeLegacy();injectFields();});
    mo.observe(document.body,{childList:true,subtree:true});
    document.addEventListener('click',()=>setTimeout(injectFields,0),true);
    document.addEventListener('click',e=>{if(e.target?.id==='save'||e.target?.closest?.('#save'))saveHKReport(e)},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();

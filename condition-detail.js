(function(){
  if(window.__conditionDetailLoaded) return;
  window.__conditionDetailLoaded=true;
  function getClient(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null;}catch(e){return null;}}
  function isReception(){const t=(document.body.innerText||'').toLowerCase();return t.includes('resepsionis');}
  function unitContext(){const title=document.getElementById('sheetTitle')?.textContent||'';const sub=document.getElementById('sheetSub')?.textContent||'';const um=title.match(/UNIT\s+(.+)/i);const tm=sub.match(/Tower\s*0*(\d+)/i);if(!um||!tm)return null;return {unit:um[1].trim(),tower:Number(tm[1])};}
  async function loadReport(){
    if(!isReception())return;
    const ctx=unitContext();
    const client=getClient();
    if(!ctx||!client)return;
    document.getElementById('conditionDetailBox')?.remove();
    const {data,error}=await client.from('room_units').select('id').eq('unit_number',ctx.unit).eq('tower',ctx.tower).maybeSingle();
    if(error||!data)return;
    const {data:reports,error:re}=await client.from('room_condition_reports').select('id,status,current_status,reason,note,reported_at,resolution_status,validated_at,resolved_status').eq('unit_id',data.id).in('resolution_status',['open','in_progress']).order('reported_at',{ascending:false}).limit(1);
    if(re||!reports?.length)return;
    const report=reports[0];
    const anchor=document.getElementById('historyBtn')||document.querySelector('.history-btn');
    if(!anchor)return;
    const box=document.createElement('div');
    box.id='conditionDetailBox';
    box.className='condition-detail-box';
    const d=new Date(report.reported_at);
    const time=isNaN(d)?report.reported_at:d.toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
    box.innerHTML=`<div class="condition-detail-head"><span>RINCIAN KONDISI</span><b class="condition-badge ${report.status==='OO'?'oo':'os'}">${esc(report.status)}</b></div><div class="condition-field"><span>REASON</span><strong>${esc(report.reason)}</strong></div><div class="condition-field"><span>NOTE</span><p>${esc(report.note)}</p></div><div class="condition-detail-meta">Dilaporkan ${esc(time)}</div>`;
    anchor.parentNode.insertBefore(box,anchor);
  }
  function esc(v){return String(v??'').replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[c]));}
  function init(){
    document.addEventListener('click',e=>{
      if(e.target.closest?.('.unit'))setTimeout(loadReport,220);
      if(e.target.closest?.('.status-option'))setTimeout(loadReport,220);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();

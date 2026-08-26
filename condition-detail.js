(function(){
  if(window.__conditionDetailLoadedV4) return;
  window.__conditionDetailLoadedV4=true;

  function getClient(){try{return typeof supabaseClient!=='undefined'?supabaseClient:null;}catch(e){return null;}}
  function isReception(){return /resepsionis/i.test(document.body.innerText||'');}

  function unitContext(){
    const title=document.getElementById('sheetTitle')?.textContent||'';
    const sub=document.getElementById('sheetSub')?.textContent||'';
    const um=title.match(/UNIT\s+(.+)/i);
    const tm=sub.match(/Tower\s*0*(\d+)/i);
    if(!um||!tm)return null;
    return {unit:um[1].trim(),tower:Number(tm[1])};
  }

  function esc(v){
    return String(v??'').replace(/[&<>\\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\"':'&quot;'}[c]));
  }

  function reportTime(v){
    const d=new Date(v);
    return isNaN(d)?String(v??''):d.toLocaleString('id-ID',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false});
  }

  function removeDuplicateDetails(){
    document.querySelectorAll('.condition-detail-box').forEach(el=>{
      if(el.id!=='conditionDetailBox')el.remove();
    });
  }

  function closeSheetHard(){
    const sheet=document.querySelector('.sheet');
    const overlay=document.querySelector('.overlay');
    if(sheet){sheet.classList.remove('show');sheet.style.display='none';}
    if(overlay){overlay.classList.remove('show');overlay.style.display='none';}
    document.getElementById('conditionDetailBox')?.remove();
  }

  function bindCloseFix(){
    const handler=e=>{
      const btn=e.target?.closest?.('.close,.sheet .close,[data-close-sheet],#sheetClose');
      if(!btn)return;
      e.preventDefault();
      e.stopImmediatePropagation();
      closeSheetHard();
    };
    ['pointerdown','touchstart','click'].forEach(type=>document.addEventListener(type,handler,true));
  }

  function detectCurrentStatus(){
    const el=document.getElementById('currentStatus');
    const data=(el?.dataset?.status||el?.getAttribute?.('data-status')||'').toUpperCase();
    if(['OS','OO'].includes(data))return data;

    const current=document.querySelector('.current');
    const text=(current?.innerText||'').toLowerCase();
    if(/out\s+of\s+order/.test(text)||/out\s+of\s+order/.test(document.body.innerText||''))return 'OO';
    if(/out\s+of\s+service/.test(text)||/out\s+of\s+service/.test(document.body.innerText||''))return 'OS';
    return '';
  }

  async function loadReport(){
    if(!isReception())return;

    const ctx=unitContext();
    const client=getClient();
    if(!ctx||!client)return;

    removeDuplicateDetails();
    document.getElementById('conditionDetailBox')?.remove();

    const currentStatus=detectCurrentStatus();
    if(!['OS','OO'].includes(currentStatus))return;

    const {data:unit,error:ue}=await supabaseClient
      .from('room_units')
      .select('id')
      .eq('unit_number',ctx.unit)
      .eq('tower',ctx.tower)
      .maybeSingle();
    if(ue||!unit)return;

    const {data:reports,error:re}=await supabaseClient
      .from('room_condition_reports')
      .select('id,status,current_status,reason,note,reported_at,resolution_status,validated_at,resolved_status')
      .eq('unit_id',unit.id)
      .in('resolution_status',['open','in_progress'])
      .order('reported_at',{ascending:false})
      .limit(1);

    if(re||!reports?.length)return;

    const r=reports[0];
    const status=(r.status||r.current_status||currentStatus).toUpperCase();
    if(!['OS','OO'].includes(status))return;

    const anchor=document.getElementById('historyBtn')||document.querySelector('.history-btn');
    const actions=document.querySelector('.actions');
    const parent=anchor?.parentNode||actions?.parentNode;
    if(!parent)return;

    const box=document.createElement('div');
    box.id='conditionDetailBox';
    box.className='condition-detail-box';
    box.style.cssText='margin-top:14px;padding:14px;border:1px solid #e1e6ef;border-radius:14px;background:#f8fafc;width:100%;box-sizing:border-box;grid-column:1 / -1;min-width:0;';

    const color=status==='OO'?'#ef5558':'#8c62d7';
    box.innerHTML=`
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">
        <b style="font-size:11px;color:#566274;letter-spacing:.5px">RINCIAN KONDISI</b>
        <b style="color:${color};font-size:13px">${esc(status)}</b>
      </div>
      <div style="font-size:10px;color:#687386;text-transform:uppercase;font-weight:800">Reason</div>
      <div style="font-size:12px;font-weight:800;margin:4px 0 10px">${esc(r.reason||'-')}</div>
      <div style="font-size:10px;color:#687386;text-transform:uppercase;font-weight:800">Note</div>
      <div style="font-size:12px;line-height:1.5;margin-top:4px;white-space:pre-wrap">${esc(r.note||'-')}</div>
      <div style="font-size:10px;color:#8b95a3;margin-top:10px">Dilaporkan: ${esc(reportTime(r.reported_at))}</div>`;

    removeDuplicateDetails();
    if(anchor) anchor.parentNode.insertBefore(box,anchor);
    else parent.insertBefore(box,actions||null);
    removeDuplicateDetails();
  }

  function scheduleLoad(){
    window.clearTimeout(window.__conditionDetailTimer);
    window.__conditionDetailTimer=window.setTimeout(()=>loadReport().catch(()=>{}),350);
  }

  function init(){
    bindCloseFix();
    document.addEventListener('click',e=>{
      if(e.target.closest?.('.unit'))scheduleLoad();
    },true);

    const observer=new MutationObserver(()=>removeDuplicateDetails());
    observer.observe(document.body,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();

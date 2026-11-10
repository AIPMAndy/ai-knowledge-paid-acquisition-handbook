(function(){"use strict";const $=id=>document.getElementById(id);const chapters=window.HANDBOOK_CHAPTERS||[],days=window.HANDBOOK_DAYS||[],prompts=window.HANDBOOK_PROMPTS||[],paths=window.HANDBOOK_PATHS||[];function filter(){const q=($("search")?.value||"").toLowerCase(),p=$("phase")?.value||"";document.querySelectorAll(".chapter").forEach(el=>{el.hidden=!(el.textContent.toLowerCase().includes(q)&&(!p||p==="全部"||el.dataset.phase===p))})}if($("search")){$("search").addEventListener("input",filter);$("phase").addEventListener("change",filter)}document.querySelectorAll("[data-path]").forEach(el=>el.addEventListener("click",()=>{document.querySelectorAll("[data-path]").forEach(x=>x.classList.remove("active"));el.classList.add("active");const p=paths[Number(el.dataset.path)];if(p)$("path-result").textContent=p[1]+"。"+p[2]}));const calcIds=["exposures","inquiries","qualified","paid","revenue","refund","adcost","cost","hours","hourprice"];const val=id=>Number($(id)?.value||0);function compute(){if(calcIds.some(x=>!$(x)?.value.trim())){$("calc-status").textContent="请填写所有字段；未知数据不能用空白当0。";return}if(calcIds.some(x=>val(x)<0)||val("qualified")>val("inquiries")||val("paid")>val("qualified")||val("refund")>val("paid")*val("revenue")){$("calc-status").textContent="输入不符合逻辑：人数/退款不应超出上游或实收。";return}const pct=(a,b)=>b?((a/b)*100).toFixed(1)+"%":"不可计算";$("rate-qual").textContent=pct(val("qualified"),val("inquiries"));$("rate-paid").textContent=pct(val("paid"),val("qualified"));$("cac").textContent=val("paid")?(val("adcost")/val("paid")).toFixed(2)+" 元":"不可计算";$("contribution").textContent=(val("paid")*val("revenue")-val("refund")-val("adcost")-val("cost")-val("hours")*val("hourprice")).toFixed(2)+" 元";$("calc-status").textContent="以下为根据输入数据的数学计算，未扣固定成本与税费；如为模拟值，不是实际业绩。"}$("calc")?.addEventListener("click",compute);$("demo")?.addEventListener("click",()=>{[1000,20,8,2,500,0,100,80,4,100].forEach((v,i)=>$(calcIds[i]).value=v);compute();$("calc-status").textContent="【完全虚构的教学算例】不得作为作者或任何客户的真实业绩。"});$("clear")?.addEventListener("click",()=>{calcIds.forEach(id=>$(id).value="");["rate-qual","rate-paid","cac","contribution"].forEach(id=>$(id).textContent="—");$("calc-status").textContent="请填写真实数值或点击模拟演示。"});const key="kp-handbook-progress-v1";let checked=[];try{checked=JSON.parse(localStorage.getItem(key)||"[]");if(!Array.isArray(checked))checked=[]}catch(e){checked=[]}function showDays(){if(!$("days"))return;$("days").innerHTML=days.map((d,i)=>'<label class="day"><input type="checkbox" data-day="'+i+'" '+(checked.includes(i)?"checked":"")+'><strong>DAY '+(i+1)+'</strong><div>'+d+'</div></label>').join("");$("days").querySelectorAll("[data-day]").forEach(x=>x.addEventListener("change",()=>{const i=Number(x.dataset.day);checked=x.checked?[...new Set([...checked,i])]:checked.filter(n=>n!==i);try{localStorage.setItem(key,JSON.stringify(checked))}catch(e){}showDays()}));$("progress-text").textContent="已完成 "+checked.length+" / 30 天";$("progress-bar").style.width=(checked.length/30*100)+"%"}showDays();$("reset")?.addEventListener("click",()=>{checked=[];try{localStorage.removeItem(key)}catch(e){}showDays()});$("export")?.addEventListener("click",()=>{const csv="day,task,done\n"+days.map((d,i)=>(i+1)+',"'+d+'",'+(checked.includes(i)?"yes":"no")).join("\n");const blob=new Blob(["\ufeff"+csv],{type:"text/csv;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="knowledge-acquisition-30-day-progress.csv";a.click();URL.revokeObjectURL(url)});if($("prompt-select")){$("prompt-select").innerHTML=prompts.map((p,i)=>'<option value="'+i+'">'+p.title+'</option>').join("");const update=()=>{$("prompt-text").value=prompts[Number($("prompt-select").value)]?.text||""};$("prompt-select").addEventListener("change",update);update();$("copy")?.addEventListener("click",async()=>{const v=$("prompt-text").value;try{await navigator.clipboard.writeText(v);$("copy").textContent="已复制"}catch(e){$("prompt-text").focus();$("prompt-text").select();$("copy").textContent="已选中，请复制"}})}
/* The home page has this contact ribbon in static HTML. Add it to every chapter. */
const contactMarkup="<div class=\"contact-ribbon\" aria-label=\"作者联系方式与企业官网\"><div class=\"wrap contact-ribbon-inner\"><span class=\"contact-ribbon-label\">作者联系方式 · 商业推广</span><a class=\"contact-company\" href=\"https://www.a6no1.cn/\" target=\"_blank\" rel=\"noopener noreferrer\"><strong>星觉科技企业官网</strong><span>www.a6no1.cn</span></a><div class=\"contact-wechat\"><span>微信：<strong>AIPMAndy</strong></span><button type=\"button\" class=\"wechat-copy\" data-copy-wechat=\"AIPMAndy\" aria-label=\"复制微信号 AIPMAndy\">复制微信号</button><span class=\"wechat-feedback\" role=\"status\" aria-live=\"polite\"></span></div></div></div>";
if(!document.querySelector(".contact-ribbon")){
  const nav=document.querySelector("header.top");
  if(nav){nav.insertAdjacentHTML("afterend",contactMarkup);}
}
function copyWechatId(value){
  const fallback=()=>{
    const input=document.createElement("textarea");
    input.value=value;input.setAttribute("readonly","");
    input.style.position="fixed";input.style.opacity="0";
    document.body.appendChild(input);input.focus();input.select();
    let ok=false;try{ok=document.execCommand("copy")}catch(e){}
    input.remove();return ok;
  };
  if(navigator.clipboard&&navigator.clipboard.writeText){
    return navigator.clipboard.writeText(value).then(()=>true).catch(fallback);
  }
  return Promise.resolve(fallback());
}
document.querySelectorAll("[data-copy-wechat]").forEach(button=>{
  button.addEventListener("click",async()=>{
    const value=button.getAttribute("data-copy-wechat")||"AIPMAndy";
    let copied=false;try{copied=await copyWechatId(value)}catch(e){}
    const status=button.parentElement.querySelector(".wechat-feedback");
    if(status){status.textContent=copied?"已复制，可在微信搜索添加":"请手动复制微信号："+value;}
    button.textContent=copied?"已复制："+value:"复制失败，请手动复制";
  });
});
})();
const defaultReports=[
 {id:"CF-1042",title:"Pothole near main gate",category:"Pothole",location:"Main Gate, Wagholi",days:4,priority:82,status:"In Progress",icon:"🕳️"},
 {id:"CF-1041",title:"Streetlight not working",category:"Streetlight",location:"Gate 2",days:3,priority:86,status:"Open",icon:"💡"},
 {id:"CF-1040",title:"Garbage overflow",category:"Garbage",location:"Market Road",days:2,priority:71,status:"Assigned",icon:"🗑️"},
 {id:"CF-1039",title:"Drainage blockage after rain",category:"Drainage",location:"Lane 4",days:1,priority:64,status:"In Progress",icon:"🌧️"},
 {id:"CF-1038",title:"Water supply interruption",category:"Water Supply",location:"Sector B",days:5,priority:90,status:"Open",icon:"💧"}
];
let reports=JSON.parse(localStorage.getItem("civicfixReports")||"null")||defaultReports;

const iconMap={Pothole:"🕳️",Streetlight:"💡",Garbage:"🗑️",Drainage:"🌧️","Water Supply":"💧"};
const keywords={
 Pothole:["pothole","road","hole","crater","broken road","road damage"],
 Streetlight:["streetlight","street light","lamp","light not","dark","bulb"],
 Garbage:["garbage","waste","trash","dump","rubbish","litter"],
 Drainage:["drain","drainage","waterlogging","flood","sewer"],
 "Water Supply":["water","pipeline","tap","supply","leak","no water"]
};
function classify(text){
 text=text.toLowerCase();
 let best="Pothole",score=0;
 for(const [cat,words] of Object.entries(keywords)){
   const s=words.reduce((n,w)=>n+(text.includes(w)?1:0),0);
   if(s>score){score=s;best=cat}
 }
 return best;
}
function analyze(desc,loc,days){
 const category=classify(desc);
 const related=reports.filter(r=>r.category===category && (r.location.toLowerCase().includes(loc.toLowerCase().split(" ")[0])||loc.toLowerCase().includes(r.location.toLowerCase().split(" ")[0])));
 const duplicates=related.length;
 let base={Pothole:58,Streetlight:62,Garbage:48,Drainage:55,"Water Supply":52}[category];
 const score=Math.min(100,base+Math.min(days,7)*4+duplicates*7);
 let level=score>=75?"HIGH":score>=55?"MEDIUM":"LOW";
 let reason=[];
 if(duplicates) reason.push(`${duplicates} similar report${duplicates>1?"s":""} found`);
 if(days>=3) reason.push(`${days} days unresolved`);
 if(["Streetlight","Pothole","Drainage"].includes(category)) reason.push("public-safety/infrastructure impact");
 if(!reason.length) reason.push("standard civic issue with no duplicate cluster");
 return {category,duplicates,score,level,reason:reason.join(" + ")};
}
function save(){localStorage.setItem("civicfixReports",JSON.stringify(reports))}
function showPage(id){
 document.querySelectorAll(".page").forEach(p=>p.classList.toggle("active",p.id===id));
 document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.page===id));
 if(id==="track")renderTrack(); if(id==="admin")renderAdmin(); window.scrollTo({top:0,behavior:"smooth"});
}
document.querySelectorAll(".nav-btn").forEach(b=>b.onclick=()=>showPage(b.dataset.page));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>showPage(b.dataset.go));

function renderTrack(){
 const el=document.getElementById("trackList");
 el.innerHTML=reports.slice(0,8).map(r=>`<div class="report-item"><div class="ri-icon">${r.icon}</div><div><h3>${r.title}</h3><p>${r.id} · ${r.location} · ${r.days} day${r.days==1?"":"s"} ago</p></div><span class="pill ${r.status==="Open"?"red":r.status==="Resolved"?"green":"amber"}">${r.status}</span></div>`).join("");
}
function renderAdmin(){
 document.getElementById("dashTotal").textContent=24+Math.max(0,reports.length-defaultReports.length);
 document.getElementById("dashHigh").textContent=reports.filter(r=>r.priority>=75).length+2;
 const el=document.getElementById("queueList");
 el.innerHTML=reports.slice().sort((a,b)=>b.priority-a.priority).map(r=>`<div class="queue-row"><div class="qicon">${r.icon}</div><div><b>${r.title}</b><small>${r.location} · ${r.id}</small></div><span class="pill ${r.priority>=75?"red":r.priority>=55?"amber":"green"}">${r.priority}</span></div>`).join("");
 document.getElementById("statTotal").textContent=24+Math.max(0,reports.length-defaultReports.length);
}
document.getElementById("reportForm").addEventListener("submit",e=>{
 e.preventDefault();
 const desc=document.getElementById("description").value.trim(),loc=document.getElementById("location").value.trim(),days=+document.getElementById("days").value||0;
 const a=analyze(desc,loc,days);
 const id="CF-"+(1043+reports.length-defaultReports.length);
 const report={id,title:desc.length>48?desc.slice(0,48)+"…":desc,category:a.category,location:loc,days,priority:a.score,status:"Open",icon:iconMap[a.category]};
 reports.unshift(report);save();
 document.getElementById("analysisPanel").innerHTML=`<div class="analysis-result"><div class="result-head"><div class="big-icon">${report.icon}</div><div><h3>Analysis complete</h3><small>${id} · ${a.category}</small></div><span class="pill ${a.level==="HIGH"?"red":a.level==="MEDIUM"?"amber":"green"}">${a.level}</span></div><div class="analysis-score"><div class="score"><span>Explainable priority score</span><strong>${a.score}/100</strong></div><div class="meter"><i style="width:${a.score}%"></i></div></div><div class="reason-box"><b>Why this score?</b><br>${a.reason}.</div><div class="check-row"><span>Issue classification</span><b>✓ ${a.category}</b></div><div class="check-row"><span>Duplicate detection</span><b>${a.duplicates?`✓ ${a.duplicates} related`: "✓ No close duplicate"}</b></div><div class="check-row"><span>Admin queue</span><b>✓ Added</b></div><button class="primary full" style="margin-top:18px" onclick="showPage('track')">Track this report →</button></div>`;
 e.target.reset(); document.getElementById("days").value=1;
});
document.getElementById("resetDemo").onclick=()=>{reports=defaultReports.slice();save();renderAdmin();renderTrack()};
renderAdmin();

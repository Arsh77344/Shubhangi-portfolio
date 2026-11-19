(function(){
"use strict";
var root=document.documentElement;
root.classList.remove("no-js");
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
if(RM) root.classList.add("reduced");
var hasG=typeof window.gsap!=="undefined";
var FINE=window.matchMedia&&matchMedia("(hover:hover) and (pointer:fine)").matches;
var $=function(s,c){return (c||document).querySelector(s)};
var $$=function(s,c){return Array.prototype.slice.call((c||document).querySelectorAll(s))};
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
var ease=function(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2};
var easeIO=function(t){return t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2};
var vh=function(){return window.innerHeight};

/* shared images: each photo is embedded once */
var SRC={};$$("img[data-key]").forEach(function(i){SRC[i.dataset.key]=i.getAttribute("src")});
$$("[data-img]").forEach(function(img){if(SRC[img.dataset.img])img.src=SRC[img.dataset.img]});

/* smooth scroll */
var lenis=null;
if(!RM&&typeof window.Lenis!=="undefined"){
  try{
    lenis=new Lenis({lerp:.085,smoothWheel:true});
    if(hasG){gsap.ticker.add(function(t){lenis.raf(t*1000)});gsap.ticker.lagSmoothing(0)}
    else{(function raf(t){lenis.raf(t);requestAnimationFrame(raf)})(0)}
  }catch(e){lenis=null}
}
window.__lenis=lenis;
function scrollToEl(sel){
  var el=$(sel);if(!el)return;
  if(lenis)lenis.scrollTo(el,{duration:2,easing:function(t){return 1-Math.pow(1-t,4)}});
  else el.scrollIntoView({behavior:RM?"auto":"smooth"});
}
document.addEventListener("click",function(e){
  var a=e.target.closest("[data-scroll]");if(!a)return;
  e.preventDefault();scrollToEl(a.getAttribute("data-scroll"));
});
var scrollFns=[];
function onScroll(fn){scrollFns.push(fn)}
function runScroll(){for(var i=0;i<scrollFns.length;i++)scrollFns[i]()}
if(lenis)lenis.on("scroll",runScroll);
window.addEventListener("scroll",runScroll,{passive:true});
window.addEventListener("resize",runScroll);
function prog(el){var r=el.getBoundingClientRect(),span=r.height-vh();return span>0?clamp(-r.top/span,0,1):0}

/* loader */
var loader=$("#loader"),loaderDone=false;
if(hasG&&!RM){gsap.set("[data-name]",{yPercent:110});gsap.set("[data-hero]",{opacity:0,y:20})}
if(lenis)lenis.stop();
document.body.classList.add("is-locked");
function heroIn(){
  document.body.classList.remove("is-locked");
  if(lenis)lenis.start();
  if(hasG&&!RM){
    gsap.fromTo("#heroImg",{scale:1.12},{scale:1,duration:2.6,ease:"expo.out"});
    gsap.to("[data-name]",{yPercent:0,duration:1.5,stagger:.14,ease:"expo.out",delay:.15});
    gsap.to("[data-hero]",{opacity:1,y:0,duration:1.1,stagger:.12,delay:.55,ease:"power3.out"});
  }
  route();
}
function finishLoader(){
  if(loaderDone)return;loaderDone=true;
  try{sessionStorage.setItem("sg-seen","1")}catch(e){}
  if(hasG&&!RM){
    gsap.timeline({onComplete:function(){loader.remove()}})
      .to(".loader__core,.loader__hint",{opacity:0,y:-10,duration:.35})
      .to(".loader__door--l",{xPercent:-101,duration:1.1,ease:"expo.inOut"},"-=.05")
      .to(".loader__door--r",{xPercent:101,duration:1.1,ease:"expo.inOut"},"<")
      .add(heroIn,"-=.75");
  }else{loader.remove();heroIn()}
}
(function(){
  var seen=false;try{seen=sessionStorage.getItem("sg-seen")==="1"}catch(e){}
  var dur=RM?100:(seen?700:1900),t0=performance.now(),bar=$("#loaderBar"),cnt=$("#loaderCount");
  loader.addEventListener("click",finishLoader);
  function step(now){
    if(loaderDone)return;
    var p=clamp((now-t0)/dur,0,1),e=1-Math.pow(1-p,3);
    bar.style.transform="scaleX("+e+")";cnt.textContent=Math.round(e*100);
    if(p<1)requestAnimationFrame(step);else setTimeout(finishLoader,150);
  }
  requestAnimationFrame(step);
})();

/* header */
(function(){
  var hdr=$("#hdr"),hero=$("#hero"),bar=$("#progress"),lastY=0;
  function upd(){
    var y=window.scrollY,hb=hero.offsetHeight-80;
    hdr.classList.toggle("is-solid",y>hb);
    hdr.classList.toggle("is-hidden",y>hb+400&&y>lastY+2&&!document.body.classList.contains("is-locked"));
    if(y<lastY-2)hdr.classList.remove("is-hidden");
    lastY=y;
    var max=document.documentElement.scrollHeight-vh();
    bar.style.transform="scaleX("+(max>0?y/max:0)+")";
  }
  onScroll(upd);upd();
})();

/* hero: tilt from the sky down to the summit */
(function(){
  var hero=$("#hero"),img=$("#heroImg"),title=$("#heroTitle"),end=$("#heroEnd"),cue=$("#heroCue"),shade=$(".hero__shade");
  var RATIO=4047/1920;
  function fit(){
    var vw=hero.clientWidth,w=Math.max(vw,vh()*1.9/RATIO);
    img.style.width=w+"px";img.style.left=((vw-w)*.5)+"px";
  }
  function upd(){
    var p=prog(hero),ih=img.offsetHeight,v=vh();
    var dist=clamp(ih*.625-v*(v<700?.42:.47),0,Math.max(0,ih-v));
    var tilt=easeIO(clamp(p/.85,0,1));
    img.style.translate="0 "+(-dist*tilt).toFixed(1)+"px";
    var a=clamp(1-p*3.2,0,1);
    title.style.opacity=a;title.style.translate="0 "+(-p*260).toFixed(1)+"px";
    cue.style.opacity=clamp(1-p*12,0,1);
    var b=clamp((p-.66)/.2,0,1);
    end.style.opacity=b;end.style.translate="0 "+((1-b)*40).toFixed(1)+"px";
    end.style.pointerEvents=b>.5?"auto":"none";
    shade.style.opacity=(.12+.88*b).toFixed(2);
  }
  fit();window.addEventListener("resize",fit);onScroll(upd);img.addEventListener("load",upd);upd();
})();

/* reveals */
(function(){
  var els=$$("[data-rise],[data-reveal]");
  if(!("IntersectionObserver" in window)||RM){els.forEach(function(e){e.classList.add("is-in")});return}
  var io=new IntersectionObserver(function(es){es.forEach(function(en){if(en.isIntersecting){en.target.classList.add("is-in");io.unobserve(en.target)}})},{rootMargin:"0px 0px -8% 0px"});
  els.forEach(function(e){io.observe(e)});
  // stagger siblings
  $$(".pillars,.built,.skillcards,.tools,.also,.ways,.stats4,.proofs,.side-projects,.wall").forEach(function(g){
    $$("[data-rise]",g).forEach(function(c,i){c.style.transitionDelay=(i%6)*.07+"s"});
  });
})();

/* curved text drifting with scroll */
(function(){
  var tp=$("#curveText"),wrap=tp&&tp.closest(".curve");if(!tp)return;
  function upd(){var r=wrap.getBoundingClientRect();if(r.bottom<0||r.top>vh())return;var p=(vh()-r.top)/(vh()+r.height);tp.setAttribute("startOffset",(-40*p).toFixed(2)+"%")}
  onScroll(upd);upd();
})();

/* departure board */
var FLAPCH="ABCDEFGHIJKLMNOPRSTUVWXYZ0123456789";
function buildFlaps(el){var n=Number(el.dataset.flaps);for(var i=0;i<n;i++){var s=document.createElement("span");s.className="flap";s.textContent=" ";el.appendChild(s)}}
function setFlaps(el,text){
  var cells=$$(".flap",el),n=cells.length;text=(text+"            ").slice(0,n).toUpperCase();
  cells.forEach(function(c,i){
    var target=text[i];if(c._t===target)return;c._t=target;clearInterval(c._iv);
    if(RM){c.textContent=target;return}
    var steps=4+Math.floor(Math.random()*4)+i,k=0;
    c._iv=setInterval(function(){
      k++;c.classList.remove("is-flip");void c.offsetWidth;c.classList.add("is-flip");
      if(k>=steps){c.textContent=target;clearInterval(c._iv)}
      else c.textContent=FLAPCH[Math.floor(Math.random()*FLAPCH.length)];
    },55);
  });
}

/* journey globe, light edition */
(function(){
  var canvas=$("#globe");if(!canvas||typeof window.d3==="undefined"||typeof window.topojson==="undefined")return;
  var ctx=canvas.getContext("2d");
  var land=topojson.feature(LAND,LAND.objects.land),grat=d3.geoGraticule10();
  var C={lucknow:[80.95,26.85],delhi:[77.21,28.61],pune:[73.86,18.52],leeds:[-1.55,53.80]};
  var names={lucknow:"Lucknow",delhi:"Delhi NCR",pune:"Pune",leeds:"Leeds"};
  var legs=[["lucknow","delhi"],["delhi","pune"],["pune","leeds"],["leeds","lucknow"]];
  var side=[{n:"Mumbai",c:[72.88,19.08]},{n:"Hanoi",c:[105.85,21.03]},{n:"Bangkok",c:[100.5,13.75]},{n:"Chengdu",c:[104.07,30.57]}];
  var asia=[93,22];
  var BOARD=[
    {y:"----",to:"LUCKNOW",f:"HOME",t:"Lucknow",d:"Where it starts, and where it brought me back."},
    {y:"2014",to:"DELHI NCR",f:"B.TECH",t:"Delhi NCR, 2014",d:"Four years at SRM Institute studying Information Technology, graduating with Distinction."},
    {y:"2018",to:"PUNE",f:"INFOSYS",t:"Pune, 2018",d:"Infosys: from systems engineer to associate consultant for global banks and Lloyd’s Register."},
    {y:"2022",to:"LEEDS",f:"MSC",t:"Leeds, 2022",d:"An MSc at the University of Leeds, then three roles at Luminate Education Group."},
    {y:"2026",to:"LUCKNOW",f:"S. ASIA",t:"Lucknow, 2026",d:"Back home, now leading recruitment for South Asia, remotely."},
    {y:"2025",to:"ON TOUR",f:"EVENTS",t:"On the road",d:"Delegations, fairs and launch events in Mumbai, Hanoi, Bangkok and Chengdu."}
  ];
  var fy=$("#flYear"),fc=$("#flCity"),ff=$("#flFor"),status=$("#boardStatus"),jT=$("#jTitle"),jD=$("#jText");
  [fy,fc,ff].forEach(buildFlaps);
  var HOLD0=1,TRAVEL=1.7,HOLD=1,FINAL_T=1.3,FINAL_H=1.3;
  var TOTAL=HOLD0+legs.length*(TRAVEL+HOLD)+FINAL_T+FINAL_H;
  var proj=d3.geoOrthographic().clipAngle(90).precision(.4),path=d3.geoPath(proj,ctx);
  var W=0,H=0,dpr=1,cx=0,cy=0,R=0;
  var stops=$$("#jstops li"),section=$("#journey");
  var target=0,shown=-1,lastCard=-1,lastStatus="",heading=Math.PI/2;
  var plane=new Path2D("M12 0 L3.5 -2.2 L-3 -10 L-6.4 -10 L-2.6 -2.2 L-8.2 -1.7 L-10.6 -5.4 L-12.6 -5.4 L-11 0 L-12.6 5.4 L-10.6 5.4 L-8.2 1.7 L-2.6 2.2 L-6.4 10 L-3 10 L3.5 2.2 Z");
  var serif="Newsreader, Georgia, serif";
  function size(){
    var r=canvas.getBoundingClientRect();W=r.width;H=r.height;dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);
    var narrow=W<980;cx=narrow?W*.5:W*.66;cy=narrow?H*.76:H*.5;R=narrow?Math.min(W*.4,H*.2):Math.min(H*.42,W*.28);shown=-1;
  }
  function state(p){
    var u=p*TOTAL,s={card:0,legIdx:-1,e:0,center:C.lucknow,pos:C.lucknow,zoom:1,sideA:0,done:0,stop:0,fly:false};
    if(u<HOLD0)return s;u-=HOLD0;
    for(var i=0;i<legs.length;i++){
      var a=C[legs[i][0]],b=C[legs[i][1]];
      if(u<TRAVEL){
        var t=u/TRAVEL,e=ease(t),ip=d3.geoInterpolate(a,b),pos=ip(e),d=d3.geoDistance(a,b);
        s.legIdx=i;s.e=e;s.pos=pos;s.center=pos;s.zoom=1-Math.min(.36,d/3.2)*Math.sin(Math.PI*e);
        s.card=i+1;s.stop=e<.5?i:i+1;s.done=i;s.fly=e<.92;s.next=ip(Math.min(e+.01,1));s.prev=ip(Math.max(e-.01,0));return s;
      }
      u-=TRAVEL;
      if(u<HOLD){s.card=i+1;s.stop=i+1;s.done=i+1;s.pos=b;s.center=b;return s}
      u-=HOLD;
    }
    s.done=legs.length;s.pos=C.lucknow;
    if(u<FINAL_T){var t2=ease(u/FINAL_T);s.center=d3.geoInterpolate(C.lucknow,asia)(t2);s.zoom=1-.12*t2;s.sideA=t2;s.card=5;s.stop=t2<.5?4:5;return s}
    s.center=asia;s.zoom=.88;s.sideA=1;s.card=5;s.stop=5;return s;
  }
  function visible(c,center){return d3.geoDistance(c,center)<Math.PI/2-.08}
  function draw(p){
    var s=state(p);
    proj.translate([cx,cy]).scale(R*s.zoom).rotate([-s.center[0],-s.center[1]*.75,0]);
    var vc=proj.invert([cx,cy])||s.center,rr=R*s.zoom;
    ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
    // soft shadow under the globe
    var sh=ctx.createRadialGradient(cx,cy+rr*1.05,rr*.1,cx,cy+rr*1.05,rr*.9);
    sh.addColorStop(0,"rgba(92,18,48,.14)");sh.addColorStop(1,"rgba(92,18,48,0)");
    ctx.fillStyle=sh;ctx.beginPath();ctx.ellipse(cx,cy+rr*1.05,rr*.9,rr*.14,0,0,7);ctx.fill();
    var sg=ctx.createRadialGradient(cx-rr*.4,cy-rr*.45,rr*.05,cx,cy,rr);
    sg.addColorStop(0,"#FFFDF8");sg.addColorStop(1,"#E9DCC7");
    ctx.beginPath();path({type:"Sphere"});ctx.fillStyle=sg;ctx.fill();
    ctx.beginPath();path(grat);ctx.strokeStyle="rgba(92,18,48,.07)";ctx.lineWidth=.7;ctx.stroke();
    ctx.beginPath();path(land);ctx.fillStyle="rgba(92,18,48,.16)";ctx.fill();ctx.strokeStyle="rgba(92,18,48,.38)";ctx.lineWidth=.6;ctx.stroke();
    ctx.beginPath();path({type:"Sphere"});ctx.strokeStyle="rgba(92,18,48,.35)";ctx.lineWidth=1;ctx.stroke();
    ctx.setLineDash([3,6]);ctx.strokeStyle="rgba(92,18,48,.35)";ctx.lineWidth=1.2;
    for(var i=Math.max(0,s.legIdx>=0?s.legIdx+1:s.done);i<legs.length;i++){ctx.beginPath();path({type:"LineString",coordinates:[C[legs[i][0]],C[legs[i][1]]]});ctx.stroke()}
    if(s.sideA>0){ctx.strokeStyle="rgba(156,114,54,"+(.85*s.sideA)+")";side.forEach(function(sd){ctx.beginPath();path({type:"LineString",coordinates:[C.lucknow,sd.c]});ctx.stroke()})}
    ctx.setLineDash([]);ctx.strokeStyle="#5C1230";ctx.lineWidth=2.4;
    for(var j=0;j<s.done;j++){ctx.beginPath();path({type:"LineString",coordinates:[C[legs[j][0]],C[legs[j][1]]]});ctx.stroke()}
    if(s.legIdx>=0&&s.e>0){ctx.beginPath();path({type:"LineString",coordinates:[C[legs[s.legIdx][0]],s.pos]});ctx.stroke()}
    ctx.font="500 17px "+serif;ctx.textBaseline="middle";
    var activeKey=s.legIdx<0?(s.card===0||s.card>=4?"lucknow":legs[s.card-1][1]):null;
    Object.keys(C).forEach(function(k){
      var c=C[k];if(!visible(c,vc))return;var pt=proj(c);if(!pt)return;var on=k===activeKey;
      if(on){ctx.beginPath();ctx.arc(pt[0],pt[1],14,0,7);ctx.fillStyle="rgba(92,18,48,.12)";ctx.fill()}
      ctx.beginPath();ctx.arc(pt[0],pt[1],on?5.5:4,0,7);ctx.fillStyle=on?"#5C1230":"#9C7236";ctx.fill();
      ctx.fillStyle=on?"#3A0A1C":"rgba(42,28,31,.7)";
      ctx.textAlign=k==="pune"?"right":"left";
      ctx.fillText(names[k],k==="pune"?pt[0]-12:pt[0]+12,pt[1]-(k==="lucknow"?10:0));
    });
    if(s.sideA>0){
      ctx.globalAlpha=s.sideA;
      side.forEach(function(sd){
        if(!visible(sd.c,vc))return;var pt=proj(sd.c);if(!pt)return;
        ctx.beginPath();ctx.arc(pt[0],pt[1],3.5,0,7);ctx.fillStyle="#9C7236";ctx.fill();
        ctx.font="400 14px "+serif;ctx.textAlign=sd.n==="Mumbai"?"right":"left";ctx.fillStyle="rgba(42,28,31,.85)";
        ctx.fillText(sd.n,pt[0]+(sd.n==="Mumbai"?-9:9),pt[1]+(sd.n==="Chengdu"?-8:0));
      });
      ctx.globalAlpha=1;
    }
    var pp=proj(s.pos);
    if(pp&&s.sideA<1){
      if(s.legIdx>=0){var n1=proj(s.next),n0=proj(s.prev);if(n1&&n0){var dx=n1[0]-n0[0],dy=n1[1]-n0[1];if(dx*dx+dy*dy>.01)heading=Math.atan2(dy,dx)}}
      ctx.save();ctx.translate(pp[0],pp[1]-(s.legIdx>=0?0:22));ctx.rotate(heading);ctx.scale(1.25,1.25);
      ctx.globalAlpha=1-s.sideA;ctx.shadowColor="rgba(58,10,28,.35)";ctx.shadowBlur=10;ctx.shadowOffsetY=6;
      ctx.fillStyle="#5C1230";ctx.fill(plane);ctx.restore();ctx.globalAlpha=1;
    }
    var st=s.fly?"IN FLIGHT":(s.card===0?"BOARDING":(s.card===5?"ON TOUR":"LANDED"));
    if(st!==lastStatus){status.textContent=st;lastStatus=st}
    if(s.card!==lastCard){
      var b=BOARD[s.card];setFlaps(fy,b.y);setFlaps(fc,b.to);setFlaps(ff,b.f);
      jT.textContent=b.t;jD.textContent=b.d;lastCard=s.card;
    }
    stops.forEach(function(li,i){li.classList.toggle("is-on",i===s.stop);li.classList.toggle("is-past",i<s.stop)});
  }
  var ticking=false;
  function loop(){var d=target-shown;if(shown<0||Math.abs(d)<.0004)shown=target;else shown+=d*(RM?1:.16);draw(shown);if(shown!==target)requestAnimationFrame(loop);else ticking=false}
  function kick(){target=prog(section);if(!ticking){ticking=true;requestAnimationFrame(loop)}}
  size();window.addEventListener("resize",function(){size();kick()});onScroll(kick);
  if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){shown=-1;kick()});
  kick();
})();

/* numbers: rolling odometer cards */
(function(){
  var field=$("#stats");if(!field)return;
  var H=1.15,cols=[];
  $$(".scard__n",field).forEach(function(n,ci){
    var s=Number(n.dataset.count).toLocaleString("en-GB"),pre=n.dataset.prefix||"",suf=n.dataset.suffix||"";
    var sr=document.createElement("span");sr.className="sr";sr.textContent=pre+s+suf;n.appendChild(sr);
    function lit(t){var x=document.createElement("span");x.setAttribute("aria-hidden","true");x.textContent=t;n.appendChild(x)}
    if(pre)lit(pre);
    var digits=s.replace(/\D/g,"").length,pos=0;
    s.split("").forEach(function(ch){
      if(!/\d/.test(ch)){lit(ch);return}
      var left=digits-1-pos++;
      var w=document.createElement("span");w.className="odo";w.setAttribute("aria-hidden","true");
      var col=document.createElement("span");col.className="odo__col";
      var h="";for(var r=0;r<2;r++)for(var d=0;d<10;d++)h+="<i>"+d+"</i>";
      col.innerHTML=h;col.style.setProperty("--t",(1.5+left*.2)+"s");
      w.appendChild(col);n.appendChild(w);
      cols.push({col:col,idx:10+Number(ch),card:ci,left:left});
    });
    if(suf)lit(suf);
  });
  function go(){
    cols.forEach(function(c){
      var delay=RM?0:c.card*.2+.4+(c.left*.06);
      c.col.style.setProperty("--td",delay+"s");
      if(RM)c.col.style.transition="none";
      c.col.style.transform="translateY(-"+(c.idx*H)+"em)";
    });
  }
  if(RM){field.classList.add("is-in");go();return}
  var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){field.classList.add("is-in");requestAnimationFrame(function(){requestAnimationFrame(go)});io.disconnect()}},{threshold:.22});
  io.observe(field);
})();

/* career at a glance: interactive graph */
(function(){
  var el=$("#glanceEl");if(!el)return;
  var A=2014,Z=2027,NOW=2026.83,pct=function(y){return (y-A)/(Z-A)*100};
  var yrs=$("#gYears");
  for(var y=A;y<=2026;y++){
    var t=document.createElement("i");t.style.left=pct(y)+"%";yrs.appendChild(t);
    if(y%2===0){var s=document.createElement("span");s.style.left=pct(y)+"%";s.textContent=y;yrs.appendChild(s)}
  }
  var D=[
   {id:"srm",lane:"study",s:2014.5,e:2018.4,l:"SRM Institute",sm:"B.Tech IT, Delhi NCR",t:"B.Tech in Information Technology",org:"SRM Institute of Science and Technology",when:"Jul 2014 to May 2018",place:"Delhi NCR",blurb:"Four years of engineering fundamentals: how systems are built, tested and kept running.",ach:[["9.1","final CGPA"],["Distinction","graduated with"]],proj:["Core IT and software engineering curriculum","Campus into Infosys, 2018"]},
   {id:"msc",lane:"study",s:2022.7,e:2023.7,l:"Leeds",sm:"MSc, 2:1",t:"MSc International Marketing Management",org:"University of Leeds",when:"Sep 2022 to Sep 2023",place:"Leeds",blurb:"Marketing strategy, consumer behaviour and research, with a year of working across cultures.",ach:[["2:1","MSc result"],["20%","more engagement from emotional appeals"]],proj:["Dissertation: NGO type, message appeal and scepticism","A 2 x 2 experiment, local vs global and emotional vs rational","Student Course Representative"],slug:"msc-leeds"},
   {id:"se",lane:"work",s:2018.5,e:2020.0,l:"Systems Engineer",sm:"Infosys, 2018 to 2019",n:"1",t:"Systems Engineer",org:"Infosys",when:"2018 to 2019",place:"Pune",blurb:"First role in tech delivery, on data conversion and validation for a global logistics client.",ach:[["Led","internal dataset review team"],["Daily","hands-on data validation"]],proj:["Data conversion and validation, global logistics client","Support on a rail optimisation application"],slug:"infosys-systems-engineer"},
   {id:"sse",up:1,lane:"work",s:2020.0,e:2022.0,l:"Senior Systems Engineer",sm:"Infosys, 2020 to 2021",n:"2",t:"Senior Systems Engineer",org:"Infosys",when:"2020 to 2021",place:"Pune",blurb:"Bigger scope: a loan-data migration for a global bank, plus platform enhancements and Agile delivery.",ach:[["Agile","ceremonies and sprint planning"],["Extra","vendor resources negotiated"]],proj:["Loan-data migration for a global bank","Platform enhancements","Peer-programming initiative for the team"],slug:"infosys-senior-systems-engineer"},
   {id:"ac",lane:"work",s:2022.0,e:2022.65,l:"Associate Consultant",sm:"Infosys, 2022",n:"3",t:"Associate Consultant",org:"Infosys",when:"2022",place:"Pune",blurb:"Moved into consulting: client-facing reporting and change management on a large carve-out.",ach:[["40%","better reporting accuracy"],["50%","less manual reporting time"],["Insta","Infosys Insta Award"]],proj:["Lloyd's Register to LRQA carve-out","Migration dashboard for around 3,000 employees","Clients including Goldman Sachs, UBS and Bank of America"],slug:"infosys-associate-consultant"},
   {id:"cx",lane:"work",s:2024.25,e:2025.0,l:"Customer Experience & Sales",sm:"Luminate, Apr to Dec 2024",n:"1",wine:1,t:"Customer Experience & Sales Specialist",org:"Luminate Education Group",when:"Apr to Dec 2024",place:"Leeds",blurb:"The front line of the student journey: enquiries, open days and conversion.",ach:[["770+","calls at 95% satisfaction"],["25%","higher event attendance"],["1,000+","students at conversion events"]],proj:["Open Days and Taster Days","CRM workflow and reporting clean-up (30% faster turnaround)"],slug:"luminate-customer-experience"},
   {id:"po",up:1,lane:"work",s:2025.0,e:2026.0,l:"Partnerships Officer",sm:"Luminate, 2025",n:"2",wine:1,t:"International Marketing & Partnerships Officer",org:"Luminate Education Group",when:"Jan to Dec 2025",place:"Leeds",blurb:"Opening markets: building agent and institutional partnerships across India, Vietnam and China.",ach:[["50+","partners built"],["10+","agents converted"],["50%","procurement backlog cut"],["25%","data accuracy gain"]],proj:["Market entry in India, Vietnam and China","ACG x Leeds Conservatoire Foundation Programme","ST Alphe UK 2025 delegation","Overseas delegations and events"],slug:"luminate-partnerships-officer"},
   {id:"rm",end:1,lane:"work",s:2026.0,e:NOW,l:"Recruitment Manager",sm:"Luminate, Jan 2026 to now",n:"3",wine:1,t:"Recruitment Manager, South Asia",org:"Luminate Education Group",when:"Jan 2026 to now",place:"Remote, Lucknow",blurb:"Owning the South Asia recruitment pipeline from strategy through to reporting.",ach:[["£1M+","pipeline"],["25%","quarter-on-quarter growth"],["3","markets"]],proj:["South Asia recruitment strategy","Power BI reporting for the region","ACG x Leeds Conservatoire partnership programme"],slug:"luminate-recruitment-manager"},
   {id:"rha",lane:"community",s:2021.6,e:2022.7,l:"Robin Hood Army",sm:"Co-Lead, Lucknow",olive:1,t:"Co-Lead, Lucknow",org:"Robin Hood Army",when:"Aug 2021 to Sep 2022",place:"Lucknow",blurb:"Led a volunteer chapter through food drives and a city-wide vaccination effort during COVID-19.",ach:[["2,000+","volunteers mobilised"],["44,000+","meals served"],["1,000","vaccinations"],["50+","community partners"]],proj:["Weekly food drives","Immunisation team and vaccine drives","Community partnerships"],slug:"robin-hood-army"},
   {id:"h1",lane:"high",at:2018.4,y:"2018",t:"Graduated with Distinction",org:"SRM Institute",when:"May 2018",place:"Delhi NCR",blurb:"Finished the B.Tech with a 9.1 CGPA and went straight into Infosys.",ach:[["9.1","CGPA"],["Distinction","degree classification"]],proj:["Campus placement into Infosys"]},
   {id:"h2",lane:"high",at:2022.35,y:"2022",t:"Infosys Insta Award",org:"Infosys",when:"2022",place:"Pune",blurb:"Recognised for client engagement and working across cultures on a large carve-out programme.",ach:[["Insta","Infosys award"],["40%","reporting accuracy gain"]],proj:["Lloyd's Register to LRQA carve-out"],slug:"infosys-associate-consultant"},
   {id:"h3",lane:"high",at:2023.7,y:"2023",t:"MSc with a 2:1",org:"University of Leeds",when:"Sep 2023",place:"Leeds",blurb:"Completed the MSc in International Marketing Management.",ach:[["2:1","MSc result"]],proj:["NGO messaging dissertation"],slug:"msc-leeds"},
   {id:"h4",lane:"high",at:2025.5,y:"2025",t:"ST Alphe UK 2025",org:"Luminate Education Group",when:"2025",place:"UK",blurb:"Represented the group as a delegate while building partnerships in new markets.",ach:[["50+","partners by year end"]],proj:["Overseas delegations and events"],slug:"luminate-partnerships-officer"},
   {id:"h5",lane:"high",at:2026.5,y:"2026",t:"£1M+ pipeline",org:"Luminate Education Group",when:"2026",place:"Remote, Lucknow",blurb:"Built a recruitment pipeline worth over £1M for South Asia, growing 25% quarter on quarter.",ach:[["£1M+","pipeline"],["25%","QoQ growth"]],proj:["South Asia recruitment strategy"],slug:"luminate-recruitment-manager"}
  ];
  var byId={},nodes=[];
  D.forEach(function(r,i){
    byId[r.id]=r;
    var tr=$('[data-lane="'+r.lane+'"]',el);
    var d=document.createElement("button");d.type="button";d.dataset.id=r.id;
    if(r.lane==="high"){
      d.className="gdot";d.style.left=pct(r.at)+"%";d.dataset.y=r.y;d.setAttribute("aria-label",r.t+", "+r.y);d.title=r.t;
    }else{
      d.className="gbar"+(r.wine?" gbar--wine":r.olive?" gbar--olive":"");
      d.style.left=pct(r.s)+"%";d.style.width=(pct(r.e)-pct(r.s))+"%";
      d.style.transitionDelay=(i*.12)+"s";
      d.innerHTML='<span class="gbar__l'+(r.up?" is-up":"")+(r.end?" is-end":"")+'"><b>'+r.t.replace("International Marketing & Partnerships Officer","Partnerships").replace("Customer Experience & Sales Specialist","Customer Exp.").replace("Recruitment Manager, South Asia","Recruitment").replace("MSc International Marketing Management","MSc, Leeds").replace("B.Tech in Information Technology","B.Tech, SRM").replace("Co-Lead, Lucknow","Robin Hood Army")+'</b><small>'+r.when.replace("Jul 2014 to May 2018","2014 to 2018").replace("Sep 2022 to Sep 2023","2022 to 2023").replace("Apr to Dec 2024","Apr to Dec 2024").replace("Jan to Dec 2025","2025").replace("Aug 2021 to Sep 2022","2021 to 2022")+'</small></span>';d.setAttribute("aria-label",r.t+", "+r.when);d.title=r.t+", "+r.when;
    }
    tr.appendChild(d);nodes.push({el:d,r:r});
  });
  /* panel */
  var panel=$("#gPanel"),cur=null;
  function show(id){
    if(cur===id)return;cur=id;var r=byId[id];
    nodes.forEach(function(n){n.el.classList.toggle("is-sel",n.r.id===id)});
    var h='<div><p class="gp-when">'+r.when+" · "+r.place+'</p><h3>'+r.t+'</h3><p class="gp-org">'+r.org+'</p><p class="gp-blurb">'+r.blurb+'</p>'+(r.slug?'<button type="button" class="more" data-open="'+r.slug+'">Read the full story <span aria-hidden="true">→</span></button>':"")+'</div>';
    h+='<div><h4>Achievements</h4><ul class="gp-ach">'+r.ach.map(function(a){return "<li><strong>"+a[0]+"</strong><span>"+a[1]+"</span></li>"}).join("")+'</ul></div>';
    h+='<div><h4>Projects and highlights</h4><ul class="gp-proj">'+r.proj.map(function(p){return "<li>"+p+"</li>"}).join("")+'</ul></div>';
    panel.classList.remove("is-empty");panel.innerHTML=h;
    if(!RM&&hasG)gsap.fromTo(panel.children,{y:14,opacity:0},{y:0,opacity:1,duration:.5,stagger:.07,ease:"power3.out",overwrite:true});
  }
  el.addEventListener("pointerover",function(e){var t=e.target.closest("[data-id]");if(t&&e.pointerType==="mouse")show(t.dataset.id)});
  el.addEventListener("click",function(e){var t=e.target.closest("[data-id]");if(t)show(t.dataset.id)});
  /* now line and crosshair */
  var now=document.createElement("div");now.className="glance__now";now.innerHTML="<span>Now</span>";el.appendChild(now);
  var cross=document.createElement("div");cross.className="gcross";cross.innerHTML="<span></span>";el.appendChild(cross);
  var tr0=$(".glance__track",el);
  function placeNow(){now.style.left=(tr0.offsetLeft+tr0.offsetWidth*pct(NOW)/100)+"px"}
  placeNow();window.addEventListener("resize",placeNow);
  function year(cx){var b=tr0.getBoundingClientRect();return A+(cx-b.left)/b.width*(Z-A)}
  el.addEventListener("pointermove",function(e){
    if(e.pointerType!=="mouse")return;
    var b=tr0.getBoundingClientRect(),f=(e.clientX-b.left)/b.width;
    if(f<0||f>1){cross.classList.remove("is-on");return}
    var yv=year(e.clientX);
    cross.style.left=(tr0.offsetLeft+f*tr0.offsetWidth)+"px";cross.firstChild.textContent=Math.floor(yv);cross.classList.add("is-on");
    nodes.forEach(function(n){var r=n.r,hot=r.lane==="high"?Math.abs(r.at-yv)<.45:(yv>=r.s&&yv<=r.e);n.el.classList.toggle("is-hot",hot)});
  });
  el.addEventListener("pointerleave",function(){cross.classList.remove("is-on");nodes.forEach(function(n){n.el.classList.remove("is-hot")})});
  if(RM){el.classList.add("is-in");return}
  var io=new IntersectionObserver(function(es){if(es[0].isIntersecting){el.classList.add("is-in");io.disconnect()}},{threshold:.3});io.observe(el);
})();

/* skills sphere */
(function(){
  var el=$("#sphere");if(!el)return;
  var main=["Market entry strategy","Strategic partnerships","Stakeholder management","Change management","Storytelling","Project delivery"];
  var more=["Consultative selling","Pipeline building","B2B account management","Partner and channel sales","Negotiation","C-suite engagement","Sales forecasting","Brand positioning","Market research","Audience segmentation","Power BI","Salesforce","HubSpot","Microsoft Dynamics","Sales Navigator","Agile delivery","Procurement","Budget management","Cross-cultural teams","Client onboarding","Volunteer mobilisation","Business writing"];
  var tags=[],mi=0,oi=0;
  while(mi<6||oi<more.length){if(mi<6&&tags.length%4===0)tags.push({t:main[mi++],m:1});else if(oi<more.length)tags.push({t:more[oi++],m:0});else tags.push({t:main[mi++],m:1})}
  var N=tags.length,pts=[];
  tags.forEach(function(tg,i){var y=1-(i/(N-1))*2,r=Math.sqrt(1-y*y),th=Math.PI*(3-Math.sqrt(5))*i;var s=document.createElement("span");s.className="sphere__tag"+(tg.m?" is-main":"");s.textContent=tg.t;el.appendChild(s);pts.push({x:Math.cos(th)*r,y:y,z:Math.sin(th)*r,el:s})});
  var ax=0,ay=0,vx=.0012,vy=RM?0:.0035,drag=false,lx=0,ly=0,R=0,inView=false,raf=0;
  function sz(){R=el.clientWidth*(el.clientWidth<520?.32:.4)}
  function frame(){
    if(!drag){vx*=.95;vy=vy*.95+(RM?0:.0035)*.05;ax+=vx;ay+=vy}
    var cX=Math.cos(ax),sX=Math.sin(ax),cY=Math.cos(ay),sY=Math.sin(ay);
    pts.forEach(function(p){var x=p.x*cY+p.z*sY,z=-p.x*sY+p.z*cY,y=p.y*cX-z*sX;z=p.y*sX+z*cX;var sc=.6+.4*(z+1)/2,op=.15+.85*(z+1)/2;p.el.style.transform="translate(-50%,-50%) translate3d("+(x*R).toFixed(1)+"px,"+(y*R).toFixed(1)+"px,0) scale("+sc.toFixed(3)+")";p.el.style.opacity=op.toFixed(2);p.el.style.zIndex=Math.round(z*100)+100});
    if(inView)raf=requestAnimationFrame(frame);
  }
  el.addEventListener("pointerdown",function(e){drag=true;lx=e.clientX;ly=e.clientY;el.setPointerCapture(e.pointerId)});
  el.addEventListener("pointermove",function(e){if(!drag)return;var dx=e.clientX-lx,dy=e.clientY-ly;lx=e.clientX;ly=e.clientY;vy=dx*.006;vx=-dy*.006;ay+=vy;ax+=vx});
  ["pointerup","pointercancel"].forEach(function(t){el.addEventListener(t,function(){drag=false})});
  sz();window.addEventListener("resize",sz);
  var io=new IntersectionObserver(function(es){inView=es[0].isIntersecting;if(inView){cancelAnimationFrame(raf);raf=requestAnimationFrame(frame)}});io.observe(el);frame();
})();

/* photo reel */
(function(){
  var tr=$("#reel");if(!tr)return;
  $$("[data-reel]").forEach(function(b){b.addEventListener("click",function(){tr.scrollBy({left:Number(b.dataset.reel)*tr.clientWidth*.6,behavior:RM?"auto":"smooth"})})});
  var down=false,sx=0,sl=0;
  tr.addEventListener("pointerdown",function(e){if(e.pointerType!=="mouse")return;down=true;sx=e.clientX;sl=tr.scrollLeft;tr.classList.add("is-drag")});
  window.addEventListener("pointermove",function(e){if(down)tr.scrollLeft=sl-(e.clientX-sx)});
  window.addEventListener("pointerup",function(){if(!down)return;down=false;tr.classList.remove("is-drag")});
  tr.setAttribute("data-lenis-prevent-wheel","");
})();

/* beyond: hover and pin */
(function(){
  var cast=$("#cast");if(!cast)return;
  var tilesEl=$("#castTiles"),panel=$("#castPanel");
  var slots=[{l:0,t:4,w:17,h:34},{l:80,t:0,w:19,h:30},{l:4,t:60,w:14,h:32},{l:22,t:76,w:13,h:22}];
  var D={
    rha:{title:"Robin Hood Army",text:"Co-Lead of the Lucknow chapter during COVID-19, with no monetary budget.",stats:[["2,000+","volunteers"],["44,000+","meals served"],["1,000","vaccinations"],["50+","partners"]],tiles:[{img:"rhateam"},{img:"rhacert"},{img:"vaccine"},{img:"feeding"}]},
    kind:{title:"The Kind Hour",text:"Fundraising and partnerships for animal welfare.",stats:[["£1,000","raised in 48 hours"],["1","emergency campaign"]],tiles:[{s:"£1,000",d:"raised in 48 hours"},{s:"48h",d:"emergency appeal"},{s:"Donors",d:"partnerships built"},{s:"Stories",d:"that moved people to act"}]},
    kawai:{title:"KawaiPimp",text:"Freelance digital marketing for a bespoke wedding brand.",stats:[["Meta","Ads and Business Suite"],["GA4","measurement"]],tiles:[{s:"Paid social",d:"Facebook and Instagram"},{s:"A/B",d:"creative testing"},{s:"Reels",d:"short-form video"},{s:"GA4",d:"measurement"}]},
    msc:{title:"The NGO study",text:"My MSc dissertation on NGO type, message appeal and scepticism.",stats:[["2 x 2","experiment"],["20%","more engagement"]],tiles:[{s:"2 x 2",d:"local vs global, emotional vs rational"},{s:"20%",d:"lift from emotional appeals"},{s:"2:1",d:"MSc, University of Leeds"},{s:"NGO",d:"scepticism as the mediator"}]}
  };
  var groups={};
  Object.keys(D).forEach(function(k){
    groups[k]=D[k].tiles.map(function(t,i){
      var d=document.createElement("div"),s=slots[i];d.className="tile"+(t.img?"":" tile--type");
      d.style.cssText="left:"+s.l+"%;top:"+s.t+"%;width:"+s.w+"%;height:"+s.h+"%;transition-delay:"+(i*.07)+"s";
      if(t.img){var im=document.createElement("img");im.alt="";im.src=SRC[t.img]||"";im.loading="lazy";d.appendChild(im)}
      else d.innerHTML="<strong>"+t.s+"</strong><span>"+t.d+"</span>";
      tilesEl.appendChild(d);return d;
    });
  });
  var items=$$(".cast__item",cast),active=null,timer=0;
  function set(k){
    if(k===active)return;active=k;cast.classList.toggle("has-active",!!k);
    items.forEach(function(b){b.classList.toggle("is-active",b.dataset.cast===k)});
    Object.keys(groups).forEach(function(g){groups[g].forEach(function(t){t.classList.toggle("is-on",g===k)})});
    if(k){var d=D[k];panel.innerHTML="<h3>"+d.title+"</h3><p>"+d.text+"</p><ul>"+d.stats.map(function(s){return"<li><strong>"+s[0]+"</strong><span>"+s[1]+"</span></li>"}).join("")+"</ul><p class=\"hint\">Click the name to read the story</p>"}
  }
  items.forEach(function(b){
    b.addEventListener("pointerenter",function(){clearTimeout(timer);timer=setTimeout(function(){set(b.dataset.cast)},90)});
    b.addEventListener("focus",function(){set(b.dataset.cast)});
  });
  cast.addEventListener("pointerleave",function(){clearTimeout(timer);timer=setTimeout(function(){set(null)},250)});
})();

/* bookshelf */
$$("#shelf .book").forEach(function(book){
  $(".book__spine",book).addEventListener("click",function(){
    var open=book.classList.contains("is-open");
    $$("#shelf .book").forEach(function(b){b.classList.remove("is-open");$(".book__spine",b).setAttribute("aria-expanded","false")});
    if(!open){book.classList.add("is-open");$(".book__spine",book).setAttribute("aria-expanded","true")}
  });
});

/* moments: cursor photo trail */
(function(){
  var zone=$("#trail");if(!zone)return;
  var keys=["hero_wide","stall","hellostudy","badge","rhateam","delegation","vaccine","rhacert"],ki=0,lx=-999,ly=-999;
  if(!FINE)$("#trailHint").textContent="Drag your finger across this space";
  function spawn(x,y){
    var r=zone.getBoundingClientRect(),im=document.createElement("img");
    im.className="trail-img";im.alt="";im.src=SRC[keys[ki++%keys.length]];
    im.style.left=(x-r.left-105)+"px";im.style.top=(y-r.top-130)+"px";
    if(keys[(ki-1)%keys.length]==="hero_wide"){im.style.height="260px";im.style.width="auto"}
    zone.appendChild(im);
    if(hasG&&!RM){
      gsap.fromTo(im,{scale:.5,opacity:0,rotate:(Math.random()-.5)*14},{scale:1,opacity:1,rotate:(Math.random()-.5)*8,duration:.5,ease:"expo.out"});
      gsap.to(im,{opacity:0,y:40,scale:.85,duration:.8,delay:.9,ease:"power2.in",onComplete:function(){im.remove()}});
    }else setTimeout(function(){im.remove()},1200);
  }
  zone.addEventListener("pointermove",function(e){
    var dx=e.clientX-lx,dy=e.clientY-ly;
    if(dx*dx+dy*dy>9000){lx=e.clientX;ly=e.clientY;spawn(e.clientX,e.clientY)}
  });
})();

/* custom cursor and magnetic buttons */
(function(){
  if(!FINE||RM)return;
  var c=$("#cursor"),txt=$("#cursorTxt"),x=0,y=0,tx=0,ty=0;
  window.addEventListener("pointermove",function(e){tx=e.clientX;ty=e.clientY;c.classList.add("is-on")});
  document.addEventListener("mouseleave",function(){c.classList.remove("is-on")});
  (function loop(){x+=(tx-x)*.22;y+=(ty-y)*.22;c.style.translate=x.toFixed(1)+"px "+y.toFixed(1)+"px";requestAnimationFrame(loop)})();
  document.addEventListener("pointerover",function(e){
    var t=e.target.closest("[data-cursor]");
    if(t){txt.textContent=t.dataset.cursor;c.classList.add("is-big")}else c.classList.remove("is-big");
    c.style.opacity=e.target.closest("#trail,.page")?"0":"";
  });
  $$(".magnet").forEach(function(m){
    var a=m.firstElementChild;
    m.addEventListener("pointermove",function(e){var r=m.getBoundingClientRect();a.style.transform="translate("+((e.clientX-r.left-r.width/2)*.25)+"px,"+((e.clientY-r.top-r.height/2)*.35)+"px)"});
    m.addEventListener("pointerleave",function(){a.style.transform=""});
  });
})();

/* detail pages */
var pages=$("#pages"),curtain=$("#curtain"),current=null,lastFocus=null;
function findPage(slug){return slug?pages.querySelector('.page[data-page="'+slug.replace(/[^a-z0-9-]/g,"")+'"]'):null}
function swap(fn,cb){
  if(hasG&&!RM){gsap.timeline().set(curtain,{yPercent:100,visibility:"visible"}).to(curtain,{yPercent:0,duration:.55,ease:"expo.in"}).add(fn).to(curtain,{yPercent:-100,duration:.7,ease:"expo.out"}).set(curtain,{visibility:"hidden"}).add(cb||function(){})}
  else{fn();if(cb)cb()}
}
var folder=document.createElement("div");folder.className="folder";folder.setAttribute("aria-hidden","true");
folder.innerHTML='<div class="folder__back"><div class="folder__tab"></div><div class="folder__paper"></div><div class="folder__front">From the archive</div></div>';
document.body.appendChild(folder);
function fileSwap(mode,title,fn,cb){
  var back=$(".folder__back",folder),front=$(".folder__front",folder);
  $(".folder__tab",folder).textContent=title;
  var tl=gsap.timeline({onComplete:function(){gsap.set(folder,{visibility:"hidden"});gsap.set([back,front],{clearProps:"all"});if(cb)cb()}});
  tl.set(folder,{visibility:"visible",opacity:1});
  if(mode==="open"){
    tl.fromTo(back,{yPercent:130,rotate:-4},{yPercent:0,rotate:0,duration:.6,ease:"expo.out"})
      .fromTo(front,{rotateX:0},{rotateX:-96,duration:.5,ease:"power2.in"},"-=.08")
      .add(fn)
      .to(back,{scale:1.5,opacity:0,duration:.5,ease:"power2.in"})
      .to(folder,{opacity:0,duration:.3},"<.2")
      .add(function(){var sh=current&&$(".sheet",current);if(sh)gsap.fromTo(sh,{y:50,opacity:0},{y:0,opacity:1,duration:.7,ease:"expo.out"})},"<");
  }else{
    tl.fromTo(back,{scale:1.4,opacity:0},{scale:1,opacity:1,duration:.45,ease:"expo.out"})
      .fromTo(front,{rotateX:-96},{rotateX:0,duration:.42,ease:"power2.out"},"-=.1")
      .add(fn)
      .to(back,{yPercent:130,rotate:3,duration:.55,ease:"expo.in"})
      .to(folder,{opacity:0,duration:.25},"-=.2");
  }
}
function showPage(slug){
  var pg=findPage(slug);if(!pg||pg===current)return;
  if(!current)lastFocus=document.activeElement;
  var into=pg.dataset.kind==="article",outof=current&&current.dataset.kind==="article"&&!into;
  var sw=(hasG&&!RM&&(into||outof))?function(f,c){fileSwap(into?"open":"close",$("h1",into?pg:current).textContent,f,c)}:swap;
  sw(function(){
    if(current)current.classList.remove("is-on");
    pages.classList.add("is-open");pages.setAttribute("aria-hidden","false");
    pg.classList.add("is-on");pg.scrollTop=0;current=pg;
    document.body.classList.add("is-locked");if(lenis)lenis.stop();
    $("main").setAttribute("aria-hidden","true");
  },function(){var h=$("h1",pg);if(h){h.setAttribute("tabindex","-1");h.focus({preventScroll:true})}});
  document.title=$("h1",pg).textContent+", Shubhangi Gupta";
}
function hidePage(){
  if(!current)return;
  swap(function(){
    current.classList.remove("is-on");current=null;
    pages.classList.remove("is-open");pages.setAttribute("aria-hidden","true");
    document.body.classList.remove("is-locked");if(lenis)lenis.start();
    $("main").removeAttribute("aria-hidden");
  },function(){if(lastFocus&&lastFocus.focus)lastFocus.focus({preventScroll:true})});
  document.title=DEFAULT_TITLE;
}
var DEFAULT_TITLE=document.title;
function route(){if(!loaderDone)return;var h=decodeURIComponent(location.hash.slice(1));if(findPage(h))showPage(h);else hidePage()}
window.addEventListener("hashchange",route);
document.addEventListener("click",function(e){
  var o=e.target.closest("[data-open]");if(o){e.preventDefault();lastFocus=o;location.hash=o.dataset.open;return}
  var c=e.target.closest("[data-close]");if(c){e.preventDefault();history.replaceState(null,"",location.pathname+location.search);hidePage()}
});
document.addEventListener("keydown",function(e){if(e.key==="Escape"&&current){history.replaceState(null,"",location.pathname+location.search);hidePage()}});
})();

/* ============ v3 additions ============ */
(function(){
var $=function(q,c){return (c||document).querySelector(q)},$$=function(q,c){return Array.prototype.slice.call((c||document).querySelectorAll(q))};
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var mobile=window.matchMedia("(max-width:760px)");

/* ink annotation draws itself when the Leeds chapter scrolls in */
$$(".ink").forEach(function(svg){
  $$(".ink__line",svg).forEach(function(p){try{p.style.setProperty("--len",Math.ceil(p.getTotalLength())+1)}catch(e){}});
  if(!("IntersectionObserver" in window)||RM){svg.classList.add("is-drawn");return}
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){svg.classList.add("is-drawn");io.disconnect()}})},{threshold:.6});
  io.observe(svg);
});

/* certificate cards: tap to flip on touch screens (hover and focus handled in CSS) */
(function(){
  var noHover=!window.matchMedia("(hover:hover)").matches;
  $$(".cert").forEach(function(c){
    c.addEventListener("click",function(e){
      if(!noHover||e.target.closest("a"))return;
      c.classList.toggle("is-flipped");
    });
  });
})();

/* passport easter egg */
var pass=$("#passport"),pbtn=$("#passportBtn"),pages=$("#passportPages");
if(pass&&pbtn){
  pbtn.addEventListener("click",function(){
    var open=pbtn.getAttribute("aria-expanded")==="true";
    pbtn.setAttribute("aria-expanded",open?"false":"true");pages.hidden=open;pass.classList.toggle("is-open",!open);
    pass.classList.remove("is-stamping");
    if(!open){void pages.offsetWidth;pass.classList.add("is-stamping");
      setTimeout(function(){var r=pages.getBoundingClientRect();if(r.bottom>innerHeight)window.scrollBy({top:r.bottom-innerHeight+30,behavior:RM?"auto":"smooth"})},80)}
  });
}

/* Read more on phones */
function setupMore(){
  $$("[data-more]").forEach(function(el){
    var btn=el.nextElementSibling&&el.nextElementSibling.classList.contains("rm-btn")?el.nextElementSibling:null;
    if(!mobile.matches){el.classList.remove("is-clamped");if(btn)btn.hidden=true;return}
    if(!btn){btn=document.createElement("button");btn.type="button";btn.className="rm-btn";btn.textContent="Read more";el.after(btn);
      btn.addEventListener("click",function(){var c=el.classList.toggle("is-clamped");btn.textContent=c?"Read more":"Read less";btn.setAttribute("aria-expanded",c?"false":"true")})}
    el.classList.add("is-clamped");
    if(el.scrollHeight<=el.clientHeight+8){el.classList.remove("is-clamped");btn.hidden=true}
    else{btn.hidden=false;btn.textContent="Read more";btn.setAttribute("aria-expanded","false")}
  });
}
setupMore();if(mobile.addEventListener)mobile.addEventListener("change",setupMore);

/* journal: files settle back as the next one slides over */
var jp=$(".page--journal");
if(jp&&!RM){
  var cards=$$(".jcard",jp),ticking=false;
  function upd(){ticking=false;
    for(var i=0;i<cards.length-1;i++){
      var a=cards[i].getBoundingClientRect(),b=cards[i+1].getBoundingClientRect();
      var p=Math.max(0,Math.min(1,1-(b.top-a.top)/Math.max(1,a.height)));
      cards[i].style.transform="scale("+(1-p*.05).toFixed(4)+")";
      cards[i].firstElementChild.style.filter=p>0.01?"brightness("+(1-p*.08).toFixed(3)+")":"";
    }}
  jp.addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(upd)}},{passive:true});
}
})();

/* in-page viewer for certificates and the CV.
   On the normal site the links open the PDF / download the CV. Inside a preview frame
   (where new tabs and downloads are blocked) the same links open this viewer instead. */
(function(){
  var embedded=false;try{embedded=window.self!==window.top}catch(e){embedded=true}
  var box=document.createElement("div");box.className="cview";box.hidden=true;
  box.setAttribute("role","dialog");box.setAttribute("aria-modal","true");box.setAttribute("aria-label","Document preview");box.setAttribute("data-lenis-prevent","");
  box.innerHTML='<div class="cview__in"><div class="cview__bar"><span class="cview__t"></span><span class="cview__note">Preview &middot; the PDF opens and downloads on the live site</span><a class="cview__open" target="_blank" rel="noopener" hidden></a><button type="button" class="cview__x">Close</button></div><div class="cview__pages" data-lenis-prevent></div></div>';
  document.body.appendChild(box);
  var t=box.querySelector(".cview__t"),o=box.querySelector(".cview__open"),pages=box.querySelector(".cview__pages"),x=box.querySelector(".cview__x"),last=null;
  function open(a){
    last=a;t.textContent=a.getAttribute("data-title")||"";
    if(a.hasAttribute("data-cv")){o.href=a.getAttribute("href");o.setAttribute("download",a.getAttribute("download")||"");o.textContent="Download CV";o.hidden=false}else{o.hidden=true}
    pages.innerHTML="";
    a.getAttribute("data-view").split("|").forEach(function(s,i){var im=document.createElement("img");im.src=s;im.alt=(t.textContent||"Document")+(i?", page "+(i+1):"");pages.appendChild(im)});
    box.hidden=false;document.documentElement.classList.add("cview-on");pages.scrollTop=0;x.focus();
  }
  function close(){box.hidden=true;document.documentElement.classList.remove("cview-on");if(last)last.focus()}
  x.addEventListener("click",close);
  box.addEventListener("click",function(e){if(e.target===box)close()});
  document.addEventListener("keydown",function(e){if(!box.hidden&&e.key==="Escape"){e.stopPropagation();close()}},true);
  document.addEventListener("click",function(e){
    var a=e.target.closest&&e.target.closest("a[data-view]");if(!a)return;
    if(e.metaKey||e.ctrlKey||e.shiftKey)return;
    if(embedded){e.preventDefault();open(a)}
  });
})();

/* ============ v5 additions ============ */
(function(){
"use strict";
var $=function(q,c){return (c||document).querySelector(q)},
    $$=function(q,c){return Array.prototype.slice.call((c||document).querySelectorAll(q))};
var RM=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
var clamp=function(v,a,b){return Math.max(a,Math.min(b,v))};
var ticking=false,fns=[];
function onScroll(fn){fns.push(fn);}
function run(){ticking=false;for(var i=0;i<fns.length;i++)fns[i]();}
window.addEventListener("scroll",function(){if(!ticking){ticking=true;requestAnimationFrame(run)}},{passive:true});
window.addEventListener("resize",function(){if(!ticking){ticking=true;requestAnimationFrame(run)}});

/* ---- the menu on small screens ---- */
(function(){
  var b=$("#burger"),m=$("#mnav");if(!b||!m)return;
  var t=null;
  function setOpen(o){
    b.setAttribute("aria-expanded",o?"true":"false");
    if(t){clearTimeout(t);t=null}
    if(o){
      m.hidden=false;void m.offsetWidth;m.classList.add("is-on");
      document.body.classList.add("is-locked");
      if(window.__lenis)window.__lenis.stop();
    }else{
      m.classList.remove("is-on");
      document.body.classList.remove("is-locked");
      if(window.__lenis)window.__lenis.start();
      t=setTimeout(function(){if(b.getAttribute("aria-expanded")!=="true")m.hidden=true},RM?0:360);
    }
  }
  b.addEventListener("click",function(){setOpen(b.getAttribute("aria-expanded")!=="true")});
  m.addEventListener("click",function(e){if(e.target.closest("a"))setOpen(false)});
  document.addEventListener("keydown",function(e){
    if(e.key==="Escape"&&b.getAttribute("aria-expanded")==="true"){setOpen(false);b.focus()}
  });
  window.addEventListener("resize",function(){
    if(window.innerWidth>760&&b.getAttribute("aria-expanded")==="true")setOpen(false);
  });
})();

/* ---- the certificate archive: a reading panel on wide screens, an accordion on phones ---- */
(function(){
  var arc=$("#arc");if(!arc)return;
  var rows=$$(".arcr",arc),sheet=$("#arcSheet"),pane=$("#arcBody");
  var wide=window.matchMedia("(min-width:981px)");
  var sel=null;
  function show(r){
    if(sel===r||!sheet||!pane)return;
    if(sel)sel.classList.remove("is-sel");
    sel=r;r.classList.add("is-sel");
    var d=$(".arcd",r);if(!d)return;
    pane.innerHTML=d.innerHTML;
    var link=$("a[data-view]",d),title=($(".arcd__t",d)||{}).textContent||"Certificate";
    sheet.textContent="";
    if(link&&link.getAttribute("data-view")){
      var im=document.createElement("img");
      im.src=link.getAttribute("data-view");
      im.alt="The "+title+" certificate";
      im.loading="lazy";
      sheet.appendChild(im);
    }else{
      var mk=document.createElement("div");
      mk.className="arcv__mark";mk.setAttribute("aria-hidden","true");mk.textContent="SG";
      sheet.appendChild(mk);
    }
  }
  function closeAll(except){
    rows.forEach(function(x){
      if(x===except)return;
      x.classList.remove("is-open");
      var bb=$(".arci",x);if(bb)bb.setAttribute("aria-expanded","false");
    });
  }
  function mode(){
    if(wide.matches){
      rows.forEach(function(r){
        r.classList.remove("is-open");
        var bb=$(".arci",r);if(bb)bb.removeAttribute("aria-expanded");
      });
      if(!sel)show(rows[0]);
    }else{
      if(sel){sel.classList.remove("is-sel");sel=null}
      rows.forEach(function(r){
        var bb=$(".arci",r);
        if(bb)bb.setAttribute("aria-expanded",r.classList.contains("is-open")?"true":"false");
      });
    }
  }
  rows.forEach(function(r){
    var btn=$(".arci",r);if(!btn)return;
    btn.addEventListener("click",function(){
      if(wide.matches){show(r);return}
      var open=!r.classList.contains("is-open");
      closeAll(r);
      r.classList.toggle("is-open",open);
      btn.setAttribute("aria-expanded",open?"true":"false");
    });
    btn.addEventListener("mouseenter",function(){if(wide.matches)show(r)});
    btn.addEventListener("focus",function(){if(wide.matches)show(r)});
  });
  mode();
  if(wide.addEventListener)wide.addEventListener("change",mode);
  else if(wide.addListener)wide.addListener(mode);
})();

/* ---- the fold: one square of paper becomes a crane as you scroll past ---- */
(function(){
  var sec=$("#fold"),g=$("#foldG"),cap=$("#foldCap"),hint=$("#foldHint");
  if(!sec||!g)return;
  var fct=$$(".fct",g);if(fct.length!==8)return;
  // the eight rim points at each stage; every facet is (centre, Pi, Pi+1)
  var C=[[120,100],[120,100],[112,104]];
  var P=[
    // flat: a square, corners and edge middles
    [[40,20],[120,20],[200,20],[200,100],[200,180],[120,180],[40,180],[40,100]],
    // gathered: a tall diamond, the sheet collected along its creases
    [[86,48],[120,22],[154,48],[168,104],[150,152],[120,178],[90,152],[72,104]],
    // the crane: tips at 0,2,4,6 (beak, wing, tail, body) with notches between them
    [[4,46],[124,2],[240,26],[158,124],[118,176],[76,112],[100,82],[150,80]]
  ];
  // the crane rim is authored tip-first; put it back in rim order 0..7
  P[2]=[P[2][0],P[2][6],P[2][1],P[2][7],P[2][2],P[2][3],P[2][4],P[2][5]];
  var LINES=["The paper starts flat.","A few deliberate folds.","A crane. The same single sheet."];
  var lastLine=-1,lastP=-1;
  function lerp(a,b,t){return a+(b-a)*t}
  function pts(i,t){
    // t runs 0..2 across the three stages
    var s=t<1?0:1,f=t<1?t:t-1;
    var c=[lerp(C[s][0],C[s+1][0],f),lerp(C[s][1],C[s+1][1],f)];
    var A=P[s][i],B=P[s+1][i],A2=P[s][(i+1)%8],B2=P[s+1][(i+1)%8];
    return c[0].toFixed(1)+","+c[1].toFixed(1)+" "+
           lerp(A[0],B[0],f).toFixed(1)+","+lerp(A[1],B[1],f).toFixed(1)+" "+
           lerp(A2[0],B2[0],f).toFixed(1)+","+lerp(A2[1],B2[1],f).toFixed(1);
  }
  function draw(p){
    if(Math.abs(p-lastP)<0.004)return;
    lastP=p;
    var e=p<.5?2*p*p:1-Math.pow(-2*p+2,2)/2;   // ease in and out
    var t=e*2;
    for(var i=0;i<8;i++)fct[i].setAttribute("points",pts(i,t));
    g.setAttribute("transform","rotate("+(-7*e).toFixed(2)+" 120 100) translate(0 "+(-12*e).toFixed(1)+")");
    var li=p<.34?0:(p<.72?1:2);
    if(cap&&li!==lastLine){
      lastLine=li;
      var sp=cap.firstElementChild;
      if(!sp){cap.innerHTML="<span></span>";sp=cap.firstElementChild}
      if(RM){sp.textContent=LINES[li]}
      else{cap.classList.add("is-out");
        setTimeout(function(){sp.textContent=LINES[li];cap.classList.remove("is-out")},260)}
    }
    if(hint)hint.classList.toggle("is-done",p>.8);
  }
  if(RM){draw(1);return}
  function step(){
    var r=sec.getBoundingClientRect(),h=window.innerHeight;
    var from=h*0.88,to=-r.height*0.25;
    draw(clamp((from-r.top)/(from-to),0,1));
  }
  onScroll(step);step();
})();

})();

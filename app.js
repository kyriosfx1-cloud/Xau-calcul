const $=id=>document.getElementById(id);
const themeToggle=$("themeToggle");
function applyTheme(theme){
 document.documentElement.dataset.theme=theme;
 const light=theme==="light";
 themeToggle.textContent=light?"🌙 Sombre":"☀️ Clair";
 themeToggle.setAttribute("aria-label",light?"Activer le mode sombre":"Activer le mode clair");
 try{localStorage.setItem("xaupro-theme",theme)}catch(e){}
}
let savedTheme=null;try{savedTheme=localStorage.getItem("xaupro-theme")}catch(e){}
applyTheme(savedTheme||"dark");
themeToggle.addEventListener("click",()=>applyTheme(document.documentElement.dataset.theme==="light"?"dark":"light"));
const ids=["balance","currency","fx","risk","rr","direction","entry","sl","contract"];
function money(n,cur){if(!Number.isFinite(n))return "—";return (cur==="XOF"?"FCFA ":"$")+new Intl.NumberFormat("fr-FR",{minimumFractionDigits:2,maximumFractionDigits:2}).format(n)}
function calc(){
 const balance=Number($("balance").value), currency=$("currency").value, fx=Number($("fx").value)||600, riskPct=Number($("risk").value), rr=Number($("rr").value), dir=$("direction").value, entry=Number($("entry").value), sl=Number($("sl").value), contract=Number($("contract").value);
 $("fxWrap").classList.toggle("hidden",currency!=="XOF");
 const warn=[];
 if(balance<=0||entry<=0||sl<=0||contract<=0){warn.push("Renseigne un solde, un prix d’entrée, un SL et une taille de contrat valides.");}
 const validSide=dir==="BUY"?sl<entry:sl>entry;
 if(entry>0&&sl>0&&!validSide)warn.push("Le SL semble du mauvais côté : pour BUY, le SL doit être sous l’entrée ; pour SELL, au-dessus.");
 if(currency==="XOF"&&fx<=0)warn.push("Entre un taux FCFA/USD valide.");
 const dist=Math.abs(entry-sl), balanceUSD=currency==="XOF"?balance/fx:balance, riskUSD=balanceUSD*riskPct/100;
 const lot=dist>0&&contract>0?riskUSD/(dist*contract):0;
 const tp=dir==="BUY"?entry+dist*rr:entry-dist*rr;
 const valid=warn.length===0&&dist>0;
 $("lot").innerHTML=valid?lot.toFixed(2)+' <small>lot</small>':"—";
 $("riskMoney").textContent=money(riskUSD,currency==="XOF"?"USD":"USD")+(currency==="XOF"?" (≈ "+money(riskUSD*fx,"XOF")+")":"");
 $("tp").textContent=valid?tp.toFixed(2):"—";
 $("distance").textContent=valid?dist.toFixed(2)+" $":"—";
 $("gain").textContent=valid?money(riskUSD*rr,"USD")+(currency==="XOF"?" (≈ "+money(riskUSD*rr*fx,"XOF")+")":""):"—";
 $("lotValue").textContent=valid?money(lot*contract*entry,"USD"):"—";
 if(valid&&lot<0.01)warn.push("Le lot calculé est inférieur à 0,01. Vérifie le lot minimum accepté par ton broker.");
 if(valid&&lot>100)warn.push("Lot calculé très élevé : vérifie tes paramètres et le contrat du broker.");
 if(riskPct>=10)warn.push("Attention : risquer 10 % à chaque trade est très agressif. Une série de pertes peut réduire fortement ton capital.");
 $("warning").innerHTML=warn.join("<br>");$("warning").classList.toggle("hidden",warn.length===0);
}
ids.forEach(id=>$(id).addEventListener("input",calc));$("recalc").addEventListener("click",calc);calc();
if("serviceWorker" in navigator && location.protocol.startsWith("http"))window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js").catch(()=>{}));
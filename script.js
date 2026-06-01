const KEY="eco_fridge_vision_products";
const $=s=>document.querySelector(s);
let mode="add", editingId=null, photoData="", scanner=null;
let products=JSON.parse(localStorage.getItem(KEY)||"null")||[
 {id:crypto.randomUUID(),name:"Spinaci freschi",brand:"",category:"Verdura",quantity:"1",unit:"busta",expiry:datePlus(1),imageUrl:"https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=800",notes:"Da usare presto",calories:"23 kcal",protein:"2,9 g",carbs:"3,6 g",fats:"0,4 g"},
 {id:crypto.randomUUID(),name:"Yogurt bianco",brand:"",category:"Latticini",quantity:"2",unit:"vasetti",expiry:datePlus(4),imageUrl:"https://images.unsplash.com/photo-1488477181946-6428a0291777?w=800",notes:"",calories:"61 kcal",protein:"3,5 g",carbs:"4,7 g",fats:"3,3 g"},
 {id:crypto.randomUUID(),name:"Mele",brand:"",category:"Frutta",quantity:"5",unit:"pezzi",expiry:datePlus(9),imageUrl:"https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=800",notes:"",calories:"52 kcal",protein:"0,3 g",carbs:"14 g",fats:"0,2 g"}
];

document.addEventListener("DOMContentLoaded",()=>{events();render()});

function datePlus(n){let d=new Date();d.setDate(d.getDate()+n);return d.toISOString().slice(0,10)}
function save(){localStorage.setItem(KEY,JSON.stringify(products))}
function left(exp){let a=new Date();a.setHours(0,0,0,0);let b=new Date(exp);b.setHours(0,0,0,0);return Math.ceil((b-a)/86400000)}
function state(p){let d=left(p.expiry);if(d<=1)return{label:d<0?"Scaduto":"Urgente",cls:"red",w:"100%"};if(d<=3)return{label:d+" giorni",cls:"orange",w:"72%"};if(d<=7)return{label:d+" giorni",cls:"yellow",w:"48%"};return{label:"Fresco",cls:"green",w:"24%"}}
function sortList(a){return[...a].sort((x,y)=>left(x.expiry)-left(y.expiry))}
function esc(x){return String(x??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[m]))}

function render(){
 let filter=$("#filter").value;
 let list=sortList(products).filter(p=>filter==="all"||p.category===filter);
 $("#productList").innerHTML=list.map(card).join("")||"<p>Nessun prodotto.</p>";
 let urgent=sortList(products).filter(p=>left(p.expiry)<=1);
 $("#urgentList").innerHTML=urgent.map(card).join("")||"<p>Nessun prodotto urgente.</p>";
 $("#urgentCount").textContent=products.filter(p=>left(p.expiry)<=1).length;
 $("#weekCount").textContent=products.filter(p=>left(p.expiry)>1&&left(p.expiry)<=7).length;
 $("#freshCount").textContent=products.filter(p=>left(p.expiry)>7).length;
}

function card(p){
 let s=state(p),img=p.imageUrl||"https://images.unsplash.com/photo-1542838132-92c53300491e?w=800";
 return `<article class="product"><div class="productTop"><img src="${esc(img)}" alt="${esc(p.name)}"><div><h3>${esc(p.name)}</h3><p>${esc(p.quantity)} ${esc(p.unit||"")} · scade ${new Date(p.expiry).toLocaleDateString("it-IT")}</p><span class="pill ${s.cls}">${s.label}</span><div class="bar"><span class="${s.cls}" style="width:${s.w}"></span></div></div><div class="buttons"><button class="secondary" onclick="toggle('${p.id}')">Dettagli</button><button onclick="edit('${p.id}')">✏️</button><button onclick="removeProduct('${p.id}')">🗑️</button></div></div><div id="d${p.id}" class="details"><div class="detailGrid"><div class="info"><b>Dati prodotto</b><br>${esc(p.brand||"Marca non indicata")}<br>${esc(p.category)}</div><div class="info"><b>Quantità</b><br>${esc(p.quantity)} ${esc(p.unit||"")}<br>${new Date(p.expiry).toLocaleDateString("it-IT")}</div><div class="info"><b>Valori</b><br>${esc(p.calories||"n.d.")}<br>Proteine ${esc(p.protein||"n.d.")}</div></div><div class="detailGrid" style="margin-top:10px"><div class="info">Carboidrati<br><b>${esc(p.carbs||"n.d.")}</b></div><div class="info">Grassi<br><b>${esc(p.fats||"n.d.")}</b></div><div class="info">Note<br><b>${esc(p.notes||"Nessuna nota")}</b></div></div><h3 style="margin-top:16px">Ricette consigliate</h3><div class="recipes">${recipes(p)}</div></div></article>`;
}

function recipes(p){
 let q=encodeURIComponent(p.name);
 let arr=[
  [`Insalata con ${p.name}`,"10 min","https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800",`https://www.giallozafferano.it/ricerca-ricette/${q}/`],
  [`Ricetta anti spreco con ${p.name}`,"20 min","https://images.unsplash.com/photo-1543352634-a1c51d9f1fa7?w=800",`https://www.google.com/search?q=ricetta+${q}`]
 ];
 return arr.map(r=>`<a class="recipe" href="${r[3]}" target="_blank"><img src="${r[2]}"><div style="padding:12px"><b>${esc(r[0])}</b><br><span>${r[1]}</span></div></a>`).join("");
}

function events(){
 $("#openAdd").onclick=()=>openAdd();
 $("#closeModal").onclick=closeModal;
 $("#filter").onchange=render;
 $("#makeRecipe").onclick=meal;
 $("#form").onsubmit=submitForm;
 $("#startScan").onclick=startScan;
 $("#stopScan").onclick=stopScan;
 $("#searchBarcode").onclick=()=>searchBarcode($("#barcodeInput").value.trim());
 $("#photoInput").onchange=preview;
 $("#readPhoto").onclick=readPhoto;
 document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
}

function setTab(t){
 document.querySelectorAll(".tab").forEach(b=>b.classList.toggle("active",b.dataset.tab===t));
 document.querySelectorAll(".tabPanel").forEach(p=>p.classList.remove("active"));
 $("#"+t+"Tab").classList.add("active");
}

function openAdd(){mode="add";editingId=null;$("#modalTitle").textContent="Aggiungi prodotto";$("#addTabs").style.display="flex";$("#form").reset();$("#modal").classList.remove("hidden")}
function closeModal(){stopScan();$("#modal").classList.add("hidden")}
function toggle(id){$("#d"+id).classList.toggle("open")}
function removeProduct(id){if(confirm("Eliminare prodotto?")){products=products.filter(p=>p.id!==id);save();render()}}

function edit(id){
 let p=products.find(x=>x.id===id);if(!p)return;
 mode="edit";editingId=id;$("#modalTitle").textContent="Modifica prodotto";$("#addTabs").style.display="none";
 $("#name").value=p.name;$("#brand").value=p.brand||"";$("#category").value=p.category||"Altro";$("#quantity").value=p.quantity||"";$("#unit").value=p.unit||"";$("#expiry").value=p.expiry;$("#imageUrl").value=p.imageUrl||"";$("#notes").value=p.notes||"";
 $("#modal").classList.remove("hidden");
}

function submitForm(e){
 e.preventDefault();
 let obj={name:$("#name").value.trim(),brand:$("#brand").value.trim(),category:$("#category").value,quantity:$("#quantity").value.trim(),unit:$("#unit").value.trim(),expiry:$("#expiry").value,imageUrl:$("#imageUrl").value.trim()||photoData,notes:$("#notes").value.trim(),calories:"n.d.",protein:"n.d.",carbs:"n.d.",fats:"n.d."};
 if(mode==="edit"){Object.assign(products.find(p=>p.id===editingId),obj)}else{products.push({id:crypto.randomUUID(),...obj})}
 save();closeModal();render();
}

async function startScan(){
 $("#barcodeMsg").textContent="Avvio fotocamera...";
 try{
  if(!window.Html5Qrcode){$("#barcodeMsg").textContent="Scanner non caricato. Usa inserimento manuale.";return}
  scanner=new Html5Qrcode("reader");
  let formats=[Html5QrcodeSupportedFormats.EAN_13,Html5QrcodeSupportedFormats.EAN_8,Html5QrcodeSupportedFormats.UPC_A,Html5QrcodeSupportedFormats.UPC_E,Html5QrcodeSupportedFormats.QR_CODE];
  await scanner.start({facingMode:"environment"},{fps:10,qrbox:{width:250,height:180},formatsToSupport:formats},code=>{$("#barcodeInput").value=code;$("#barcodeMsg").textContent="Barcode letto: "+code;stopScan();searchBarcode(code)},()=>{});
 }catch(e){$("#barcodeMsg").textContent="Fotocamera non disponibile. Controlla permessi o usa barcode manuale."}
}

async function stopScan(){try{if(scanner&&scanner.isScanning){await scanner.stop();await scanner.clear()}}catch(e){}}

async function searchBarcode(code){
 if(!code){$("#barcodeMsg").textContent="Inserisci un barcode.";return}
 $("#barcodeMsg").textContent="Ricerca su Open Food Facts...";
 try{
  let res=await fetch(`https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json`);
  let data=await res.json();
  if(!data.product){$("#barcodeMsg").textContent="Prodotto non trovato. Compila manualmente.";return}
  let p=data.product;
  $("#name").value=p.product_name_it||p.product_name||"";
  $("#brand").value=p.brands||"";
  $("#category").value=guess(p.categories+" "+p.product_name);
  $("#quantity").value=p.quantity||"1";
  $("#unit").value=p.quantity?"":"confezione";
  $("#imageUrl").value=p.image_front_url||p.image_url||"";
  $("#notes").value=p.ingredients_text_it||p.ingredients_text||"";
  $("#barcodeMsg").textContent="Prodotto trovato. Controlla i dati e inserisci la scadenza.";
 }catch(e){$("#barcodeMsg").textContent="Errore nella ricerca. Puoi compilare manualmente."}
}

function guess(t){t=(t||"").toLowerCase();if(t.includes("fruit")||t.includes("frutta"))return"Frutta";if(t.includes("vegetable")||t.includes("verdura"))return"Verdura";if(t.includes("yogurt")||t.includes("milk")||t.includes("latte")||t.includes("cheese"))return"Latticini";if(t.includes("pasta")||t.includes("rice")||t.includes("biscuit"))return"Dispensa";return"Altro"}

function preview(e){
 let f=e.target.files[0];if(!f)return;
 let r=new FileReader();r.onload=()=>{photoData=r.result;$("#preview").src=r.result;$("#preview").classList.remove("hidden")};r.readAsDataURL(f);
}

async function readPhoto(){
 let f=$("#photoInput").files[0];if(!f){$("#photoMsg").textContent="Carica una foto.";return}
 if(!window.Tesseract){$("#photoMsg").textContent="OCR non disponibile. Compila manualmente.";return}
 $("#photoMsg").textContent="Analisi foto in corso...";
 try{
  let out=await Tesseract.recognize(f,"ita+eng");
  let text=out.data.text||"";
  let foundDate=findDate(text),foundName=findName(text);
  if(foundName)$("#name").value=foundName;
  if(foundDate)$("#expiry").value=foundDate;
  $("#notes").value=text.slice(0,500);
  $("#photoMsg").textContent=foundDate||foundName?"Dati trovati. Controlla prima di salvare.":"Non ho trovato dati certi. Compila manualmente.";
 }catch(e){$("#photoMsg").textContent="Analisi non riuscita. Compila manualmente."}
}

function findDate(t){let m=t.match(/(\d{1,2})[\\/\\-.](\d{1,2})[\\/\\-.](\d{2,4})/);if(!m)return"";let yy=m[3].length===2?"20"+m[3]:m[3];return `${yy.padStart(4,"0")}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`}
function findName(t){let bad=["ingredienti","valori","scadenza","energia","proteine","grassi"];return t.split("\\n").map(x=>x.trim()).filter(x=>x.length>3).find(x=>!bad.some(b=>x.toLowerCase().includes(b)))?.slice(0,45)||""}

function meal(){
 let prompt=$("#mealPrompt").value.trim();
 let exp=sortList(products).filter(p=>left(p.expiry)<=3).map(p=>p.name);
 let base=exp.length?exp:products.slice(0,3).map(p=>p.name);
 $("#recipeResult").innerHTML=`<div class="info"><h3>Ricetta suggerita</h3><p><b>Nome:</b> Bowl anti spreco</p><p><b>Ingredienti:</b> ${esc(base.join(", "))}, olio, sale e spezie.</p><p><b>Procedimento:</b> prepara gli ingredienti, cuoci quelli necessari e unisci tutto in un piatto unico.</p><p><b>Richiesta:</b> ${esc(prompt||"usa gli alimenti in scadenza")}</p><p><b>Tempo:</b> 20 minuti. <b>Calorie stimate:</b> 450 kcal.</p></div>`;
}


const products=[
{name:'Spinaci Freschi',expiry:'2026-06-03',cal:'23 kcal',protein:'2.9g'},
{name:'Banana',expiry:'2026-06-04',cal:'89 kcal',protein:'1.1g'}
];

const el=document.getElementById('products');

products.forEach((p,i)=>{
 const div=document.createElement('div');
 div.className='product';
 div.innerHTML=`<b>${p.name}</b><br>Scadenza: ${p.expiry}
 <br><button onclick="toggle(${i})">Dettagli</button>
 <button onclick="editProduct(${i})">✏️</button>
 <div class="details" id="d${i}">
 Calorie: ${p.cal}<br>
 Proteine: ${p.protein}<br>
 Ricette consigliate: Insalata, Frittata
 </div>`;
 el.appendChild(div);
});

function toggle(i){
 const d=document.getElementById('d'+i);
 d.style.display=d.style.display==='block'?'none':'block';
}

function editProduct(i){
 const q=prompt('Modifica quantità del prodotto:');
 if(q!==null) alert('Quantità aggiornata a '+q);
}

function generateRecipe(){
 const p=document.getElementById('prompt').value;
 document.getElementById('recipe').innerHTML='<h3>Ricetta suggerita</h3><p>Generata da: '+p+'</p>';
}

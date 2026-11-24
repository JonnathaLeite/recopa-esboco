/* =========================================================
   LOJA RECOPA — catálogo e carrinho
   Para editar: mude a lista PRODUTOS abaixo.
   cat = categoria, sub = subcategoria, preco = número (use null para "Consulte")
   ATENÇÃO: os preços abaixo são EXEMPLOS. Troque pelos valores reais.
   ========================================================= */
var PRODUTOS = [
  // Alimentação
  {id:1,  cat:"Alimentação", sub:"Ração para cães",      nome:"Ração premium cães adultos 15 kg",        preco:219.90, img:"bag", badge:"Mais vendido"},
  {id:2,  cat:"Alimentação", sub:"Ração para cães",      nome:"Ração filhotes raças pequenas 3 kg",      preco:74.90,  img:"bag"},
  {id:3,  cat:"Alimentação", sub:"Ração para cães",      nome:"Ração cães sênior 10 kg",                 preco:169.90, img:"bag"},
  {id:4,  cat:"Alimentação", sub:"Ração para gatos",     nome:"Ração gatos castrados 3 kg",              preco:89.90,  img:"bag"},
  {id:5,  cat:"Alimentação", sub:"Ração para gatos",     nome:"Ração gatos filhotes 1 kg",               preco:39.90,  img:"bag"},
  {id:6,  cat:"Alimentação", sub:"Petiscos",             nome:"Bifinho natural de frango 250 g",         preco:22.90,  img:"bone"},
  {id:7,  cat:"Alimentação", sub:"Petiscos",             nome:"Osso de couro para cães",                 preco:14.90,  img:"bone"},
  {id:8,  cat:"Alimentação", sub:"Sachês e úmidos",      nome:"Sachê gatos sabor salmão (caixa c/ 12)",  preco:38.90,  img:"can"},
  {id:9,  cat:"Alimentação", sub:"Sachês e úmidos",      nome:"Patê cães adultos 280 g",                 preco:9.90,   img:"can"},
  // Higiene
  {id:10, cat:"Higiene", sub:"Shampoo e condicionador",  nome:"Shampoo neutro 500 ml",                   preco:29.90,  img:"bottle"},
  {id:11, cat:"Higiene", sub:"Shampoo e condicionador",  nome:"Condicionador pelos longos 500 ml",       preco:32.90,  img:"bottle"},
  {id:12, cat:"Higiene", sub:"Tapetes higiênicos",       nome:"Tapete higiênico 60x60 (30 un.)",         preco:54.90,  img:"pad", badge:"Oferta"},
  {id:13, cat:"Higiene", sub:"Areia para gatos",         nome:"Areia sanitária grãos finos 4 kg",        preco:24.90,  img:"sack"},
  {id:14, cat:"Higiene", sub:"Areia para gatos",         nome:"Areia de sílica 1,6 kg",                  preco:34.90,  img:"sack"},
  {id:15, cat:"Higiene", sub:"Higiene bucal",            nome:"Kit escova + creme dental pet",           preco:27.90,  img:"brush"},
  // Acessórios
  {id:16, cat:"Acessórios", sub:"Coleiras e guias",      nome:"Coleira peitoral ajustável M",            preco:49.90,  img:"collar"},
  {id:17, cat:"Acessórios", sub:"Coleiras e guias",      nome:"Guia de nylon 1,2 m",                     preco:29.90,  img:"collar"},
  {id:18, cat:"Acessórios", sub:"Camas e caminhas",      nome:"Caminha redonda antiestresse M",          preco:129.90, img:"bed"},
  {id:19, cat:"Acessórios", sub:"Comedouros e bebedouros", nome:"Comedouro inox 500 ml",                 preco:24.90,  img:"bowl"},
  {id:20, cat:"Acessórios", sub:"Comedouros e bebedouros", nome:"Bebedouro fonte para gatos",            preco:119.90, img:"bowl"},
  {id:21, cat:"Acessórios", sub:"Brinquedos",            nome:"Bolinha resistente com som",              preco:19.90,  img:"ball"},
  {id:22, cat:"Acessórios", sub:"Brinquedos",            nome:"Arranhador torre para gatos",             preco:139.90, img:"tower"}
];

/* ---- ilustrações simples dos produtos (troque por fotos reais quando tiver) ---- */
var ART = {
  bag:'<svg viewBox="0 0 100 120"><path d="M20 15h60l8 95H12z" fill="#fff" stroke="#171717" stroke-width="3" stroke-linejoin="round"/><path d="M20 15l6 12h48l6-12" fill="none" stroke="#171717" stroke-width="3"/><circle cx="50" cy="66" r="17" fill="#ffc622" stroke="#171717" stroke-width="3"/><rect x="30" y="92" width="40" height="6" rx="3" fill="#171717"/></svg>',
  can:'<svg viewBox="0 0 100 100"><ellipse cx="50" cy="28" rx="34" ry="10" fill="#fff" stroke="#171717" stroke-width="3"/><path d="M16 28v44c0 6 15 10 34 10s34-4 34-10V28" fill="#fff" stroke="#171717" stroke-width="3"/><rect x="17" y="44" width="66" height="20" fill="#ffc622"/></svg>',
  bone:'<svg viewBox="0 0 120 60"><path d="M28 18a12 12 0 1 0-6 22h76a12 12 0 1 0 6-22 12 12 0 1 0-12-6H34a12 12 0 0 0-6 6z" fill="#fff" stroke="#171717" stroke-width="3" stroke-linejoin="round"/></svg>',
  bottle:'<svg viewBox="0 0 80 120"><rect x="30" y="8" width="20" height="14" rx="3" fill="#ffc622" stroke="#171717" stroke-width="3"/><path d="M22 22h36l6 12v74H16V34z" fill="#fff" stroke="#171717" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="52" width="36" height="30" rx="4" fill="#fff0b8"/></svg>',
  pad:'<svg viewBox="0 0 110 90"><rect x="10" y="14" width="90" height="62" rx="8" fill="#fff" stroke="#171717" stroke-width="3"/><rect x="24" y="26" width="62" height="38" rx="6" fill="#fff0b8"/></svg>',
  sack:'<svg viewBox="0 0 100 110"><path d="M22 20h56l6 80H16z" fill="#fff" stroke="#171717" stroke-width="3" stroke-linejoin="round"/><path d="M24 20c8-8 44-8 52 0" fill="none" stroke="#171717" stroke-width="3"/><rect x="28" y="50" width="44" height="24" rx="5" fill="#ffc622"/></svg>',
  brush:'<svg viewBox="0 0 120 60"><rect x="8" y="26" width="78" height="10" rx="5" fill="#fff" stroke="#171717" stroke-width="3"/><rect x="84" y="16" width="26" height="22" rx="4" fill="#ffc622" stroke="#171717" stroke-width="3"/></svg>',
  collar:'<svg viewBox="0 0 100 100"><circle cx="50" cy="46" r="30" fill="none" stroke="#171717" stroke-width="10"/><circle cx="50" cy="46" r="30" fill="none" stroke="#ffc622" stroke-width="3" stroke-dasharray="4 6"/><circle cx="50" cy="84" r="9" fill="#ffc622" stroke="#171717" stroke-width="3"/></svg>',
  bed:'<svg viewBox="0 0 120 80"><ellipse cx="60" cy="52" rx="52" ry="22" fill="#fff" stroke="#171717" stroke-width="3"/><ellipse cx="60" cy="48" rx="34" ry="12" fill="#ffc622" opacity=".6"/></svg>',
  bowl:'<svg viewBox="0 0 120 70"><path d="M14 24h92l-10 34H24z" fill="#fff" stroke="#171717" stroke-width="3" stroke-linejoin="round"/><ellipse cx="60" cy="24" rx="46" ry="8" fill="#ffc622" stroke="#171717" stroke-width="3"/></svg>',
  ball:'<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="#ffc622" stroke="#171717" stroke-width="3"/><path d="M18 36c20 10 44 10 64 0M18 64c20-10 44-10 64 0" fill="none" stroke="#171717" stroke-width="3"/></svg>',
  tower:'<svg viewBox="0 0 100 120"><rect x="20" y="96" width="60" height="12" rx="4" fill="#fff" stroke="#171717" stroke-width="3"/><rect x="42" y="30" width="16" height="66" fill="#fff0b8" stroke="#171717" stroke-width="3"/><rect x="24" y="18" width="52" height="14" rx="5" fill="#ffc622" stroke="#171717" stroke-width="3"/></svg>'
};

function iniciarLoja(PRODUTOS){
  var $=function(s){return document.querySelector(s)};
  function brl(v){return v==null?'Consulte':v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'})}
  function esc(s){return String(s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
  var estado={cat:'',sub:'',busca:'',ordem:'',limite:0};
  function passo(){ return window.matchMedia('(max-width:680px)').matches ? 6 : 12 }
  estado.limite=passo();

  // ---- menu lateral (categorias e subcategorias) ----
  var cats={}; PRODUTOS.forEach(function(p){cats[p.cat]=cats[p.cat]||{};cats[p.cat][p.sub]=(cats[p.cat][p.sub]||0)+1});
  $('#nAll').textContent=PRODUTOS.length;
  $('#cats').innerHTML=Object.keys(cats).map(function(c,i){
    var total=Object.keys(cats[c]).reduce(function(a,s){return a+cats[c][s]},0);
    return '<li><button class="cat-btn" type="button" data-cat="'+esc(c)+'" aria-expanded="false"><span>'+esc(c)+'</span><span><span class="n">'+total+'</span><span class="chev">›</span></span></button><ul class="subs">'+
      Object.keys(cats[c]).map(function(s){return '<li><button class="sub-btn" type="button" data-cat="'+esc(c)+'" data-sub="'+esc(s)+'"><span>'+esc(s)+'</span><span class="n">'+cats[c][s]+'</span></button></li>'}).join('')+'</ul></li>'}).join('');

  // menu de categorias em "sanfona": só uma categoria aberta por vez; clicar de novo fecha
  function marcar(){
    document.querySelectorAll('.all-btn').forEach(function(b){b.classList.toggle('on',!estado.cat)});
    document.querySelectorAll('#cats .cat-btn').forEach(function(b){var on=b.dataset.cat===estado.cat;b.classList.toggle('on',on);b.setAttribute('aria-expanded',on?'true':'false')});
    document.querySelectorAll('.sub-btn').forEach(function(b){b.classList.toggle('on',b.dataset.cat===estado.cat&&b.dataset.sub===estado.sub)});
    var atual=$('#sideAtual'); if(atual) atual.textContent=estado.sub||estado.cat||'Todos os produtos';
  }
  var side=$('#side'), toggle=$('#sideToggle');
  function painel(abrir){ if(!toggle) return; side.classList.toggle('open',abrir); toggle.setAttribute('aria-expanded',abrir?'true':'false') }
  function celular(){ return window.matchMedia('(max-width:900px)').matches }
  if(toggle) toggle.addEventListener('click',function(){ painel(!side.classList.contains('open')) });
  side.addEventListener('click',function(e){
    var b=e.target.closest('button'); if(!b||b===toggle)return;
    var fecharPainel=false;
    if(b.classList.contains('all-btn')){estado.cat='';estado.sub='';fecharPainel=true}
    else if(b.classList.contains('cat-btn')){
      if(estado.cat===b.dataset.cat){ estado.cat='';estado.sub='' }      // já aberta: fecha e volta para todos
      else { estado.cat=b.dataset.cat;estado.sub='' }
    } else if(b.classList.contains('sub-btn')){
      if(estado.sub===b.dataset.sub){ estado.sub='' } else { estado.cat=b.dataset.cat;estado.sub=b.dataset.sub }
      fecharPainel=true;
    } else return;
    estado.limite=passo(); marcar(); render();
    if(celular()&&fecharPainel){ painel(false); var v=$('#vitrine'); if(v) v.scrollIntoView({behavior:'smooth',block:'start'}) }
  });
  $('#busca').addEventListener('input',function(e){estado.busca=e.target.value.trim().toLowerCase();estado.limite=passo();render()});
  $('#verMais').addEventListener('click',function(){ estado.limite+=passo(); render() });
  $('#ordem').addEventListener('change',function(e){estado.ordem=e.target.value;estado.limite=passo();render()});

  // ---- vitrine ----
  function render(){
    var lista=PRODUTOS.filter(function(p){
      return (!estado.cat||p.cat===estado.cat)&&(!estado.sub||p.sub===estado.sub)&&(!estado.busca||(p.nome+' '+p.sub+' '+p.cat).toLowerCase().indexOf(estado.busca)>-1)});
    if(estado.ordem==='asc')lista.sort(function(a,b){return (a.preco||0)-(b.preco||0)});
    if(estado.ordem==='desc')lista.sort(function(a,b){return (b.preco||0)-(a.preco||0)});
    if(estado.ordem==='az')lista.sort(function(a,b){return a.nome.localeCompare(b.nome)});
    $('#crumb').innerHTML=(estado.cat?esc(estado.cat)+(estado.sub?' › <b>'+esc(estado.sub)+'</b>':''):'<b>Todos os produtos</b>')+' · '+lista.length+' '+(lista.length===1?'item':'itens');
    var total=lista.length, mostrar=lista.slice(0,estado.limite), resta=total-mostrar.length;
    var vm=$('#verMais'); vm.hidden=resta<=0; vm.textContent='Ver mais produtos ('+resta+')';
    $('#grid').innerHTML=total?mostrar.map(function(p){
      return '<article class="prod"><div class="thumb'+(p.foto?' has-photo':'')+'">'+(p.badge?'<span class="badge">'+esc(p.badge)+'</span>':'')+(p.foto?'<img src="'+esc(p.foto)+'" alt="'+esc(p.nome)+'" loading="lazy">':(ART[p.img]||ART.bag))+'</div><div class="body"><span class="sub">'+esc(p.sub)+'</span><h4>'+esc(p.nome)+'</h4><div class="row"><span class="price">'+brl(p.preco)+'</span><button class="add" type="button" data-id="'+esc(p.id)+'">Adicionar</button></div></div></article>'}).join('')
      :'<p class="empty">Nenhum produto encontrado. Tente outra busca ou fale com a loja pelo WhatsApp.</p>';
  }

  // ---- carrinho ----
  var cart={}; try{cart=JSON.parse(localStorage.getItem('recopa-carrinho')||'{}')||{}}catch(e){cart={}}
  function salvar(){try{localStorage.setItem('recopa-carrinho',JSON.stringify(cart))}catch(e){}}
  function prod(id){return PRODUTOS.filter(function(p){return p.id==id})[0]}
  function toast(t){var el=$('#toast');el.textContent=t;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(function(){el.classList.remove('show')},1800)}
  function renderCart(){
    var ids=Object.keys(cart).filter(function(id){return cart[id]>0&&prod(id)}),n=0,t=0;
    ids.forEach(function(id){n+=cart[id];t+=cart[id]*(prod(id).preco||0)});
    $('#qtd').textContent=n; $('#total').textContent=brl(t);
    $('#itens').innerHTML=ids.length?ids.map(function(id){var p=prod(id);return '<div class="item"><div class="info"><b>'+esc(p.nome)+'</b>'+brl(p.preco)+'</div><div class="qty"><button type="button" data-d="-1" data-id="'+id+'" aria-label="Diminuir">−</button><span>'+cart[id]+'</span><button type="button" data-d="1" data-id="'+id+'" aria-label="Aumentar">+</button></div></div>'}).join(''):'<p class="empty">Seu carrinho está vazio.</p>';
    var uni=(document.querySelector('input[name=unidade]:checked')||{}).value||'1';
    var msg='Olá! Gostaria de fazer este pedido na loja Recopa ('+(uni==='1'?'1º':'2º')+' Distrito):\n\n'+ids.map(function(id){var p=prod(id);return '• '+cart[id]+'x '+p.nome+' — '+brl((p.preco||0)*cart[id])}).join('\n')+'\n\nTotal: '+brl(t)+'\n\nVou retirar na loja / quero entrega (endereço: )';
    var f=$('#finalizar'); f.href='https://wa.me/'+WA_LOJAS[uni]+'?text='+encodeURIComponent(msg); f.classList.toggle('disabled',!ids.length);
  }
  document.addEventListener('click',function(e){
    var a=e.target.closest('.add'); if(a){cart[a.dataset.id]=(cart[a.dataset.id]||0)+1;salvar();renderCart();toast('Adicionado ao carrinho');return}
    var q=e.target.closest('.qty button'); if(q){cart[q.dataset.id]=Math.max(0,(cart[q.dataset.id]||0)+parseInt(q.dataset.d,10));if(!cart[q.dataset.id])delete cart[q.dataset.id];salvar();renderCart()}
  });
  document.querySelectorAll('input[name=unidade]').forEach(function(r){r.addEventListener('change',renderCart)});
  function abrir(){$('#drawer').classList.add('open');$('#scrim').classList.add('open')}
  function fechar(){$('#drawer').classList.remove('open');$('#scrim').classList.remove('open')}
  $('#abrirCarrinho').addEventListener('click',abrir);$('#fechar').addEventListener('click',fechar);$('#scrim').addEventListener('click',fechar);
  document.addEventListener('keydown',function(e){if(e.key==='Escape')fechar()});

  marcar(); render(); renderCart();
}

/* Usa os produtos da planilha; se ela não estiver configurada ou falhar, usa a lista acima */
function produtosDaPlanilha(linhas){
  var R = window.RECOPA;
  return linhas.filter(function(l){ return l.nome && l.categoria }).map(function(l){
    var sub = l.subcategoria || l.categoria, s = (sub+' '+l.nome).toLowerCase();
    var img = (l.icone||'').toLowerCase().trim();
    if(!ART[img]) img = /ração|racao/.test(s)?'bag': /sachê|sache|patê|pate|úmido|umido/.test(s)?'can': /petisco|osso|bifinho/.test(s)?'bone':
      /shampoo|condicionador|perfume/.test(s)?'bottle': /tapete/.test(s)?'pad': /areia/.test(s)?'sack': /escova|dental|bucal/.test(s)?'brush':
      /coleira|guia|peitoral/.test(s)?'collar': /cama|caminha/.test(s)?'bed': /comedouro|bebedouro|fonte/.test(s)?'bowl': /arranhador/.test(s)?'tower': /bola|brinquedo/.test(s)?'ball':'bag';
    return {id:(l.categoria+'|'+sub+'|'+l.nome).toLowerCase().replace(/[^a-z0-9]+/g,'-'), cat:l.categoria, sub:sub, nome:l.nome,
            preco:R.preco(l.preco), img:img, foto:l.foto||'', badge:l.destaque||''};
  });
}
(window.RECOPA_DADOS || Promise.resolve(null)).then(function(d){
  var lista = d && d.produtos && d.produtos.length ? produtosDaPlanilha(d.produtos) : [];
  iniciarLoja(lista.length ? lista : PRODUTOS);
});

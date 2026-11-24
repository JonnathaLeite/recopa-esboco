/* =========================================================
   CARROSSEL DE BANNERS — Recopa
   ---------------------------------------------------------
   Os banners vêm da pasta "Banners do site" no Google Drive,
   pelo mesmo link configurado em dados.js (RECOPA_API).
   ========================================================= */

/* 1) BANNERS PADRÃO (usados se o Drive não estiver configurado ou sair do ar) */
var BANNERS_LOCAIS = [
  {img: "img/banners/01-marca.webp",            link: "",                      alt: "Recopa – Pet shop, banho e tosa e hospital veterinário 24 horas"},
  {img: "img/banners/02-banho-ilimitado.webp",  link: "petshop.html#banho",    alt: "Banho ilimitado – planos a partir de R$ 139,90"},
  {img: "img/banners/03-hospital-24h.webp",     link: "hospital.html",         alt: "Hospital veterinário 24 horas – plantão todos os dias"},
  {img: "img/banners/04-transporte-pet.webp",   link: "index.html#transporte", alt: "Transporte pet em carro elétrico e climatizado"}
];

/* 2) TEMPO DE CADA BANNER (em segundos) */
var BANNERS_TEMPO = 5;

/* ================= não precisa mexer daqui pra baixo ================= */
(function(){
  var raiz = document.getElementById('banners'); if(!raiz) return;
  var trilho = raiz.querySelector('.car-track'), dots = raiz.querySelector('.car-dots');
  var reduzir = false; try{ reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches }catch(e){}
  var atual = 0, total = 0, timer = null;

  function esc(s){ return String(s||'').replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}) }

  function montar(lista){
    lista = (lista||[]).filter(function(b){ return b && b.img });
    if(!lista.length) lista = BANNERS_LOCAIS;
    total = lista.length;
    trilho.innerHTML = lista.map(function(b,i){
      var img = '<img src="'+esc(b.img)+'" alt="'+esc(b.alt)+'"'+(i? ' loading="lazy"':'')+' draggable="false">';
      var externo = /^https?:/i.test(b.link||'') && b.link.indexOf(location.host)<0;
      return '<div class="car-slide" role="group" aria-roledescription="banner" aria-label="'+(i+1)+' de '+lista.length+'">'+
        (b.link ? '<a href="'+esc(b.link)+'"'+(externo?' target="_blank" rel="noopener"':'')+'>'+img+'</a>' : img)+'</div>';
    }).join('');
    dots.innerHTML = lista.map(function(_,i){ return '<button type="button" aria-label="Ir para o banner '+(i+1)+'"></button>' }).join('');
    raiz.classList.toggle('single', total < 2);
    ir(0, true); tocar();
  }

  function ir(n, semAnim){
    atual = (n + total) % total;
    trilho.style.transition = semAnim||reduzir ? 'none' : '';
    trilho.style.transform = 'translateX(' + (-100*atual) + '%)';
    Array.prototype.forEach.call(dots.children, function(d,i){ d.setAttribute('aria-current', i===atual ? 'true' : 'false') });
  }
  function tocar(){ parar(); if(total>1 && !reduzir) timer = setInterval(function(){ ir(atual+1) }, BANNERS_TEMPO*1000) }
  function parar(){ if(timer){ clearInterval(timer); timer=null } }

  raiz.querySelector('.car-prev').addEventListener('click', function(){ ir(atual-1); tocar() });
  raiz.querySelector('.car-next').addEventListener('click', function(){ ir(atual+1); tocar() });
  dots.addEventListener('click', function(e){ var b=e.target.closest('button'); if(!b)return; ir(Array.prototype.indexOf.call(dots.children,b)); tocar() });
  raiz.addEventListener('mouseenter', parar); raiz.addEventListener('mouseleave', tocar);
  raiz.addEventListener('focusin', parar); raiz.addEventListener('focusout', tocar);
  document.addEventListener('visibilitychange', function(){ document.hidden ? parar() : tocar() });

  // arrastar com o dedo (celular)
  var x0 = null, arrastou = false;
  trilho.addEventListener('touchstart', function(e){ x0 = e.touches[0].clientX; arrastou=false; parar() }, {passive:true});
  trilho.addEventListener('touchmove', function(e){ if(x0!==null && Math.abs(e.touches[0].clientX-x0)>10) arrastou=true }, {passive:true});
  trilho.addEventListener('touchend', function(e){
    if(x0===null) return; var dx = e.changedTouches[0].clientX - x0; x0 = null;
    if(Math.abs(dx) > 40) ir(atual + (dx<0 ? 1 : -1)); tocar();
  });
  trilho.addEventListener('click', function(e){ if(arrastou){ e.preventDefault(); arrastou=false } }, true);

  // carrega do Google Drive (se configurado); se falhar, usa os banners padrão
  montar(BANNERS_LOCAIS);
  (window.RECOPA_DADOS || Promise.resolve(null)).then(function(d){
    if(!d || !d.banners || !d.banners.length) return;
    var c = d.contatos || {};
    montar(d.banners.map(function(b){
      var m = /^whatsapp:(.+)$/.exec(b.link||'');
      if(m){ var n = c['whatsapp_'+m[1]]; b.link = n && window.RECOPA ? RECOPA.wa(n) : '' }
      return b;
    }));
  });
})();

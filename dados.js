/* =========================================================
   DADOS DO SITE — vêm da planilha do Google da Recopa
   ---------------------------------------------------------
   Cole abaixo o link do "App da Web" do script da planilha
   (veja o guia). Enquanto estiver vazio, o site usa os dados
   que já estão nele, e nada quebra.
   ========================================================= */
var RECOPA_API = "";

/* ================= não precisa mexer daqui pra baixo ================= */
(function(){
  // busca os dados uma vez só (com limite de 8 s para não travar o site)
  window.RECOPA_DADOS = new Promise(function(ok){
    if(!RECOPA_API) return ok(null);
    var fim = setTimeout(function(){ ok(null) }, 8000);
    fetch(RECOPA_API).then(function(r){ return r.json() })
      .then(function(d){ clearTimeout(fim); ok(d && typeof d === 'object' ? d : null) })
      .catch(function(){ clearTimeout(fim); ok(null) });
  });

  // ---------- utilidades usadas pela loja e pelas páginas ----------
  var R = window.RECOPA = {};
  R.esc = function(s){ return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}) };
  // "R$ 1.219,90" / "219,9" / "219.90" → 219.9  (vazio ou texto → null = "Consulte")
  R.preco = function(v){
    if(v==null) return null; var s = String(v).replace(/[^\d,.\-]/g,'');
    if(!s) return null;
    if(s.indexOf(',')>-1) s = s.replace(/\./g,'').replace(',','.');
    else if((s.match(/\./g)||[]).length>1) s = s.replace(/\./g,'');
    var n = parseFloat(s); return isNaN(n) ? null : n;
  };
  R.brl = function(v){ return v==null ? 'Consulte' : v.toLocaleString('pt-BR',{style:'currency',currency:'BRL'}) };
  R.fone = function(v){ var d=String(v||'').replace(/\D/g,''); if(!d) return ''; if(d.indexOf('55')!==0) d='55'+d; return d };
  R.foneTexto = function(v){ var d=R.fone(v).slice(2); if(d.length===11) return '('+d.slice(0,2)+') '+d.slice(2,7)+'-'+d.slice(7); if(d.length===10) return '('+d.slice(0,2)+') '+d.slice(2,6)+'-'+d.slice(6); return v };
  R.sim = function(v){ return /^(s|sim|x|1|true)$/i.test(String(v||'').trim()) };
  R.wa = function(num,msg){ return 'https://wa.me/'+R.fone(num)+(msg?'?text='+encodeURIComponent(msg):'') };
  R.contatos = {};

  // ---------- aplica os dados da planilha na página ----------
  window.RECOPA_DADOS.then(function(d){
    if(!d) return;
    var pronto = function(){ aplicar(d) };
    if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', pronto); else pronto();
  });

  function aplicar(d){
    var c = d.contatos || {}; R.contatos = c;
    var nums = {loja1:c.whatsapp_loja1, loja2:c.whatsapp_loja2, hospital:c.whatsapp_hospital};

    // botões de WhatsApp, telefones, e-mails e redes sociais
    document.querySelectorAll('[data-wa]').forEach(function(a){ var n=nums[a.dataset.wa]; if(n) a.href=a.href.replace(/wa\.me\/\d+/,'wa.me/'+R.fone(n)) });
    document.querySelectorAll('[data-tel]').forEach(function(a){ var n=nums[a.dataset.tel]; if(n){ a.href='tel:+'+R.fone(n); a.textContent=R.foneTexto(n) } });
    document.querySelectorAll('[data-mail]').forEach(function(a){ var m=c['email_'+a.dataset.mail]; if(m){ a.href='mailto:'+m; if(!a.querySelector('*')) a.textContent=m } });
    document.querySelectorAll('[data-rede]').forEach(function(a){ var u=c[a.dataset.rede]; if(u) a.href=u });
    if(window.WA_LOJAS){ if(nums.loja1) WA_LOJAS['1']=R.fone(nums.loja1); if(nums.loja2) WA_LOJAS['2']=R.fone(nums.loja2) }

    // planos de banho
    var planos = document.getElementById('planos');
    if(planos && d.planos && d.planos.length){
      planos.innerHTML = d.planos.map(function(p,i){
        var valor = R.preco(p.valor), txt = valor==null ? 'Consulte' : valor.toLocaleString('pt-BR',{minimumFractionDigits:2});
        var msg = 'Olá! Tenho interesse no plano Banho Ilimitado – '+p.porte+(valor!=null?' (R$ '+txt+')':'')+'.';
        return '<article class="plan"><span class="plan-n">'+(i+1)+'</span><p class="plan-name">'+R.esc(p.nome||'Banho ilimitado')+'</p><h3>'+R.esc(p.porte)+'</h3>'+
          '<p class="plan-price">'+(valor!=null?'<small>R$</small>':'')+txt+(p.periodo?'<span class="plan-per">/'+R.esc(p.periodo)+'</span>':'')+'</p><p class="note">Selecione a loja desejada</p>'+
          '<div class="plan-btns"><a class="button dark" href="'+R.wa(nums.loja1||WA_LOJAS['1'],msg)+'">Recopa 1º Distrito</a><a class="button secondary" href="'+R.wa(nums.loja2||WA_LOJAS['2'],msg)+'">Recopa 2º Distrito</a></div>'+
          '<p class="plan-foot">'+R.esc(p.observacao||'Tosas e transporte não inclusos')+'</p></article>';
      }).join('');
    }

    // equipe veterinária
    var equipe = document.getElementById('equipe-lista');
    if(equipe && d.equipe && d.equipe.length){
      equipe.innerHTML = d.equipe.map(function(v){
        var ini = String(v.nome||'').replace(/[^\p{L}\s.]/gu,'').replace(/^(dra?\.?)\s+/i,'').split(/\s+/).filter(function(w){return /\p{L}/u.test(w)});
        ini = ini.length>1 ? (ini[0][0]+ini[ini.length-1][0]).toUpperCase() : (ini[0]||'V').slice(0,2).toUpperCase();
        var chips = String(v.especialidades||'').split(/[,;]/).map(function(s){return s.trim()}).filter(Boolean).map(function(s){return '<span>'+R.esc(s)+'</span>'}).join('');
        var ph = v.foto ? '<img src="'+R.esc(v.foto)+'" alt="'+R.esc(v.nome)+'">' : '<div class="ini">'+R.esc(ini)+'</div>';
        return '<article class="vet"><div class="ph">'+ph+'</div><div class="body"><h3>'+R.esc(v.nome)+'</h3><p class="role">'+R.esc(v.cargo)+'</p>'+
          (v.crmv?'<span class="crmv">'+R.esc(v.crmv)+'</span>':'')+'<div class="chips">'+chips+'</div></div></article>';
      }).join('');
    }
  }
})();

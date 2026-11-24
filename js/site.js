/**
 * NÚCLEO DO SITE (carregado em todas as páginas)
 * --------------------------------------------------------------------------
 * 1. Utilidades (formatação de preço, telefone, links do WhatsApp...)
 * 2. Carregamento dos dados: planilha do Google com reserva em dados-padrao.js
 * 3. Contatos: atualiza todos os links marcados com data-wa / data-tel /
 *    data-mail / data-rede
 * 4. Rodapé (seções recolhíveis no celular) e ano do copyright
 * 5. Mapa do hospital (carrega o Google Maps somente se for permitido)
 *
 * Expõe o objeto global `Recopa`, usado pelos scripts de cada página.
 */
(function () {
  "use strict";

  var CONFIG = window.RECOPA_CONFIG || {};
  var PADRAO = window.RECOPA_PADRAO || {};

  /* ------------------------------------------------------------------ */
  /* 1. Utilidades                                                       */
  /* ------------------------------------------------------------------ */

  /** Escapa texto para inserir com segurança em HTML. */
  function esc(valor) {
    return String(valor == null ? "" : valor).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /** Remove acentos e deixa minúsculo (usado nas buscas). */
  function normalizar(texto) {
    return String(texto || "")
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase();
  }

  /**
   * Converte o preço digitado na planilha em número.
   * Aceita "219,90", "R$ 1.219,90", "219.90". Vazio ou texto → null ("Consulte").
   */
  function lerPreco(valor) {
    if (valor == null || valor === "") return null;
    if (typeof valor === "number") return valor;
    var s = String(valor).replace(/[^\d,.-]/g, "");
    if (!s) return null;
    if (s.indexOf(",") > -1) s = s.replace(/\./g, "").replace(",", ".");
    else if ((s.match(/\./g) || []).length > 1) s = s.replace(/\./g, "");
    var n = parseFloat(s);
    return isNaN(n) ? null : n;
  }

  /** 219.9 → "R$ 219,90"; null → "Consulte". */
  function formatarPreco(numero) {
    if (numero == null) return "Consulte";
    return numero.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  }

  /** "(69) 99273-4320" → "5569992734320" (com código do país). */
  function telefoneDigitos(valor) {
    var d = String(valor || "").replace(/\D/g, "");
    if (!d) return "";
    return d.indexOf("55") === 0 && d.length > 11 ? d : "55" + d;
  }

  /** "69992734320" → "(69) 99273-4320". */
  function telefoneTexto(valor) {
    var d = telefoneDigitos(valor).slice(2);
    if (d.length === 11) return "(" + d.slice(0, 2) + ") " + d.slice(2, 7) + "-" + d.slice(7);
    if (d.length === 10) return "(" + d.slice(0, 2) + ") " + d.slice(2, 6) + "-" + d.slice(6);
    return String(valor || "");
  }

  /** Link do WhatsApp com mensagem opcional. */
  function linkWhatsApp(numero, mensagem) {
    var url = "https://wa.me/" + telefoneDigitos(numero);
    return mensagem ? url + "?text=" + encodeURIComponent(mensagem) : url;
  }

  /** Linha da planilha marcada como inativa ("não" na coluna Ativo). */
  function inativo(item) {
    return /^n(a|ã)o$/i.test(String((item && item.ativo) || "").trim());
  }

  /* ------------------------------------------------------------------ */
  /* 2. Dados (planilha + reserva)                                       */
  /* ------------------------------------------------------------------ */

  var CHAVE_CACHE = "recopa:dados";

  function lerCache() {
    try {
      var salvo = JSON.parse(sessionStorage.getItem(CHAVE_CACHE) || "null");
      var validade = (CONFIG.cacheMinutos || 5) * 60 * 1000;
      if (salvo && salvo.url === CONFIG.apiUrl && Date.now() - salvo.quando < validade) return salvo.dados;
    } catch {
      /* sem acesso ao armazenamento: segue sem cache */
    }
    return null;
  }

  function gravarCache(dados) {
    try {
      sessionStorage.setItem(CHAVE_CACHE, JSON.stringify({ url: CONFIG.apiUrl, quando: Date.now(), dados: dados }));
    } catch {
      /* idem */
    }
  }

  /** Busca a planilha (com limite de tempo). Resolve com null em caso de falha. */
  function buscarPlanilha() {
    if (!CONFIG.apiUrl) return Promise.resolve(null);
    var cache = lerCache();
    if (cache) return Promise.resolve(cache);

    return new Promise(function (resolver) {
      var limite = setTimeout(function () {
        resolver(null);
      }, 8000);

      fetch(CONFIG.apiUrl)
        .then(function (resposta) {
          return resposta.json();
        })
        .then(function (dados) {
          clearTimeout(limite);
          if (dados && typeof dados === "object") gravarCache(dados);
          resolver(dados && typeof dados === "object" ? dados : null);
        })
        .catch(function () {
          clearTimeout(limite);
          resolver(null);
        });
    });
  }

  /** Junta a planilha com os dados padrão: cada parte vazia na planilha usa a reserva. */
  function combinar(planilha) {
    planilha = planilha || {};
    function lista(nome) {
      var itens = Array.isArray(planilha[nome]) && planilha[nome].length ? planilha[nome] : PADRAO[nome] || [];
      return itens.filter(function (item) {
        return !inativo(item);
      });
    }
    var contatos = {};
    Object.keys(PADRAO.contatos || {}).forEach(function (k) {
      contatos[k] = PADRAO.contatos[k];
    });
    Object.keys(planilha.contatos || {}).forEach(function (k) {
      if (planilha.contatos[k]) contatos[k] = planilha.contatos[k];
    });
    return {
      origem: planilha.produtos ? "planilha" : "padrao",
      contatos: contatos,
      banners: lista("banners"),
      planos: lista("planos"),
      equipe: lista("equipe"),
      produtos: lista("produtos"),
    };
  }

  /** Promise com os dados finais do site. */
  var dados = buscarPlanilha().then(combinar);

  /* ------------------------------------------------------------------ */
  /* 3. Contatos                                                         */
  /* ------------------------------------------------------------------ */

  /**
   * data-wa="loja1|loja2|hospital" (+ data-msg opcional) → link do WhatsApp
   * data-tel="loja1|loja2|hospital"                      → telefone
   * data-mail="petshop|hospital"                         → e-mail
   * data-rede="instagram|facebook"                       → redes sociais
   */
  function aplicarContatos(contatos) {
    document.querySelectorAll("[data-wa]").forEach(function (el) {
      var numero = contatos["whatsapp_" + el.dataset.wa];
      if (numero) el.href = linkWhatsApp(numero, el.dataset.msg);
    });
    document.querySelectorAll("[data-tel]").forEach(function (el) {
      var numero = contatos["whatsapp_" + el.dataset.tel];
      if (!numero) return;
      el.href = "tel:+" + telefoneDigitos(numero);
      el.textContent = telefoneTexto(numero);
    });
    document.querySelectorAll("[data-mail]").forEach(function (el) {
      var email = contatos["email_" + el.dataset.mail];
      if (!email) return;
      el.href = "mailto:" + email;
      if (!el.children.length) el.textContent = email;
    });
    document.querySelectorAll("[data-rede]").forEach(function (el) {
      var url = contatos[el.dataset.rede];
      if (url) el.href = url;
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. Rodapé                                                           */
  /* ------------------------------------------------------------------ */

  function iniciarRodape() {
    var ano = document.getElementById("ano");
    if (ano) ano.textContent = new Date().getFullYear();

    /* No celular as seções começam fechadas (abrem ao tocar); no computador ficam abertas. */
    var celular = window.matchMedia("(max-width: 680px)");
    function ajustar() {
      document.querySelectorAll("details.rodape-col").forEach(function (secao) {
        secao.open = !celular.matches;
      });
    }
    ajustar();
    if (celular.addEventListener) celular.addEventListener("change", ajustar);
  }

  /* ------------------------------------------------------------------ */
  /* 5. Mapa                                                             */
  /* ------------------------------------------------------------------ */

  /** Carrega o mapa; se o ambiente bloquear o Google Maps, fica o mapa ilustrativo. */
  function iniciarMapa() {
    var frame = document.querySelector(".mapa iframe[data-src]");
    if (!frame) return;
    document.addEventListener("securitypolicyviolation", function (e) {
      if (/google/i.test(e.blockedURI || "") && frame.parentNode) frame.remove();
    });
    frame.src = frame.dataset.src;
  }

  /* ------------------------------------------------------------------ */
  /* Início                                                              */
  /* ------------------------------------------------------------------ */

  window.Recopa = {
    dados: dados,
    esc: esc,
    normalizar: normalizar,
    lerPreco: lerPreco,
    formatarPreco: formatarPreco,
    telefoneDigitos: telefoneDigitos,
    linkWhatsApp: linkWhatsApp,
  };

  function iniciar() {
    iniciarRodape();
    iniciarMapa();
    dados.then(function (d) {
      aplicarContatos(d.contatos);
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", iniciar);
  else iniciar();
})();

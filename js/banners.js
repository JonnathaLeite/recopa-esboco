/**
 * CARROSSEL DE BANNERS (página inicial)
 * --------------------------------------------------------------------------
 * Os banners vêm da pasta do Google Drive (via planilha) ou, se ela não
 * estiver configurada, de js/dados-padrao.js.
 *
 * Recursos: troca automática, setas, bolinhas, teclado (← →), arrastar com
 * o dedo, pausa ao passar o mouse / focar / trocar de aba, respeita a opção
 * "reduzir movimento" do sistema.
 */
(function () {
  "use strict";

  var raiz = document.getElementById("banners");
  if (!raiz || !window.Recopa) return;

  var trilho = raiz.querySelector(".carrossel-trilho");
  var pontos = raiz.querySelector(".carrossel-pontos");
  var tempo = ((window.RECOPA_CONFIG || {}).tempoBanner || 5) * 1000;
  var reduzirMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var atual = 0;
  var total = 0;
  var timer = null;

  /** Links "whatsapp:loja1" (vindos do Drive) viram link real do WhatsApp. */
  function resolverLink(link, contatos) {
    var m = /^whatsapp:(.+)$/.exec(link || "");
    if (!m) return link || "";
    var numero = contatos["whatsapp_" + m[1]];
    return numero ? Recopa.linkWhatsApp(numero) : "";
  }

  function montar(banners, contatos) {
    total = banners.length;
    trilho.innerHTML = banners
      .map(function (b, i) {
        var link = resolverLink(b.link, contatos);
        var externo = /^https?:/i.test(link) && link.indexOf(location.host) < 0;
        var img =
          '<img src="' + Recopa.esc(b.img) + '" alt="' + Recopa.esc(b.alt) + '" width="1600" height="400"' +
          (i ? ' loading="lazy"' : "") + ' draggable="false">';
        var conteudo = link
          ? '<a href="' + Recopa.esc(link) + '"' + (externo ? ' target="_blank" rel="noopener noreferrer"' : "") + ">" + img + "</a>"
          : img;
        return (
          '<div class="carrossel-slide" role="group" aria-roledescription="banner" aria-label="' +
          (i + 1) + " de " + total + '">' + conteudo + "</div>"
        );
      })
      .join("");

    pontos.innerHTML = banners
      .map(function (_, i) {
        return '<button type="button" aria-label="Ir para o banner ' + (i + 1) + '"></button>';
      })
      .join("");

    raiz.classList.toggle("is-unico", total < 2);
    irPara(0, true);
    tocar();
  }

  function irPara(indice, semAnimacao) {
    if (!total) return;
    atual = (indice + total) % total;
    trilho.style.transition = semAnimacao || reduzirMovimento ? "none" : "";
    trilho.style.transform = "translateX(" + -100 * atual + "%)";
    Array.prototype.forEach.call(pontos.children, function (botao, i) {
      botao.setAttribute("aria-current", i === atual ? "true" : "false");
    });
    Array.prototype.forEach.call(trilho.children, function (slide, i) {
      slide.setAttribute("aria-hidden", i === atual ? "false" : "true");
      var link = slide.querySelector("a");
      if (link) link.tabIndex = i === atual ? 0 : -1;
    });
  }

  function tocar() {
    parar();
    if (total > 1 && !reduzirMovimento) {
      timer = setInterval(function () {
        irPara(atual + 1);
      }, tempo);
    }
  }

  function parar() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  /* --- controles --- */
  raiz.querySelector(".carrossel-anterior").addEventListener("click", function () {
    irPara(atual - 1);
    tocar();
  });
  raiz.querySelector(".carrossel-proximo").addEventListener("click", function () {
    irPara(atual + 1);
    tocar();
  });
  pontos.addEventListener("click", function (e) {
    var botao = e.target.closest("button");
    if (!botao) return;
    irPara(Array.prototype.indexOf.call(pontos.children, botao));
    tocar();
  });
  raiz.addEventListener("keydown", function (e) {
    if (e.key === "ArrowLeft") irPara(atual - 1);
    else if (e.key === "ArrowRight") irPara(atual + 1);
    else return;
    tocar();
  });

  /* --- pausas --- */
  raiz.addEventListener("mouseenter", parar);
  raiz.addEventListener("mouseleave", tocar);
  raiz.addEventListener("focusin", parar);
  raiz.addEventListener("focusout", tocar);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) parar();
    else tocar();
  });

  /* --- arrastar com o dedo --- */
  var inicioX = null;
  var arrastou = false;
  trilho.addEventListener(
    "touchstart",
    function (e) {
      inicioX = e.touches[0].clientX;
      arrastou = false;
      parar();
    },
    { passive: true }
  );
  trilho.addEventListener(
    "touchmove",
    function (e) {
      if (inicioX !== null && Math.abs(e.touches[0].clientX - inicioX) > 10) arrastou = true;
    },
    { passive: true }
  );
  trilho.addEventListener("touchend", function (e) {
    if (inicioX === null) return;
    var distancia = e.changedTouches[0].clientX - inicioX;
    inicioX = null;
    if (Math.abs(distancia) > 40) irPara(atual + (distancia < 0 ? 1 : -1));
    tocar();
  });
  /* evita abrir o link do banner quando a pessoa só estava arrastando */
  trilho.addEventListener(
    "click",
    function (e) {
      if (arrastou) {
        e.preventDefault();
        arrastou = false;
      }
    },
    true
  );

  Recopa.dados.then(function (d) {
    montar(d.banners, d.contatos);
  });
})();

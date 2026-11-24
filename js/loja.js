/**
 * LOJA (página Petshop)
 * --------------------------------------------------------------------------
 * 1. Catálogo: produtos da planilha (ou de dados-padrao.js), com ilustração
 *    quando não há foto
 * 2. Filtros: categorias em "sanfona", busca sem acento, ordenação,
 *    botão "Ver mais"; no celular o painel de categorias fica recolhido
 * 3. Carrinho: salvo no navegador, escolha da unidade e envio do pedido
 *    pelo WhatsApp
 */
(function () {
  "use strict";

  var $ = function (seletor) {
    return document.querySelector(seletor);
  };
  if (!$("#produtos") || !window.Recopa) return;

  var celular = window.matchMedia("(max-width: 900px)");
  var telaPequena = window.matchMedia("(max-width: 680px)");

  /* ------------------------------------------------------------------ */
  /* 1. Catálogo                                                         */
  /* ------------------------------------------------------------------ */

  /* Ilustrações simples usadas quando o produto não tem foto */
  var ILUSTRACOES = {
    bag: '<svg viewBox="0 0 100 120"><path d="M20 15h60l8 95H12z" fill="#fff" stroke="#171717" stroke-width="3" stroke-linejoin="round"/><path d="M20 15l6 12h48l6-12" fill="none" stroke="#171717" stroke-width="3"/><circle cx="50" cy="66" r="17" fill="#ffc622" stroke="#171717" stroke-width="3"/><rect x="30" y="92" width="40" height="6" rx="3" fill="#171717"/></svg>',
    can: '<svg viewBox="0 0 100 100"><ellipse cx="50" cy="28" rx="34" ry="10" fill="#fff" stroke="#171717" stroke-width="3"/><path d="M16 28v44c0 6 15 10 34 10s34-4 34-10V28" fill="#fff" stroke="#171717" stroke-width="3"/><rect x="17" y="44" width="66" height="20" fill="#ffc622"/></svg>',
    bone: '<svg viewBox="0 0 120 60"><path d="M28 18a12 12 0 1 0-6 22h76a12 12 0 1 0 6-22 12 12 0 1 0-12-6H34a12 12 0 0 0-6 6z" fill="#fff" stroke="#171717" stroke-width="3" stroke-linejoin="round"/></svg>',
    bottle: '<svg viewBox="0 0 80 120"><rect x="30" y="8" width="20" height="14" rx="3" fill="#ffc622" stroke="#171717" stroke-width="3"/><path d="M22 22h36l6 12v74H16V34z" fill="#fff" stroke="#171717" stroke-width="3" stroke-linejoin="round"/><rect x="22" y="52" width="36" height="30" rx="4" fill="#fff0b8"/></svg>',
    pad: '<svg viewBox="0 0 110 90"><rect x="10" y="14" width="90" height="62" rx="8" fill="#fff" stroke="#171717" stroke-width="3"/><rect x="24" y="26" width="62" height="38" rx="6" fill="#fff0b8"/></svg>',
    sack: '<svg viewBox="0 0 100 110"><path d="M22 20h56l6 80H16z" fill="#fff" stroke="#171717" stroke-width="3" stroke-linejoin="round"/><path d="M24 20c8-8 44-8 52 0" fill="none" stroke="#171717" stroke-width="3"/><rect x="28" y="50" width="44" height="24" rx="5" fill="#ffc622"/></svg>',
    brush: '<svg viewBox="0 0 120 60"><rect x="8" y="26" width="78" height="10" rx="5" fill="#fff" stroke="#171717" stroke-width="3"/><rect x="84" y="16" width="26" height="22" rx="4" fill="#ffc622" stroke="#171717" stroke-width="3"/></svg>',
    collar: '<svg viewBox="0 0 100 100"><circle cx="50" cy="46" r="30" fill="none" stroke="#171717" stroke-width="10"/><circle cx="50" cy="46" r="30" fill="none" stroke="#ffc622" stroke-width="3" stroke-dasharray="4 6"/><circle cx="50" cy="84" r="9" fill="#ffc622" stroke="#171717" stroke-width="3"/></svg>',
    bed: '<svg viewBox="0 0 120 80"><ellipse cx="60" cy="52" rx="52" ry="22" fill="#fff" stroke="#171717" stroke-width="3"/><ellipse cx="60" cy="48" rx="34" ry="12" fill="#ffc622" opacity=".6"/></svg>',
    bowl: '<svg viewBox="0 0 120 70"><path d="M14 24h92l-10 34H24z" fill="#fff" stroke="#171717" stroke-width="3" stroke-linejoin="round"/><ellipse cx="60" cy="24" rx="46" ry="8" fill="#ffc622" stroke="#171717" stroke-width="3"/></svg>',
    ball: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="36" fill="#ffc622" stroke="#171717" stroke-width="3"/><path d="M18 36c20 10 44 10 64 0M18 64c20-10 44-10 64 0" fill="none" stroke="#171717" stroke-width="3"/></svg>',
    tower: '<svg viewBox="0 0 100 120"><rect x="20" y="96" width="60" height="12" rx="4" fill="#fff" stroke="#171717" stroke-width="3"/><rect x="42" y="30" width="16" height="66" fill="#fff0b8" stroke="#171717" stroke-width="3"/><rect x="24" y="18" width="52" height="14" rx="5" fill="#ffc622" stroke="#171717" stroke-width="3"/></svg>',
  };

  /** Escolhe a ilustração pelo nome do produto quando a planilha não informa o ícone. */
  function adivinharIlustracao(texto) {
    var t = Recopa.normalizar(texto);
    var regras = [
      [/sache|pate|umido/, "can"],
      [/racao/, "bag"],
      [/petisco|osso|bifinho/, "bone"],
      [/shampoo|condicionador|perfume/, "bottle"],
      [/tapete/, "pad"],
      [/areia/, "sack"],
      [/escova|dental|bucal/, "brush"],
      [/coleira|guia|peitoral/, "collar"],
      [/cama|caminha/, "bed"],
      [/comedouro|bebedouro|fonte/, "bowl"],
      [/arranhador/, "tower"],
      [/bola|brinquedo/, "ball"],
    ];
    for (var i = 0; i < regras.length; i++) if (regras[i][0].test(t)) return regras[i][1];
    return "bag";
  }

  /** Converte as linhas (planilha ou padrão) para o formato usado pela loja. */
  function prepararProdutos(linhas) {
    return linhas
      .filter(function (l) {
        return l.nome && l.categoria;
      })
      .map(function (l) {
        var sub = l.subcategoria || l.categoria;
        var icone = String(l.icone || "").toLowerCase().trim();
        return {
          id: Recopa.normalizar(l.categoria + "|" + sub + "|" + l.nome).replace(/[^a-z0-9]+/g, "-"),
          categoria: l.categoria,
          sub: sub,
          nome: l.nome,
          preco: Recopa.lerPreco(l.preco),
          foto: l.foto || "",
          selo: l.destaque || "",
          ilustracao: ILUSTRACOES[icone] ? icone : adivinharIlustracao(sub + " " + l.nome),
          busca: Recopa.normalizar(l.nome + " " + sub + " " + l.categoria),
        };
      });
  }

  /* ------------------------------------------------------------------ */
  /* 2. Vitrine e filtros                                                */
  /* ------------------------------------------------------------------ */

  var PRODUTOS = [];
  var estado = { categoria: "", sub: "", busca: "", ordem: "", limite: 0 };

  function porPagina() {
    return telaPequena.matches ? 6 : 12;
  }

  function montarFiltros() {
    var arvore = {};
    PRODUTOS.forEach(function (p) {
      arvore[p.categoria] = arvore[p.categoria] || {};
      arvore[p.categoria][p.sub] = (arvore[p.categoria][p.sub] || 0) + 1;
    });

    $("#total-produtos").textContent = PRODUTOS.length;
    $("#categorias").innerHTML = Object.keys(arvore)
      .map(function (cat) {
        var subs = arvore[cat];
        var totalCat = Object.keys(subs).reduce(function (soma, s) {
          return soma + subs[s];
        }, 0);
        return (
          "<li>" +
          '<button class="filtro-categoria" type="button" data-categoria="' + Recopa.esc(cat) + '" aria-expanded="false">' +
          "<span>" + Recopa.esc(cat) + '</span><span><span class="contagem">' + totalCat + '</span><span class="seta" aria-hidden="true">›</span></span>' +
          "</button>" +
          '<ul class="subcategorias">' +
          Object.keys(subs)
            .map(function (sub) {
              return (
                '<li><button class="filtro-sub" type="button" data-categoria="' + Recopa.esc(cat) + '" data-sub="' + Recopa.esc(sub) + '">' +
                "<span>" + Recopa.esc(sub) + '</span><span class="contagem">' + subs[sub] + "</span></button></li>"
              );
            })
            .join("") +
          "</ul></li>"
        );
      })
      .join("");
  }

  /** Atualiza quais botões estão ativos/abertos. */
  function marcarFiltros() {
    $(".filtro-todos").classList.toggle("is-ativo", !estado.categoria);
    document.querySelectorAll(".filtro-categoria").forEach(function (b) {
      var aberta = b.dataset.categoria === estado.categoria;
      b.classList.toggle("is-ativo", aberta);
      b.setAttribute("aria-expanded", aberta ? "true" : "false");
    });
    document.querySelectorAll(".filtro-sub").forEach(function (b) {
      b.classList.toggle("is-ativo", b.dataset.categoria === estado.categoria && b.dataset.sub === estado.sub);
    });
    $("#filtro-atual").textContent = estado.sub || estado.categoria || "Todos os produtos";
  }

  function cardProduto(p) {
    var imagem = p.foto
      ? '<img src="' + Recopa.esc(p.foto) + '" alt="' + Recopa.esc(p.nome) + '" loading="lazy">'
      : ILUSTRACOES[p.ilustracao];
    return (
      '<article class="produto">' +
      '<div class="produto-imagem' + (p.foto ? " tem-foto" : "") + '">' +
      (p.selo ? '<span class="produto-selo">' + Recopa.esc(p.selo) + "</span>" : "") +
      imagem +
      "</div>" +
      '<div class="produto-corpo">' +
      '<span class="produto-categoria">' + Recopa.esc(p.sub) + "</span>" +
      "<h3>" + Recopa.esc(p.nome) + "</h3>" +
      '<div class="produto-linha">' +
      '<span class="produto-preco">' + Recopa.formatarPreco(p.preco) + "</span>" +
      '<button class="produto-adicionar" type="button" data-id="' + Recopa.esc(p.id) + '" aria-label="Adicionar ' + Recopa.esc(p.nome) + ' ao carrinho">Adicionar</button>' +
      "</div></div></article>"
    );
  }

  function renderizarVitrine() {
    var lista = PRODUTOS.filter(function (p) {
      return (
        (!estado.categoria || p.categoria === estado.categoria) &&
        (!estado.sub || p.sub === estado.sub) &&
        (!estado.busca || p.busca.indexOf(estado.busca) > -1)
      );
    });

    if (estado.ordem === "menor") lista.sort(function (a, b) { return (a.preco || 0) - (b.preco || 0); });
    if (estado.ordem === "maior") lista.sort(function (a, b) { return (b.preco || 0) - (a.preco || 0); });
    if (estado.ordem === "nome") lista.sort(function (a, b) { return a.nome.localeCompare(b.nome, "pt-BR"); });

    var visiveis = lista.slice(0, estado.limite);
    var restantes = lista.length - visiveis.length;

    var titulo = estado.categoria
      ? Recopa.esc(estado.categoria) + (estado.sub ? " › <b>" + Recopa.esc(estado.sub) + "</b>" : "")
      : "<b>Todos os produtos</b>";
    $("#resultado").innerHTML = titulo + " · " + lista.length + " " + (lista.length === 1 ? "item" : "itens");

    $("#produtos").innerHTML = lista.length
      ? visiveis.map(cardProduto).join("")
      : '<p class="vazio">Nenhum produto encontrado. Tente outra busca ou fale com a loja pelo WhatsApp.</p>';

    var mais = $("#ver-mais");
    mais.hidden = restantes <= 0;
    mais.textContent = "Ver mais produtos (" + restantes + ")";
  }

  /* Painel de categorias recolhível (tablet e celular) */
  var painel = $("#filtros");
  var botaoPainel = $("#filtros-botao");

  function abrirPainel(abrir) {
    painel.classList.toggle("is-aberto", abrir);
    botaoPainel.setAttribute("aria-expanded", abrir ? "true" : "false");
  }

  function aplicarFiltro() {
    estado.limite = porPagina();
    marcarFiltros();
    renderizarVitrine();
  }

  function iniciarFiltros() {
    botaoPainel.addEventListener("click", function () {
      abrirPainel(!painel.classList.contains("is-aberto"));
    });

    painel.addEventListener("click", function (e) {
      var botao = e.target.closest("button");
      if (!botao || botao === botaoPainel) return;
      var fecharDepois = false;

      if (botao.classList.contains("filtro-todos")) {
        estado.categoria = "";
        estado.sub = "";
        fecharDepois = true;
      } else if (botao.classList.contains("filtro-categoria")) {
        /* clicar na categoria aberta fecha a categoria e volta para todos */
        var mesma = estado.categoria === botao.dataset.categoria;
        estado.categoria = mesma ? "" : botao.dataset.categoria;
        estado.sub = "";
      } else if (botao.classList.contains("filtro-sub")) {
        var mesmaSub = estado.sub === botao.dataset.sub;
        estado.categoria = botao.dataset.categoria;
        estado.sub = mesmaSub ? "" : botao.dataset.sub;
        fecharDepois = true;
      } else {
        return;
      }

      aplicarFiltro();
      if (celular.matches && fecharDepois) {
        abrirPainel(false);
        $("#vitrine").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    $("#busca").addEventListener("input", function (e) {
      estado.busca = Recopa.normalizar(e.target.value.trim());
      aplicarFiltro();
    });

    $("#ordem").addEventListener("change", function (e) {
      estado.ordem = e.target.value;
      aplicarFiltro();
    });

    $("#ver-mais").addEventListener("click", function () {
      estado.limite += porPagina();
      renderizarVitrine();
    });
  }

  /* ------------------------------------------------------------------ */
  /* 3. Carrinho                                                         */
  /* ------------------------------------------------------------------ */

  var CHAVE_CARRINHO = "recopa:carrinho";
  var carrinho = {};
  var contatos = {};
  var ultimoFoco = null;

  function lerCarrinho() {
    try {
      carrinho = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "{}") || {};
    } catch {
      carrinho = {};
    }
  }

  function salvarCarrinho() {
    try {
      localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho));
    } catch {
      /* navegador sem armazenamento: o carrinho vale só nesta visita */
    }
  }

  function produtoPorId(id) {
    for (var i = 0; i < PRODUTOS.length; i++) if (PRODUTOS[i].id === id) return PRODUTOS[i];
    return null;
  }

  function unidadeEscolhida() {
    var marcada = document.querySelector('input[name="unidade"]:checked');
    return marcada ? marcada.value : "loja1";
  }

  function renderizarCarrinho() {
    var ids = Object.keys(carrinho).filter(function (id) {
      return carrinho[id] > 0 && produtoPorId(id);
    });
    var quantidade = 0;
    var total = 0;
    ids.forEach(function (id) {
      quantidade += carrinho[id];
      total += carrinho[id] * (produtoPorId(id).preco || 0);
    });

    $("#carrinho-qtd").textContent = quantidade;
    $("#carrinho-total").textContent = Recopa.formatarPreco(total);

    $("#carrinho-itens").innerHTML = ids.length
      ? ids
          .map(function (id) {
            var p = produtoPorId(id);
            return (
              '<div class="carrinho-item">' +
              '<div class="carrinho-item-info"><b>' + Recopa.esc(p.nome) + "</b>" + Recopa.formatarPreco(p.preco) + "</div>" +
              '<div class="quantidade">' +
              '<button type="button" data-mudar="-1" data-id="' + Recopa.esc(id) + '" aria-label="Diminuir">−</button>' +
              "<span>" + carrinho[id] + "</span>" +
              '<button type="button" data-mudar="1" data-id="' + Recopa.esc(id) + '" aria-label="Aumentar">+</button>' +
              "</div></div>"
            );
          })
          .join("")
      : '<p class="vazio">Seu carrinho está vazio.</p>';

    /* mensagem do pedido para o WhatsApp da unidade escolhida */
    var unidade = unidadeEscolhida();
    var nomeUnidade = unidade === "loja1" ? "1º Distrito" : "2º Distrito";
    var linhas = ids.map(function (id) {
      var p = produtoPorId(id);
      return "• " + carrinho[id] + "x " + p.nome + " — " + Recopa.formatarPreco((p.preco || 0) * carrinho[id]);
    });
    var mensagem =
      "Olá! Gostaria de fazer este pedido na loja Recopa (" + nomeUnidade + "):\n\n" +
      linhas.join("\n") +
      "\n\nTotal: " + Recopa.formatarPreco(total) +
      "\n\nVou retirar na loja / quero entrega (endereço: )";

    var finalizar = $("#finalizar");
    finalizar.href = Recopa.linkWhatsApp(contatos["whatsapp_" + unidade], mensagem);
    finalizar.classList.toggle("is-desativado", !ids.length);
    finalizar.setAttribute("aria-disabled", ids.length ? "false" : "true");
  }

  function mostrarAviso(texto) {
    var aviso = $("#aviso-flutuante");
    aviso.textContent = texto;
    aviso.classList.add("is-visivel");
    clearTimeout(aviso._timer);
    aviso._timer = setTimeout(function () {
      aviso.classList.remove("is-visivel");
    }, 1800);
  }

  function abrirCarrinho() {
    ultimoFoco = document.activeElement;
    $("#carrinho").classList.add("is-aberto");
    $("#carrinho-fundo").classList.add("is-aberto");
    $("#carrinho").inert = false;
    $("#fechar-carrinho").focus();
  }

  function fecharCarrinho() {
    if (!$("#carrinho").classList.contains("is-aberto")) return;
    $("#carrinho").classList.remove("is-aberto");
    $("#carrinho-fundo").classList.remove("is-aberto");
    $("#carrinho").inert = true;
    if (ultimoFoco) ultimoFoco.focus();
  }

  function iniciarCarrinho() {
    lerCarrinho();

    document.addEventListener("click", function (e) {
      var adicionar = e.target.closest(".produto-adicionar");
      if (adicionar) {
        var id = adicionar.dataset.id;
        carrinho[id] = (carrinho[id] || 0) + 1;
        salvarCarrinho();
        renderizarCarrinho();
        mostrarAviso("Adicionado ao carrinho");
        return;
      }
      var mudar = e.target.closest(".quantidade button");
      if (mudar) {
        var item = mudar.dataset.id;
        carrinho[item] = Math.max(0, (carrinho[item] || 0) + parseInt(mudar.dataset.mudar, 10));
        if (!carrinho[item]) delete carrinho[item];
        salvarCarrinho();
        renderizarCarrinho();
      }
    });

    /* impede abrir o WhatsApp com o carrinho vazio */
    $("#finalizar").addEventListener("click", function (e) {
      if (this.classList.contains("is-desativado")) e.preventDefault();
    });

    document.querySelectorAll('input[name="unidade"]').forEach(function (opcao) {
      opcao.addEventListener("change", renderizarCarrinho);
    });

    $("#abrir-carrinho").addEventListener("click", abrirCarrinho);
    $("#fechar-carrinho").addEventListener("click", fecharCarrinho);
    $("#carrinho-fundo").addEventListener("click", fecharCarrinho);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") fecharCarrinho();
    });
  }

  /* ------------------------------------------------------------------ */
  /* Início                                                              */
  /* ------------------------------------------------------------------ */

  Recopa.dados.then(function (d) {
    PRODUTOS = prepararProdutos(d.produtos);
    contatos = d.contatos;
    estado.limite = porPagina();
    montarFiltros();
    iniciarFiltros();
    iniciarCarrinho();
    marcarFiltros();
    renderizarVitrine();
    renderizarCarrinho();
  });
})();

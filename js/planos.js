/**
 * PLANOS DE BANHO ILIMITADO (página Petshop)
 * --------------------------------------------------------------------------
 * Monta os cards a partir da aba "Planos" da planilha (ou dos dados padrão).
 * Cada card tem um botão para cada loja, que abre o WhatsApp com a mensagem
 * do plano escolhido.
 */
(function () {
  "use strict";

  var lista = document.getElementById("planos");
  if (!lista || !window.Recopa) return;

  function card(plano, indice, contatos) {
    var valor = Recopa.lerPreco(plano.valor);
    var valorTexto = valor == null ? "Consulte" : valor.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
    var mensagem =
      "Olá! Tenho interesse no plano Banho Ilimitado – " + plano.porte + (valor != null ? " (R$ " + valorTexto + ")" : "") + ".";

    return (
      '<article class="plano">' +
      '<span class="plano-numero">' + (indice + 1) + "</span>" +
      '<p class="plano-nome">' + Recopa.esc(plano.nome || "Banho ilimitado") + "</p>" +
      "<h3>" + Recopa.esc(plano.porte) + "</h3>" +
      '<p class="plano-preco">' +
      (valor != null ? "<small>R$</small>" : "") + valorTexto +
      (plano.periodo ? '<span class="plano-periodo">/' + Recopa.esc(plano.periodo) + "</span>" : "") +
      "</p>" +
      '<p class="nota">Selecione a loja desejada</p>' +
      '<div class="plano-botoes">' +
      '<a class="botao escuro" href="' + Recopa.linkWhatsApp(contatos.whatsapp_loja1, mensagem) + '">Recopa 1º Distrito</a>' +
      '<a class="botao contorno" href="' + Recopa.linkWhatsApp(contatos.whatsapp_loja2, mensagem) + '">Recopa 2º Distrito</a>' +
      "</div>" +
      '<p class="plano-rodape">' + Recopa.esc(plano.observacao || "Tosas e transporte não inclusos") + "</p>" +
      "</article>"
    );
  }

  Recopa.dados.then(function (d) {
    lista.innerHTML = d.planos
      .map(function (plano, i) {
        return card(plano, i, d.contatos);
      })
      .join("");
  });
})();

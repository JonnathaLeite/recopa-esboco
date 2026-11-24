/**
 * EQUIPE VETERINÁRIA (página Hospital)
 * --------------------------------------------------------------------------
 * Monta os cards a partir da aba "Equipe" da planilha (ou dos dados padrão).
 * Sem foto, o card mostra as iniciais do profissional.
 */
(function () {
  "use strict";

  var lista = document.getElementById("equipe-lista");
  if (!lista || !window.Recopa) return;

  /** "Dra. Ana Souza" → "AS". Ignora títulos e textos entre colchetes. */
  function iniciais(nome) {
    var palavras = String(nome || "")
      .replace(/\[.*?\]/g, "")
      .replace(/^(dra?\.?)\s+/i, "")
      .split(/\s+/)
      .filter(function (p) {
        return /^[A-Za-zÀ-ÿ]/.test(p);
      });
    if (!palavras.length) return "VET";
    if (palavras.length === 1) return palavras[0].slice(0, 2).toUpperCase();
    return (palavras[0][0] + palavras[palavras.length - 1][0]).toUpperCase();
  }

  function card(vet) {
    var especialidades = String(vet.especialidades || "")
      .split(/[,;]/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean)
      .map(function (s) {
        return "<span>" + Recopa.esc(s) + "</span>";
      })
      .join("");

    var foto = vet.foto
      ? '<img src="' + Recopa.esc(vet.foto) + '" alt="' + Recopa.esc(vet.nome) + '" loading="lazy">'
      : '<div class="vet-iniciais" aria-hidden="true">' + Recopa.esc(iniciais(vet.nome)) + "</div>";

    return (
      '<article class="vet">' +
      '<div class="vet-foto">' + foto + "</div>" +
      '<div class="vet-corpo">' +
      "<h3>" + Recopa.esc(vet.nome) + "</h3>" +
      '<p class="vet-cargo">' + Recopa.esc(vet.cargo) + "</p>" +
      (vet.crmv ? '<span class="vet-crmv">' + Recopa.esc(vet.crmv) + "</span>" : "") +
      '<div class="etiquetas">' + especialidades + "</div>" +
      "</div>" +
      "</article>"
    );
  }

  Recopa.dados.then(function (d) {
    lista.innerHTML = d.equipe.map(card).join("");
  });
})();

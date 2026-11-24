/**
 * DADOS PADRÃO DO SITE
 * --------------------------------------------------------------------------
 * Usados quando a planilha do Google não está configurada ou não responde.
 * O formato é o mesmo que a planilha envia (mesmos nomes de campos), então
 * qualquer item daqui pode ser copiado para a planilha e vice-versa.
 *
 * Atenção: os preços dos produtos são EXEMPLOS.
 */
window.RECOPA_PADRAO = {
  /* Códigos usados no HTML: data-wa="loja1|loja2|hospital", data-mail="petshop|hospital" */
  contatos: {
    whatsapp_loja1: "69992734320",
    whatsapp_loja2: "69993899461",
    whatsapp_hospital: "6993272099", // CONFERIR: parece faltar o 9 (69 99327-2099?)
    email_petshop: "recopapet@hotmail.com",
    email_hospital: "hospitalrecopa@gmail.com",
    instagram: "https://www.instagram.com/recopapetshop/",
    facebook: "https://www.facebook.com/recopapetshop",
  },

  /* Carrossel da página inicial (1600 x 400 px) */
  banners: [
    { img: "img/banners/01-marca.webp", link: "", alt: "Recopa – Pet shop, banho e tosa e hospital veterinário 24 horas" },
    { img: "img/banners/02-banho-ilimitado.webp", link: "petshop.html#banho", alt: "Banho ilimitado – planos a partir de R$ 139,90" },
    { img: "img/banners/03-hospital-24h.webp", link: "hospital.html", alt: "Hospital veterinário 24 horas – plantão todos os dias" },
    { img: "img/banners/04-transporte-pet.webp", link: "index.html#transporte", alt: "Transporte pet em carro elétrico e climatizado" },
  ],

  /* Planos de banho ilimitado (valores enviados pela Recopa) */
  planos: [
    { nome: "Banho ilimitado", porte: "Cães até 2 kg", valor: "139,90", periodo: "", observacao: "Tosas e transporte não inclusos" },
    { nome: "Banho ilimitado", porte: "Cães e gatos de 2 a 10 kg", valor: "189,90", periodo: "", observacao: "Tosas e transporte não inclusos" },
    { nome: "Banho ilimitado", porte: "Cães de 11 a 20 kg", valor: "239,90", periodo: "", observacao: "Tosas e transporte não inclusos" },
    { nome: "Banho ilimitado", porte: "Cães de 20 a 40 kg", valor: "289,90", periodo: "", observacao: "Tosas e transporte não inclusos" },
    { nome: "Banho ilimitado", porte: "Cães acima de 40 kg", valor: "390,00", periodo: "", observacao: "Tosas e transporte não inclusos" },
  ],

  /* Equipe veterinária */
  equipe: [
    { nome: "[Nome do(a) veterinário(a)]", cargo: "Médica-veterinária · Clínica geral e internação", crmv: "CRMV-RO [nº]", especialidades: "Clínica geral, Internação, Plantão 24h", foto: "" },
    { nome: "[Nome do(a) veterinário(a)]", cargo: "Médico-veterinário · Cirurgia e anestesia", crmv: "CRMV-RO [nº]", especialidades: "Cirurgia, Anestesia, Emergência", foto: "" },
  ],

  /*
   * Produtos da loja.
   * icone: bag, can, bone, bottle, pad, sack, brush, collar, bed, bowl, ball, tower
   * (usado quando não há foto).
   */
  produtos: [
    { categoria: "Alimentação", subcategoria: "Ração para cães", nome: "Ração premium cães adultos 15 kg", preco: "219,90", destaque: "Mais vendido", icone: "bag" },
    { categoria: "Alimentação", subcategoria: "Ração para cães", nome: "Ração filhotes raças pequenas 3 kg", preco: "74,90", icone: "bag" },
    { categoria: "Alimentação", subcategoria: "Ração para cães", nome: "Ração cães sênior 10 kg", preco: "169,90", icone: "bag" },
    { categoria: "Alimentação", subcategoria: "Ração para gatos", nome: "Ração gatos castrados 3 kg", preco: "89,90", icone: "bag" },
    { categoria: "Alimentação", subcategoria: "Ração para gatos", nome: "Ração gatos filhotes 1 kg", preco: "39,90", icone: "bag" },
    { categoria: "Alimentação", subcategoria: "Petiscos", nome: "Bifinho natural de frango 250 g", preco: "22,90", icone: "bone" },
    { categoria: "Alimentação", subcategoria: "Petiscos", nome: "Osso de couro para cães", preco: "14,90", icone: "bone" },
    { categoria: "Alimentação", subcategoria: "Sachês e úmidos", nome: "Sachê gatos sabor salmão (caixa c/ 12)", preco: "38,90", icone: "can" },
    { categoria: "Alimentação", subcategoria: "Sachês e úmidos", nome: "Patê cães adultos 280 g", preco: "9,90", icone: "can" },
    { categoria: "Higiene", subcategoria: "Shampoo e condicionador", nome: "Shampoo neutro 500 ml", preco: "29,90", icone: "bottle" },
    { categoria: "Higiene", subcategoria: "Shampoo e condicionador", nome: "Condicionador pelos longos 500 ml", preco: "32,90", icone: "bottle" },
    { categoria: "Higiene", subcategoria: "Tapetes higiênicos", nome: "Tapete higiênico 60x60 (30 un.)", preco: "54,90", destaque: "Oferta", icone: "pad" },
    { categoria: "Higiene", subcategoria: "Areia para gatos", nome: "Areia sanitária grãos finos 4 kg", preco: "24,90", icone: "sack" },
    { categoria: "Higiene", subcategoria: "Areia para gatos", nome: "Areia de sílica 1,6 kg", preco: "34,90", icone: "sack" },
    { categoria: "Higiene", subcategoria: "Higiene bucal", nome: "Kit escova + creme dental pet", preco: "27,90", icone: "brush" },
    { categoria: "Acessórios", subcategoria: "Coleiras e guias", nome: "Coleira peitoral ajustável M", preco: "49,90", icone: "collar" },
    { categoria: "Acessórios", subcategoria: "Coleiras e guias", nome: "Guia de nylon 1,2 m", preco: "29,90", icone: "collar" },
    { categoria: "Acessórios", subcategoria: "Camas e caminhas", nome: "Caminha redonda antiestresse M", preco: "129,90", icone: "bed" },
    { categoria: "Acessórios", subcategoria: "Comedouros e bebedouros", nome: "Comedouro inox 500 ml", preco: "24,90", icone: "bowl" },
    { categoria: "Acessórios", subcategoria: "Comedouros e bebedouros", nome: "Bebedouro fonte para gatos", preco: "119,90", icone: "bowl" },
    { categoria: "Acessórios", subcategoria: "Brinquedos", nome: "Bolinha resistente com som", preco: "19,90", icone: "ball" },
    { categoria: "Acessórios", subcategoria: "Brinquedos", nome: "Arranhador torre para gatos", preco: "139,90", icone: "tower" },
  ],
};

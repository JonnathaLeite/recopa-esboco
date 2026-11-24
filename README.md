# Recopa · Petshop e Hospital Veterinário 24h

Site estático (HTML, CSS e JavaScript puros, sem framework e sem etapa de build) da Recopa, em Ji-Paraná/RO.
Funciona em qualquer hospedagem comum (Hostinger, HostGator, GitHub Pages…): basta enviar os arquivos.

## Estrutura

```
index.html          Página inicial (banners, apresentação, atalhos, transporte, aplicativo)
petshop.html        Planos de banho ilimitado e loja com carrinho
hospital.html       Procedimentos, equipe veterinária e "Como chegar" (mapa, Maps, Waze)
css/style.css       Todo o visual, organizado em seções numeradas (veja o índice no topo)
js/config.js        Configuração: link da planilha do Google, cache e tempo dos banners
js/dados-padrao.js  Dados de reserva (contatos, banners, planos, equipe, produtos)
js/site.js          Núcleo: utilidades, carregamento dos dados, contatos, rodapé, mapa
js/banners.js       Carrossel da página inicial
js/planos.js        Cards dos planos de banho
js/loja.js          Catálogo, filtros, busca, ordenação e carrinho
js/equipe.js        Cards da equipe veterinária
img/                Imagens; img/icones.svg reúne todos os ícones
testes/testar.py    Testes automáticos
```

## Como os dados funcionam

1. `js/site.js` busca a planilha do Google (`apiUrl` em `js/config.js`).
2. Cada parte que vier vazia ou com erro usa `js/dados-padrao.js`, então o site nunca fica em branco.
3. Linhas com **Ativo = não** são ignoradas.
4. Os dados ficam em cache no navegador por `cacheMinutos`.

Os campos têm os mesmos nomes na planilha e em `dados-padrao.js`:

| Parte | Campos |
|---|---|
| contatos | `whatsapp_loja1`, `whatsapp_loja2`, `whatsapp_hospital`, `email_petshop`, `email_hospital`, `instagram`, `facebook` |
| banners | `img`, `link`, `alt` (link `whatsapp:loja1` vira o WhatsApp da loja) |
| planos | `nome`, `porte`, `valor`, `periodo`, `observacao` |
| equipe | `nome`, `cargo`, `crmv`, `especialidades` (separadas por vírgula), `foto` |
| produtos | `categoria`, `subcategoria`, `nome`, `preco`, `destaque`, `foto`, `icone` |

Links de contato no HTML usam atributos que o `site.js` preenche com os dados atuais:
`data-wa="loja1|loja2|hospital"` (+ `data-msg`), `data-tel`, `data-mail="petshop|hospital"`, `data-rede="instagram|facebook"`.

## Convenções

- Classes em português, com prefixo do componente (`plano-preco`, `carrinho-item`); estados com `is-` (`is-aberto`, `is-ativo`).
- Ícones: `<svg class="icone"><use href="img/icones.svg#nome"></use></svg>`.
- JavaScript em funções isoladas com `"use strict"`; o único objeto global é `Recopa`.
- Pontos de quebra do CSS: 1100, 1000, 900 (tablet), 680 (celular), 389 e 370 px.
- **Ao publicar uma mudança**, troque o `?v=` dos arquivos CSS/JS no `<head>` das três páginas, para os navegadores baixarem a versão nova.

## Testes

```
pip install playwright
python -m playwright install chromium
python testes/testar.py
```

Os 60 testes conferem arquivos e ícones, 8 larguras de tela (360 a 1920 px), todos os links, acessibilidade básica,
carrossel, loja, carrinho, rodapé, mapa e o funcionamento com a planilha (inclusive fora do ar).

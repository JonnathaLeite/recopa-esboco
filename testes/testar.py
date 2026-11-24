"""
TESTES AUTOMÁTICOS DO SITE DA RECOPA
=====================================================================
Abre o site num navegador de verdade (Chromium, via Playwright) e confere:

  1. Arquivos      – tudo o que o HTML/CSS usa existe; ícones do sprite existem;
                     JavaScript sem erro de sintaxe
  2. Telas         – 8 larguras (celular pequeno ao monitor grande): nada vaza
                     para o lado, menu cabe inteiro, imagens carregam, sem erros
  3. Links         – WhatsApp, telefone, e-mail, âncoras internas, links externos
  4. Acessibilidade básica – alt nas imagens, nome em botões, um h1 por página
  5. Funções       – carrossel, filtros da loja, busca, ordenação, "ver mais",
                     carrinho, rodapé recolhível, planos, equipe, mapa
  6. Planilha      – simula a planilha do Google (preço alterado, produto inativo,
                     categoria nova, contatos novos, banners do Drive) e também
                     a planilha fora do ar

Como rodar (na pasta do site):
    pip install playwright
    python -m playwright install chromium
    python testes/testar.py
"""

import functools
import http.server
import json
import os
import re
import socketserver
import subprocess
import sys
import threading
from urllib.parse import parse_qs, unquote, urlparse

from playwright.sync_api import sync_playwright

PASTA = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
PORTA = 8765
BASE = f"http://127.0.0.1:{PORTA}"
PAGINAS = ["index", "petshop", "hospital", "privacidade"]
LARGURAS = [360, 375, 390, 414, 768, 1024, 1366, 1920]
FONTES_LOCAIS = os.environ.get("FONTES_LOCAIS", "")  # opcional: pasta @fontsource

resultados = []


def checar(nome, ok, detalhe=""):
    resultados.append((nome, bool(ok), detalhe))
    print(("  OK   " if ok else "  FALHA ") + nome + ("" if ok or not detalhe else f"  →  {detalhe}"))


# ---------------------------------------------------------------------------
# Servidor local (igual a uma hospedagem)
# ---------------------------------------------------------------------------
class _Silencioso(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *args):
        pass


def iniciar_servidor():
    handler = functools.partial(_Silencioso, directory=PASTA)
    socketserver.ThreadingTCPServer.allow_reuse_address = True
    servidor = socketserver.ThreadingTCPServer(("127.0.0.1", PORTA), handler)
    threading.Thread(target=servidor.serve_forever, daemon=True).start()
    return servidor


def rotas(pagina, config_api=None, resposta_api=None):
    """Bloqueia a internet (os testes não dependem dela) e simula a planilha quando pedido."""

    def tratar(route):
        url = route.request.url
        if url.startswith(BASE + "/js/config.js") and config_api is not None:
            route.fulfill(body='window.RECOPA_CONFIG={apiUrl:"%s",cacheMinutos:0,tempoBanner:5};' % config_api,
                          content_type="text/javascript")
        elif url.startswith("https://api.teste") and resposta_api is not None:
            status, corpo = resposta_api
            route.fulfill(status=status, body=corpo, content_type="application/json",
                          headers={"Access-Control-Allow-Origin": "*"})
        elif url.startswith(BASE):
            route.continue_()
        elif "fonts.googleapis.com/css2" in url and FONTES_LOCAIS:
            css = []
            for fam, pasta, pesos in [("Poppins", "poppins", [500, 600, 700, 800]), ("Inter", "inter", [400, 500, 600, 700])]:
                for p in pesos:
                    css.append("@font-face{font-family:'%s';font-weight:%d;src:url(https://fontes.teste/%s/files/%s-latin-%d-normal.woff2)}" % (fam, p, pasta, pasta, p))
            route.fulfill(body="\n".join(css), content_type="text/css")
        elif url.startswith("https://fontes.teste") and FONTES_LOCAIS:
            route.fulfill(path=url.replace("https://fontes.teste", FONTES_LOCAIS), content_type="font/woff2",
                          headers={"Access-Control-Allow-Origin": "*"})
        else:
            route.abort()

    pagina.route("**/*", tratar)


# ---------------------------------------------------------------------------
# 1. Arquivos
# ---------------------------------------------------------------------------
def testar_arquivos():
    print("\n1. Arquivos")
    sprite = open(os.path.join(PASTA, "img/icones.svg"), encoding="utf-8").read()
    ids_sprite = set(re.findall(r'<symbol id="([\w-]+)"', sprite))
    faltando, icones_faltando = [], []
    for nome in PAGINAS:
        html = open(os.path.join(PASTA, f"{nome}.html"), encoding="utf-8").read()
        for ref in re.findall(r'(?:src|href)="([^"#?]+)', html):
            if not re.match(r"^(https?:|mailto:|tel:)", ref) and not os.path.exists(os.path.join(PASTA, ref)):
                faltando.append(f"{nome}: {ref}")
        for icone in re.findall(r'icones\.svg#([\w-]+)', html):
            if icone not in ids_sprite:
                icones_faltando.append(f"{nome}: {icone}")
    for js in sorted(os.listdir(os.path.join(PASTA, "js"))):
        texto = open(os.path.join(PASTA, "js", js), encoding="utf-8").read()
        for ref in re.findall(r'"(img/[^"]+)"', texto):
            if not os.path.exists(os.path.join(PASTA, ref)):
                faltando.append(f"{js}: {ref}")
    checar("todos os arquivos usados existem", not faltando, ", ".join(faltando))
    checar("todos os ícones usados existem no sprite", not icones_faltando, ", ".join(icones_faltando))

    erros_js = []
    for js in sorted(os.listdir(os.path.join(PASTA, "js"))):
        r = subprocess.run(["node", "--check", os.path.join(PASTA, "js", js)], capture_output=True, text=True)
        if r.returncode:
            erros_js.append(f"{js}: {r.stderr.strip().splitlines()[-1]}")
    checar("JavaScript sem erro de sintaxe", not erros_js, "; ".join(erros_js))


# ---------------------------------------------------------------------------
# 2. Telas
# ---------------------------------------------------------------------------
VERIFICAR_TELA = """() => {
  const W = document.documentElement.clientWidth;
  const vazando = [];
  document.querySelectorAll('body *').forEach(el => {
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height || getComputedStyle(el).position === 'fixed') return;
    if (el.closest('.carrossel-trilho, .carrinho, .procedimentos, .capa, .pular')) return;
    if (r.right > W + 0.5 || r.left < -0.5) vazando.push((el.className || el.tagName) + '');
  });
  const menu = document.querySelector('.menu');
  const quebradas = [...document.images].filter(i => i.complete && !i.naturalWidth && i.getAttribute('src'))
                                         .map(i => i.getAttribute('src'));
  return {
    rolagemLateral: document.documentElement.scrollWidth > W,
    vazando: vazando.slice(0, 5),
    menuCortado: menu.scrollWidth > menu.clientWidth + 1,
    imagensQuebradas: quebradas,
  };
}"""


def testar_telas(navegador):
    print("\n2. Telas (" + ", ".join(map(str, LARGURAS)) + " px)")
    for largura in LARGURAS:
        celular = largura < 800
        ctx = navegador.new_context(viewport={"width": largura, "height": 900}, is_mobile=celular, has_touch=largura < 1100)
        pg = ctx.new_page()
        rotas(pg)
        erros = []
        pg.on("pageerror", lambda e: erros.append(str(e)))
        pg.on("console", lambda m: erros.append(m.text) if m.type == "error" else None)
        problemas = []
        for nome in PAGINAS:
            pg.goto(f"{BASE}/{nome}.html")
            pg.wait_for_load_state("networkidle")
            pg.wait_for_timeout(300)
            r = pg.evaluate(VERIFICAR_TELA)
            if r["rolagemLateral"] or r["vazando"]:
                problemas.append(f"{nome}: vaza {r['vazando']}")
            if r["menuCortado"]:
                problemas.append(f"{nome}: menu cortado")
            if r["imagensQuebradas"]:
                problemas.append(f"{nome}: imagens quebradas {r['imagensQuebradas']}")
        checar(f"{largura:>4} px: layout sem vazamentos, menu inteiro, imagens ok", not problemas, "; ".join(problemas))
        checar(f"{largura:>4} px: sem erros no console", not erros, "; ".join(erros[:3]))
        ctx.close()


# ---------------------------------------------------------------------------
# 3. Links  /  4. Acessibilidade
# ---------------------------------------------------------------------------
def testar_links_e_acessibilidade(navegador):
    print("\n3. Links")
    ctx = navegador.new_context(viewport={"width": 1366, "height": 900})
    pg = ctx.new_page()
    rotas(pg)
    ids, links, acess = {}, {}, {}
    for nome in PAGINAS:
        pg.goto(f"{BASE}/{nome}.html")
        pg.wait_for_load_state("networkidle")
        ids[nome] = set(pg.evaluate("[...document.querySelectorAll('[id]')].map(e => e.id)"))
        links[nome] = pg.evaluate("""[...document.querySelectorAll('a[href]')].map(a => ({
            texto: (a.textContent.trim() || a.getAttribute('aria-label') || '').slice(0, 40),
            href: a.getAttribute('href'), alvo: a.target, rel: a.rel }))""")
        acess[nome] = pg.evaluate("""() => ({
            semAlt: [...document.images].filter(i => !i.hasAttribute('alt')).map(i => i.src),
            botoesSemNome: [...document.querySelectorAll('button, a')].filter(b =>
                !(b.textContent.trim() || b.getAttribute('aria-label') ||
                  [...b.querySelectorAll('img')].some(i => i.alt.trim()))).map(b => b.outerHTML.slice(0, 60)),
            h1: document.querySelectorAll('h1').length,
            lang: document.documentElement.lang,
            camposSemRotulo: [...document.querySelectorAll('input:not([type=radio]), select')].filter(c =>
                !(c.getAttribute('aria-label') || (c.id && document.querySelector('label[for=' + c.id + ']')))).length })""")

    problemas, qtd = [], {"whatsapp": 0, "internos": 0, "externos": 0, "tel": 0, "email": 0}
    for nome, lista in links.items():
        for l in lista:
            href = l["href"]
            if href.startswith("https://wa.me/"):
                qtd["whatsapp"] += 1
                numero = re.match(r"https://wa.me/(\d+)", href).group(1)
                if not (12 <= len(numero) <= 13 and numero.startswith("55")):
                    problemas.append(f"{nome}: WhatsApp inválido {numero} ({l['texto']})")
            elif href.startswith("tel:"):
                qtd["tel"] += 1
            elif href.startswith("mailto:"):
                qtd["email"] += 1
                if not re.match(r"mailto:[^@\s]+@[^@\s]+\.\w+$", href):
                    problemas.append(f"{nome}: e-mail inválido {href}")
            elif href.startswith("http"):
                qtd["externos"] += 1
                if l["alvo"] != "_blank" or "noopener" not in l["rel"] or "noreferrer" not in l["rel"]:
                    problemas.append(f"{nome}: link externo sem nova aba/noopener noreferrer ({l['texto']})")
            else:
                qtd["internos"] += 1
                pagina, _, ancora = href.partition("#")
                pagina = pagina.replace(".html", "") or nome
                if pagina not in ids:
                    problemas.append(f"{nome}: página inexistente {href}")
                elif ancora and ancora not in ids[pagina]:
                    problemas.append(f"{nome}: âncora inexistente {href}")
    checar("todos os links válidos " + str(qtd), not problemas, "; ".join(problemas[:5]))

    print("\n4. Acessibilidade básica")
    for nome, a in acess.items():
        ok = not a["semAlt"] and not a["botoesSemNome"] and a["h1"] == 1 and a["lang"] == "pt-BR" and not a["camposSemRotulo"]
        checar(f"{nome}: alt em imagens, nome em botões, 1 h1, idioma, campos com rótulo", ok, json.dumps(a)[:200])
    ctx.close()


# ---------------------------------------------------------------------------
# 5. Funções
# ---------------------------------------------------------------------------
def parametro_texto(href):
    return unquote(parse_qs(urlparse(href).query).get("text", [""])[0]).replace("\xa0", " ")


def texto(pg, seletor):
    """Texto visível de um elemento (com o espaço especial do R$ normalizado)."""
    return pg.inner_text(seletor).replace("\xa0", " ")


def testar_funcoes(navegador):
    print("\n5. Funções")
    ctx = navegador.new_context(viewport={"width": 1366, "height": 900})
    pg = ctx.new_page()
    rotas(pg)

    # --- carrossel ---
    pg.goto(f"{BASE}/index.html")
    pg.wait_for_load_state("networkidle")
    posicao = lambda: pg.evaluate("document.querySelector('.carrossel-trilho').style.transform")
    slides = pg.locator(".carrossel-slide").count()
    pg.hover("#banners")
    pg.click(".carrossel-proximo"); a = posicao()
    pg.click(".carrossel-pontos button >> nth=3"); b = posicao()
    pg.click(".carrossel-anterior"); c = posicao()
    pg.focus(".carrossel-proximo"); pg.keyboard.press("ArrowRight"); d = posicao()
    checar("carrossel: 4 banners, setas, bolinhas e teclado",
           slides == 4 and a == "translateX(-100%)" and b == "translateX(-300%)" and c == "translateX(-200%)" and d == "translateX(-300%)",
           f"{slides} {a} {b} {c} {d}")
    pg.mouse.move(5, 880)
    pg.evaluate("document.querySelector('.carrossel-anterior').blur()")
    antes = posicao(); pg.wait_for_timeout(5600); depois = posicao()
    checar("carrossel: troca sozinho", antes != depois, f"{antes} → {depois}")

    # --- planos ---
    pg.goto(f"{BASE}/petshop.html")
    pg.wait_for_load_state("networkidle")
    planos = pg.evaluate("""[...document.querySelectorAll('.plano')].map(p => ({
        preco: p.querySelector('.plano-preco').textContent,
        links: [...p.querySelectorAll('a')].map(a => a.href) }))""")
    ok = len(planos) == 5 and all("5569992734320" in p["links"][0] and "5569993899461" in p["links"][1] for p in planos)
    checar("planos: 5 cards, cada um com as duas lojas", ok and planos[0]["preco"] == "R$139,90", str(planos[0]))
    checar("planos: mensagem do WhatsApp com plano e valor",
           "Cães até 2 kg (R$ 139,90)" in parametro_texto(planos[0]["links"][0]))

    # --- loja: filtros ---
    qtd = lambda: pg.locator(".produto").count()
    resultado = lambda: texto(pg, "#resultado")
    checar("loja: mostra 12 de 22 e botão 'ver mais'", qtd() == 12 and "22 itens" in resultado() and pg.is_visible("#ver-mais"))
    pg.click("#ver-mais")
    checar("loja: 'ver mais' mostra o resto e some", qtd() == 22 and not pg.is_visible("#ver-mais"))

    pg.click(".filtro-categoria >> nth=1")  # Higiene
    aberta = pg.get_attribute(".filtro-categoria >> nth=1", "aria-expanded")
    checar("filtro: categoria abre e filtra", aberta == "true" and qtd() == 6, f"{aberta} {qtd()}")
    pg.click(".filtro-categoria >> nth=1")
    fechada = pg.get_attribute(".filtro-categoria >> nth=1", "aria-expanded")
    checar("filtro: clicar de novo fecha a categoria e volta para todos", fechada == "false" and "22 itens" in resultado())
    pg.click(".filtro-categoria >> nth=0")
    pg.click(".filtro-categoria >> nth=1")
    abertas = pg.evaluate("[...document.querySelectorAll('.filtro-categoria')].filter(b => b.getAttribute('aria-expanded') === 'true').length")
    checar("filtro: só uma categoria aberta por vez", abertas == 1)
    pg.click(".filtro-sub:visible >> nth=2")  # Areia para gatos
    checar("filtro: subcategoria", qtd() == 2 and "Areia para gatos" in resultado(), resultado())
    pg.click(".filtro-todos")
    pg.fill("#busca", "racao")
    checar("busca: funciona sem acento ('racao' acha 'Ração')", qtd() == 5, str(qtd()))
    pg.fill("#busca", "xyzw")
    checar("busca: mensagem quando não acha nada", pg.is_visible(".vazio"))
    pg.fill("#busca", "")
    pg.select_option("#ordem", "menor")
    menor = texto(pg, ".produto-preco >> nth=0")
    pg.select_option("#ordem", "maior")
    maior = texto(pg, ".produto-preco >> nth=0")
    checar("ordenação: menor e maior preço", menor == "R$ 9,90" and maior == "R$ 219,90", f"{menor} / {maior}")
    pg.select_option("#ordem", "")

    # --- carrinho ---
    pg.evaluate("localStorage.clear()")
    pg.reload(); pg.wait_for_load_state("networkidle")
    pg.click("#abrir-carrinho"); pg.wait_for_timeout(400)
    vazio = pg.get_attribute("#finalizar", "aria-disabled")
    foco = pg.evaluate("document.activeElement.id")
    pg.keyboard.press("Escape"); pg.wait_for_timeout(400)
    checar("carrinho: vazio bloqueia o pedido, foco no fechar, ESC fecha",
           vazio == "true" and foco == "fechar-carrinho" and not pg.evaluate("document.getElementById('carrinho').classList.contains('is-aberto')"))
    pg.click(".produto-adicionar >> nth=0")
    pg.click(".produto-adicionar >> nth=1")
    pg.click(".produto-adicionar >> nth=1")
    checar("carrinho: aviso 'Adicionado ao carrinho'", pg.is_visible("#aviso-flutuante"))
    pg.click("#abrir-carrinho"); pg.wait_for_timeout(400)
    qtd_c = texto(pg, "#carrinho-qtd"); total = texto(pg, "#carrinho-total")
    checar("carrinho: soma quantidade e total", qtd_c == "3" and total == "R$ 369,70", f"{qtd_c} {total}")
    pg.click('.quantidade button[data-mudar="-1"] >> nth=1')
    checar("carrinho: diminuir quantidade", texto(pg, "#carrinho-qtd") == "2" and texto(pg, "#carrinho-total") == "R$ 294,80")
    href1 = pg.get_attribute("#finalizar", "href")
    pg.click(".unidade >> nth=1")
    href2 = pg.get_attribute("#finalizar", "href")
    msg = parametro_texto(href2)
    checar("carrinho: pedido vai para a loja escolhida",
           "wa.me/5569992734320" in href1 and "wa.me/5569993899461" in href2 and "2º Distrito" in msg, href2[:45])
    checar("carrinho: mensagem com itens e total", "1x Ração premium cães adultos 15 kg" in msg and "Total: R$ 294,80" in msg, msg[:120])
    pg.keyboard.press("Escape")
    pg.reload(); pg.wait_for_load_state("networkidle")
    checar("carrinho: continua salvo depois de recarregar", pg.inner_text("#carrinho-qtd") == "2")

    # --- hospital ---
    pg.goto(f"{BASE}/hospital.html")
    pg.wait_for_load_state("networkidle")
    vets = pg.locator(".vet").count()
    iframe = pg.get_attribute(".mapa iframe", "src") or ""
    waze = pg.get_attribute("a[href*='waze.com']", "href")
    urg = parametro_texto(pg.get_attribute(".botao.urgente >> nth=0", "href"))
    checar("hospital: equipe com 2 veterinários, sem botão de agenda", vets == 2 and not pg.locator("text=Consultar agenda").count())
    checar("hospital: mapa e Waze com as coordenadas do hospital", "-10.887957" in iframe and "-10.887957%2C-61.9301413" in waze, iframe[:60])
    checar("hospital: botão de urgência com mensagem", "urgência" in urg, urg)
    ctx.close()

    # --- celular: painel de categorias e rodapé ---
    ctx = navegador.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
    pg = ctx.new_page()
    rotas(pg)
    pg.goto(f"{BASE}/petshop.html")
    pg.wait_for_load_state("networkidle")
    checar("celular: 6 produtos por vez", pg.locator(".produto").count() == 6)
    lista_oculta = not pg.is_visible("#filtros-lista")
    pg.tap("#filtros-botao")
    lista_aberta = pg.is_visible("#filtros-lista")
    pg.tap(".filtro-categoria >> nth=0")
    pg.tap(".filtro-sub:visible >> nth=0")
    pg.wait_for_timeout(500)
    checar("celular: painel de categorias abre, filtra e recolhe sozinho",
           lista_oculta and lista_aberta and not pg.is_visible("#filtros-lista") and pg.inner_text("#filtro-atual") == "Ração para cães")
    fechadas = pg.evaluate("[...document.querySelectorAll('details.rodape-col')].every(d => !d.open)")
    pg.tap("details.rodape-col >> nth=0 >> summary")
    abriu = pg.evaluate("document.querySelector('details.rodape-col').open")
    checar("celular: rodapé começa recolhido e abre ao tocar", fechadas and abriu)
    ctx.close()

    # --- movimento reduzido ---
    ctx = navegador.new_context(viewport={"width": 1366, "height": 900}, reduced_motion="reduce")
    pg = ctx.new_page()
    rotas(pg)
    pg.goto(f"{BASE}/index.html")
    pg.wait_for_load_state("networkidle")
    antes = pg.evaluate("document.querySelector('.carrossel-trilho').style.transform")
    pg.wait_for_timeout(5600)
    depois = pg.evaluate("document.querySelector('.carrossel-trilho').style.transform")
    checar("'reduzir movimento' do sistema: carrossel não troca sozinho", antes == depois)
    ctx.close()


# ---------------------------------------------------------------------------
# 6. Planilha simulada
# ---------------------------------------------------------------------------
def planilha_simulada():
    sys.path.insert(0, PASTA)
    padrao_js = open(os.path.join(PASTA, "js/dados-padrao.js"), encoding="utf-8").read()
    dados = json.loads(subprocess.run(
        ["node", "-e", "global.window={};" + padrao_js + ";console.log(JSON.stringify(window.RECOPA_PADRAO))"],
        capture_output=True, text=True).stdout)
    dados["produtos"][0]["preco"] = "199,90"                    # preço alterado
    dados["produtos"][1]["ativo"] = "não"                       # produto desativado
    dados["produtos"].append({"ativo": "sim", "categoria": "Saúde", "subcategoria": "Antipulgas",
                              "nome": "Antipulgas cães 10-25 kg", "preco": "89,90", "destaque": "Promoção"})
    dados["planos"][0]["valor"] = "149,90"
    for p in dados["planos"]:
        p["periodo"] = "mês"
    dados["equipe"][0].update({"nome": "Dra. Ana Souza", "crmv": "CRMV-RO 1234"})
    dados["contatos"] = {"whatsapp_hospital": "69993272099"}  # só o que mudou; o resto vem do padrão
    dados["banners"] = [{"img": "img/banners/03-hospital-24h.webp", "link": "whatsapp:loja2", "alt": "Teste"}]
    return json.dumps(dados, ensure_ascii=False)


def testar_planilha(navegador):
    print("\n6. Planilha do Google (simulada)")
    ctx = navegador.new_context(viewport={"width": 1366, "height": 900})
    pg = ctx.new_page()
    rotas(pg, config_api="https://api.teste/recopa", resposta_api=(200, planilha_simulada()))

    pg.goto(f"{BASE}/petshop.html")
    pg.wait_for_load_state("networkidle")
    nomes = pg.evaluate("[...document.querySelectorAll('.produto h3')].map(h => h.textContent)")
    precos = pg.evaluate("[...document.querySelectorAll('.produto-preco')].map(h => h.textContent.replace(/\\u00a0/g, ' '))")
    categorias = pg.evaluate("[...document.querySelectorAll('.filtro-categoria span:first-child')].map(s => s.textContent)")
    plano = pg.inner_text(".plano-preco >> nth=0")
    checar("preço alterado na planilha aparece no site", precos[0] == "R$ 199,90", precos[0])
    checar("produto com Ativo = não some do site", "Ração filhotes raças pequenas 3 kg" not in nomes)
    checar("categoria nova aparece no menu da loja", "Saúde" in categorias, str(categorias))
    checar("plano com valor novo e '/mês'", "149,90" in plano and "/mês" in plano, plano)
    pg.goto(f"{BASE}/hospital.html")
    pg.wait_for_load_state("networkidle")
    checar("equipe: nome e CRMV da planilha", pg.inner_text(".vet h3 >> nth=0") == "Dra. Ana Souza")
    checar("contato alterado atualiza os botões do WhatsApp",
           "wa.me/5569993272099" in pg.get_attribute(".botao.urgente >> nth=0", "href"))
    checar("contato não informado continua com o padrão",
           pg.get_attribute("[data-mail=hospital] >> nth=0", "href") == "mailto:hospitalrecopa@gmail.com")
    pg.goto(f"{BASE}/index.html")
    pg.wait_for_load_state("networkidle")
    checar("banners da pasta do Drive substituem os padrão (link whatsapp:loja2)",
           pg.locator(".carrossel-slide").count() == 1 and "5569993899461" in pg.get_attribute(".carrossel-slide a", "href"))
    ctx.close()

    for descricao, resposta in [("fora do ar (erro 500)", (500, "erro")), ("resposta inválida", (200, "<html>"))]:
        ctx = navegador.new_context(viewport={"width": 1366, "height": 900})
        pg = ctx.new_page()
        rotas(pg, config_api="https://api.teste/recopa", resposta_api=resposta)
        pg.goto(f"{BASE}/petshop.html")
        pg.wait_for_load_state("networkidle")
        pg.wait_for_timeout(300)
        checar(f"planilha {descricao}: site usa os dados padrão",
               pg.locator(".produto").count() == 12 and pg.locator(".plano").count() == 5)
        ctx.close()


# ---------------------------------------------------------------------------
if __name__ == "__main__":
    servidor = iniciar_servidor()
    testar_arquivos()
    with sync_playwright() as p:
        navegador = p.chromium.launch()
        testar_telas(navegador)
        testar_links_e_acessibilidade(navegador)
        testar_funcoes(navegador)
        testar_planilha(navegador)
        navegador.close()
    servidor.shutdown()

    falhas = [r for r in resultados if not r[1]]
    print(f"\nResultado: {len(resultados) - len(falhas)} de {len(resultados)} testes passaram.")
    sys.exit(1 if falhas else 0)

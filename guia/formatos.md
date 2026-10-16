# Catálogo de formatos

Custo = só a matéria-prima da Higgsfield. O movimento é código e não custa crédito. Duração padrão: 6 a 15 s, grade de 120 BPM (1 batida = 0,5 s). Pesquisa de out/2026: estático barato valida o ângulo antes do vídeo; 4:5 rende mais no feed da Meta; vertical de até 15 s completa mais; testar 20+ variações por campanha.

## Qual formato pra qual produto

| Tipo de produto | Comece por |
|---|---|
| Moda e acessório (bolsa, tênis, relógio, joia) | vista explodida · giro 3D · macro · variantes · lançamento |
| Beleza e skincare | ingredientes · antes × depois · sensorial · como usar · macro de textura |
| Comida e bebida | sensorial · receita montando · variantes de sabor · oferta · splash (vídeo IA) |
| Eletrônico e gadget | giro 3D · hotspots · vista explodida · lançamento · nós × eles |
| Casa e decoração | cena viva · antes × depois · variantes · macro |
| App e SaaS | UI morph · problema → solução · prova social · como usar |
| Serviço (clínica, curso, consultoria, agência) | problema → solução · jornada · prova social · hook tipográfico · oferta · UGC (vídeo IA) |

## Qual formato pra qual etapa do funil

- **Parar o dedo (topo):** giro 3D, vista explodida, cena viva, hook tipográfico, lançamento, sensorial, macro.
- **Convencer (meio):** hotspots, ingredientes, nós × eles, antes × depois, como usar, jornada, receita.
- **Converter (fundo, remarketing):** oferta, prova social, o que vem na caixa, variantes.

## Animados em código

Cada um: o que é · matéria-prima (créditos) · o movimento.

1. **Vista explodida** (`motor/modelo-explodida.html`). O produto "abre" e as características saem dele, uma por batida, com fio e rótulo; voltam; CTA. · Produto sem fundo (0,25 + 1) + um elemento por característica, isolado e sem fundo (4 × 1,25) ≈ 6. · Entrada em mola → aperto (carimbo) → um elemento por batida → cada um ganha a sua batida de destaque → voltam → CTA.
2. **Giro 360** (`motor/modelo-giro-3d.html`). Volta completa num estúdio com reflexo e sombra; destaques aparecem quando o lado deles vira pra câmera. Loop perfeito. · GLB `tripo_h3_1_image_to_3d` (9) a partir da melhor foto de frente, sem fundo. · Uma volta por duração, câmera respira, destaques por ângulo. Sem GLB: balanço de ±12° com parallax de camadas (nível 3).
3. **Hotspots / anatomia.** Produto parado; pontos pulsam sobre ele; a câmera mergulha em cada ponto e abre um cartão com a característica. · Uma foto 2k do produto (1). · Câmera num container com segmentos [t, zoom, x, y], zoom interpolado em escala log; um ponto por compasso.
4. **Macro.** Da foto inteira até o detalhe (couro, costura, textura do creme), com uma frase por detalhe. · Foto 2k + 2 ou 3 closes gerados com a foto como referência (1 cada) ≈ 4. · Zoom contínuo que troca pro close no meio do movimento (a costura da foto inteira vira a costura do close).
5. **Ingredientes.** Ingredientes recortados orbitam o frasco e entram nele um a um; nome e benefício de cada um. · Frasco sem fundo (1,25) + 3 a 5 ingredientes isolados sem fundo (1,25 cada) ≈ 6. · Órbita elíptica com profundidade (escala e z-index pela fase), cada um sai da órbita numa batida e mergulha com carimbo no frasco.
6. **Antes × depois.** A mesma cena em dois estados; uma cortina varre de um pro outro, volta, varre de novo. · Duas imagens da MESMA cena mudando uma variável (0,5 a 2). · Cortina com mola, rótulos ANTES/DEPOIS presos à borda, número do resultado entra no fim.
7. **Problema → solução.** A dor em tipografia cinética, ela "quebra", o produto entra como resposta. · Produto sem fundo (1,25) + opcional uma cena do problema (0,25). · Palavras na batida com máscara; no drop, uma forma inunda a tela e encolhe no produto.
8. **Nós × eles.** Tabela de comparação que se monta linha por linha; ✓ e ✗ no ritmo. · Produto sem fundo (1,25); o "deles" é genérico, nunca marca real. · Linha por batida, o nosso lado acende na cor de destaque, a última linha é a mais forte.
9. **O que vem na caixa.** A caixa abre em camadas, o produto sobe, os itens do kit se espalham em grade com nome. · Caixa (0,25 + 1) + cada item sem fundo (1,25 cada). · Tampa em perspectiva CSS, itens saem com mola e assentam na grade, preço/CTA no fim.
10. **Variantes.** O mesmo produto troca de cor, sabor ou estampa a cada batida, no mesmo lugar. · Uma imagem por variante com o MESMO enquadramento (gerar a partir da primeira como `--image`; 0,25 cada). · Corte seco na batida com pop pequeno, nome da variante em máscara, fundo muda pra cor dela.
11. **Oferta.** Preço velho riscado, preço novo com mola, selo, frete, prazo. Pra remarketing. · Produto sem fundo (1,25). · Contador que desce até o preço, risco desenhado, selo carimba, CTA pulsa uma vez.
12. **Prova social.** Estrelas que enchem, cartões de avaliação que sobem, contador de clientes. Só com dados reais. · Produto (1,25) + opcional fotos de "cliente" sem rosto reconhecível (0,25 cada). · Cartões em pilha que empurram um ao outro, número cresce com easing.
13. **Como usar (1-2-3).** Três passos, número gigante, uma cena por passo, a forma de um passo vira a do próximo. · Três cenas com o produto (0,25 a 1 cada). · Número desenha, cena entra por máscara do próprio número.
14. **Sensorial.** A cena em camadas com parallax lento e palavras de textura, cheiro ou sabor entrando no ritmo ("crocante. quente. 3 queijos."). · Cena lifestyle (1) + `image_decompose` (2). · Parallax 2.5D, palavras em serifa grande, uma por batida, luz que respira.
15. **Cena viva (cinemagraph).** Foto lifestyle em camadas, tudo quase parado, uma coisa se move (luz, vapor, folha). Loop perfeito pro feed. · Cena (1) + `image_decompose` (2). · `A.parallax` + um elemento em `A.sino`; quadro final = quadro 0.
16. **Lançamento / teaser.** Escuro, luz rasante revela o produto aos poucos, nome surge, data. · Produto no escuro com luz lateral (1). · Máscara de luz (gradiente radial que anda), nome letra por letra, data no fim.
17. **UI morph (app, SaaS, serviço digital).** Uma forma só vira todos os estados da interface; um cursor clica, digita e arrasta. Receita do repo awesome-opus5-5-videos. · Zero créditos (é tudo código) ou prints reais da interface. · Molas somadas por mudança, conteúdo entra depois que o container começa a mudar, último quadro = primeiro.
18. **Jornada (serviço).** Do antes ao resultado em 4 a 6 cenas: ícones, pessoa sem rosto, o resultado em número. · 3 a 5 cenas (0,25 cada) ou nenhuma (ícones em SVG). · Uma linha contínua (o caminho) que atravessa as cenas e liga tudo.
19. **Hook tipográfico.** Palavra por palavra na batida, a frase forte ocupa a tela, o produto pontua o fim. · Produto sem fundo (1,25). · Máscaras, uma palavra gigante, trocas de fundo no ritmo.
20. **Vídeo IA + código.** Um clipe curto de IA (pessoa usando, líquido, tecido) como camada, com legenda, callouts e marca desenhados pelo motor por cima. · `kling3_0_turbo` 5 s (7,5) ou `seedance_2_5` (15+), a partir de uma estática aprovada. · O clipe vira sequência de JPEG (`ffmpeg -i clip.mp4 -vf fps=30 q/%04d.jpg`) e o `seek(t)` troca o `src` por quadro.

## Estáticos

| Formato | Rota (nível 1 → 2) |
|---|---|
| Herói com benefício (uma frase, um produto) | `gpt_image_2_5` com espaço vazio pro texto · texto no código (screenshot do HTML) ou no prompt |
| Antes × depois | mesma cena, uma variável, duas gerações |
| Nós × eles | produto sem fundo + tabela em HTML (`render.mjs --quadro 0`) |
| Anatomia (características com fios) | o quadro final da vista explodida (`--quadro <t>`) |
| Depoimento sobre foto | cena lifestyle + citação real em HTML |
| Oferta | produto sem fundo + preço em HTML |
| O que vem na caixa (flat lay) | `product-photoshoot --mode product_shot` com todos os itens |
| Lifestyle | `product-photoshoot --mode lifestyle_scene` |
| Conceitual / CGI (flutuando, splash) | `product-photoshoot --mode conceptual_product` |
| Nativo / "feio" (post-it, print de conversa, nota no celular) | HTML puro imitando a interface; parece post, não anúncio |
| Card de marketplace | skill `higgsfield-marketplace-cards` |

Estático em HTML: monte a peça como um "vídeo" de duração 0 e exporte com `node motor/render.mjs <html> --quadro 0`. Mesmo motor, mesmas proporções, texto perfeito.

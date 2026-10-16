# Linhas editoriais

Uma linha editorial é o visual inteiro: cor, fonte, como a imagem é feita, como as coisas se mexem e o que é proibido. Escolha uma por vídeo (ou por série). Mistura vira genérico. Se a marca tem identidade própria (cores, fontes), ela substitui só os tokens; o resto da linha fica.

Fontes locais em `motor/fontes/` (Geist, Geist Mono, DM Serif Display). Outra fonte: baixe o .ttf/.woff2 do Google Fonts pra `motor/fontes/` e declare um `@font-face` no HTML.

---

## 1. Keynote
**Sentimento:** preciso, caro, inevitável. Pra gadget, app, produto com design forte.
- **Tokens:** fundo `#F5F5F2` (ou `#0E0E10` na versão escura) · tinta `#0E0E10` · um acento só (da marca).
- **Tipo:** Geist 700 a 800, tracking -0.04em, frases curtas sem ponto final.
- **Imagem:** produto em estúdio, fundo contínuo, luz grande e suave, sombra de contato. Prompt: "fundo infinito cinza-claro, softbox grande à esquerda, sombra de contato suave, 85 mm".
- **Movimento:** uma forma vira a próxima (nada some e aparece), molas com sobrepasso mínimo, um movimento de câmera por cena, nunca zoom de ida e volta seguido. Texto sobe de uma linha de máscara.
- **Proibido:** crossfade, desfoque de entrada, partículas, brilho, câmera tremendo, espera de mais de 1 s.

## 2. Editorial
**Sentimento:** revista, autoral, com mundo. Pra moda, decoração, marca com história. (É o padrão aprovado do projeto antigo.)
- **Tokens:** papel `#EDE9E1` · marinho `#181D26` · tinta `#15130F` · laranja `#F2511F` · creme `#FBF4E8`.
- **Tipo:** Geist 800 pros nomes e números + DM Serif itálica na palavra-assinatura (uma por tela) + Geist Mono no rodapé.
- **Imagem:** produto num mundo real e inesperado, golden hour, Kodak Portra, horizonte baixo, três camadas (algo fora de foco na frente). Prova em par (a mesma cena mudando uma variável).
- **Movimento:** lento e firme, máscaras de texto, cortes secos na batida, parallax leve nas fotos.
- **Proibido:** degradê de tela cheia, neon, paleta "bonitinha" com foto fraca, mais de uma palavra gigante por tela.

## 3. DTC bold
**Sentimento:** alto, direto, impossível de ignorar. Pra oferta, consumo rápido, comida, suplemento.
- **Tokens:** duas cores chapadas saturadas que brigam bem (ex.: `#FF4A1C` + `#1C1CFF`, ou a cor da embalagem + o oposto dela) · branco · preto.
- **Tipo:** Geist 900 em caixa alta, gigante, ocupando a largura; selos e etiquetas giradas.
- **Imagem:** produto recortado com sombra dura, ângulo heroico de baixo, fundo chapado da cor da marca.
- **Movimento:** rápido, carimbo no impacto, pop, troca de fundo a cada batida, palavra por batida.
- **Proibido:** serifa delicada, espaço vazio de sobra, movimento lento, mais de três cores.

## 4. Luxo escuro
**Sentimento:** silencioso, raro. Pra perfume, joia, bebida premium, tratamento estético.
- **Tokens:** quase-preto `#0B0B0C` · grafite `#1A1A1C` · champanhe fosco `#C9B79C` · marfim `#EFE9DF`.
- **Tipo:** DM Serif regular (ou uma serifa didone) em minúsculas, muito espaço entre letras no rótulo pequeno.
- **Imagem:** produto sobre pedra, vidro ou tecido escuro, luz rasante de um lado só, reflexo controlado. Prompt: "luz rasante lateral, fundo preto, reflexo em superfície de obsidiana, 100 mm macro".
- **Movimento:** muito lento, `inOutC` longo, revelação pela luz (máscara radial que anda), uma frase por vez.
- **Proibido:** pop, carimbo, cores vivas, caixa alta gritada, brilho estourado, dourado metálico de clip-art.

## 5. Colagem
**Sentimento:** feito à mão, divertido, humano. Pra marca jovem, alimento artesanal, criador.
- **Tokens:** papel kraft ou creme · 2 cores de tinta · branco das bordas de recorte.
- **Tipo:** uma grotesk pesada + uma manuscrita ou mono em etiquetas.
- **Imagem:** recortes com borda branca e sombra curta, fita adesiva, texturas de papel; produto e elementos sempre como recortes sem fundo.
- **Movimento:** stop-motion: os elementos andam a 12 quadros por segundo (`Math.floor(t * 12) / 12`) com rotação levemente aleatória e determinística (`A.rand(i)`), o fundo fica parado.
- **Proibido:** acabamento polido, molas suaves, 3D, gradiente.

## 6. Clínico
**Sentimento:** confiança, evidência. Pra skincare com ativo, saúde, suplemento, tecnologia.
- **Tokens:** branco `#FAFBFC` · cinza-azulado `#E6EBF0` · tinta `#0F1A24` · um acento clínico (azul `#2F6BFF` ou verde `#1FA37A`).
- **Tipo:** Geist 600 + Geist Mono pros números, porcentagens e nomes de ativos.
- **Imagem:** produto em fundo claro com gotas, vidro de laboratório ou textura do ativo em macro.
- **Movimento:** preciso: linhas que se desenham, contadores, diagramas que se montam, setas, hotspots.
- **Proibido:** dado sem fonte, promessa médica, emoção exagerada, cor quente dominante.

## 7. Nativo
**Sentimento:** "isso não é anúncio, é um post". Pra UGC, serviço, prova social, remarketing.
- **Tokens:** os da própria plataforma: legenda em caixa branca e texto preto (estilo TikTok/Reels), sem moldura de marca.
- **Tipo:** a fonte da plataforma (SF/Inter), tamanho de legenda.
- **Imagem:** foto "de celular": iPhone, flash direto, enquadramento torto, ambiente real (cozinha, carro, banheiro). Ou o clipe de vídeo IA da rota 5.
- **Movimento:** cortes rápidos, zoom de punch-in, legenda palavra por palavra no ritmo da fala.
- **Proibido:** acabamento de estúdio, logo grande, trilha épica.

## 8. Interface
**Sentimento:** produto digital funcionando de verdade. Pra app, SaaS, serviço online.
- **Tokens:** cinza quente `#F2F1EE` · UI preta `#0E0E10` · um acento da marca.
- **Tipo:** Geist (ou a fonte da própria interface).
- **Imagem:** a interface real (prints) desmontada em componentes; nenhuma foto obrigatória.
- **Movimento:** uma forma só que vira todos os estados; um cursor de verdade clica, digita e arrasta; a câmera dá zoom pra cada estado encher a tela; último quadro = primeiro.
- **Proibido:** mockup genérico de celular num degradê, dado falso, easing elástico, partículas, brilho na interface.

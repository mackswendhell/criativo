# Criativo · fábrica de criativos de produto (Higgsfield barato + motor de movimento em código)

A ideia: a Higgsfield entra só como **matéria-prima barata** (fotos a 0,25 crédito, recortes sem fundo, camadas, um GLB quando precisa girar de verdade) e o **movimento é escrito em código** (HTML + `seek(t)` + Playwright + ffmpeg). Resultado de estúdio de motion design com custo de rascunho. Vídeo de IA (Kling, Seedance) só quando o movimento é físico de verdade (pessoa, líquido, tecido).

Vale pra produto físico, app/SaaS, serviço, qualquer coisa que se venda.

## Primeiro uso (confira antes de qualquer pedido)

Se alguma coisa abaixo faltar, resolva antes de criar o projeto:

1. **Skills da Higgsfield:** se `higgsfield-generate` não está entre as skills da sessão, instale com `npx skills add higgsfield-ai/skills` (no Claude Code também serve `claude plugin marketplace add higgsfield-ai/skills` e `claude plugin install higgsfield@higgsfield`) e peça pra pessoa reiniciar o agente. Guia oficial: https://github.com/higgsfield-ai/skills/blob/main/INSTALL_FOR_AGENTS.md
2. **CLI e login:** `higgsfield account status` tem que mostrar e-mail, plano e créditos. Se o comando não existe, as skills instalam o CLI (ou `curl -fsSL https://raw.githubusercontent.com/higgsfield-ai/cli/main/install.sh | sh`). Se não está logado, peça pra pessoa rodar `higgsfield auth login` (abre o navegador; o agente não faz por ela).
3. **Motor:** sem `node_modules/` na raiz, rode `npm install`. Sem `ffmpeg`, `brew install ffmpeg`. O render usa o Google Chrome instalado.

## Onde está cada coisa

| Arquivo | O quê |
|---|---|
| `guia/formatos.md` | o catálogo: 20 formatos (estáticos e animados), por funil e por tipo de produto, com assets, custo e técnica de cada um |
| `guia/linhas.md` | as linhas editoriais (o visual inteiro: cor, fonte, luz, movimento, proibidos) |
| `guia/direcao.md` | prompt de imagem, preparo de camadas, copy, testes de aprovação, cara de IA |
| `guia/video.md` | as regras do motor (função pura de t, molas, grade de batida, câmera, som, revisão) |
| `motor/` | `anim.js` (molas, easing, batida, parallax), `render.mjs` (render, folha, som, loop), `base.css`, fontes, modelos prontos: `modelo-explodida.html`, `modelo-giro-3d.html` |
| `scripts/baixar-ig.py` | baixa um post/reel do Instagram como referência (cookies do Chrome logado) |
| `projetos/` | um projeto por pasta |

Skills da Higgsfield usadas como ferramenta (leia a da rota antes de rodar): `higgsfield-generate`, `higgsfield-product-photoshoot`, `higgsfield-marketplace-cards`, `higgsfield-soul-id`.

## Estrutura de um projeto

```
projetos/AAAA-MM-DD-nome/
  ref/         o que a pessoa trouxe (nunca sobrescrever) · produto.glb quando houver
  brief.md     produto, público, oferta, escolhas, prompts, créditos por geração, vencedoras
  assets/      saídas da Higgsfield: cenas, recortes (-sem-fundo.png), camadas, elementos
  estatico/    peças estáticas finais (estilo-formato-NN.png)
  video/       um HTML por vídeo + audio/ + os MP4 e folhas que o render cospe ao lado
```

Toda geração é baixada (`curl -sLo`) pra pasta. Nunca mexer em outro projeto.

## Fluxo

1. **Projeto.** Crie a pasta, copie a referência pra `ref/` (link do Instagram: `python3 scripts/baixar-ig.py URL --nome x --destino projetos/<p>/ref`). Abra a imagem e escreva no `brief.md` o que é o produto, 3 a 5 características reais (do pedido, do site, do rótulo; nunca inventadas) e o público.
2. **Perguntar** com AskUserQuestion numa chamada só, pulando o que o pedido já respondeu:
   - **Nível** (tabela abaixo).
   - **Formatos** (multiSelect): sugira 4 de `guia/formatos.md` que casam com o tipo de produto e o objetivo; "Other" pra pedir outro.
   - **Linha editorial** (`guia/linhas.md`): sugira 2 a 3 que casam com a marca.
   - **Proporções** (multiSelect): 4:5 (feed, padrão), 9:16 (stories/reels), 1:1.
3. **Orçar.** Some os créditos (custos abaixo e em cada formato). Até 30: siga. Acima: mostre a conta e espere o OK.
4. **Matéria-prima.** Gere as imagens base no nível 1 (variações), escolha as limpas, prepare as camadas (`guia/direcao.md`). Anote cada geração no `brief.md`.
5. **Estáticos** (se pedidos): direto da matéria-prima ou subindo de nível as vencedoras.
6. **Vídeos em código.** Por formato: storyboard na grade de batida no `brief.md` → copie um modelo de `motor/` (ou escreva do zero seguindo `guia/video.md`) → `node motor/render.mjs <html> --folha` → **olhe a folha** e corrija → trilha → `node motor/render.mjs <html> --sub 3`. Todas as proporções saem do mesmo HTML.
7. **Crítica.** Abra as imagens e as folhas de verdade. Testes de `guia/direcao.md`. Corrija os três piores problemas e renderize de novo.
8. **Entrega.** Mostre o que ficou, os créditos gastos (`higgsfield account status` antes e depois) e pergunte o que sobe de nível ou vira outra variação.

## Níveis

| Nível | O que sai | Como | Créditos típicos |
|---|---|---|---|
| **1 · Teste estático** | muitas variações pra validar ângulo/mensagem | `gpt_image_2_5 --quality low --resolution 1k --image ref/...` | 0,25 por imagem |
| **2 · Estático final** | peça pronta pra subir | `gpt_image_2_5 --quality medium --resolution 2k` (1) · `product-photoshoot` · `nano_banana_2` 2k (2, fidelidade máxima ao produto) · `gpt_image_2_5 high` (2,75) | 1 a 2,75 por imagem |
| **3 · Animado em código** | o carro-chefe: vídeo de motion design | matéria-prima do nível 1 + recortes (1 cada) + `image_decompose` (2) + trilha `sonilo_music` (0,94 por 15 s) + efeitos `seed_audio` (0,1 cada) | 4 a 12 por vídeo |
| **4 · Animado 3D** | giro 360 real, vista explodida em 3D, câmera orbitando | GLB do produto `tripo_h3_1_image_to_3d` (9) + `modelo-giro-3d.html` | 10 a 15 por vídeo, o GLB serve pra todos os vídeos do projeto |
| **5 · Vídeo IA** | movimento físico (pessoa falando, líquido, tecido, mão) | `kling3_0_turbo --start-image` 5 s 720p (7,5) · `seedance_2_5` (15 a 120) · `marketing_studio_video` UGC 15 s (75). Pode entrar como camada dentro de um vídeo em código | 7,5 a 75 |

O vídeo IA sempre parte de uma estática aprovada (`--start-image`), nunca de texto puro.

## Regras

- O produto tem que sair idêntico à foto (forma, cor, rótulo, logo). Se mudou, regere; se mudar de novo, suba pra `nano_banana_2`.
- No vídeo em código, **texto é texto de verdade**, desenhado pelo HTML, nunca pedido à IA. No estático, texto na imagem só com `gpt_image_2_5` ou `dtc-ads`, curto, conferido letra por letra.
- Característica, número e depoimento vêm do produto real. Nada inventado; sem dado, o formato muda.
- Referência de outra marca: a gramática (luz, enquadramento, ritmo), nunca o produto, o logo, as pessoas ou o texto.
- Música e efeitos: gerados na Higgsfield (são nossos) ou de biblioteca com licença comercial.
- `projetos/_teste/` é a bancada do motor (assets falsos e um GLB de exemplo da Khronos); pode apagar.

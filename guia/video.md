# O motor de vídeo em código

Base: o motor do carrossel vivo do projeto antigo + o que os melhores prompts do [awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) têm em comum.

## As leis (quebrar uma estraga o vídeo)

1. **Um HTML por vídeo.** `window.__video` declara formatos, duração, fps, bpm, loop, trilha e sons; `window.seek(t)` desenha o quadro do instante t.
2. **Função pura de t.** Todo estilo é calculado dentro do `seek(t)`. Proibido: transição ou animação CSS, `setTimeout`, `requestAnimationFrame`, estado que passa de um quadro pro outro, `Math.random` (use `A.rand(semente)`). Qualquer quadro tem que sair igual em qualquer ordem.
3. **Molas de forma fechada.** `A.mola(t, t0)` vai de 0 a 1 com sobrepasso pequeno. Um valor que muda de alvo várias vezes é a soma de uma mola por mudança: `A.molas(t, [[0, 0], [t1, 1], [t2, 0.4]])`. Impacto: `A.carimbo`; destaque: `A.pop`.
4. **Grade de batida.** 120 BPM por padrão; `A.bat(n)` dá o segundo da batida n. Algo acontece em toda batida; nada fica parado mais de 1 s. Corte de cena no tempo forte.
5. **Uma câmera.** Um container com transform; um movimento por cena; nunca zoom de ida e volta seguido.
6. **Uma coisa vira a próxima.** A forma que sai é a que entra (o botão vira a página, o frasco vira o círculo, a cor inunda a partir de um objeto). Inundação: passa dos cantos e leva cerca de 0,3 s.
7. **Texto é texto.** Desenhado pelo HTML, sobe de uma linha de máscara (`.mascara > span` com `translateY`). Conteúdo entra depois que o container começa a mudar e sai antes da próxima mudança.
8. **Proporções no mesmo HTML.** Use `W`/`H` de `A.formato()` e posições em fração do palco. O render faz todos os formatos em paralelo.
9. **Loop** (quando `loop: true`): o quadro na duração é igual ao quadro 0. Use `A.sino` (zero exato nas pontas) e voltas inteiras. O render confere pixel a pixel.

## Comandos

```bash
node motor/render.mjs projetos/<p>/video/x.html --folha        # 1 quadro por batida, em todos os formatos → x-4x5-folha.jpg
node motor/render.mjs projetos/<p>/video/x.html --quadro 3.5   # 1 quadro (também serve pra exportar estático)
node motor/render.mjs projetos/<p>/video/x.html --sub 3        # MP4 final com motion blur (3 subquadros), todos os formatos
node motor/render.mjs projetos/<p>/video/x.html --f 9x16       # só um formato
```

Caminhos dentro do HTML são relativos a ele (`../ref/produto-sem-fundo.png`, `assets/...`); `/motor/` e `/node_modules/` são absolutos (o servidor do render serve a raiz do repo). Chrome do sistema via Playwright; WebGL por software (determinístico).

## Ordem de trabalho

1. **Storyboard primeiro**, no `brief.md`: uma linha por batida ou compasso (o que entra, o que sai, que som). Só depois o código.
2. Copie um modelo (`modelo-explodida.html`, `modelo-giro-3d.html`) ou escreva do zero com `anim.js`; troque o `CENA`.
3. `--folha` e **olhe a folha**: texto encostado ou cortado, elemento atrás de outro, tela vazia demais, espera morta, proporção que quebrou. Corrija e repita.
4. Som. Trilha com `higgsfield generate create sonilo_music --prompt "<gênero, clima>, 120 BPM, entrada forte no primeiro tempo, sem voz" --duration <s> --wait` (0,94 por 15 s); efeitos com `seed_audio --prompt "whoosh curto e seco"` (0,1 cada). Baixe pra `video/audio/`, declare em `__video.trilha` e `__video.sons` ([{t, src, vol}]); coloque cada efeito no acerto da animação. O render mixa e normaliza em -14 LUFS.
5. `--sub 3` pro final. Abra o MP4, confira os trechos rápidos.

## Matéria-prima pro movimento

- **Camadas separadas sempre.** Fundo, produto e frente como imagens diferentes: o código só anima o que está separado.
- **Recorte:** `higgsfield generate create image_background_remover --image <img> --wait` (1 crédito) → `assets/<nome>-sem-fundo.png`.
- **Cena inteira em camadas:** `higgsfield generate workflow image_decompose --image <img> --wait` (2 créditos) → as camadas em PNG pra parallax 2.5D.
- **Elemento isolado** (ingrediente, metal, tecido): gere sozinho em fundo liso (0,25), depois recorte (1).
- **Ângulos do mesmo produto:** `3d_jutsu_angles` (1,25 a 2,5) ou a foto como `--image` pedindo o ângulo.
- **3D de verdade:** `higgsfield generate create tripo_h3_1_image_to_3d --image <frente-sem-fundo> --wait` (9) → `ref/produto.glb`. Confira o GLB no `modelo-giro-3d` antes de usar em vários vídeos.
- **Vídeo de IA como camada:** `ffmpeg -i clip.mp4 -vf fps=30 assets/clip/%04d.jpg` e troque o `src` por quadro dentro do `seek(t)` (espere o `decode()`).

## Armadilhas conhecidas

- `opacity` ou `filter` num elemento com `preserve-3d` achata e mostra as duas faces: aplique no pai.
- Filho com `visibility: visible` aparece dentro de pai escondido: use `inherit`.
- `backdrop-filter` com `url()` falha no Chromium: clone a cena atrás do vidro.
- Imagem que não carregou vira erro no console do render: o caminho é relativo ao HTML.

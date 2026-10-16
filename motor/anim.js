// ANIM · tudo é função pura do tempo: nenhum estado entre quadros, nenhum timer, nenhuma transição CSS.
// Herdado do motor do carrossel vivo, generalizado pra qualquer formato.
(function () {
  const A = (window.A = {});

  A.clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  A.seg = (t, a, b) => A.clamp((t - a) / (b - a));
  A.lerp = (a, b, u) => a + (b - a) * u;
  A.n = (v) => +v.toFixed(3);

  A.inQ = (u) => u * u;
  A.outQ = (u) => 1 - (1 - u) * (1 - u);
  A.inOutQ = (u) => (u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2);
  A.inC = (u) => u * u * u;
  A.outC = (u) => 1 - Math.pow(1 - u, 3);
  A.inOutC = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  A.outQuart = (u) => 1 - Math.pow(1 - u, 4);
  A.outExpo = (u) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * u));
  A.outBack = (u, s = 1.3) => 1 + (s + 1) * Math.pow(u - 1, 3) + s * Math.pow(u - 1, 2);
  A.sino = (u) => { const v = Math.pow(Math.sin(Math.PI * A.clamp(u)), 2); return v < 1e-9 ? 0 : v; }; // 0 → 1 → 0, zero exato nas pontas (o loop fecha)
  A.tw = (t, a, b, v0, v1, e = A.inOutC) => A.lerp(v0, v1, e(A.seg(t, a, b)));

  // mola de resposta ao degrau, forma fechada: vai de 0 a 1 com sobrepasso pequeno. z = amortecimento (0.7 = quase sem sobra), f = Hz
  A.mola = (t, t0, f = 2.2, z = 0.72) => {
    const tau = t - t0; if (tau <= 0) return 0;
    const w = 2 * Math.PI * f, wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w * tau) * (Math.cos(wd * tau) + (z * w / wd) * Math.sin(wd * tau));
  };
  // valor com vários alvos ao longo do tempo: soma de uma mola por mudança. passos = [[t0, valor], ...] (o primeiro é o inicial)
  A.molas = (t, passos, f, z) => passos.slice(1).reduce((v, [t0, alvo], i) => v + (alvo - passos[i][1]) * A.mola(t, t0, f, z), passos[0][1]);
  // tremida amortecida que zera EXATAMENTE em `dur` (sem resíduo na emenda). tau = t - t0
  A.vibra = (tau, dur, f) => (tau < 0 || tau >= dur ? 0 : Math.pow(1 - tau / dur, 2) * Math.cos(2 * Math.PI * f * tau));
  A.volume = (a) => ({ sx: 1 / (1 + a), sy: 1 + a }); // estica ou achata mantendo o volume
  A.carimbo = (t, t0, forca = 0.14, dur = 0.45, f = 2.4) => A.volume(-forca * A.vibra(t - t0, dur, f)); // achata no impacto e volta
  A.pop = (t, t0, forca = 0.1, dur = 0.4, f = 2.6) => 1 + forca * A.vibra(t - t0, dur, f);
  A.chega = (t, t0, dur = 0.5, e = A.outC) => e(A.seg(t, t0, t0 + dur));

  // grade musical: batida n em segundos
  A.bat = (n, bpm = (window.__video && window.__video.bpm) || 120) => (n * 60) / bpm;

  // aleatório determinístico (mesma semente, mesmo número em qualquer quadro)
  A.rand = (s) => { s = Math.sin(s * 12.9898 + 78.233) * 43758.5453; return s - Math.floor(s); };

  A.cor = (c) => (c.startsWith('#') ? [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)) : c.match(/\d+/g).map(Number).slice(0, 3));
  A.mixCor = (a, b, u) => { const x = A.cor(a), y = A.cor(b); return `rgb(${x.map((v, i) => Math.round(A.lerp(v, y[i], u))).join(', ')})`; };

  A.estilo = (el, p, v) => { if (el.style[p] !== v) el.style[p] = v; };
  A.tr = (el, v, origem) => { A.estilo(el, 'transform', v); A.estilo(el, 'transformOrigin', v ? origem || '' : ''); };

  // parallax de camadas: [{el, fator}] (fundo 0.04, produto 0.07, frente 0.1). Empurra devagar e volta antes de `fim`.
  A.parallax = (t, camadas, fim, ini = 0) => {
    const u = A.sino(A.seg(t, ini, fim));
    for (const { el, fator } of camadas) A.tr(el, u ? `scale(${A.n(1 + fator * u)})` : '', '50% 60%');
  };
  A.digita = (t, t0, n, passo = 0.05) => A.clamp(Math.floor((t - t0) / passo) + 1, 0, n);

  // formato pedido pelo render (?f=9x16) dentro dos formatos declarados em __video.formatos
  A.formato = () => {
    const v = window.__video, f = new URLSearchParams(location.search).get('f') || Object.keys(v.formatos)[0];
    const [w, h] = v.formatos[f]; Object.assign(v, { w, h, f });
    document.documentElement.style.setProperty('--w', w + 'px'); document.documentElement.style.setProperty('--h', h + 'px');
    return v;
  };
  // espera imagens e fontes; o render só começa depois
  A.pronto = async () => {
    await Promise.all([...document.images].map((i) => i.decode().catch(() => console.error('imagem não carregou:', i.src))));
    await document.fonts.ready; await window.seek(0); window.__pronto = true;
  };
})();

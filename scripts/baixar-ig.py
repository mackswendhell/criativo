#!/usr/bin/env python3
"""
Baixa um post, reel ou carrossel do Instagram pra pasta de referência da skill.

    python3 scripts/baixar-ig.py URL --nome x [--destino refs] [--navegador chrome]

Sai em  refs/referencia-x/slide-NN.jpg  (ou .mp4 quando o slide é vídeo)
e       refs/referencia-x/LEIA.md        (autor, link, data, legenda).

Como funciona: usa o gallery-dl com os cookies do navegador logado no Instagram
(por padrão o Chrome). Sem login o Instagram não entrega o JSON do post, então
o navegador precisa ter uma sessão aberta no instagram.com. Na primeira vez o
macOS pede permissão pra ler o "Chrome Safe Storage" no Keychain: clique em
"Sempre permitir" e nunca mais pergunta.

Precisa de: python3 -m pip install --user gallery-dl   (ou brew install gallery-dl)
"""
import argparse
import json
import re
import shutil
import subprocess
import sys
from datetime import datetime
from pathlib import Path

IG_RE = re.compile(r"instagram\.com/(?:[^/]+/)?(?:p|reel|reels|tv)/([A-Za-z0-9_-]+)")


def limpar_url(url: str) -> str:
    m = IG_RE.search(url)
    if not m:
        sys.exit(f"isso não parece um link de post do Instagram: {url}")
    return f"https://www.instagram.com/p/{m.group(1)}/"


def gallery_dl_cmd():
    if shutil.which("gallery-dl"):
        return ["gallery-dl"]
    try:
        subprocess.run([sys.executable, "-m", "gallery_dl", "--version"],
                       capture_output=True, check=True)
        return [sys.executable, "-m", "gallery_dl"]
    except Exception:
        sys.exit("gallery-dl não está instalado: python3 -m pip install --user gallery-dl")


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("url")
    ap.add_argument("--nome", required=True, help="apelido da referência (vira refs/referencia-<nome>/)")
    ap.add_argument("--destino", default="refs", help="pasta refs/ do projeto (default: refs)")
    ap.add_argument("--navegador", default="chrome", help="chrome | safari | firefox | brave | edge (default: chrome)")
    ap.add_argument("--cookies", help="arquivo cookies.txt (Netscape) em vez de ler do navegador")
    args = ap.parse_args()

    url = limpar_url(args.url)
    pasta = Path(args.destino) / f"referencia-{args.nome}"
    tmp = pasta / ".dl"
    if tmp.exists():
        shutil.rmtree(tmp)
    tmp.mkdir(parents=True)

    cmd = gallery_dl_cmd() + [
        "--directory", str(tmp),
        "--filename", "{num:>02}.{extension}",
        "--write-metadata",
        "--no-part",
        "--quiet",
    ]
    if args.cookies:
        cmd += ["--cookies", args.cookies]
    else:
        cmd += ["--cookies-from-browser", args.navegador]
    cmd.append(url)

    print(f"baixando {url} com os cookies do {args.cookies or args.navegador}…")
    r = subprocess.run(cmd, capture_output=True, text=True)
    arquivos = sorted(p for p in tmp.rglob("*") if p.is_file() and p.suffix.lower() in {".jpg", ".jpeg", ".png", ".webp", ".mp4"})
    if r.returncode != 0 or not arquivos:
        err = (r.stderr or r.stdout).strip()
        print(err[-1500:], file=sys.stderr)
        if "login" in err.lower() or "401" in err or "cookies" in err.lower():
            print("\nO navegador não está logado no instagram.com ou o Keychain negou a leitura dos cookies.\n"
                  "Abra o Instagram no Chrome, faça login, e rode de novo. Se apareceu a caixa do Keychain,\n"
                  "clique em 'Sempre permitir'. Alternativa: exporte um cookies.txt e passe --cookies.", file=sys.stderr)
        sys.exit("nenhum slide baixado")

    # move e renomeia pra slide-NN.ext (ordem do carrossel = {num})
    meta = {}
    for i, src in enumerate(arquivos, 1):
        dst = pasta / f"slide-{i:02d}{src.suffix.lower()}"
        shutil.move(str(src), dst)
        mj = src.with_name(src.name + ".json")
        if mj.exists() and not meta:
            try:
                meta = json.loads(mj.read_text())
            except Exception:
                pass
    shutil.rmtree(tmp, ignore_errors=True)

    legenda = (meta.get("description") or "").strip()
    autor = meta.get("username") or meta.get("owner", {}).get("username") or "?"
    data = meta.get("date") or ""
    linhas = [
        f"# Referência {args.nome}",
        "",
        f"- Link: {url}",
        f"- Autor: @{autor}",
        f"- Data do post: {data}",
        f"- Slides: {len(arquivos)}",
        f"- Baixado em: {datetime.now():%Y-%m-%d %H:%M}",
        "",
        "## O que a pessoa disse sobre a referência",
        "",
        "(preencher palavra por palavra: 'quero esse ritmo', 'gostei da fonte'…)",
        "",
        "## Legenda original (só pra entender a gramática; nunca copiar)",
        "",
        legenda or "(sem legenda)",
        "",
    ]
    (pasta / "LEIA.md").write_text("\n".join(linhas))
    print(f"ok: {len(arquivos)} slide(s) de @{autor} em {pasta}/")
    for p in sorted(pasta.glob("slide-*")):
        print("  ", p.name)
    print(f"próximo passo: python3 scripts/periciar.py {pasta} --nome {args.nome}")


if __name__ == "__main__":
    main()

# svg2rc

Converta SVG válido em componente React (`.jsx` / `.tsx`) direto no navegador — sem backend, sem upload.

**Repo:** [antonio-abrantes/svg2rc](https://github.com/antonio-abrantes/svg2rc)

![svg2rc](public/icon.png)

## O que faz

- Cola um SVG no painel esquerdo e gera um componente React limpo no painel direito
- Saída em **JSX** ou **TSX**, com API de props fixa (`size`, `className`, `style`, `...props`)
- Validação + sanitização (`<script>`, handlers `on*`) antes de gerar código
- Syntax highlighting (CodeMirror), copiar e baixar o arquivo gerado
- 100% client-side

## Stack

- Vite 8 + React + TypeScript
- TanStack Start / Router
- Tailwind CSS 4
- SVGO (browser) + Prettier
- CodeMirror 6

## Desenvolvimento

Requer Node.js `^20.19.0` ou `>=22.12.0`.

```bash
npm install
npm run dev
```

App em `http://localhost:3000`.

```bash
npm run build
npm start
```

## Docker

```bash
docker build -t svg2rc:local .
docker run --rm -p 8080:80 svg2rc:local
```

Produção (Swarm + Traefik): ver `docker-compose.yml`. Imagem publicada em:

`ghcr.io/antonio-abrantes/svg2rc`

O workflow em `.github/workflows/build-svg2rc.yml` gera imagens **linux/amd64** e **linux/arm64** em push na `main` e em tags `v*.*.*`.

## Atalho / PWA

Na primeira visita, o app pergunta se você quer criar um atalho (instalar como app).  
- **Sim** → usa o prompt nativo do navegador quando disponível  
- **Agora não** → grava a escolha em `localStorage` e não pergunta de novo

## Idiomas

Interface em **Português (Brasil)** e **English**, com toggle no header.  
Padrão: `pt-BR`. Preferência salva em `localStorage` (`svg2rc:locale`).

Arquivos: `src/i18n/locales/pt-BR.json` e `src/i18n/locales/en.json`.

## Licença

MIT

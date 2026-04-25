# cross_app_frontend

Frontend em React + Vite + TypeScript.

## Requisitos

- Node.js 18+
- npm 9+ (ou Bun)

## Rodando localmente

```bash
npm install
npm run dev
```

Aplicacao disponivel em `http://localhost:8080/`.

Por padrao, o Vite faz proxy das rotas da API para `http://localhost:3000`. Se o backend estiver em outra URL ou porta, configure uma destas variaveis antes de subir o frontend:

```bash
VITE_API_URL=http://localhost:3333 npm run dev
```

ou

```bash
VITE_PROXY_TARGET=http://localhost:3333 npm run dev
```

Use `VITE_API_URL` quando quiser que o cliente HTTP aponte direto para a API. Use `VITE_PROXY_TARGET` quando quiser manter requests relativos no browser e deixar o Vite encaminhar para outro backend.

## Scripts

- `npm run dev`: inicia servidor de desenvolvimento
- `npm run build`: gera build de producao
- `npm run preview`: preview local do build
- `npm run lint`: executa lint
- `npm run test`: executa testes com Vitest

## Observacao

Se aparecer aviso de Browserslist desatualizado, execute:

```bash
npx update-browserslist-db@latest
```

## Documentacao

- Roadmap do projeto: [ROADMAP.md](ROADMAP.md)

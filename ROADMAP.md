# Cross App Frontend - Documentacao e Roadmap

Ultima atualizacao: 2026-04-24

## 1. Objetivo do projeto

Aplicacao web para operacao de um box de CrossFit com fluxos para ADMIN, COACH e ALUNO.

Principais objetivos de produto:
- autenticacao e onboarding
- check-in por aula
- feed social da comunidade
- acompanhamento de performance (WOD + PR)
- rewards e consistencia
- relatorios administrativos

## 2. Stack e base tecnica

- React + TypeScript + Vite
- TanStack Query para data fetching/cache
- UI baseada em componentes locais em src/components/ui
- Hooks de acesso a API em src/hooks
- Cliente HTTP central em src/lib/api.ts
- Testes com Vitest e Playwright (estrutura ja configurada)

## 3. Estrutura funcional atual

### Rotas/Paginas principais
- src/pages/Login.tsx
- src/pages/Index.tsx
- src/pages/Admin.tsx
- src/pages/Coach.tsx

### Telas principais
- Home: aulas, check-ins, WOD do dia
- Feed: criacao e listagem de posts
- Evolution: resultados e PRs
- Profile: dados do usuario e milestones
- Nearby Boxes: descoberta de boxes por geolocalizacao

## 4. Cobertura atual vs Swagger (backend)

Cobertura estimada atual: 27 de 33 endpoints (aprox. 82%).

### Implementado
- Auth
- Boxes
- Classes (consulta de aulas do dia)
- Checkins
- Exercises (listagem)
- Feed
- Rewards
- Results
- Users
- Wods (consulta do dia)
- Admin Reports (overview, inactivity, class participation, training ranking, gym-rats, rewards-xp)

### Nao implementado (lacunas confirmadas)
- POST /classes
- POST /exercises
- POST /wods
- GET /admin/reports/coach-assignments
- POST /admin/reports/coach-assignments
- DELETE /admin/reports/coach-assignments

## 5. Inconsistencias/atencoes de contrato

- Cadastro de coach atualmente usa /user/register com role COACH no frontend.
- Necessario validar se o backend documenta e suporta oficialmente esse formato.
- Alguns hooks usam withBoxId: false de forma intencional (ex.: feed consolidado e resultados do usuario).
- Manter essa decisao documentada para evitar regressao em headers obrigatorios.

## 6. Roadmap de implementacao

## Fase 1 - Fechar gaps criticos de operacao do box

1. Criar aulas recorrentes (POST /classes)
- Entrega:
  - hook use-create-class.ts
  - formulario na area ADMIN
  - validacao de weekDays/startTime/endTime/checkinLimit
- Criterio de aceite:
  - admin cria aula e ela aparece em classes/today no dia correspondente

2. Criar exercicio customizado (POST /exercises)
- Entrega:
  - hook use-create-exercise.ts
  - formulario ADMIN para nome + categoria
- Criterio de aceite:
  - exercicio criado aparece na listagem de exercicios do box

3. Criar WOD (POST /wods)
- Entrega:
  - hook use-create-wod.ts
  - UI ADMIN para montar blocos (WARMUP/SKILL/WOD)
- Criterio de aceite:
  - WOD criado aparece em wods/today e em classes/today

Prazo sugerido: curto (1 sprint)

## Fase 2 - Governanca de turmas por coach

4. Coach assignments (GET/POST/DELETE /admin/reports/coach-assignments)
- Entrega:
  - hooks: list/create/delete coach assignment
  - UI ADMIN para vincular e remover coach-turma
  - feedback visual de sucesso/erro
- Criterio de aceite:
  - vinculo impacta filtros de relatorios por coach

Prazo sugerido: curto-medio (1 sprint)

## Fase 3 - Robustez e qualidade

5. Padronizar contratos de resposta
- Entrega:
  - normalizacao central de payload (array direto vs wrappers)
  - tipagem forte em todos os hooks
- Criterio de aceite:
  - reduzir parsing defensivo repetido nos hooks

6. Melhorar cobertura de testes
- Entrega:
  - testes unitarios para hooks criticos
  - smoke e2e para fluxos: login, check-in, post, resultado
- Criterio de aceite:
  - pipeline validando fluxo principal sem falhas

Prazo sugerido: medio (1 a 2 sprints)

### Status de implementacao (2026-04-24)

- Entregue: normalizacao central de payload em src/lib/response.ts para reduzir parsing defensivo repetido em hooks de listagem.
- Entregue: refatoracao dos hooks de check-ins, feed, resultados, exercicios e rewards para usar normalizadores compartilhados.
- Entregue: testes unitarios novos para contratos de resposta e hooks criticos de leitura.
- Pendente da Fase 3: smoke e2e completo cobrindo login, check-in, post e resultado ponta-a-ponta com ambiente de backend/mocks dedicados.

## 7. Priorizacao sugerida

Prioridade P0:
- POST /classes
- POST /wods

Prioridade P1:
- POST /exercises
- coach assignments (3 endpoints)

Prioridade P2:
- hardening de contratos e testes automatizados

## 8. Definicao de pronto por feature

- hook + tipos + invalidacao de cache
- UI integrada na pagina correta
- tratamento de erro por status HTTP
- loading e estado vazio
- teste minimo (unitario ou e2e)
- documentacao curta no README ou changelog

## 9. Proximo marco recomendado

Marco: "Admin Complete"
- Admin consegue criar aula, exercicio, WOD
- Admin consegue gerenciar coach-turma
- Relatorios funcionam com filtros por coach validos

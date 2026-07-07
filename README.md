# Central de Tarefas & Jukebox

Aplicação em Next.js com dois módulos, pronta para rodar localmente ou publicada na Vercel:

- **Quadro Kanban** — gerenciamento de tarefas com colunas configuráveis, drag and drop, responsáveis, prazos e um mini-dashboard de estatísticas.
- **Jukebox** — fila de músicas do YouTube: uma tela "tocando agora" reproduz em ordem de chegada as músicas pedidas em outra tela, com lista de termos bloqueados e identificação do estilo musical.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Server Components)
- [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (estilo `base-nova`, sobre [Base UI](https://base-ui.com/))
- [Prisma](https://www.prisma.io/) + PostgreSQL (funciona com qualquer Postgres — Vercel Postgres/Neon, Supabase, etc.)
- [@dnd-kit](https://dndkit.com/) para drag and drop
- [YouTube Data API v3](https://developers.google.com/youtube/v3) para busca de músicas (com estilo/gênero via topic categories) + [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) para reprodução

## Funcionalidades

### Quadro Kanban (`/`)

- Criar, editar e excluir tarefas (título, descrição, responsável, prazo) — apenas coordenadores
- Drag and drop entre colunas e reordenação dentro da mesma coluna
- Busca por texto e filtro por responsável (desabilita o drag enquanto um filtro está ativo)
- Autocomplete de título baseado em tarefas já criadas
- Avatar com iniciais do responsável e indicador visual de tarefa atrasada
- Mini-dashboard: total de tarefas, concluídas e atrasadas
- Botão para enviar um resumo das tarefas concluídas por e-mail (abre o cliente de e-mail padrão)
- Sincronização entre abas/dispositivos por polling (pausa automaticamente enquanto você arrasta um card ou tem um dialog aberto)
- Persistência 100% em banco de dados (PostgreSQL via Prisma), sem `localStorage`

### Papéis e permissões

- **Coordenador** — acesso total: cria/edita/exclui tarefas e colunas, atribui responsáveis, gerencia contas de usuário
- **Responsável** — vê o quadro inteiro, mas só pode arrastar (mudar de coluna) as tarefas atribuídas a ele; não cria, edita ou exclui nada
- Permissões aplicadas tanto na interface (botões ocultos) quanto no servidor (Server Actions validam o papel do usuário logado)

### Administração (`/admin`, `/admin/usuarios` — só coordenador)

- **Colunas** (`/admin`) — totalmente configuráveis: criar, renomear, escolher cor, marcar como "coluna de conclusão" e reordenar. Uma coluna só pode ser excluída se estiver vazia
- **Usuários** (`/admin/usuarios`) — criar contas (nome, usuário, senha, papel), editar, redefinir senha e excluir

### Jukebox

- **`/jukebox`** — player com a música atual (YouTube IFrame API), avança automaticamente para a próxima da fila ao terminar, botão de pular, reordenar a fila por drag and drop e remover itens
- **`/jukebox/pedir`** — busca músicas por nome/artista (YouTube Data API v3) e adiciona à fila; pedidos duplicados (mesma música já na fila) são rejeitados
- **`/jukebox/bloqueios`** — lista de termos bloqueados; músicas cujo título contenha um termo bloqueado não podem ser pedidas nem tocadas
- Histórico das últimas 10 músicas tocadas
- Sincronização entre telas por polling (consulta o banco a cada poucos segundos), permitindo usar uma tela para tocar (ex: TV) e outra para pedir (ex: celular)

### Geral

- Login individual (usuário + senha) por pessoa, com sessão assinada (HMAC) e rate limit de tentativas (5 erradas / 15 min por IP)
- Instalável como app (PWA) — "Adicionar à tela inicial" no celular
- Vercel Analytics integrado
- Sidebar de navegação no desktop (colapsável para ícones); barra de navegação inferior (ícones) no mobile
- Dark mode
- Design responsivo para desktop e mobile

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o template:

```bash
cp .env.example .env
```

Preencha `DATABASE_URL` com uma connection string do Postgres (veja [Banco de dados](#banco-de-dados) abaixo para como criar uma gratuita).

Para a busca de músicas por nome no jukebox, adicione sua chave da YouTube Data API v3:

```
YOUTUBE_API_KEY=sua_chave_aqui
```

Veja o passo a passo em [docs/youtube-api-key.md](docs/youtube-api-key.md). Sem a chave, o restante do sistema (Kanban, admin, player, bloqueios) funciona normalmente — só a busca por nome fica indisponível.

Defina também `AUTH_SECRET` — usado para assinar (HMAC) o cookie de sessão de cada usuário logado. Gere um valor aleatório, por exemplo:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

```
AUTH_SECRET=valor_aleatorio_gerado_acima
```

### 3. Rodar migrations e seed

```bash
npx prisma migrate dev
```

Isso aplica as migrations no banco Postgres configurado. Se ainda não existir nenhum usuário, o seed cria duas contas de teste — **coordenador/coord12345** (papel coordenador) e **membro/membro12345** (papel responsável) — e, se o banco estiver vazio, também colunas/tarefas de exemplo. Troque a senha do coordenador (ou crie sua própria conta e apague a de teste) pelo painel `/admin/usuarios` assim que acessar.

### 4. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

### 5. Acessar de outros dispositivos na mesma rede (opcional)

Útil para o Jukebox: uma tela (TV/PC) tocando e outro dispositivo (celular) pedindo música.

`npm run dev`/`npm run start` já ficam disponíveis em todas as interfaces de rede (`-H 0.0.0.0`), não só em `localhost`. Para acessar de outro dispositivo na mesma Wi-Fi:

1. Descubra o IP local desta máquina: no Windows, `ipconfig` (procure "Endereço IPv4", algo como `192.168.x.x`).
2. No outro dispositivo, acesse `http://SEU_IP:3000` (ex: `http://192.168.1.10:3000`).
3. Se não conectar, o Firewall do Windows pode estar bloqueando. Ao rodar `npm run dev` pela primeira vez, o Windows deve perguntar se permite o Node.js na rede — escolha "Permitir acesso". Se não perguntar, libere manualmente em *Painel de Controle → Firewall do Windows Defender → Permitir um aplicativo* (ou rode como administrador: `New-NetFirewallRule -DisplayName "Next.js Dev" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -Profile Private`).

## Testes

Testes de ponta a ponta com Playwright, cobrindo login, CRUD de tarefas, busca/filtro e o jukebox:

```bash
npm test
```

Precisa do servidor rodando (o Playwright sobe um automaticamente se nenhum estiver ativo) e das contas de teste `coordenador`/`membro` criadas pelo seed (veja acima). Os testes rodam em série (`workers: 1`) de propósito — o app tem um quadro e uma fila **globais** (sem isolamento por usuário), então rodar em paralelo faria os testes colidirem no mesmo estado.

## Deploy na Vercel

1. Importe o repositório em [vercel.com/new](https://vercel.com/new).
2. Crie um banco Postgres em **Storage → Create Database → Postgres** — a Vercel já injeta `DATABASE_URL` automaticamente no projeto.
3. Em **Settings → Environment Variables**, adicione `YOUTUBE_API_KEY` e `AUTH_SECRET` (a `DATABASE_URL` já vem do passo 2).
4. Rode `npx prisma migrate deploy` localmente apontando para essa mesma `DATABASE_URL` (ou configure como build step) para aplicar as migrations no banco de produção antes do primeiro deploy.
5. O `postinstall` (`prisma generate`) já roda automaticamente no build da Vercel.

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Roda o build de produção |
| `npm run lint` | ESLint |
| `npm test` | Testes end-to-end (Playwright) |
| `npx prisma studio` | Interface visual para o banco de dados |
| `npx prisma migrate dev` | Cria/aplica migrations |

## Estrutura do projeto

```
app/
  (app)/                    Rotas protegidas (com sidebar/header)
    page.tsx                Quadro Kanban (Server Component)
    admin/                  Administração de colunas
    admin/usuarios/         Administração de usuários (só coordenador)
    jukebox/                Player, pedido de música e bloqueios
  login/                    Página de login (usuário + senha, sem sidebar)
  layout.tsx                Layout raiz (tema, toaster, analytics)
  manifest.ts                Manifest do PWA
proxy.ts                     Bloqueia acesso sem sessão válida (cookie assinado)
components/
  kanban/                   Board, colunas, cards, dialogs, stats
  admin/                    Gerenciador de colunas e de usuários
  jukebox/                  Player, formulário de pedido, bloqueios
  ui/                       Componentes shadcn/ui
lib/
  actions/                  Server Actions (tasks, columns, users, jukebox, blocklist, auth)
  auth.ts                   Sessão assinada por HMAC (Web Crypto, roda no proxy/edge)
  password.ts               Hash de senha com scrypt (Node, só em Server Actions)
  session.ts                getCurrentUser() / requireCoordinator()
  prisma.ts                 Cliente Prisma (singleton)
  youtube.ts                Integração com YouTube Data API v3
  nav.ts                    Itens de navegação (sidebar + bottom nav)
prisma/
  schema.prisma             Modelos: User, Column, Task, Track, BlockedSong, LoginAttempt
  seed.ts                   Cria contas de teste (coordenador/membro) e dados iniciais
tests/                      Testes end-to-end (Playwright)
types/                      Tipos compartilhados (task, jukebox)
```

## Banco de dados

PostgreSQL (via Prisma). Para criar um gratuito:

- **Vercel Postgres** (Neon) — Storage → Create Database → Postgres, no dashboard da Vercel
- **[Neon](https://neon.tech/)** diretamente
- **[Supabase](https://supabase.com/)**

Qualquer um funciona — só colar a connection string em `DATABASE_URL`. Modelos principais:

- **User** — contas de login (nome, usuário, hash da senha, papel: `coordinator` | `member`)
- **Column** — status configuráveis do Kanban (título, cor, `isDone`, ordem)
- **Task** — tarefas (título, descrição, responsável via `assigneeId` → User, prazo, coluna, ordem)
- **Track** — fila de reprodução do jukebox (título, canal, gênero, status: `queued` | `playing` | `done`)
- **BlockedSong** — termos bloqueados no jukebox

# Central de Tarefas & Jukebox

Aplicação local em Next.js com dois módulos:

- **Quadro Kanban** — gerenciamento de tarefas com colunas configuráveis, drag and drop, responsáveis, prazos e um mini-dashboard de estatísticas.
- **Jukebox** — fila de músicas do YouTube: uma tela "tocando agora" reproduz em ordem de chegada as músicas pedidas em outra tela, com lista de termos bloqueados.

## Stack

- [Next.js 16](https://nextjs.org/) (App Router, Server Actions, Server Components)
- [React 19](https://react.dev/) + TypeScript
- [Tailwind CSS v4](https://tailwindcss.com/) + [shadcn/ui](https://ui.shadcn.com/) (estilo `base-nova`, sobre [Base UI](https://base-ui.com/))
- [Prisma](https://www.prisma.io/) + SQLite (banco local, arquivo `prisma/dev.db`)
- [@dnd-kit](https://dndkit.com/) para drag and drop
- [YouTube Data API v3](https://developers.google.com/youtube/v3) para busca de músicas + [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) para reprodução

## Funcionalidades

### Quadro Kanban (`/`)

- Criar, editar e excluir tarefas (título, descrição, responsável, prazo)
- Drag and drop entre colunas e reordenação dentro da mesma coluna
- Autocomplete de título baseado em tarefas já criadas
- Avatar com iniciais do responsável e indicador visual de tarefa atrasada
- Mini-dashboard: total de tarefas, concluídas e atrasadas
- Botão para enviar um resumo das tarefas concluídas por e-mail (abre o cliente de e-mail padrão)
- Persistência 100% em banco de dados (SQLite via Prisma), sem `localStorage`

### Administração de colunas (`/admin`)

- Colunas (status) são totalmente configuráveis: criar, renomear, escolher cor, marcar como "coluna de conclusão" e reordenar
- Uma coluna só pode ser excluída se estiver vazia

### Jukebox

- **`/jukebox`** — player com a música atual (YouTube IFrame API), avança automaticamente para a próxima da fila ao terminar, botão de pular e remover itens da fila
- **`/jukebox/pedir`** — busca músicas por nome/artista (YouTube Data API v3) e adiciona à fila
- **`/jukebox/bloqueios`** — lista de termos bloqueados; músicas cujo título contenha um termo bloqueado não podem ser pedidas nem tocadas
- Sincronização entre telas por polling (consulta o banco a cada poucos segundos), permitindo usar uma tela para tocar (ex: TV) e outra para pedir (ex: celular)

### Geral

- Sidebar de navegação no desktop; barra de navegação inferior (ícones) no mobile
- Dark mode
- Design responsivo para desktop e mobile

## Setup

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Copie o template e ajuste se necessário:

```bash
cp .env.example .env
```

O `DATABASE_URL` padrão (`file:./dev.db`) já funciona sem alterações.

Para a busca de músicas por nome no jukebox, adicione sua chave da YouTube Data API v3 em `.env` (ou `.env.local`):

```
YOUTUBE_API_KEY=sua_chave_aqui
```

Veja o passo a passo em [docs/youtube-api-key.md](docs/youtube-api-key.md). Sem a chave, o restante do sistema (Kanban, admin, player, bloqueios) funciona normalmente — só a busca por nome fica indisponível.

### 3. Rodar migrations e seed

```bash
npx prisma migrate dev
```

Isso cria o banco `prisma/dev.db`, aplica as migrations e popula colunas/tarefas de exemplo (o seed só roda se o banco estiver vazio).

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
3. Se não conectar, o Firewall do Windows pode estar bloqueando. Ao rodar `npm run dev` pela primeira vez, o Windows deve perguntar se permite o Node.js na rede — escolha "Permitir acesso". Se não perguntar, libere manualmente em *Painel de Controle → Firewall do Windows Defender → Permitir um aplicativo* (ou crie uma regra para a porta 3000/TCP).

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Roda o build de produção |
| `npm run lint` | ESLint |
| `npx prisma studio` | Interface visual para o banco de dados |
| `npx prisma migrate dev` | Cria/aplica migrations |

## Estrutura do projeto

```
app/
  page.tsx                  Quadro Kanban (Server Component)
  admin/                    Administração de colunas
  jukebox/                  Player, pedido de música e bloqueios
components/
  kanban/                   Board, colunas, cards, dialogs, stats
  admin/                    Gerenciador de colunas
  jukebox/                  Player, formulário de pedido, bloqueios
  ui/                       Componentes shadcn/ui
lib/
  actions/                  Server Actions (tasks, columns, jukebox, blocklist)
  prisma.ts                 Cliente Prisma (singleton)
  youtube.ts                Integração com YouTube Data API v3
  nav.ts                    Itens de navegação (sidebar + bottom nav)
prisma/
  schema.prisma             Modelos: Column, Task, Track, BlockedSong
  seed.ts                   Dados iniciais
types/                      Tipos compartilhados (task, jukebox)
```

## Banco de dados

SQLite local (`prisma/dev.db`), sem necessidade de serviço externo. Modelos principais:

- **Column** — status configuráveis do Kanban (título, cor, `isDone`, ordem)
- **Task** — tarefas (título, descrição, responsável, prazo, coluna, ordem)
- **Track** — fila de reprodução do jukebox (status: `queued` | `playing` | `done`)
- **BlockedSong** — termos bloqueados no jukebox

# NestJS Base Project

Projeto base com estrutura monorepo contendo backend (NestJS), frontend (Webpack) e um pacote compartilhado.

## Estrutura do Projeto

```
nestjs-base-project/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── modules/         # Módulos de funcionalidades
│   │   ├── common/          # Utilitários compartilhados
│   │   ├── config/          # Configurações
│   │   ├── app.module.ts    # Módulo raiz
│   │   ├── app.controller.ts
│   │   ├── app.service.ts
│   │   └── main.ts          # Ponto de entrada da aplicação
│   ├── test/                # Testes E2E
│   ├── nest-cli.json
│   ├── tsconfig.json
│   ├── tsconfig.build.json
│   └── package.json
├── frontend/                # Cliente baseado em Webpack
│   ├── src/
│   │   ├── components/       # Componentes de interface
│   │   ├── services/         # Serviços de API
│   │   ├── styles/           # Estilos SCSS
│   │   ├── index.ts          # Ponto de entrada
│   │   └── index.html        # Template HTML
│   ├── webpack.config.js
│   ├── tsconfig.json
│   └── package.json
├── shared/                  # Tipos e utilitários compartilhados
│   ├── src/
│   │   ├── types/
│   │   ├── constants/
│   │   ├── utils/
│   │   └── index.ts
│   ├── tsconfig.json
│   └── package.json
└── package.json             # Configuração do workspace raiz
```

## Pré-requisitos

- Node.js >= 18.0.0
- npm >= 9.0.0

## Como Inicializar

### 1. Instalar as dependências

```bash
npm install
```

Instala as dependências de todos os workspaces (raiz, backend, frontend e shared).

### 2. Compilar o pacote compartilhado

```bash
npm run build --workspace=shared
```

### 3. Iniciar os servidores de desenvolvimento

Inicia o backend e o frontend em modo de desenvolvimento com hot-reload:

```bash
npm run dev
```

Ou inicie individualmente:

```bash
# Apenas backend (http://localhost:3000)
npm run dev:backend

# Apenas frontend (http://localhost:8080)
npm run dev:frontend
```

### 4. Acessar a aplicação

- Frontend: http://localhost:8080
- API do Backend: http://localhost:3000/api/v1

## Build de Produção

```bash
# Build de tudo
npm run build

# Build individual
npm run build:backend
npm run build:frontend
npm run build --workspace=shared
```

Iniciar o servidor de produção:

```bash
cd backend
npm run start:prod
```

## Testes

### Testes unitários

```bash
npm run test --workspace=backend
```

### Testes E2E

```bash
npm run test:e2e --workspace=backend
```

### Relatório de cobertura

```bash
npm run test:cov --workspace=backend
```

### Executar os testes de todos os workspaces

```bash
npm run test
```

# Imagem do frontend do Orari (Next.js em modo standalone).
#
# Três etapas: instalar, construir e executar. Só a última vai para produção,
# com o mínimo necessário e sem o código-fonte nem as dependências de build.
#
# Construir (a API_URL precisa existir já no build, ver abaixo):
#   docker build --build-arg API_URL=http://api:3333 -t orari-frontend .

# ---------------------------------------------------------------------------
# 1) Dependências. Camada reaproveitada enquanto o package-lock não muda.
FROM node:24-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
# Tudo instalado de propósito: o build precisa de TypeScript e Tailwind.
RUN npm ci

# ---------------------------------------------------------------------------
# 2) Build.
FROM node:24-alpine AS build
WORKDIR /app

# O next.config.ts lê a API_URL no build para reescrever /uploads, e o valor
# fica gravado no resultado. Sem ela, as fotos e logos não carregam em
# produção: por isso o build falha se ela não vier.
ARG API_URL
ENV API_URL=$API_URL \
    NEXT_TELEMETRY_DISABLED=1
RUN test -n "$API_URL" || (echo "Informe --build-arg API_URL=<endereço da API>" >&2; exit 1)

COPY --from=deps /app/node_modules ./node_modules
COPY . .
# NODE_ENV=production só depois do build: antes disso, o npm e o Next podem
# pular o que o build precisa.
RUN npm run build

# ---------------------------------------------------------------------------
# 3) Execução.
FROM node:24-alpine AS run
WORKDIR /app

# A API_URL também é usada em tempo de execução (login, renovação e chamadas
# às telas). O valor do build vira o padrão; o Compose pode sobrescrever.
ARG API_URL
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    API_URL=$API_URL

# Sem segredos aqui. AUTH_GUARD=off (só desenvolvimento) nunca deve existir
# em produção: ele libera as rotas sem login.

# O standalone não inclui public/ nem .next/static: são copiados por cima.
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public

# Sem privilégios de root.
USER node
EXPOSE 3000

# /login é pública e responde 200 sem sessão.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:3000/login || exit 1

CMD ["node", "server.js"]

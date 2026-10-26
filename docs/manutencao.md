# Manutenção do frontend: o que fazer a cada mudança

Roteiro curto, na ordem. O detalhe do servidor está no `docs/deploy.md` do backend.

## 1. No seu computador

1. Crie uma branch: `git switch -c feature/nome-da-mudanca`.
2. Faça a mudança e teste na tela (`npm run dev`).
3. Rode as três conferências:
   ```bash
   npm run lint
   npx tsc --noEmit
   npm test
   ```
4. Faça o commit (`git add ...` e `git commit`).
5. Envie a branch e abra o PR no GitHub:
   ```bash
   git push -u origin feature/nome-da-mudanca
   ```
   O CI (aba **Actions**) roda sozinho no PR. Só faça o merge com ele **verde**.
6. Faça o merge do PR na `main`.

> Não faça o merge direto na `main` pela linha de comando: o PR é o que passa pelo CI antes.

## 2. Antes de subir: o backend mudou também?

- **Sim** (rota nova, campo novo, regra nova): suba o **backend primeiro** (veja o arquivo de manutenção do backend) e o frontend depois. O frontend novo depende do que o backend novo entrega.
- **Não**: só o frontend.

## 3. No servidor (só o frontend)

Entre no servidor por SSH e rode **exatamente nesta ordem**:

```bash
cd ~/orari-frontend
git pull
git log --oneline -1          # confira: é o último commit que você fez?

cd ~/orari-backend            # o Compose e o .env.production ficam AQUI
dcp build frontend            # cerca de 2 minutos
dcp up -d frontend
dcp ps                        # o frontend precisa estar "healthy"
```

- **Sempre rode o `dcp` de dentro de `~/orari-backend`.** Em `~/orari-frontend` ele não acha o `.env.production`.
- Construa **um serviço de cada vez**: o servidor tem pouca memória.
- A API e o banco **não reiniciam** com `dcp up -d frontend`.

## 4. Conferir

1. Abra `https://app.orariapp.com.br` e use **Ctrl+Shift+R** (recarrega sem o cache).
2. Faça o login e abra a tela que você mudou.
3. Se algo estranho aparecer: `dcp logs --tail 100 frontend`.

Quem estava com o site aberto durante a subida vê um erro na próxima ação, até recarregar a página. É normal.

## 5. Se deu errado

Voltar para a versão anterior:

```bash
cd ~/orari-frontend
git log --oneline -5          # ache o commit anterior que funcionava
git checkout <esse commit>
cd ~/orari-backend
dcp build frontend && dcp up -d frontend
```

Depois, corrija no seu computador e suba de novo pelo fluxo normal. (Na volta ao normal: `cd ~/orari-frontend && git checkout main && git pull`.)

## Se mudou o endereço da API

A `API_URL` fica gravada na construção. Mudou o endereço no `docker-compose.prod.yml`? Rode `dcp build frontend` de novo; só reiniciar não basta.

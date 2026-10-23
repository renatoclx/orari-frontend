# Testes do frontend

## O que existe

Testes automáticos de **funções puras** (cálculos, datas, validações, filtros, máscaras) e de alguns pontos de borda do servidor (repasse do IP, proxy, Server Action de login). Rodam com o **Vitest**, a mesma ferramenta do backend, em segundos e sem rede.

```bash
npm test            # roda tudo uma vez
npm run test:watch  # reroda ao salvar
npm run test:cov    # relatório de cobertura em coverage/ (não vai para o git)
```

O CI (`.github/workflows/ci.yml`) roda lint, tipos, testes e build a cada push e PR para a `main`.

## Convenções

- O teste fica **ao lado do código**, com o nome `arquivo.spec.ts` (igual ao backend): `time.ts` → `time.spec.ts`.
- `describe` com o nome da função (ou do assunto); `it` descreve o comportamento em português ("vira o dia na meia-noite local"), não a implementação.
- Sem globais: `describe`, `it`, `expect` e `vi` vêm de `vitest`. O alias `@/` funciona como no código.
- Nada de rede, relógio real nem sorteio. Datas e horários são fixos nos testes; as funções recebem "hoje" e "agora" como parâmetro justamente para isso.
- Teste o **comportamento atual** e os casos de borda (zero, vazio, virada de mês e de ano, fuso, arredondamento). Se o teste mostrar um bug, o bug é registrado e corrigido à parte, nunca escondido no teste.

### Mocks (só nas fronteiras)

| O quê                                            | Como                                                                  |
| ------------------------------------------------ | --------------------------------------------------------------------- |
| `server-only`                                    | já é trocado por um módulo vazio em `vitest.config.mts`               |
| Cookies, `next/headers`, `next/navigation`       | `vi.mock(...)` no topo do arquivo                                     |
| `fetch`                                          | `vi.stubGlobal("fetch", ...)`; variáveis de ambiente com `vi.stubEnv` |
| `cache` do React (só existe no servidor do Next) | `vi.mock("react", ...)` devolvendo a função como veio                 |

O que o `vi.mock` usa precisa nascer com `vi.hoisted` (ele sobe para o topo do arquivo). Exemplos: `src/app/(auth)/login/actions.spec.ts` (Server Action), `src/proxy.spec.ts` (proxy) e `src/services/auth.service.spec.ts` (service).

## O que está coberto

| Grupo           | Módulos                                                                                                                         |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Datas e fuso    | `utils/time.ts` (inclui os dias de horário de verão, de 23 e 25 horas)                                                          |
| Disponibilidade | `agenda-availability` (comum e encaixe), `period-availability`, `agenda-range`                                                  |
| Recorrência     | `recurrence-schedule` (`occurrences`, `addMonths`, descrição dos dias)                                                          |
| Preços          | `plan-pricing` (centavos com `BigInt`, metade para cima, parcela antes do total, valor sugerido)                                |
| Validações      | plano, usuário, pessoa, serviço, horários de funcionamento                                                                      |
| Filtros e URL   | `payment-filters` (`paymentQuery`)                                                                                              |
| Formatação      | `format`, `masks`, `text` (CPF, CNPJ alfanumérico, telefone, moeda, datas)                                                      |
| Servidor        | `client-ip`, `auth-guard`, `proxy` (renovação e proteção), `auth.service`, Server Action de login, `action-result`, `form-data` |

## O que não está coberto (de propósito)

- **Componentes** (`.tsx`) e telas: a verificação é manual, com a API real, e a **auditoria de acessibilidade** com `axe-core` (ver `docs/decisions.md`).
- **Server Actions e services** além dos listados: são finos (validam e chamam a API) e o servidor é quem decide.
- **Ponta a ponta** (Playwright): não adotado. Se um dia compensar, entra como uma camada à parte.

A cobertura de linhas dos arquivos `.ts` está em torno de 36%, baixa porque conta as actions e os services; nas funções puras listadas acima, os testes cobrem as regras e as bordas. Não há meta mínima de cobertura: ela não trava o PR.

## Como acrescentar um teste

1. Crie `nome.spec.ts` ao lado do arquivo.
2. Importe de `vitest` e do módulo (`@/...`).
3. Rode `npm run test:watch` e escreva primeiro o caso que quebraria se a regra mudasse.
4. Antes do PR: `npm test`, `npm run lint` e `npx tsc --noEmit`.

## Uma verificação útil

Para ter certeza de que um teste protege de verdade, quebre a regra de propósito (por exemplo, tire o cabeçalho que o proxy envia) e confira que o teste falha; depois desfaça. Foi assim que os testes do repasse do IP foram conferidos.

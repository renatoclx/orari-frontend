# Corrigir o rótulo "Paga" da comanda (Financeiro > Comandas)

Siga o CLAUDE.md do projeto (analisar, explicar o plano, aguardar aprovação, só então alterar). Não mexa no backend: os dados da API já bastam. Não faça push nem commit sem eu pedir.

## O bug (encontrado em produção)

Criei um agendamento avulso para as 22:30 de hoje. A comanda do cliente apareceu como **Paga**, sendo que o atendimento nem começou e não existe cobrança.

## Causa

`src/components/checkouts/CheckoutList.tsx`:

```ts
// Aberta enquanto houver algo pendente, de hoje ou anterior; senão, paga.
function isOpen(checkout) { return Number(todayPending) + Number(previousPending) > 0; }
```

`CheckoutBadge` mostra "Aberta" se `isOpen`, senão "Paga", e `OpenButton` mostra "Receber" se aberta, senão "Ver".

No backend, um agendamento avulso só ganha pagamento quando é **concluído** (um job gera a cobrança a cada 5 minutos). Antes disso, `appointments[].payment` é `null` e os totais vêm `0.00`. Para a tela, "nada pendente" virou "paga". O mesmo acontece com uma comanda só de **sessões de pacote** (que não têm pagamento próprio).

## O que fazer (opção A, decidida: só no frontend)

Trocar a regra do rótulo por uma regra de quatro estados, usando os dados que a API já devolve (`appointments[].payment` e `clientPlanId`, `previousPayments[].status`, `todayPending`, `previousPending`, `paidToday`):

1. **Aberta:** há valor pendente (`todayPending + previousPending > 0`). Botão "Receber".
2. **Aguardando conclusão:** não há pendente e existe ao menos um atendimento **sem pagamento** que não seja sessão de pacote (`payment === null` e `clientPlanId === null`): a cobrança só nasce quando o atendimento for concluído. Botão "Ver" (não há o que receber).
3. **Paga:** não há pendente, **nenhum** atendimento aguardando conclusão e existe ao menos um pagamento `PAID` na comanda (em `appointments[].payment` ou em `previousPayments`). Botão "Ver".
4. **Incluída no pacote:** só há sessões de pacote (`payment === null` e `clientPlanId !== null`), sem pendente nem pago. Botão "Ver". Use o mesmo texto que o `CheckoutDialog` já usa para essas linhas.

Ordem de decisão: Aberta, depois Aguardando conclusão, depois Paga, depois Incluída no pacote. Assim, uma comanda com um atendimento pago e outro ainda não concluído **não** aparece como "Paga".

Pontos a verificar no plano:

- Onde mais `isOpen` ou a mesma lógica é usada (filtros, contadores, ordenação, cabeçalho, diálogo `CheckoutDialog`, a regra `readOnly`), e manter tudo coerente.
- Escolher textos curtos e consistentes com `docs/` e com o restante da interface (variante do `Badge` para "Aguardando conclusão", neutra, não "success").
- Extrair a regra para uma função pura e pequena (por exemplo em `utils/`), para testar sem renderizar.

## Testes (vitest)

Cobrir a função da regra, no mínimo:

- atendimento de hoje **sem pagamento** (o caso do bug: 22:30, `payment: null`) → Aguardando conclusão, e **não** Paga;
- só sessão de pacote → Incluída no pacote;
- pagamento pendente → Aberta (de hoje e anterior);
- tudo pago → Paga;
- um pago e outro sem pagamento → Aguardando conclusão;
- um pago e outro pendente → Aberta;
- só pagamentos anteriores pagos hoje (sem atendimento hoje) → Paga;
- comanda sem atendimentos e sem pagamentos (não deve acontecer, mas não pode quebrar).

## Documentação

Atualizar a documentação da tela de comandas em `docs/screens/` e, se houver, `decisions.md`. Registrar em `frontend-technical-debt.md` que a regra do rótulo está só no frontend e que o backend poderia devolver um `status` explícito por comanda.

## Ao final, devolva

Os arquivos modificados, o resumo, os possíveis impactos, os testes executados com o resultado e os próximos passos.

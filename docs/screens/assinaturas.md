# Assinaturas

Plano, valor e situação de cada empresa, **só para o SUPER_ADMIN**. As regras da situação e do somente leitura estão no backend (`docs/business-rules/empresa-e-acesso.md`, "Assinatura").

## Acesso

- Rota `/assinaturas`, item **Assinaturas** no menu do SUPER_ADMIN (ícone de cartão), abaixo de Empresas.
- Quem não é SUPER_ADMIN recebe a página "não encontrada" (a API também recusa).

## Listagem

- Todas as empresas, menos a da plataforma, da mais recente para a mais antiga, com ou sem assinatura (sem paginação: são poucas).
- Colunas: Empresa ("(inativa)" ao lado das inativas), Plano (com "+ N profissionais" e "+ anamnese"), Cobrança (mensal, semestral, anual), Valor cobrado, Situação e Próxima data, com o que ela significa: fim do teste (em teste), vencimento (ativa) ou último dia para pagar (em atraso).
- Situação em badge: Em teste e Em atraso neutras (`secondary`), Ativa verde, Só consulta e Cancelada vermelhas; Sem assinatura com contorno (`outline`).
- Filtro **Situação** na URL (`?situacao=`): Todas, Sem assinatura, Em teste, Ativas, Em atraso, Só consulta e Canceladas. O servidor filtra.
- Ações na linha: **Criar assinatura** (`Plus`) ou **Alterar assinatura** (`Pencil`), que abre o formulário, e, com assinatura, **Pagamentos** (`HandCoins`), que abre o histórico e o registro de pagamentos (`cobrancas.md`).
- No celular, cartões com o plano, o ciclo e o valor numa linha e a situação com a data embaixo.

## Formulário (página `/assinaturas/<empresa>`)

- Título "Nova assinatura" ou "Alterar assinatura", com o nome da empresa; na alteração, a situação atual no topo.
- **Plano e valor:** Plano e Cobrança (obrigatórios), Profissionais extras (0 a 99), Adicional de anamnese (switch), o quadro do **valor sugerido** com "Usar valor sugerido" (`Calculator`) e o **Valor cobrado** (obrigatório, editável: o SUPER_ADMIN pode negociar outro).
  - Valor sugerido: mensal do plano + R$ 16,90 por extra + R$ 24,90 de anamnese; no semestral (−15%) e no anual (−30%), a parcela mensal com desconto termina em ,90 e é multiplicada pelos meses (a mesma conta da landing). A tabela fica em `subscription-catalog.ts`, duplicada da landing.
- **Teste, pagamento e desconto** (os textos das telas do SUPER_ADMIN são para um leigo, decisão de 2026-11-19):
  - **Último dia do teste grátis** (data; o botão ao lado limpa).
  - **Pagamento**: só informação ("Paga até dd/mm/aaaa" ou "Nenhum pagamento registrado ainda"); o pago até não se digita, muda sozinho ao registrar um pagamento.
  - **Oferta de lançamento** (chave): ligada, preenche 50% de desconto até o fim dos 3 primeiros meses de pagamento (do dia seguinte ao pago até, ou ao fim do teste, ou de hoje); "Ajustar" (`Pencil`) mostra Desconto (%) e Desconto vale até para outro combinado.
  - **Cancelamento** (só na alteração): **Cancelar assinatura** (`Ban`) pede confirmação ("usa normalmente até dd/mm e, a partir de dd/mm, passa a só consultar") e a data sai sozinha; cancelada, mostra a data e **Desfazer cancelamento** (`RotateCcw`). As opcionais têm um botão para limpar. É preciso o fim do teste ou o pago até; o desconto exige a data até quando vale.
- Empresa sem assinatura abre no Essencial mensal, com 7 dias de teste contando hoje e o valor sugerido.
- Salvar volta à lista. Se o plano, os extras ou a anamnese mudaram (ou é a primeira assinatura), pergunta **"Aplicar os acessos do plano?"**: "Aplicar" substitui a matriz e os limites da empresa pelos do modelo do plano (profissionais incluídos + extras; com o adicional, as três linhas de Anamnese); "Agora não" mantém os acessos.

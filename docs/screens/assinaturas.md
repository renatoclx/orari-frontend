# Assinaturas

Plano, valor e situação de cada empresa, **só para o SUPER_ADMIN**. As regras da situação e do somente leitura estão no backend (`docs/business-rules/empresa-e-acesso.md`, "Assinatura").

## Acesso

- Rota `/assinaturas`, item **Assinaturas** no menu do SUPER_ADMIN (ícone de cartão), abaixo de Empresas.
- Quem não é SUPER_ADMIN recebe a página "não encontrada" (a API também recusa).

## Listagem

- Todas as empresas, menos a da plataforma, da mais recente para a mais antiga, com ou sem assinatura (sem paginação: são poucas).
- Colunas: Empresa ("(inativa)" ao lado das inativas), Plano (com "+ N profissionais" e "+ anamnese"), Ciclo, Valor (do ciclo), Situação e Data, com o que ela significa: fim do teste (em teste), vencimento (ativa) ou último dia antes do bloqueio (em atraso).
- Situação em badge: Em teste e Em atraso neutras (`secondary`), Ativa verde, Somente leitura e Cancelada vermelhas; Sem assinatura com contorno (`outline`).
- Filtro **Situação** na URL (`?situacao=`): Todas, Sem assinatura, Em teste, Ativas, Em atraso, Somente leitura e Canceladas. O servidor filtra.
- Ação única na linha: **Criar assinatura** (`Plus`) ou **Alterar assinatura** (`Pencil`), que abre o formulário.
- No celular, cartões com o plano, o ciclo e o valor numa linha e a situação com a data embaixo.

## Formulário (página `/assinaturas/<empresa>`)

- Título "Nova assinatura" ou "Alterar assinatura", com o nome da empresa; na alteração, a situação atual no topo.
- **Plano e valor:** Plano e Ciclo (obrigatórios), Profissionais extras (0 a 99), Adicional de anamnese (switch), o quadro do **valor sugerido** com "Usar valor sugerido" (`Calculator`) e o **Valor do ciclo** (obrigatório, editável: o SUPER_ADMIN pode negociar outro).
  - Valor sugerido: mensal do plano + R$ 16,90 por extra + R$ 24,90 de anamnese; no semestral (−15%) e no anual (−30%), a parcela mensal com desconto termina em ,90 e é multiplicada pelos meses (a mesma conta da landing). A tabela fica em `subscription-catalog.ts`, duplicada da landing.
- **Datas:** Fim do teste, Pago até, Desconto (%) e Desconto até, Cancelada em. As opcionais têm um botão para limpar. É preciso o fim do teste ou o pago até; o desconto exige a data até quando vale.
- Empresa sem assinatura abre no Essencial mensal, com 7 dias de teste contando hoje e o valor sugerido.
- Salvar volta à lista. Se o plano, os extras ou a anamnese mudaram (ou é a primeira assinatura), pergunta **"Aplicar os acessos do plano?"**: "Aplicar" substitui a matriz e os limites da empresa pelos do modelo do plano (profissionais incluídos + extras; com o adicional, as três linhas de Anamnese); "Agora não" mantém os acessos.

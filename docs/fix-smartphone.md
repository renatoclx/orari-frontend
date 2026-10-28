# Manutenção no Layout de Celular

Pequenos ajustes que devem ser realizados no para melhorar a UX no aparelho celular.
Estas correções são exclusivamente para dispositivos móveis.

## Tela Agendamentos

- Remover os botões de seta < e >, remover o botão hoje e ajustar os botões Novo Agendamento e Encaixar Horário, um abaixo do outro (Novo Agendamento deve ficar acima). No celular, apenas o calendário que está no header já cumpre a função para procurar as datas.
- Ao clicar em um agendamento para visualizar as informações, o popover "Fechar" está carregando como visível. Ele só deve aparecer quando o mouse passar por cima do botão. O problema acontece no mobile e no desktop.

---

## Recorrências

- Em Visualizar > Dados da recorrência, ajustar o tamanho dos botões Editar observações e Cancelar Recorrência, sempre pensando em manter na largura da div pai, para seguir a UX.

- Em Sessões, transformar a linha da tabela em uma espécie de card, da forma como é feita a listagem das Recorrências, por exemplo, para que não tenha scroll no eixo X.

---

## Pessoas

### Clientes

- Não há necessidade de mostrar os cards, estão atrapalhando.
- Ajustar as abas conforme boas práticas de UX em um dispositivo móvel, porque como os cards estão ocupando a tela, elas não aparecem no mobile.

---

## Contratações

### Dados da contratação

- Ajustar o tamanho do botão Cancelar contratação para ocupar o tamanho da tela conforme padrão de UX que já foi feito.

### Agendas

- O botão Ver sessões está estourando o layout no eixo X. Altere para que seja um ícone no mobile
- O modal ver sessões está com scroll em X. Ajustar para a mesma questão dos modais de tabela: Exibir a linha e um formato de card seguindo padrão já existente.

---

## Financeiro

### Comandas

- Em Atendimentos de hoje, existe um span que está quebrando o layout, fazendo com que desalinhe o título da badge, remover esse span no mobile para alinhar os itens.

### Pagamentos

- Remova os cards, deixe apenas a listagem de Pagamentos.

---

## Anamnese

### Fichas Preenchidas

- O botão Nova Ficha deve seguir o padrão de ter o tamanho da tela.
- No modal de visualizar fichas, O botão abrir deve seguir o padrão de ocupar toda a tela, com ícone de identificação da funcionalidade.
- Ao abrir uma ficha de anamnese, o botão imprimir não precisa aparecer no mobile.
- Ajustar o botão novo acompanhamento no tamanho da tela.
- Em novo acompanhamento, os botões também estão fora da regra. Neste caso, devem ser um ao lado do outro.

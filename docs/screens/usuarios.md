# Usuários

## Listagem

### Colunas

- Nome
- E-mail
- Tipo de Usuário
- Função (badge com o cargo da pessoa vinculada)
- Status
- Ações
  - Visualizar
  - Alterar usuário.
  - Alterar senha
  - Inativar.
  - Reativar (só nos inativos).

### Regras específicas

- O status é controlado pelo deletedAt. A listagem traz ativos e inativos, do mais recente para o mais antigo, com paginação.
- Busca por nome acima da lista (mesmo componente das outras listagens): o termo vai para a URL (`?q=`), a lista atualiza ao digitar e volta para a primeira página. A busca é parcial e não diferencia maiúsculas, mas **acentos contam** ("joao" não acha "João"). Sem resultado, a lista mostra "Nenhum usuário encontrado para “termo”."; o termo se mantém ao paginar. Não há filtro por status.
- Tipo de usuário deve ser exibido como Badge (Super administrador, Administrador, Usuário).
- "Alterar" em destaque; as demais ações no menu de três pontos.
- Usuário inativo só tem Visualizar e Reativar (a API não altera usuário inativo).
- O usuário logado aparece com "(você)", não tem "Inativar" e não pode alterar o próprio tipo.
- O ADMIN não vê contas SUPER_ADMIN e não pode atribuir esse tipo (a opção não aparece).

---

## Cadastro

### Campos

- Nome
- E-mail
- Tipo de Usuário
- Função (Nenhuma, Profissional ou Funcionário) e, escolhida, a pessoa (Profissional ou Funcionário)
- Senha
- Confirme a senha

### Regras Específicas

- Nome obrigatório;
- E-mail obrigatório;
- Tipo de Usuário obrigatório;
- Senha Obrigatória, de 8 a 72 caracteres (o limite é em bytes: letras acentuadas contam como 2);
- A confirmação de senha deve ser igual ao campo de senha;
- E-mail em formato válido e único entre os usuários ativos (o servidor responde no campo se já existir).

### Vínculo com um profissional ou funcionário

- O campo **Função** vincula o usuário ao cadastro de uma pessoa (`peopleId`): **Profissional** ou **Funcionário** (recepção, secretaria), ou **Nenhuma**. Não há flag própria: ter ou não o vínculo é a informação.
- Só o vínculo com **profissional** dá acesso às fichas de anamnese. O vínculo com funcionário identifica a função do usuário; o acesso dele será tratado à parte.
- Só aparece para ADMIN e USER, e não no cadastro do administrador de uma empresa nova. Escolhida a função, mostra a seleção da pessoa (ativas daquele tipo, até 100 de cada, carregadas na própria página), obrigatória. Trocar a função limpa a pessoa escolhida.
- Uma pessoa liga-se a no máximo um usuário ativo: se já estiver ligada, a API responde 409 e a mensagem vai para o campo da pessoa.
- Na alteração, escolher "Nenhuma" desfaz o vínculo. Um vínculo com pessoa que ficou inativa aparece como "Cadastro inativo".
- A coluna **Função** (e o "Visualizar") mostra o **cargo** da pessoa (`profession`), ou "Profissional" / "Funcionário" quando não há cargo. A cor diferencia profissional (verde) de funcionário (neutra). Sem vínculo, "--". O nome da pessoa não aparece (a API não o devolve).

---

## Alteração de Usuário

- A alteração deve seguir os mesmos campos de cadastro, exceto senha e confirmação de senha.

---

## Alteração de senha

- A senha só será alterada mediante a confirmação de senha.
- Campos obrigatórios.

---

## Inativação

- A inativação reflete o campo deletedAt, com confirmação. O usuário perde o acesso na hora.

## Reativação

- Limpa o deletedAt. Se o e-mail estiver em uso por outro usuário ativo, a API recusa e a tela mostra o motivo.

---

### Layout do dialog

- Ao clicar em Novo Usuário, usar dialog para realizar as operações de inclusão,
  alteração e alteração de senha.
  - Nome;
  - E-mail;
  - Tipo de usuário;
  - Senha;
  - Confirme sua senha;

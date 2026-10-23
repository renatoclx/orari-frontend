# Empresas

Gestão das empresas da plataforma, **só para o SUPER_ADMIN**. Substitui o cadastro por chamadas diretas à API. A própria empresa altera o nome fantasia, a logo e os horários em Configurações (`configuracoes.md`).

## Acesso

- Rota `/empresas`, item **Empresas** no fim do menu lateral (ícone de prédio), visível apenas para o SUPER_ADMIN.
- Quem não é SUPER_ADMIN não vê o item e, se abrir o endereço, recebe a página "não encontrada" (a API também recusa).

## Listagem

### Colunas

- Razão social (com "(sua empresa)" na empresa de quem está logado)
- Nome fantasia ("--" quando não há)
- Documento (CPF ou CNPJ, com máscara)
- Subdomínio
- Status
- Ações
  - **Cadastrar administrador** (botão só com ícone, só nas ativas) e **Alterar** (desabilitado nas inativas)
  - Menu de três pontos: Visualizar, Inativar (só nas ativas, e nunca na própria empresa) e Reativar (só nas inativas)

### Regras específicas

- A API traz as empresas da mais recente para a mais antiga, com paginação e filtro de status; não há busca por nome.
- Filtro **Status** na URL (`?status=`): Todas as empresas (padrão), Ativas e Inativas.
- Empresa inativa só tem Visualizar e Reativar. Enquanto está inativa, os usuários dela não entram e os dados ficam inacessíveis (os dados são mantidos).
- No celular, lista empilhada com as mesmas informações.

---

## Cadastro e alteração (dialog)

### Campos

- **Razão social** (obrigatório; para CPF, o nome da pessoa)
- **Nome fantasia** (opcional, até 100 caracteres; sem ele o Orari mostra a razão social)
- **CPF ou CNPJ** (obrigatório): o rótulo vira CPF ou CNPJ pelo tamanho; os dígitos verificadores são conferidos na tela (CNPJ numérico ou alfanumérico) e a máscara é aplicada ao sair do campo
- **Data de fundação** (opcional): só aparece para CNPJ; quem usa CPF não tem data
- **Subdomínio** (obrigatório): letras minúsculas, números e hífens, sem hífen nas pontas
- **Fuso horário** (obrigatório): lista dos fusos do Brasil, com Brasília (`America/Sao_Paulo`) como padrão; um fuso fora da lista, já cadastrado, continua selecionável na alteração

### Regras específicas

- Documento ou subdomínio já usados: a API responde 409 ("Já existe uma empresa com este documento ou subdomínio") e a mensagem aparece no formulário.
- A empresa nasce ativa.
- A alteração aceita todos os campos acima. Na alteração, vazio remove o nome fantasia e a data de fundação.
- A logo **não** é editada aqui: cada empresa troca a sua em Configurações (a API só aceita a logo da própria empresa).

---

## Cadastrar administrador

- Depois de cadastrar a empresa, o dialog de administrador abre sozinho; o botão com ícone de usuário, na linha de cada empresa ativa, abre o mesmo dialog depois.
- Reaproveita o dialog de Usuários (`usuarios.md`) com o **tipo fixo em Administrador** e a empresa já definida: nome, e-mail, senha e confirmação.
- A API exige a empresa quando o SUPER_ADMIN cria um usuário (`companyId`); o dialog a envia.
- Pode ser fechado sem cadastrar: a empresa fica sem quem entre até alguém cadastrar o administrador.

---

## Visualizar

- Dialog só de leitura: razão social, nome fantasia, documento (CPF ou CNPJ), data de fundação (se houver), subdomínio, fuso horário e status.

## Inativação e reativação

- Inativar tem confirmação ("Inativar empresa?") e a empresa continua na lista como Inativa. A empresa do próprio SUPER_ADMIN não pode ser inativada (a API recusa; o item não aparece).
- Reativar limpa a inativação e devolve o acesso.

---

## Pendências

- **Logo de outras empresas:** a API só tem `POST` e `DELETE /companies/me/logo`. Para o SUPER_ADMIN trocar a logo de qualquer empresa, o backend precisa de rotas `/companies/:id/logo`; depois o formulário ganha o envio da logo.
- **Usuários do SUPER_ADMIN:** a tela de Usuários ainda não pede a empresa ao SUPER_ADMIN, que a API exige para criar usuários (ver `frontend-technical-debt.md`).

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
  - **Cadastrar administrador** e **Acessos e limites** (botões só com ícone, só nas ativas) e **Alterar** (desabilitado nas inativas)
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

## Acessos e limites

> Os dados vêm da API (`GET` e `PUT /companies/:id/access`, só SUPER_ADMIN). O dialog busca ao abrir ("Buscando…"; se falhar, a mensagem e "Tentar de novo"). Ao salvar, a API valida a matriz (dependências entre funcionalidades) e a recusa aparece num aviso, com o dialog aberto. Contexto: Obsidian, pasta "Planos e assinatura".

- Botão com ícone na linha de cada empresa ativa, só para o SUPER_ADMIN. Abre um dialog com o nome da empresa.
- **Matriz de funcionalidades:** uma linha por funcionalidade do menu, agrupadas (Agenda, Cadastros, Pacotes, Financeiro, Anamnese, Turmas, Empresa), e as colunas **Visualiza**, **Edita**, **Cria** e **Exclui/Inativa**, cada uma com uma caixa de seleção.
  - Edita, Cria e Exclui/Inativa exigem Visualiza: desmarcar Visualiza desmarca e desabilita as outras da linha.
  - Coluna que não se aplica à funcionalidade fica desabilitada com "–" (ex.: Auditoria só tem Visualiza). A Ajuda não entra: é sempre visível.
  - Vale para a empresa toda (todos os administradores dela); não há permissão por usuário. Só existem os tipos ADMIN e CLIENT.
  - Funcionalidade nova nasce **desmarcada** nas empresas existentes; o SUPER_ADMIN libera.
  - "Só leitura" (downgrade ou suspensão) é Visualiza marcado e o resto desmarcado: os dados ficam.
- **Limites** (abaixo da matriz): **Profissionais** (incluindo o administrador que atua; o básico permite o administrador + 2) e **Administradores** (usuários com acesso). Mostram o uso ("em uso: 2 de 3"). Baixar o limite abaixo do uso é permitido, com aviso: a empresa continua funcionando e só não cadastra novos.
- Os **modelos de plano** (nomes a definir) entram como atalho que preenche matriz e limites, ainda editáveis.
- **Efeito para a empresa:** o `GET /auth/me` traz os acessos (`access.features`) e a tela os usa para esconder o que a empresa não tem (ver `layout.md`). Quem abre direto o endereço de uma tela sem acesso vê "não encontrada" (todas as telas de funcionalidade). Sem a ação, somem os botões: "Novo" (Cria), "Alterar" (Edita), Inativar, Excluir e Reativar (Exclui/Inativa), os atalhos da barra lateral e, no agendamento, Cancelar, Remanejar e Alterar (Edita). Sem Turmas liberadas, a agenda, a nova recorrência e a nova contratação não consultam turmas. Ao estourar um limite, a API recusa com a mensagem do plano (ex.: "O plano da empresa permite 3 profissionais…"), mostrada ao salvar.

---

## Visualizar

- Dialog só de leitura: razão social, nome fantasia, documento (CPF ou CNPJ), data de fundação (se houver), subdomínio, fuso horário e status.

## Inativação e reativação

- Inativar tem confirmação ("Inativar empresa?") e a empresa continua na lista como Inativa. A empresa do próprio SUPER_ADMIN não pode ser inativada (a API recusa; o item não aparece).
- Reativar limpa a inativação e devolve o acesso.

---

## Pendências

- **Logo de outras empresas:** a API só tem `POST` e `DELETE /companies/me/logo`. Para o SUPER_ADMIN trocar a logo de qualquer empresa, o backend precisa de rotas `/companies/:id/logo`; depois o formulário ganha o envio da logo.
- **Acessos e limites:** botões dentro de diálogos menos comuns ainda não seguem o acesso (ver `frontend-technical-debt.md`). Empresas de teste atuais ficam com acesso total e limites de 999 até o fim do prazo de testes.
- **Usuários do SUPER_ADMIN:** a tela de Usuários ainda não pede a empresa ao SUPER_ADMIN, que a API exige para criar usuários (ver `frontend-technical-debt.md`).

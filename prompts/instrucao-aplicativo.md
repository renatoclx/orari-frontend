Quero melhorar a experiência de instalação do PWA do Orari, sem alterar funcionalidades existentes.

Antes de qualquer alteração:

1. Leia a documentação do projeto (CLAUDE.md e demais documentos relevantes).
2. Analise a implementação atual do PWA (manifest, service worker e frontend).
3. Explique resumidamente como pretende implementar a solução.
4. Aguarde minha aprovação antes de modificar qualquer arquivo.

Após a aprovação, implemente a seguinte funcionalidade:

## Objetivo

Facilitar a instalação do PWA para usuários Android e iPhone.

## Android

- Detectar quando o navegador disparar o evento `beforeinstallprompt`.
- Armazenar esse evento para uso posterior.
- Exibir um banner ou modal discreto informando que o aplicativo pode ser instalado.
- O componente deve possuir:
  - título;
  - breve descrição;
  - botão "Instalar";
  - botão para fechar.
- Ao clicar em "Instalar", chamar `beforeinstallprompt.prompt()`.
- Após a resposta do usuário (`accepted` ou `dismissed`), limpar o evento armazenado.
- Não exibir esse banner quando o aplicativo já estiver instalado (`display-mode: standalone`).

## iPhone

- Detectar dispositivos iOS.
- Verificar se o aplicativo ainda não está instalado.
- Exibir um modal contendo instruções visuais para instalação.
- O modal deve explicar que o usuário deve:
  1. tocar no botão Compartilhar;
  2. selecionar "Adicionar à Tela de Início".
- Caso o usuário não esteja utilizando o Safari, informar que a instalação deve ser feita através do Safari.

## Requisitos

- Não alterar regras de negócio.
- Não modificar rotas existentes.
- Não alterar autenticação.
- Não alterar o service worker, exceto se realmente necessário.
- Reaproveitar componentes existentes caso faça sentido.
- Seguir o padrão visual já utilizado pelo projeto.
- Manter a solução simples e de fácil manutenção.
- Evitar dependências externas apenas para esta funcionalidade.

## Entrega

Ao finalizar, informe:

- arquivos criados;
- arquivos modificados;
- resumo das alterações;
- possíveis limitações da implementação;
- sugestões de melhorias futuras (sem implementá-las).

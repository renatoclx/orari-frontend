# Login e recuperação de senha

## Login

### Campos

- E-mail
- Senha (com opção de mostrar/ocultar)

### Regras específicas

- Link "Esqueci minha senha" (ao lado do rótulo Senha) leva a `/esqueci-senha`.
- Sem login social (Google ou outro OAuth - implementação futura).
- Abaixo do botão, "Ainda não usa o Orari? **Teste grátis por 7 dias**" leva ao cadastro sozinho (`cadastro.md`).

---

## Recuperação de senha

- `/esqueci-senha`: pede o e-mail e mostra sempre a mesma confirmação (não revela se a conta existe). O link vale 1 hora.
- `/redefinir-senha?token=…` (link do e-mail): nova senha e confirmação, uma abaixo da outra, e um olho que mostra as duas. Abre mesmo com uma sessão aberta. Link usado, vencido ou sem token: aviso e "Pedir um novo link". Depois de salvar: "Entrar" (profissional: "Entrar no app"); os aparelhos conectados saem.

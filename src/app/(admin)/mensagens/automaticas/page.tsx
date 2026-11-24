import { redirect } from "next/navigation";

// A tela única de Automáticas foi dividida por quem recebe (cliente, profissional
// e administrador). O endereço antigo leva à primeira.
export default function AutoMessagesRedirect() {
  redirect("/mensagens/clientes");
}

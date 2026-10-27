# Auditoria: duas ações novas no backend

## Contexto

O backend passou a registrar na auditoria quem ganha ou perde acesso aos dados de saúde pelo **tipo de usuário** (antes, só o vínculo com profissional era registrado). O `GET /audit-logs` pode devolver agora duas ações novas, que o front ainda não conhece:

| Ação                | Quando é gravada                                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `USER_TYPE_CHANGED` | criação de usuário do tipo ADMIN; qualquer mudança de tipo no `PATCH /users/:id` (inclusive tirar o ADMIN de alguém) |
| `USER_RESTORED`     | reativação (`PATCH /users/:id/restore`) de usuário ADMIN ou vinculado a uma pessoa                                   |

Formato do registro igual ao `USER_LINK_CHANGED`: `entityType: "USER"`, `entityId` = usuário alterado, `userId` = quem fez a alteração (pode ser um SUPER_ADMIN, que aparece na auditoria da clínica), `clientId: null`. Não há tipo anterior nem novo no registro.

Nada mudou nas rotas nem nos payloads de usuários.

## O que fazer

1. `src/types/audit.ts`: acrescentar `"USER_TYPE_CHANGED"` e `"USER_RESTORED"` ao tipo `AuditAction`.
2. `src/components/anamnesis/audit/audit-filters.ts`: rótulos em `auditActionLabels`, junto do `USER_LINK_CHANGED`:
   - `USER_TYPE_CHANGED: "Tipo de usuário alterado"`
   - `USER_RESTORED: "Usuário reativado"`
     (o `Record<AuditAction, string>` faz o TypeScript acusar se faltar algum; o filtro por ação já se monta a partir dessa lista.)
3. Conferir que a lista de auditoria mostra o nome do usuário alterado (`entityId`) e de quem alterou (`userId`) nessas ações, como já faz no `USER_LINK_CHANGED`. Um `userId` de SUPER_ADMIN pode não estar na lista de usuários da empresa (o ADMIN não enxerga SUPER_ADMINs): nesse caso, mostrar algo como "Administrador da plataforma" em vez de um id cru.
4. Atualizar o `audit-filters.spec.ts` se ele confere a lista de ações.

## Fora do escopo

Não mudar telas de usuários nem a anamnese.

## Verificação

- `tsc` e os testes de `audit-filters`.
- Manual: com a API local atualizada (`npx prisma migrate deploy`), promover um usuário a ADMIN e reativar um usuário vinculado; os dois registros aparecem na tela de auditoria com os rótulos novos, e o filtro por ação os encontra.

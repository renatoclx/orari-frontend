# Regras

- Mobile First.
- Utilizar Server Components quando possível.
- Utilizar Client Components apenas quando necessário.
- Evitar duplicação de componentes.
- Não acessar a API diretamente dentro dos componentes quando houver um service.
- Chamadas à API somente pelos services (que usam o `apiFetch`); nunca do navegador.
- Componentes de interface vêm do shadcn/ui (`src/components/ui/`); verificar antes de criar um novo.
- Cookies só são gravados ou apagados em Server Actions, Route Handlers e no proxy.

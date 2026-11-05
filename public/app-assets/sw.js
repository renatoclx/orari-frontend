// Service worker do app do cliente (screens/app-cliente.md, "Avisos"). Roda no
// aparelho mesmo com o app fechado: recebe o aviso da API (Web Push) e mostra a
// notificação. Vale só para /app/ (a clínica não é afetada); o next.config.ts
// manda o cabeçalho Service-Worker-Allowed que permite isso daqui de /app-assets/.
// Não guarda nada em cache: o app continua precisando de internet.

const ICON = "/app-assets/icon-192.png";
const DEFAULT_URL = "/app/menu/avisos";

// Versão nova do arquivo assume na hora, sem esperar o app ser fechado.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

// O aviso chega cifrado; o navegador já entrega o JSON da API:
// { title, body, url }.
self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    // Conteúdo inesperado: mostra o aviso genérico em vez de nada.
  }
  const title = data.title || "Orari";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "Você tem um aviso novo.",
      icon: ICON,
      badge: ICON,
      data: { url: data.url || DEFAULT_URL },
    }),
  );
});

// Tocar no aviso: reaproveita o app aberto (indo ao caminho do aviso) ou abre.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(
    (event.notification.data && event.notification.data.url) || DEFAULT_URL,
    self.location.origin,
  );
  // Só caminhos do próprio app: o aviso nunca abre outro site.
  const target =
    url.origin === self.location.origin && url.pathname.startsWith("/app")
      ? url.href
      : new URL(DEFAULT_URL, self.location.origin).href;

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((windows) => {
        const open = windows.find((client) =>
          new URL(client.url).pathname.startsWith("/app"),
        );
        if (!open) return self.clients.openWindow(target);
        // navigate só funciona na janela que este service worker controla;
        // se falhar, abre uma nova.
        return open
          .focus()
          .then((client) => client.navigate(target))
          .catch(() => self.clients.openWindow(target));
      }),
  );
});

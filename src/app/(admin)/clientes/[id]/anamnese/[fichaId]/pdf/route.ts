import { isUuid } from "@/lib/uuid";
import { ApiError } from "@/services/api";
import { getAnamnesisPdf } from "@/services/anamnesis.service";

// Dado de saúde: nada de cache, nem do navegador nem de proxy.
const NO_STORE = { "Cache-Control": "no-store" };

/**
 * PDF da ficha (?includeHistory=true|false, padrão true). A API exige o token no
 * cabeçalho, então um link direto não serviria: este Route Handler, no servidor
 * do Next, lê o token do cookie httpOnly, busca o PDF e entrega os bytes ao
 * navegador. Erros voltam em JSON { message }, que a tela mostra.
 */
export async function GET(
  request: Request,
  { params }: RouteContext<"/clientes/[id]/anamnese/[fichaId]/pdf">,
) {
  const { fichaId } = await params;
  if (!isUuid(fichaId)) {
    return Response.json(
      { message: "Ficha não encontrada." },
      { status: 404, headers: NO_STORE },
    );
  }

  const includeHistory =
    new URL(request.url).searchParams.get("includeHistory") !== "false";

  try {
    const { bytes, contentType } = await getAnamnesisPdf(
      fichaId,
      includeHistory,
    );
    return new Response(bytes, {
      headers: {
        "Content-Type": contentType,
        // Nome genérico: cabeçalhos e logs não levam dado pessoal.
        "Content-Disposition": 'inline; filename="ficha-anamnese.pdf"',
        ...NO_STORE,
      },
    });
  } catch (error) {
    if (!(error instanceof ApiError)) throw error;
    return Response.json(
      { message: error.message },
      // Falha de conexão (status 0) é 502 para o navegador.
      { status: error.status || 502, headers: NO_STORE },
    );
  }
}

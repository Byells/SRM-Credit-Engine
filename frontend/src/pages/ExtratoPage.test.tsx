import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ExtratoPage from "./ExtratoPage";
import { ToastProvider } from "../components/ToastProvider";
import api from "../services/api";

function renderPage() {
  return render(
    <ToastProvider>
      <ExtratoPage />
    </ToastProvider>,
  );
}

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api, true);

function itemForPage(page: number) {
  return {
    id: page,
    cedenteNome: `Cedente ${page}`,
    produtoNome: "Duplicata Mercantil",
    moedaTituloCodigo: "BRL",
    moedaPagamentoCodigo: "BRL",
    valorFace: "1000.00",
    valorLiquido: "950.00",
    status: "LIQUIDADA",
    dataTransacao: "2026-01-01T00:00:00.000Z",
    dataLiquidacao: null,
  };
}

const MOEDAS = [
  { id: 1, nome: "Real Brasileiro", codigo: "BRL" },
  { id: 2, nome: "Dólar Americano", codigo: "USD" },
];

const CEDENTES = [{ id: 1, nome: "Empresa Exemplo SA" }];

describe("ExtratoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockedApi.get.mockImplementation((url: string, config: any) => {
      if (url === "/moedas") return Promise.resolve({ data: MOEDAS });
      if (url === "/cedentes") return Promise.resolve({ data: CEDENTES });
      const page = config.params.page;
      const pageSize = config.params.pageSize;
      return Promise.resolve({
        data: { data: [itemForPage(page)], total: 45, page, pageSize },
      });
    });
  });

  it("loads the first page on mount and shows the pagination summary", async () => {
    renderPage();

    expect(await screen.findByText("Cedente 1")).toBeInTheDocument();
    expect(screen.getByText(/página 1 de 3/i)).toBeInTheDocument();
    expect(screen.getByText(/45 resultados/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /anterior/i })).toBeDisabled();
  });

  it("navigates to the next page and back, requesting the right page param each time", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Cedente 1");

    await user.click(screen.getByRole("button", { name: /próxima/i }));
    await screen.findByText("Cedente 2");
    expect(screen.getByText(/página 2 de 3/i)).toBeInTheDocument();
    expect(mockedApi.get).toHaveBeenLastCalledWith(
      "/extrato",
      expect.objectContaining({ params: expect.objectContaining({ page: 2 }) }),
    );

    await user.click(screen.getByRole("button", { name: /anterior/i }));
    await screen.findByText("Cedente 1");
    expect(screen.getByText(/página 1 de 3/i)).toBeInTheDocument();
  });

  it("resets to page 1 and refetches when the page size changes", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Cedente 1");
    await user.click(screen.getByRole("button", { name: /próxima/i }));
    await screen.findByText("Cedente 2");

    const pageSizeSelect = screen.getByLabelText(/itens por página/i);
    await user.selectOptions(pageSizeSelect, "50");

    await waitFor(() =>
      expect(mockedApi.get).toHaveBeenLastCalledWith(
        "/extrato",
        expect.objectContaining({
          params: expect.objectContaining({ page: 1, pageSize: 50 }),
        }),
      ),
    );
  });

  it("includes the selected status in the request params", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Cedente 1");

    const statusSelect = screen.getByLabelText(/^status$/i);
    await user.selectOptions(statusSelect, "PENDENTE");
    await user.click(screen.getByRole("button", { name: /buscar/i }));

    await waitFor(() =>
      expect(mockedApi.get).toHaveBeenLastCalledWith(
        "/extrato",
        expect.objectContaining({
          params: expect.objectContaining({ status: "PENDENTE" }),
        }),
      ),
    );
  });

  it("shows cedente and moeda pagamento as selects with names, sending the id in the request", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("Cedente 1");

    const cedenteSelect = screen.getByLabelText(/^cedente$/i);
    expect(
      screen.getByRole("option", { name: /empresa exemplo sa/i }),
    ).toBeInTheDocument();
    await user.selectOptions(cedenteSelect, "1");

    const moedaSelect = screen.getByLabelText(/moeda pagamento/i);
    expect(
      screen.getByRole("option", { name: /real brasileiro \(brl\)/i }),
    ).toBeInTheDocument();
    await user.selectOptions(moedaSelect, "2");

    await user.click(screen.getByRole("button", { name: /buscar/i }));

    await waitFor(() =>
      expect(mockedApi.get).toHaveBeenLastCalledWith(
        "/extrato",
        expect.objectContaining({
          params: expect.objectContaining({
            cedenteId: "1",
            moedaPagamentoId: "2",
          }),
        }),
      ),
    );
  });

  it("shows a Liquidar button only for PENDENTE rows and settles the transaction on click", async () => {
    mockedApi.get.mockImplementation((url: string, config: any) => {
      if (url === "/moedas") return Promise.resolve({ data: MOEDAS });
      if (url === "/cedentes") return Promise.resolve({ data: CEDENTES });
      const page = config.params.page;
      const pageSize = config.params.pageSize;
      return Promise.resolve({
        data: {
          data: [{ ...itemForPage(page), status: "PENDENTE" }],
          total: 45,
          page,
          pageSize,
        },
      });
    });
    mockedApi.patch.mockResolvedValue({ data: { id: 1, status: "LIQUIDADA" } });

    const user = userEvent.setup();
    renderPage();

    const liquidarButton = await screen.findByRole("button", {
      name: /liquidar/i,
    });
    await user.click(liquidarButton);

    expect(mockedApi.patch).toHaveBeenCalledWith("/transacoes/1/liquidar");
    expect(
      await screen.findByText(/transação 1 liquidada com sucesso/i),
    ).toBeInTheDocument();
  });
});

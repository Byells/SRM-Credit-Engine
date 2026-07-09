import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CambioPage from "./CambioPage";
import { ToastProvider } from "../components/ToastProvider";
import api from "../services/api";

function renderPage() {
  return render(
    <ToastProvider>
      <CambioPage />
    </ToastProvider>,
  );
}

vi.mock("../services/api", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api, true);

const MOEDAS = [
  { id: 1, nome: "Real Brasileiro", codigo: "BRL" },
  { id: 2, nome: "Dólar Americano", codigo: "USD" },
];

const TAXAS = [
  {
    id: 1,
    moedaOrigem: MOEDAS[0],
    moedaDestino: MOEDAS[1],
    valorTaxa: "0.200000",
    dataTaxa: "2026-01-01T00:00:00.000Z",
  },
];

describe("CambioPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedApi.get.mockImplementation((url: string) => {
      if (url === "/moedas") return Promise.resolve({ data: MOEDAS });
      if (url === "/cambio") return Promise.resolve({ data: TAXAS });
      return Promise.reject(new Error(`unexpected url: ${url}`));
    });
  });

  it("lists the currently registered exchange rates", async () => {
    renderPage();

    expect(await screen.findByText("0.200000")).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: /real brasileiro \(brl\)/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("cell", { name: /dólar americano \(usd\)/i }),
    ).toBeInTheDocument();
  });

  it("blocks submit when origem and destino are the same currency", async () => {
    const user = userEvent.setup();
    renderPage();

    await screen.findByText("0.200000");

    await user.selectOptions(screen.getByLabelText(/moeda origem/i), "1");
    await user.selectOptions(screen.getByLabelText(/moeda destino/i), "1");

    expect(
      await screen.findByText(/deve ser diferente da origem/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /cadastrar taxa/i }),
    ).toBeDisabled();
  });

  it("submits a valid rate and refreshes the list", async () => {
    const user = userEvent.setup();
    mockedApi.post.mockResolvedValue({ data: { id: 2 } });
    renderPage();

    await screen.findByText("0.200000");

    await user.selectOptions(screen.getByLabelText(/moeda origem/i), "1");
    await user.selectOptions(screen.getByLabelText(/moeda destino/i), "2");
    await user.type(screen.getByLabelText(/^taxa/i), "5.25");

    await user.click(screen.getByRole("button", { name: /cadastrar taxa/i }));

    await waitFor(() =>
      expect(mockedApi.post).toHaveBeenCalledWith("/cambio", {
        moedaOrigemId: 1,
        moedaDestinoId: 2,
        valorTaxa: "5.25",
      }),
    );
    expect(
      await screen.findByText(/taxa de câmbio cadastrada com sucesso/i),
    ).toBeInTheDocument();
  });
});

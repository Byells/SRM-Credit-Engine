import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TransacaoPage from "./TransacaoPage";
import { ToastProvider } from "../components/ToastProvider";
import api from "../services/api";

function renderPage() {
  return render(
    <ToastProvider>
      <TransacaoPage />
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

describe("TransacaoPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockedApi.get.mockImplementation((url: string) => {
      if (url === "/moedas") {
        return Promise.resolve({
          data: [{ id: 1, nome: "Real", codigo: "BRL" }],
        });
      }
      if (url === "/tipos_recebiveis") {
        return Promise.resolve({
          data: [{ id: 1, nome: "Duplicata Mercantil", spread: "0.0150" }],
        });
      }
      if (url === "/cedentes") {
        return Promise.resolve({
          data: [{ id: 1, nome: "Empresa Exemplo SA" }],
        });
      }
      if (url === "/taxa-base") {
        return Promise.resolve({
          data: { nome: "Taxa Referencial", valor: "0.0100" },
        });
      }
      return Promise.reject(new Error(`unexpected url: ${url}`));
    });
  });

  it("renders the form with the default preview and an enabled submit button", async () => {
    renderPage();

    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: /calcular e criar/i }),
      ).toBeEnabled(),
    );
    expect(screen.getByText(/valor líquido estimado/i)).toBeInTheDocument();
  });

  it("computes the preview using the taxa base fetched from the backend", async () => {
    renderPage();

    expect(await screen.findByText("R$ 862,30")).toBeInTheDocument();
  });

  it("shows a field-level error and disables submit when Valor Face is cleared", async () => {
    const user = userEvent.setup();
    renderPage();

    const submitButton = await screen.findByRole("button", {
      name: /calcular e criar/i,
    });
    await waitFor(() => expect(submitButton).toBeEnabled());

    const valorFaceInput = screen.getByLabelText(/valor face/i);
    await user.clear(valorFaceInput);
    await user.tab();

    expect(
      await screen.findByText(/valor face deve ser maior que 0/i),
    ).toBeInTheDocument();
    expect(submitButton).toBeDisabled();
  });

  it("shows a field-level error when Prazo is set to 0 and re-enables submit once fixed", async () => {
    const user = userEvent.setup();
    renderPage();

    const submitButton = await screen.findByRole("button", {
      name: /calcular e criar/i,
    });
    await waitFor(() => expect(submitButton).toBeEnabled());

    const prazoInput = screen.getByLabelText(/prazo \(meses\)/i);
    await user.clear(prazoInput);
    await user.type(prazoInput, "0");
    await user.tab();

    expect(
      await screen.findByText(/prazo deve ser maior que 0/i),
    ).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    await user.clear(prazoInput);
    await user.type(prazoInput, "6");
    await user.tab();

    await waitFor(() => expect(submitButton).toBeEnabled());
    expect(
      screen.queryByText(/prazo deve ser maior que 0/i),
    ).not.toBeInTheDocument();
  });

  it("blocks submission and does not call the API when the form is invalid", async () => {
    const user = userEvent.setup();
    renderPage();

    const submitButton = await screen.findByRole("button", {
      name: /calcular e criar/i,
    });
    await waitFor(() => expect(submitButton).toBeEnabled());

    const valorFaceInput = screen.getByLabelText(/valor face/i);
    await user.clear(valorFaceInput);
    await user.tab();

    expect(submitButton).toBeDisabled();
    expect(mockedApi.post).not.toHaveBeenCalled();
  });

  it("shows a success toast with the real valorLiquido returned by the backend", async () => {
    const user = userEvent.setup();
    mockedApi.post.mockResolvedValue({
      data: { id: 42, valorLiquido: "862.30" },
    });
    renderPage();

    const submitButton = await screen.findByRole("button", {
      name: /calcular e criar/i,
    });
    await waitFor(() => expect(submitButton).toBeEnabled());

    await user.click(submitButton);

    expect(
      await screen.findByText(/transação criada \(id: 42\).*R\$ 862,30/i),
    ).toBeInTheDocument();
  });

  it("shows a persistent error toast when the API rejects the submit", async () => {
    const user = userEvent.setup();
    mockedApi.post.mockRejectedValue({
      response: { data: { erro: "Cedente inválido" } },
    });
    renderPage();

    const submitButton = await screen.findByRole("button", {
      name: /calcular e criar/i,
    });
    await waitFor(() => expect(submitButton).toBeEnabled());

    await user.click(submitButton);

    const toast = await screen.findByText(/cedente inválido/i);
    expect(toast).toBeInTheDocument();

    const closeButton = screen.getByRole("button", {
      name: /fechar notificação/i,
    });
    await user.click(closeButton);
    expect(screen.queryByText(/cedente inválido/i)).not.toBeInTheDocument();
  });
});

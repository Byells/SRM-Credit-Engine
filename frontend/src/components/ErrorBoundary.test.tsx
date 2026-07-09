import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ErrorBoundary from "./ErrorBoundary";

function Bomb(): never {
  throw new Error("boom");
}

describe("ErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children normally when there is no error", () => {
    render(
      <ErrorBoundary>
        <div>Conteúdo normal</div>
      </ErrorBoundary>,
    );

    expect(screen.getByText("Conteúdo normal")).toBeInTheDocument();
  });

  it("renders a fallback UI instead of crashing when a child throws", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    );

    expect(screen.getByText(/algo deu errado/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /recarregar página/i }),
    ).toBeInTheDocument();
  });
});

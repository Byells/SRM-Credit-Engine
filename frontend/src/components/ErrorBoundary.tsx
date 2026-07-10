import { Component, ErrorInfo, ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Erro não tratado na interface:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary" role="alert">
          <h2>Algo deu errado</h2>
          <p>
            Ocorreu um erro inesperado nesta tela. Você pode recarregar a
            página ou navegar para outra área pelo menu ao lado.
          </p>
          <button onClick={this.handleReload}>Recarregar página</button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

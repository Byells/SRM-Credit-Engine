import { Route, Routes, Link, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TransacaoPage from "./pages/TransacaoPage";
import ExtratoPage from "./pages/ExtratoPage";
import CambioPage from "./pages/CambioPage";
import { ToastProvider } from "./components/ToastProvider";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const location = useLocation();

  return (
    <ToastProvider>
      <div className="app-shell">
        <aside className="sidebar">
          <Link to="/">Dashboard</Link>
          <Link to="/transacao">Simulação</Link>
          <Link to="/extrato">Extrato</Link>
          <Link to="/cambio">Câmbio</Link>
        </aside>
        <main className="content">
          <ErrorBoundary key={location.pathname}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/transacao" element={<TransacaoPage />} />
              <Route path="/extrato" element={<ExtratoPage />} />
              <Route path="/cambio" element={<CambioPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;

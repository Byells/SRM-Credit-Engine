import { Route, Routes, Link, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import TransacaoPage from "./pages/TransacaoPage";
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
        </aside>
        <main className="content">
          <ErrorBoundary key={location.pathname}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/transacao" element={<TransacaoPage />} />
            </Routes>
          </ErrorBoundary>
        </main>
      </div>
    </ToastProvider>
  );
}

export default App;

import { Route, Routes, Link } from "react-router-dom";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link to="/">Dashboard</Link>
      </aside>
      <main className="content">
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;

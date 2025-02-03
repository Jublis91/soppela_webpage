import Home from "./pages/home";
import Soppela from "./pages/soppela";
import Me from "./pages/me";
import Portfolio from "./pages/portfolio";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';

function App() {
  return (
    <Router>
      <div>
        {/* Navigaatiopalkki */}
        <nav>
          <ul>
            <li><Link to="/">Etusivu</Link></li>
            <li><Link to="/me">Minä</Link></li>
            <li><Link to="/portfolio">Portfolio</Link></li>
            <li><Link to="/soppela">Soppela</Link></li>
          </ul>
        </nav>

        {/* Reititys */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/me" element={<Me />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/soppela" element={<Soppela />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

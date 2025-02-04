import Home from "./pages/home";
import Soppela from "./pages/soppela";
import Me from "./pages/me";
import Portfolio from "./pages/portfolio";
import Blog from "./pages/blog";

import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import './App.css';

function Footer() {
  return (
    <footer>
      {/* Tekijänoikeus ja yhteystiedot lisättävä jälkikäteen */}
      <p>© 2025 Emma Nikander. Sivun toteutti <a href="https://github.com/Jublis91" target="_blank">Juuso Nikander</a></p>
      <p>Ota yhteyttä: <a href="S-posti osoite">s-posti osoite</a></p>
      <div className="footer-links">
        <a href="web osoite 1">Web osoite 1</a>
        <a href="web osoite 2">Web osoite 2</a>
      </div>
    </footer>
  );
}

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
            <li><Link to="/blog">Blogi</Link></li>
          </ul>
        </nav>

        {/* Reititys */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/me" element={<Me />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/soppela" element={<Soppela />} />
          <Route path="/blog" element={<Blog />} />
        </Routes>

        {/* Alareuna Footer */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;

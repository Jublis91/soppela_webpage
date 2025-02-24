import { BrowserRouter as Router } from "react-router-dom";
import AppRouter from "./pages/AppRouter";
import "./App.css";

function App() {
  console.log("App-komponentti renderöity");

  return (
    <Router>
      <AppRouter />
    </Router>
  );
}

export default App;

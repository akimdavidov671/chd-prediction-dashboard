import { BrowserRouter, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { AboutPage } from "./pages/AboutPage";
import { CurrentScreeningPage } from "./pages/CurrentScreeningPage";
import { FraminghamRiskPage } from "./pages/FraminghamRiskPage";
import { HomePage } from "./pages/HomePage";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/framingham-risk" element={<FraminghamRiskPage />} />
          <Route path="/current-screening" element={<CurrentScreeningPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

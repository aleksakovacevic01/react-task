import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Navbar, Footer } from "./pages/layout";
import { Home } from "./pages/home";
import { Products } from "./pages/products";
import { BrowserRouter, Route, Routes } from "react-router-dom";
function App() {
  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products" element={<Products />} />
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

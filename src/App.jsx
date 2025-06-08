"use client";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import ClientFormPage from "./pages/ClientFormPage"; // Importa o form corretamente

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/clients/new" element={<ClientFormPage />} />
      <Route path="/clients/:id" element={<ClientFormPage />} />
    </Routes>
  );
}

export default App;

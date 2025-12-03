import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./style.css";
import Home from "./pages/Home.tsx";
import Profile from "./pages/Profile.tsx";
import MethodList from "./pages/MethodList.tsx";
import MethodDetails from "./pages/MethodDetails.tsx";
import Navbar from "./components/Layout/Navbar.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="mx-auto max-w-[430px]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/methods" element={<MethodList />} />
          <Route path="/method-details" element={<MethodDetails />} />
        </Routes>
        <Navbar />
      </div>
    </BrowserRouter>
  </StrictMode>
);

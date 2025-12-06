import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./style.css";
import Home from "./pages/Home.tsx";
import Profile from "./pages/Profile.tsx";
import MethodList from "./pages/MethodList.tsx";
import MethodDetails from "./pages/MethodDetails.tsx";
import Authentication from "./pages/Authentication.tsx";
import Navbar from "./components/Layout/Navbar.tsx";
import ProtectedRoute from "./components/Layout/ProtectedRoute.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="mx-auto max-w-[430px]">
        <div className=" flex flex-col">
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/auth" element={<Authentication />} />
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/methods"
                element={
                  <ProtectedRoute>
                    <MethodList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/method-details"
                element={
                  <ProtectedRoute>
                    <MethodDetails />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </div>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navbar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Navbar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/methods"
              element={
                <ProtectedRoute>
                  <Navbar />
                </ProtectedRoute>
              }
            />
            <Route
              path="/method-details"
              element={
                <ProtectedRoute>
                  <Navbar />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>
);

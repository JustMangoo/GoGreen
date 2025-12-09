import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./style.css";
import Home from "./pages/Home.tsx";
import Account from "./pages/Account.tsx";
import MethodList from "./pages/MethodList.tsx";
import MethodCategories from "./pages/MethodCategories.tsx";
import MethodDetails from "./pages/MethodDetails.tsx";
import Achievements from "./pages/Achievements.tsx";
import Authentication from "./pages/Authentication.tsx";
import Navbar from "./components/Layout/Navbar.tsx";
import TopBar from "./components/Layout/TopBar.tsx";
import ProtectedRoute from "./components/Layout/ProtectedRoute.tsx";

const protectedPages = [
  "/",
  "/profile",
  "/methods",
  "/methods-list",
  "/method-details",
  "/achievements",
];

const pageComponents: Record<string, React.ComponentType> = {
  "/": Home,
  "/profile": Account,
  "/methods": MethodCategories,
  "/methods-list": MethodList,
  "/method-details": MethodDetails,
  "/achievements": Achievements,
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <div className="mx-auto max-w-[430px]">
        <div className="flex flex-col h-screen">
          {/* Top Bar - Outside scroll container */}
          <Routes>
            {protectedPages.map((path) => (
              <Route
                key={`topbar-${path}`}
                path={path}
                element={
                  <ProtectedRoute>
                    <TopBar />
                  </ProtectedRoute>
                }
              />
            ))}
          </Routes>

          {/* Main Content - Scrollable */}
          <div className="flex-1 overflow-auto">
            <Routes>
              <Route path="/auth" element={<Authentication />} />
              {protectedPages.map((path) => {
                const Component = pageComponents[path];
                return (
                  <Route
                    key={`content-${path}`}
                    path={path}
                    element={
                      <ProtectedRoute>
                        <Component />
                      </ProtectedRoute>
                    }
                  />
                );
              })}
            </Routes>
          </div>

          {/* Bottom Navigation */}
          <Routes>
            {protectedPages.map((path) => (
              <Route
                key={`navbar-${path}`}
                path={path}
                element={
                  <ProtectedRoute>
                    <Navbar />
                  </ProtectedRoute>
                }
              />
            ))}
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  </StrictMode>
);

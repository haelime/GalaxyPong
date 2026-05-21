import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { AppShell } from "./components/AppShell";
import { AuthPage } from "./features/AuthPage";
import { GamePage } from "./features/GamePage";
import { LobbyPage } from "./features/LobbyPage";
import { ProfilePage } from "./features/ProfilePage";
import { RecordsPage } from "./features/RecordsPage";
import { SettingsPage } from "./features/SettingsPage";
import "./styles/global.css";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/login", element: <AuthPage mode="login" /> },
  { path: "/register", element: <AuthPage mode="register" /> },
  {
    path: "/",
    element: <AppShell />,
    children: [
      { index: true, element: <Navigate to="/lobby" replace /> },
      { path: "lobby", element: <LobbyPage /> },
      { path: "game/:matchId", element: <GamePage /> },
      { path: "profile", element: <ProfilePage /> },
      { path: "records", element: <RecordsPage /> },
      { path: "settings", element: <SettingsPage /> }
    ]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

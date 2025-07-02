import React from "react";
import AdminPanelLayoutClient from "./AdminPanelLayoutClient";
import SessionProviderWrapper from "./SessionProviderWrapper";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProviderWrapper>
      <AdminPanelLayoutClient>{children}</AdminPanelLayoutClient>
    </SessionProviderWrapper>
  );
}
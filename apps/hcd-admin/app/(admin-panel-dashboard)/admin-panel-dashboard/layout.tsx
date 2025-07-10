import type { PropsWithChildren } from "react";
import AdminPanelLayoutClient from "../../../components/AdminPanelLayoutClient";
import RequireAdmin from "../../../components/RequireAdmin";

export default function AdminPanelDashboardLayout({ children }: PropsWithChildren<{}>) {
  return (
    <RequireAdmin>
      <AdminPanelLayoutClient>
        {children}
      </AdminPanelLayoutClient>
    </RequireAdmin>
  );
}
import type { PropsWithChildren } from "react";
import InternalHeader from "../../components/InternalHeader";
import RequireAuth from "../../components/RequireAuth";

export default function IntranetLayout({ children }: PropsWithChildren<{}>) {
  return (
    <RequireAuth>
      <InternalHeader />
      {children}
    </RequireAuth>
  );
}
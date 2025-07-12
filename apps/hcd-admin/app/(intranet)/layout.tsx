import type { PropsWithChildren } from "react";
import InternalHeader from "../../components/InternalHeader";
import RequireAuth from "../../components/RequireAuth";

export default function IntranetLayout({ children }: PropsWithChildren<{}>) {
  return (
    <RequireAuth>
      <InternalHeader />
      <div style={{ maxWidth: 1400, margin: '0 auto' }} className="w-full">
        {children}
      </div>
    </RequireAuth>
  );
}
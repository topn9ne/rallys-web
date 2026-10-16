import { WebsiteTabs } from "@/components/admin/WebsiteTabs";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <WebsiteTabs />
      {children}
    </div>
  );
}

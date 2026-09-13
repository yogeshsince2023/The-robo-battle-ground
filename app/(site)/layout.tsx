import { Toaster } from "react-hot-toast";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { WhatsAppButton } from "@/components/layout/whatsapp-button";
import { getBusinessSettings, getMediaSettings } from "@/lib/settings";

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const business = await getBusinessSettings();
  const media = await getMediaSettings();
  return (
    <div className="theme-light min-h-screen bg-background text-foreground">
      <Navbar businessName={business.businessName} logoUrl={media.logoUrl} />
      <main>{children}</main>
      <Footer business={business} />
      <WhatsAppButton whatsapp={business.whatsapp} />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#ffffff",
            color: "#16233f",
            border: "1px solid #e3e8f0",
            boxShadow: "0 4px 12px rgba(16,24,40,0.08)",
          },
        }}
      />
    </div>
  );
}

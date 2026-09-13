import { MessageCircle } from "lucide-react";
import { toWhatsAppLink } from "@/lib/whatsapp";

export function WhatsAppButton({ whatsapp }: { whatsapp: string }) {
  const link = toWhatsAppLink(whatsapp, "Hi, I'd like to know more about The Robo Battleground.");
  if (!link) return null;

  return (
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110"
    >
      <MessageCircle size={26} fill="white" strokeWidth={0} />
    </a>
  );
}

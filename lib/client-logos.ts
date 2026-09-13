import fs from "fs";
import path from "path";

const CLIENTS_DIR = path.join(process.cwd(), "public", "clients");

// Friendly names for known files. Any other image dropped into
// public/clients/ still shows up (with a name derived from its filename) —
// no code change needed to add/remove a logo, just add/remove the file.
const KNOWN_ALT_TEXT: Record<string, string> = {
  "87552c95099cc6b92c7436db59ac1ab6-removebg-preview.png": "Nirma University",
  "BITS_Pilani-Logo.svg-removebg-preview.png": "BITS Pilani",
  "Manipal_University_Jaipur_logo-removebg-preview.png": "Manipal University Jaipur",
  "Mnit_logo-removebg-preview.png": "Malaviya National Institute of Technology, Jaipur",
  "images-removebg-preview (1).png": "IIT Delhi",
  "images-removebg-preview.png": "NIT Hamirpur",
  "srmcem_head_logo-BN0LEybD-removebg-preview.png":
    "Shri Ramswaroop Memorial College of Engineering & Management",
};

export type ClientLogo = { src: string; alt: string };

export function getClientLogos(): ClientLogo[] {
  let files: string[] = [];
  try {
    files = fs
      .readdirSync(CLIENTS_DIR)
      .filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f));
  } catch {
    return [];
  }

  return files.sort().map((file) => ({
    src: `/clients/${encodeURIComponent(file)}`,
    alt:
      KNOWN_ALT_TEXT[file] ||
      file.replace(/-removebg-preview/i, "").replace(/[-_]+/g, " ").replace(/\.(png|jpe?g|webp|svg)$/i, "").trim(),
  }));
}

import { prisma } from "@/lib/prisma";

// Central, admin-editable content store. Each key holds a JSON blob.
// DEFAULTS below are placeholders shown until the admin edits them in
// Admin -> Website Content -> Settings. Replace [PLACEHOLDER] values there.

export type BusinessSettings = {
  businessName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  googleMapsUrl: string;
  socials: { label: string; url: string }[];
};

export type InvoiceSettings = {
  legalName: string; // exact GST-registered name, may differ from the public brand name
  legalAddress: string;
  gstin: string;
  stateCode: string; // e.g. "08-Rajasthan"
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankAccountHolder: string;
  termsAndConditions: string;
};

export type HeroSettings = {
  heading: string;
  subheading: string;
};

export type OwnerSettings = {
  name: string;
  designation: string;
  photoUrl: string;
  bio: string;
  experience: string;
  skills: string; // comma separated
  achievements: string; // newline separated
};

export type AboutSettings = {
  whoWeAre: string;
  whatWeDo: string;
  capabilities: string;
  experience: string;
  mission: string;
  vision: string;
};

export type ArenaSettings = {
  dimensions: string;
  baseSheet: string;
  sidePolycarbonate: string;
  topPolycarbonate: string;
  categories: string; // comma separated, e.g. "8kg, 15kg, 30kg, 60kg"
};

export type MediaSettings = {
  heroImageUrl: string; // overrides the default arena-photo hero background when set
  logoUrl: string; // overrides the default navbar/favicon mark when set
  aboutImageUrl: string; // overrides the default About-section photo on the home page when set
};

export type StatsSettings = {
  stat1Value: string;
  stat1Label: string;
  stat2Value: string;
  stat2Label: string;
};

export const DEFAULT_SETTINGS: {
  business: BusinessSettings;
  hero: HeroSettings;
  owner: OwnerSettings;
  about: AboutSettings;
  arena: ArenaSettings;
  media: MediaSettings;
  stats: StatsSettings;
  invoice: InvoiceSettings;
} = {
  business: {
    businessName: "The Robo Battleground",
    tagline: "Robowar Arena, Engineering & Manufacturing Solutions",
    phone: "+91 7300120250",
    whatsapp: "+91 7300120250",
    email: "therobobattleground@gmail.com",
    address: "Ground Floor, Ward No 3, Nemichand Dudi, Sikar Jhunjhunu Road, Nawalgarh, Rajasthan",
    googleMapsUrl: "[GOOGLE MAPS URL]",
    socials: [
      { label: "Instagram", url: "https://www.instagram.com/the_robobattleground?igsh=b2V5NGdsZDhidTR0&utm_source=qr" },
      { label: "LinkedIn", url: "https://www.linkedin.com/company/the-robo-battle-ground/" },
    ],
  },
  hero: {
    heading: "Robowar Arena, Engineering & Manufacturing Solutions",
    subheading:
      "A dedicated combat robotics arena paired with precision CNC/VMC machining, 3D printing, and hands-on technical training — built for competitors, innovators, and engineers.",
  },
  owner: {
    name: "[OWNER NAME]",
    designation: "[DESIGNATION]",
    photoUrl: "",
    bio: "[Add the owner's biography from the Admin Dashboard.]",
    experience: "[YEARS] years in robotics & manufacturing",
    skills: "Robotics, CNC Machining, Embedded Systems, Automation",
    achievements: "[Add achievements from the Admin Dashboard]",
  },
  about: {
    whoWeAre:
      "The Robo Battleground operates a combat-robotics arena alongside a full-service machining and training division, serving competitors, students, and engineering teams.",
    whatWeDo:
      "We host and support Robowar events, deliver hands-on robotics and embedded systems training, and manufacture precision parts via CNC, VMC, and 3D printing.",
    capabilities:
      "Arena hosting & rental, robot testing & certification support, technical training programs, prototype and small-batch manufacturing, custom engineering fabrication.",
    experience: "[Add company experience / history from the Admin Dashboard]",
    mission:
      "At The Robo Battleground, our mission is to make robotics, engineering, and technical innovation more accessible to students, colleges, and event organizers. We provide affordable, reliable robotics arenas, technical support, practical training, and project machining services that help turn ideas into real-world projects.\n\nWe aim to create a supportive ecosystem where students can learn by doing, build with confidence, compete with passion, and develop industry-relevant technical skills.",
    vision:
      "Our vision is to become a trusted and accessible technical and robotics partner for students, colleges, and innovators across India.\n\nWe envision a future where every student with an idea has access to the right platform, tools, training, technical guidance, and resources to transform that idea into a working project. Through affordable solutions and practical innovation, we aim to contribute to the growth of the next generation of engineers, makers, and problem-solvers.",
  },
  arena: {
    dimensions: "16 ft × 16 ft × 8 ft playing area (L × W × H)",
    baseSheet: "5mm MS (Mild Steel) sheet",
    sidePolycarbonate: "10mm thick polycarbonate side panels",
    topPolycarbonate: "6mm thick polycarbonate top cover",
    categories: "8kg, 15kg, 30kg, 60kg, 3lbs, RoboSoccer, RoboHockey, RoboRace",
  },
  media: {
    heroImageUrl: "",
    logoUrl: "",
    aboutImageUrl: "",
  },
  stats: {
    stat1Value: "10+",
    stat1Label: "Events Supported",
    stat2Value: "50+",
    stat2Label: "Students Trained",
  },
  invoice: {
    legalName: "THE ROBO BATTLE GROUND",
    legalAddress: "GROUND FLOOR WARD NO 3 NEMICHAND DUDI SIKAR JHUNJHUNU ROAD Nawalgarh",
    gstin: "08AAZFT6945J1Z3",
    stateCode: "08-Rajasthan",
    bankName: "HDFC BANK, NAWALGARH",
    bankAccountNumber: "50200119978952",
    bankIfsc: "HDFC0009048",
    bankAccountHolder: "THE ROBO BATTLE GROUND",
    termsAndConditions: "The payment for this invoice must be completed within 30 days from the invoice date.",
  },
};

export async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const row = await prisma.siteSetting.findUnique({ where: { key } });
  if (!row) return fallback;
  try {
    return { ...fallback, ...JSON.parse(row.value) };
  } catch {
    return fallback;
  }
}

export async function setSetting(key: string, value: unknown) {
  const serialized = JSON.stringify(value);
  return prisma.siteSetting.upsert({
    where: { key },
    update: { value: serialized },
    create: { key, value: serialized },
  });
}

export async function getBusinessSettings() {
  return getSetting("business", DEFAULT_SETTINGS.business);
}
export async function getHeroSettings() {
  return getSetting("hero", DEFAULT_SETTINGS.hero);
}
export async function getOwnerSettings() {
  return getSetting("owner", DEFAULT_SETTINGS.owner);
}
export async function getAboutSettings() {
  return getSetting("about", DEFAULT_SETTINGS.about);
}
export async function getArenaSettings() {
  return getSetting("arena", DEFAULT_SETTINGS.arena);
}
export async function getMediaSettings() {
  return getSetting("media", DEFAULT_SETTINGS.media);
}
export async function getStatsSettings() {
  return getSetting("stats", DEFAULT_SETTINGS.stats);
}
export async function getInvoiceSettings() {
  return getSetting("invoice", DEFAULT_SETTINGS.invoice);
}

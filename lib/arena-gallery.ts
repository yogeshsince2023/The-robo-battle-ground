import { prisma } from "@/lib/prisma";

export type ArenaPhoto = { id: string; src: string; alt: string };

export const DEFAULT_ARENA_PHOTOS: ArenaPhoto[] = [
  { id: "fallback-1", src: "/arena/arena-1.jpg", alt: "Robowar Arena - Main Combat Stage" },
  { id: "fallback-2", src: "/arena/arena-2.jpg", alt: "Robowar Arena - Spectator & Battle View" },
  { id: "fallback-3", src: "/arena/arena-3.jpg", alt: "Robowar Arena - Testing & Pit Enclosure" },
  { id: "fallback-4", src: "/arena/arena-4.jpg", alt: "Robowar Arena - Polycarbonate Safety Walls" },
];

// Arena photos are managed from Admin -> Website Content -> Arena (upload /
// delete). If no photos have been uploaded yet, returns the bundled default arena photos.
export async function getArenaPhotos(): Promise<ArenaPhoto[]> {
  try {
    const rows = await prisma.arenaPhoto.findMany({ orderBy: { displayOrder: "asc" } });
    if (rows.length > 0) {
      return rows.map((row, i) => ({
        id: row.id,
        src: row.url,
        alt: row.caption || `Arena photo ${i + 1}`,
      }));
    }
  } catch (err) {
    console.error("Failed to query arena photos:", err);
  }
  return DEFAULT_ARENA_PHOTOS;
}


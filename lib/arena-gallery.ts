import { prisma } from "@/lib/prisma";

export type ArenaPhoto = { id: string; src: string; alt: string };

// Arena photos are managed from Admin -> Website Content -> Arena (upload /
// delete), stored as ArenaPhoto rows pointing at files under public/arena/.
export async function getArenaPhotos(): Promise<ArenaPhoto[]> {
  const rows = await prisma.arenaPhoto.findMany({ orderBy: { displayOrder: "asc" } });
  return rows.map((row, i) => ({
    id: row.id,
    src: row.url,
    alt: row.caption || `Arena photo ${i + 1}`,
  }));
}

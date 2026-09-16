import { prisma } from "@/lib/prisma";

type RefPrefix = "ARENA" | "TRAIN" | "MACH" | "CONTACT";

// Generates human-readable, sequential-looking reference numbers like ARENA-2026-0001
// by counting existing rows created this year. Good enough for single-instance use;
// the unique DB constraint on referenceNo prevents duplicates under a rare race by retrying.
export async function generateReferenceNumber(prefix: RefPrefix): Promise<string> {
  const year = new Date().getFullYear();

  const countForYear = async () => {
    switch (prefix) {
      case "ARENA":
        return prisma.arenaEnquiry.count({
          where: { createdAt: { gte: new Date(`${year}-01-01`) } },
        });
      case "TRAIN":
        return prisma.trainingEnquiry.count({
          where: { createdAt: { gte: new Date(`${year}-01-01`) } },
        });
      case "MACH":
        return prisma.machiningRequest.count({
          where: { createdAt: { gte: new Date(`${year}-01-01`) } },
        });
      case "CONTACT":
        return prisma.contactMessage.count({
          where: { createdAt: { gte: new Date(`${year}-01-01`) } },
        });
    }
  };

  const checkExists = async (ref: string) => {
    switch (prefix) {
      case "ARENA":
        return prisma.arenaEnquiry.findUnique({ where: { referenceNo: ref } });
      case "TRAIN":
        return prisma.trainingEnquiry.findUnique({ where: { referenceNo: ref } });
      case "MACH":
        return prisma.machiningRequest.findUnique({ where: { referenceNo: ref } });
      case "CONTACT":
        return prisma.contactMessage.findUnique({ where: { referenceNo: ref } });
    }
  };

  const existingCount = await countForYear();
  let num = existingCount + 1;

  // Verify candidate reference number is truly unused to prevent unique constraint crashes
  while (true) {
    const candidate = `${prefix}-${year}-${String(num).padStart(4, "0")}`;
    const exists = await checkExists(candidate);
    if (!exists) return candidate;
    num++;
  }
}


-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "page" TEXT NOT NULL,
    "referrer" TEXT,
    "device" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_createdAt_idx" ON "PageView"("createdAt");

-- CreateIndex
CREATE INDEX "PageView_page_idx" ON "PageView"("page");

-- CreateTable
CREATE TABLE "Routine" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT NOT NULL,
    "tags" TEXT,

    CONSTRAINT "Routine_pkey" PRIMARY KEY ("id")
);

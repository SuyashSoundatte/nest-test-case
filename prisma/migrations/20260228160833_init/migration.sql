-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "mobile" INTEGER NOT NULL,
    "name" TEXT,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

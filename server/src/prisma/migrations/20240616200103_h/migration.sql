-- CreateTable
CREATE TABLE "friend" (
    "id" SERIAL NOT NULL,
    "user1" INTEGER NOT NULL,
    "user2" INTEGER NOT NULL,

    CONSTRAINT "friend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "friend_user1_user2_key" ON "friend"("user1", "user2");

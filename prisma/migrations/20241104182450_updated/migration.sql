-- CreateEnum
CREATE TYPE "SessionType" AS ENUM ('General', 'StoryMode', 'ResearchCreateMode');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "encrypted_name" TEXT NOT NULL,
    "encrypted_email" TEXT NOT NULL,
    "email_hash" TEXT NOT NULL,
    "encryption_salt" TEXT NOT NULL,
    "encryption_key" TEXT NOT NULL,
    "iv" TEXT NOT NULL,
    "tag" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT 'New_User',
    "about" TEXT NOT NULL,
    "persona" TEXT NOT NULL,
    "knowledge_base" TEXT NOT NULL,
    "avatar_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "todaysSummary" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AIFriend" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "about" TEXT NOT NULL,
    "persona" TEXT NOT NULL,
    "knowledge_base" TEXT NOT NULL,
    "memory" JSONB,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "avatar_url" TEXT,

    CONSTRAINT "AIFriend_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConversationHistory" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ai_friend_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "sender" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "conversation_id" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "summary" TEXT,

    CONSTRAINT "ConversationHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeBase" (
    "id" TEXT NOT NULL,
    "ai_friend_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserKnowledgeBase" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserKnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "ai_friend_ids" TEXT[],
    "session_type" "SessionType" NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AccountSettings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_plan" TEXT DEFAULT 'FREE',
    "bio" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AccountSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetaFeatures" (
    "id" TEXT NOT NULL,
    "feature_name" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT DEFAULT 'active',
    "release_date" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "image_url" TEXT,

    CONSTRAINT "BetaFeatures_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsageStatistics" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "total_conversations" INTEGER DEFAULT 100,
    "total_ai_friends" INTEGER DEFAULT 0,
    "avg_session_time" INTEGER DEFAULT 0,
    "conversations_left" INTEGER DEFAULT 100,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UsageStatistics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_notifications" BOOLEAN DEFAULT false,
    "push_notifications" BOOLEAN DEFAULT false,
    "share_usage_data" BOOLEAN DEFAULT false,
    "public_profile" BOOLEAN DEFAULT false,
    "message_history" BOOLEAN DEFAULT false,
    "auto_reply" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AIFriendToSession" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_hash_key" ON "User"("email_hash");

-- CreateIndex
CREATE UNIQUE INDEX "AIFriend_user_id_name_key" ON "AIFriend"("user_id", "name");

-- CreateIndex
CREATE INDEX "ConversationHistory_conversation_id_idx" ON "ConversationHistory"("conversation_id");

-- CreateIndex
CREATE UNIQUE INDEX "AccountSettings_user_id_key" ON "AccountSettings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UsageStatistics_user_id_key" ON "UsageStatistics"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_user_id_key" ON "UserSettings"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "_AIFriendToSession_AB_unique" ON "_AIFriendToSession"("A", "B");

-- CreateIndex
CREATE INDEX "_AIFriendToSession_B_index" ON "_AIFriendToSession"("B");

-- AddForeignKey
ALTER TABLE "AIFriend" ADD CONSTRAINT "AIFriend_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationHistory" ADD CONSTRAINT "ConversationHistory_ai_friend_id_fkey" FOREIGN KEY ("ai_friend_id") REFERENCES "AIFriend"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConversationHistory" ADD CONSTRAINT "ConversationHistory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeBase" ADD CONSTRAINT "KnowledgeBase_ai_friend_id_fkey" FOREIGN KEY ("ai_friend_id") REFERENCES "AIFriend"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserKnowledgeBase" ADD CONSTRAINT "UserKnowledgeBase_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AccountSettings" ADD CONSTRAINT "AccountSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsageStatistics" ADD CONSTRAINT "UsageStatistics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AIFriendToSession" ADD CONSTRAINT "_AIFriendToSession_A_fkey" FOREIGN KEY ("A") REFERENCES "AIFriend"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AIFriendToSession" ADD CONSTRAINT "_AIFriendToSession_B_fkey" FOREIGN KEY ("B") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;

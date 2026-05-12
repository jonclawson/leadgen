-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_article" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "formId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "article_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "article_formId_fkey" FOREIGN KEY ("formId") REFERENCES "dynamic_form" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_article" ("body", "createdAt", "id", "slug", "title", "updatedAt", "userId") SELECT "body", "createdAt", "id", "slug", "title", "updatedAt", "userId" FROM "article";
DROP TABLE "article";
ALTER TABLE "new_article" RENAME TO "article";
CREATE UNIQUE INDEX "article_slug_key" ON "article"("slug");
CREATE INDEX "article_userId_idx" ON "article"("userId");
CREATE INDEX "article_slug_idx" ON "article"("slug");
CREATE INDEX "article_formId_idx" ON "article"("formId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

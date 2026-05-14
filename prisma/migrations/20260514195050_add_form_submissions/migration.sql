-- CreateTable
CREATE TABLE "form_submission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "formId" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "form_submission_formId_fkey" FOREIGN KEY ("formId") REFERENCES "dynamic_form" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "form_submission_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "article" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "form_submission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "form_submission_userId_idx" ON "form_submission"("userId");

-- CreateIndex
CREATE INDEX "form_submission_formId_idx" ON "form_submission"("formId");

-- CreateIndex
CREATE INDEX "form_submission_articleId_idx" ON "form_submission"("articleId");

-- CreateIndex
CREATE INDEX "form_submission_createdAt_idx" ON "form_submission"("createdAt");

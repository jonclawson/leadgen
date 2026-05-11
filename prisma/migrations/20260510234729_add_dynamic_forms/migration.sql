-- CreateTable
CREATE TABLE "dynamic_form" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dynamic_form_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "form_field_definition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "dynamicFormId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT,
    "icon" TEXT,
    "placeholder" TEXT,
    "validators" TEXT,
    "buttonLabel" TEXT,
    "buttonColor" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "form_field_definition_dynamicFormId_fkey" FOREIGN KEY ("dynamicFormId") REFERENCES "dynamic_form" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "dynamic_form_userId_idx" ON "dynamic_form"("userId");

-- CreateIndex
CREATE INDEX "form_field_definition_dynamicFormId_idx" ON "form_field_definition"("dynamicFormId");

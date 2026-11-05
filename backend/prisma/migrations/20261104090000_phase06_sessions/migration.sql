-- Additive only: existing users retain access policy; no accounts or credentials are inserted.
ALTER TABLE `User`
    ADD COLUMN `mustChangePassword` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `bootstrapSlot` VARCHAR(32) NULL;
CREATE UNIQUE INDEX `User_bootstrapSlot_key` ON `User`(`bootstrapSlot`);

CREATE TABLE `AuthSession` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `refreshHash` CHAR(64) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `refreshedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expiresAt` DATETIME(3) NOT NULL,
    `revokedAt` DATETIME(3) NULL,
    INDEX `AuthSession_userId_revokedAt_idx`(`userId`, `revokedAt`),
    INDEX `AuthSession_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
ALTER TABLE `AuthSession` ADD CONSTRAINT `AuthSession_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

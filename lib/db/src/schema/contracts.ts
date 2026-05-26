import { pgTable, text, serial, timestamp, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const contractsTable = pgTable("contracts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  signerEmail: text("signer_email").notNull(),
  signerName: text("signer_name").notNull(),
  signerCompany: text("signer_company"),
  status: text("status").notNull().default("pending"),
  originalFileUrl: text("original_file_url"),
  originalFileName: text("original_file_name"),
  signedPdfUrl: text("signed_pdf_url"),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }),
  signerIp: text("signer_ip"),
  signerLocation: text("signer_location"),
  signerDevice: text("signer_device"),
  selfieUrl: text("selfie_url"),
  signatureDataUrl: text("signature_data_url"),
  signerAddress: text("signer_address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  signedAt: timestamp("signed_at", { withTimezone: true }),
  customFields: text("custom_fields"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertContractSchema = createInsertSchema(contractsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertContract = z.infer<typeof insertContractSchema>;
export type Contract = typeof contractsTable.$inferSelect;

import { pgTable, text, serial, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  businessName: text("business_name").notNull().default("My Freelance Business"),
  businessEmail: text("business_email").notNull().default("me@example.com"),
  businessPhone: text("business_phone"),
  businessAddress: text("business_address"),
  logoUrl: text("logo_url"),
  bankName: text("bank_name"),
  bankAccount: text("bank_account"),
  bankIfsc: text("bank_ifsc"),
  bankSwift: text("bank_swift"),
  upiId: text("upi_id"),
  paypalEmail: text("paypal_email"),
  wiseEmail: text("wise_email"),
  gstNumber: text("gst_number"),
  panNumber: text("pan_number"),
  notifyEmail: text("notify_email"),
  emailOnSign: boolean("email_on_sign").notNull().default(true),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({ id: true });
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;

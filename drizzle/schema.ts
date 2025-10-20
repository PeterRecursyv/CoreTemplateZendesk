import { mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Purchase flow tracking
export const purchases = mysqlTable("purchases", {
  id: varchar("id", { length: 64 }).primaryKey(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  
  // Step 1: Integration selection
  hubVendorId: varchar("hubVendorId", { length: 64 }).notNull(),
  hubVendorName: varchar("hubVendorName", { length: 255 }).notNull(),
  spokeIntegrationId: varchar("spokeIntegrationId", { length: 64 }).notNull(),
  spokeIntegrationName: varchar("spokeIntegrationName", { length: 255 }).notNull(),
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }).notNull(),
  
  // Step 2: Entity details
  companyName: varchar("companyName", { length: 255 }),
  entityType: varchar("entityType", { length: 64 }),
  syncFrequency: varchar("syncFrequency", { length: 64 }),
  dataVolume: varchar("dataVolume", { length: 64 }),
  pricingTier: varchar("pricingTier", { length: 64 }),
  additionalNotes: text("additionalNotes"),
  
  // Step 3: Terms
  termsAccepted: varchar("termsAccepted", { length: 10 }).default("false").notNull(),
  termsAcceptedAt: timestamp("termsAcceptedAt"),
  
  // Step 4: Payment
  stripeSessionId: varchar("stripeSessionId", { length: 255 }),
  paymentStatus: mysqlEnum("paymentStatus", ["pending", "completed", "failed"]).default("pending").notNull(),
  paymentAmount: varchar("paymentAmount", { length: 20 }),
  paymentCurrency: varchar("paymentCurrency", { length: 10 }).default("USD"),
  paidAt: timestamp("paidAt"),
  
  // Metadata
  templateId: varchar("templateId", { length: 64 }).notNull(),
  notificationEmailSent: varchar("notificationEmailSent", { length: 10 }).default("false"),
  logFilePath: varchar("logFilePath", { length: 512 }),
  
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

export type Purchase = typeof purchases.$inferSelect;
export type InsertPurchase = typeof purchases.$inferInsert;

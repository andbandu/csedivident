import { pgTable, text, serial, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
});

export const dividendData = pgTable("dividend_data", {
  id: serial("id").primaryKey(),
  companyName: text("company_name").notNull(),
  ticker: text("ticker").notNull(),
  dividendAmount: decimal("dividend_amount", { precision: 10, scale: 2 }).notNull(),
  exDate: timestamp("ex_date").notNull(),
  paymentDate: timestamp("payment_date").notNull(),
  frequency: text("frequency").notNull(), // quarterly, monthly, annual
  yield: decimal("yield", { precision: 5, scale: 2 }).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users, {
  username: (schema) => schema.username,
  password: (schema) => schema.password,
});

export const insertDividendSchema = createInsertSchema(dividendData).omit({
  id: true,
  lastUpdated: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type DividendData = typeof dividendData.$inferSelect;
export type InsertDividend = z.infer<typeof insertDividendSchema>;
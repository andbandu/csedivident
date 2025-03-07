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
  sector: text("sector").notNull(),
  established: integer("established").notNull(),
  quotedDate: integer("quoted_date").notNull(),
  fyEnding: text("fy_ending").notNull(),
  dividendAmount: text("dividend_amount").notNull(),
  frequency: text("frequency").notNull(), // quarterly, monthly, annual
  yield: text("yield").notNull(),
  yearWiseData: text("year_wise_data").array().notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const insertDividendSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  ticker: z.string().min(1, "Ticker is required"),
  sector: z.string().min(1, "Sector is required"),
  established: z.number().int().min(1800, "Invalid year"),
  quotedDate: z.number().int().min(1800, "Invalid year"),
  fyEnding: z.string().min(1, "FY Ending is required"),
  dividendAmount: z.string().min(1, "Dividend amount is required"),
  frequency: z.enum(["monthly", "quarterly", "annual"]),
  yield: z.string().min(1, "Yield is required"),
  yearWiseData: z.array(z.string()),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type DividendData = typeof dividendData.$inferSelect;
export type InsertDividend = z.infer<typeof insertDividendSchema>;
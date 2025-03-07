import { DividendData, InsertDividend, User, InsertUser } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Dividend data operations
  getAllDividends(): Promise<DividendData[]>;
  getDividend(id: number): Promise<DividendData | undefined>;
  createDividend(dividend: InsertDividend): Promise<DividendData>;
  updateDividend(id: number, dividend: Partial<InsertDividend>): Promise<DividendData>;
  deleteDividend(id: number): Promise<void>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private dividends: Map<number, DividendData>;
  private currentUserId: number;
  private currentDividendId: number;
  readonly sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.dividends = new Map();
    this.currentUserId = 1;
    this.currentDividendId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Add dummy data
    this.addDummyData();
  }

  private addDummyData() {
    // Add sample data from the Excel sheet
    const dummyDividends: InsertDividend[] = [
      {
        companyName: "Sampath Bank PLC",
        ticker: "SAMP",
        sector: "Banking",
        established: 1987,
        quotedDate: 1987,
        fyEnding: "December",
        dividendAmount: 1.00,
        frequency: "annual",
        yield: 2.50,
        yearWiseData: ["2023:1.00", "2022:0.75", "2021:0.50"]
      },
      {
        companyName: "Commercial Bank PLC",
        ticker: "COMB",
        sector: "Banking",
        established: 1969,
        quotedDate: 1970,
        fyEnding: "December",
        dividendAmount: 6.50,
        frequency: "annual",
        yield: 4.50,
        yearWiseData: ["2023:6.50", "2022:5.00", "2021:4.50"]
      },
      {
        companyName: "DFCC Bank PLC",
        ticker: "DFCC",
        sector: "Banking",
        established: 1955,
        quotedDate: 1956,
        fyEnding: "December",
        dividendAmount: 5.00,
        frequency: "annual",
        yield: 3.50,
        yearWiseData: ["2023:5.00", "2022:3.00", "2021:2.00"]
      }
    ];

    dummyDividends.forEach(dividend => {
      const id = this.currentDividendId++;
      this.dividends.set(id, {
        ...dividend,
        id,
        lastUpdated: new Date()
      });
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      isAdmin: false,
    };
    this.users.set(id, user);
    return user;
  }

  async getAllDividends(): Promise<DividendData[]> {
    return Array.from(this.dividends.values());
  }

  async getDividend(id: number): Promise<DividendData | undefined> {
    return this.dividends.get(id);
  }

  async createDividend(dividend: InsertDividend): Promise<DividendData> {
    const id = this.currentDividendId++;
    const newDividend: DividendData = {
      ...dividend,
      id,
      lastUpdated: new Date(),
    };
    this.dividends.set(id, newDividend);
    return newDividend;
  }

  async updateDividend(
    id: number,
    dividend: Partial<InsertDividend>,
  ): Promise<DividendData> {
    const existing = await this.getDividend(id);
    if (!existing) {
      throw new Error("Dividend not found");
    }

    const updated: DividendData = {
      ...existing,
      ...dividend,
      lastUpdated: new Date(),
    };
    this.dividends.set(id, updated);
    return updated;
  }

  async deleteDividend(id: number): Promise<void> {
    this.dividends.delete(id);
  }
}

export const storage = new MemStorage();
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
        yearWiseData: [
          "2023:1.00", "2022:0.75", "2021:0.50", "2020:0.40", "2019:0.60", 
          "2018:0.55", "2017:0.48", "2016:0.42", "2015:0.38", "2014:0.35", 
          "2013:0.32", "2012:0.28", "2011:0.25"
        ]
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
        yearWiseData: [
          "2023:6.50", "2022:5.00", "2021:4.50", "2020:4.00", "2019:4.75", 
          "2018:4.25", "2017:3.90", "2016:3.60", "2015:3.40", "2014:3.20", 
          "2013:3.00", "2012:2.75", "2011:2.50"
        ]
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
        yearWiseData: [
          "2023:5.00", "2022:3.00", "2021:2.00", "2020:1.80", "2019:2.50", 
          "2018:2.30", "2017:2.10", "2016:1.90", "2015:1.75", "2014:1.60", 
          "2013:1.45", "2012:1.30", "2011:1.20"
        ]
      },
      {
        companyName: "Hatton National Bank PLC",
        ticker: "HNB",
        sector: "Banking",
        established: 1888,
        quotedDate: 1970,
        fyEnding: "December",
        dividendAmount: 8.50,
        frequency: "annual",
        yield: 5.20,
        yearWiseData: [
          "2023:8.50", "2022:7.75", "2021:7.00", "2020:6.50", "2019:7.25", 
          "2018:6.90", "2017:6.50", "2016:6.10", "2015:5.80", "2014:5.50", 
          "2013:5.20", "2012:4.90", "2011:4.60"
        ]
      },
      {
        companyName: "Ceylon Tobacco Company PLC",
        ticker: "CTC",
        sector: "Consumer Goods",
        established: 1932,
        quotedDate: 1954,
        fyEnding: "December",
        dividendAmount: 105.00,
        frequency: "quarterly",
        yield: 6.80,
        yearWiseData: [
          "2023:105.00", "2022:98.50", "2021:92.00", "2020:87.50", "2019:94.00", 
          "2018:90.00", "2017:85.00", "2016:80.00", "2015:76.00", "2014:72.00", 
          "2013:68.00", "2012:64.00", "2011:60.00"
        ]
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
      isAdmin: true, // Make first user admin for testing
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
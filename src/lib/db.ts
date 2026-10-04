import fs from "fs";
import path from "path";
import bcrypt from "bcryptjs";
import { supabase } from "./supabase";

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string;
  dob: string;
  idType: string;
  idNumber: string;
  issuance: string;
  expiry: string;
  role: "user" | "admin";
  status: "Active" | "Pending" | "Suspended" | "Rejected";
  createdAt: string;
  isFrozen: boolean;
  frozenReason: string;
  rejectionReason?: string;
  email?: string;
}

export const DEFAULT_ROUTING_NUMBER = process.env.NEXT_PUBLIC_ROUTING_NUMBER || "026014881";

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  routingNumber?: string;
  accountType: "checking" | "savings" | "credit" | "loan";
  accountName: string;
  balance: number; // Stored current balance
  interestRate?: number;
  monthlyPayment?: number;
  loanTerm?: string;
  originalPrincipal?: number;
  createdAt: string;
}

export interface Card {
  id: string;
  userId: string;
  accountId?: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  cardType: "credit" | "debit";
  cardTier: string;
  creditLimit: number;
  availableCredit: number;
  status: "Active" | "Frozen" | "Locked";
  isFrozen: boolean;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  title: string;
  description: string;
  amount: number;
  status: "Pending" | "Settled" | "Rejected";
  effectiveDate: string;
  createdAt: string;
  isOverride?: boolean;
  overrideReason?: string;
  authCode?: string;
  justification?: string;
  recipientDetails?: string; // Format: "Routing: X, Account: Y"
}

interface LocalDatabase {
  users: User[];
  accounts: Account[];
  cards: Card[];
  transactions: Transaction[];
}

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "beacon_db.json");

// Circuit breaker to avoid waiting on timeout when Supabase is unreachable
let supabaseOfflineUntil = 0;

// Helper to safely execute a Supabase query with timeout so it never hangs or crashes
async function withSupabaseTimeout<T>(promise: Promise<T>, timeoutMs = 800): Promise<T | null> {
  if (Date.now() < supabaseOfflineUntil) {
    return null;
  }
  try {
    let timeoutId: any;
    const timeoutPromise = new Promise<null>((resolve) => {
      timeoutId = setTimeout(() => {
        supabaseOfflineUntil = Date.now() + 60000;
        resolve(null);
      }, timeoutMs);
    });
    const result: any = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timeoutId);
    if (!result || (result.error && (result.error.message?.includes("fetch failed") || result.error.code === "ENOTFOUND"))) {
      supabaseOfflineUntil = Date.now() + 60000;
    }
    return result;
  } catch (err) {
    supabaseOfflineUntil = Date.now() + 60000;
    return null;
  }
}

// Initial seed builder if data/beacon_db.json does not exist
function getInitialSeedData(): LocalDatabase {
  const defaultHash = bcrypt.hashSync("password123", 10);

  const users: User[] = [
    {
      id: "u-admin",
      username: "admin",
      email: "admin@beaconcapital.site",
      passwordHash: defaultHash,
      firstName: "Chief",
      lastName: "Compliance Officer",
      phone: "+1 (555) 010-0000",
      dob: "1980-01-01",
      idType: "passport",
      idNumber: "ADMIN-001",
      issuance: "Beacon Authority",
      expiry: "2035-01-01",
      role: "admin",
      status: "Active",
      createdAt: new Date().toISOString(),
      isFrozen: false,
      frozenReason: "",
      rejectionReason: ""
    },
    {
      id: "u-alexander",
      username: "alexander",
      email: "alexander@beaconcapital.site",
      passwordHash: defaultHash,
      firstName: "Alexander",
      lastName: "Hamilton",
      phone: "+1 (555) 019-2834",
      dob: "1985-01-11",
      idType: "dl",
      idNumber: "DL-8492048-NY",
      issuance: "New York",
      expiry: "2029-01-11",
      role: "user",
      status: "Active",
      createdAt: "2025-01-01T10:00:00.000Z",
      isFrozen: false,
      frozenReason: "",
      rejectionReason: ""
    },
    {
      id: "u-eleanor",
      username: "eleanor",
      email: "eleanor@beaconcapital.site",
      passwordHash: defaultHash,
      firstName: "Eleanor",
      lastName: "Vance",
      phone: "+1 (555) 392-4910",
      dob: "1978-10-12",
      idType: "passport",
      idNumber: "PP-482019-US",
      issuance: "United States",
      expiry: "2032-10-12",
      role: "user",
      status: "Active",
      createdAt: "2024-06-15T09:00:00.000Z",
      isFrozen: false,
      frozenReason: "",
      rejectionReason: ""
    },
    {
      id: "u-philip",
      username: "philip",
      email: "philip.weeks@example.com",
      passwordHash: defaultHash,
      firstName: "Philip",
      lastName: "Weeks",
      phone: "+1 (555) 123-4567",
      dob: "1998-06-24",
      idType: "dl",
      idNumber: "DL-PHILIP-12",
      issuance: "NY",
      expiry: "2030-06-24",
      role: "user",
      status: "Active",
      createdAt: "2026-06-23T19:41:00.000Z",
      isFrozen: false,
      frozenReason: "",
      rejectionReason: ""
    },
    {
      id: "u-lawson",
      username: "lawson",
      email: "lawson.janet@example.com",
      passwordHash: defaultHash,
      firstName: "Lawson",
      lastName: "Janet",
      phone: "+1 (555) 234-5678",
      dob: "1990-05-12",
      idType: "dl",
      idNumber: "DL-LAWSON-34",
      issuance: "CA",
      expiry: "2032-05-12",
      role: "user",
      status: "Active",
      createdAt: "2026-06-22T10:00:00.000Z",
      isFrozen: false,
      frozenReason: "",
      rejectionReason: ""
    },
    {
      id: "u-priya",
      username: "priya",
      email: "priya.nair@example.com",
      passwordHash: defaultHash,
      firstName: "Priya",
      lastName: "Nair",
      phone: "+1 (555) 345-6789",
      dob: "1993-08-19",
      idType: "passport",
      idNumber: "PP-PRIYA-56",
      issuance: "US",
      expiry: "2033-08-19",
      role: "user",
      status: "Active",
      createdAt: "2026-06-22T11:00:00.000Z",
      isFrozen: false,
      frozenReason: "",
      rejectionReason: ""
    },
    {
      id: "u-sarah",
      username: "sarah",
      email: "sarah.mitchell@example.com",
      passwordHash: defaultHash,
      firstName: "Sarah",
      lastName: "Mitchell",
      phone: "+61 412 345 678",
      dob: "1988-11-02",
      idType: "dl",
      idNumber: "DL-SARAH-78",
      issuance: "NSW",
      expiry: "2029-11-02",
      role: "user",
      status: "Active",
      createdAt: "2026-06-22T12:00:00.000Z",
      isFrozen: false,
      frozenReason: "",
      rejectionReason: ""
    },
    {
      id: "u-mei",
      username: "mei",
      email: "mei.chen@example.com",
      passwordHash: defaultHash,
      firstName: "Mei-Ling",
      lastName: "Chen",
      phone: "+1 (555) 456-7890",
      dob: "1995-03-27",
      idType: "passport",
      idNumber: "PP-MEI-90",
      issuance: "CN",
      expiry: "2035-03-27",
      role: "user",
      status: "Active",
      createdAt: "2026-06-22T13:00:00.000Z",
      isFrozen: false,
      frozenReason: "",
      rejectionReason: ""
    },
    {
      id: "u-connor",
      username: "connor",
      email: "connor.walsh@example.com",
      passwordHash: defaultHash,
      firstName: "Connor",
      lastName: "Walsh",
      phone: "+1 (555) 567-8901",
      dob: "1982-12-15",
      idType: "dl",
      idNumber: "DL-CONNOR-12",
      issuance: "TX",
      expiry: "2031-12-15",
      role: "user",
      status: "Active",
      createdAt: "2026-06-22T14:00:00.000Z",
      isFrozen: false,
      frozenReason: "",
      rejectionReason: ""
    },
    {
      id: "u-james",
      username: "james",
      email: "james.thornton@example.com",
      passwordHash: defaultHash,
      firstName: "James",
      lastName: "Thornton",
      phone: "+1 (555) 678-9012",
      dob: "1989-07-04",
      idType: "dl",
      idNumber: "DL-JAMES-56",
      issuance: "FL",
      expiry: "2034-07-04",
      role: "user",
      status: "Active",
      createdAt: "2026-06-22T15:00:00.000Z",
      isFrozen: false,
      frozenReason: "",
      rejectionReason: ""
    }
  ];

  const accounts: Account[] = [
    {
      id: "acc-alex-checking",
      userId: "u-alexander",
      accountNumber: "8492014829",
      routingNumber: "026014881",
      accountType: "checking",
      accountName: "Beacon Premier Checking",
      balance: 142500.00,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2025-01-01T10:00:00.000Z"
    },
    {
      id: "acc-alex-savings",
      userId: "u-alexander",
      accountNumber: "8492019102",
      routingNumber: "026014881",
      accountType: "savings",
      accountName: "Beacon High-Yield Treasury Savings",
      balance: 850000.00,
      interestRate: 4.85,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2025-01-01T10:00:00.000Z"
    },
    {
      id: "acc-alex-loan",
      userId: "u-alexander",
      accountNumber: "8492016391",
      routingNumber: "026014881",
      accountType: "loan",
      accountName: "Beacon Commercial Real Estate Loan",
      balance: 185000.00,
      interestRate: 5.25,
      monthlyPayment: 3420.00,
      loanTerm: "60 Months",
      originalPrincipal: 250000.00,
      createdAt: "2025-01-01T10:00:00.000Z"
    },
    {
      id: "acc-eleanor-checking",
      userId: "u-eleanor",
      accountNumber: "8472013910",
      routingNumber: "026014881",
      accountType: "checking",
      accountName: "Beacon Corporate Trust",
      balance: 4250000.00,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2024-06-16T11:00:00.000Z"
    },
    {
      id: "acc-philip-checking",
      userId: "u-philip",
      accountNumber: "8461944891",
      routingNumber: "026014881",
      accountType: "checking",
      accountName: "Beacon Premier Checking",
      balance: 10000.00,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-23T19:41:00.000Z"
    },
    {
      id: "acc-philip-savings",
      userId: "u-philip",
      accountNumber: "8461948192",
      routingNumber: "026014881",
      accountType: "savings",
      accountName: "Beacon High-Yield Savings",
      balance: 0.0,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-23T19:42:00.000Z"
    },
    {
      id: "acc-lawson-checking",
      userId: "u-lawson",
      accountNumber: "8429109104",
      routingNumber: "026014881",
      accountType: "checking",
      accountName: "Beacon Premier Checking",
      balance: 85431.00,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T10:01:00.000Z"
    },
    {
      id: "acc-lawson-savings",
      userId: "u-lawson",
      accountNumber: "8429102045",
      routingNumber: "026014881",
      accountType: "savings",
      accountName: "Beacon High-Yield Savings",
      balance: 0.0,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T10:02:00.000Z"
    },
    {
      id: "acc-priya-checking",
      userId: "u-priya",
      accountNumber: "8430123012",
      routingNumber: "026014881",
      accountType: "checking",
      accountName: "Beacon Premier Checking",
      balance: 3200.00,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T11:01:00.000Z"
    },
    {
      id: "acc-priya-savings",
      userId: "u-priya",
      accountNumber: "8430127401",
      routingNumber: "026014881",
      accountType: "savings",
      accountName: "Beacon High-Yield Savings",
      balance: 0.0,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T11:02:00.000Z"
    },
    {
      id: "acc-sarah-checking",
      userId: "u-sarah",
      accountNumber: "8455005500",
      routingNumber: "026014881",
      accountType: "checking",
      accountName: "Beacon Premier Checking",
      balance: 50250.00,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T12:01:00.000Z"
    },
    {
      id: "acc-sarah-savings",
      userId: "u-sarah",
      accountNumber: "8455001234",
      routingNumber: "026014881",
      accountType: "savings",
      accountName: "Beacon High-Yield Savings",
      balance: 125000.00,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T12:02:00.000Z"
    },
    {
      id: "acc-mei-checking",
      userId: "u-mei",
      accountNumber: "8481868186",
      routingNumber: "026014881",
      accountType: "checking",
      accountName: "Beacon Premier Checking",
      balance: 7450.25,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T13:01:00.000Z"
    },
    {
      id: "acc-mei-savings",
      userId: "u-mei",
      accountNumber: "8481869112",
      routingNumber: "026014881",
      accountType: "savings",
      accountName: "Beacon High-Yield Savings",
      balance: 22000.00,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T13:02:00.000Z"
    },
    {
      id: "acc-connor-checking",
      userId: "u-connor",
      accountNumber: "8443214321",
      routingNumber: "026014881",
      accountType: "checking",
      accountName: "Beacon Premier Checking",
      balance: 95100.00,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T14:01:00.000Z"
    },
    {
      id: "acc-connor-savings",
      userId: "u-connor",
      accountNumber: "8443215432",
      routingNumber: "026014881",
      accountType: "savings",
      accountName: "Beacon High-Yield Savings",
      balance: 310000.00,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T14:02:00.000Z"
    },
    {
      id: "acc-james-checking",
      userId: "u-james",
      accountNumber: "8499009900",
      routingNumber: "026014881",
      accountType: "checking",
      accountName: "Beacon Premier Checking",
      balance: 15800.75,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T15:01:00.000Z"
    },
    {
      id: "acc-james-savings",
      userId: "u-james",
      accountNumber: "8499001122",
      routingNumber: "026014881",
      accountType: "savings",
      accountName: "Beacon High-Yield Savings",
      balance: 87500.50,
      interestRate: 0.0,
      monthlyPayment: 0.0,
      loanTerm: "",
      originalPrincipal: 0.0,
      createdAt: "2026-06-22T15:02:00.000Z"
    }
  ];

  const cards: Card[] = [
    {
      id: "card-alex-1",
      userId: "u-alexander",
      accountId: "acc-alex-checking",
      cardNumber: "4532 8920 1849 9201",
      cardHolder: "Alexander Hamilton",
      expiryMonth: "09",
      expiryYear: "29",
      cvv: "842",
      cardType: "credit",
      cardTier: "Beacon Elite Black",
      creditLimit: 50000.00,
      availableCredit: 48250.00,
      status: "Active",
      isFrozen: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "card-eleanor-1",
      userId: "u-eleanor",
      accountId: "acc-eleanor-checking",
      cardNumber: "4532 7102 3918 4012",
      cardHolder: "Eleanor Vance",
      expiryMonth: "11",
      expiryYear: "29",
      cvv: "619",
      cardType: "credit",
      cardTier: "Beacon Elite Black",
      creditLimit: 75000.00,
      availableCredit: 71400.00,
      status: "Active",
      isFrozen: false,
      createdAt: new Date().toISOString()
    },
    {
      id: "card-philip-1",
      userId: "u-philip",
      accountId: "acc-philip-checking",
      cardNumber: "4532 6019 4820 1572",
      cardHolder: "Philip Weeks",
      expiryMonth: "04",
      expiryYear: "30",
      cvv: "391",
      cardType: "credit",
      cardTier: "Beacon Platinum Reserve",
      creditLimit: 25000.00,
      availableCredit: 25000.00,
      status: "Active",
      isFrozen: false,
      createdAt: new Date().toISOString()
    }
  ];

  const transactions: Transaction[] = [
    {
      id: "tx-pending-1",
      accountId: "acc-sarah-checking",
      title: "Wire Transfer OUT",
      description: "Wire transfer to Share Purchase — CBA (Routing: 062500, Account: 55001234)",
      amount: -5000,
      status: "Pending",
      effectiveDate: "2026-06-21",
      createdAt: "2026-06-21T09:00:00.000Z",
      recipientDetails: "Routing: 062500, Acct: 55001234",
      authCode: "INVEST-CBA-001"
    },
    {
      id: "tx-pending-2",
      accountId: "acc-mei-checking",
      title: "ACH Transfer OUT",
      description: "ACH transfer to SMSF Contribution (Routing: 062186, Account: 90001122)",
      amount: -2200,
      status: "Pending",
      effectiveDate: "2026-06-22",
      createdAt: "2026-06-22T10:15:00.000Z",
      recipientDetails: "Routing: 062186, Acct: 90001122",
      authCode: "SMSF-2025-001"
    },
    {
      id: "tx-pending-3",
      accountId: "acc-connor-checking",
      title: "Wire Transfer OUT",
      description: "Wire transfer to Term Deposit Rollover (Routing: 062500, Account: 55004321)",
      amount: -7200,
      status: "Pending",
      effectiveDate: "2026-06-22",
      createdAt: "2026-06-22T11:30:00.000Z",
      recipientDetails: "Routing: 062500, Acct: 55004321",
      authCode: "TD-ROLL-2025"
    },
    {
      id: "tx-pending-4",
      accountId: "acc-lawson-checking",
      title: "ACH Transfer OUT",
      description: "ACH transfer to Investment Purchase (Routing: 021000021, Account: 123456789)",
      amount: -12500,
      status: "Pending",
      effectiveDate: "2026-06-22",
      createdAt: "2026-06-22T14:45:00.000Z",
      recipientDetails: "Routing: 021000021, Acct: 123456789",
      authCode: "INV-990-2026"
    },
    {
      id: "tx-settled-1",
      accountId: "acc-sarah-checking",
      title: "Payroll Direct Deposit",
      description: "Beacon Tech Salary Credit",
      amount: 4500,
      status: "Settled",
      effectiveDate: "2026-06-20",
      createdAt: "2026-06-20T08:00:00.000Z"
    },
    {
      id: "tx-settled-2",
      accountId: "acc-mei-checking",
      title: "Mobile Deposit",
      description: "Check Deposit via Mobile Capture",
      amount: 1500,
      status: "Settled",
      effectiveDate: "2026-06-19",
      createdAt: "2026-06-19T14:30:00.000Z"
    },
    {
      id: "tx-settled-3",
      accountId: "acc-connor-checking",
      title: "ATM Deposit",
      description: "ATM Cash Deposit",
      amount: 800,
      status: "Settled",
      effectiveDate: "2026-06-18",
      createdAt: "2026-06-18T10:00:00.000Z"
    },
    {
      id: "tx-80ywf85vl",
      accountId: "acc-sarah-checking",
      title: "Zelle Transfer Credit",
      description: "Zelle Transfer IN",
      amount: 2000,
      status: "Settled",
      effectiveDate: "2026-06-26",
      createdAt: "2026-06-26T17:30:04.000Z"
    },
    {
      accountId: "acc-alex-checking",
      title: "Zelle Transfer",
      description: "Zelle to activesender@gmail.com",
      amount: -389,
      status: "Pending",
      effectiveDate: "2026-06-26",
      recipientDetails: "Zelle Recipient: activesender@gmail.com",
      authCode: "ZEL-2620-P",
      id: "tx-un539bxsb",
      createdAt: "2026-06-26T00:45:35.402Z"
    },
    {
      accountId: "acc-alex-checking",
      title: "Wire Transfer OUT",
      description: "Wire transfer to kim at chase  (3827)",
      amount: -799.98,
      status: "Pending",
      effectiveDate: "2026-06-26",
      recipientDetails: "Routing: 673892783, Acct: 982763827",
      authCode: "TXN-1420-P",
      id: "tx-bqyd50j23",
      createdAt: "2026-06-26T00:46:46.907Z"
    },
    {
      accountId: "acc-alex-checking",
      title: "Wire Transfer Fee",
      description: "Service Fee for Outgoing Wire Transfer",
      amount: -20,
      status: "Pending",
      effectiveDate: "2026-06-26",
      authCode: "TXN-1420-P",
      id: "tx-o3s4u6k4j",
      createdAt: "2026-06-26T00:46:46.911Z"
    }
  ];

  return { users, accounts, cards, transactions };
}

function readLocalDb(): LocalDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      const initial = getInitialSeedData();
      fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), "utf8");
      return initial;
    }
    const raw = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (!parsed.users) parsed.users = [];
    if (!parsed.accounts) parsed.accounts = [];
    if (!parsed.cards) parsed.cards = [];
    if (!parsed.transactions) parsed.transactions = [];
    return parsed as LocalDatabase;
  } catch (err) {
    console.error("[DB] Error reading local db file, returning seed:", err);
    return getInitialSeedData();
  }
}

function writeLocalDb(data: LocalDatabase) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("[DB] Error writing local db file:", err);
  }
}

// Database helper functions connected to local persistent store with Supabase sync
export const db = {
  // Users API
  async getUsers(): Promise<User[]> {
    const sbResult = await withSupabaseTimeout(
      supabase.from("users").select("*")
    );
    if (sbResult && !sbResult.error && sbResult.data && sbResult.data.length > 0) {
      return sbResult.data as User[];
    }
    return readLocalDb().users;
  },

  async getUserById(id: string): Promise<User | undefined> {
    const local = readLocalDb();
    const foundLocal = local.users.find((u) => u.id === id);
    if (foundLocal) return foundLocal;

    const sbResult = await withSupabaseTimeout(
      supabase.from("users").select("*").eq("id", id).maybeSingle()
    );
    if (sbResult && !sbResult.error && sbResult.data) {
      local.users.push(sbResult.data as User);
      writeLocalDb(local);
      return sbResult.data as User;
    }
    return undefined;
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const clean = username.trim().toLowerCase();

    const local = readLocalDb();
    const foundLocal = local.users.find((u) => {
      const uName = (u.username || "").toLowerCase();
      const uEmail = ((u as any).email || "").toLowerCase();
      if (uName === clean || uEmail === clean) return true;
      if (uName.includes("@") && uName.split("@")[0] === clean) return true;
      if (uEmail.includes("@") && uEmail.split("@")[0] === clean) return true;
      if (clean.includes("@") && clean.split("@")[0] === uName) return true;
      return false;
    });

    if (foundLocal) {
      return foundLocal;
    }

    const sbResult = await withSupabaseTimeout(
      supabase.from("users").select("*").ilike("username", clean).maybeSingle()
    );
    if (sbResult && !sbResult.error && sbResult.data) {
      local.users.push(sbResult.data as User);
      writeLocalDb(local);
      return sbResult.data as User;
    }

    return undefined;
  },

  async createUser(user: Omit<User, "id" | "createdAt" | "status" | "role" | "isFrozen" | "frozenReason">): Promise<User | null> {
    const newId = "u-" + Math.random().toString(36).substring(2, 11);
    const newUser: User = {
      ...user,
      id: newId,
      role: "user",
      status: "Active", // Active by default so user can immediately log in
      createdAt: new Date().toISOString(),
      isFrozen: false,
      frozenReason: "",
      rejectionReason: "",
    };

    const local = readLocalDb();
    const existingIndex = local.users.findIndex(
      (u) => u.username.toLowerCase() === user.username.toLowerCase()
    );
    if (existingIndex !== -1) {
      return local.users[existingIndex];
    }

    local.users.push(newUser);
    writeLocalDb(local);

    // Try Supabase in background
    withSupabaseTimeout(supabase.from("users").insert(newUser).select().single()).catch(() => { });

    return newUser;
  },

  async updateUserStatus(userId: string, status: "Active" | "Pending" | "Suspended" | "Rejected", reason: string = ""): Promise<User | undefined> {
    const local = readLocalDb();
    const idx = local.users.findIndex((u) => u.id === userId);
    let updatedUser: User | undefined;

    if (idx !== -1) {
      local.users[idx].status = status;
      if (status === "Rejected" || status === "Suspended") {
        local.users[idx].rejectionReason = reason;
        local.users[idx].frozenReason = reason;
      } else if (status === "Active") {
        local.users[idx].rejectionReason = "";
      }
      updatedUser = local.users[idx];
      writeLocalDb(local);
    }

    const updateData: any = { status };
    if (status === "Rejected" || status === "Suspended") {
      updateData.rejectionReason = reason;
      updateData.frozenReason = reason;
    } else if (status === "Active") {
      updateData.rejectionReason = "";
    }

    withSupabaseTimeout(
      supabase.from("users").update(updateData).eq("id", userId).select().single()
    ).catch(() => { });

    return updatedUser;
  },

  async freezeUser(userId: string, isFrozen: boolean, reason: string): Promise<User | undefined> {
    const local = readLocalDb();
    const idx = local.users.findIndex((u) => u.id === userId);
    let updatedUser: User | undefined;

    if (idx !== -1) {
      local.users[idx].isFrozen = isFrozen;
      local.users[idx].frozenReason = reason;
      updatedUser = local.users[idx];
      writeLocalDb(local);
    }

    withSupabaseTimeout(
      supabase.from("users").update({ isFrozen, frozenReason: reason }).eq("id", userId).select().single()
    ).catch(() => { });

    return updatedUser;
  },

  // Accounts API
  async generateUniqueAccountNumber(): Promise<string> {
    const local = readLocalDb();
    for (let attempt = 0; attempt < 20; attempt++) {
      const prefix = "84" + Math.floor(10 + Math.random() * 90).toString();
      const suffix = Math.floor(100000 + Math.random() * 900000).toString();
      const candidate = `${prefix}${suffix}`;
      const found = local.accounts.find((a) => a.accountNumber === candidate);
      if (!found) return candidate;
    }
    return `${Date.now()}`.slice(-10);
  },

  async getAccounts(userId: string): Promise<Account[]> {
    let accounts: Account[] = [];

    const sbResult = await withSupabaseTimeout(
      supabase.from("accounts").select("*").eq("userId", userId)
    );
    if (sbResult && !sbResult.error && sbResult.data && sbResult.data.length > 0) {
      accounts = sbResult.data as Account[];
    } else {
      const local = readLocalDb();
      accounts = local.accounts.filter((a) => a.userId === userId);
    }

    const local = readLocalDb();
    let localModified = false;

    const sanitized = accounts.map((acc) => {
      let accountNumber = acc.accountNumber;
      const routingNumber = acc.routingNumber || DEFAULT_ROUTING_NUMBER;

      if (!accountNumber || accountNumber.startsWith("...") || accountNumber.length < 8) {
        const rawDigits = (accountNumber || "").replace(/[^0-9]/g, "");
        const suffix = rawDigits.padStart(4, "0").slice(-4);
        const hash = Math.abs(acc.id.split("").reduce((a: number, char: string) => a + char.charCodeAt(0), 0) % 9000) + 1000;
        accountNumber = `84${hash}${suffix}`.slice(0, 10);

        const target = local.accounts.find((a) => a.id === acc.id);
        if (target) {
          target.accountNumber = accountNumber;
          target.routingNumber = routingNumber;
          localModified = true;
        }
      }

      return {
        ...acc,
        accountNumber,
        routingNumber,
        balance: Number(acc.balance) || 0,
        interestRate: Number(acc.interestRate) || 0,
        monthlyPayment: Number(acc.monthlyPayment) || 0,
        loanTerm: acc.loanTerm || "",
        originalPrincipal: Number(acc.originalPrincipal) || 0,
      } as Account;
    });

    if (localModified) {
      writeLocalDb(local);
    }

    return sanitized;
  },

  async getAccountById(id: string): Promise<Account | undefined> {
    const sbResult = await withSupabaseTimeout(
      supabase.from("accounts").select("*").eq("id", id).maybeSingle()
    );
    if (sbResult && !sbResult.error && sbResult.data) {
      const data = sbResult.data;
      return {
        ...data,
        routingNumber: data.routingNumber || DEFAULT_ROUTING_NUMBER,
        balance: Number(data.balance) || 0,
        interestRate: Number(data.interestRate) || 0,
        monthlyPayment: Number(data.monthlyPayment) || 0,
        loanTerm: data.loanTerm || "",
        originalPrincipal: Number(data.originalPrincipal) || 0,
      } as Account;
    }

    const local = readLocalDb();
    const found = local.accounts.find((a) => a.id === id);
    if (!found) return undefined;

    return {
      ...found,
      routingNumber: found.routingNumber || DEFAULT_ROUTING_NUMBER,
      balance: Number(found.balance) || 0,
      interestRate: Number(found.interestRate) || 0,
      monthlyPayment: Number(found.monthlyPayment) || 0,
      loanTerm: found.loanTerm || "",
      originalPrincipal: Number(found.originalPrincipal) || 0,
    };
  },

  async createAccount(
    userId: string,
    accountName: string,
    accountType: "checking" | "savings" | "credit" | "loan",
    initialBalance = 0,
    loanDetails?: {
      interestRate?: number;
      monthlyPayment?: number;
      loanTerm?: string;
      originalPrincipal?: number;
    }
  ): Promise<Account | null> {
    const uniqueNumber = await this.generateUniqueAccountNumber();
    const newId = "acc-" + Math.random().toString(36).substring(2, 11);

    const newAccount: Account = {
      id: newId,
      userId,
      accountNumber: uniqueNumber,
      routingNumber: DEFAULT_ROUTING_NUMBER,
      accountType,
      accountName,
      balance: initialBalance,
      interestRate: loanDetails?.interestRate || 0,
      monthlyPayment: loanDetails?.monthlyPayment || 0,
      loanTerm: loanDetails?.loanTerm || "",
      originalPrincipal: loanDetails?.originalPrincipal || (accountType === "loan" ? initialBalance : 0),
      createdAt: new Date().toISOString(),
    };

    const local = readLocalDb();
    local.accounts.push(newAccount);
    writeLocalDb(local);

    withSupabaseTimeout(
      supabase.from("accounts").insert(newAccount).select().single()
    ).catch(() => { });

    if (initialBalance !== 0) {
      await this.createTransaction({
        accountId: newId,
        title: accountType === "loan" ? "Loan Facility Disbursement" : "Initial Deposit",
        description: accountType === "loan" ? "Institutional Loan Funding" : "Account Opening Deposit Balance",
        amount: initialBalance,
        status: "Settled",
        effectiveDate: new Date().toISOString().split("T")[0],
      });
    }

    return newAccount;
  },

  // Cards API
  async generateUniqueCardNumber(): Promise<string> {
    const local = readLocalDb();
    for (let attempt = 0; attempt < 20; attempt++) {
      const p1 = "4532";
      const p2 = Math.floor(1000 + Math.random() * 9000).toString();
      const p3 = Math.floor(1000 + Math.random() * 9000).toString();
      const p4 = Math.floor(1000 + Math.random() * 9000).toString();
      const candidate = `${p1} ${p2} ${p3} ${p4}`;
      const found = local.cards.find((c) => c.cardNumber === candidate);
      if (!found) return candidate;
    }
    return `4532 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
  },

  async getCards(userId: string): Promise<Card[]> {
    let cards: Card[] = [];

    const sbResult = await withSupabaseTimeout(
      supabase.from("cards").select("*").eq("userId", userId)
    );
    if (sbResult && !sbResult.error && sbResult.data && sbResult.data.length > 0) {
      cards = sbResult.data as Card[];
    } else {
      const local = readLocalDb();
      cards = local.cards.filter((c) => c.userId === userId);
    }

    if (cards.length > 0) {
      return cards;
    }

    // Auto-provision card for user if none exists
    const user = await this.getUserById(userId);
    const cardHolder = user ? `${user.firstName} ${user.lastName}`.trim() : "Beacon Client";
    const accounts = await this.getAccounts(userId);
    const primaryAccount = accounts.find((a) => a.accountType === "checking") || accounts[0];

    const newCard = await this.provisionCardForUser(userId, cardHolder, primaryAccount?.id);
    return newCard ? [newCard] : [];
  },

  async provisionCardForUser(userId: string, cardHolder: string, accountId?: string): Promise<Card | null> {
    const cardNum = await this.generateUniqueCardNumber();
    const cvv = Math.floor(100 + Math.random() * 900).toString();
    const newId = "card-" + Math.random().toString(36).substring(2, 11);

    const cardObj: Card = {
      id: newId,
      userId,
      accountId,
      cardNumber: cardNum,
      cardHolder: cardHolder || "Valued Client",
      expiryMonth: "09",
      expiryYear: "29",
      cvv,
      cardType: "credit",
      cardTier: "Beacon Elite Black",
      creditLimit: 50000.0,
      availableCredit: 48750.0,
      status: "Active",
      isFrozen: false,
      createdAt: new Date().toISOString(),
    };

    const local = readLocalDb();
    local.cards.push(cardObj);
    writeLocalDb(local);

    withSupabaseTimeout(
      supabase.from("cards").insert(cardObj).select().single()
    ).catch(() => { });

    return cardObj;
  },

  async toggleCardFreeze(cardId: string, isFrozen: boolean): Promise<boolean> {
    const local = readLocalDb();
    const card = local.cards.find((c) => c.id === cardId);
    if (card) {
      card.isFrozen = isFrozen;
      card.status = isFrozen ? "Frozen" : "Active";
      writeLocalDb(local);
    }

    withSupabaseTimeout(
      supabase.from("cards").update({ isFrozen, status: isFrozen ? "Frozen" : "Active" }).eq("id", cardId)
    ).catch(() => { });

    return true;
  },

  // Loans API
  async createLoanAccount(params: {
    userId: string;
    loanName: string;
    amount: number;
    interestRate: number;
    termMonths: number;
  }): Promise<Account | null> {
    const P = params.amount;
    const monthlyRate = params.interestRate / 100 / 12;
    const n = params.termMonths;
    const monthlyPayment =
      monthlyRate > 0
        ? parseFloat(((P * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1)).toFixed(2))
        : parseFloat((P / n).toFixed(2));

    return await this.createAccount(
      params.userId,
      params.loanName || "Beacon Commercial Term Loan",
      "loan",
      params.amount,
      {
        interestRate: params.interestRate,
        monthlyPayment,
        loanTerm: `${params.termMonths} Months`,
        originalPrincipal: params.amount,
      }
    );
  },

  async payLoan(params: {
    userId: string;
    loanAccountId: string;
    sourceAccountId: string;
    amount: number;
  }): Promise<{ success: boolean; error?: string }> {
    const loanAcc = await this.getAccountById(params.loanAccountId);
    const sourceAcc = await this.getAccountById(params.sourceAccountId);

    if (!loanAcc || loanAcc.accountType !== "loan") {
      return { success: false, error: "Invalid loan facility account" };
    }
    if (!sourceAcc) {
      return { success: false, error: "Source account not found" };
    }
    if (Number(sourceAcc.balance) < params.amount) {
      return { success: false, error: "Insufficient available funds in source account" };
    }

    const newSourceBalance = parseFloat((Number(sourceAcc.balance) - params.amount).toFixed(2));
    const newLoanBalance = Math.max(0, parseFloat((Number(loanAcc.balance) - params.amount).toFixed(2)));

    const local = readLocalDb();
    const lSource = local.accounts.find((a) => a.id === sourceAcc.id);
    const lLoan = local.accounts.find((a) => a.id === loanAcc.id);
    if (lSource) lSource.balance = newSourceBalance;
    if (lLoan) lLoan.balance = newLoanBalance;
    writeLocalDb(local);

    withSupabaseTimeout(
      supabase.from("accounts").update({ balance: newSourceBalance }).eq("id", sourceAcc.id)
    ).catch(() => { });

    withSupabaseTimeout(
      supabase.from("accounts").update({ balance: newLoanBalance }).eq("id", loanAcc.id)
    ).catch(() => { });

    await this.createTransaction({
      accountId: sourceAcc.id,
      title: `Loan Payment - ${loanAcc.accountName}`,
      description: `Principal & Interest installment towards ${loanAcc.accountNumber}`,
      amount: -params.amount,
      status: "Settled",
      effectiveDate: new Date().toISOString().split("T")[0],
    });

    await this.createTransaction({
      accountId: loanAcc.id,
      title: "Loan Installment Received",
      description: `Payment received from account ${sourceAcc.accountNumber}`,
      amount: -params.amount,
      status: "Settled",
      effectiveDate: new Date().toISOString().split("T")[0],
    });

    return { success: true };
  },

  // Transactions API
  async getTransactions(accountId: string): Promise<Transaction[]> {
    const sbResult = await withSupabaseTimeout(
      supabase.from("transactions").select("*").eq("accountId", accountId).order("createdAt", { ascending: false })
    );
    if (sbResult && !sbResult.error && sbResult.data && sbResult.data.length > 0) {
      return sbResult.data as Transaction[];
    }

    const local = readLocalDb();
    return local.transactions
      .filter((t) => t.accountId === accountId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async getAllTransactions(): Promise<Transaction[]> {
    const sbResult = await withSupabaseTimeout(
      supabase.from("transactions").select("*").order("createdAt", { ascending: false })
    );
    if (sbResult && !sbResult.error && sbResult.data && sbResult.data.length > 0) {
      return sbResult.data as Transaction[];
    }

    const local = readLocalDb();
    return local.transactions
      .slice()
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },

  async createTransaction(tx: Omit<Transaction, "id" | "createdAt">): Promise<Transaction | null> {
    const newId = "tx-" + Math.random().toString(36).substring(2, 11);
    const newTx: Transaction = {
      ...tx,
      id: newId,
      createdAt: new Date().toISOString(),
    };

    const local = readLocalDb();
    local.transactions.unshift(newTx);

    // Update the account balance in local DB
    const account = local.accounts.find((a) => a.id === tx.accountId);
    if (account) {
      account.balance = parseFloat((Number(account.balance) + Number(tx.amount)).toFixed(2));
    }
    writeLocalDb(local);

    withSupabaseTimeout(supabase.from("transactions").insert(newTx).select().single()).catch(() => { });
    if (account) {
      withSupabaseTimeout(
        supabase.from("accounts").update({ balance: account.balance }).eq("id", tx.accountId)
      ).catch(() => { });
    }

    return newTx;
  },

  async updateTransactionStatus(txId: string, status: "Settled" | "Rejected"): Promise<Transaction | undefined> {
    const local = readLocalDb();
    const tx = local.transactions.find((t) => t.id === txId);
    if (!tx) return undefined;

    const oldStatus = tx.status;
    tx.status = status;

    if (status === "Rejected" && oldStatus === "Pending") {
      const account = local.accounts.find((a) => a.id === tx.accountId);
      if (account) {
        account.balance = parseFloat((Number(account.balance) - Number(tx.amount)).toFixed(2));
      }
    }
    writeLocalDb(local);

    withSupabaseTimeout(supabase.from("transactions").update({ status }).eq("id", txId)).catch(() => { });
    if (status === "Rejected" && oldStatus === "Pending") {
      const account = local.accounts.find((a) => a.id === tx.accountId);
      if (account) {
        withSupabaseTimeout(
          supabase.from("accounts").update({ balance: account.balance }).eq("id", tx.accountId)
        ).catch(() => { });
      }
    }

    return tx;
  },

  // Admin Ledger Override API
  async executeOverride(params: {
    accountId: string;
    type: "credit" | "debit";
    amount: number;
    effectiveDate: string;
    reason: string;
    justification: string;
    authCode: string;
  }): Promise<Transaction | null> {
    const actualAmount = params.type === "credit" ? params.amount : -params.amount;

    return await this.createTransaction({
      accountId: params.accountId,
      title: "Manual Ledger Override",
      description: "Compliance Correction applied by Admin. Prior balance adjusted.",
      amount: actualAmount,
      status: "Settled",
      effectiveDate: params.effectiveDate,
      isOverride: true,
      overrideReason: params.reason,
      authCode: params.authCode,
      justification: params.justification,
    });
  },

  async executeAdjustment(params: {
    accountId: string;
    type: "credit" | "debit";
    method: "wire" | "ach" | "zelle" | "deposit" | "billpay";
    amount: number;
    effectiveDate: string; // "YYYY-MM-DD"
    customTime?: string; // "HH:MM:SS"
    reference?: string;
  }): Promise<Transaction | null> {
    const actualAmount = params.type === "credit" ? params.amount : -params.amount;

    let title = "";
    let description = "";
    const isCredit = params.type === "credit";

    switch (params.method) {
      case "wire":
        title = isCredit ? "Wire Deposit" : "Wire Transfer OUT";
        description = isCredit ? "Incoming Wire Transfer" : "Outgoing Wire Transfer";
        break;
      case "ach":
        title = isCredit ? "ACH Deposit" : "ACH Transfer OUT";
        description = isCredit ? "Incoming ACH Transfer" : "Outgoing ACH Transfer";
        break;
      case "zelle":
        title = isCredit ? "Zelle Transfer Credit" : "Zelle Transfer";
        description = isCredit ? "Zelle Transfer IN" : "Zelle Transfer OUT";
        break;
      case "deposit":
        title = "Mobile Deposit";
        description = "Check Deposit via Mobile Capture";
        break;
      case "billpay":
        title = "Bill Payment";
        description = "Electronic Payment to Biller";
        break;
    }

    let createdAt = new Date().toISOString();
    if (params.customTime) {
      try {
        const dtStr = `${params.effectiveDate}T${params.customTime}Z`;
        createdAt = new Date(dtStr).toISOString();
      } catch (e) {
        // use default
      }
    } else {
      createdAt = new Date(`${params.effectiveDate}T12:00:00Z`).toISOString();
    }

    return await this.createTransaction({
      accountId: params.accountId,
      title,
      description,
      amount: actualAmount,
      status: "Settled",
      effectiveDate: params.effectiveDate,
      authCode: params.reference || "",
    });
  },
};

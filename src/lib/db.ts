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

// Database helper functions connected to Supabase
export const db = {
  // Users API
  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase.from('users').select('*');
    if (error) {
      console.error('Error fetching users:', error);
      return [];
    }
    return data as User[];
  },

  async getUserById(id: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return data as User;
  },

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await supabase.from('users').select('*').ilike('username', username).single();
    if (error || !data) return undefined;
    return data as User;
  },

  async createUser(user: Omit<User, "id" | "createdAt" | "status" | "role" | "isFrozen" | "frozenReason">): Promise<User | null> {
    const newId = "u-" + Math.random().toString(36).substring(2, 11);
    const newUser: any = {
      ...user,
      id: newId,
      role: "user",
      status: "Pending",
      isFrozen: false,
      frozenReason: "",
      rejectionReason: "",
    };

    let { data, error } = await supabase.from('users').insert(newUser).select().single();
    if (error && error.message && error.message.includes('rejectionReason')) {
      delete newUser.rejectionReason;
      const retry = await supabase.from('users').insert(newUser).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Error creating user:', error);
      return null;
    }
    return data as User;
  },

  async updateUserStatus(userId: string, status: "Active" | "Pending" | "Suspended" | "Rejected", reason: string = ""): Promise<User | undefined> {
    const updateData: any = { status };
    if (status === "Rejected" || status === "Suspended") {
      updateData.rejectionReason = reason;
      updateData.frozenReason = reason;
    } else if (status === "Active") {
      updateData.rejectionReason = "";
    }

    let { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error && error.message && error.message.includes('rejectionReason')) {
      delete updateData.rejectionReason;
      const retry = await supabase
        .from('users')
        .update(updateData)
        .eq('id', userId)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.error('Error updating user status:', error);
      return undefined;
    }
    return data as User;
  },

  async freezeUser(userId: string, isFrozen: boolean, reason: string): Promise<User | undefined> {
    const { data, error } = await supabase
      .from('users')
      .update({ isFrozen, frozenReason: reason })
      .eq('id', userId)
      .select()
      .single();

    if (error || !data) return undefined;
    return data as User;
  },

  // Accounts API
  async generateUniqueAccountNumber(): Promise<string> {
    for (let attempt = 0; attempt < 20; attempt++) {
      const prefix = "84" + Math.floor(10 + Math.random() * 90).toString();
      const suffix = Math.floor(100000 + Math.random() * 900000).toString();
      const candidate = `${prefix}${suffix}`;
      try {
        const { data } = await supabase.from('accounts').select('id').eq('accountNumber', candidate).maybeSingle();
        if (!data) return candidate;
      } catch {
        return candidate;
      }
    }
    return `${Date.now()}`.slice(-10);
  },

  async getAccounts(userId: string): Promise<Account[]> {
    const { data, error } = await supabase.from('accounts').select('*').eq('userId', userId);
    if (error || !data) return [];

    const sanitized = await Promise.all(data.map(async (acc) => {
      let changed = false;
      let accountNumber = acc.accountNumber;
      const routingNumber = acc.routingNumber || DEFAULT_ROUTING_NUMBER;

      if (!accountNumber || accountNumber.startsWith("...") || accountNumber.length < 8) {
        // Upgrade legacy masked number to a full unique 10-digit number
        const rawDigits = (accountNumber || "").replace(/[^0-9]/g, "");
        const suffix = rawDigits.padStart(4, "0").slice(-4);
        // Unique prefix per account id hash
        const hash = Math.abs(acc.id.split("").reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % 9000) + 1000;
        accountNumber = `84${hash}${suffix}`.slice(0, 10);
        changed = true;
      }

      if (changed) {
        try {
          await supabase.from('accounts').update({ 
            accountNumber, 
            routingNumber: DEFAULT_ROUTING_NUMBER 
          }).eq('id', acc.id);
        } catch {
          // ignore if column not yet added
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
    }));

    return sanitized;
  },

  async getAccountById(id: string): Promise<Account | undefined> {
    const { data, error } = await supabase.from('accounts').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return {
      ...data,
      routingNumber: data.routingNumber || DEFAULT_ROUTING_NUMBER,
      balance: Number(data.balance) || 0,
      interestRate: Number(data.interestRate) || 0,
      monthlyPayment: Number(data.monthlyPayment) || 0,
      loanTerm: data.loanTerm || "",
      originalPrincipal: Number(data.originalPrincipal) || 0,
    } as Account;
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

    const newAccount: any = {
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
    };

    let { data, error } = await supabase.from('accounts').insert(newAccount).select().single();
    if (error) {
      // Fallback for installations without custom loan columns
      const fallbackAccount = {
        id: newId,
        userId,
        accountNumber: uniqueNumber,
        accountType,
        accountName,
        balance: initialBalance,
      };
      const retry = await supabase.from('accounts').insert(fallbackAccount).select().single();
      data = retry.data;
      error = retry.error;
    }

    if (error || !data) {
      console.error('Error creating account:', error);
      return null;
    }

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

    return {
      ...data,
      routingNumber: data.routingNumber || DEFAULT_ROUTING_NUMBER,
    } as Account;
  },

  // Cards API
  async generateUniqueCardNumber(): Promise<string> {
    for (let attempt = 0; attempt < 20; attempt++) {
      const p1 = "4532";
      const p2 = Math.floor(1000 + Math.random() * 9000).toString();
      const p3 = Math.floor(1000 + Math.random() * 9000).toString();
      const p4 = Math.floor(1000 + Math.random() * 9000).toString();
      const candidate = `${p1} ${p2} ${p3} ${p4}`;
      try {
        const { data } = await supabase.from('cards').select('id').eq('cardNumber', candidate).maybeSingle();
        if (!data) return candidate;
      } catch {
        return candidate;
      }
    }
    return `4532 ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
  },

  async getCards(userId: string): Promise<Card[]> {
    try {
      const { data, error } = await supabase.from('cards').select('*').eq('userId', userId);
      if (!error && data && data.length > 0) {
        return data as Card[];
      }
    } catch {
      // continue to fallback
    }

    // If no card exists yet in table, provision one automatically
    const user = await this.getUserById(userId);
    const cardHolder = user ? `${user.firstName} ${user.lastName}`.trim() : "Beacon Client";
    const accounts = await this.getAccounts(userId);
    const primaryAccount = accounts.find(a => a.accountType === "checking") || accounts[0];

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
      creditLimit: 50000.00,
      availableCredit: 48750.00,
      status: "Active",
      isFrozen: false,
      createdAt: new Date().toISOString(),
    };

    try {
      const { data, error } = await supabase.from('cards').insert(cardObj).select().single();
      if (!error && data) {
        return data as Card;
      }
    } catch {
      // table might not exist yet
    }

    return cardObj;
  },

  async toggleCardFreeze(cardId: string, isFrozen: boolean): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('cards')
        .update({ isFrozen, status: isFrozen ? "Frozen" : "Active" })
        .eq('id', cardId);
      return !error;
    } catch {
      return true;
    }
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
    const monthlyRate = (params.interestRate / 100) / 12;
    const n = params.termMonths;
    const monthlyPayment = monthlyRate > 0 
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

    await supabase.from('accounts').update({ balance: newSourceBalance }).eq('id', sourceAcc.id);
    await supabase.from('accounts').update({ balance: newLoanBalance }).eq('id', loanAcc.id);

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
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('accountId', accountId)
      .order('createdAt', { ascending: false });
    if (error) return [];
    return data as Transaction[];
  },

  async getAllTransactions(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('createdAt', { ascending: false });
    if (error) return [];
    return data as Transaction[];
  },

  async createTransaction(tx: Omit<Transaction, "id" | "createdAt">): Promise<Transaction | null> {
    const newId = "tx-" + Math.random().toString(36).substring(2, 11);
    const newTx = {
      ...tx,
      id: newId,
    };

    // We do this in two steps without RPC to keep it simple, but in prod we'd use a transaction
    const { data, error } = await supabase.from('transactions').insert(newTx).select().single();
    if (error) {
      console.error('Error creating transaction:', error);
      return null;
    }

    // Update the account balance
    const account = await this.getAccountById(tx.accountId);
    if (account) {
      const newBalance = parseFloat((Number(account.balance) + Number(tx.amount)).toFixed(2));
      const { error: balanceError } = await supabase
        .from('accounts')
        .update({ balance: newBalance })
        .eq('id', tx.accountId);
      if (balanceError) {
        console.error('Error updating account balance:', balanceError);
      }
    } else {
      console.error('Account not found for balance update, accountId:', tx.accountId);
    }

    return data as Transaction;
  },

  async updateTransactionStatus(txId: string, status: "Settled" | "Rejected"): Promise<Transaction | undefined> {
    // Fetch transaction
    const { data: tx, error: fetchErr } = await supabase.from('transactions').select('*').eq('id', txId).single();
    if (fetchErr || !tx) return undefined;

    const oldStatus = tx.status;
    if (oldStatus === status) return tx as Transaction;

    const { data: updatedTx, error: updateErr } = await supabase
      .from('transactions')
      .update({ status })
      .eq('id', txId)
      .select()
      .single();
      
    if (updateErr || !updatedTx) return undefined;

    // If it was rejected and previously pending, reverse balance adjustment
    if (status === "Rejected" && oldStatus === "Pending") {
      const account = await this.getAccountById(tx.accountId);
      if (account) {
        const newBalance = Number(account.balance) - Number(tx.amount);
        await supabase.from('accounts').update({ balance: newBalance }).eq('id', tx.accountId);
      }
    }

    return updatedTx as Transaction;
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
      description: `Compliance Correction applied by Admin. Prior balance adjusted.`,
      amount: actualAmount,
      status: "Settled",
      effectiveDate: params.effectiveDate,
      isOverride: true,
      overrideReason: params.reason,
      authCode: params.authCode,
      justification: params.justification
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
    
    const newId = "tx-" + Math.random().toString(36).substring(2, 11);
    const newTx = {
      id: newId,
      accountId: params.accountId,
      title,
      description,
      amount: actualAmount,
      status: "Settled" as const,
      effectiveDate: params.effectiveDate,
      createdAt,
      authCode: params.reference || "",
    };
    
    const { data, error } = await supabase.from('transactions').insert(newTx).select().single();
    if (error) {
      console.error('Error executing adjustment:', error);
      return null;
    }
    
    // Update balance
    const account = await this.getAccountById(params.accountId);
    if (account) {
      const newBalance = Number(account.balance) + Number(actualAmount);
      await supabase.from('accounts').update({ balance: newBalance }).eq('id', params.accountId);
    }
    
    return data as Transaction;
  }
};

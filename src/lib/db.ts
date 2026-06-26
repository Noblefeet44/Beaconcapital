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
  status: "Active" | "Pending" | "Suspended";
  createdAt: string;
  isFrozen: boolean;
  frozenReason: string;
}

export interface Account {
  id: string;
  userId: string;
  accountNumber: string;
  accountType: "checking" | "savings" | "credit";
  accountName: string;
  balance: number; // Stored current balance
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
    const newUser = {
      ...user,
      id: newId,
      role: "user",
      status: "Active",
      isFrozen: false,
      frozenReason: "",
    };

    const { data, error } = await supabase.from('users').insert(newUser).select().single();
    if (error) {
      console.error('Error creating user:', error);
      return null;
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
  async getAccounts(userId: string): Promise<Account[]> {
    const { data, error } = await supabase.from('accounts').select('*').eq('userId', userId);
    if (error) return [];
    return data as Account[];
  },

  async getAccountById(id: string): Promise<Account | undefined> {
    const { data, error } = await supabase.from('accounts').select('*').eq('id', id).single();
    if (error || !data) return undefined;
    return data as Account;
  },

  async createAccount(userId: string, accountName: string, accountType: "checking" | "savings" | "credit", initialBalance = 0): Promise<Account | null> {
    const cleanLastDigits = Math.floor(1000 + Math.random() * 9000).toString();
    const newId = "acc-" + Math.random().toString(36).substring(2, 11);

    const newAccount = {
      id: newId,
      userId,
      accountNumber: "..." + cleanLastDigits,
      accountType,
      accountName,
      balance: initialBalance,
    };

    const { data, error } = await supabase.from('accounts').insert(newAccount).select().single();
    if (error) {
      console.error('Error creating account:', error);
      return null;
    }

    if (initialBalance !== 0) {
      await this.createTransaction({
        accountId: newId,
        title: "Initial Deposit",
        description: "Account Opening Deposit Balance",
        amount: initialBalance,
        status: "Settled",
        effectiveDate: new Date().toISOString().split("T")[0],
      });
    }

    return data as Account;
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

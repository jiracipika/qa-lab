/**
 * Northlake Sandbox Bank - a contained fictional banking app with a documented specification
 * and a small, deliberate set of planted defects. Synthetic data only: no real accounts,
 * transactions, or financial information. The defect list is kept in this module, separate
 * from the platform itself, and only surfaces through behaviour or the explicit reveal.
 */

export interface Payee {
  id: string;
  nickname: string;
  accountNumber: string;
}

export interface BankTxn {
  id: string;
  label: string;
  amount: number;
  daysAgo: number;
}

export interface BankState {
  loggedIn: boolean;
  failedLogins: number;
  payees: Payee[];
  transactions: BankTxn[];
  balance: number;
}

export const DEMO_USER = "demo";
export const DEMO_PASS = "Sandbox123!";

export interface SpecItem {
  id: string;
  area: string;
  text: string;
}

/** The specification: expected behaviour. Defects are defined relative to this. */
export const bankSpec: SpecItem[] = [
  { id: "S1", area: "Login", text: `Login accepts only ${DEMO_USER} / ${DEMO_PASS}. After 3 consecutive failed attempts the account is locked for 5 minutes with message ACCOUNT_LOCKED.` },
  { id: "S2", area: "Payees", text: "A payee has a nickname and an account number. The nickname is required, 1 to 30 characters, after trimming." },
  { id: "S3", area: "Payees", text: "The account number is 8 to 12 digits, and each account number can be saved only once (no duplicate payees)." },
  { id: "S4", area: "Transfer", text: "Transfer amounts must be between 1.00 and 10,000.00 EUR inclusive, and may not exceed the available balance." },
  { id: "S5", area: "Transfer", text: "The confirmation screen shows the payee's masked account number (last 4 digits) and the exact submitted amount." },
  { id: "S6", area: "Transfer", text: "A successful transfer reduces the balance by the exact amount and records the transaction immediately." },
  { id: "S7", area: "History", text: "The 'Last 7 days' filter shows transactions from today up to 6 days ago, inclusive of today." },
];

export interface SandboxDefect {
  id: string;
  specId: string;
  title: string;
  howToFind: string;
  explanation: string;
}

/** The planted defects. Isolated here; revealed only on explicit user action. */
export const sandboxDefects: SandboxDefect[] = [
  {
    id: "D1",
    specId: "S4",
    title: "Transfer of exactly 10,000.00 is rejected",
    howToFind: "Attempt a transfer of exactly 10,000.00 with sufficient balance - rejected although the spec includes the maximum.",
    explanation: "The validation treats the upper bound as exclusive (< instead of <=). An inclusive-boundary defect - exactly what boundary value analysis catches with max and max+ probes.",
  },
  {
    id: "D2",
    specId: "S2",
    title: "Payee with an empty nickname can be saved",
    howToFind: "Leave the nickname blank (or spaces only), enter a valid account number, save - accepted with an empty name in the list.",
    explanation: "Missing required-field validation on the trimmed nickname. The spec requires 1-30 characters after trimming.",
  },
  {
    id: "D3",
    specId: "S3",
    title: "Duplicate payee account numbers are allowed",
    howToFind: "Add the same account number twice (different nicknames if you like) - both saves succeed.",
    explanation: "The uniqueness rule for account numbers is not enforced. Consequences: ambiguous transfers, potential double payments - a data-integrity defect, not just cosmetic.",
  },
  {
    id: "D4",
    specId: "S7",
    title: "'Last 7 days' history filter excludes today's transactions",
    howToFind: "Make a transfer, then open History with 'Last 7 days' - today's transfer is missing; 'All' shows it.",
    explanation: "The date comparison excludes the current day (strictly greater than today's start). Payday-invisible-transactions class of defect.",
  },
  {
    id: "D5",
    specId: "S5",
    title: "Confirmation shows the amount truncated to whole euros",
    howToFind: "Transfer 250.75 - the confirmation reads '250' instead of '250.75' (amount floored, not displayed to 2 decimals).",
    explanation: "Display formatting defect: Math.floor instead of toFixed(2). The actual debit is correct (compare history) - which is exactly why confirmation mismatches erode trust: user-visible wrong, ledger right.",
  },
  {
    id: "D6",
    specId: "S1",
    title: "Account never locks after failed login attempts",
    howToFind: "Enter a wrong password 4+ times - the account still accepts the correct password immediately; no ACCOUNT_LOCKED message ever appears.",
    explanation: "The lockout rule is absent. A security-relevant defect: brute-force protection the specification promises is not implemented.",
  },
];

export function initialBank(): BankState {
  return {
    loggedIn: false,
    failedLogins: 0,
    payees: [
      { id: "py-1", nickname: "Landlord", accountNumber: "11223344" },
    ],
    transactions: [
      { id: "tx-1", label: "Salary", amount: 3000, daysAgo: 0 },
      { id: "tx-2", label: "Bookstore", amount: -14.99, daysAgo: 0 },
      { id: "tx-3", label: "Groceries", amount: -45.2, daysAgo: 1 },
      { id: "tx-4", label: "Electronics", amount: -129.9, daysAgo: 3 },
      { id: "tx-5", label: "Refund", amount: 60, daysAgo: 9 },
    ],
    balance: 4850.25,
  };
}

export function login(state: BankState, username: string, password: string): { state: BankState; error?: string } {
  // DEFECT D6: no lockout ever happens (spec: lock after 3 consecutive failures)
  if (username.trim() === DEMO_USER && password === DEMO_PASS) {
    return { state: { ...state, loggedIn: true, failedLogins: 0 } };
  }
  return { state: { ...state, failedLogins: state.failedLogins + 1 }, error: "Invalid credentials" };
}

export function addPayee(state: BankState, nicknameRaw: string, accountNumber: string): { state: BankState; error?: string; payee?: Payee } {
  // DEFECT D2: spec requires trimmed nickname 1-30 chars; app only rejects >30
  const nickname = nicknameRaw;
  if (nickname.trim().length > 30) {
    return { state, error: "Nickname too long (max 30)" };
  }
  if (!/^\d{8,12}$/.test(accountNumber)) {
    return { state, error: "Account number must be 8-12 digits" };
  }
  // DEFECT D3: spec forbids duplicate account numbers; app allows them
  const payee: Payee = { id: `py-${Date.now()}`, nickname: nickname.trim() === "" ? "" : nickname.trim(), accountNumber };
  return { state: { ...state, payees: [...state.payees, payee] }, payee };
}

export interface TransferResult {
  state: BankState;
  error?: string;
  confirmation?: { payeeId: string; maskedAccount: string; displayedAmount: string; actualAmount: number };
}

export function transfer(state: BankState, payeeId: string, amountInput: string): TransferResult {
  const amount = Number(amountInput);
  if (Number.isNaN(amount)) {
    return { state, error: "Enter a valid amount" };
  }
  // DEFECT D1: upper bound treated as exclusive (rejects exactly 10,000.00)
  if (amount < 1 || amount >= 10000) {
    return { state, error: amount >= 10000 ? "Amount above maximum (10,000.00)" : "Amount below minimum (1.00)" };
  }
  if (amount > state.balance) {
    return { state, error: "Insufficient balance" };
  }
  const payee = state.payees.find((p) => p.id === payeeId);
  if (!payee) {
    return { state, error: "Choose a payee" };
  }
  const txn: BankTxn = {
    id: `tx-${Date.now()}`,
    label: `Transfer to ${payee.nickname || "(no nickname)"}`,
    amount: -amount,
    daysAgo: 0,
  };
  // DEFECT D5: confirmation displays truncated amount (floor) instead of exact 2-decimal value
  return {
    state: { ...state, balance: round2(state.balance - amount), transactions: [...state.transactions, txn] },
    confirmation: {
      payeeId,
      maskedAccount: `****${payee.accountNumber.slice(-4)}`,
      displayedAmount: String(Math.floor(amount)),
      actualAmount: amount,
    },
  };
}

export function history(state: BankState, filter: "all" | "week"): BankTxn[] {
  if (filter === "all") {
    return [...state.transactions].sort((a, b) => a.daysAgo - b.daysAgo);
  }
  // DEFECT D4: 'last 7 days' excludes today (daysAgo > 0)
  return state.transactions.filter((t) => t.daysAgo > 0 && t.daysAgo <= 6).sort((a, b) => a.daysAgo - b.daysAgo);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

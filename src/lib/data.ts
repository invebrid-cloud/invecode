
import type { LucideIcon } from 'lucide-react';
import { Bitcoin, CircleDollarSign, Smartphone, Globe, Laptop } from 'lucide-react';

// ==================================
// SHARED TYPES
// ==================================

export type Transaction = {
  id: string;
  date: string;
  type: 'Deposit' | 'Withdrawal' | 'Investment' | 'Profit';
  amount: number;
  status: 'Completed' | 'Pending' | 'Failed';
  details: string;
};

export type Notification = {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
};

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  investorCode: string;
  joinDate: string;
  country: string;
  totalBalance: number;
  availableBalance: number;
  status: 'Active' | 'Suspended' | 'Pending';
  transactions: Transaction[];
  notifications: Notification[];
};

export type InvestmentPlan = {
  id: string;
  offerer: string;
  type: string;
  roi: string;
  range: string;
  features: string[];
};

export type MarketInvestment = {
  id: string;
  name: string;
  Icon: LucideIcon;
  price: number;
  change: number;
  holdingsValue: number;
  holdingsAmount: string;
}

// ==================================
// MOCK DATABASE (Users Array)
// ==================================

export const users: User[] = [
  { 
    id: 'admin-user',
    name: 'Admin',
    username: '@admin',
    email: 'admin@gmail.com',
    investorCode: 'admin123',
    joinDate: '2023-01-01',
    country: 'USA',
    totalBalance: 0,
    availableBalance: 0,
    status: 'Active',
    transactions: [],
    notifications: [
        {
            id: "admin_notif1",
            title: "New User Registration",
            message: "A new user, Alice Johnson (alice.j@example.com), has registered on the platform and is awaiting account verification.",
            timestamp: "5 minutes ago",
            read: false
        },
        {
            id: "admin_notif2",
            title: "Large Deposit Pending",
            message: "A deposit of $25,000 from user 'jane.smith' is pending confirmation. Please review and approve.",
            timestamp: "30 minutes ago",
            read: false
        },
        {
            id: "admin_notif3",
            title: "System Maintenance Required",
            message: "The database server is reporting high CPU usage. A restart is recommended during off-peak hours.",
            timestamp: "1 hour ago",
            read: true
        },
        {
            id: "admin_notif4",
            title: "Failed Withdrawal Attempt",
            message: "User 'rob.brown' had a withdrawal of $5,000 fail due to an invalid wallet address.",
            timestamp: "4 hours ago",
            read: false
        },
    ]
  },
  { 
    id: 'user1', 
    name: 'John Doe', 
    username: '@john.doe', 
    email: 'john.doe@example.com', 
    investorCode: 'user123',
    joinDate: '2023-10-01', 
    country: 'United States',
    totalBalance: 87456.21,
    availableBalance: 15234.56,
    status: 'Active',
    transactions: [
      { id: 'txn1', date: '2023-10-26', type: 'Deposit', amount: 1200.00, status: 'Completed', details: 'BTC Deposit' },
      { id: 'txn2', date: '2023-10-25', type: 'Investment', amount: 5000.00, status: 'Completed', details: 'Innovate Tech Portfolio' },
      { id: 'txn4', date: '2023-10-23', type: 'Deposit', amount: 300.00, status: 'Completed', details: 'ETH Deposit' },
      { id: 'txn6', date: '2023-10-21', type: 'Withdrawal', amount: 2000.00, status: 'Completed', details: 'BTC to 1A...Na' },
      { id: 'txn8', date: '2023-10-19', type: 'Investment', amount: 750.00, status: 'Completed', details: 'CryptoHouse ETH Staking' },
    ],
    notifications: [
        {
            id: "notif1",
            title: "Deposit Confirmed",
            message: "Your deposit of 0.05 BTC has been confirmed and added to your account.",
            timestamp: "2 hours ago",
            read: false
        },
        {
            id: "notif3",
            title: "Withdrawal Processed",
            message: "Your withdrawal request of $500 has been successfully processed.",
            timestamp: "1 day ago",
            read: true
        },
    ]
  },
  { 
    id: 'user2', 
    name: 'Jane Smith', 
    username: '@jane.smith', 
    email: 'jane.smith@example.com', 
    investorCode: 'jane123',
    joinDate: '2023-09-15', 
    country: 'Canada',
    totalBalance: 123890.50, 
    availableBalance: 25000,
    status: 'Active',
    transactions: [
      { id: 'txn9', date: '2023-10-28', type: 'Deposit', amount: 25000.00, status: 'Pending', details: 'SOL Deposit from Jane Smith' },
    ],
    notifications: [
       {
            id: "notif2",
            title: "New Investment Opportunity",
            message: "Check out the new high-yield bond from Innovate Inc. with a projected 25% annual return.",
            timestamp: "8 hours ago",
            read: false
        },
    ]
  },
  { 
    id: 'user3', 
    name: 'Alice Johnson', 
    username: '@alice.j', 
    email: 'alice.j@example.com', 
    investorCode: 'alice123',
    joinDate: '2023-10-28', 
    country: 'United Kingdom',
    totalBalance: 5200.00, 
    availableBalance: 1200,
    status: 'Pending',
    transactions: [
       { id: 'txn11', date: '2023-10-30', type: 'Deposit', amount: 150.00, status: 'Pending', details: 'USDC Deposit from Alice Johnson' },
    ],
    notifications: [
      {
          id: "notif5",
          title: "Welcome to InvestBridge!",
          message: "Thank you for joining InvestBridge. Start by exploring our investment opportunities or depositing funds.",
          timestamp: "1 week ago",
          read: true
      }
    ]
  },
  { 
    id: 'user4', 
    name: 'Robert Brown', 
    username: '@rob.brown', 
    email: 'rob.brown@example.com', 
    investorCode: 'rob123',
    joinDate: '2023-05-20', 
    country: 'Australia',
    totalBalance: 25000.00, 
    availableBalance: 500,
    status: 'Suspended',
    transactions: [
      { id: 'txn3', date: '2023-10-24', type: 'Withdrawal', amount: 500.00, status: 'Pending', details: 'ETH to 0x...88 by Robert Brown' },
      { id: 'txn7', date: '2023-10-20', type: 'Deposit', amount: 750.00, status: 'Failed', details: 'Card Deposit by Robert Brown' },
    ],
    notifications: [
       {
            id: "notif4",
            title: "Security Alert: New Login",
            message: "Your account was accessed from a new device in London, UK. If this wasn't you, please secure your account immediately.",
            timestamp: "3 days ago",
            read: false
        },
    ]
  },
  { 
    id: 'user5', 
    name: 'Emily Davis', 
    username: '@emily.d', 
    email: 'emily.d@example.com', 
    investorCode: 'emily123',
    joinDate: '2023-10-10', 
    country: 'Germany',
    totalBalance: 76543.21, 
    availableBalance: 22000,
    status: 'Active',
    transactions: [
       { id: 'txn5', date: '2023-10-22', type: 'Investment', amount: 1000.00, status: 'Pending', details: 'A&P Company Bond by Emily Davis' },
    ],
    notifications: []
  },
  {
    id: 'user6',
    name: 'Ricardo Jose',
    username: 'Ricardo12',
    email: 'Ricardo@gmail.com',
    investorCode: '56729419AsGH2',
    joinDate: '2023-11-05',
    country: 'Brazil',
    totalBalance: 18000,
    availableBalance: 300,
    status: 'Suspended',
    transactions: [
        { id: 'txn-ricardo-1', date: '2023-11-05', type: 'Deposit', amount: 18000, status: 'Completed', details: 'Initial account funding' }
    ],
    notifications: [
        { id: 'notif-ricardo-1', title: 'Welcome to InvestBridge!', message: 'Your account has been created. Your investor code is ready.', timestamp: '1 minute ago', read: false },
        { id: 'notif-ricardo-2', title: 'Account Suspended', message: 'Your account is currently suspended. Please contact support for more information.', timestamp: '1 minute ago', read: false }
    ]
  },
  {
    id: 'user7',
    name: 'Chuah Siew Lean',
    username: 'siewlean1',
    email: 'lerwame@gmail.com',
    investorCode: '5672VB569AsGH2',
    joinDate: '2025-12-26',
    country: 'Malaysia',
    totalBalance: 13000,
    availableBalance: 500,
    status: 'Suspended',
    transactions: [
        { id: 'txn-siewlean-1', date: '2025-12-26', type: 'Deposit', amount: 500, status: 'Completed', details: 'RM Deposit' },
        { id: 'txn-siewlean-2', date: '2026-01-05', type: 'Profit', amount: 12500, status: 'Completed', details: 'Investment Payout' }
    ],
    notifications: [
        { id: 'notif-siewlean-1', title: 'Welcome to InvestBridge!', message: 'Your account has been successfully created.', timestamp: 'On 26 Dec 2025', read: false },
        { id: 'notif-siewlean-2', title: 'Deposit Confirmed', message: 'Your deposit of 500 has been credited to your account.', timestamp: 'On 26 Dec 2025', read: false },
        { id: 'notif-siewlean-3', title: 'Investment Payout', message: 'An investment payout of 12,500 has been credited to your account.', timestamp: 'On 05 Jan 2026', read: false }
    ]
  },
  {
    id: 'user8',
    name: 'CELIA PRUCE',
    username: 'Celiapruce',
    email: 'celita2.celia@gmail.com',
    investorCode: '5672VC863AsGH2',
    joinDate: '2026-01-11',
    country: 'France',
    totalBalance: 0,
    availableBalance: 0,
    status: 'Pending',
    transactions: [],
    notifications: [
        { id: 'notif-celia-1', title: 'Account Created Successfully', message: 'Welcome to InvestBridge! Your account is now ready. Please deposit funds to start investing.', timestamp: 'Just now', read: false }
    ]
  }
];

// ==================================
// GLOBAL DATA (used for public pages or admin views)
// ==================================

export const allTransactions: Transaction[] = users.flatMap(u => u.transactions.map(t => ({...t, details: t.details.includes('by') ? t.details : `${t.details} by ${u.name}` })));
export const allAdminNotifications: Notification[] = users.find(u => u.id === 'admin-user')?.notifications || [];

export const investmentPlans: InvestmentPlan[] = [
  {
    id: "ap-company-bond",
    offerer: "A&P Company",
    type: "Corporate Bond",
    roi: "15% fixed return",
    range: "$1,000+",
    features: ["30-day term", "Principal returned", "Low risk"]
  },
  {
    id: "cryptohouse-eth-staking",
    offerer: "CryptoHouse Brokerage",
    type: "ETH Staking",
    roi: "Up to 8% APY",
    range: "$500 - $10,000",
    features: ["Variable returns", "Compounding interest", "24/7 Support"]
  },
  {
    id: "innovate-tech-portfolio",
    offerer: "Innovate Inc.",
    type: "Tech Stock Portfolio",
    roi: "25% projected annual",
    range: "$5,000+",
    features: ["High growth potential", "Diversified tech stocks", "Long-term hold"]
  }
];

export const cryptoInvestments: MarketInvestment[] = [
    { id: 'BTC', name: 'Bitcoin', Icon: Bitcoin, price: 68123.45, change: 2.3, holdingsValue: 45678.12, holdingsAmount: '0.6705 BTC' },
    { id: 'ETH', name: 'Ethereum', Icon: CircleDollarSign, price: 3543.21, change: -1.2, holdingsValue: 23456.78, holdingsAmount: '6.620 ETH' },
    { id: 'SOL', name: 'Solana', Icon: CircleDollarSign, price: 168.90, change: 5.1, holdingsValue: 5678.90, holdingsAmount: '33.62 SOL' },
];

export const stockInvestments: MarketInvestment[] = [
    { id: 'AAPL', name: 'Apple Inc.', Icon: Smartphone, price: 195.89, change: 1.5, holdingsValue: 15678.40, holdingsAmount: '80 Shares' },
    { id: 'GOOGL', name: 'Alphabet Inc.', Icon: Globe, price: 177.37, change: -0.8, holdingsValue: 12345.60, holdingsAmount: '69 Shares' },
    { id: 'MSFT', name: 'Microsoft Corp.', Icon: Laptop, price: 427.56, change: 0.5, holdingsValue: 18765.30, holdingsAmount: '43 Shares' },
];


// Admin Dashboard Metrics
export const totalUsers = users.filter(u => u.id !== 'admin-user').length;
export const newlyRegisteredUsers = users.filter(u => new Date(u.joinDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
export const totalCapital = users.reduce((sum, user) => sum + user.totalBalance, 0);
export const totalPayout = users.flatMap(u => u.transactions).filter(t => t.type === 'Withdrawal' && t.status === 'Completed').reduce((sum, t) => sum + t.amount, 0);
export const newInvestments = users.flatMap(u => u.transactions).filter(t => t.type === 'Investment' && new Date(t.date) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length;
export const pendingDeposits = allTransactions.filter(t => t.type === 'Deposit' && t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
export const pendingWithdrawals = allTransactions.filter(t => t.type === 'Withdrawal' && t.status === 'Pending').reduce((sum, t) => sum + t.amount, 0);
export const activeInvestments = allTransactions.filter(t => t.type === 'Investment' && t.status === 'Completed').length;
export const newUsers = newlyRegisteredUsers; // alias


// Used for charts, can remain global for now
export const platformGrowthData = [
  { month: 'Jan', totalCapital: 800000, totalPayout: 200000 },
  { month: 'Feb', totalCapital: 850000, totalPayout: 220000 },
  { month: 'Mar', totalCapital: 920000, totalPayout: 250000 },
  { month: 'Apr', totalCapital: 1000000, totalPayout: 280000 },
  { month: 'May', totalCapital: 1100000, totalPayout: 300000 },
  { month: 'Jun', totalCapital: 1250000, totalPayout: 345000 },
];

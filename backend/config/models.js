import { DataTypes } from "sequelize";
import sequelize from "./db.js";

const User = sequelize.define("User", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, },
    username: { type: DataTypes.STRING, allowNull: false, unique: true, },
    email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true, }, },
    investorPass: { type: DataTypes.STRING, allowNull: false, },
    joinDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, },
    country: { type: DataTypes.STRING, allowNull: false, },
    totalBalance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00, },
    availableBalance: { type: DataTypes.DECIMAL(15, 2), defaultValue: 0.00, },
    status: { type: DataTypes.ENUM("Active", "Suspended", "Pending"), defaultValue: "Pending", },
    role: { type: DataTypes.ENUM("user", "admins"), allowNull: false, defaultValue: "user", },
}, {
    tableName: "users",
    timestamps: true,
});

const payOptions = sequelize.define("payOptions", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false, },
    type: { type: DataTypes.ENUM("crypto", "card", "bankTransfer", "payPal"), allowNull: false, defaultValue: "crypto", },
    status: { type: DataTypes.ENUM("Active", "Coming Soon", "Restricted"), defaultValue: "Active", },
    options: { type: DataTypes.JSONB, allowNull: false, defaultValue: [], }
}, {
    tableName: "payoptions",
    timestamps: true,
});


const Transaction = sequelize.define("Transaction", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, },
    userId: {
        type: DataTypes.UUID, allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, },
    type: { type: DataTypes.ENUM("Deposit", "Withdrawal", "Investment", "Profit"), allowNull: false, },
    amount: { type: DataTypes.DECIMAL(15, 2), allowNull: false, },
    status: { type: DataTypes.ENUM("Pending", "Completed", "Running", "Failed"), defaultValue: "Pending", },
    details: { type: DataTypes.JSONB, allowNull: false, defaultValue: {}, },
}, {
    tableName: "transactions",
    timestamps: true,
});

const Notification = sequelize.define("Notification", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, },
    userId: {
        type: DataTypes.UUID, allowNull: false,
        references: {
            model: "users",
            key: "id",
        },
        onDelete: "CASCADE",
    },
    title: { type: DataTypes.STRING, allowNull: false, },
    message: { type: DataTypes.TEXT, allowNull: false, },
    role: { type: DataTypes.ENUM("user", "admins"), allowNull: false, defaultValue: "user", },
    timestamp: { type: DataTypes.DATE, defaultValue: DataTypes.NOW, },
    read: { type: DataTypes.BOOLEAN, defaultValue: false, },
}, {
    tableName: "notifications",
    timestamps: true,
});

// One User → Many Transactions
User.hasMany(Transaction, { foreignKey: "userId", onDelete: "CASCADE", });
Transaction.belongsTo(User, { foreignKey: "userId", });


// One User → Many Notifications
User.hasMany(Notification, { foreignKey: "userId", onDelete: "CASCADE", });
Notification.belongsTo(User, { foreignKey: "userId", });

const investmentPlans = sequelize.define("investmentPlan", {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true, },
    offerer: { type: DataTypes.STRING, allowNull: false, },
    type: { type: DataTypes.STRING, allowNull: false, },
    roi: { type: DataTypes.STRING, allowNull: false, },
    roiText: { type: DataTypes.STRING, allowNull: false, },
    minAmt: { type: DataTypes.DECIMAL(15, 2), allowNull: false, },
    maxAmt: { type: DataTypes.DECIMAL(15, 2), allowNull: false, },
    duration: { type: DataTypes.INTEGER, allowNull: false, },
    riskLevel: { type: DataTypes.ENUM("Low", "Medium", "High"), allowNull: false, defaultValue: "Low", },
    features: { type: DataTypes.JSONB, allowNull: false, },
    expectedReturn: { type: DataTypes.DECIMAL(15, 2), allowNull: true, },
    capitalProtected: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true, },
    lockPeriodDays: { type: DataTypes.INTEGER, allowNull: false, },
    earlyWithdrawalPenaltyPercent: { type: DataTypes.DECIMAL(5, 2), allowNull: true, }, // null if no early withdrawal allowed
    status: { type: DataTypes.ENUM("Active", "Paused"), allowNull: false, defaultValue: "Active", },
}, {
    tableName: "investments",
    timestamps: true,
});

export {
    sequelize, 
    User,
    Transaction,
    Notification,
    payOptions,
    investmentPlans,
};
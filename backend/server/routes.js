import express from 'express';
// import jwt from 'jsonwebtoken';
// import nodemailer from 'nodemailer';
// import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { sequelize, User, Notification, Transaction, payOptions, investmentPlans } from "../config/models.js";
import { authenticate, authorizeAdmin } from "../config/authMiddle.js";
import { initWebSocket, sendNotificationToUser, sendToUser, sendToAdmins } from "../config/ws.js"
import logger from "../config/logger.js";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { Op } from "sequelize";

dotenv.config({ quiet: true });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const uploadPath = path.join(__dirname, "../uploads/deposits");

// Ensure folder exists
if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});


router.get("/health", (req, res) => {
  res.send("wwelcome health is responding!");
  // console.log('server: hello world')
});



router.get("/users/me", authenticate, async (req, res) => {
  try {
    const users = await User.findByPk(req.user.id);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});
router.get("/trans/me", authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});
router.get("/trans/mechart", authenticate, async (req, res) => {
  try {
    const transactions = await Transaction.findAll({
      where: { userId: req.user.id },
      order: [["date", "ASC"]],
    });

    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});
router.get("/admin/transacs/q", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const adminTransactions = await Transaction.findAll({
      order: [["createdAt", "DESC"]],
    })
    res.json(adminTransactions);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch transactions" });
  }
});
router.get("/notify/me", authenticate, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id, role: "user", },
      order: [["createdAt", "DESC"]],
      limit: 10,
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch notifications" });
  }
});
router.get("/admin/notify/me", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { role: "admins", },
      order: [["createdAt", "DESC"]],
    });

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin notifications" });
  }
});

router.patch("/notifications/:id/read", authenticate, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
        role: "user",
      }, transaction: t
    });

    if (!notification) {
      await t.rollback();
      return res.status(404).json({ message: "Not found" });
    }

    notification.read = true;
    await notification.save({ transaction: t });
    await t.commit();

    sendToUser(req.user.id, {
      type: "NOTIFICATION_READ",
      notificationId: notification.id,
    });

    res.json({ message: "Marked as read" });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Failed to update notification" });
  }
});
router.patch("/admin/notifications/:id/read", authenticate, authorizeAdmin, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        role: "admins",
      }, transaction: t
    });

    if (!notification) {
      await t.rollback();
      return res.status(404).json({ message: "Not found" });
    }

    notification.read = true;
    await notification.save({ transaction: t });
    await t.commit();

    sendToUser(req.user.id, {
      type: "NOTIFICATION_READ",
      notificationId: notification.id,
    });

    res.json({ message: "Marked as read" });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Failed to update notification" });
  }
});
router.patch("/notifications/read-all", authenticate, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    await Notification.update(
      { read: true },
      {
        where: {
          userId: req.user.id,
          read: false,
          role: "user",
        }, transaction: t
      }
    );
    await t.commit();

    sendToUser(req.user.id, {
      type: "ALL_NOTIFICATIONS_READ",
    });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Failed to update notifications" });
  }
});
router.patch("/admin/notifications/read-all", authenticate, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    await Notification.update(
      { read: true },
      {
        where: {
          read: false,
          role: "admins",
        }, transaction: t
      }
    );
    await t.commit();

    sendToUser(req.user.id, {
      type: "ALL_NOTIFICATIONS_READ",
    });

    res.json({ message: "All notifications marked as read" });
  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

router.get("/payoptions", authenticate, async (req, res) => {
  try {
    const options = await payOptions.findAll();
    // logger.info(options);
    res.json(options);
  } catch (error) {
    logger.error("Failed to fetch payOptions")
    res.status(500).json({ message: "Failed to fetch payOptions" });
  }
});
router.post("/userSubmit/deposits", authenticate, upload.single("proof"), async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { amount, methodId, methodType, txId, coin, network, country, bankName, } = req.body;

    if (!amount || Number(amount) <= 0) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!txId && !req.file) {
      await t.rollback();
      return res.status(400).json({
        message: "Transaction proof required",
      });
    }

    const fileName = req.file ? req.file.filename : null;

    const details = {
      methodId,
      methodType,
      txId: txId || null,
      coin: coin || null,
      network: network || null,
      country: country || null,
      bankName: bankName || null,
      proof: fileName,
    };
    // console.log(details);

    const newTransaction = await Transaction.create({
      userId,
      type: "Deposit",
      amount,
      status: "Pending",
      details, // JSONB
    }, { transaction: t });

    const debitNotification = await Notification.create({
      userId,
      title: `Deposit Submitted ${amount}`,
      message: `Your deposit amount ${amount} has been submitted successfully, Your account will be credited shortly`,
    }, { transaction: t });
    const adminDebitNotification = await Notification.create({
      userId,
      title: `New Deposit Submitted ${amount}`,
      message: `New deposit amount ${amount} has been submitted successfully, Please aprove!!`,
      role: "admins",
    }, { transaction: t });

    sendNotificationToUser(userId, debitNotification);
    sendToAdmins({
      type: "NEW_NOTIFICATION", notification: adminDebitNotification
    });

    await t.commit();

    res.status(201).json({
      message: "Deposit submitted successfully",
      // transaction,
    });
  } catch (error) {
    await t.rollback();
    logger.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/invplan", authenticate, async (req, res) => {
  try {
    const plans = await investmentPlans.findAll();
    // logger.info(plans);
    res.json(plans);
  } catch (error) {
    logger.error("Failed to fetch payOptions")
    res.status(500).json({ message: "Failed to fetch payOptions" });
  }
});
router.get("/invplan/:id", authenticate, async (req, res) => {
  try {
    const plansid = await investmentPlans.findOne({
      where: {
        id: req.params.id,
      },
    });
    // logger.info(plans);
    res.json(plansid);
  } catch (error) {
    logger.error("Failed to fetch payOptions")
    res.status(500).json({ message: "Failed to fetch payOptions" });
  }
});
router.post("/submitInve", authenticate, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const userId = req.user.id;
    const { amount, details } = req.body;
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid amount" });
    }
    const numericAmount = Number(amount);
    const user = await User.findByPk(userId, { transaction: t });
    user.availableBalance = Number(user.availableBalance) - numericAmount;

    await user.save({ transaction: t });

    // console.log(amount, details);
    const newTransaction = await Transaction.create({
      userId,
      type: "Investment",
      amount: numericAmount,
      status: "Running",
      details,
    }, { transaction: t });

    const investNotification = await Notification.create({
      userId,
      title: `Investment Request ${amount} Approved`,
      message: `Your Investment amount ${amount} has been approved successfully, kindly wait for profit disbursement on EndDate.`,
    }, { transaction: t });
    const adminInvestNotification = await Notification.create({
      userId,
      title: `New Investment received and approved ${amount}`,
      message: `New investment amount ${amount} has been submitted successfully.`,
      role: "admins",
    }, { transaction: t });

    sendNotificationToUser(userId, investNotification);
    sendToAdmins({
      type: "NEW_NOTIFICATION", notification: adminInvestNotification
    });

    await t.commit();
    res.status(201).json({
      message: "Investment applied  successfully",
      // transaction,
    });

  } catch (error) {
    await t.rollback();
    logger.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/submitWithd", authenticate, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const userId = req.user.id;
    const { amount, details } = req.body;
    if (!amount || Number(amount) <= 0) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid amount" });
    }
    const numericAmount = Number(amount);
    const user = await User.findByPk(userId, { transaction: t });
    user.availableBalance = Number(user.availableBalance) - numericAmount;
    await user.save({ transaction: t });

    // console.log(amount, details);
    const newTransaction = await Transaction.create({
      userId,
      type: "Withdrawal",
      amount: numericAmount,
      status: "Pending",
      details,
    }, { transaction: t });

    const withdrawalNotification = await Notification.create({
      userId,
      title: `Withdrawal Request ${amount} Submitted`,
      message: `Your Withdrawal amount ${amount} has been submitted successfully, kindly wait for profit payout within few minutes as it is now being processed.`,
    }, { transaction: t });
    const adminWithdrawalNotification = await Notification.create({
      userId,
      title: `New Withdrawal Submitted ${amount}`,
      message: `New withdrawal amount ${amount} has been submitted successfully, Please aprove for payout!!`,
      role: "admins",
    }, { transaction: t });

    sendNotificationToUser(userId, withdrawalNotification);
    sendToAdmins({
      type: "NEW_NOTIFICATION", notification: adminWithdrawalNotification
    });

    await t.commit();
    res.status(201).json({
      message: "Withdrawal applied  successfully",
      // transaction,
    });

  } catch (error) {
    await t.rollback();
    logger.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/updateUser", authenticate, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { name } = req.body;
    if (!name) {
      await t.rollback();
      return res.status(400).json({ message: "Name is required" });
    }
    const user = await User.findOne({
      where: { id: req.user.id },
      transaction: t,
    });

    if (!user) {
      await t.rollback();
      return res.status(404).json({ message: "User not found" });
    }

    await user.update({ name }, { transaction: t });
    await t.commit();
    res.json({ message: "Profile updated" });

  } catch (error) {
    await t.rollback();
    res.status(500).json({ message: "Failed to update user name" });
  }
});

router.get("/admin/users", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const users = await User.findAll();

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});
router.get("/admin/users/:userId", authenticate, authorizeAdmin, async (req, res) => {
  const { userId } = req.params;
  try {
    const id = userId;
    const user = await User.findByPk(userId, {
      include: [{ model: Transaction, },],
      order: [[Transaction, "date", "DESC"]], // order transactions by date
    });
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch user data" });
  }
});
router.get("/admin/stats/summary", authenticate, authorizeAdmin, async (req, res) => {
  try {

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const [
      totalUsers,
      newUsers,
      newInvestments,
      totalCapital,
      totalPayout
    ] = await Promise.all([

      // total users
      User.count(),

      // New users in last 7 days
      User.count({
        where: {
          createdAt: {
            [Op.gte]: oneWeekAgo,
          },
        },
      }),

      // New investments in last 7 days
      Transaction.count({
        where: {
          type: "Investment",
          createdAt: {
            [Op.gte]: oneWeekAgo,
          },
        },
      }),

      // Total capital invested
      Transaction.sum("amount", {
        where: {
          type: "Deposit",
          status: "Completed"
        },
      }),

      // Total payouts
      Transaction.sum("amount", {
        where: {
          type: "Withdrawal",
          status: "Completed"
        },
      })

    ]);

    res.json({
      totalUsers,
      newUsers,
      newInvestments,
      totalCapital: totalCapital || 0,
      totalPayout: totalPayout || 0
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

router.post("/trans/:id/:userId/:action", authenticate, authorizeAdmin, async (req, res) => {
  const t = await sequelize.transaction();

  try {
    const { id, userId, action } = req.params;

    // Validate action
    if (!["confirm", "reject"].includes(action)) {
      await t.rollback();
      return res.status(400).json({ message: "Invalid action" });
    }
    const user = await User.findOne({ where: { id: userId }, transaction: t });
    const transaction = await Transaction.findOne({ where: { id }, transaction: t });
    if (!user || !transaction) {
      await t.rollback();
      return res.status(404).json({ message: "Transaction or user not found" });
    }

    const currentTotal = Number(user.totalBalance) || 0;
    const currentAvailable = Number(user.availableBalance) || 0;
    const amountNum = Number(transaction.amount) || 0;

    if (action === "reject") {
      // Mark as failed
      transaction.status = "Failed";
      transaction.updatedAt = new Date();
      await transaction.save({ transaction: t });

      if (transaction.type === "Withdrawal") {
        user.availableBalance = currentAvailable + amountNum;
      }

      await user.save({ transaction: t });

      const confirmTransaction = await Notification.create({
        userId,
        title: `${transaction.type} Request has been rejected`,
        message: `Your ${transaction.type} has been rejected, please check your balance.`,
      }, { transaction: t });
      const adminconfirmTransaction = await Notification.create({
        userId,
        title: `${transaction.type} Request has been rejected`,
        message: `You rejected this ${transaction.type},`,
        role: "admins",
      }, { transaction: t });

      console.log(confirmTransaction, adminconfirmTransaction);

      sendNotificationToUser(userId, confirmTransaction);
      sendToAdmins({
        type: "NEW_NOTIFICATION", notification: adminconfirmTransaction
      });


    } else if (action === "confirm") {
      // Update balances


      const endsAt = transaction.details?.endsAt ? new Date(transaction.details.endsAt) : null;
      if (transaction.type === "Investment" && endsAt && endsAt > new Date()) {
        await t.rollback();
        return res.status(400).json({ message: "Investment still running, cannot confirm" });
      }

      // Mark as completed
      transaction.status = "Completed";
      transaction.updatedAt = new Date();
      await transaction.save({ transaction: t });
      
      // Deposit or Investment adds to balance
      if (transaction.type === "Deposit" || transaction.type === "Investment") {
        user.totalBalance = currentTotal + amountNum;
        user.availableBalance = currentAvailable + amountNum;
      }

      // Withdrawal subtracts from total balance
      if (transaction.type === "Withdrawal") {
        user.totalBalance = currentTotal - amountNum;
      }

      await user.save({ transaction: t });

      const confirmTransaction = await Notification.create({
        userId,
        title: `${transaction.type} Request has been confirmed`,
        message: `Your ${transaction.type} has been confirmed, please check your balance.`,
      }, { transaction: t });
      const adminconfirmTransaction = await Notification.create({
        userId,
        title: `${transaction.type} Request has been confirmed`,
        message: `You confirmed this ${transaction.type},`,
        role: "admins",
      }, { transaction: t });

      sendNotificationToUser(userId, confirmTransaction);
      sendToAdmins({
        type: "NEW_NOTIFICATION", notification: adminconfirmTransaction
      });
    }

    await t.commit();

    return res.json({
      message: `Transaction ${action === "confirm" ? "confirmed" : "rejected"}`,
      transaction,
      userBalances: {
        totalBalance: user.totalBalance,
        availableBalance: user.availableBalance,
      },
    });
  } catch (error) {
    await t.rollback();
    console.error(error);
    return res.status(500).json({ message: "Server error", error });
  }
});
router.get("/gateways/crypto", authenticate, authorizeAdmin, async (req, res) => {
  try {
    const options = await payOptions.findAll({ where: { type: "crypto" }, });
    // logger.info(options);
    res.json(options);
  } catch (error) {
    logger.error("Failed to fetch payOptions")
    res.status(500).json({ message: "Failed to fetch payOptions" });
  }
});
router.patch("/gateways/crypto", authenticate, authorizeAdmin, async (req, res) => {
  const { id, address } = req.body;
  const t = await sequelize.transaction();


  if (!id || !address) {
    await t.rollback();
    return res.status(400).json({ message: "Missing id or address" });
  }

  try {
    const cryptoRow = await payOptions.findOne({ where: { type: "crypto" }, transaction: t });

    if (!cryptoRow) {
      await t.rollback();
      return res.status(404).json({ message: "Crypto row not found" });
    }
    let options = cryptoRow.options;

    let updated = false;
    options = options.map((coin) => {
      return {
        ...coin,
        networks: coin.networks.map((network) => {
          const networkId = `${coin.symbol}-${network.name}`.toLowerCase().trim();

          if (networkId === id.toLowerCase().trim()) {
            updated = true;
            return { ...network, address };
          }

          return network;
        })
      };
    });


    if (!updated) {
      await t.rollback();
      return res.status(404).json({ message: "Wallet id not found" });
    }

    // Save back to DB
    await cryptoRow.update({ options }, { transaction: t });

    await t.commit(); // commit transaction
    console.log(`Wallet updated successfully: ${id} -> ${address}`);
    return res.json({ message: "Wallet updated successfully", options });
  } catch (err) {
    await t.rollback();
    console.error("Error updating wallet:", err);
    return res.status(500).json({ message: "Failed to update wallet" });
  }

});
router.put("/gateways/crypto", authenticate, authorizeAdmin, async (req, res) => {
  const { coin, network, address } = req.body;
  const t = await sequelize.transaction();

  try {
    if (!coin || !network || !address) {
      await t.rollback();
      return res.status(400).json({
        message: "Missing coin, network, or address"
      });
    }

    const cryptoRow = await payOptions.findOne({
      where: { type: "crypto" },
      transaction: t
    });

    if (!cryptoRow) {
      await t.rollback();
      return res.status(404).json({
        message: "Crypto row not found"
      });
    }

    // 🔹 Clone JSONB safely
    let options = JSON.parse(JSON.stringify(cryptoRow.options || []));
    let updated = false;
    const coinSymbol = coin.trim().toUpperCase();
    const networkName = network.trim().toUpperCase();
    const addressTrimmed = address.trim();

    // 🔹 Find coin
    const coinIndex = options.findIndex(
      c => c.symbol.toUpperCase() === coinSymbol
    );

    if (coinIndex === -1) {
      options.push({
        name: coin,
        symbol: coinSymbol,
        networks: [
          { name: networkName, address: addressTrimmed }
        ]
      });

      updated = true;

    } else {
      const coinObj = options[coinIndex];
      const netIndex = coinObj.networks.findIndex(
        n => n.name.toUpperCase() === networkName
      );

      if (netIndex === -1) {
        coinObj.networks = [
          ...coinObj.networks,
          { name: networkName, address: addressTrimmed }
        ];

        options[coinIndex] = { ...coinObj };
        updated = true;

      } else {

      }
    }

    //save if something changed
    if (updated) {
      cryptoRow.set("options", options);
      await cryptoRow.save({ transaction: t });
      await t.commit();
      return res.json({ message: "Wallet updated successfully", options });
    } else {
      await t.rollback();
      return res.json({ message: "Coin and network already exist, no changes made", options });
    }

  } catch (err) {
    await t.rollback();
    // console.error("Error updating wallet:", err);
    return res.status(500).json({ message: "Failed to update wallet" });
  }
});
router.delete("/gateways/crypto", authenticate, authorizeAdmin, async (req, res) => {
  const { id, address } = req.body;
  console.log(id, address);
});
router.post("/gateways/invest", authenticate, authorizeAdmin, async (req, res) => {
  const t = await sequelize.transaction();
  const { offerer, type, roi, minAmt, maxAmt, duration, riskLevel, features, status } = req.body;
  if (!offerer || !type || !roi || !minAmt || !maxAmt) {
    await t.rollback();
    return res.status(400).json({ message: "Missing required fields" });
  }
  const offererNorm = offerer.trim().toLowerCase();
  const typeNorm = type.trim().toLowerCase();
  try {
    const planExist = await investmentPlans.findOne({ where: { offerer: offererNorm, type: typeNorm }, transaction: t });

    if (planExist) {
      await t.rollback();
      return res.status(400).json({ message: "Plan Exist" });
    }
    const roiText = roi.toString().replace('%', '');
    const newPlan = await investmentPlans.create({
      offerer: offererNorm,
      type: typeNorm,
      roi: `${roiText}%`,
      roiText: `${roiText}% fixed return`,
      minAmt: Number(minAmt),
      maxAmt: Number(maxAmt),
      duration: Number(duration),
      riskLevel,
      features,
      status,
      lockPeriodDays: Number(duration)
    }, { transaction: t });

    await t.commit();

    return res.status(201).json(newPlan);

  } catch (error) {
    await t.rollback();
    console.error("Creation error:", error);
    return res.status(500).json({ message: "Failed to create investment plan" });
  }
});
router.put("/gateways/invest/:id", authenticate, authorizeAdmin, async (req, res) => {
  const { id } = req.params;
  const t = await sequelize.transaction();

  try {
    const plan = await investmentPlans.findByPk(id, { transaction: t });

    if (!plan) {
      await t.rollback();
      return res.status(404).json({ message: "Investment plan not found" });
    }

    const { offerer, type, roi, minAmt, maxAmt, duration, riskLevel, features, status } = req.body;

    if (!offerer || !type || !roi || !minAmt || !maxAmt) {
      await t.rollback();
      return res.status(400).json({ message: "Missing required fields" });
    }

    await plan.update({
      offerer,
      type,
      roi,
      roiText: `${roi.replace('%', '')}% fixed return`,
      minAmt: Number(minAmt),
      maxAmt: Number(maxAmt),
      duration: Number(duration),
      riskLevel,
      features,
      status
    }, { transaction: t });

    await t.commit();
    return res.json(plan);


  } catch (error) {
    await t.rollback();
    // console.error("Update error:", error);
    return res.status(500).json({ message: "Failed to update investment plan" });
  }
});

router.post("/admin/users/:userId/actions", authenticate, authorizeAdmin, async (req, res) => {
  const { userId } = req.params;
  const { action, payload } = req.body;
  try {

    let result;

    switch (action) {
      case "updateProfile":
        result = await User.update(
          {
            name: payload.name,
            username: payload.username,
            email: payload.email,
          },
          { where: { id: userId } }
        );
        break;

      case "updateBalance":
        result = await User.update(
          { totalBalance: payload.balance },
          { where: { id: userId } }
        );
        break;

      case "updateStatus":
        result = await User.update(
          { status: payload.status },
          { where: { id: userId } }
        );
        break;

      case "addTransaction":
        result = await Transaction.create({
          userId,
          ...payload,
        });
        break;

      case "updateTransaction":
        result = await Transaction.update(payload, {
          where: { id: payload.id },
        });
        break;

      case "deleteUser":
        await Transaction.destroy({ where: { userId } });
        await Notification.destroy({ where: { userId } });
        result = await User.destroy({ where: { id: userId } });
        break;

      default:
        return res.status(400).json({ message: "Invalid action" });
    }

    res.json({ success: true, result });
  } catch (error) {
    //  console.error(error);
    res.status(500).json({ message: "Action failed" });
  }
})

export default router;
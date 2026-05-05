
import dotenv from "dotenv";
// config env variables
dotenv.config({ quiet: true });
import express from "express";
import cookieParser from "cookie-parser";
import jwt from "jsonwebtoken";
import { initWebSocket, sendNotificationToUser } from "./config/ws.js"
// import { dirname } from "path";
// import { fileURLToPath } from "url";
import routes from "./server/routes.js";
import { createServer } from 'http';
import cors from "cors";
import { sequelize, User, Notification } from "./config/models.js";
import bcrypt from "bcryptjs";
import logger from "./config/logger.js";


// const __dirname = dirname(fileURLToPath(import.meta.url));

// Initialize Express 
const app = express();
const server = createServer(app);
initWebSocket(server);

const allowedOrigin = process.env.API_BASE;

// For HTTP CORS
app.use(cors({
    origin: "http://localhost:3000",
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use('/api', routes);



app.get("/", (req, res) => {
    res.send("Hello World!");
    // logger.info('server: hello world')
});


app.post("/regis", async (req, res) => {
    const { name, username, email, country, password } = req.body;
    const t = await sequelize.transaction();
    try {
        if (!name || !username || !email || !country || !password) {
            await t.rollback();
            logger.warn("Sign up attempt failed with missing fields");
            return res.status(400).json({ message: "Missing fields" });
        }

        const userEmail = await User.findOne({ where: { email }, transaction: t });
        if (userEmail) {
            await t.rollback();
            logger.warn("Sign up attempt with existing email");
            return res.status(409).json({ message: "Email exist" });
        }
        const userName = await User.findOne({ where: { username }, transaction: t });
        if (userName) {
            await t.rollback();
            logger.warn("Sign up attempt with existing username");
            return res.status(409).json({ message: "username exist" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        // insert into db 
        const newUser = await User.create(
            {
                name,
                username,
                email,
                country,
                investorPass: hashedPassword,
            },
            { transaction: t }
        );
        await Notification.create(
            {
                userId: newUser.id,
                title: "Welcome to InvestBridge!",
                message: `Thank you for joining InvestBridge. Start by exploring our investment opportunities or depositing funds.`,
            },
            { transaction: t }
        );
        await Notification.create(
            {
                userId: newUser.id,
                title: "New User Registration!",
                message: `A new user, ${name} (${email}), has registered on the platform and is awaiting account verification.`,
                role: "admins",
            },
            { transaction: t }
        );
        await t.commit();
        // logger.info(` ${password}, ${email}`);
        // logger.info("success");
        return res.status(201).json({
            message: "User created"
        });

    } catch (error) {
        await t.rollback();
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
});

app.post("/login", async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { email, password } = req.body;
        let role;
        if (!email || !password) {
            logger.warn("Login attempt with missing email or password");
            return res.status(400).json({ message: "Email and password missing" });
        }

        const user = await User.findOne({ where: { email } });

        if (!user) {
            logger.warn("Login attempt with wrong email");
            return res.status(401).json({ message: "Email doesn't exist" });
        }

        const isMatch = await bcrypt.compare(password, user.investorPass);
        if (!isMatch) {
            logger.warn("Login attempt with wrong password");
            return res.status(401).json({ message: "Invalid Eassword" });
        }

        const accessToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.ACCESS_SECRET,
            { expiresIn: "1h" }
        );

        const refreshToken = jwt.sign(
            { id: user.id, role: user.role },
            process.env.REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        // Send refresh token as httpOnly cookie
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // Create login notification
        const loginNotification = await Notification.create({
            userId: user.id,
            title: "Login Activity Detected",
            message: "Your account was just logged into.",
            role: user.role,
        }, { transaction: t });

        // Try pushing live (if already connected)
        sendNotificationToUser(user.id, loginNotification);
        await t.commit();
        return res.json({
            message: "Login successful",
            accessToken,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error.message });
    }
});
app.post("/api/auth/refresh", async (req, res) => {
    const token = req.cookies.refreshToken;
    if (!token) {
        return res.status(401).json({ message: "No refresh token" });
    }

    try {
        const decoded = jwt.verify(token, process.env.REFRESH_SECRET);

        const newAccessToken = jwt.sign(
            { id: decoded.id, role: decoded.role },
            process.env.ACCESS_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ accessToken: newAccessToken });
    } catch (err) {
        return res.status(403).json({ message: "Invalid refresh token" });
    }
});

app.post("/api/logout", (req, res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/",
    });

    return res.json({ message: "Logged out successfully" });
});

const PORT = process.env.PORT || 4000;

// start server
async function startServer() {
    try {
        await sequelize.authenticate();
        logger.info("Database connected successfully");

        if (process.env.NODE_ENV === "development") {
            await sequelize.sync({ alter: true });
            logger.info("Database synced (DEV mode)");
        }

        server.listen(process.env.PORT, () => {
            logger.info(`Server running on port ${process.env.PORT}`);
        });

    } catch (error) {
        logger.error("Database connection failed:", error);
    }
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
    logger.warn('Shutting down gracefully...');
    server.close();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    logger.warn('Shutting down gracefully...');
    server.close();
    process.exit(0);
});
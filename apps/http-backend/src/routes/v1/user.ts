import { Router } from "express";
import jwt from "jsonwebtoken";
import { db, users, rooms } from "@repo/db";
import { UserSchema } from "@repo/common";
import { JWT_SECRET } from "../../config";
import { eq } from "drizzle-orm";
import { authMiddleware } from "../../middleware/auth";

export const userRouter = Router();

userRouter.post("/signup", async (req, res) => {
    // console.log("Signup Request Body:", req.body);
    try {
        const parsed = UserSchema.parse(req.body);

        // Check email or username collision
        const existingUser = await db.select().from(users).where(eq(users.email, parsed.username));
        // ideally detailed check but MVP:
        if (existingUser.length > 0) {
            return res.status(409).json({ message: "User already exists" });
        }

        await db.insert(users).values({
            email: parsed.username, // Using input as both email/username for now to simplify
            username: parsed.username,
            passwordHash: parsed.password,
            balance: 50000, // New default
        });
        res.json({ message: "Signed up" });
    } catch (e: any) {
        console.error("Signup error:", e);
        res.status(400).json({ message: e.issues ? e.issues[0].message : "Error creating user" });
    }
});

userRouter.post("/signin", async (req, res) => {
    const parsed = UserSchema.parse(req.body);
    const user = await db.select().from(users).where(eq(users.email, parsed.username));

    if (!user[0] || user[0].passwordHash !== parsed.password) {
        return res.status(403).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user[0].id }, JWT_SECRET);
    res.json({ token });
});

userRouter.get("/rooms", async (req, res) => {
    const activeRooms = await db.select().from(rooms); // List all for now
    res.json({ rooms: activeRooms });
});

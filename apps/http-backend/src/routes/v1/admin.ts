import { Router } from "express";
import { db, rooms, users } from "@repo/db";
import { CreateTableSchema } from "@repo/common";
import { eq } from "drizzle-orm";

export const adminRouter = Router();

adminRouter.post("/room", async (req, res) => {
    const parsed = CreateTableSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: "Invalid input" });
    }

    // Temporary: Assign random admin user if auth not present, or use a known one
    // Ideally we should get this from middleware
    const randomUser = await db.select().from(users).limit(1);
    const creatorId = randomUser[0]?.id;

    if (!creatorId) return res.status(500).json({ message: "No admin user found to link" });

    const roomId = await db.insert(rooms).values({
        name: parsed.data.name,
        smallBlind: parsed.data.smallBlind,
        bigBlind: parsed.data.smallBlind * 2,
        minBuyIn: parsed.data.minBuyIn || parsed.data.smallBlind * 100,
        maxBuyIn: parsed.data.smallBlind * 200, // Default cap
        maxPlayers: parsed.data.maxPlayers || 9,
        createdBy: creatorId
    }).returning({ id: rooms.id });

    res.json({
        message: "Room created",
        roomId: roomId[0].id
    });
    // ... existing POST /room code ...
});

adminRouter.delete("/room/:roomId", async (req, res) => {
    try {
        const roomId = req.params.roomId;
        await db.delete(rooms).where(eq(rooms.id, roomId));
        res.json({ message: "Room deleted" });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Error deleting room" });
    }
});

adminRouter.get("/users", async (req, res) => {
    try {
        const userList = await db.select().from(users);
        res.json({ users: userList });
    } catch (e) {
        res.status(500).json({ message: "Error fetching users" });
    }
});

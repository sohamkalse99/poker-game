import { z } from "zod";

export const UserSchema = z.object({
    username: z.string().min(3),
    password: z.string().min(6),
});

export const CreateTableSchema = z.object({
    name: z.string(),
    smallBlind: z.number(),
    minBuyIn: z.number().optional(),
    maxPlayers: z.number().max(9).optional(),
});

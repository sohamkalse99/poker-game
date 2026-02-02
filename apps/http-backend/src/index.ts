import express from "express";
import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());

app.get("/ping", (req, res) => {
    res.json({ message: "pong" });
});

import { router } from "./routes/v1";
app.use("/api/v1", router);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`HTTP Backend running on port ${PORT}`);
});

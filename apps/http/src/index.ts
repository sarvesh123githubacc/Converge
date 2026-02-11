import express from "express"
import { router } from "./routes/v1/index.js";
import cors from "cors"

const app = express();

app.use(cors({  
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use("/api/v1", router)
app.use("/api/v1/assets", express.static("assets"))
app.use("/uploads", express.static("uploads"));

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📍 Test your signup at: http://localhost:${PORT}/api/v1/signup`);
})
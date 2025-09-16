import { Router } from "express";
import { userRouter } from "./user.js";
import { spaceRouter } from "./space.js";
import { adminRouter } from "./admin.js";
import { SigninSchema, SignupSchema } from "../../types/index.js"
import bcrypt from "bcrypt"
import client from "@repo/db/client"
import jwt  from "jsonwebtoken";
import { JWT_PASSWORD } from "../../config.js";

export const router = Router();

router.post("/signup", async(req, res) => {
    const parsedData = SignupSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation failed"
        })
        return;
    }

    const hashedPassword = await bcrypt.hash(parsedData.data.password, 10)

    try {
        const user = await client.user.create({
            data: {
                username: parsedData.data.username, 
                password: hashedPassword,
                role : parsedData.data.type == 'admin' ? "Admin" : "User"
            }
        })
    
        res.json({
            userId: user.id
        })
    } catch (error) {
        res.status(400).json({message: "User already exists"})
    }
})

router.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(403).json({
            message: "Validation failed"
        })
        return;
    }

    const user = await client.user.findUnique({
        where: {
            username : parsedData.data.username
        }
    })
    if (!user) {
        res.status(403).json({
            message: "User not found"
        })
        return;
    }

    const isValid = await bcrypt.compare(parsedData.data.password, user.password)

    if (!isValid) {
        res.status(403).json({
            message: "Invalid password"
        })
        return;
    }
    const token = jwt.sign({
        userId: user.id,
        role: user.role
    }, JWT_PASSWORD)
    res.json({
        token
    })
})

router.get("/elements", async(req, res) => {
    const elements = await client.element.findMany()

    res.json({
        elements: elements.map(x=>({
            id: x.id,
            imageUrl: x.imageUrl,
            width: x.width,
            height: x.height,
            static: x.static
        }))
    })
})

router.get("/avatars", async(req, res) => {
    const avatars = await client.avatar.findMany();
    res.json({
        avatars: avatars.map(x =>({
            id: x.id,
            imageUrl: x.imageUrl,
            name: x.name
        }))
    })
})

router.use("/user", userRouter)
router.use("/space", spaceRouter)
router.use("/admin", adminRouter)
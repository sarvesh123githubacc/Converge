import { Router } from "express";
import { UpdateMetadataSchema } from "../../types/index.js";
import client from "@repo/db/client"
import { userMiddleware } from "../../middlewares/user.js";

export const userRouter = Router()

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const parsedData = UpdateMetadataSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation Failed"
        })
        return;
    }

    if (!req.userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const avatar = await client.avatar.findUnique({
        where: {
            id: parsedData.data.avatarId
        }
    });

    if (!avatar) {
        return res.status(400).json({
            message: "Invalid avatar ID"
        });
    }
    await client.user.update({
        where: {
            id: req.userId
        },
        data: {
            avatarId: parsedData.data.avatarId
        }
    })
    res.json({
        message: "Metadata updated"
    })
})

userRouter.get("/metadata/bulk", async (req, res) => {
    console.log("helloooooooooooooooooooooooooooooooooo")
    const userIdString = (req.query.ids ?? "[]") as String;
    const userIds = (userIdString).slice(1, userIdString?.length-2).split(",");
    console.log(userIds)
    
    const metaData = await client.user.findMany({
        where: {
            id: {
                in: userIds
            }
        }, 
        select: {
            avatar: true,
            id: true
        }
    })

    res.json({
        avatars: metaData.map(m =>({
            userId: m.id,
            avatar: m.avatar?.imageUrl
        }))
    })
})
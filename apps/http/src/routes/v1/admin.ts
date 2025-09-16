import { Router } from "express";
import { adminMiddleware } from "../../middlewares/admin.js";
import { CreateAvatarSchema, CreateElement, CreateMapSchema, UpdateElement } from "../../types/index.js";
import client from "@repo/db/client"

export const adminRouter = Router();

adminRouter.post("/element",adminMiddleware, async(req, res)=>{
    const parsedData = CreateElement.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed"
        })
    }
    const element = await client.element.create({
        data: {
            width: parsedData.data.width,
            height: parsedData.data.height,
            imageUrl: parsedData.data.imageUrl,
            static: parsedData.data.static
        }
    })

    res.json({
        id: element.id
    })
})

adminRouter.put("/element/:elementId",adminMiddleware, async(req, res)=>{
    const parsedData = UpdateElement.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed"
        })
    }

    const updatedElement = await client.element.update({
        where: {
            id: req.params.elementId!
        },
        data: {
            imageUrl: parsedData.data.imageUrl
        }
    })
    res.json({
            message: "Element updated successfully",
            element: updatedElement
        });
})

adminRouter.post("/avatar",adminMiddleware, async(req, res)=>{
    const parsedData = CreateAvatarSchema.safeParse(req.body);
    if (!parsedData.success) {
   
        return res.status(400).json({
            message: "Validation failed"
        })
    }

    const avatar = await client.avatar.create({
        data: {
            name: parsedData.data.name,
            imageUrl: parsedData.data.imageUrl
        }
    })

    res.json({
        id: avatar.id
    })
})

adminRouter.post("/map", adminMiddleware, async(req, res)=>{
    const parsedData = CreateMapSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation failed"
        })
    }

    const map = await client.map.create({
        data: {
            name: parsedData.data.name,
            width: Number(parsedData.data.dimensions.split("x")[0]),
            height:Number(parsedData.data.dimensions.split("x")[1]),
            thumbnail: parsedData.data.thumbnail,
            mapElements: {
                create: parsedData.data.defaultElements.map(e=>({
                    elementId: e.elementId,
                    x: e.x,
                    y: e.y
                }))
            }
        }
    })
    
    res.json({
        id: map.id
    })
})
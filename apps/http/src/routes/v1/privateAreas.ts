import { Router } from "express";
import { CreatePrivateAreaSchema } from "../../types/index.js";
import client from "@repo/db/client"
import { userMiddleware } from "../../middlewares/user.js";
import { upload } from "../../middlewares/multer.js";
import { processPrivateAreaImage } from "../../services/sharp.js";

export const privateAreasRouter = Router();

// privateAreasRouter.post("/:spaceId",userMiddleware, async (req, res)=>{
//     const parsedData = CreatePrivateAreaSchema.safeParse(req.body);
//     if (!parsedData.success) {
//         res.status(400).json({
//             message: "Validation Failed"
//         })
//         return;
//     }
//     const spaceId = req.params.spaceId;
//     if (!spaceId) {
//         res.status(400).json({
//             message: "spaceId not found from params"
//         })
//         return;
//     }
//     //we have to also check wheather the entered coordinates are right or not(in the bounds of the space)
//     // const space = await client.space.findFirst({
//     //     where: {
//     //         id: spaceId
//     //     }
//     // })
//     // if(!space){
//     //     return res.status(403).json({
//     //         message: "Space not found"
//     //     })
//     // }
//     // space.
//     await client.privateAreas.create({
//         data: {
//             name: parsedData.data.name,
//             x: parsedData.data.x,
//             y: parsedData.data.y,
//             width: parsedData.data.width,
//             height: parsedData.data.height,
//             spaceId: spaceId,
//             creatorId: req.userId!
//         }
//     })
//     res.json({
//         success: true,
//         message: "Private Area Added!"
//     })
// })
privateAreasRouter.post("/:spaceId", userMiddleware, upload.single("image"), async (req, res) => {
    const x = Number(req.body.x);
    const y = Number(req.body.y);
    const width = Number(req.body.width);
    const height = Number(req.body.height);
    const obj = {
        name: req.body.name,
        x,
        y,
        width,
        height
    }
    const parsedData = CreatePrivateAreaSchema.safeParse(obj);
    const image = req.file
    console.log("image", image)
    if (!image) {
        return res.status(400).json({ success: false, message: "Image required" });
    }
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation Failed"
        })
        return;
    }
    const areaId = crypto.randomUUID();
    console.log("heyy")
    const imageUrl = await processPrivateAreaImage(
        image.buffer,
        areaId
    );
    console.log("imageUrl", imageUrl)
    const spaceId = req.params.spaceId;
    if (!spaceId) {
        res.status(400).json({
            message: "spaceId not found from params"
        })
        return;
    }
    //we have to also check wheather the entered coordinates are right or not(in the bounds of the space)
    // const space = await client.space.findFirst({
    //     where: {
    //         id: spaceId
    //     }
    // })
    // if(!space){
    //     return res.status(403).json({
    //         message: "Space not found"
    //     })
    // }
    // space.
    const createdPrivateArea = await client.privateAreas.create({
        data: {
            name: parsedData.data.name,
            x: parsedData.data.x,
            y: parsedData.data.y,
            width: parsedData.data.width,
            height: parsedData.data.height,
            imageUrl: imageUrl,
            spaceId: spaceId,
            creatorId: req.userId!
        }
    })
    res.json({
        success: true,
        message: "Private Area Added!",
        data: createdPrivateArea
    })
})

privateAreasRouter.get("/:spaceId", userMiddleware, async (req, res) => {
    const spaceId = req.params.spaceId
    if (!spaceId) {
        return res.status(400).json({
            success: false,
            message: "spaceId not found in params"
        })
    }
    const privateAreas = await client.privateAreas.findMany({
        where: {
            spaceId: spaceId
        }
    })
    return res.json({
        success: true,
        privateAreas: privateAreas
    })
})

privateAreasRouter.delete("/:privateAreaId", userMiddleware, async (req, res) => {
    const privateAreaId = req.params.privateAreaId;
    if (!privateAreaId) {
        return res.status(400).json({
            message: "PrivateAreaId not found in params"
        })
    }
    await client.privateAreas.delete({
        where: {
            id: privateAreaId
        }
    })
    return res.json({
        success: true,
        message: `PrivateArea ${privateAreaId} deleted`
    })
})
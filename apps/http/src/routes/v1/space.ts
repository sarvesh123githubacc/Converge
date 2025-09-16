import { Router } from "express";
import { AddElementSchema, CreateSpaceSchema, DeleteElementSchema } from "../../types/index.js";
import client from "@repo/db/client"
import { userMiddleware } from "../../middlewares/user.js";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
    const parsedData = CreateSpaceSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.status(400).json({
            message: "Validation Failed"
        })
        return
    }

    if (!parsedData.data?.mapId) {

        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: Number(parsedData.data.dimensions.split("x")[0]),
                height: parsedData.data.dimensions.split("x")[1] ? Number(parsedData.data.dimensions.split("x")[1]) : null,
                creatorId: req.userId!
            }
        })

        return res.json({
            spaceId: space.id
        })
    }

    const map = await client.map.findFirst({
        where: {
            id: parsedData.data.mapId
        },
        select: {
            width: true,
            height: true,
            mapElements: true
        }
    })

    if (!map) {
        res.status(404).json({
            message: "Map not found"
        })
        return;
    }

    let space = await client.$transaction(async () => {
        const space = await client.space.create({
            data: {
                name: parsedData.data.name,
                width: map.width,
                height: map.height,
                creatorId: req.userId!
            }
        });

        await client.spaceElement.createMany({
            data: map.mapElements.map(e => ({
                spaceId: space.id,
                elementId: e.elementId,
                x: e.x,
                y: e.y
            }))
        })

        return space;
    })

    res.json({
        spaceId: space.id
    })
})


spaceRouter.get("/all", userMiddleware, async (req, res) => {
    const spaces = await client.space.findMany({
        where: {
            creatorId: req.userId!
        }
    });

    res.json({
        spaces: spaces.map(s => ({
            id: s.id,
            name: s.name,
            thumbnail: s.thumbnail,
            dimensions: `${s.width}x${s.height}`
        }))
    })
})

spaceRouter.post("/element", userMiddleware, async (req, res) => {
    const parsedData = AddElementSchema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation Failed"
        })
    }


    const space = await client.space.findUnique({
        where: {
            id: parsedData.data.space,
            creatorId: req.userId!
        },
        select: {
            width: true,
            height: true
        }
    })

    if (!space) {
        return res.status(400).json({
            message: "Space not found"
        })
    }

    if (parsedData.data.x < 0 || parsedData.data.y<0 ||parsedData.data.x > space.width || parsedData.data.y > space.height!) {
        return res.status(400).json({
            message: "Out of dimensions"
        })
    }

    await client.spaceElement.create({
        data: {
            spaceId: parsedData.data.space,
            elementId: parsedData.data.elementId,
            x: parsedData.data.x,
            y: parsedData.data.y
        }
    })

    res.status(200).json({
        message: "Element Added"
    })
})

spaceRouter.delete("/element", userMiddleware, async (req, res) => {
    const parsedData = DeleteElementSchema.safeParse(req.body)
    if (!parsedData.success) {
        return res.status(400).json({
            message: "Validation Failed"
        })
    }
    const spaceElement = await client.spaceElement.findFirst({
        where: {
            id: parsedData.data.id
        },
        include: {
            space: true
        }
    })

    if (!spaceElement?.space?.creatorId || spaceElement.space.creatorId !== req.userId) {
        return res.status(400).json({
            message: "Unauthorized"
        })
    }

    await client.spaceElement.delete({
        where: {
            id: parsedData.data.id
        }
    })
    res.json({
        message: "Element deleted"
    })

})

spaceRouter.get("/:spaceId", async (req, res) => {
    const space = await client.space.findUnique({
        where: {
            id: req.params.spaceId
        },
        include: {
            elements: {
                include: {
                    element: true
                }
            }
        }
    })

    if (!space) {
        return res.status(400).json({
            message: "Space not found"
        })
    }

    res.json({
        dimensions: `${space.width}x${space.height}`,
        elements: space.elements.map(e => ({
            id: e.id,
            element: {
                id: e.element.id,
                imageUrl: e.element.imageUrl,
                width: e.element.width,
                height: e.element.height,
                static: e.element.static
            },
            x: e.x,
            y: e.y
        }))
    })
})

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
    if (!req.params.spaceId) {
        return res.json({
            message: "Haven't recieved a spaceId"
        })
    }
    

    const space = await client.space.findUnique({
        where: {
            id: req.params.spaceId
        },
        select: {
            creatorId: true
        }
    })

    if (!space) {
        return res.status(400).json({
            message: "Space not found"
        })
    }

    if (space.creatorId !== req.userId) {
        res.status(403).json({
            message: "Unauthorized"
        })
        return;
    }
    // await client.space.delete({
    //     where: {
    //         id: req.params.spaceId
    //     }
    // })
    await client.$transaction([
    client.spaceElement.deleteMany({
        where: { spaceId: req.params.spaceId }
    }),
    client.space.delete({
        where: { id: req.params.spaceId }
    })
]);
    res.json({
        message: "Space deleted"
    })
})
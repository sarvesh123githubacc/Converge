export type Element = {
    id: string,
    imageUrl: string,
    width: number,
    height: number,
    static: boolean
}

export type Space = {
    name: string,
    dimensions: string,
    creatorId: string,
    creatorUsername: string,
    elements: [
        {
            id: string | number,
            element: {
                id: string,
                imageUrl: string,
                width: number,
                height: number,
                static: boolean
            },
            x: number,
            y: number
        }
    ]
}

export type PrivateSpace = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;
    imageUrl: string;
    spaceId: string;
    creatorId: string;
}

export type Avatar = {
    id: string,
    imageUrl: string,
    name: string
}
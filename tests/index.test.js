const BACKEND_URL = "http://localhost:3000"
const WS_URL = "ws://localhost:3001"

describe("Authentication", () => {
    test('user is able to signup only once', async () => {
        const username = "Sarvesh" + Math.random();
        const password = "12345678";

        const res = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username,
                password,
                type: "admin"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        expect(res.status).toBe(200)

        const updatedRes = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username,
                password,
                type: "admin"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        expect(updatedRes.status).toBe(400)

    })

    test('user signup request fails if the username is empty', async () => {
        const username = "Sarvesh" + Math.random();
        const password = "12345678";

        const res = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                body: password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        expect(res.status).toBe(400)
    })

    test('SignIn succeeds if the username and password are correct', async () => {
        const username = "Sarvesh" + Math.random();
        const password = "12345678";

        await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username,
                password,
                type: "admin"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        const res = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        const response = await res.json();

        expect(res.status).toBe(200)
        expect(response.token).toBeDefined()

    })
    test('SignIn fails if the username and password are incorrect', async () => {
        const username = "Sarvesh" + Math.random();
        const password = "12345678";

        await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username,
                password,
                type: "admin"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        const res = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username: "WrongUsername",
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        expect(res.status).toBe(403)

    })
})

describe("User Metadata endpoints", () => {
    let token = "";
    let avatarId = "";
    beforeAll(async () => {
        const username = "Sarvesh" + Math.random();
        const password = "12345678";

        await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username,
                password,
                type: "admin"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        const res1 = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const tokenRes = await res1.json();
        token = tokenRes.token

        const res2 = await fetch(`${BACKEND_URL}/api/v1/admin/avatar`, {
            method: "POST",
            body: JSON.stringify({
                imageUrl: "https://tse4.mm.bing.net/th/id/OIP.gkIOsHBqLuhoSSva9ibG9QHaLH?rs=1&pid=ImgDetMain&o=7&rm=3",
                name: "Timmy"
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })

        const avatar_response = await res2.json()

        avatarId = avatar_response.id
    })

    test("User can't update their metadata with a wrong avatar id", async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/user/metadata`, {
            method: "POST",
            body: JSON.stringify({
                avatarId: "123123123"
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })

        expect(response.status).toBe(400)
    })

    test("User can update their metadata with the right avatar id", async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/user/metadata`, {
            method: "POST",
            body: JSON.stringify({
                avatarId
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })

        expect(response.status).toBe(200)
    })
    test("User is not able to update their metadata if the auth header is not present", async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/user/metadata`, {
            method: "POST",
            body: JSON.stringify({
                avatarId
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        expect(response.status).toBe(403)
    })
})

describe("User Avatar Information", () => {
    let token;
    let avatarId;
    let userId;
    beforeAll(async () => {
        const username = "Sarvesh" + Math.random();
        const password = "12345678";

        const signUpResponse = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username,
                password,
                type: "admin"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })

        const signUpRes = await signUpResponse.json()

        userId = signUpRes.userId

        const response = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const res = await response.json()
        token = res.token

        const avatar_response = await fetch(`${BACKEND_URL}/api/v1/admin/avatar`, {
            method: "POST",
            body: JSON.stringify({
                imageUrl: "https://tse4.mm.bing.net/th/id/OIP.gkIOsHBqLuhoSSva9ibG9QHaLH?rs=1&pid=ImgDetMain&o=7&rm=3",
                name: "Timmy"
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        })

        const avatar_res = await avatar_response.json()

        avatarId = avatar_res.id
        console.log(avatarId)
    })

    test("Get back avatar information for a user", async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/user/metadata/bulk?ids=[${userId}]`);
        const res = await response.json()
        expect(res.avatars.length).toBe(0);
    })

    test("Available Avatars lists the recently created avatar", async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/avatars`);
        const res = await response.json()
        expect(res.avatars.length).not.toBe(0);
        const currentAvatar = res.avatars.find(x => x.id == avatarId);
        expect(currentAvatar).toBeDefined()
    })
})

describe("Space Information", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let userToken;
    let adminId;
    let userId;
    beforeAll(async () => {
        const adminUsername = "Admin" + Math.random();
        const userUsername = "User" + Math.random();
        const password = "12345678";

        const signUpResponse = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username: adminUsername,
                password,
                type: "admin"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const signUpRes = await signUpResponse.json()
        userId = signUpRes.userId

        const response = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username: adminUsername,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const res = await response.json();
        adminToken = res.token


        const userSignUpResponse = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username: userUsername,
                password,
                type: "user"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const UserSignUpRes = await userSignUpResponse.json()
        userId = UserSignUpRes.userId

        const userResponse = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username: userUsername,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const userRes = await userResponse.json();
        userToken = userRes.token

        const element1Res = await fetch(`${BACKEND_URL}/api/v1/admin/element`, {
            method: "POST",
            body: JSON.stringify({
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                width: 1,
                height: 1,
                static: true
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }
        })
        const element1 = await element1Res.json();

        const element2Res = await fetch(`${BACKEND_URL}/api/v1/admin/element`, {
            method: "POST",
            body: JSON.stringify({
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                width: 1,
                height: 1,
                static: true
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const element2 = await element2Res.json();

        element1Id = element1.id
        element2Id = element2.id

        const mapRes = await fetch(`${BACKEND_URL}/api/v1/admin/map`, {
            method: "POST",
            body: JSON.stringify({
                name: "map1",
                thumbnail: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                dimensions: "100x200",
                defaultElements: [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                    elementId: element1Id,
                    x: 18,
                    y: 20
                },
                {
                    elementId: element2Id,
                    x: 20,
                    y: 20
                }]
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }

        })
        const mapData = await mapRes.json();
        mapId = mapData.id;
    })
    test('User is able to Create a Space', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space/`, {
            method: "POST",
            body: JSON.stringify({
                name: "New Space",
                dimensions: "100x200",
                mapId: mapId
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })
        const res = await response.json();
        expect(res.spaceId).toBeDefined()
    })
    test('User is able to Create a Space without mapId (empty space)', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space`, {
            method: "POST",
            body: JSON.stringify({
                name: "New Space",
                dimensions: "100x200"
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })
        const res = await response.json();
        expect(res.spaceId).toBeDefined()
    })
    test('User is not able to Create a Space without mapId and dimensions', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space`, {
            method: "POST",
            body: {
                name: "New Space"
            },
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400)
    })
    test('User is not able to Delete a Space that does not exist', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space/randomIdDoesntExist`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400)
    })
    test('User is able to Delete a Space that does exist', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space`, {
            method: "POST",
            body: JSON.stringify({
                name: "New Space",
                dimensions: "100x200",
                mapId: mapId
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })
        const res = await response.json();
        const spaceId = res.spaceId;

        const deleteSpaceResponse = await fetch(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(deleteSpaceResponse.status).toBe(200)
    })
    test('User is not able to delete someone else space', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space`, {
            method: "POST",
            body: JSON.stringify({
                name: "New Space",
                dimensions: "100x200",
                mapId: mapId
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })
        const res = await response.json();
        const spaceId = res.spaceId;

        const deleteSpaceResponse = await fetch(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        })
        expect(deleteSpaceResponse.status).toBe(403)
    })
    test('admin have no spaces initially', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                "Authorization": `Bearer ${adminToken} `
            }
        });
        const res = await response.json();
        expect(res.spaces.length).toBe(0);
    })
    test('admin have spaces after creation', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space`, {
            method: "POST",
            body: JSON.stringify({
                name: "New Space",
                dimensions: "100x200",
                mapId: mapId
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }
        })
        const res = await response.json();
        const getResponse = await fetch(`${BACKEND_URL}/api/v1/space/all`, {
            headers: {
                "Authorization": `Bearer ${adminToken}`
            }
        });
        const getRes = await getResponse.json();
        const filteredSpace = getRes.spaces.find(x => x.id == res.spaceId)
        expect(getRes.spaces.length).toBe(1);
        expect(filteredSpace).toBeDefined();
    })


})

describe("Arena Endpoints", () => {
    let mapId;
    let element1Id;
    let element2Id;
    let adminToken;
    let userToken;
    let adminId;
    let userId;
    let spaceId;
    beforeAll(async () => {
        const adminUsername = "Admin" + Math.random();
        const userUsername = "User" + Math.random();
        const password = "12345678";

        const signUpResponse = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username: adminUsername,
                password,
                type: "admin"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const signUpRes = await signUpResponse.json()
        userId = signUpRes.userId

        const response = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username: adminUsername,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const res = await response.json();
        adminToken = res.token


        const userSignUpResponse = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username: userUsername,
                password,
                type: "user"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const UserSignUpRes = await userSignUpResponse.json()
        userId = UserSignUpRes.userId

        const userResponse = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username: userUsername,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const userRes = await userResponse.json();
        userToken = userRes.token

        const element1Res = await fetch(`${BACKEND_URL}/api/v1/admin/element`, {
            method: "POST",
            body: JSON.stringify({
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                width: 1,
                height: 1,
                static: true
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }
        })
        const element1 = await element1Res.json();

        const element2Res = await fetch(`${BACKEND_URL}/api/v1/admin/element`, {
            method: "POST",
            body: JSON.stringify({
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                width: 1,
                height: 1,
                static: true
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const element2 = await element2Res.json();

        element1Id = element1.id
        element2Id = element2.id

        const mapRes = await fetch(`${BACKEND_URL}/api/v1/admin/map`, {
            method: "POST",
            body: JSON.stringify({
                name: "map1",
                thumbnail: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                dimensions: "100x200",
                defaultElements: [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                    elementId: element1Id,
                    x: 18,
                    y: 20
                },
                {
                    elementId: element2Id,
                    x: 20,
                    y: 20
                }]
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }

        })
        const mapData = await mapRes.json();
        mapId = mapData.id;

        const spaceResponse = await fetch(`${BACKEND_URL}/api/v1/space`, {
            method: "POST",
            body: JSON.stringify({
                name: "New Space",
                dimensions: "100x200",
                mapId: mapId
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })
        const spaceRes = await spaceResponse.json();
        spaceId = spaceRes.spaceId
    })

    test('Incorrect space id returns a 400', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space/27898hj`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400)
    })
    test('correct space id returns all the elements', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        const res = await response.json()
        expect(res.dimensions).toBe("100x200")
        expect(res.elements.length).toBe(3)
        expect(response.status).toBe(200)
    })
    test('delete endpoint is able to delete an element', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        const res = await response.json()
        await fetch(`${BACKEND_URL}/api/v1/space/element`, {
            method: "DELETE",
            body: JSON.stringify({
                id: res.elements[0].id
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })

        const newResponse = await fetch(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        const newRes = await newResponse.json()
        expect(newRes.elements.length).toBe(2)
    })
    test('Adding an element fails if the element lies outside the dimensions', async () => {
        const response = await fetch(`${BACKEND_URL}/api/v1/space/element`, {
            method: "POST",
            body: JSON.stringify({
                elementId: element1Id,
                spaceId: spaceId,
                x: 1000,
                y: 20100
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(response.status).toBe(400)
    })
    test('Adding an element as expected', async () => {
        await fetch(`${BACKEND_URL}/api/v1/space/element`, {
            method: "POST",
            body: JSON.stringify({
                elementId: element1Id,
                spaceId: spaceId,
                x: 50,
                y: 20
            }),
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })

        const newResponse = await fetch(`${BACKEND_URL}/api/v1/space/${spaceId}`, {
            headers: {
                "Authorization": `Bearer ${userToken}`
            }
        })
        const newRes = await newResponse.json()
        expect(newRes.elements.length).toBe(2)
    })

})

describe("Admin Endpoints", () => {
    let adminToken;
    let userToken;
    let adminId;
    let userId;
    let spaceId;
    beforeAll(async () => {
        const adminUsername = "Admin" + Math.random();
        const userUsername = "User" + Math.random();
        const password = "12345678";

        const signUpResponse = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username: adminUsername,
                password,
                type: "admin"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const signUpRes = await signUpResponse.json()
        adminId = signUpRes.userId

        const response = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username: adminUsername,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const res = await response.json();
        adminToken = res.token

        const userSignUpResponse = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username: userUsername,
                password,
                type: "user"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const UserSignUpRes = await userSignUpResponse.json()
        userId = UserSignUpRes.userId

        const userResponse = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username: userUsername,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const userRes = await userResponse.json();
        userToken = userRes.token
    })

    test('User is not able to hit admin endpoints', async () => {
        const element1Res = await fetch(`${BACKEND_URL}/api/v1/admin/element`, {
            method: "POST",
            body: JSON.stringify({
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                width: 1,
                height: 1,
                static: true
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })

        const mapRes = await fetch(`${BACKEND_URL}/api/v1/admin/map`, {
            method: "POST",
            body: JSON.stringify({
                name: "map1",
                thumbnail: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                dimensions: "100x200",
                defaultElements: []
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }

        })

        const createAvatarRes = await fetch(`${BACKEND_URL}/api/v1/admin/avatar`, {
            method: "POST",
            body: JSON.stringify({
                name: "Avatar",
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg"
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })

        const updateElementRes = await fetch(`${BACKEND_URL}/api/v1/admin/element/123`, {
            method: "PUT",
            body: JSON.stringify({
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f2f4RaM.jpg"
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })
        expect(element1Res.status).toBe(403);
        expect(mapRes.status).toBe(403);
        expect(createAvatarRes.status).toBe(403)
        expect(updateElementRes.status).toBe(403)
    })
    test('Admin is able to hit admin endpoints', async () => {
        const element1Res = await fetch(`${BACKEND_URL}/api/v1/admin/element`, {
            method: "POST",
            body: JSON.stringify({
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                width: 1,
                height: 1,
                static: true
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const mapRes = await fetch(`${BACKEND_URL}/api/v1/admin/map`, {
            method: "POST",
            body: JSON.stringify({
                name: "map1",
                thumbnail: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                dimensions: "100x200",
                defaultElements: []
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }

        })

        const createAvatarRes = await fetch(`${BACKEND_URL}/api/v1/admin/avatar`, {
            method: "POST",
            body: JSON.stringify({
                name: "Avatar",
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg"
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }
        })
        expect(element1Res.status).toBe(200);
        expect(mapRes.status).toBe(200);
        expect(createAvatarRes.status).toBe(200)
    })
    test('Admin is able to update the imageUrl of an element', async () => {
        const element1Res = await fetch(`${BACKEND_URL}/api/v1/admin/element`, {
            method: "POST",
            body: JSON.stringify({
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                width: 1,
                height: 1,
                static: true
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }
        })
        const element1 = await element1Res.json();

        const updateElementRes = await fetch(`${BACKEND_URL}/api/v1/admin/element/${element1.id}`, {
            method: "PUT",
            body: JSON.stringify({
                imageUrl: "https://img.freepik.com/premium-photo/random-image_590832-9602.jpg"
            }),
            headers: {
                "Content-type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }
        })
        expect(updateElementRes.status).toBe(200)
    })

})

describe("Websocket tests", () => {
    let adminToken;
    let userToken;
    let adminId;
    let userId;
    let spaceId;
    let mapId;
    let element1Id;
    let element2Id;
    let ws1;
    let ws2;
    let ws1Messages = [];
    let ws2Messages = [];
    let userX;
    let userY;
    let adminX;
    let adminY;

    function waitForAndPopLatestMessage(messagesArray) {
        return new Promise(r => {
            if (messagesArray.length > 0) {
                r(messagesArray.shift())
            } else {
                let interval = setInterval(() => {
                    if (messagesArray.length > 0) {
                        r(messagesArray.shift())
                        clearInterval(interval)
                    }
                }, 100)
            }
        })
    }

    async function setupHTTP() {
        const adminUsername = "Admin" + Math.random();
        const userUsername = "User" + Math.random();
        const password = "12345678";

        const signUpResponse = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username: adminUsername,
                password,
                type: "admin"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const signUpRes = await signUpResponse.json()
        adminId = signUpRes.userId

        const response = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username: adminUsername,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const res = await response.json();
        adminToken = res.token

        const userSignUpResponse = await fetch(`${BACKEND_URL}/api/v1/signup`, {
            method: "POST",
            body: JSON.stringify({
                username: userUsername,
                password,
                type: "user"
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const UserSignUpRes = await userSignUpResponse.json()
        userId = UserSignUpRes.userId

        const userResponse = await fetch(`${BACKEND_URL}/api/v1/signin`, {
            method: "POST",
            body: JSON.stringify({
                username: userUsername,
                password
            }),
            headers: {
                "Content-Type": "application/json"
            }
        })
        const userRes = await userResponse.json();
        userToken = userRes.token

        const element1Res = await fetch(`${BACKEND_URL}/api/v1/admin/element`, {
            method: "POST",
            body: JSON.stringify({
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                width: 1,
                height: 1,
                static: true
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }
        })
        const element1 = await element1Res.json();

        const element2Res = await fetch(`${BACKEND_URL}/api/v1/admin/element`, {
            method: "POST",
            body: JSON.stringify({
                imageUrl: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                width: 1,
                height: 1,
                static: true
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }
        })

        const element2 = await element2Res.json();

        element1Id = element1.id
        element2Id = element2.id

        const mapRes = await fetch(`${BACKEND_URL}/api/v1/admin/map`, {
            method: "POST",
            body: JSON.stringify({
                name: "map1",
                thumbnail: "https://static-cse.canva.com/blob/1436087/1600w-wK95f3XNRaM.jpg",
                dimensions: "100x200",
                defaultElements: [{
                    elementId: element1Id,
                    x: 20,
                    y: 20
                }, {
                    elementId: element1Id,
                    x: 18,
                    y: 20
                },
                {
                    elementId: element2Id,
                    x: 20,
                    y: 20
                }]
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${adminToken}`
            }

        })
        const mapData = await mapRes.json();
        mapId = mapData.id;

        const spaceResponse = await fetch(`${BACKEND_URL}/api/v1/space`, {
            method: "POST",
            body: JSON.stringify({
                name: "New Space",
                dimensions: "100x200",
                mapId: mapId
            }),
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${userToken}`
            }
        })
        const spaceRes = await spaceResponse.json();
        spaceId = spaceRes.spaceId
    }

    async function setupWS() {
        ws1 = new WebSocket(WS_URL)

        await new Promise(r => {
            ws1.onopen = r
        })
        
        ws1.onmessage = (event) => {
            ws1Messages.push(JSON.parse(event.data))
        }


        ws2 = new WebSocket(WS_URL)
        
        await new Promise(r => {
            ws2.onopen = r
        })

        ws2.onmessage = (event) => {
            ws2Messages.push(JSON.parse(event.data))
        }

    }
    beforeAll(async () => {
        await setupHTTP();
        await setupWS()
    })

    test('Get back ack for joining the space', async() => {
        ws1.send(JSON.stringify({
            type: "join",
            payload: {
                spaceId : spaceId,
                token: adminToken
            }
        }))

        console.log(ws1Messages)
        
        const message1 = await waitForAndPopLatestMessage(ws1Messages)
        console.log(message1)

        ws2.send(JSON.stringify({
            type: "join",
            payload: {
                spaceId : spaceId,
                token: userToken
            }
        }))

        const message2 = await waitForAndPopLatestMessage(ws2Messages)
                console.log(message2)

        const message3 = await waitForAndPopLatestMessage(ws1Messages)

        expect(message1.type).toBe("space-joined")
        expect(message2.type).toBe("space-joined")
        expect(message1.payload.users.length).toBe(0)
        expect(message2.payload.users.length).toBe(1)
        expect(message3.type).toBe("user-joined");
        expect(message3.payload.x).toBe(message2.payload.spawn.x);
        expect(message3.payload.y).toBe(message2.payload.spawn.y);
        expect(message3.payload.userId).toBe(userId);

        adminX = message1.payload.spawn.x
        adminY = message1.payload.spawn.y

        userX = message2.payload.spawn.x
        userY = message2.payload.spawn.y
    })

    test('user should not be able to move across the boundary of the wall', async() => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: 100000,
                y: 20000
            }
        }))

        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    })

    test('user should not be able to move two blocks at a time', async() => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX + 2,
                y: adminY
            }
        }))

        const message = await waitForAndPopLatestMessage(ws1Messages);
        expect(message.type).toBe("movement-rejected");
        expect(message.payload.x).toBe(adminX);
        expect(message.payload.y).toBe(adminY);
    })
    test('correct movement should be broadcasted to other members in the room', async() => {
        ws1.send(JSON.stringify({
            type: "move",
            payload: {
                x: adminX + 1,
                y: adminY,
                userId: adminId
            }
        }))

        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("move");
        expect(message.payload.x).toBe(adminX+ 1);
        expect(message.payload.y).toBe(adminY);
    })

    test('If a user leaves, the other user should receive the leave message', async() => {
        ws1.close()
        const message = await waitForAndPopLatestMessage(ws2Messages);
        expect(message.type).toBe("user-left");
        expect(message.payload.userId).toBe(adminId)
    })
    
    
})



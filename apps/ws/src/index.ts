import "./setup.js"
import {WebSocketServer} from "ws"
import { User } from "./User.js";

const wss = new WebSocketServer({ port: 3001 });

console.log(`WebSocket server running on ws://localhost:3001`);

wss.on('connection', function connection(ws) {
    let user = new User(ws);
    ws.on('error', console.error);

    ws.on('close', ()=>{
        user?.destroy();
    })
});
import { DRPNode, Chat } from "https://storage.googleapis.com/zucket-store/topology/c2/dist/drp-chat.es.js";
import { createSidebar, initSidebar, updatePeerInfo } from './sidebar.js';
import { renderMessages } from './chatBubble.js';

let node = null;
let drpObject = null;
let chatDRP = null;

function render() {
    if (drpObject) {
        document.getElementById("roomInput").value = drpObject.id;
    }

    if (!node) return;

    updatePeerInfo(
        node.networkNode.peerId,
        drpObject?.id || '',
        node.networkNode.getGroupPeers(drpObject?.id || ''),
        node.networkNode.getGroupPeers("drp::discovery")
    );

    if (!chatDRP) return;

    const chat = chatDRP.query_messages();
    const chatElement = document.getElementById("chatArea");
    chatElement.innerHTML = `
        <div class="space-y-4">
            ${renderMessages(Array.from(chat), node.networkNode.peerId)}
        </div>
    `;
    
    chatElement.scrollTop = chatElement.scrollHeight;
}

async function sendMessage(message) {
    const timestamp = Date.now().toString();
    if (!chatDRP) {
        console.error("Chat DRP not initialized");
        alert("Please join a chat room first");
        return;
    }

    // Format: (timestamp, message, peerId)
    const formattedMessage = `(${timestamp}, ${message}, ${node.networkNode.peerId})`;
    chatDRP.addMessage(formattedMessage, '');
    render();
}

async function createConnectHandlers() {
    node.addCustomGroupMessageHandler(drpObject.id, () => {
        render();
    });

    node.objectStore.subscribe(drpObject.id, () => {
        render();
    });
}

async function disconnectFromRoom() {
    if (drpObject) {
        drpObject = null;
        chatDRP = null;
        
        const chatElement = document.getElementById("chatArea");
        chatElement.innerHTML = '<div class="space-y-4"><div class="text-center text-gray-500 py-4">No messages yet</div></div>';
        
        render();
    }
}

export async function initializeChat() {
    document.body.appendChild(createSidebar());
    initSidebar();

    node = new DRPNode();
    await node.start();
    render();

    node.addCustomGroupMessageHandler("", () => {
        render();
    });

    const joinRoomBtn = document.getElementById("joinRoomBtn");
    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");

    joinRoomBtn.addEventListener("click", async () => {
        if (drpObject) {
            await disconnectFromRoom();
            return;
        }

        const objectId = document.getElementById("roomInput").value;
        if (!objectId) {
            alert("Please enter a room id");
            return;
        }

        drpObject = await node.createObject(new Chat(), objectId, undefined, true);
        chatDRP = drpObject.drp;
        createConnectHandlers();
        render();
    });

    sendBtn.addEventListener("click", async () => {
        const message = messageInput.value.trim();
        messageInput.value = "";

        if (!message) {
            console.error("Empty message");
            return;
        }

        await sendMessage(message);
    });

    messageInput.addEventListener("keypress", event => {
        if (event.key === "Enter") {
            sendBtn.click();
        }
    });
}
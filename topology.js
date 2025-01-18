import { DRPNode, Chat } from "https://storage.googleapis.com/zucket-store/topology/c2/dist/drp-chat.es.js";
import { createSidebar, initSidebar, updatePeerInfo } from './sidebar.js';

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
    chatElement.innerHTML = '<div class="space-y-4">';

    if (chat.size === 0) {
        chatElement.innerHTML += '<div class="text-center text-gray-500 py-4">No messages yet</div>';
        chatElement.innerHTML += '</div>';
        return;
    }

    for (const message of [...chat].sort()) {
        chatElement.innerHTML += `
            <div class="flex">
                <div class="bg-blue-600 text-white rounded-lg px-4 py-2 max-w-[80%]">
                    ${message}
                </div>
            </div>
        `;
    }
    chatElement.innerHTML += '</div>';
    chatElement.scrollTop = chatElement.scrollHeight;
}

async function sendMessage(message) {
    const timestamp = Date.now().toString();
    if (!chatDRP) {
        console.error("Chat DRP not initialized");
        alert("Please join a chat room first");
        return;
    }

    chatDRP.addMessage(timestamp, message, node.networkNode.peerId);
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
        // Just let go of the references and render
        drpObject = null;
        chatDRP = null;
        
        // Clear the chat area
        const chatElement = document.getElementById("chatArea");
        chatElement.innerHTML = '<div class="space-y-4"><div class="text-center text-gray-500 py-4">No messages yet</div></div>';
        
        // Update UI
        render();
    }
}

export async function initializeChat() {
    // Initialize sidebar
    document.body.appendChild(createSidebar());
    initSidebar();

    // Initialize DRP
    node = new DRPNode();
    await node.start();
    render();

    node.addCustomGroupMessageHandler("", () => {
        render();
    });

    // Event Handlers
    const joinRoomBtn = document.getElementById("joinRoomBtn");
    const sendBtn = document.getElementById("sendBtn");
    const messageInput = document.getElementById("messageInput");

    joinRoomBtn.addEventListener("click", async () => {
        if (drpObject) {
            // If already connected, disconnect
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
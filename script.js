import { DRPNode } from "https://storage.googleapis.com/zucket-store/topology/c2/dist/drp-chat.es.js"
import { Chat } from "https://storage.googleapis.com/zucket-store/topology/c2/dist/drp-chat.es.js"

let node = null
let drpObject = null
let chatDRP = null
let peers = []
let discoveryPeers = []
let objectPeers = []

const render = () => {
  if (drpObject) {
    document.getElementById("chatId").innerText = drpObject.id
  }

  document.getElementById("peerId").innerHTML = node.networkNode.peerId
  document.getElementById("peers").innerHTML = `[${peers.join(", ")}]`
  document.getElementById("discoveryPeers").innerHTML =
    `[${discoveryPeers.join(", ")}]`
  document.getElementById("objectPeers").innerHTML =
    `[${objectPeers.join(", ")}]`

  if (!chatDRP) return

  const chat = chatDRP.query_messages()
  const chatElement = document.getElementById("chat")
  chatElement.innerHTML = ""

  if (chat.size === 0) {
    const div = document.createElement("div")
    div.innerHTML = "No messages yet"
    div.style.padding = "10px"
    chatElement.appendChild(div)
    return
  }

  for (const message of [...chat].sort()) {
    const div = document.createElement("div")
    div.innerHTML = message
    div.style.padding = "10px"
    chatElement.appendChild(div)
  }
}

async function sendMessage(message) {
  const timestamp = Date.now().toString()
  if (!chatDRP) {
    console.error("Chat DRP not initialized")
    alert("Please create or join a chat room first")
    return
  }

  chatDRP.addMessage(timestamp, message, node.networkNode.peerId)
  render()
}

async function createConnectHandlers() {
  node.addCustomGroupMessageHandler(drpObject.id, () => {
    if (drpObject) {
      objectPeers = node.networkNode.getGroupPeers(drpObject.id)
    }
    render()
  })

  node.objectStore.subscribe(drpObject.id, () => {
    render()
  })
}

async function initializeChat() {
  // Initialize DRP node
  node = new DRPNode()
  await node.start()
  render()

  // Set up generic message handler
  node.addCustomGroupMessageHandler("", () => {
    peers = node.networkNode.getAllPeers()
    discoveryPeers = node.networkNode.getGroupPeers("drp::discovery")
    render()
  })

  // Create Room button handler
  document.getElementById("createRoom").addEventListener("click", async () => {
    drpObject = await node.createObject(new Chat())
    chatDRP = drpObject.drp
    createConnectHandlers()
    render()
  })

  // Join Room button handler
  document.getElementById("joinRoom").addEventListener("click", async () => {
    const objectId = document.getElementById("roomInput").value
    if (!objectId) {
      alert("Please enter a room id")
      return
    }

    drpObject = await node.createObject(new Chat(), objectId, undefined, true)
    chatDRP = drpObject.drp
    createConnectHandlers()
    render()
  })

  // Send Message button handler
  document.getElementById("sendMessage").addEventListener("click", async () => {
    const messageInput = document.getElementById("messageInput")
    const message = messageInput.value
    messageInput.value = ""

    if (!message) {
      console.error("Tried sending an empty message")
      alert("Please enter a message")
      return
    }

    await sendMessage(message)
    const chatElement = document.getElementById("chat")
    chatElement.scrollTop = chatElement.scrollHeight
  })

  // Enter key handler for message input
  document
    .getElementById("messageInput")
    .addEventListener("keypress", event => {
      if (event.key === "Enter") {
        document.getElementById("sendMessage").click()
      }
    })
}

// Initialize the application
initializeChat().catch(console.error)

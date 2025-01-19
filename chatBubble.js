import { format } from 'https://cdn.skypack.dev/timeago.js';

function generateColorFromPeerId(peerId) {
    let hash = 0;
    // Use the entire peerId to generate color
    for (let i = 0; i < peerId.length; i++) {
        hash = peerId.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // More distinctive color generation
    const hue = Math.abs(hash) % 360;
    const saturation = 70 + (Math.abs(hash) % 20); // 70-90%
    const lightness = 45 + (Math.abs(hash) % 10);  // 45-55%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
}

function truncatePeerId(peerId) {
    if (!peerId) return '';
    return `${peerId.slice(0, 8)}...${peerId.slice(-6)}`;
}

function parseMessage(msg) {
    try {
        // Remove the outer parentheses and split
        const content = msg.substring(1, msg.length - 1);
        const [timestamp, message, peerId] = content.split(', ');
        return {
            timestamp: parseInt(timestamp),
            text: message,
            sender: peerId
        };
    } catch (e) {
        console.error('Error parsing message:', msg, e);
        return null;
    }
}

function renderMessages(messages, currentPeerId) {
    if (!Array.isArray(messages) || messages.length === 0) {
        return '<div class="text-center text-gray-500 py-4">No messages yet</div>';
    }

    return messages
        .map(msg => parseMessage(msg))
        .filter(msg => msg !== null)
        .map(message => {
            const isOwnMessage = message.sender === currentPeerId;
            const messageColor = generateColorFromPeerId(message.sender);
            const timeAgo = format(message.timestamp);

            return `
                <div class="flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}">
                    <div class="px-4 py-2 rounded-lg max-w-[80%] space-y-1"
                         style="background-color: ${messageColor}">
                        <div class="text-gray-100 text-[10px] font-mono opacity-70">
                            ${truncatePeerId(message.sender)}
                        </div>
                        <div class="text-white">
                            ${message.text}
                        </div>
                        <div class="text-gray-100 text-[10px] opacity-70">
                            ${timeAgo}
                        </div>
                    </div>
                </div>
            `;
        })
        .join('');
}

export { renderMessages };
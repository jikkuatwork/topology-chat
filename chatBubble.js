import { format } from 'https://cdn.skypack.dev/timeago.js';

const BUBBLE_COLORS = {
    self: '#4F46E5',    // Indigo-600
    other: '#6B7280',   // Gray-500
};

function truncatePeerId(peerId) {
    if (!peerId) return '';
    return `${peerId.slice(0, 8)}...${peerId.slice(-6)}`;
}

function parseMessage(msg) {
    try {
        // Input format: ((timestamp, message, peerId), , undefined)
        // Remove the outer wrapping and undefined
        const mainContent = msg.split(',').slice(0, -2).join(',').trim();
        // Remove the double parentheses at start
        const content = mainContent.substring(2);
        // Remove the trailing parenthesis
        const cleanContent = content.substring(0, content.length - 1);
        
        const [timestamp, message, peerId] = cleanContent.split(',').map(s => s.trim());
        
        return {
            timestamp: parseInt(timestamp),
            text: message,
            sender: peerId
        };
    } catch (e) {
        console.error('Error parsing message:', msg, e);
        console.log('Parsing steps:', {
            msg,
            mainContent: msg.split(',').slice(0, -2).join(',').trim(),
            content: msg.split(',').slice(0, -2).join(',').trim().substring(2),
            parts: msg.split(',').slice(0, -2).join(',').trim().substring(2).split(',').map(s => s.trim())
        });
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
            const bubbleColor = isOwnMessage ? BUBBLE_COLORS.self : BUBBLE_COLORS.other;
            const timeAgo = format(message.timestamp);

            return `
                <div class="flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}">
                    <div class="px-4 py-2 rounded-lg max-w-[80%] space-y-1"
                         style="background-color: ${bubbleColor}">
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

export { renderMessages, BUBBLE_COLORS };
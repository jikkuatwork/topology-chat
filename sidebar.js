let lastPeerId = '';
let lastRoomId = '';
let isConnected = false;

function truncatePeerId(peerId, length = 12) {
    if (!peerId || peerId.length <= length) return peerId;
    return `${peerId.substring(0, length)}...`;
}

function createSidebar() {
    const sidebarEl = document.createElement('div');
    sidebarEl.id = 'sidebar';
    sidebarEl.className = 'fixed inset-0 bg-white transform -translate-x-full transition-transform duration-200 ease-in-out z-50';
    
    sidebarEl.innerHTML = `
        <div class="h-full flex flex-col">
            <div class="flex-1 overflow-y-auto pb-[60px]">
                <div class="p-4 space-y-6">
                    <div>
                        <h3 class="text-sm font-semibold text-gray-500 mb-2">Your Peer ID</h3>
                        <div id="peerId" class="font-mono text-sm bg-gray-50 p-3 rounded-md break-all" title=""></div>
                    </div>

                    <div>
                        <h3 class="text-sm font-semibold text-gray-500 mb-2">Room Peers</h3>
                        <div id="roomPeers" class="bg-gray-50 rounded-md">
                            <div class="divide-y divide-gray-100"></div>
                        </div>
                    </div>

                    <div>
                        <h3 class="text-sm font-semibold text-gray-500 mb-2">Discovery Peers</h3>
                        <div id="discoveryPeers" class="bg-gray-50 rounded-md">
                            <div class="divide-y divide-gray-100"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="border-t bg-white px-2 py-2 absolute bottom-0 left-0 right-0">
                <div class="flex items-center space-x-2">
                    <button id="closeSidebarBtn" class="icon-button hover:bg-gray-100 rounded-full text-gray-600">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="svg-icon">
                            <path d="m15 18-6-6 6-6"/>
                        </svg>
                    </button>
                    <input type="text" id="roomInput" 
                        class="flex-1 min-w-0 border input-field px-3 focus:outline-none focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
                        placeholder="Room ID">
                    <button id="joinRoomBtn" 
                        class="text-white px-4 input-field rounded-md flex-shrink-0 text-sm md:text-base transition-colors">
                        Join Room
                    </button>
                </div>
            </div>
        </div>
    `;

    return sidebarEl;
}

function updateConnectionState(roomId) {
    const roomInput = document.getElementById('roomInput');
    const joinRoomBtn = document.getElementById('joinRoomBtn');
    
    isConnected = !!roomId;
    
    // Clear the room input when disconnected
    if (!isConnected && roomInput.value) {
        roomInput.value = '';
    }
    
    roomInput.disabled = isConnected;
    joinRoomBtn.textContent = isConnected ? 'Disconnect' : 'Join Room';
    joinRoomBtn.className = `${isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 input-field rounded-md flex-shrink-0 text-sm md:text-base transition-colors`;
}

function updatePeerInfo(peerId, roomId, roomPeers, discoveryPeers) {
    if (peerId === lastPeerId && roomId === lastRoomId) return;
    
    lastPeerId = peerId;
    lastRoomId = roomId;

    updateConnectionState(roomId);

    const peerIdEl = document.getElementById('peerId');
    peerIdEl.textContent = peerId;
    peerIdEl.title = peerId;
    
    const roomPeersEl = document.getElementById('roomPeers').querySelector('.divide-y');
    roomPeersEl.innerHTML = roomPeers.length ? 
        roomPeers.map(peer => `
            <div class="p-2.5 font-mono text-sm hover:bg-gray-100" title="${peer}">
                <div class="break-all">
                    ${peer}
                </div>
            </div>
        `).join('') :
        '<div class="p-2.5 text-sm text-gray-500">No room peers</div>';
    
    const discoveryPeersEl = document.getElementById('discoveryPeers').querySelector('.divide-y');
    discoveryPeersEl.innerHTML = discoveryPeers.length ?
        discoveryPeers.map(peer => `
            <div class="p-2.5 font-mono text-sm hover:bg-gray-100" title="${peer}">
                <div class="break-all">
                    ${peer}
                </div>
            </div>
        `).join('') :
        '<div class="p-2.5 text-sm text-gray-500">No discovery peers</div>';

    if (roomId) {
        document.getElementById('roomInput').value = roomId;
    }
}

function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const moreBtn = document.getElementById('moreBtn');
    const closeSidebarBtn = document.getElementById('closeSidebarBtn');

    if (!sidebar || !moreBtn || !closeSidebarBtn) {
        console.error('Required elements not found');
        return;
    }

    moreBtn.addEventListener('click', () => {
        sidebar.classList.remove('-translate-x-full');
    });

    closeSidebarBtn.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
    });
}

export { createSidebar, initSidebar, updatePeerInfo };
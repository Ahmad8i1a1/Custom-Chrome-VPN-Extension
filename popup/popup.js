/**
 * NexusVPN Popup Controller
 * Manages UI interactions, animations, session timer, server picking, and IPC with background.js
 */

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Element References
  const container = document.querySelector('.app-container');
  const toggleBtn = document.getElementById('toggleBtn');
  const statusBadge = document.getElementById('statusBadge');
  const statusCaption = document.getElementById('statusCaption');
  const sessionTimerEl = document.getElementById('sessionTimer');
  const pingValueEl = document.getElementById('pingValue');
  const pingStatusEl = document.getElementById('pingStatus');
  
  const currentFlagEl = document.getElementById('currentFlag');
  const currentServerNameEl = document.getElementById('currentServerName');
  const currentServerLocationEl = document.getElementById('currentServerLocation');
  const openServerSelectorBtn = document.getElementById('openServerSelector');
  
  const maskedIpAddressEl = document.getElementById('maskedIpAddress');
  const verifyIpBtn = document.getElementById('verifyIpBtn');
  
  const webrtcToggle = document.getElementById('webrtcToggle');
  const adblockToggle = document.getElementById('adblockToggle');
  const emergencyResetBtn = document.getElementById('emergencyResetBtn');
  const openOptionsBtn = document.getElementById('openOptionsBtn');
  
  // Modal Elements
  const serverModal = document.getElementById('serverModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const serverSearchInput = document.getElementById('serverSearch');
  const serverListContainer = document.getElementById('serverListContainer');
  const serverCountLabel = document.getElementById('serverCountLabel');
  const syncServersBtn = document.getElementById('syncServersBtn');

  // Internal State
  let timerInterval = null;
  let currentServers = [];
  let selectedServerId = 'auto';
  let isConnected = false;

  // Initialize UI
  await refreshStatus();

  // Polling status while popup remains open
  const statusPoll = setInterval(async () => {
    await refreshStatus(false);
  }, 3000);

  window.addEventListener('unload', () => {
    clearInterval(statusPoll);
    if (timerInterval) clearInterval(timerInterval);
  });

  /**
   * Fetch current VPN status from background worker
   */
  async function refreshStatus(fullReload = true) {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'GET_STATUS' });
      if (!response || !response.success) return;

      const {
        vpnState,
        activeServer,
        selectedServerId: storedServerId,
        connectedAt,
        webrtcProtection,
        adBlockEnabled,
        lastConnectedIp,
        serverList = [],
        customServers = [],
        lastError
      } = response;

      selectedServerId = storedServerId || 'direct-shield';
      currentServers = [...serverList, ...customServers];

      // Update Toggles
      if (fullReload) {
        webrtcToggle.checked = !!webrtcProtection;
        adblockToggle.checked = !!adBlockEnabled;
      }

      // Update Server Display
      const targetServer = currentServers.find((s) => s.id === selectedServerId) || currentServers[0];
      if (targetServer) {
        currentFlagEl.textContent = targetServer.flag || '🌐';
        currentServerNameEl.textContent = targetServer.name || 'Optimal Server';
        currentServerLocationEl.textContent = `${targetServer.city || ''} ${targetServer.country || ''}`.trim() || 'Global High Speed';
      }

      // Update Connection State
      if (vpnState === 'connected') {
        isConnected = true;
        container.classList.remove('connecting');
        container.classList.add('connected');
        
        if (activeServer && activeServer.scheme === 'direct') {
          statusBadge.textContent = 'PROTECTED (DIRECT SHIELD)';
          statusCaption.textContent = 'Zero-lag mode • WebRTC IP shield & ad blocker active';
        } else {
          statusBadge.textContent = 'CONNECTED & ENCRYPTED';
          statusCaption.textContent = 'Military-grade proxy encryption active';
        }

        // Uptime counter
        if (connectedAt && !timerInterval) {
          startSessionTimer(connectedAt);
        }

        // Latency
        if (activeServer && activeServer.ping) {
          pingValueEl.textContent = `${activeServer.ping} ms`;
          pingValueEl.style.color = '#10b981';
          pingStatusEl.textContent = activeServer.scheme === 'direct' ? 'Local Speed' : 'Optimal Route';
        }

        // IP Display
        if (lastConnectedIp) {
          maskedIpAddressEl.textContent = lastConnectedIp;
        } else {
          maskedIpAddressEl.textContent = targetServer ? targetServer.host : 'Tunnel Active';
        }
      } else if (vpnState === 'connecting') {
        isConnected = false;
        container.classList.remove('connected');
        container.classList.add('connecting');
        statusBadge.textContent = 'CONNECTING SECURELY...';
        statusCaption.textContent = 'Verifying tunnel and pre-flight health...';
        stopSessionTimer();
        maskedIpAddressEl.textContent = 'Negotiating...';
      } else {
        isConnected = false;
        container.classList.remove('connected', 'connecting');
        statusBadge.textContent = 'DISCONNECTED';
        statusCaption.textContent = lastError || 'Your connection is currently unprotected';
        if (lastError) {
          statusCaption.style.color = '#f59e0b';
        } else {
          statusCaption.style.color = 'var(--text-muted)';
        }
        stopSessionTimer();
        pingValueEl.textContent = '-- ms';
        pingValueEl.style.color = '#fff';
        pingStatusEl.textContent = 'No Tunnel';
        maskedIpAddressEl.textContent = 'Direct Connection';
      }

      if (fullReload) {
        renderServerList();
      }
    } catch (err) {
      console.warn('[NexusVPN Popup] Status query error:', err);
    }
  }

  /**
   * Session uptime timer
   */
  function startSessionTimer(startTime) {
    if (timerInterval) clearInterval(timerInterval);
    const updateTime = () => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const hours = String(Math.floor(elapsed / 3600)).padStart(2, '0');
      const minutes = String(Math.floor((elapsed % 3600) / 60)).padStart(2, '0');
      const seconds = String(elapsed % 60).padStart(2, '0');
      sessionTimerEl.textContent = `${hours}:${minutes}:${seconds}`;
    };
    updateTime();
    timerInterval = setInterval(updateTime, 1000);
  }

  function stopSessionTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    sessionTimerEl.textContent = '00:00:00';
  }

  /**
   * Toggle Connect / Disconnect
   */
  toggleBtn.addEventListener('click', async () => {
    toggleBtn.style.pointerEvents = 'none';
    try {
      if (isConnected) {
        container.classList.remove('connected');
        statusBadge.textContent = 'DISCONNECTING...';
        await chrome.runtime.sendMessage({ action: 'DISCONNECT' });
      } else {
        container.classList.add('connecting');
        statusBadge.textContent = 'CONNECTING...';
        await chrome.runtime.sendMessage({
          action: 'CONNECT',
          serverId: selectedServerId
        });
      }
      await refreshStatus();
    } finally {
      setTimeout(() => {
        toggleBtn.style.pointerEvents = 'auto';
      }, 400);
    }
  });

  /**
   * WebRTC Shield Toggle
   */
  webrtcToggle.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({
      action: 'TOGGLE_WEBRTC',
      enabled: webrtcToggle.checked
    });
  });

  /**
   * Speed Shield Toggle
   */
  adblockToggle.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({
      action: 'TOGGLE_ADBLOCK',
      enabled: adblockToggle.checked
    });
  });

  /**
   * Emergency Reset
   */
  emergencyResetBtn.addEventListener('click', async () => {
    emergencyResetBtn.style.transform = 'rotate(180deg)';
    await chrome.runtime.sendMessage({ action: 'RESET_CONNECTION' });
    setTimeout(async () => {
      emergencyResetBtn.style.transform = 'none';
      await refreshStatus();
    }, 300);
  });

  /**
   * Open Options Page
   */
  openOptionsBtn.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });

  /**
   * Verify Leak Button
   */
  verifyIpBtn.addEventListener('click', () => {
    chrome.tabs.create({ url: 'https://ipleak.net/' });
  });

  /**
   * Open / Close Server Picker Modal
   */
  openServerSelectorBtn.addEventListener('click', () => {
    serverModal.style.display = 'flex';
    requestAnimationFrame(() => {
      serverModal.classList.add('open');
    });
    serverSearchInput.value = '';
    renderServerList();
    serverSearchInput.focus();
  });

  closeModalBtn.addEventListener('click', () => {
    serverModal.classList.remove('open');
    setTimeout(() => {
      if (!serverModal.classList.contains('open')) {
        serverModal.style.display = 'none';
      }
    }, 250);
  });

  serverSearchInput.addEventListener('input', () => {
    renderServerList(serverSearchInput.value.trim().toLowerCase());
  });

  /**
   * Render server list inside picker modal
   */
  function renderServerList(filter = '') {
    serverListContainer.innerHTML = '';
    const filtered = currentServers.filter((s) => {
      if (!filter) return true;
      const haystack = `${s.name} ${s.country} ${s.city} ${s.countryCode}`.toLowerCase();
      return haystack.includes(filter);
    });

    serverCountLabel.textContent = `${filtered.length} Locations`;

    filtered.forEach((server) => {
      const item = document.createElement('div');
      item.className = 'server-item';
      if (server.id === selectedServerId) {
        item.classList.add('selected');
      }

      let pingClass = '';
      const ping = server.ping || 40;
      if (ping > 100) pingClass = 'slow';
      else if (ping > 60) pingClass = 'medium';

      item.innerHTML = `
        <span class="item-flag">${server.flag || '🌐'}</span>
        <div class="item-details">
          <div class="item-name">${server.name}</div>
          <div class="item-sub">
            <span>${server.city || server.country}</span>
            <span class="proto-tag">${(server.scheme || 'https').toUpperCase()}</span>
            ${server.isCustom ? '<span class="proto-tag" style="background:#2563eb">CUSTOM</span>' : ''}
          </div>
        </div>
        <span class="item-ping ${pingClass}">${server.id === 'auto' ? '⚡ AUTO' : ping + ' ms'}</span>
      `;

      item.addEventListener('click', async () => {
        selectedServerId = server.id;
        await chrome.storage.local.set({ selectedServerId: server.id });
        serverModal.classList.remove('open');
        setTimeout(() => {
          if (!serverModal.classList.contains('open')) {
            serverModal.style.display = 'none';
          }
        }, 250);

        // If currently connected, seamlessly reconnect to chosen server
        if (isConnected) {
          container.classList.remove('connected');
          container.classList.add('connecting');
          statusBadge.textContent = 'SWITCHING SERVER...';
          await chrome.runtime.sendMessage({
            action: 'CONNECT',
            serverId: server.id
          });
        }
        await refreshStatus();
      });

      serverListContainer.appendChild(item);
    });
  }

  /**
   * Sync fresh servers from public node mirrors
   */
  syncServersBtn.addEventListener('click', async () => {
    syncServersBtn.disabled = true;
    syncServersBtn.textContent = 'Syncing...';
    try {
      const res = await chrome.runtime.sendMessage({ action: 'SYNC_PUBLIC_SERVERS' });
      if (res && res.success) {
        await refreshStatus();
      } else {
        alert('Could not update remote proxy pool. Built-in servers remain active.');
      }
    } finally {
      syncServersBtn.disabled = false;
      syncServersBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/>
        </svg>
        Sync Nodes
      `;
    }
  });
});

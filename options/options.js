/**
 * NexusVPN Options & Custom Node Management Controller
 */

const DEFAULT_BYPASS_LIST = [
  "<local>",
  "127.0.0.1",
  "localhost",
  "::1",
  "10.0.0.0/8",
  "172.16.0.0/12",
  "192.168.0.0/16",
  "*.local"
];

document.addEventListener('DOMContentLoaded', async () => {
  // Navigation Tabs
  const navItems = document.querySelectorAll('.nav-item');
  const tabPanes = document.querySelectorAll('.tab-pane');

  navItems.forEach((btn) => {
    btn.addEventListener('click', () => {
      navItems.forEach((n) => n.classList.remove('active'));
      tabPanes.forEach((p) => p.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId).classList.add('active');
    });
  });

  // Toast notification
  const toast = document.getElementById('toast');
  function showToast(message, duration = 3000) {
    toast.textContent = message;
    toast.classList.remove('hidden');
    setTimeout(() => {
      toast.classList.add('hidden');
    }, duration);
  }

  // --- TAB 1: CUSTOM PROXIES ---
  const openAddNodeBtn = document.getElementById('openAddNodeBtn');
  const addNodeFormCard = document.getElementById('addNodeFormCard');
  const cancelAddNodeBtn = document.getElementById('cancelAddNodeBtn');
  const addProxyForm = document.getElementById('addProxyForm');
  const customNodesList = document.getElementById('customNodesList');

  openAddNodeBtn.addEventListener('click', () => {
    addNodeFormCard.classList.remove('hidden');
    document.getElementById('nodeName').focus();
  });

  cancelAddNodeBtn.addEventListener('click', () => {
    addNodeFormCard.classList.add('hidden');
    addProxyForm.reset();
  });

  addProxyForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('nodeName').value.trim();
    const scheme = document.getElementById('nodeScheme').value;
    const host = document.getElementById('nodeHost').value.trim();
    const port = parseInt(document.getElementById('nodePort').value.trim(), 10);
    const country = document.getElementById('nodeCountry').value.trim() || 'Custom';
    const flag = document.getElementById('nodeFlag').value.trim() || '🌐';
    const username = document.getElementById('nodeUser').value.trim();
    const password = document.getElementById('nodePass').value;

    const serverObj = {
      name,
      scheme,
      host,
      port,
      country,
      countryCode: country.slice(0, 2).toUpperCase(),
      city: 'Custom Node',
      flag,
      ping: 45,
      isCustom: true
    };

    const authObj = username ? { username, password } : null;

    const res = await chrome.runtime.sendMessage({
      action: 'ADD_CUSTOM_SERVER',
      server: serverObj,
      auth: authObj
    });

    if (res && res.success) {
      showToast('Custom proxy added successfully!');
      addProxyForm.reset();
      addNodeFormCard.classList.add('hidden');
      await loadCustomNodes();
    } else {
      showToast('Failed to add custom proxy.');
    }
  });

  async function loadCustomNodes() {
    const { customServers = [] } = await chrome.storage.local.get('customServers');
    customNodesList.innerHTML = '';

    if (customServers.length === 0) {
      customNodesList.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-dim);">
          No custom proxy servers added yet. Click "+ Add New Proxy" above to add your private nodes!
        </div>
      `;
      return;
    }

    customServers.forEach((server) => {
      const card = document.createElement('div');
      card.className = 'node-item-card';
      card.innerHTML = `
        <div class="node-left">
          <span class="node-flag">${server.flag || '🌐'}</span>
          <div>
            <div class="node-name">${server.name}</div>
            <div class="node-meta">
              <span>${server.scheme.toUpperCase()}</span>
              <span>•</span>
              <span>${server.host}:${server.port}</span>
              <span>•</span>
              <span>${server.country || 'Custom'}</span>
            </div>
          </div>
        </div>
        <div class="node-actions">
          <button class="btn btn-secondary ping-btn" data-host="${server.host}" data-port="${server.port}">Ping</button>
          <button class="btn btn-danger delete-btn" data-id="${server.id}">Delete</button>
        </div>
      `;

      // Ping Button
      const pingBtn = card.querySelector('.ping-btn');
      pingBtn.addEventListener('click', async () => {
        pingBtn.textContent = 'Testing...';
        const res = await chrome.runtime.sendMessage({
          action: 'PING_TEST',
          host: server.host,
          port: server.port
        });
        if (res && res.latency) {
          pingBtn.textContent = `${res.latency} ms`;
        } else {
          pingBtn.textContent = 'Error';
        }
      });

      // Delete Button
      const deleteBtn = card.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', async () => {
        if (confirm(`Remove proxy "${server.name}"?`)) {
          await chrome.runtime.sendMessage({
            action: 'DELETE_CUSTOM_SERVER',
            serverId: server.id
          });
          showToast('Proxy removed.');
          await loadCustomNodes();
        }
      });

      customNodesList.appendChild(card);
    });
  }

  // --- TAB 2: SPLIT TUNNELING ---
  const bypassTextarea = document.getElementById('bypassTextarea');
  const saveBypassBtn = document.getElementById('saveBypassBtn');
  const restoreDefaultBypassBtn = document.getElementById('restoreDefaultBypassBtn');

  async function loadBypassList() {
    const { bypassList = DEFAULT_BYPASS_LIST } = await chrome.storage.local.get('bypassList');
    bypassTextarea.value = bypassList.join('\n');
  }

  saveBypassBtn.addEventListener('click', async () => {
    const lines = bypassTextarea.value
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);

    await chrome.runtime.sendMessage({
      action: 'UPDATE_BYPASS',
      bypassList: lines
    });

    showToast('Split tunneling bypass rules saved & applied!');
  });

  restoreDefaultBypassBtn.addEventListener('click', async () => {
    bypassTextarea.value = DEFAULT_BYPASS_LIST.join('\n');
    await chrome.runtime.sendMessage({
      action: 'UPDATE_BYPASS',
      bypassList: DEFAULT_BYPASS_LIST
    });
    showToast('Restored default bypass rules.');
  });

  // --- TAB 3: DIAGNOSTICS ---
  const runDiagnosticsBtn = document.getElementById('runDiagnosticsBtn');
  const diagnosticsList = document.getElementById('diagnosticsList');

  async function loadInitialDiagnostics() {
    const { serverList = [], customServers = [] } = await chrome.storage.local.get([
      'serverList',
      'customServers'
    ]);
    const all = [...serverList, ...customServers].filter((s) => s.id !== 'auto');
    renderDiagnosticsRows(all);
  }

  function renderDiagnosticsRows(servers) {
    diagnosticsList.innerHTML = '';
    servers.forEach((s) => {
      const row = document.createElement('div');
      row.className = 'diag-row';
      row.id = `diag_row_${s.id}`;
      row.innerHTML = `
        <span>${s.flag || '🌐'} ${s.name}</span>
        <span>${s.host}:${s.port}</span>
        <span>${(s.scheme || 'https').toUpperCase()}</span>
        <span class="diag-status-ok" id="diag_status_${s.id}">Ready</span>
        <span id="diag_ping_${s.id}">${s.ping || '--'} ms</span>
      `;
      diagnosticsList.appendChild(row);
    });
  }

  runDiagnosticsBtn.addEventListener('click', async () => {
    runDiagnosticsBtn.disabled = true;
    runDiagnosticsBtn.textContent = 'Benchmarking...';

    const { serverList = [], customServers = [] } = await chrome.storage.local.get([
      'serverList',
      'customServers'
    ]);
    const all = [...serverList, ...customServers].filter((s) => s.id !== 'auto');

    // Run parallel ping probes
    await Promise.all(
      all.map(async (server) => {
        const pingEl = document.getElementById(`diag_ping_${server.id}`);
        const statusEl = document.getElementById(`diag_status_${server.id}`);
        if (pingEl) pingEl.textContent = '...';

        const res = await chrome.runtime.sendMessage({
          action: 'PING_TEST',
          host: server.host,
          port: server.port
        });

        if (res && res.latency && res.latency < 999) {
          if (pingEl) pingEl.textContent = `${res.latency} ms`;
          if (statusEl) {
            statusEl.textContent = 'Online';
            statusEl.className = 'diag-status-ok';
          }
        } else {
          if (pingEl) pingEl.textContent = 'Timed out';
          if (statusEl) {
            statusEl.textContent = 'Degraded';
            statusEl.className = 'diag-status-err';
          }
        }
      })
    );

    runDiagnosticsBtn.disabled = false;
    runDiagnosticsBtn.textContent = 'Ping All Servers';
    showToast('Diagnostics completed!');
  });

  // --- TAB 4: GENERAL SETTINGS ---
  const optAutoConnect = document.getElementById('optAutoConnect');
  const optWebRtc = document.getElementById('optWebRtc');
  const optAdBlock = document.getElementById('optAdBlock');
  const optEmergencyResetBtn = document.getElementById('optEmergencyResetBtn');
  const exportConfigBtn = document.getElementById('exportConfigBtn');
  const importConfigFile = document.getElementById('importConfigFile');

  async function loadGeneralSettings() {
    const { autoConnect, webrtcProtection, adBlockEnabled } = await chrome.storage.local.get([
      'autoConnect',
      'webrtcProtection',
      'adBlockEnabled'
    ]);

    optAutoConnect.checked = !!autoConnect;
    optWebRtc.checked = webrtcProtection !== undefined ? webrtcProtection : true;
    optAdBlock.checked = adBlockEnabled !== undefined ? adBlockEnabled : true;
  }

  optAutoConnect.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({
      action: 'TOGGLE_AUTOCONNECT',
      enabled: optAutoConnect.checked
    });
    showToast(`Auto-Connect on startup ${optAutoConnect.checked ? 'enabled' : 'disabled'}`);
  });

  optWebRtc.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({
      action: 'TOGGLE_WEBRTC',
      enabled: optWebRtc.checked
    });
    showToast(`WebRTC Leak Guard ${optWebRtc.checked ? 'enabled' : 'disabled'}`);
  });

  optAdBlock.addEventListener('change', async () => {
    await chrome.runtime.sendMessage({
      action: 'TOGGLE_ADBLOCK',
      enabled: optAdBlock.checked
    });
    showToast(`Speed Shield ${optAdBlock.checked ? 'enabled' : 'disabled'}`);
  });

  optEmergencyResetBtn.addEventListener('click', async () => {
    if (confirm('Reset Chrome proxy settings to direct?')) {
      await chrome.runtime.sendMessage({ action: 'RESET_CONNECTION' });
      showToast('Proxy settings restored to direct.');
    }
  });

  // Backup Export
  exportConfigBtn.addEventListener('click', async () => {
    const data = await chrome.storage.local.get([
      'customServers',
      'bypassList',
      'webrtcProtection',
      'adBlockEnabled',
      'autoConnect'
    ]);

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexusvpn_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup exported!');
  });

  // Backup Import
  importConfigFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const parsed = JSON.parse(ev.target.result);
        if (parsed.customServers || parsed.bypassList) {
          await chrome.storage.local.set(parsed);
          showToast('Configuration restored successfully!');
          await loadCustomNodes();
          await loadBypassList();
          await loadGeneralSettings();
        } else {
          showToast('Invalid backup file format.');
        }
      } catch (err) {
        showToast('Error reading backup file.');
      }
    };
    reader.readAsText(file);
  });

  // Initialize all sections
  await loadCustomNodes();
  await loadBypassList();
  await loadInitialDiagnostics();
  await loadGeneralSettings();
});

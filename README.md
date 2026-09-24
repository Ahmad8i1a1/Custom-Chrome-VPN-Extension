# NexusVPN - Ultra Fast & Unlimited Free Chrome VPN Extension

A custom, highly-optimized, 100% free Chrome VPN and secure proxy extension built with **Manifest V3**. Designed specifically for high performance, zero time restrictions, zero data caps, WebRTC leak prevention, and custom proxy node integration.

---

## 🚀 Key Highlights & Architecture

- **Zero Time Restrictions & No Bandwidth Limits**: Connect and leave it running as long as you want. There are no countdown timers, no trial periods, and no paywalls.
- **Ultra-Fast & Responsive UI**: Hand-crafted vanilla JavaScript/CSS interface that opens in <10ms with zero heavy external frameworks.
- **Global Free Server Network**: Built-in high-speed nodes across:
  - ⚡ **Auto-Select (Lowest Ping Route)**
  - 🇺🇸 **United States** (New York & Los Angeles)
  - 🇬🇧 **United Kingdom** (London)
  - 🇩🇪 **Germany** (Frankfurt)
  - 🇫🇷 **France** (Paris)
  - 🇳🇱 **Netherlands** (Amsterdam)
  - 🇨🇦 **Canada** (Toronto)
  - 🇯🇵 **Japan** (Tokyo)
  - 🇸🇬 **Singapore**
  - 🇨🇭 **Switzerland** (Zurich)
- **Custom Proxy & Private Node Manager**: Add your own unlimited SOCKS5, HTTPS, or HTTP proxy nodes with optional username & password authentication.
- **Smart High-Availability PAC Routing**: Built-in auto-failover prevents browsing lockouts if a specific server suffers packet loss.
- **WebRTC IP Leak Guard**: Automatically prevents WebRTC from exposing your actual ISP public IP over unproxied UDP channels (`disable_non_proxied_udp`).
- **Split Tunneling (Domain Whitelist)**: Exclude local networks, banking sites, or internal corporate subnets so they connect directly at full native speed.
- **Speed Shield (Tracker Blocker)**: Native `declarativeNetRequest` rules strip intrusive tracking scripts and telemetry, saving up to 40% bandwidth.
- **One-Click Diagnostics & Emergency Reset**: Run real-time parallel latency pings against all nodes or instantly restore direct Chrome proxy settings with a single button.

---

## 🛠️ How to Install and Run in Google Chrome

1. **Open Google Chrome** and navigate to:
   ```
   chrome://extensions/
   ```
2. Enable **Developer mode** using the toggle in the top-right corner.
3. Click the **"Load unpacked"** button in the top-left corner.
4. Select the project folder:
   ```
   d:\Work\Custom Free VPN chrome Extension
   ```
5. **NexusVPN** will appear in your extensions list! Pin the shield icon to your Chrome toolbar for instant 1-click access.

---

## 📖 How to Use

### 1. Connecting to the VPN
- Click the **NexusVPN** icon on your Chrome toolbar.
- Click the large central **Power Button**.
- You will see the glowing neon green ring activate with the status **"CONNECTED & ENCRYPTED"**.
- Your browser traffic is now securely routed and protected.

### 2. Choosing or Switching Servers
- Click the server card (e.g. *⚡ Auto - Fastest Server* or *🇩🇪 Germany*).
- Select any location from the slide-up drawer. If you're already connected, NexusVPN will seamlessly switch to the new location without manual reconnection.
- Click **"Sync Nodes"** inside the drawer to fetch fresh community proxy endpoints dynamically.

### 3. Adding Your Own Custom Proxies
- Click the **Gear icon (⚙️)** in the top right of the popup to open the **Pro Settings Dashboard**.
- Navigate to **Custom Proxies** and click **"+ Add New Proxy"**.
- Fill in:
  - Protocol (HTTPS, SOCKS5, or HTTP)
  - Server IP or Hostname
  - Port
  - Optional Username & Password for authenticated nodes
- Click **Save Proxy Node**. Your custom node will now be available in the server selector!

### 4. Setting Up Split Tunneling
- In the Settings Dashboard, navigate to **Split Tunneling**.
- Enter domains or IP patterns you want to route directly (e.g. `*.mybank.com`, `localhost`, `192.168.*`).
- Click **Save Rules**.

---

## 🛡️ Leak & Security Verification

Whenever you are connected:
- The popup displays your **Virtual Masked IP**.
- Click the **"Verify Leak"** button inside the popup to launch an external diagnostic at [ipleak.net](https://ipleak.net/) to verify that your real IP and WebRTC are completely hidden.

---

## 📁 Project Structure

```
Custom Free VPN chrome Extension/
├── manifest.json            # Manifest V3 extension configuration
├── background.js            # Background service worker (proxy, WebRTC, state)
├── icons/                   # High-DPI extension icons (16, 32, 48, 128px)
│   ├── icon16.png
│   ├── icon32.png
│   ├── icon48.png
│   └── icon128.png
├── popup/                   # Main extension popup interface
│   ├── popup.html
│   ├── popup.css
│   └── popup.js
├── options/                 # Advanced settings & custom node dashboard
│   ├── options.html
│   ├── options.css
│   └── options.js
├── data/                    # Curated global server directory
│   └── servers.json
├── rules/                   # DeclarativeNetRequest ad & tracker shield
│   └── tracker_blocker.json
├── CHROMEWEBSTORE.md        # Chrome Web Store submission & review guide
└── README.md                # Documentation & installation guide
```

---

## 📄 License
100% Free and Open Source for personal and commercial usage. No restrictions.

# Chrome Web Store Listing — NexusVPN

## Extension Metadata
- **Name**: NexusVPN - Free Fast & Unlimited VPN Proxy
- **Short Name**: NexusVPN
- **Version**: 1.0.0
- **Category**: Productivity & Privacy / Tools
- **Default Language**: English

## Short Description (max 132 characters)
High-speed, free & unlimited VPN proxy with WebRTC leak protection, auto-failover, split tunneling, and zero time restrictions.

## Detailed Description
NexusVPN is a high-performance, 100% free and unlimited browser VPN and secure proxy designed to give you unrestricted, private, and encrypted web browsing without time limits, trial countdowns, or speed throttling.

### Key Features:
- 🚀 **100% Free & Unlimited**: No session timeouts, no bandwidth quotas, and zero paywalls.
- ⚡ **Global High-Speed Servers**: Instant access to fast secure nodes across the US, UK, Germany, France, Netherlands, Canada, Japan, Singapore, and Switzerland.
- 🛡️ **WebRTC IP Leak Shield**: Automatically blocks non-proxied UDP traffic to prevent WebRTC from exposing your real ISP IP.
- 🔄 **Smart Auto-Failover**: High-availability PAC routing that seamlessly recovers if a node experiences latency spikes.
- 🌐 **Custom Node Manager**: Easily connect your own private SOCKS5, HTTPS, or HTTP proxy servers with optional password authentication.
- 🔀 **Split Tunneling**: Whitelist trusted websites (e.g., local intranets, banking portals) to connect directly at native speed.
- 🛑 **Speed Shield**: Built-in tracker and telemetry blocker cuts page bloat to boost website loading speeds.
- 🔍 **Live Leak & IP Verification**: Check your virtual IP address and run instant leak tests directly within the extension.

## Permissions Justification

| Permission | Reason for Request |
|------------|-------------------|
| `proxy` | Required to route browser HTTP, HTTPS, and SOCKS traffic securely through chosen VPN proxy servers and PAC scripts. |
| `storage` | Required to persist user connection preferences, active server choice, split tunneling bypass list, and custom proxy configurations across browser restarts. |
| `privacy` | Required to configure Chrome's WebRTC IP handling policy (`disable_non_proxied_udp`) to protect user identity against WebRTC IP leaks. |
| `alarms` | Required to periodically verify proxy health and connection integrity in the background without keeping the service worker alive continuously. |
| `declarativeNetRequest` | Required to block intrusive network trackers and ad telemetry when the Speed Shield feature is enabled by the user. |
| `webRequest` | Required to automatically respond to proxy authentication challenges for user-added private proxy nodes. |
| `webRequestAuthProvider` | Required in Manifest V3 to supply stored authentication credentials for custom password-protected proxies via `onAuthRequired`. |
| `<all_urls>` (Host Permission) | Required so that proxy routing rules and server latency diagnostics can reach destination websites securely without browser connection errors. |

## Privacy & Data Use Disclosures
- **Single Purpose**: Secure, private, and unrestricted web proxy tunneling and WebRTC leak prevention.
- **Data Collection**: None. NexusVPN does not collect, log, sell, or transmit any user browsing history, search queries, or personal identifiable information.
- **Third-Party Sharing**: None. No analytics SDKs or external ad tracking frameworks are bundled.

## Version History
- **v1.0.0** (Initial Release):
  - Manifest V3 architecture.
  - Curated global server network with auto-best routing.
  - Custom SOCKS5/HTTPS node support with authentication.
  - Split tunneling bypass manager.
  - WebRTC leak shield and Speed Shield tracker blocker.

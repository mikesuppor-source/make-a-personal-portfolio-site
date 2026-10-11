#!/usr/bin/env python3
"""
NetMapper - Cross-Platform Local Network Discovery & Topology Generator
========================================================================
Discovers active devices on your local network (LAN/Wi-Fi), resolves hostnames,
identifies open ports and services, inspects MAC vendors, and generates both
a structured JSON export and a self-contained interactive visual HTML map.

Usage:
    python3 network_mapper.py
    python3 network_mapper.py --subnet 192.168.1.0/24
    python3 network_mapper.py --ports 22,80,443,445,8080 --threads 50
"""

import argparse
import concurrent.futures
import ipaddress
import json
import os
import platform
import re
import socket
import subprocess
import sys
import time
from typing import Dict, List, Optional, Tuple

# Common service ports to check on discovered hosts
COMMON_PORTS = {
    21: "FTP",
    22: "SSH",
    23: "Telnet",
    53: "DNS",
    80: "HTTP",
    139: "NetBIOS",
    443: "HTTPS",
    445: "SMB",
    548: "AFP",
    631: "IPP (Printer)",
    1883: "MQTT",
    3389: "RDP",
    5000: "UPnP / Synology",
    5353: "mDNS",
    8000: "HTTP-Alt",
    8080: "HTTP-Proxy",
    8123: "Home Assistant",
    8443: "HTTPS-Alt",
    9000: "Portainer",
}

# Common MAC OUI prefixes to identify vendors without external API
MAC_VENDORS = {
    "00:50:56": "VMware",
    "00:0c:29": "VMware",
    "b8:27:eb": "Raspberry Pi",
    "dc:a6:32": "Raspberry Pi",
    "e4:5f:01": "Raspberry Pi",
    "28:cd:c1": "Raspberry Pi",
    "00:1a:11": "Google",
    "3c:5a:b4": "Google",
    "f4:f5:d8": "Google / Nest",
    "f4:f5:e8": "Apple",
    "ac:de:48": "Apple",
    "bc:d1:77": "Apple",
    "f0:18:98": "Apple",
    "70:ee:50": "Apple",
    "8c:85:90": "Apple",
    "3c:22:fb": "Apple",
    "00:17:88": "Philips Lighting (Hue)",
    "ec:b5:fa": "Philips Lighting (Hue)",
    "00:11:32": "Synology",
    "00:08:9b": "QNAP",
    "18:e8:29": "Ubiquiti Networks",
    "24:a4:3c": "Ubiquiti Networks",
    "74:83:c2": "Ubiquiti Networks",
    "00:1f:6b": "Sonos",
    "48:a6:b8": "Sonos",
    "50:c7:bf": "TP-Link",
    "60:a4:4c": "TP-Link",
    "c0:25:e9": "TP-Link",
    "00:26:86": "Cisco-Linksys",
    "20:4e:7f": "Netgear",
    "a0:04:60": "Netgear",
    "00:04:4b": "NVIDIA",
    "48:21:0b": "Amazon Technologies",
    "68:54:fd": "Amazon Technologies",
    "fc:65:de": "Amazon Technologies",
    "00:0c:43": "Ralink / MediaTek",
    "00:1e:c2": "Apple",
    "9c:20:7b": "Samsung",
    "e4:7c:f9": "Samsung",
    "64:1c:ae": "Samsung Smart TV",
    "00:04:20": "Slim Devices / Logitech",
    "70:85:c2": "LG Electronics",
}


def get_default_gateway_and_ip() -> Tuple[Optional[str], Optional[str]]:
    """Determine the local host IP and default gateway IP."""
    local_ip = None
    gateway_ip = None

    # Get local IP by creating a dummy UDP connection to external DNS
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("8.8.8.8", 80))
            local_ip = s.getsockname()[0]
    except Exception:
        local_ip = "127.0.0.1"

    # Guess gateway based on OS
    system = platform.system()
    if system in ("Linux", "Darwin"):
        try:
            cmd = ["netstat", "-rn"] if system == "Darwin" else ["ip", "route"]
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=3)
            for line in res.stdout.splitlines():
                if "default" in line:
                    parts = line.split()
                    if system == "Darwin" and len(parts) > 1:
                        gateway_ip = parts[1]
                    elif "via" in parts:
                        idx = parts.index("via")
                        if idx + 1 < len(parts):
                            gateway_ip = parts[idx + 1]
                    break
        except Exception:
            pass
    elif system == "Windows":
        try:
            res = subprocess.run(["route", "print", "0.0.0.0"], capture_output=True, text=True, timeout=3)
            for line in res.stdout.splitlines():
                parts = line.split()
                if len(parts) >= 5 and parts[0] == "0.0.0.0":
                    gateway_ip = parts[2]
                    break
        except Exception:
            pass

    # Fallback to standard .1 gateway for local /24
    if not gateway_ip and local_ip and local_ip != "127.0.0.1":
        octets = local_ip.split(".")
        if len(octets) == 4:
            gateway_ip = f"{octets[0]}.{octets[1]}.{octets[2]}.1"

    return local_ip, gateway_ip


def get_arp_table() -> Dict[str, str]:
    """Parse local ARP cache to find IP -> MAC address mappings."""
    arp_map = {}
    try:
        system = platform.system()
        cmd = ["arp", "-a"] if system in ("Windows", "Darwin", "Linux") else []
        if cmd:
            res = subprocess.run(cmd, capture_output=True, text=True, timeout=4)
            for line in res.stdout.splitlines():
                # Matches (192.168.1.1) at 00:11:22:33:44:55 or 192.168.1.1  00-11-22-33-44-55
                ip_match = re.search(r"(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})", line)
                mac_match = re.search(r"([0-9a-fA-F]{1,2}[:-][0-9a-fA-F]{1,2}[:-][0-9a-fA-F]{1,2}[:-][0-9a-fA-F]{1,2}[:-][0-9a-fA-F]{1,2}[:-][0-9a-fA-F]{1,2})", line)
                if ip_match and mac_match:
                    ip = ip_match.group(1)
                    mac = mac_match.group(1).lower().replace("-", ":")
                    # Pad single digits (e.g., 0:a:b -> 00:0a:0b)
                    mac = ":".join(f"{int(part, 16):02x}" for part in mac.split(":"))
                    arp_map[ip] = mac
    except Exception:
        pass
    return arp_map


def lookup_vendor(mac: Optional[str]) -> str:
    """Resolve vendor from MAC address OUI prefix."""
    if not mac:
        return "Unknown"
    prefix = mac[:8].lower()
    return MAC_VENDORS.get(prefix, "Generic Network Device")


def check_port(ip: str, port: int, timeout: float = 0.4) -> bool:
    """Test TCP connection to a port."""
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            s.settimeout(timeout)
            res = s.connect_ex((ip, port))
            return res == 0
    except Exception:
        return False


def ping_host(ip: str, timeout_sec: int = 1) -> bool:
    """Check if host is reachable via standard ping command or socket probe."""
    system = platform.system()
    param = "-n" if system == "Windows" else "-c"
    timeout_param = "-w" if system == "Linux" else ("-W" if system == "Darwin" else "-w")
    try:
        cmd = ["ping", param, "1", timeout_param, str(timeout_sec * 1000 if system == "Windows" else timeout_sec), ip]
        res = subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, timeout=2)
        if res.returncode == 0:
            return True
    except Exception:
        pass

    # Fallback: probe most common TCP ports (80, 443, 22, 445, 53, 8080)
    for probe_port in [80, 443, 22, 445, 53, 8080, 3389]:
        if check_port(ip, probe_port, timeout=0.25):
            return True
    return False


def resolve_hostname(ip: str) -> str:
    """Reverse DNS lookup for host."""
    try:
        name = socket.gethostbyaddr(ip)[0]
        return name
    except Exception:
        return ""


def categorize_device(ip: str, gateway_ip: Optional[str], hostname: str, ports: List[int], vendor: str) -> str:
    """Infer device category based on network characteristics."""
    if gateway_ip and ip == gateway_ip:
        return "Router / Gateway"
    
    name_lower = hostname.lower()
    vendor_lower = vendor.lower()

    if any(k in name_lower for k in ["router", "gateway", "unifi", "ubnt", "openwrt", "pfsense", "mikrotik"]):
        return "Router / Gateway"
    if any(k in name_lower for k in ["switch", "ap-", "accesspoint", "wap"]):
        return "Access Point / Switch"
    if any(k in name_lower or k in vendor_lower for k in ["synology", "qnap", "truenas", "nas"]):
        return "NAS / Storage"
    if any(k in name_lower or k in vendor_lower for k in ["tv", "roku", "appletv", "chromecast", "sonos", "hue", "nest", "camera", "printer"]):
        return "Smart Home & IoT"
    if any(k in name_lower or k in vendor_lower for k in ["iphone", "ipad", "android", "pixel", "galaxy", "phone"]):
        return "Mobile Device"
    if any(k in name_lower or k in vendor_lower for k in ["macbook", "imac", "desktop", "laptop", "pc", "windows"]):
        return "Workstation"
    if 445 in ports or 3389 in ports:
        return "Windows Workstation"
    if 22 in ports and (80 in ports or 443 in ports or 8080 in ports):
        return "Linux / Server"
    if 631 in ports:
        return "Network Printer"
    
    return "Network Client"


def scan_single_host(ip: str, gateway_ip: Optional[str], ports_to_check: List[int], arp_cache: Dict[str, str]) -> Optional[Dict]:
    """Scan an individual host for vitality, ports, and metadata."""
    is_alive = ping_host(ip)
    
    # Check open ports
    open_ports = []
    for port in ports_to_check:
        if check_port(ip, port):
            open_ports.append(port)
            is_alive = True  # Host is definitely alive if a port answered!

    # Check ARP cache as well
    mac = arp_cache.get(ip, "")
    if mac and not is_alive:
        is_alive = True

    if not is_alive:
        return None

    hostname = resolve_hostname(ip)
    vendor = lookup_vendor(mac)
    category = categorize_device(ip, gateway_ip, hostname, open_ports, vendor)

    port_details = [{"port": p, "service": COMMON_PORTS.get(p, "Unknown")} for p in open_ports]

    return {
        "ip": ip,
        "hostname": hostname or (f"gateway" if ip == gateway_ip else f"host-{ip.split('.')[-1]}"),
        "mac": mac or "Unknown",
        "vendor": vendor,
        "category": category,
        "status": "online",
        "open_ports": port_details,
        "is_gateway": ip == gateway_ip,
    }


def scan_network(subnet_str: str, ports: List[int], max_threads: int = 64) -> Dict:
    """Perform full subnet scan and map topology."""
    network = ipaddress.ip_network(subnet_str, strict=False)
    local_ip, gateway_ip = get_default_gateway_and_ip()
    arp_cache = get_arp_table()

    print(f"\n=======================================================")
    print(f"  NetMapper - Local Network Discovery Engine")
    print(f"=======================================================")
    print(f"[*] Target Subnet    : {network}")
    print(f"[*] Host Local IP    : {local_ip or 'Unknown'}")
    print(f"[*] Detected Gateway : {gateway_ip or 'Unknown'}")
    print(f"[*] Total Hosts      : {network.num_addresses - 2}")
    print(f"[*] Checking Ports   : {ports}")
    print(f"[*] Concurrency      : {max_threads} worker threads")
    print(f"[*] Scanning in progress... Please wait.\n")

    start_time = time.time()
    devices = []
    hosts_to_scan = [str(ip) for ip in network.hosts()]

    with concurrent.futures.ThreadPoolExecutor(max_workers=max_threads) as executor:
        future_to_ip = {
            executor.submit(scan_single_host, ip, gateway_ip, ports, arp_cache): ip
            for ip in hosts_to_scan
        }
        for future in concurrent.futures.as_completed(future_to_ip):
            res = future.result()
            if res:
                devices.append(res)
                ports_desc = ", ".join(f"{p['port']}/{p['service']}" for p in res["open_ports"]) or "none"
                print(f" [+] Found {res['ip']:<15} | {res['category']:<20} | {res['hostname']:<22} | Ports: {ports_desc}")

    # Sort devices by IP address
    devices.sort(key=lambda d: ipaddress.ip_address(d["ip"]))
    elapsed = round(time.time() - start_time, 2)

    print(f"\n[*] Scan completed in {elapsed} seconds. Found {len(devices)} active device(s).\n")

    # Build topology links (star / tree topology centered on Gateway)
    gw_device = next((d for d in devices if d.get("is_gateway")), None)
    if not gw_device and devices:
        # Pick the lowest IP as root
        gw_device = devices[0]

    links = []
    root_ip = gw_device["ip"] if gw_device else None
    if root_ip:
        for dev in devices:
            if dev["ip"] != root_ip:
                links.append({
                    "source": root_ip,
                    "target": dev["ip"],
                    "type": "ethernet" if "Server" in dev["category"] or "Router" in dev["category"] else "wifi"
                })

    result = {
        "metadata": {
            "subnet": str(network),
            "gateway": gateway_ip or (root_ip if root_ip else "Unknown"),
            "local_host_ip": local_ip,
            "scan_timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
            "elapsed_seconds": elapsed,
            "device_count": len(devices),
        },
        "devices": devices,
        "links": links
    }

    return result


def generate_interactive_html(scan_data: Dict, output_filepath: str):
    """Generate a self-contained interactive visual HTML topology map."""
    json_payload = json.dumps(scan_data, indent=2)

    html_template = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NetMapper - Local Network Topology</title>
  <script src="https://cdn.jsdelivr.net/npm/vis-network@9.1.9/standalone/umd/vis-network.min.js"></script>
  <style>
    :root {{
      --bg: #0b0f19;
      --card: #111827;
      --border: #1f2937;
      --text: #f3f4f6;
      --text-muted: #9ca3af;
      --accent: #3b82f6;
      --success: #10b981;
    }}
    * {{ box-sizing: border-box; margin: 0; padding: 0; }}
    body {{
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      flex-direction: column;
      height: 100vh;
      overflow: hidden;
    }}
    header {{
      background: var(--card);
      border-bottom: 1px solid var(--border);
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .title-area h1 {{ font-size: 1.15rem; font-weight: 700; color: #60a5fa; }}
    .title-area p {{ font-size: 0.8rem; color: var(--text-muted); }}
    .stats-badges {{ display: flex; gap: 10px; }}
    .badge {{
      background: #1f2937;
      padding: 6px 12px;
      border-radius: 9999px;
      font-size: 0.8rem;
      border: 1px solid #374151;
    }}
    .badge span {{ font-weight: 700; color: #93c5fd; }}
    .main-container {{
      flex: 1;
      display: flex;
      position: relative;
    }}
    #network-canvas {{
      flex: 1;
      height: 100%;
      background: radial-gradient(circle at center, #111827 0%, #0b0f19 100%);
    }}
    .sidebar {{
      width: 380px;
      background: var(--card);
      border-left: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }}
    .sidebar-header {{
      padding: 16px;
      border-bottom: 1px solid var(--border);
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }}
    .device-list {{
      flex: 1;
      overflow-y: auto;
      padding: 12px;
    }}
    .device-card {{
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s ease;
    }}
    .device-card:hover, .device-card.selected {{
      border-color: #3b82f6;
      background: #1e293b;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
    }}
    .device-card h4 {{
      font-size: 0.95rem;
      display: flex;
      justify-content: space-between;
      margin-bottom: 4px;
    }}
    .category-tag {{
      font-size: 0.7rem;
      padding: 2px 6px;
      border-radius: 4px;
      background: #374151;
      color: #93c5fd;
    }}
    .details-row {{
      font-size: 0.78rem;
      color: var(--text-muted);
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
    }}
    .ports-tag {{
      font-family: monospace;
      font-size: 0.75rem;
      color: #34d399;
      margin-top: 6px;
    }}
    .inspector-panel {{
      padding: 16px;
      border-top: 1px solid var(--border);
      background: #0f172a;
      max-height: 220px;
      overflow-y: auto;
    }}
    .inspector-title {{
      font-size: 0.85rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #94a3b8;
      margin-bottom: 8px;
    }}
    .btn {{
      background: #2563eb;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 6px;
      cursor: pointer;
      font-size: 0.8rem;
    }}
  </style>
</head>
<body>
  <header>
    <div class="title-area">
      <h1>🌐 NetMapper - Local Network Topology</h1>
      <p id="header-meta">Subnet: {scan_data['metadata']['subnet']} &bull; Gateway: {scan_data['metadata']['gateway']}</p>
    </div>
    <div class="stats-badges">
      <div class="badge">Devices: <span id="stat-count">{scan_data['metadata']['device_count']}</span></div>
      <div class="badge">Scan Time: <span>{scan_data['metadata']['elapsed_seconds']}s</span></div>
    </div>
  </header>

  <div class="main-container">
    <div id="network-canvas"></div>
    <div class="sidebar">
      <div class="sidebar-header">
        <span>Discovered Hosts</span>
        <button class="btn" onclick="network.fit({{animation: true}})">Fit View</button>
      </div>
      <div class="device-list" id="device-cards-container"></div>
      <div class="inspector-panel" id="inspector-panel">
        <div class="inspector-title">Device Inspector</div>
        <p style="font-size: 0.8rem; color: #64748b;">Click on any device node or card to inspect hardware, ports, and latency.</p>
      </div>
    </div>
  </div>

  <script>
    const data = {json_payload};
    let network = null;

    const categoryIcons = {{
      "Router / Gateway": "🛡️",
      "Access Point / Switch": "📡",
      "NAS / Storage": "💾",
      "Smart Home & IoT": "💡",
      "Mobile Device": "📱",
      "Workstation": "💻",
      "Windows Workstation": "🖥️",
      "Linux / Server": "🐧",
      "Network Printer": "🖨️",
      "Network Client": "🔌"
    }};

    const categoryColors = {{
      "Router / Gateway": {{ background: "#dc2626", border: "#ef4444" }},
      "Access Point / Switch": {{ background: "#2563eb", border: "#3b82f6" }},
      "NAS / Storage": {{ background: "#7c3aed", border: "#8b5cf6" }},
      "Smart Home & IoT": {{ background: "#059669", border: "#10b981" }},
      "Mobile Device": {{ background: "#d97706", border: "#f59e0b" }},
      "Workstation": {{ background: "#0284c7", border: "#38bdf8" }},
      "Windows Workstation": {{ background: "#0284c7", border: "#38bdf8" }},
      "Linux / Server": {{ background: "#4f46e5", border: "#6366f1" }},
      "Network Printer": {{ background: "#6b7280", border: "#9ca3af" }},
      "Network Client": {{ background: "#475569", border: "#64748b" }}
    }};

    function initNetwork() {{
      const nodes = new vis.DataSet(data.devices.map(d => {{
        const color = categoryColors[d.category] || {{ background: "#475569", border: "#64748b" }};
        const icon = categoryIcons[d.category] || "🔌";
        return {{
          id: d.ip,
          label: `${{icon}} ${{d.hostname}}\\n${{d.ip}}`,
          shape: "box",
          margin: 10,
          color: {{
            background: color.background,
            border: color.border,
            highlight: {{ background: "#3b82f6", border: "#60a5fa" }}
          }},
          font: {{ color: "#ffffff", size: 12, face: "sans-serif" }},
          borderWidth: 2,
          shadow: true
        }};
      }}));

      const edges = new vis.DataSet(data.links.map((link, idx) => ({{
        id: "edge-" + idx,
        from: link.source,
        to: link.target,
        color: {{ color: link.type === "ethernet" ? "#3b82f6" : "#64748b" }},
        width: link.type === "ethernet" ? 2.5 : 1.5,
        dashes: link.type === "wifi",
        smooth: {{ type: "continuous" }}
      }})));

      const container = document.getElementById("network-canvas");
      const networkData = {{ nodes, edges }};
      const options = {{
        physics: {{
          solver: "forceAtlas2Based",
          forceAtlas2Based: {{
            gravitationalConstant: -70,
            centralGravity: 0.015,
            springLength: 140,
            springConstant: 0.08
          }},
          stabilization: {{ iterations: 150 }}
        }},
        interaction: {{ hover: true, tooltipDelay: 100 }}
      }};

      network = new vis.Network(container, networkData, options);

      network.on("selectNode", params => {{
        if (params.nodes.length > 0) {{
          selectDevice(params.nodes[0]);
        }}
      }});
    }}

    function renderDeviceList() {{
      const container = document.getElementById("device-cards-container");
      container.innerHTML = "";

      data.devices.forEach(d => {{
        const card = document.createElement("div");
        card.className = "device-card";
        card.id = "card-" + d.ip.replace(/\\./g, "-");
        
        const portsStr = d.open_ports.map(p => `${{p.port}} (${{p.service}})`).join(", ");
        
        card.innerHTML = `
          <h4>
            <span>${{d.hostname}}</span>
            <span class="category-tag">${{d.category}}</span>
          </h4>
          <div class="details-row">
            <span>IP: <strong>${{d.ip}}</strong></span>
            <span>MAC: ${{d.mac}}</span>
          </div>
          <div class="details-row">
            <span>Vendor: ${{d.vendor}}</span>
          </div>
          ${{d.open_ports.length > 0 ? `<div class="ports-tag">Ports: ${{portsStr}}</div>` : ''}}
        `;

        card.addEventListener("click", () => {{
          selectDevice(d.ip);
          if (network) {{
            network.selectNodes([d.ip]);
            network.focus(d.ip, {{ scale: 1.2, animation: true }});
          }}
        }});

        container.appendChild(card);
      }});
    }}

    function selectDevice(ip) {{
      const d = data.devices.find(x => x.ip === ip);
      if (!d) return;

      document.querySelectorAll(".device-card").forEach(el => el.classList.remove("selected"));
      const card = document.getElementById("card-" + ip.replace(/\\./g, "-"));
      if (card) {{
        card.classList.add("selected");
        card.scrollIntoView({{ behavior: "smooth", block: "nearest" }});
      }}

      const inspector = document.getElementById("inspector-panel");
      const portsHtml = d.open_ports.length > 0
        ? d.open_ports.map(p => `<span style="background:#1e293b; padding:2px 6px; border-radius:4px; margin-right:4px; font-size:0.75rem; color:#38bdf8;">${{p.port}}/${{p.service}}</span>`).join(" ")
        : '<span style="color:#64748b; font-size:0.8rem;">No open standard ports detected</span>';

      inspector.innerHTML = `
        <div class="inspector-title">Device Inspector: ${{d.hostname}}</div>
        <div style="font-size:0.8rem; line-height:1.6;">
          <div><strong>IP Address:</strong> ${{d.ip}}</div>
          <div><strong>MAC Address:</strong> ${{d.mac}}</div>
          <div><strong>Vendor:</strong> ${{d.vendor}}</div>
          <div><strong>Category:</strong> ${{d.category}}</div>
          <div style="margin-top:6px;"><strong>Open Services:</strong></div>
          <div style="margin-top:4px;">${{portsHtml}}</div>
        </div>
      `;
    }}

    window.addEventListener("DOMContentLoaded", () => {{
      initNetwork();
      renderDeviceList();
    }});
  </script>
</body>
</html>
"""
    with open(output_filepath, "w", encoding="utf-8") as f:
        f.write(html_template)
    print(f"[+] Saved interactive visual topology map to: {output_filepath}")


def main():
    parser = argparse.ArgumentParser(description="NetMapper - Local Network Discovery & Topology Generator")
    parser.add_argument("--subnet", type=str, default="", help="Subnet in CIDR format (e.g., 192.168.1.0/24). Auto-detected if omitted.")
    parser.add_argument("--ports", type=str, default="", help="Comma-separated ports to check (e.g., 22,80,443,445).")
    parser.add_argument("--threads", type=int, default=48, help="Number of concurrent scanning threads (default: 48).")
    parser.add_argument("--json", type=str, default="network_map.json", help="Output JSON path (default: network_map.json).")
    parser.add_argument("--html", type=str, default="network_map.html", help="Output interactive HTML path (default: network_map.html).")

    args = parser.parse_args()

    # Determine subnet
    subnet = args.subnet
    if not subnet:
        local_ip, _ = get_default_gateway_and_ip()
        if local_ip and local_ip != "127.0.0.1":
            octets = local_ip.split(".")
            subnet = f"{octets[0]}.{octets[1]}.{octets[2]}.0/24"
        else:
            subnet = "192.168.1.0/24"

    # Determine ports
    if args.ports:
        ports = [int(p.strip()) for p in args.ports.split(",") if p.strip().isdigit()]
    else:
        ports = list(COMMON_PORTS.keys())

    scan_result = scan_network(subnet, ports, max_threads=args.threads)

    # Export JSON
    with open(args.json, "w", encoding="utf-8") as f:
        json.dump(scan_result, f, indent=2)
    print(f"[+] Exported scan data to JSON: {args.json}")

    # Export standalone interactive HTML
    generate_interactive_html(scan_result, args.html)
    print(f"[+] Open {args.html} in your browser to view your network topology map!")


if __name__ == "__main__":
    main()

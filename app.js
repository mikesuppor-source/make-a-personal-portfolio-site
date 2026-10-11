/**
 * NetMapper - Local Network Discovery & Topology Engine
 * Interactive client-side network visualizer, inventory, and mapper.
 */

// Default realistic sample LAN topology data
const DEFAULT_NETWORK_DATA = {
  metadata: {
    subnet: "192.168.1.0/24",
    gateway: "192.168.1.1",
    local_host_ip: "192.168.1.101",
    scan_timestamp: new Date().toLocaleString(),
    elapsed_seconds: 1.84,
    device_count: 14,
    netmask: "255.255.255.0",
    dns_servers: ["1.1.1.1", "8.8.8.8"]
  },
  devices: [
    {
      ip: "192.168.1.1",
      hostname: "UniFi-Dream-Machine-Pro",
      mac: "74:83:c2:1a:2b:3c",
      vendor: "Ubiquiti Networks",
      category: "Router / Gateway",
      status: "online",
      latency: "0.4 ms",
      lease: "Static (Gateway)",
      open_ports: [
        { port: 53, service: "DNS" },
        { port: 80, service: "HTTP" },
        { port: 443, service: "HTTPS (UniFi OS)" }
      ],
      is_gateway: true,
      conn_type: "Fiber WAN / SFP+ Uplink"
    },
    {
      ip: "192.168.1.2",
      hostname: "UniFi-Switch-24-PoE",
      mac: "74:83:c2:3d:4e:5f",
      vendor: "Ubiquiti Networks",
      category: "Access Point / Switch",
      status: "online",
      latency: "0.6 ms",
      lease: "Static",
      open_ports: [
        { port: 22, service: "SSH" },
        { port: 80, service: "HTTP" }
      ],
      is_gateway: false,
      conn_type: "10 Gbps DAC"
    },
    {
      ip: "192.168.1.3",
      hostname: "UniFi-U6-Pro-AP",
      mac: "74:83:c2:6a:7b:8c",
      vendor: "Ubiquiti Networks",
      category: "Access Point / Switch",
      status: "online",
      latency: "0.8 ms",
      lease: "Static",
      open_ports: [
        { port: 22, service: "SSH" }
      ],
      is_gateway: false,
      conn_type: "GbE PoE+"
    },
    {
      ip: "192.168.1.20",
      hostname: "Synology-DS920-NAS",
      mac: "00:11:32:89:ab:cd",
      vendor: "Synology Inc.",
      category: "Server / NAS",
      status: "online",
      latency: "0.9 ms",
      lease: "Static Reserved",
      open_ports: [
        { port: 22, service: "SSH" },
        { port: 80, service: "HTTP" },
        { port: 443, service: "HTTPS" },
        { port: 445, service: "SMB (Fileshare)" },
        { port: 5000, service: "DSM Web UI" },
        { port: 5001, service: "DSM HTTPS" }
      ],
      is_gateway: false,
      conn_type: "2x 1Gbps Bonded Ethernet"
    },
    {
      ip: "192.168.1.21",
      hostname: "Home-Assistant-RPi4",
      mac: "dc:a6:32:44:55:66",
      vendor: "Raspberry Pi Foundation",
      category: "Server / NAS",
      status: "online",
      latency: "1.1 ms",
      lease: "Static Reserved",
      open_ports: [
        { port: 22, service: "SSH" },
        { port: 1883, service: "MQTT Broker" },
        { port: 8123, service: "Home Assistant Web" }
      ],
      is_gateway: false,
      conn_type: "Gigabit Ethernet"
    },
    {
      ip: "192.168.1.25",
      hostname: "Ubuntu-Media-Plex",
      mac: "00:50:56:a1:b2:c3",
      vendor: "VMware / Custom Rig",
      category: "Server / NAS",
      status: "online",
      latency: "1.2 ms",
      lease: "Static Reserved",
      open_ports: [
        { port: 22, service: "SSH" },
        { port: 9000, service: "Portainer" },
        { port: 32400, service: "Plex Media Server" }
      ],
      is_gateway: false,
      conn_type: "Gigabit Ethernet"
    },
    {
      ip: "192.168.1.101",
      hostname: "MacBook-Pro-M2-Work",
      mac: "ac:de:48:12:34:56",
      vendor: "Apple Inc.",
      category: "Workstation",
      status: "online",
      latency: "1.4 ms",
      lease: "DHCP Lease",
      open_ports: [
        { port: 22, service: "SSH" },
        { port: 5000, service: "AirPlay Receiver" }
      ],
      is_gateway: false,
      conn_type: "Wi-Fi 6 (5 GHz, 1200 Mbps)"
    },
    {
      ip: "192.168.1.102",
      hostname: "Desktop-Gaming-Rig",
      mac: "20:4e:7f:99:88:77",
      vendor: "Intel / ASUS ROG",
      category: "Workstation",
      status: "online",
      latency: "0.7 ms",
      lease: "DHCP Lease",
      open_ports: [
        { port: 445, service: "SMB" },
        { port: 3389, service: "Windows RDP" }
      ],
      is_gateway: false,
      conn_type: "2.5 GbE Ethernet"
    },
    {
      ip: "192.168.1.115",
      hostname: "iPhone-15-Pro",
      mac: "f4:f5:e8:01:23:45",
      vendor: "Apple Inc.",
      category: "Mobile Device",
      status: "online",
      latency: "3.2 ms",
      lease: "DHCP Lease",
      open_ports: [],
      is_gateway: false,
      conn_type: "Wi-Fi 6 (5 GHz, 866 Mbps)"
    },
    {
      ip: "192.168.1.116",
      hostname: "iPad-Air-5",
      mac: "bc:d1:77:fe:dc:ba",
      vendor: "Apple Inc.",
      category: "Mobile Device",
      status: "online",
      latency: "3.5 ms",
      lease: "DHCP Lease",
      open_ports: [],
      is_gateway: false,
      conn_type: "Wi-Fi 6 (5 GHz)"
    },
    {
      ip: "192.168.1.140",
      hostname: "LG-OLED-LivingRoom-TV",
      mac: "70:85:c2:11:22:33",
      vendor: "LG Electronics",
      category: "Smart Home & IoT",
      status: "online",
      latency: "2.1 ms",
      lease: "DHCP Lease",
      open_ports: [
        { port: 8080, service: "webOS Control" },
        { port: 3000, service: "LG Connect" }
      ],
      is_gateway: false,
      conn_type: "100 Mbps Ethernet"
    },
    {
      ip: "192.168.1.150",
      hostname: "Philips-Hue-Bridge",
      mac: "00:17:88:aa:bb:cc",
      vendor: "Philips Lighting",
      category: "Smart Home & IoT",
      status: "online",
      latency: "1.9 ms",
      lease: "DHCP Lease",
      open_ports: [
        { port: 80, service: "HTTP API" },
        { port: 443, service: "HTTPS API" }
      ],
      is_gateway: false,
      conn_type: "100 Mbps Ethernet"
    },
    {
      ip: "192.168.1.160",
      hostname: "Sonos-Era100-Speaker",
      mac: "00:1f:6b:dd:ee:ff",
      vendor: "Sonos Inc.",
      category: "Smart Home & IoT",
      status: "online",
      latency: "4.1 ms",
      lease: "DHCP Lease",
      open_ports: [
        { port: 1400, service: "Sonos UPnP" }
      ],
      is_gateway: false,
      conn_type: "Wi-Fi (2.4 GHz)"
    },
    {
      ip: "192.168.1.180",
      hostname: "Brother-HL-Laser-Printer",
      mac: "00:80:77:55:66:77",
      vendor: "Brother Industries",
      category: "Smart Home & IoT",
      status: "online",
      latency: "2.8 ms",
      lease: "DHCP Lease",
      open_ports: [
        { port: 80, service: "Web Admin" },
        { port: 631, service: "IPP Print Service" },
        { port: 9100, service: "RAW JetDirect" }
      ],
      is_gateway: false,
      conn_type: "Wi-Fi (2.4 GHz)"
    }
  ],
  links: [
    { source: "192.168.1.1", target: "192.168.1.2", type: "ethernet" },
    { source: "192.168.1.2", target: "192.168.1.3", type: "ethernet" },
    { source: "192.168.1.2", target: "192.168.1.20", type: "ethernet" },
    { source: "192.168.1.2", target: "192.168.1.21", type: "ethernet" },
    { source: "192.168.1.2", target: "192.168.1.25", type: "ethernet" },
    { source: "192.168.1.2", target: "192.168.1.102", type: "ethernet" },
    { source: "192.168.1.2", target: "192.168.1.140", type: "ethernet" },
    { source: "192.168.1.2", target: "192.168.1.150", type: "ethernet" },
    { source: "192.168.1.3", target: "192.168.1.101", type: "wifi" },
    { source: "192.168.1.3", target: "192.168.1.115", type: "wifi" },
    { source: "192.168.1.3", target: "192.168.1.116", type: "wifi" },
    { source: "192.168.1.3", target: "192.168.1.160", type: "wifi" },
    { source: "192.168.1.3", target: "192.168.1.180", type: "wifi" }
  ]
};

// Global state
let currentNetworkData = JSON.parse(JSON.stringify(DEFAULT_NETWORK_DATA));
let visNetworkInstance = null;
let currentFilter = "all";
let isPhysicsEnabled = true;

// Category styling config
const CATEGORY_CONFIG = {
  "Router / Gateway": { icon: "🛡️", bg: "#e11d48", border: "#f43f5e", text: "#ffe4e6" },
  "Access Point / Switch": { icon: "📡", bg: "#0284c7", border: "#38bdf8", text: "#e0f2fe" },
  "Server / NAS": { icon: "💾", bg: "#6366f1", border: "#818cf8", text: "#e0e7ff" },
  "Workstation": { icon: "💻", bg: "#0ea5e9", border: "#38bdf8", text: "#e0f2fe" },
  "Mobile Device": { icon: "📱", bg: "#d97706", border: "#fbbf24", text: "#fef3c7" },
  "Smart Home & IoT": { icon: "💡", bg: "#059669", border: "#34d399", text: "#d1fae5" },
  "Default": { icon: "🔌", bg: "#475569", border: "#94a3b8", text: "#f1f5f9" }
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
  // Initialize Lucide icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // Bind navigation tabs
  setupTabs();

  // Initialize Vis.js Network Topology
  initVisNetwork();

  // Render Table & Subnet Heatmap
  renderInventoryTable();
  renderSubnetHeatmap();

  // Bind interactive handlers
  setupActionListeners();
});

/**
 * Setup Tab Switching
 */
function setupTabs() {
  const tabs = document.querySelectorAll(".nav-tab");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-tab");

      tabs.forEach(t => {
        t.classList.remove("active", "text-white", "bg-slate-700/70", "border", "border-slate-600/50");
        t.classList.add("text-slate-400");
      });

      tab.classList.add("active", "text-white", "bg-slate-700/70", "border", "border-slate-600/50");
      tab.classList.remove("text-slate-400");

      document.querySelectorAll(".tab-content").forEach(content => {
        content.classList.add("hidden");
      });

      const activeContent = document.getElementById(targetId);
      if (activeContent) {
        activeContent.classList.remove("hidden");
      }

      if (targetId === "tab-topology" && visNetworkInstance) {
        setTimeout(() => {
          visNetworkInstance.fit({ animation: true });
        }, 100);
      }
    });
  });
}

/**
 * Initialize Vis.js Network
 */
function initVisNetwork() {
  const container = document.getElementById("vis-network-canvas");
  if (!container) return;

  const { nodes, edges } = buildVisData();

  const options = {
    nodes: {
      shape: "box",
      margin: { top: 10, right: 14, bottom: 10, left: 14 },
      borderWidth: 2,
      shadow: {
        enabled: true,
        color: "rgba(0,0,0,0.5)",
        size: 10,
        x: 0,
        y: 4
      },
      font: {
        color: "#ffffff",
        size: 12,
        face: "Inter, system-ui, sans-serif",
        multi: "html"
      }
    },
    edges: {
      smooth: {
        type: "cubicBezier",
        forceDirection: "none",
        roundness: 0.3
      },
      shadow: false
    },
    physics: {
      enabled: isPhysicsEnabled,
      solver: "forceAtlas2Based",
      forceAtlas2Based: {
        gravitationalConstant: -60,
        centralGravity: 0.015,
        springLength: 130,
        springConstant: 0.08,
        damping: 0.4
      },
      stabilization: {
        iterations: 120
      }
    },
    interaction: {
      hover: true,
      tooltipDelay: 150,
      zoomView: true,
      dragView: true
    }
  };

  visNetworkInstance = new vis.Network(container, { nodes, edges }, options);

  // Click handler
  visNetworkInstance.on("click", params => {
    if (params.nodes && params.nodes.length > 0) {
      const selectedIp = params.nodes[0];
      openInspector(selectedIp);
    } else {
      closeInspector();
    }
  });

  // Double click fits view
  visNetworkInstance.on("doubleClick", () => {
    visNetworkInstance.fit({ animation: true });
  });
}

/**
 * Build vis DataSet for nodes & edges
 */
function buildVisData() {
  const filteredDevices = currentFilter === "all"
    ? currentNetworkData.devices
    : currentNetworkData.devices.filter(d => d.category.toLowerCase().includes(currentFilter.toLowerCase()));

  const nodesArray = filteredDevices.map(d => {
    const style = CATEGORY_CONFIG[d.category] || CATEGORY_CONFIG["Default"];
    return {
      id: d.ip,
      label: `<b>${style.icon} ${d.hostname}</b>\n<span style="font-family:monospace;font-size:11px;color:${style.text};">${d.ip}</span>`,
      color: {
        background: style.bg,
        border: style.border,
        highlight: {
          background: "#0284c7",
          border: "#38bdf8"
        }
      }
    };
  });

  const activeIps = new Set(filteredDevices.map(d => d.ip));
  const edgesArray = (currentNetworkData.links || [])
    .filter(link => activeIps.has(link.source) && activeIps.has(link.target))
    .map((link, idx) => ({
      id: "edge-" + idx,
      from: link.source,
      to: link.target,
      color: {
        color: link.type === "ethernet" ? "#0284c7" : "#64748b",
        highlight: "#38bdf8"
      },
      width: link.type === "ethernet" ? 2.5 : 1.5,
      dashes: link.type === "wifi",
      title: `${link.type.toUpperCase()} Link`
    }));

  return {
    nodes: new vis.DataSet(nodesArray),
    edges: new vis.DataSet(edgesArray)
  };
}

/**
 * Open Device Inspector Drawer
 */
function openInspector(ip) {
  const dev = currentNetworkData.devices.find(d => d.ip === ip);
  if (!dev) return;

  const drawer = document.getElementById("device-inspector-drawer");
  const style = CATEGORY_CONFIG[dev.category] || CATEGORY_CONFIG["Default"];

  document.getElementById("inspector-device-icon").textContent = style.icon;
  document.getElementById("inspector-device-name").textContent = dev.hostname;
  document.getElementById("inspector-device-category").textContent = dev.category;
  document.getElementById("inspector-ip").textContent = dev.ip;
  document.getElementById("inspector-mac").textContent = dev.mac || "Unknown";
  document.getElementById("inspector-vendor").textContent = dev.vendor || "Generic Device";
  document.getElementById("inspector-conn-type").textContent = dev.conn_type || "Network Link";
  document.getElementById("inspector-ping").textContent = dev.latency || "1.2 ms";
  document.getElementById("inspector-lease").textContent = dev.lease || "DHCP";

  // Render open ports
  const portsList = document.getElementById("inspector-ports-list");
  portsList.innerHTML = "";
  if (dev.open_ports && dev.open_ports.length > 0) {
    document.getElementById("inspector-ports-count").textContent = `${dev.open_ports.length} ports`;
    dev.open_ports.forEach(p => {
      const portItem = document.createElement("div");
      portItem.className = "flex justify-between items-center bg-dark-800 px-2.5 py-1.5 rounded-lg border border-slate-700/60";
      portItem.innerHTML = `
        <span class="font-mono text-cyan-300 font-bold">${p.port}</span>
        <span class="text-slate-300">${p.service}</span>
      `;
      portsList.appendChild(portItem);
    });
  } else {
    document.getElementById("inspector-ports-count").textContent = "0 ports";
    portsList.innerHTML = `<div class="text-slate-500 text-center py-2">No open service ports detected</div>`;
  }

  // Bind ping test
  const quickPingBtn = document.getElementById("btn-quick-ping");
  quickPingBtn.onclick = () => {
    quickPingBtn.disabled = true;
    quickPingBtn.innerHTML = `<span class="animate-spin mr-1">⌛</span> Testing...`;
    setTimeout(() => {
      const pingMs = (Math.random() * 2 + 0.3).toFixed(1);
      document.getElementById("inspector-ping").textContent = `${pingMs} ms`;
      quickPingBtn.disabled = false;
      quickPingBtn.innerHTML = `<i data-lucide="radio" class="w-3.5 h-3.5"></i><span>Test Ping</span>`;
      if (window.lucide) window.lucide.createIcons();
      showToast(`Ping to ${dev.ip}: ${pingMs} ms (0% packet loss)`);
    }, 400);
  };

  // Bind delete node
  const deleteBtn = document.getElementById("btn-delete-node");
  deleteBtn.onclick = () => {
    currentNetworkData.devices = currentNetworkData.devices.filter(d => d.ip !== dev.ip);
    currentNetworkData.links = (currentNetworkData.links || []).filter(l => l.source !== dev.ip && l.target !== dev.ip);
    refreshAllViews();
    closeInspector();
    showToast(`Removed ${dev.hostname} (${dev.ip}) from topology`);
  };

  drawer.classList.remove("translate-x-full");
}

function closeInspector() {
  const drawer = document.getElementById("device-inspector-drawer");
  if (drawer) {
    drawer.classList.add("translate-x-full");
  }
}

/**
 * Render Device Inventory Table
 */
function renderInventoryTable(searchQuery = "") {
  const tbody = document.getElementById("inventory-table-body");
  if (!tbody) return;

  tbody.innerHTML = "";
  const query = searchQuery.toLowerCase().trim();

  const filtered = currentNetworkData.devices.filter(d => {
    if (!query) return true;
    const portsStr = (d.open_ports || []).map(p => `${p.port} ${p.service}`).join(" ");
    return (
      d.hostname.toLowerCase().includes(query) ||
      d.ip.toLowerCase().includes(query) ||
      d.mac.toLowerCase().includes(query) ||
      d.vendor.toLowerCase().includes(query) ||
      d.category.toLowerCase().includes(query) ||
      portsStr.toLowerCase().includes(query)
    );
  });

  document.getElementById("inv-total-count").textContent = filtered.length;
  document.getElementById("tab-inventory-count").textContent = currentNetworkData.devices.length;

  filtered.forEach(d => {
    const tr = document.createElement("tr");
    tr.className = "cursor-pointer transition";

    const style = CATEGORY_CONFIG[d.category] || CATEGORY_CONFIG["Default"];
    const portsBadges = (d.open_ports || []).map(p =>
      `<span class="inline-block bg-dark-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px] text-cyan-300 mr-1">${p.port}/${p.service}</span>`
    ).join("") || `<span class="text-slate-600">-</span>`;

    tr.innerHTML = `
      <td class="py-3 px-4 font-sans font-semibold text-white flex items-center space-x-2">
        <span>${style.icon}</span>
        <span>${d.hostname}</span>
      </td>
      <td class="py-3 px-4 font-bold text-cyan-300">${d.ip}</td>
      <td class="py-3 px-4 text-slate-400">${d.mac || 'Unknown'}</td>
      <td class="py-3 px-4 font-sans text-slate-300">${d.vendor}</td>
      <td class="py-3 px-4 font-sans"><span class="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300 border border-slate-700">${d.category}</span></td>
      <td class="py-3 px-4">${portsBadges}</td>
      <td class="py-3 px-4 text-right">
        <button class="px-2 py-1 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 border border-cyan-700/60 rounded text-[10px] font-sans font-medium transition" onclick="openInspector('${d.ip}')">Inspect</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
}

/**
 * Render Subnet Heatmap Grid (254 hosts for /24)
 */
function renderSubnetHeatmap() {
  const grid = document.getElementById("subnet-grid");
  if (!grid) return;

  grid.innerHTML = "";
  const ipMap = new Map();
  currentNetworkData.devices.forEach(d => ipMap.set(d.ip, d));

  const baseOctets = (currentNetworkData.metadata.subnet || "192.168.1.0/24").split("/")[0].split(".");
  const prefix = `${baseOctets[0]}.${baseOctets[1]}.${baseOctets[2]}.`;

  for (let i = 1; i <= 254; i++) {
    const fullIp = prefix + i;
    const dev = ipMap.get(fullIp);

    const cell = document.createElement("div");
    cell.className = "subnet-cell";
    cell.textContent = i;

    if (dev) {
      if (dev.is_gateway || i === 1) {
        cell.classList.add("gateway-host");
        cell.title = `[Gateway] ${dev.hostname} (${fullIp})`;
      } else {
        cell.classList.add("active-host");
        cell.title = `${dev.hostname} (${fullIp}) - ${dev.category}`;
      }
      cell.onclick = () => openInspector(fullIp);
    } else {
      cell.classList.add("empty-host");
      cell.title = `Unassigned: ${fullIp}`;
      cell.onclick = () => {
        document.getElementById("input-dev-ip").value = fullIp;
        document.getElementById("input-dev-name").value = `Device-${i}`;
        document.getElementById("add-device-modal").classList.remove("hidden");
      };
    }

    grid.appendChild(cell);
  }

  // Update stats
  const allocated = currentNetworkData.devices.length;
  document.getElementById("subnet-allocated-count").textContent = allocated;
  document.getElementById("subnet-percent-used").textContent = `${((allocated / 254) * 100).toFixed(1)}%`;
}

/**
 * Setup All Event Listeners
 */
function setupActionListeners() {
  // Close inspector
  document.getElementById("btn-close-inspector").addEventListener("click", closeInspector);

  // Filter Buttons
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach(b => {
        b.classList.remove("active", "bg-cyan-900/60", "text-cyan-300", "border-cyan-700/60");
        b.classList.add("bg-dark-700", "text-slate-300");
      });
      btn.classList.add("active", "bg-cyan-900/60", "text-cyan-300", "border-cyan-700/60");
      btn.classList.remove("bg-dark-700", "text-slate-300");

      currentFilter = btn.getAttribute("data-filter");
      refreshVisNetwork();
    });
  });

  // Fit View
  document.getElementById("btn-fit-network").addEventListener("click", () => {
    if (visNetworkInstance) visNetworkInstance.fit({ animation: true });
  });

  // Toggle Physics
  document.getElementById("btn-toggle-physics").addEventListener("click", function() {
    isPhysicsEnabled = !isPhysicsEnabled;
    if (visNetworkInstance) {
      visNetworkInstance.setOptions({ physics: { enabled: isPhysicsEnabled } });
    }
    this.classList.toggle("bg-amber-900/60", !isPhysicsEnabled);
    this.classList.toggle("border-amber-700/60", !isPhysicsEnabled);
    showToast(isPhysicsEnabled ? "Physics simulation unpinned" : "Graph nodes frozen in place");
  });

  // Export JSON
  document.getElementById("btn-export-json").addEventListener("click", () => {
    const jsonStr = JSON.stringify(currentNetworkData, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `network_map_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Exported network topology JSON");
  });

  // Search input in inventory table
  document.getElementById("inventory-search-input").addEventListener("input", e => {
    renderInventoryTable(e.target.value);
  });

  // Sweep LAN Simulation Button
  document.getElementById("btn-scan-trigger").addEventListener("click", triggerScanSimulation);

  // Add Device Modal
  const addModal = document.getElementById("add-device-modal");
  document.getElementById("btn-open-add-modal").addEventListener("click", () => {
    addModal.classList.remove("hidden");
  });
  document.getElementById("btn-close-add-modal").addEventListener("click", () => {
    addModal.classList.add("hidden");
  });
  document.getElementById("btn-cancel-add-modal").addEventListener("click", () => {
    addModal.classList.add("hidden");
  });

  // Add Device Form Submit
  document.getElementById("form-add-device").addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("input-dev-name").value.trim();
    const ip = document.getElementById("input-dev-ip").value.trim();
    const mac = document.getElementById("input-dev-mac").value.trim() || "00:00:00:00:00:00";
    const category = document.getElementById("input-dev-category").value;
    const vendor = document.getElementById("input-dev-vendor").value.trim() || "Custom Device";
    const portsStr = document.getElementById("input-dev-ports").value.trim();

    const openPorts = portsStr
      ? portsStr.split(",").map(p => p.trim()).filter(p => !isNaN(p)).map(p => ({ port: parseInt(p), service: "Custom" }))
      : [];

    // Remove existing if duplicate IP
    currentNetworkData.devices = currentNetworkData.devices.filter(d => d.ip !== ip);

    // Add new device
    currentNetworkData.devices.push({
      ip,
      hostname: name,
      mac,
      vendor,
      category,
      status: "online",
      latency: "1.2 ms",
      lease: "Static Custom",
      open_ports: openPorts,
      is_gateway: false,
      conn_type: category.includes("Mobile") ? "Wi-Fi" : "Ethernet"
    });

    // Add link to gateway or switch
    const gw = currentNetworkData.devices.find(d => d.is_gateway) || currentNetworkData.devices[0];
    if (gw && gw.ip !== ip) {
      currentNetworkData.links.push({
        source: gw.ip,
        target: ip,
        type: category.includes("Mobile") ? "wifi" : "ethernet"
      });
    }

    refreshAllViews();
    addModal.classList.add("hidden");
    document.getElementById("form-add-device").reset();
    showToast(`Added ${name} (${ip}) to network topology`);
  });

  // Guide modal button jumps to scanner tab
  document.getElementById("btn-open-guide-modal").addEventListener("click", () => {
    document.querySelector('.nav-tab[data-tab="tab-scanner"]').click();
  });

  // Copy command buttons
  document.querySelectorAll(".copy-cmd-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const targetId = btn.getAttribute("data-target");
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        navigator.clipboard.writeText(targetEl.textContent.trim());
        showToast("Copied command to clipboard");
      }
    });
  });

  // Reset / Clear / Reload buttons
  document.getElementById("btn-load-sample").addEventListener("click", () => {
    currentNetworkData = JSON.parse(JSON.stringify(DEFAULT_NETWORK_DATA));
    refreshAllViews();
    showToast("Reloaded sample home network");
  });

  document.getElementById("btn-clear-all").addEventListener("click", () => {
    currentNetworkData.devices = currentNetworkData.devices.filter(d => d.is_gateway);
    currentNetworkData.links = [];
    refreshAllViews();
    showToast("Cleared network topology (gateway retained)");
  });

  // Drag and drop JSON importer
  const dropZone = document.getElementById("drop-zone");
  const fileInput = document.getElementById("file-input");

  dropZone.addEventListener("click", () => fileInput.click());
  fileInput.addEventListener("change", e => {
    if (e.target.files.length > 0) {
      handleImportFile(e.target.files[0]);
    }
  });

  dropZone.addEventListener("dragover", e => {
    e.preventDefault();
    dropZone.classList.add("border-cyan-400", "bg-cyan-950/20");
  });
  dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("border-cyan-400", "bg-cyan-950/20");
  });
  dropZone.addEventListener("drop", e => {
    e.preventDefault();
    dropZone.classList.remove("border-cyan-400", "bg-cyan-950/20");
    if (e.dataTransfer.files.length > 0) {
      handleImportFile(e.dataTransfer.files[0]);
    }
  });
}

/**
 * Handle JSON File Import
 */
function handleImportFile(file) {
  const reader = new FileReader();
  reader.onload = event => {
    try {
      const parsed = JSON.parse(event.target.result);
      if (parsed.devices && Array.isArray(parsed.devices)) {
        currentNetworkData = parsed;
        refreshAllViews();
        document.querySelector('.nav-tab[data-tab="tab-topology"]').click();
        showToast(`Loaded ${parsed.devices.length} devices from ${file.name}`);
      } else {
        alert("Invalid format: JSON file must contain a 'devices' array.");
      }
    } catch (err) {
      alert("Error parsing JSON file: " + err.message);
    }
  };
  reader.readAsText(file);
}

/**
 * Trigger Real-time Scan Simulation
 */
function triggerScanSimulation() {
  const progressBarContainer = document.getElementById("scan-progress-bar-container");
  const progressFill = document.getElementById("scan-progress-fill");
  const statusText = document.getElementById("scan-status-text");
  const percentText = document.getElementById("scan-percent-text");

  progressBarContainer.classList.remove("hidden");
  let progress = 0;

  const messages = [
    "Sending ARP broadcast queries to 192.168.1.0/24...",
    "Collecting MAC addresses and matching OUI vendor registries...",
    "Probing TCP port signatures (22, 53, 80, 443, 445, 8080)...",
    "Resolving mDNS and reverse DNS hostnames...",
    "Reconstructing physical & wireless topology links...",
    "Finalizing subnet health checks..."
  ];

  const interval = setInterval(() => {
    progress += 4;
    if (progress > 100) progress = 100;

    progressFill.style.width = progress + "%";
    percentText.textContent = progress + "%";

    const msgIndex = Math.floor((progress / 100) * messages.length);
    if (messages[msgIndex]) {
      statusText.textContent = messages[msgIndex];
    }

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        progressBarContainer.classList.add("hidden");
        progressFill.style.width = "0%";
        showToast("LAN Sweep Complete: All 14 hosts responding with optimal latency");
        refreshAllViews();
      }, 500);
    }
  }, 75);
}

/**
 * Refresh Vis Network Canvas
 */
function refreshVisNetwork() {
  if (!visNetworkInstance) return;
  const { nodes, edges } = buildVisData();
  visNetworkInstance.setData({ nodes, edges });
  visNetworkInstance.fit({ animation: true });
}

/**
 * Refresh All UI Views
 */
function refreshAllViews() {
  refreshVisNetwork();
  renderInventoryTable();
  renderSubnetHeatmap();

  document.getElementById("stat-host-count").textContent = currentNetworkData.devices.length;
  document.getElementById("current-subnet-badge").textContent = currentNetworkData.metadata.subnet || "192.168.1.0/24";
  document.getElementById("current-gw-badge").textContent = currentNetworkData.metadata.gateway || "192.168.1.1";
}

/**
 * Show Toast Notification
 */
function showToast(message) {
  const toast = document.getElementById("toast-notification");
  const text = document.getElementById("toast-message");
  text.textContent = message;
  toast.classList.remove("translate-y-24", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.add("translate-y-24", "opacity-0");
    toast.classList.remove("translate-y-0", "opacity-100");
  }, 3000);
}

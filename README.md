# NetMapper - Local Network Discovery & Topology Suite 🌐

An interactive network mapping and discovery suite that maps, catalogs, and visualizes local network (LAN / Wi-Fi) infrastructure and connected devices.

## Live Web App
Open the interactive topology suite:
👉 **[View NetMapper Dashboard](https://antigravity.luch.dev/site/8242b87c-babc-43e8-82fc-45ebc4c234fd/40ce19b773a59d0d03d5da8c/)**

---

## ⚡ How to Map Your Local Network

Because cloud servers run in isolated cloud data centers, they cannot directly reach into your private home or office LAN behind your Wi-Fi router's NAT/firewall. 

To map your real local network devices, run the included standalone Python scanner script on any computer connected to your home Wi-Fi:

### 1. Run the Python Scanner
No external dependencies required (uses standard library):

```bash
# Auto-detects your local subnet and maps all active devices
python3 network_mapper.py

# Or specify a custom subnet CIDR:
python3 network_mapper.py --subnet 192.168.1.0/24
```

### 2. Output Files
The script automatically generates two files:
- `network_map.json`: Complete structured dataset of all discovered hosts, MACs, vendors, open ports, and topology links.
- `network_map.html`: A self-contained, standalone visual network map that can be opened in any web browser.

### 3. Visualize in the Web App
1. Open the [NetMapper Web Dashboard](https://antigravity.luch.dev/site/8242b87c-babc-43e8-82fc-45ebc4c234fd/40ce19b773a59d0d03d5da8c/).
2. Navigate to **Run Local Scanner**.
3. Drag and drop your `network_map.json` to load your live network topology into the interactive canvas!

---

## 🛠️ Alternative CLI Tools

If you prefer standard networking utilities, you can run:

### Nmap (Linux, macOS, Windows)
```bash
# Fast ping sweep:
nmap -sn 192.168.1.0/24

# Detailed host detection with open ports:
nmap -sS -O -T4 192.168.1.0/24
```

### ARP Scan (Linux / macOS)
```bash
sudo arp-scan --localnet
```

### Windows PowerShell
```powershell
Get-NetNeighbor -AddressFamily IPv4 | Where-Object State -ne "Unreachable"
```

---

## 🌟 Key Features
- **Interactive Topology Graph**: Force-directed layout visualizing Routers, Switches, Servers, Workstations, Mobile, and IoT devices.
- **Hardware & Port Inspector**: Click any device to inspect MAC addresses, hardware manufacturers, latency, and open TCP services.
- **Subnet Heatmap (/24)**: Visual 254-host IP grid showing assigned vs unassigned IP space and DHCP pools.
- **Device Management**: Add custom nodes, test latency with ping simulation, and export network architecture as JSON.

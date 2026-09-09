# 🏛️ Audi Museum Exponate – Technisches Gesamtwiki

Willkommen im zentralen technischen Wiki für die digitalen Ausstellungsstücke des Audi Museums. Dieses Dokument bietet Technikern, Systemadministratoren und Softwareentwicklern einen umfassenden Überblick über Architektur, Betrieb, Handhabung, Konfiguration und Troubleshooting aller vier Exponat-Softwarepakete.

---

## 📋 Übersicht der Exponats-Repositories

| Exponat | Technologie-Stack | Hauptaufgabe | Ziel-Port / Plattform |
| :--- | :--- | :--- | :--- |
| **`paternoster`** | Vue 3, Vite, Strapi v5 (SQLite), MQTT / WebSockets | Visualisierung der Paternoster-Fahrzeugkarossen mit Live-Ebenensynchronisation über Hardware-Sensoren | Port `1337` (CMS) / Weston Kiosk |
| **`museum_3-3Motor`** | Vue 3, Vite, TailwindCSS, Docker | Interaktives Touchscreen-Exponat für 4 Motoren (3.3L V8, 2.5L 5-Zyl, 2.2L 5-Zyl, NSU Wankel) | Ports `8081` - `8084` |
| **`horchv8`** | Electron v28, Webpack 5, SCSS, GSAP | Kiosk-Terminal für Horch 8 Fiedler V8-Motoren mit 4K/HD Video-Player & GPU-Accelerated Wayland Pass-Through | Native Windows (`.exe`) / Ubuntu Linux Docker (`/dev/dri`) |
| **`audi100_geheimprojekt`** | Markdown / Projekt-Placeholder | Zukünftiges Museumsmodul (Audi 100 Entwicklung & Prototypen) | In Vorbereitung |

---

## 🚗 1. Exponat: Paternoster (`oaktown42dev/paternoster`)

### 🏗️ Architektur & Funktionsweise
Das Paternoster-Exponat zeigt synchron zur physischen Bewegung des echten Paternoster-Umlaufaufzugs auf Touchscreen-Kiosks die passenden Fahrzeugkarossen, Galerien und Spezifikationen.

Das System besteht aus zwei Hauptkomponenten:
1. **Frontend (`app-vue`)**: Vue 3 + Vite, MQTT WebSocket Client, 120s Auto-Reset & Smart-Sync.
2. **Backend & Headless CMS (`cms-v5`)**: Strapi v5 (Node.js) mit SQLite-Datenbank (`.tmp/data.db`).

---

### 📦 Strapi v5 Content Management System (CMS) – Aufbau & Funktionalität

Strapi v5 dient als **Headless CMS** unter `http://<CMS-IP>:1337/admin`.

#### 📐 1. Datenmodell & Content Types (`src/api/car`)

| Feldname | Datentyp | i18n (Sprachen) | Beschreibung / Verwendungszweck |
| :--- | :--- | :---: | :--- |
| **`Name`** | String | Ja (DE/EN) | Fahrzeugbezeichnung (z. B. *"Audi 100 Coupé S"*). |
| **`year`** | Integer (1800–2050) | Nein | Baujahr des Exponats (z. B. `1970`). |
| **`subline`** | String | Ja (DE/EN) | Kurzer Untertitel für die Kiosk-Kopfzeile. |
| **`Stellplatz`** | Enumeration (`S01`–`S14`) | Nein | **Hardware-Zuordnung**: Gondel-Position im Paternoster. |
| **`text`** | Text (Long Text) | Ja (DE/EN) | Ausführlicher Beschreibungstext. |
| **`thumbnail`** | Media (Single) | Ja | Vorschaubild für die Karussell-Navigation. |
| **`bigCar`** | Media (Single) | Ja | Freigestellte Fahrzeuggrafik. |
| **`gallery`** | Media (Multi) | Ja | Fotosammlung für die Galerie. |
| **`videos`** | Media (Multi) | Ja | Video-Clips zum Exponat. |
| **`Datatable`** | Dynamic Zone (`table.value`) | Ja | Tabelle für technische Daten (PS, Hubraum, Vmax). |

---

## 💻 2. Anleitung: Docker Image via SSH auf Linux-Client installieren

Diese Anleitung beschreibt Schritt für Schritt, wie ein fertig gebautes Docker-Image (z. B. `museumswiki` oder ein Motoren-Exponat) von einem Entwicklungs-PC über SSH/SCP auf einen entfernten Linux Kiosk-PC (Ubuntu) übertragen und gestartet wird.

### 🚀 Schritt-für-Schritt Anleitung (Offline- / Direkt-Transfer)

#### 1. Image auf dem Arbeits-PC bauen & speichern
```powershell
# Im Projektordner auf deinem Windows/Mac Entwicklungs-PC ausführen:
docker build -t museumswiki:latest .

# Das Docker Image als komprimiertes .tar.gz-Archiv exportieren:
docker save museumswiki:latest | gzip > museumswiki.tar.gz
```

#### 2. Datei per SCP auf den Linux-Client übertragen
```powershell
# Überträgt das Archiv auf den Ziel-Rechner (Kiosk-PC):
scp museumswiki.tar.gz ubuntu@<KIOSK-IP>:~/
```
*(Ersetze `<KIOSK-IP>` durch die IP des Ziel-PCs, z.B. `10.1.1.50`).*

#### 3. SSH-Verbindung zum Linux-Client aufbauen
```bash
ssh ubuntu@<KIOSK-IP>
```

#### 4. Alten Container stoppen & Speicher aufräumen
```bash
# Alten Container stoppen & löschen:
sudo docker rm -f museumswiki 2>/dev/null

# Unbenutzte Daten bereinigen (verhindert volle SSDs):
sudo docker system prune -a -f
```

#### 5. Image laden & Container neu starten
```bash
# 1. Das neue Image in Docker importieren:
sudo docker load -i ~/museumswiki.tar.gz

# 2. Den Container im Hintergrund starten:
sudo docker run -d \
  --name museumswiki \
  --restart unless-stopped \
  -p 8085:80 \
  museumswiki:latest

# 3. Temporäres Archiv löschen:
rm ~/museumswiki.tar.gz
```

#### 6. Kiosk-Anzeige prüfen
- Der Web-Server ist nun unter `http://localhost:8085` auf dem Linux-Client erreichbar.
- Wenn Weston Kiosk aktiviert ist, drücken Sie `F5` am Touchscreen oder führen Sie `sudo reboot` aus.

---

## ⚙️ 3. Exponat: Motoren-Terminals (`oaktown42dev/museum_3-3Motor`)

### 🚀 Ports & Container-Namen
1. **3,3 Liter V8 TDI / 3.7L Motor** ➡️ Port `8081` (`museum_3-3motor:latest`)
2. **2,2 Liter 5-Zylinder Turbo** ➡️ Port `8082` (`museum_2-2motor:latest`)
3. **2,5 Liter 5-Zylinder TDI** ➡️ Port `8083` (`museum_2-5motor:latest`)
4. **NSU Ro 80 Wankelmotor** ➡️ Port `8084` (`museum_wankel:latest`)

---

## 🏎️ 4. Exponat: Horch 8 Fiedler (`oaktown42dev/horchv8`)

Electron v28 Terminal für den Horch 8-Zylinder V8-Motor mit `/dev/dri` GPU-Passthrough für Linux.

---

## ⚡ Troubleshooting Matrix

| Problem | Ursache | Lösung |
| :--- | :--- | :--- |
| **`Permission denied` beim Docker-Befehl auf Linux** | Der Benutzer hat keine Gruppenrechte für Docker. | `sudo usermod -aG docker $USER` ausführen und neu einloggen, oder `sudo docker ...` nutzen. |
| **SSH-Verbindung wird abgelehnt (`Connection refused`)** | SSH-Server auf Linux-PC nicht aktiv. | Am Linux-PC `sudo apt install openssh-server -y` ausführen und `sudo systemctl status ssh` prüfen. |
| **Kiosk zeigt alte CMS-IP an** | `databaseIP` in `settings.json` editiert, aber kein Rebuild ausgeführt. | Frontend neu bauen (`docker compose build app-vue`). |
| **Festplatte nach Docker-Update voll** | Alte Docker Images akkumulieren sich. | Vor `docker load` immer `docker rm -f <container>` und `docker system prune -a -f` ausführen. |

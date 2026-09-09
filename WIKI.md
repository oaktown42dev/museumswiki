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
1. **Frontend (`app-vue`)**:
   - **Framework**: Vue 3 + Vite.
   - **Kiosk-Features**: Versteckter Mauszeiger, Inaktivitäts-Timer (120s Auto-Reset) und **Smart-Sync** (hält MQTT-Updates im Hintergrund an, solange der Besucher den Bildschirm berührt, um das Lesen nicht zu unterbrechen).
   - **Hardware-Schnittstelle**: Hört per WebSocket (`ws://`) auf MQTT-Nachrichten vom Mosquitto-Broker des Paternoster-Aufzugs auf dem Topic `paternoster/status`.
2. **Backend & CMS (`cms-v5`)**:
   - **Framework**: Strapi v5 (Node.js) mit SQLite-Datenbank (`.tmp/data.db`).
   - Rest-API zur Bereitstellung mehrsprachiger Fahrzeugdaten (Deutsch/Englisch) unter `http://<CMS-IP>:1337/api/cars`.

### ⚙️ Konfiguration (`app-vue/src/settings.json`)
```json
{
  "databaseIP": "127.0.0.1",
  "StationFloor": 1,
  "carOffset": 0,
  "mqttBrokerUrl": "ws://10.1.1.90:9001",
  "mqttTopic": "paternoster/status"
}
```

> [!IMPORTANT]
> **WICHTIGER HINWEIS ZUR CMS-IP (`databaseIP`):**  
> Die IP des Strapi CMS wird beim Docker-Build fest in den statischen JavaScript-Code des Vue-Frontends kompiliert.  
> Eine Änderung in `settings.json` erfordert zwingend einen Rebuild des Frontend-Images (`docker compose build app-vue`), damit die Änderung auf dem Kiosk wirksam wird!

- **`StationFloor`**: Physikalische Etage des Touchscreen-Displays im Museum.
- **`carOffset`**: Etagenversatz für den Paternoster-Umlaufaufzug. (Befindet sich Karosse 0 am Hauptsensor im Erdgeschoss, korrigiert `carOffset: 2` die Anzeige im 2. Obergeschoss auf Karosse 2). Negativer Offset (z.B. `-1`) ist ebenfalls möglich.
- **`mqttBrokerUrl`**: MQTT-Broker URL. MUSS über WebSocket (`ws://` oder `wss://`) laufen, da Browser direkte TCP-MQTT-Verbindungen blockieren.

### 🔌 Diagnose & Testtools
- **Offline-Diagnose**: Die im Repository enthaltene Datei [`ws-test.html`](file:///c:/Users/andre/Documents/museumswiki/paternoster/ws-test.html) (zusammen mit [`mqtt.min.js`](file:///c:/Users/andre/Documents/museumswiki/paternoster/mqtt.min.js)) erlaubt das Überwachen und Senden von MQTT-Test-Payloads ohne den Paternoster-Elevator.

### 💾 Backup & Data Persistence
- **Strapi Export**:
  ```bash
  docker exec -it paternoster-cms npm run strapi export -- --no-encrypt --file /opt/app/database/backup
  ```
- **Strapi Import**:
  ```bash
  docker exec -it paternoster-cms npm run strapi import -- --force --file /opt/app/backup.tar.gz
  ```
- **1:1 SSH System-Cloning**:
  ```bash
  # Quell-PC Image ziehen (in Git Bash / WSL execution):
  ssh ubuntu@<quell-ip> "sudo dd if=/dev/nvme0n1 bs=4M | gzip -c" > paternoster-kiosk-backup.img.gz
  
  # Auf Ziel-PC aufspielen:
  gunzip -c paternoster-kiosk-backup.img.gz | ssh ubuntu@<ziel-ip> "sudo dd of=/dev/nvme0n1 bs=4M status=progress"
  ```

---

## ⚙️ 2. Exponat: Motoren-Terminals (`oaktown42dev/museum_3-3Motor`)

### 🚀 Anwendungsstruktur
Das Repository steuert vier eigenständige Motoren-Exponate. Alle Ausführungen basieren auf demselben Vue.js 3 / Vite Quellcode, nutzen jedoch eigene `content.json` Konfigurationen und 4K/HD Video-Medien:

1. **3,3 Liter V8 TDI / 3.7L Motor** ➡️ Port `8081` (`museum_3-3motor:latest`)
2. **2,2 Liter 5-Zylinder Turbo** ➡️ Port `8082` (`museum_2-2motor:latest`)
3. **2,5 Liter 5-Zylinder TDI** ➡️ Port `8083` (`museum_2-5motor:latest`)
4. **NSU Ro 80 Wankelmotor** ➡️ Port `8084` (`museum_wankel:latest`)

### 📦 Offline-USB Deployment Skript
Aufgrund großer Video-Medien werden Docker-Images lokal gebaut und als `.tar` exportiert:
```powershell
# Im Verzeichnis vue-app ausführen:
.\build_all_images.ps1
```
Erzeugt: `museum_3-3motor.tar`, `museum_2-5motor.tar`, `museum_2-2motor.tar`, `museum_wankel.tar`.

### 🔄 System-Update auf dem Zielrechner
```bash
# 1. Alten Container stoppen und aufräumen
sudo docker rm -f museum-3-3
sudo docker system prune -a -f

# 2. Neues Image laden
sudo docker load -i museum_3-3motor.tar

# 3. Neustarten (Beispiel Port 8081)
sudo docker run -d \
  --name museum-3-3 \
  --restart unless-stopped \
  -p 8081:80 \
  ghcr.io/oaktown42dev/museum_3-3motor:latest
```

### ✏️ Content-Anpassung (`deployments/.../content.json`)
```json
{
  "global": {
    "idleTimeoutMs": 300000,
    "defaultLanguage": "de",
    "background": "assets/bg.jpg"
  }
}
```

---

## 🏎️ 3. Exponat: Horch 8 Fiedler (`oaktown42dev/horchv8`)

### 📐 Architektur
Ein Hochleistungs-Kiosk-Terminal zur Präsentation des historischen Horch 8-Zylinder V8-Motors.
- **Frontend & Runtime**: Electron (v28), Webpack 5, SCSS, GSAP-Animationen.
- **Laufzeit-Plattformen**:
  - **Windows Native**: Paketierung via `npm run package` zu einem Standalone-Executable.
  - **Linux Docker Kiosk**: Ubuntu Linux Container mit direct Wayland Socket Pass-Through (`/run/user/1000:/tmp/run:ro`) und Hardware-GPU Acceleration via `/dev/dri`.

### ⚙️ Konfiguration (`./Horch_8_Fiedler/app.config`)
```json
{
  "path_content": "C://Audi//Horch_8_Fiedler//content//",
  "path_media": "C://Audi//Horch_8_Fiedler//media//",
  "screensaver_timeout": 180
}
```

### 💻 Entwickler-Befehle
```bash
cd audi.motorenterminal.fiedler-win32-x64__HD/audi.motorenterminal.fiedler-win32-x64/resources/app
npm install
npm run build_webpack
npm run start
```

---

## 🕵️ 4. Exponat: Audi 100 Geheimprojekt (`oaktown42dev/audi100_geheimprojekt`)

### 📌 Status & Ausblick
- Repository-Platzhalter für die bevorstehende Integration der digitalen Ausstellungsstation zum Thema **Audi 100 Geheimprojekt & Entwicklungsprototypen**.
- Standard-Architektur wird analog zu den Motoren-Terminals auf Vue 3 Kiosk und Weston-Wayland Kiosk-Shell basieren.

---

## 🖥️ Kiosk-Systemsteuerung: Ubuntu Weston & Wayland Setup

Alle Ausstellungsrechner nutzen **Weston Kiosk Shell** auf Ubuntu Linux, um Windows-typische Desktops, Mauszeiger und Systemmeldungen komplett auszublenden.

### 1. Weston Kiosk Startskript (`/usr/local/bin/kiosk-start.sh`)
```bash
#!/bin/bash
source /etc/default/kiosk 2>/dev/null
URL=${KIOSK_URL:-"http://localhost:8081"}

# Warten bis der lokalen Webserver bereit ist
timeout=120; elapsed=0
until curl -sf "$URL" > /dev/null 2>&1; do
  sleep 2; elapsed=$((elapsed+2))
  if [ "$elapsed" -ge "$timeout" ]; then exit 1; fi
done

exec chromium-browser \
  --enable-features=UseOzonePlatform \
  --ozone-platform=wayland \
  --kiosk \
  --incognito \
  --no-first-run \
  --no-default-browser-check \
  --disable-infobars \
  --disable-session-crashed-bubble \
  --disable-translate \
  --disable-features=Translate,TranslateUI,PullToRefresh \
  --lang=de-DE \
  --accept-lang=de-DE,de,en-US,en \
  --autoplay-policy=no-user-gesture-required \
  --check-for-update-interval=31536000 \
  --overscroll-history-navigation=0 \
  --disable-pinch \
  "$URL"
```

### 2. Chromium Policy: Übersetzungs-Popups erzwingend abschalten
```bash
sudo mkdir -p /etc/chromium-browser/policies/managed/
sudo mkdir -p /etc/chromium/policies/managed/
echo '{ "TranslateEnabled": false }' | sudo tee /etc/chromium-browser/policies/managed/disable_translate.json
echo '{ "TranslateEnabled": false }' | sudo tee /etc/chromium/policies/managed/disable_translate.json
```

---

## ⚡ Troubleshooting Matrix

| Problem | Ursache | Lösung |
| :--- | :--- | :--- |
| **Kiosk zeigt alte CMS-IP an** | `databaseIP` in `settings.json` geändert, aber kein Rebuild ausgeführt. | Frontend neu bauen: `docker compose build app-vue`. Die IP ist im JS statisch einkompiliert. |
| **MQTT verbindet nicht im Browser** | TCP-Protokoll (`mqtt://`) statt WebSockets gewählt. | In `settings.json` WebSocket URL verwenden (`ws://10.1.1.90:9001`). |
| **Chromium zeigt Übersetzungs-Leiste** | Browser-Update ignoriert CLI-Flag `--disable-translate`. | Managed JSON Policy `/etc/chromium/policies/managed/disable_translate.json` mit `"TranslateEnabled": false` anlegen. |
| **Festplatte nach Docker-Update voll** | Alte Docker Images akkumulieren sich. | Vor `docker load` immer `docker rm -f <container>` und `docker system prune -a -f` ausführen. |
| **Horch 8 Ruckelt bei Video** | GPU Hardware-Beschleunigung fehlt. | Docker-Gerät `/dev/dri` und Wayland-Socket `/run/user/1000` im Container durchreichen. |

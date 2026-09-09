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
   - **Kiosk-Features**: Versteckter Mauszeiger, Inaktivitäts-Timer (120s Auto-Reset) und **Smart-Sync** (hält MQTT-Updates im Hintergrund an, solange der Besucher den Bildschirm berührt).
   - **Hardware-Schnittstelle**: Hört per WebSocket (`ws://`) auf MQTT-Nachrichten vom Mosquitto-Broker des Paternoster-Aufzugs auf dem Topic `paternoster/status`.
2. **Backend & Headless CMS (`cms-v5`)**:
   - **Framework**: Strapi v5 (Node.js) mit SQLite-Datenbank (`.tmp/data.db`).
   - Bereitstellung aller Inhalte (Fahrzeugakten, Bilder, Galerien, technische Daten, Sprachvarianten) über die REST-API unter `http://<CMS-IP>:1337/api/cars`.

---

### 📦 Strapi v5 Content Management System (CMS) – Aufbau & Funktionalität

Strapi v5 dient als **Headless CMS** für das Paternoster-Exponat. Das bedeutet, dass die Inhaltspflege (Texte, Fotos, technische Daten) vollständig von der visuellen Kiosk-Präsentation (Vue 3) entkoppelt ist. Kuratoren und Techniker können Inhalte bequem im Web-Adminpanel unter `http://<CMS-IP>:1337/admin` verwalten.

#### 📐 1. Datenmodell & Content Types (`src/api/car`)

Das zentrale Datenmodell ist die Collection Type **`Car`** (`collectionName: "cars"`):

| Feldname | Datentyp | Lokalisierbar (i18n) | Beschreibung / Verwendungszweck |
| :--- | :--- | :---: | :--- |
| **`Name`** | String | Ja | Hauptname des Fahrzeugs (z. B. *"Audi 100 Coupé S"*). |
| **`year`** | Integer (1800–2050) | Nein | Baujahr des Exponats (z. B. `1970`). |
| **`subline`** | String | Ja | Kurzer Untertitel für die Kiosk-Kopfzeile. |
| **`Stellplatz`** | Enumeration (`S01`–`S14`) | Nein | **Kritische Hardware-Zuordnung**: Eindeutige Gondel-/Paternoster-Position (Soll-Stellplatz 1 bis 14 im Paternoster). |
| **`text`** | Text (Long Text) | Ja | Ausführlicher Beschreibungstext des Fahrzeugs. |
| **`thumbnail`** | Media (Single Image) | Ja | Vorschaubild für die Kiosk-Karussell-Navigation. |
| **`bigCar`** | Media (Single Image) | Ja | Freigestelltes, hochauflösendes Fahrzeugbild für die Hauptansicht. |
| **`gallery`** | Media (Multi Image) | Ja | Fotosammlung für die interaktive Bildgalerie. |
| **`videos`** | Media (Multi Files) | Ja | Video-Clips und Erprobungsfilme zum Exponat. |
| **`Datatable`** | Dynamic Zone (`table.value`) | Ja | Flexible Tabelle für technische Daten (z. B. Leistung in PS, Hubraum, Vmax, Stückzahl). |

#### 🌐 2. Mehrsprachigkeit (Internationalisierung `i18n`)
- Alle textuellen Felder (`Name`, `subline`, `text`, `Datatable`) und Medien-Uploads unterstützen Strapi's nativer **i18n-Plugin**.
- Das Kiosk-Frontend ruft die Daten gezielt nach Sprache ab (z. B. `locale=de` oder `locale=en`). Beim Umschalten am Kiosk wechselt die Sprache ohne Verzögerung.

#### 🔌 3. REST-API Schnittstelle für das Kiosk-Frontend
Das Vue.js Frontend kommuniziert über Standard HTTP GET Anfragen mit Strapi:
```http
GET http://127.0.0.1:1337/api/cars?populate=*&locale=de
```
- **`populate=*`**: Weist Strapi an, alle verknüpften Medien (`bigCar`, `gallery`) und Dynamic Zones (`Datatable`) im JSON-Payload mitzuliefern.
- Die Antwort wird im Frontend im Pinia-Store gepuffert.

#### 💾 4. Datenbank-Persistenz & Docker Volume
- Strapi nutzt SQLite (`database/data.db`).
- Im Docker-Setup (`docker-compose.yml`) ist der Ordner `./cms-v5/database` als Volume in den Container gemountet (`/opt/app/database`). Alle im Adminpanel vorgenommenen Änderungen bleiben somit bei Neustarts oder Updates dauerhaft auf der Festplatte erhalten.

---

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
- **`carOffset`**: Etagenversatz für den Paternoster-Umlaufaufzug (Mapping auf `Stellplatz` `S01`–`S14`).
- **`mqttBrokerUrl`**: MQTT-Broker URL via WebSockets (`ws://`).

### 🔌 Diagnose & Testtools
- **Offline-Diagnose**: Die Datei [`ws-test.html`](file:///c:/Users/andre/Documents/museumswiki/paternoster/ws-test.html) erlaubt das Überwachen und Senden von MQTT-Test-Payloads ohne den Paternoster-Elevator.

### 💾 Strapi Content Backup & Migration
- **Strapi CLI Export**:
  ```bash
  docker exec -it paternoster-cms npm run strapi export -- --no-encrypt --file /opt/app/database/backup
  ```
- **Strapi CLI Import**:
  ```bash
  docker exec -it paternoster-cms npm run strapi import -- --force --file /opt/app/backup.tar.gz
  ```
- **1:1 SSH System-Cloning**:
  ```bash
  ssh ubuntu@<quell-ip> "sudo dd if=/dev/nvme0n1 bs=4M | gzip -c" > paternoster-kiosk-backup.img.gz
  gunzip -c paternoster-kiosk-backup.img.gz | ssh ubuntu@<ziel-ip> "sudo dd of=/dev/nvme0n1 bs=4M status=progress"
  ```

---

## ⚙️ 2. Exponat: Motoren-Terminals (`oaktown42dev/museum_3-3Motor`)

### 🚀 Anwendungsstruktur
Das Repository steuert vier eigenständige Motoren-Exponate (Vue 3 / Vite Quellcode):
1. **3,3 Liter V8 TDI / 3.7L Motor** ➡️ Port `8081` (`museum_3-3motor:latest`)
2. **2,2 Liter 5-Zylinder Turbo** ➡️ Port `8082` (`museum_2-2motor:latest`)
3. **2,5 Liter 5-Zylinder TDI** ➡️ Port `8083` (`museum_2-5motor:latest`)
4. **NSU Ro 80 Wankelmotor** ➡️ Port `8084` (`museum_wankel:latest`)

---

## 🏎️ 3. Exponat: Horch 8 Fiedler (`oaktown42dev/horchv8`)

### 📐 Architektur
Kiosk-Terminal für den historischen Horch 8-Zylinder V8-Motor (Electron v28, Webpack 5, GSAP). Linux Docker mit `/dev/dri` GPU-Passthrough.

---

## 🕵️ 4. Exponat: Audi 100 Geheimprojekt (`oaktown42dev/audi100_geheimprojekt`)

### 📌 Status: In Vorbereitung
Repository-Platzhalter für die digitale Präsentation des Audi 100 Entwicklungsprojekts.

---

## 🖥️ Kiosk-Systemsteuerung: Ubuntu Weston & Wayland Setup

Wayland/Weston Kiosk-Shell Setup mit automatischer Übersetzungssperre (`disable_translate.json`).

---

## ⚡ Troubleshooting Matrix

| Problem | Ursache | Lösung |
| :--- | :--- | :--- |
| **Kiosk zeigt alte CMS-IP an** | `databaseIP` in `settings.json` geändert, aber kein Rebuild ausgeführt. | Frontend neu bauen: `docker compose build app-vue`. |
| **Strapi Adminpanel nicht erreichbar** | Container `paternoster-cms` gestoppt oder Port 1337 blockiert. | `docker compose logs paternoster-cms` prüfen und Container neustarten. |
| **MQTT verbindet nicht im Browser** | TCP-Protokoll (`mqtt://`) statt WebSockets gewählt. | In `settings.json` `ws://` URL verwenden. |
| **Übersetzungs-Banner in Chromium** | CLI Flag ignoriert. | Managed JSON Policy `/etc/chromium/policies/managed/disable_translate.json` mit `"TranslateEnabled": false` anlegen. |

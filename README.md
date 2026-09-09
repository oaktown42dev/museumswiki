# 🏛️ Audi Museum Exponate – Technisches Gesamtwiki

Zentrales Repository für das technische Wiki der digitalen Ausstellungsstücke des Audi Museums.

## 📁 Inhalt

- **[`WIKI.md`](./WIKI.md)**: Vollständige technische Dokumentation in Markdown (Systemarchitektur, Handling, Kiosk-Setup, SSH-Installation, Command Center & Troubleshooting).
- **[`index.html`](./index.html)**: Interaktive Web-Wiki Benutzeroberfläche (Dark Mode, Live-Suche, Paternoster Offset-Rechner & Docker Command Generator).
- **[`Dockerfile`](./Dockerfile)** & **[`docker-compose.yml`](./docker-compose.yml)**: Leichtgewichtiger Nginx Docker Container für den Ausstellungsbetrieb.
- **[`styles.css`](./styles.css)** & **[`app.js`](./app.js)**: Design-System und interaktive Skripte für die Wiki Web-App.

---

## 🐳 Docker Deployment & SSH-Installation auf Linux-Clients

Es gibt zwei Wege, das Docker-Image auf einem entfernten Linux-Kiosk-PC zu installieren:

### 🚀 Methode 1: Direkte Übertragung via SSH & SCP (Offline / Empfohlen für Standalone-PCs)

#### Schritt 1: Image auf dem Entwicklungs-PC bauen & exportieren
Führe auf deinem Arbeits-PC (PowerShell / Git Bash) folgende Befehle aus:
```powershell
# 1. Docker Image bauen
docker build -t museumswiki:latest .

# 2. Image als komprimiertes Archiv exportieren
docker save museumswiki:latest | gzip > museumswiki.tar.gz
```

#### Schritt 2: Archiv per SCP auf den Linux-Client kopieren
```powershell
scp museumswiki.tar.gz ubuntu@<KIOSK-IP>:~/
```
*(Ersetze `<KIOSK-IP>` durch die IP-Adresse des Ziel-Rechners im Museum).*

#### Schritt 3: Über SSH auf den Linux-Client verbinden & installieren
```bash
# 1. SSH-Verbindung aufbauen
ssh ubuntu@<KIOSK-IP>

# 2. Alten Container entfernen & Docker aufräumen (Speicherplatz freigeben)
sudo docker rm -f museumswiki 2>/dev/null
sudo docker system prune -a -f

# 3. Neues Image aus dem Archiv importieren
sudo docker load -i ~/museumswiki.tar.gz

# 4. Container im Hintergrund starten
sudo docker run -d \
  --name museumswiki \
  --restart unless-stopped \
  -p 8085:80 \
  museumswiki:latest

# 5. Temporäres Archiv aufräumen
rm ~/museumswiki.tar.gz
```

---

### 🌐 Methode 2: Live-Deployment via Git & Docker Compose (Netzwerk-Betrieb)

Falls der Zielrechner Internet- oder Netzwerkzugriff besitzt:

```bash
# 1. Auf Ziel-PC per SSH einloggen
ssh ubuntu@<KIOSK-IP>

# 2. Repository klonen & hineinwechseln
git clone https://github.com/oaktown42dev/museumswiki.git
cd museumswiki

# 3. Docker Compose starten
sudo docker compose up -d --build
```
Das Wiki ist anschließend unter **`http://<KIOSK-IP>:8085`** erreichbar.

---

## 🚗 Dokumentierte Exponat-Repositories
1. [oaktown42dev/paternoster](https://github.com/oaktown42dev/paternoster)
2. [oaktown42dev/museum_3-3Motor](https://github.com/oaktown42dev/museum_3-3Motor)
3. [oaktown42dev/horchv8](https://github.com/oaktown42dev/horchv8)
4. [oaktown42dev/audi100_geheimprojekt](https://github.com/oaktown42dev/audi100_geheimprojekt)

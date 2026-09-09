# 🏛️ Audi Museum Exponate – Technisches Gesamtwiki

Zentrales Repository für das technische Wiki der digitalen Ausstellungsstücke des Audi Museums.

## 📁 Inhalt

- **[`WIKI.md`](./WIKI.md)**: Vollständige technische Dokumentation in Markdown (Systemarchitektur, Handling, Kiosk-Setup, Command Center & Troubleshooting).
- **[`index.html`](./index.html)**: Interaktive Web-Wiki Benutzeroberfläche (Dark Mode, Live-Suche, Paternoster Offset-Rechner & Docker Command Generator).
- **[`Dockerfile`](./Dockerfile)** & **[`docker-compose.yml`](./docker-compose.yml)**: Leichtgewichtiger Nginx Docker Container für den Ausstellungsbetrieb.
- **[`styles.css`](./styles.css)** & **[`app.js`](./app.js)**: Design-System und interaktive Skripte für die Wiki Web-App.

## 🐳 Docker Deployment (Empfohlen)

### 1. Ausführung via Docker Compose
```bash
docker compose up -d --build
```
Das Wiki ist anschließend erreichbar unter: `http://localhost:8085`

### 2. Ausführung via Pure Docker CLI
```bash
docker build -t museumswiki:latest .
docker run -d --name museumswiki -p 8085:80 --restart unless-stopped museumswiki:latest
```

## 🚗 Dokumentierte Exponat-Repositories
1. [oaktown42dev/paternoster](https://github.com/oaktown42dev/paternoster)
2. [oaktown42dev/museum_3-3Motor](https://github.com/oaktown42dev/museum_3-3Motor)
3. [oaktown42dev/horchv8](https://github.com/oaktown42dev/horchv8)
4. [oaktown42dev/audi100_geheimprojekt](https://github.com/oaktown42dev/audi100_geheimprojekt)

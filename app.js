document.addEventListener('DOMContentLoaded', () => {
  // Navigation Handling
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.wiki-section');

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');

      navItems.forEach(nav => nav.classList.remove('active'));
      sections.forEach(sec => sec.classList.remove('active'));

      item.classList.add('active');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  });

  // Search Functionality
  const searchInput = document.getElementById('wikiSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();

      if (query === '') {
        // Reset visibility
        document.querySelectorAll('.card, tr, .code-block').forEach(el => {
          el.style.display = '';
        });
        return;
      }

      // Filter cards
      document.querySelectorAll('.card').forEach(card => {
        const text = card.textContent.toLowerCase();
        if (text.includes(query)) {
          card.style.display = '';
        } else {
          card.style.display = 'none';
        }
      });

      // Filter table rows
      document.querySelectorAll('tbody tr').forEach(row => {
        const text = row.textContent.toLowerCase();
        if (text.includes(query)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // Copy to Clipboard
  document.addEventListener('click', (e) => {
    const copyBtn = e.target.closest('.btn-copy');
    if (copyBtn) {
      const codeHeader = copyBtn.closest('.code-header');
      const codeBlock = copyBtn.closest('.code-block') || (codeHeader ? codeHeader.parentElement : null);
      if (codeBlock) {
        const codeContent = codeBlock.querySelector('.code-content');
        if (codeContent) {
          const textToCopy = codeContent.textContent.trim();
          navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Code in die Zwischenablage kopiert!');
          }).catch(err => {
            console.error('Kopieren fehlgeschlagen:', err);
          });
        }
      }
    }
  });

  // Toast Functionality
  function showToast(message) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 2500);
  }

  // Interactive Paternoster Offset Calculator
  const calcFloor = document.getElementById('calcFloor');
  const calcOffset = document.getElementById('calcOffset');
  const calcSensorCar = document.getElementById('calcSensorCar');
  const calcTotalCars = document.getElementById('calcTotalCars');
  const calcOutput = document.getElementById('calcOutput');
  const calcJsonOutput = document.getElementById('calcJsonOutput');

  function updatePaternosterCalc() {
    if (!calcFloor || !calcOffset || !calcSensorCar || !calcTotalCars) return;

    const floor = parseInt(calcFloor.value) || 0;
    const offset = parseInt(calcOffset.value) || 0;
    const sensorCar = parseInt(calcSensorCar.value) || 0;
    const total = parseInt(calcTotalCars.value) || 16;

    // Calculate effective car ID visible on screen with Wrap-Around modulo
    let effectiveCar = (sensorCar + offset) % total;
    if (effectiveCar < 0) effectiveCar += total;

    if (calcOutput) {
      calcOutput.innerHTML = `<strong>Berechnetes sichtbares Auto an Station (Etage ${floor}):</strong> <span style="color:#00e5ff; font-weight:bold; font-size:1.1rem;">Auto ID #${effectiveCar}</span> (Basis-Sensor Signal: #${sensorCar}, Offset: ${offset})`;
    }

    if (calcJsonOutput) {
      calcJsonOutput.textContent = JSON.stringify({
        databaseIP: "10.1.1.50",
        StationFloor: floor,
        carOffset: offset,
        mqttBrokerUrl: "ws://10.1.1.90:9001",
        mqttTopic: "paternoster/status"
      }, null, 2);
    }
  }

  [calcFloor, calcOffset, calcSensorCar, calcTotalCars].forEach(input => {
    if (input) input.addEventListener('input', updatePaternosterCalc);
  });
  updatePaternosterCalc();

  // Interactive Engine Terminal Command Generator
  const genEngine = document.getElementById('genEngine');
  const genPort = document.getElementById('genPort');
  const genCmdOutput = document.getElementById('genCmdOutput');

  const engineMap = {
    '3-3': { name: 'museum-3-3', image: 'ghcr.io/oaktown42dev/museum_3-3motor:latest', defaultPort: 8081 },
    '2-5': { name: 'museum-2-5', image: 'ghcr.io/oaktown42dev/museum_2-5motor:latest', defaultPort: 8083 },
    '2-2': { name: 'museum-2-2', image: 'ghcr.io/oaktown42dev/museum_2-2motor:latest', defaultPort: 8082 },
    'wankel': { name: 'museum-wankel', image: 'ghcr.io/oaktown42dev/museum_wankel:latest', defaultPort: 8084 }
  };

  function updateEngineCmdGen() {
    if (!genEngine || !genPort || !genCmdOutput) return;

    const key = genEngine.value;
    const port = genPort.value || (engineMap[key] ? engineMap[key].defaultPort : 8081);
    const item = engineMap[key];

    if (item) {
      genCmdOutput.textContent = `sudo docker rm -f ${item.name} 2>/dev/null
sudo docker run -d \\
  --name ${item.name} \\
  --restart unless-stopped \\
  -p ${port}:80 \\
  ${item.image}`;
    }
  }

  if (genEngine && genPort) {
    genEngine.addEventListener('change', () => {
      const item = engineMap[genEngine.value];
      if (item && genPort) genPort.value = item.defaultPort;
      updateEngineCmdGen();
    });
    genPort.addEventListener('input', updateEngineCmdGen);
  }
  updateEngineCmdGen();
});

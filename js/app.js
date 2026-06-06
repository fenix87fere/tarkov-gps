// ============================================================
// GPS TARKOV - Streets of Tarkov
// app.js completo con grafo real + mejoras de UI
// ============================================================

// === CONFIGURACIÓN ===
const ANCHO = 8000;
const ALTO  = 8000;

// === INICIALIZAR MAPA ===
const mapa = L.map('mapa', {
  crs: L.CRS.Simple,
  minZoom: -3,
  maxZoom: 3,
  zoomSnap: 0.25,
  attributionControl: false
});

const bounds = [[0, 0], [ALTO, ANCHO]];
L.imageOverlay('img/map.png', bounds).addTo(mapa);
mapa.fitBounds(bounds);

// ============================================================
// GRAFO DE CALLES - Streets of Tarkov
// 64 nodos verificados pixel a pixel | 128 aristas
// ============================================================

const nodos = [
  { id:  0, x:  880, y: 1380 },  // Cruce Av Oeste / Calle Norte
  { id:  1, x: 1560, y: 1380 },  // Calle Norte - Cardinal SO
  { id:  2, x: 1900, y: 1380 },  // Calle Norte - Cardinal SE
  { id:  3, x: 2440, y: 1380 },  // Calle Norte - Cruce Central
  { id:  4, x: 2900, y: 1350 },  // Calle Norte - entre bloques
  { id:  5, x: 3450, y: 1380 },  // Calle Norte - Separador Oeste
  { id:  6, x: 4100, y: 1380 },  // Calle Norte - Klimov Mall Sur
  { id:  7, x: 4770, y: 1380 },  // Calle Norte - Este
  { id:  8, x: 1900, y:  700 },  // Cardinal Apartment Parking Norte
  { id:  9, x: 2440, y:  700 },  // Cardinal Apartment Norte
  { id: 10, x: 3460, y:  700 },  // Stylobate Elevator Norte
  { id: 11, x: 4100, y:  700 },  // Klimov Mall Norte
  { id: 12, x: 4800, y:  900 },  // Klimov Trading Center
  { id: 13, x:  880, y:  900 },  // Extract at the Expo
  { id: 14, x:  880, y: 2100 },  // Av Oeste - Basement Descent
  { id: 15, x: 1550, y: 2100 },  // Cardinal SO calle interna
  { id: 16, x: 1900, y: 2100 },  // Cardinal interior
  { id: 17, x: 2440, y: 2130 },  // Central izq - Cardinal Este
  { id: 18, x:  880, y: 2700 },  // Av Oeste - Kamchatskaya Arch
  { id: 19, x: 1650, y: 2700 },  // Bloque izq norte
  { id: 20, x: 1900, y: 2600 },  // Bloque centro-izq
  { id: 21, x: 2440, y: 2610 },  // Central izq sur
  { id: 22, x: 2900, y: 2600 },  // Entre bloques - centro
  { id: 23, x:  880, y: 3060 },  // Av Oeste - Cruce Medio
  { id: 24, x: 1560, y: 3100 },  // Cruce Medio - Izquierda
  { id: 25, x: 1910, y: 3060 },  // Cruce Medio - Centro izq
  { id: 26, x: 2440, y: 3060 },  // Cruce Medio - Central
  { id: 27, x: 2900, y: 3060 },  // Cruce Medio - derecha izq
  { id: 28, x: 3450, y: 3060 },  // Cruce Medio - Separador
  { id: 29, x: 4100, y: 3060 },  // Cruce Medio - Pinewood frente
  { id: 30, x: 4800, y: 3060 },  // Cruce Medio - Este (Catacombs)
  { id: 31, x: 4100, y: 2100 },  // Pinewood Norte / Klimov Sur
  { id: 32, x: 4800, y: 2080 },  // Klimov Street Este
  { id: 33, x: 4100, y: 2700 },  // Pinewood Hotel frente Norte
  { id: 34, x: 4800, y: 2710 },  // Klimov Street - Sewer River
  { id: 35, x:  880, y: 3750 },  // Av Oeste - Sparja Norte
  { id: 36, x: 1550, y: 3750 },  // Sparja / Lexos Norte
  { id: 37, x: 1880, y: 3750 },  // Sparja Este / Lexos Oeste
  { id: 38, x: 2440, y: 3750 },  // Teprakot Norte
  { id: 39, x: 2850, y: 3750 },  // Centro-Sur entre bloques
  { id: 40, x: 3470, y: 3750 },  // Separador Sur
  { id: 41, x: 4100, y: 3750 },  // Pinewood Sur / Cinema Norte
  { id: 42, x: 4800, y: 3750 },  // Este - Entrada Catacombs
  { id: 43, x:  880, y: 4300 },  // Concordia Norte / Sewer Manhole
  { id: 44, x: 1560, y: 4300 },  // Concordia Este
  { id: 45, x: 1900, y: 4320 },  // Teprakot Oeste
  { id: 46, x: 2440, y: 4300 },  // Teprakot Centro
  { id: 47, x: 2900, y: 4280 },  // Teprakot Este
  { id: 48, x: 3450, y: 4300 },  // Cinema Oeste
  { id: 49, x: 4100, y: 4300 },  // Cinema Norte
  { id: 50, x: 4800, y: 4300 },  // Damaged House / Cinema Este
  { id: 51, x:  880, y: 4900 },  // Crash Site
  { id: 52, x: 1560, y: 4900 },  // Concordia Sur
  { id: 53, x: 1900, y: 4900 },  // Concordia Este Sur
  { id: 54, x: 2440, y: 4900 },  // Teprakot Sur
  { id: 55, x: 2910, y: 4900 },  // Cinema Oeste Sur
  { id: 56, x: 3450, y: 4910 },  // Cinema frente
  { id: 57, x: 4100, y: 4900 },  // Cinema Este
  { id: 58, x:  880, y: 5650 },  // Primorsky - Oeste
  { id: 59, x: 1560, y: 5650 },  // Primorsky - Centro izq
  { id: 60, x: 2200, y: 5650 },  // Primorsky - Taxi V-Ex
  { id: 61, x: 2900, y: 5650 },  // Primorsky - Centro
  { id: 62, x: 3490, y: 5650 },  // Primorsky - Ventilation/Courtyard
  { id: 63, x: 4100, y: 5650 },  // Primorsky - Este
];

const aristas = [
  [13,0], [0,1],  [1,2],  [2,3],  [3,4],
  [4,5],  [5,6],  [6,7],  [8,1],  [8,9],
  [9,2],  [9,3],  [10,4], [10,5], [10,11],
  [11,6], [12,7], [12,11],[0,14], [14,18],
  [18,23],[23,35],[35,43],[43,51],[51,58],
  [1,15], [15,19],[19,24],[24,36],[36,44],
  [44,52],[52,59],[2,16], [16,20],[20,25],
  [25,37],[37,45],[45,53],[53,60],[3,17],
  [17,21],[21,26],[26,38],[38,46],[46,54],
  [54,60],[4,22], [22,27],[27,39],[39,47],
  [47,55],[55,61],[5,28], [28,40],[40,48],
  [48,56],[56,62],[6,31], [31,33],[33,29],
  [29,41],[41,49],[49,57],[57,63],[7,32],
  [32,34],[34,30],[30,42],[42,50],[50,57],
  [14,15],[15,16],[16,17],[17,22],[31,32],
  [18,19],[19,20],[20,21],[21,22],[22,27],
  [33,34],[23,24],[24,25],[25,26],[26,27],
  [27,28],[28,29],[29,30],[35,36],[36,37],
  [37,38],[38,39],[39,40],[40,41],[41,42],
  [43,44],[44,45],[45,46],[46,47],[47,48],
  [48,49],[49,50],[51,52],[52,53],[53,54],
  [54,55],[55,56],[56,57],[58,59],[59,60],
  [60,61],[61,62],[62,63],[51,58],[52,59],
  [53,60],[54,60],[55,61],[56,62],[57,63],
  [22,28],[4,28], [39,48],[40,48],[46,48],
  [47,48],[13,14],
];

// === CONSTRUIR GRAFO (lista de adyacencia) ===
const grafo = new Map();
nodos.forEach(n => grafo.set(n.id, []));
aristas.forEach(([a, b]) => {
  const nA = nodos.find(n => n.id === a);
  const nB = nodos.find(n => n.id === b);
  if (!nA || !nB) return;
  const dist = Math.hypot(nB.x - nA.x, nB.y - nA.y);
  grafo.get(a).push({ id: b, dist });
  grafo.get(b).push({ id: a, dist });
});

// === DIJKSTRA ===
function dijkstra(inicioId, finId) {
  const dist  = new Map();
  const prev  = new Map();
  const vis   = new Set();
  const cola  = new Map();

  nodos.forEach(n => dist.set(n.id, Infinity));
  dist.set(inicioId, 0);
  cola.set(inicioId, 0);

  while (cola.size > 0) {
    let minId = null, minD = Infinity;
    for (const [id, d] of cola) {
      if (d < minD) { minD = d; minId = id; }
    }
    if (minId === null || minId === finId) break;
    cola.delete(minId);
    vis.add(minId);

    for (const vec of (grafo.get(minId) || [])) {
      if (vis.has(vec.id)) continue;
      const nd = dist.get(minId) + vec.dist;
      if (nd < dist.get(vec.id)) {
        dist.set(vec.id, nd);
        prev.set(vec.id, minId);
        cola.set(vec.id, nd);
      }
    }
  }

  const camino = [];
  let actual = finId;
  if (!prev.has(actual) && actual !== inicioId) return null;
  while (actual !== undefined) {
    camino.unshift(actual);
    actual = prev.get(actual);
  }
  return camino.length >= 2 ? camino : null;
}

// === NODO MÁS CERCANO (solo sobre calle) ===
function nodoMasCercano(x, y) {
  let mejor = 0, menorDist = Infinity;
  nodos.forEach(n => {
    const d = Math.hypot(n.x - x, n.y - y);
    if (d < menorDist) { menorDist = d; mejor = n.id; }
  });
  return mejor;
}

// === ICONOS ===
const iconoVerde = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});
const iconoRojo = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
});

// === CAPAS ===
const capaRuta   = L.layerGroup().addTo(mapa);
const capaNodos  = L.layerGroup().addTo(mapa);

// === MOSTRAR NODOS EN EL MAPA (debug visual, toggle con botón) ===
let nodosVisibles = false;
function toggleNodos() {
  nodosVisibles = !nodosVisibles;
  capaNodos.clearLayers();
  if (nodosVisibles) {
    nodos.forEach(n => {
      L.circleMarker([n.y, n.x], {
        radius: 5, color: '#00eeff', weight: 1,
        fillColor: '#00eeff', fillOpacity: 0.7
      }).bindTooltip(`id:${n.id}`, { permanent: false, direction: 'top' }).addTo(capaNodos);
    });
  }
  const btn = document.getElementById('btn-nodos');
  btn.textContent = nodosVisibles ? '🔵 Ocultar nodos' : '🔵 Ver nodos';
}

// === ESTADO ===
let puntos = [];

// === CLIC EN MAPA ===
mapa.on('click', function(e) {
  if (puntos.length >= 2) return;
  const { lat, lng } = e.latlng; // Simple CRS: lat=y, lng=x
  const icono  = puntos.length === 0 ? iconoVerde : iconoRojo;
  const marker = L.marker([lat, lng], { icon: icono })
    .bindPopup(puntos.length === 0 ? '🟢 Inicio' : '🔴 Destino')
    .addTo(mapa)
    .openPopup();
  puntos.push({ latlng: e.latlng, marker });
  actualizarInfo();
  if (puntos.length === 2) calcularRuta();
});

function actualizarInfo() {
  const info = document.getElementById('info-ruta');
  if (puntos.length === 0) {
    info.innerHTML = '';
  } else if (puntos.length === 1) {
    info.innerHTML = '<span style="color:#0f0">✅ Inicio colocado.<br>Ahora haz clic en el destino.</span>';
  }
}

// === CALCULAR Y DIBUJAR RUTA ===
function calcularRuta() {
  const origen  = puntos[0].latlng;
  const destino = puntos[1].latlng;

  const nIni = nodoMasCercano(origen.lng,  origen.lat);
  const nFin = nodoMasCercano(destino.lng, destino.lat);

  const camino = dijkstra(nIni, nFin);
  const info   = document.getElementById('info-ruta');

  if (!camino) {
    info.innerHTML = '<span style="color:#f66">❌ No se encontró ruta. Intenta otros puntos.</span>';
    return;
  }

  // Construir polyline: punto exacto de inicio → nodos → punto exacto de destino
  const coords = [];
  coords.push([origen.lat, origen.lng]);
  camino.forEach(id => {
    const n = nodos.find(n => n.id === id);
    coords.push([n.y, n.x]);
  });
  coords.push([destino.lat, destino.lng]);

  capaRuta.clearLayers();

  // Sombra
  L.polyline(coords, { color: '#000', weight: 10, opacity: 0.4 }).addTo(capaRuta);
  // Línea principal
  L.polyline(coords, { color: '#00cfff', weight: 5, opacity: 0.95,
    dashArray: null }).addTo(capaRuta);
  // Animación de flujo (decorador punteado)
  L.polyline(coords, { color: '#fff', weight: 2, opacity: 0.6,
    dashArray: '12 18' }).addTo(capaRuta);

  // Marcadores en nodos del camino
  camino.forEach((id, i) => {
    const n = nodos.find(n => n.id === id);
    L.circleMarker([n.y, n.x], {
      radius: i === 0 || i === camino.length - 1 ? 7 : 4,
      color: '#fff', weight: 1.5, fillColor: '#00cfff', fillOpacity: 0.9
    }).addTo(capaRuta);
  });

  // Ajustar vista
  mapa.fitBounds(L.polyline(coords).getBounds().pad(0.15));

  // Distancia
  let totalPix = 0;
  for (let i = 1; i < coords.length; i++) {
    const [y1, x1] = coords[i-1];
    const [y2, x2] = coords[i];
    totalPix += Math.hypot(x2 - x1, y2 - y1);
  }
  // 1 pixel ≈ 0.13 metros (aprox para mapa 8000px ~ 1km real)
  const metros = Math.round(totalPix * 0.13);
  const pasos  = camino.length - 1;

  info.innerHTML = `
    <span style="color:#00cfff">✅ Ruta encontrada</span><br>
    📏 Distancia aprox: <b>${metros} m</b><br>
    🔗 Segmentos: <b>${pasos}</b><br>
    🗺️ Nodos: ${camino.join(' → ')}
  `;
}

// === REINICIAR ===
document.getElementById('btn-reiniciar').addEventListener('click', () => {
  puntos.forEach(p => mapa.removeLayer(p.marker));
  puntos = [];
  capaRuta.clearLayers();
  document.getElementById('info-ruta').innerHTML = '';
});

// === BOTÓN TOGGLE NODOS ===
document.getElementById('btn-nodos').addEventListener('click', toggleNodos);

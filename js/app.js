// ============ CONFIGURACIÓN INICIAL ============
// Dimensiones de la imagen (ajústalas si tu imagen es de otro tamaño)
const ANCHO = 4096;
const ALTO  = 4096;

// Inicializar mapa con CRS simple (coordenadas de píxeles)
const mapa = L.map('mapa', {
  crs: L.CRS.Simple,
  minZoom: -2,
  maxZoom: 3,
  zoomSnap: 0.5,
  attributionControl: false
});

// Cargar la imagen del mapa (debe estar en img/map.png)
const bounds = [[0, 0], [ALTO, ANCHO]];
L.imageOverlay('img/map.png', bounds).addTo(mapa);
mapa.fitBounds(bounds);

// ============ GRAFO DE CALLES (ejemplo) ============
// Cada nodo tiene id, x, y (coordenadas de la imagen)
// NOTA: En Leaflet Simple CRS, x = horizontal, y = vertical (creciente hacia abajo)
// Debes medir estos puntos sobre tu imagen real. Este es un ejemplo arbitrario.
const nodos = [
  { id: 0,  x: 800,  y: 1200 },  // Cruce principal (ej. cerca de Pinewood)
  { id: 1,  x: 1600, y: 1200 },
  { id: 2,  x: 2000, y: 1500 },
  { id: 3,  x: 1200, y: 2000 },
  { id: 4,  x: 2200, y: 2200 },
  { id: 5,  x: 2800, y: 1600 },
  { id: 6,  x: 3000, y: 2200 },
  { id: 7,  x: 2400, y: 800  },
  { id: 8,  x: 3200, y: 1000 },
  { id: 9,  x: 3600, y: 1400 },
  { id: 10, x: 1800, y: 2600 },
  { id: 11, x: 2600, y: 2800 },
  { id: 12, x: 3400, y: 2600 }
];

// Conexiones entre nodos (aristas no dirigidas)
const aristas = [
  [0,1], [1,2], [0,3], [1,3], [2,4], [3,4],
  [2,5], [5,6], [5,8], [7,8], [7,1], [8,9],
  [4,10], [10,11], [6,11], [11,12], [9,12]
];

// Construir lista de adyacencia con distancias
const grafo = new Map();
nodos.forEach(n => grafo.set(n.id, []));
aristas.forEach(([a, b]) => {
  const nodoA = nodos[a];
  const nodoB = nodos[b];
  const dist = Math.hypot(nodoB.x - nodoA.x, nodoB.y - nodoA.y);
  grafo.get(a).push({ id: b, dist });
  grafo.get(b).push({ id: a, dist });
});

// ============ DIJKSTRA ============
function dijkstra(inicioId, finId) {
  const distancias = new Map();
  const anterior = new Map();
  const visitados = new Set();
  const cola = new Map(); // id -> distancia

  nodos.forEach(n => distancias.set(n.id, Infinity));
  distancias.set(inicioId, 0);
  cola.set(inicioId, 0);

  while (cola.size > 0) {
    // Obtener nodo con menor distancia (podría optimizarse con cola de prioridad)
    let minId = null;
    let minDist = Infinity;
    for (let [id, dist] of cola) {
      if (dist < minDist) {
        minDist = dist;
        minId = id;
      }
    }
    if (minId === null) break;
    cola.delete(minId);
    if (minId === finId) break;
    visitados.add(minId);

    for (let vecino of grafo.get(minId)) {
      if (visitados.has(vecino.id)) continue;
      const nuevaDist = distancias.get(minId) + vecino.dist;
      if (nuevaDist < distancias.get(vecino.id)) {
        distancias.set(vecino.id, nuevaDist);
        anterior.set(vecino.id, minId);
        cola.set(vecino.id, nuevaDist);
      }
    }
  }

  // Reconstruir camino
  const camino = [];
  let actual = finId;
  if (anterior.get(actual) === undefined && actual !== inicioId) return null;
  while (actual !== undefined) {
    camino.unshift(actual);
    actual = anterior.get(actual);
  }
  return camino;
}

// ============ INTERFAZ DE USUARIO ============
let puntos = [];           // { latlng, marker }
const capaRuta = L.layerGroup().addTo(mapa);

// Íconos para inicio (verde) y destino (rojo)
const iconoVerde = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const iconoRojo = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Buscar el nodo más cercano a unas coordenadas de píxel
function nodoMasCercano(x, y) {
  let menorDist = Infinity;
  let idCercano = 0;
  nodos.forEach(n => {
    const d = Math.hypot(n.x - x, n.y - y);
    if (d < menorDist) {
      menorDist = d;
      idCercano = n.id;
    }
  });
  return idCercano;
}

// Manejar clics en el mapa
mapa.on('click', function(e) {
  if (puntos.length >= 2) return; // ya hay inicio y destino

  const { lat, lng } = e.latlng; // en Simple CRS: lat = y, lng = x
  const icono = puntos.length === 0 ? iconoVerde : iconoRojo;
  const marker = L.marker([lat, lng], { icon: icono }).addTo(mapa);

  puntos.push({ latlng: e.latlng, marker });

  if (puntos.length === 2) {
    calcularYMostrarRuta();
  }
});

// Calcular la ruta entre los dos puntos y mostrarla
function calcularYMostrarRuta() {
  const origen = puntos[0].latlng;
  const destino = puntos[1].latlng;

  const nodoIni = nodoMasCercano(origen.lng, origen.lat); // x, y
  const nodoFin = nodoMasCercano(destino.lng, destino.lat);

  const caminoIds = dijkstra(nodoIni, nodoFin);
  const infoRuta = document.getElementById('info-ruta');

  if (!caminoIds || caminoIds.length < 2) {
    infoRuta.textContent = '❌ No se encontró una ruta entre esos puntos.';
    infoRuta.style.color = '#f66';
    return;
  }

  // Convertir IDs a array de [y, x] para la polyline
  const coordenadas = caminoIds.map(id => {
    const nodo = nodos.find(n => n.id === id);
    return [nodo.y, nodo.x];
  });

  // Dibujar línea azul
  capaRuta.clearLayers();
  L.polyline(coordenadas, { color: '#3388ff', weight: 6, opacity: 0.9 }).addTo(capaRuta);

  // Ajustar vista a la ruta
  mapa.fitBounds(L.polyline(coordenadas).getBounds().pad(0.2));

  // Calcular distancia total (en píxeles) y mostrarla (escala ficticia)
  let totalPix = 0;
  for (let i = 1; i < coordenadas.length; i++) {
    const [y1, x1] = coordenadas[i-1];
    const [y2, x2] = coordenadas[i];
    totalPix += Math.hypot(x2 - x1, y2 - y1);
  }
  // Suponiendo que 100 píxeles = 1 metro (ajústalo)
  const metros = totalPix / 100;
  infoRuta.textContent = `✅ Ruta encontrada: ${metros.toFixed(1)} m (aprox.)`;
  infoRuta.style.color = '#0f0';
}

// Botón de reinicio
document.getElementById('btn-reiniciar').addEventListener('click', function() {
  puntos.forEach(p => mapa.removeLayer(p.marker));
  puntos = [];
  capaRuta.clearLayers();
  document.getElementById('info-ruta').textContent = '';
});
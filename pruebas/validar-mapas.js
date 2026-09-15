/* ============================================================
   VALIDADOR DE MAPAS
   ============================================================
   Revisa que los mapas de js/mapas.js esten bien:
     - todas las filas miden lo mismo
     - no hay letras inventadas
     - hay exactamente un punto de inicio
     - y, con un recorrido tipo hormiga (BFS), que se pueda
       LLEGAR a las llaves, cofres, monedas, portales y la meta

   Ese ultimo chequeo es el que mas vale: un mapa puede estar
   perfecto y ser imposible de terminar.

   Correr:  node pruebas/validar-mapas.js
   ============================================================ */

const fs = require('fs');
const path = require('path').join(__dirname, '..');
global.Reservas = new Proxy({}, { get: () => () => {} });
const src = fs.readFileSync(path + '/js/mapas.js', 'utf8');
(0,eval)(src + '\n;globalThis.__M = {MAPAS, LEYENDA, ENTIDADES};');
const {MAPAS, LEYENDA, ENTIDADES} = globalThis.__M;

let fallos = 0;
const err = m => { console.log('  ERROR: ' + m); fallos++; };

for (const clave in MAPAS) {
  const m = MAPAS[clave];
  console.log(`\n[${clave}] "${m.nombre}"`);
  const ancho = m.grilla[0].length, alto = m.grilla.length;
  console.log(`  tamanio: ${ancho} x ${alto} casillas  (${ancho*32} x ${alto*32} px)`);

  m.grilla.forEach((f, i) => {
    if (f.length !== ancho) err(`fila ${i} mide ${f.length}, deberia medir ${ancho}`);
    for (const ch of f) if (!LEYENDA[ch] && !ENTIDADES[ch]) err(`fila ${i}: letra desconocida "${ch}"`);
  });

  // contar cosas
  const cuenta = {};
  m.grilla.join('').split('').forEach(c => cuenta[c] = (cuenta[c]||0)+1);
  const inv = k => cuenta[k] || 0;
  console.log(`  jugador:${inv('@')} monedas:${inv('$')} llaves:${inv('L')} cofres:${inv('C')} vidas:${inv('V')} puertas:${inv('P')} babosos:${inv('b')} sombras:${inv('s')} portal:${inv('>')} meta:${inv('X')}`);
  if (inv('@') !== 1) err(`tiene ${inv('@')} puntos de inicio (@), debe tener exactamente 1`);
  if (inv('P') > inv('L')) err(`hay ${inv('P')} puertas pero solo ${inv('L')} llaves`);
  if (m.siguiente && inv('>') === 0) err('no tiene portal (>) pero tiene mapa siguiente');
  if (!m.siguiente && inv('X') === 0) err('es el ultimo mapa pero no tiene meta (X)');

  // ---- BFS de alcanzabilidad ----
  const solido = (c, conLlave) => {
    if (ENTIDADES[c]) return false;
    if (c === 'P') return !conLlave;
    return LEYENDA[c].solido;
  };
  const bfs = (conLlave) => {
    let inicio;
    m.grilla.forEach((f,y)=>{ const x=f.indexOf('@'); if(x>=0) inicio=[x,y]; });
    const visto = new Set([inicio.join(',')]);
    const cola = [inicio];
    while (cola.length) {
      const [x,y] = cola.shift();
      for (const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        const nx=x+dx, ny=y+dy;
        if (nx<0||ny<0||nx>=ancho||ny>=alto) continue;
        const k = nx+','+ny;
        if (visto.has(k)) continue;
        if (solido(m.grilla[ny][nx], conLlave)) continue;
        visto.add(k); cola.push([nx,ny]);
      }
    }
    return visto;
  };
  const sinLlave = bfs(false), conLlave = bfs(true);
  const buscar = (letra, conjunto) => {
    const faltan = [];
    m.grilla.forEach((f,y)=>[...f].forEach((c,x)=>{ if(c===letra && !conjunto.has(x+','+y)) faltan.push(`(${x},${y})`); }));
    return faltan;
  };
  let f;
  if ((f = buscar('L', sinLlave)).length) err(`llave inalcanzable sin abrir puertas: ${f.join(' ')}`);
  if ((f = buscar('>', conLlave)).length) err(`portal inalcanzable: ${f.join(' ')}`);
  if ((f = buscar('X', conLlave)).length) err(`meta inalcanzable: ${f.join(' ')}`);
  if ((f = buscar('C', conLlave)).length) err(`cofre inalcanzable: ${f.join(' ')}`);
  if ((f = buscar('$', conLlave)).length) err(`monedas inalcanzables: ${f.join(' ')}`);
  if ((f = buscar('V', conLlave)).length) err(`corazon inalcanzable: ${f.join(' ')}`);
  if (inv('P') > 0 && buscar('>', sinLlave).length === 0 && inv('X') === 0) {
    console.log('  nota: el portal se alcanza SIN usar la llave (la puerta es opcional)');
  }
}
console.log(fallos === 0 ? '\n==> TODOS LOS MAPAS OK' : `\n==> ${fallos} PROBLEMAS`);
process.exit(fallos === 0 ? 0 : 1);

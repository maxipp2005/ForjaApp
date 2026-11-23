// Biblioteca de ejercicios. kind: 'w' = peso × reps, 'bw' = peso corporal (reps + lastre opcional), 't' = tiempo.
const RAW = [
  ['Pecho', 'w', ['Press banca', 'Press banca inclinado', 'Press con mancuernas', 'Press inclinado con mancuernas', 'Aperturas con mancuernas', 'Cruce de poleas', 'Press en máquina']],
  ['Pecho', 'bw', ['Fondos', 'Flexiones']],
  ['Espalda', 'bw', ['Dominadas', 'Dominadas supinas']],
  ['Espalda', 'w', ['Jalón al pecho', 'Remo con barra', 'Remo con mancuerna', 'Remo en polea baja', 'Peso muerto', 'Pullover en polea', 'Face pull']],
  ['Pierna', 'w', ['Sentadilla', 'Sentadilla frontal', 'Prensa', 'Zancadas', 'Sentadilla búlgara', 'Peso muerto rumano', 'Hip thrust', 'Extensión de cuádriceps', 'Curl femoral', 'Gemelos de pie']],
  ['Hombro', 'w', ['Press militar', 'Press de hombros con mancuernas', 'Elevaciones laterales', 'Pájaros', 'Encogimientos']],
  ['Brazos', 'w', ['Curl con barra', 'Curl con mancuernas', 'Curl martillo', 'Press francés', 'Extensión de tríceps en polea']],
  ['Core', 'bw', ['Rueda abdominal', 'Elevaciones de piernas', 'Russian twist', 'Crunch']],
  ['Core', 't', ['Plancha', 'Plancha lateral', 'Hollow hold']],
  ['Core', 'w', ['Pallof press']],
  ['Potencia y MMA', 'w', ['Kettlebell swing', 'Cargada (clean)', 'Thruster', 'Lanzamiento de balón medicinal', 'Paseo del granjero', 'Turkish get-up', 'Landmine press']],
  ['Potencia y MMA', 'bw', ['Saltos al cajón', 'Burpees', 'Sprawls']],
  ['Potencia y MMA', 't', ['Comba', 'Battle ropes', 'Empuje de trineo', 'Sombra (shadow boxing)', 'Bicicleta de asalto', 'Remo ergómetro']],
];

const slug = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const EXERCISES = RAW.flatMap(([group, kind, names]) => names.map((name) => ({ id: 'x:' + slug(name), name, group, kind })));
export const GROUPS = ['Pecho', 'Espalda', 'Pierna', 'Hombro', 'Brazos', 'Core', 'Potencia y MMA', 'Otros'];
export const KINDS = { w: 'Peso × repeticiones', bw: 'Peso corporal', t: 'Tiempo' };

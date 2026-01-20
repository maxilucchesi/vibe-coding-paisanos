// Frases aleatorias para el subtítulo del dashboard
export const randomPhrases = [
  "¿Y ahora qué estás leyendo?",
  "¿Ya tenés tu próximo libro en la mira?",
  "Dale, contame qué estás leyendo.",
  "Tu próxima gran lectura empieza acá.",
  "Tus libros quieren saber qué pensás.",
  "¿Terminaste? Contame cómo estuvo.",
  "Cada libro que leés cuenta algo sobre vos.",
  "Tu historia, contada en libros.",
  "Esta app quiere ser parte de tu próxima gran lectura.",
  "Porque cada página vale la pena recordarla.",
  "Tus libros favoritos viven acá.",
  "Las historias que te marcan, siempre con vos.",
  "¿Qué andás leyendo últimamente?",
  "¿Qué tal estuvo ese libro?",
  "¿Lista para tu próximo capítulo?",
  "¿Algo nuevo para recomendar?",
  "Contame qué estás leyendo",
  "Registrá tu último viaje literario",
  "Tus libros esperan tu opinión",
  "Guardá esa historia que no querés olvidar",
  "Tus lecturas, tus recuerdos",
  "Tu biblioteca, tu historia",
  "La app donde viven tus libros",
  "Registrá lo que te mueve",
]

// Función para obtener una frase aleatoria
export function getRandomPhrase(): string {
  const randomIndex = Math.floor(Math.random() * randomPhrases.length)
  return randomPhrases[randomIndex]
}

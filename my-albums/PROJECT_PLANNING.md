# My Albums - Proyecto Web App

## Concepto General

Una aplicación web ultraminimalista para crear una biblioteca personal de álbumes musicales que escuché de principio a fin. La estética se inspira en yeezy.com y ZARA: interfaz limpia, fondo blanco, grid de portadas de álbumes.

## Características Principales

### Interfaz
- **Página principal**: Grid con portadas de álbumes únicamente
- **Sin menú, buscador, ni elementos de navegación**
- **Fondo blanco** con estética ultraminimalista
- **Responsive**: funciona perfecto en desktop y mobile

### Funcionalidad Core
- **Agregar álbumes**: Input discreto "AGREGAR" en la parte superior
- **Búsqueda inteligente**: Al escribir artista/álbum, dropdown con opciones
- **Rating personal**: Sistema de estrellas Unicode (★★★☆☆)
- **Visualización**: Solo portadas en grid, info adicional en hover/click

## Stack Tecnológico

### Frontend
- **Next.js 14** + **React 18**
- **Tailwind CSS** para styling
- **TypeScript** para type safety
- **Roboto Mono** (Google Fonts)

### Backend & Persistencia
- **Supabase** (PostgreSQL + Storage)
- **Autenticación**: Supabase Auth (para futuro multi-usuario)

### APIs Externas
- **Primary**: iTunes Search API (sin auth, buena cobertura)
- **Fallback**: MusicBrainz + Cover Art Archive
- **Artwork**: URLs de alta resolución (600x600px mínimo)

### Deployment
- **Vercel** (integración nativa con Next.js)

## Flujo de Usuario

### Agregar Álbum
1. Click en "AGREGAR" (texto discreto centrado arriba)
2. Modal/pantalla con dos campos:
   - **Búsqueda**: "Artista o Álbum"
   - **Rating**: Estrellas Unicode (0-5)
3. **Dropdown**: Resultados de API con opciones para elegir
4. **Botón negro**: "GUARDAR"
5. **Feedback**: Spinner discreto durante búsqueda/guardado

### Visualizar Álbumes
- **Grid responsive**: 2 cols mobile, 4+ desktop
- **Hover**: Muestra nombre + rating sutilmente
- **Click**: Abre modal para editar rating del álbum

## Estructura de Datos

```typescript
interface Album {
  id: string;
  title: string;
  artist: string;
  artwork_url: string;
  rating: number; // 0-5
  itunes_id?: string;
  musicbrainz_id?: string;
  created_at: timestamp;
  updated_at: timestamp;
}
```

## APIs & Integración

### iTunes Search API
```
GET https://itunes.apple.com/search?term={query}&entity=album&limit=10
```

### MusicBrainz (Fallback)
```
GET https://musicbrainz.org/ws/2/release/?query=artist:{artist} AND release:{album}&fmt=json
```

### Cover Art Archive
```
GET https://coverartarchive.org/release/{release-id}/front-500.jpg
```

## Gestión de Errores

- **Álbum no encontrado**: Mensaje discreto "No encontrado"
- **Imagen no carga**: Placeholder gris con "No Cover"
- **API timeout**: Retry automático con fallback
- **Duplicados**: Sistema de detección por título + artista

## Características UX/UI

### Minimalismo
- **Sin legendas** bajo las portadas
- **Sin sidebar** o menú de navegación
- **Colores**: Solo blanco, negro, y grises
- **Tipografía**: Roboto Mono

### Interactividad
- **Hover states**: Información contextual sutil
- **Loading states**: Spinners discretos
- **Feedback visual**: Confirmaciones no intrusivas

### Responsive Design
```css
grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8
```

## Consideraciones Técnicas

### Performance
- **Lazy loading** para imágenes
- **Caching** de artwork URLs
- **Optimización**: Next.js Image component

### Seguridad
- **Sanitización** de inputs
- **Rate limiting** en APIs
- **Validación** de URLs de imágenes

### Escalabilidad
- **Paginación** cuando > 100 álbumes
- **Búsqueda local** para filtrado rápido
- **Backup automático** de datos

## Roadmap de Desarrollo

### Fase 1: MVP
- [ ] Setup Next.js + Tailwind + Supabase
- [ ] Componente Grid básico
- [ ] Modal "AGREGAR" con campos
- [ ] Integración iTunes Search API
- [ ] Sistema de rating con estrellas
- [ ] Persistencia en Supabase

### Fase 2: Refinamiento
- [ ] Fallback MusicBrainz API
- [ ] Hover states para info
- [ ] Gestión de errores completa
- [ ] Loading states y spinners
- [ ] Responsive design completo

### Fase 3: Polish
- [ ] Animations sutiles
- [ ] Optimización de performance
- [ ] PWA capabilities
- [ ] Backup/export de datos

## Decisiones de Diseño

### Por qué este Stack
- **Next.js**: SSR, optimización automática, deploy fácil
- **Supabase**: Backend-as-a-Service, escalable, gratuito
- **Tailwind**: Utility-first, consistencia visual
- **iTunes API**: Sin auth, buena cobertura, artwork confiable

### Por qué este Enfoque
- **Minimalismo**: Foco en contenido, sin distracciones
- **Personal**: Biblioteca individual, no social
- **Simplicidad**: Solo funcionalidad esencial
- **Estética**: Inspiración en marcas premium (Yeezy, ZARA)

## Comando de Inicio

```bash
npx create-next-app@latest my-albums --typescript --tailwind --app
cd my-albums
npm install @supabase/supabase-js
```

### Configuración de Roboto Mono
- Usar `next/font/google` para importar Roboto Mono
- Configurar en `tailwind.config.js` como fuente principal
- Aplicar globalmente en `globals.css`

---

*Documentación creada durante fase de planning - Enero 2025* 
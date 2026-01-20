# Auditoría del Repositorio - Preparación para Refactorización

**Fecha:** 2024  
**Objetivo:** Identificar arquitectura real, deuda técnica y riesgos funcionales

---

## 1. RESUMEN DE ARQUITECTURA ACTUAL

### 1.1 Flujo de Datos (Data Flow)

#### **Patrón: Offline-First con Sincronización Bidireccional**

```
┌─────────────────┐
│   Componente   │
│   (React UI)    │
└────────┬────────┘
         │
         ├─► [Server Action] ──► Supabase (intento)
         │                          │
         │                          ├─► Éxito: actualiza DB
         │                          └─► Falla: continúa flujo
         │
         └─► localStorage (siempre)
                │
                ├─► pending_sync: true (si Supabase falló)
                └─► pending_sync: false (si Supabase OK)
```

**Características:**
- **Prioridad:** localStorage primero, Supabase como backup/sync
- **Estrategia:** "Write-through" con fallback a "write-behind"
- **Sincronización:** Manual (botón) y automática (al cargar datos)

#### **Flujos Específicos:**

**A. Crear Libro:**
1. Usuario envía formulario → `createBookAction` (Server Action)
2. Server Action intenta insertar en Supabase
3. Si falla Supabase: guarda en localStorage con `pending_sync: true`
4. Si éxito Supabase: guarda en localStorage con `pending_sync: false` + actualiza `id`
5. Componente ejecuta `clientSideCode` (string con `eval`) para actualizar localStorage
6. Dispara evento `booksUpdated` para refrescar UI

**B. Leer Libros:**
1. `getBooksByType()` intenta primero localStorage
2. Si localStorage vacío → consulta Supabase
3. Si Supabase responde → actualiza localStorage con datos frescos
4. Merge: prioriza Supabase, mantiene pendientes locales

**C. Actualizar/Eliminar:**
- Mismo patrón: intenta Supabase, fallback a localStorage
- Usa `clientSideCode` con `eval` para sincronizar estado local

### 1.2 Autenticación

#### **Sistema Dual (No Utilizado Completamente):**

**A. Simple Auth (Activo):**
- Archivo: `lib/simple-auth.ts`
- Método: Clave única hardcodeada (`"dayko"`)
- Almacenamiento: localStorage + cookie `auth-status`
- Usuario fijo: `aebaf7a8-0d83-403c-b5f4-9d798b74e3ee`
- Middleware: Verifica cookie `auth-status`

**B. Supabase Auth (No Utilizado):**
- Archivo: `lib/auth.ts`
- Implementado pero no usado en flujo principal
- Funciones: `signInWithMagicLink`, `signOut`, `isAuthenticated`
- Conflicto potencial: dos sistemas de auth coexisten

**Problemas:**
- `getUserId()` siempre retorna UUID fijo (no dinámico)
- No hay validación de usuario real en Supabase
- RLS policies en Supabase usan `auth.uid()` pero app usa `user_id` fijo

### 1.3 Almacenamiento

#### **localStorage:**
- Clave: `"giuli-books"` (hardcodeada en algunos lugares, `LOCAL_STORAGE_BOOKS_KEY` en otros)
- Estructura: Array de objetos `LocalBook`
- Campos críticos:
  - `id`: UUID de Supabase (si existe)
  - `local_id`: ID temporal generado localmente
  - `pending_sync`: boolean para tracking

#### **Supabase:**
- Tabla: `books`
- Campos adicionales: metadata (published_date, description, categories, thumbnail, etc.)
- RLS: Habilitado pero políticas usan `auth.uid()` (no coincide con `user_id` fijo)

### 1.4 Sincronización

#### **Mecanismo:**
- Función: `syncLocalBooks()` en `lib/local-storage.ts`
- Proceso:
  1. Filtra libros con `pending_sync: true`
  2. Itera secuencialmente (no paralelo)
  3. Si tiene `id`: UPDATE en Supabase
  4. Si no tiene `id`: INSERT en Supabase
  5. Actualiza `pending_sync: false` en localStorage
- Trigger: Manual (botón) o automático (al cargar)

**Problemas:**
- No hay lock/queue para evitar sincronizaciones concurrentes
- No hay retry logic para errores transitorios
- No hay conflict resolution (último write gana)

---

## 2. PUNTOS FRÁGILES Y "ATADOS CON ALAMBRE"

### 2.1 Offline-First

#### **🔴 CRÍTICO: Uso de `eval()` para Ejecutar Código del Cliente**

**Ubicaciones:**
- `app/actions.ts`: `createBookAction`, `updateBookAction`, `deleteBookAction`
- `components/edit-book-form.tsx`: líneas 134, 171
- `components/add-book-form.tsx`: línea 97
- `components/add-book-form-with-search.tsx`: línea 149 (alternativa sin eval)

**Problema:**
```typescript
// Server Action genera string de código
const clientSideCode = `
  try {
    const books = JSON.parse(localStorage.getItem("giuli-books") || "[]");
    // ... código inline ...
  } catch (error) { ... }
`

// Cliente ejecuta con eval
eval(result.clientSideCode)
```

**Riesgos:**
- **Seguridad:** Inyección de código si `clientSideCode` está comprometido
- **Mantenibilidad:** Código como string, no type-safe
- **Debugging:** Errores difíciles de rastrear
- **Performance:** `eval` es lento y bloquea optimizaciones

**Alternativa actual (parcial):**
- `add-book-form-with-search.tsx` hace el guardado directamente sin `eval` (línea 149-160)

#### **🟡 MEDIO: Inconsistencia en Claves de localStorage**

**Problema:**
- Algunos lugares usan `"giuli-books"` hardcodeado
- Otros usan `LOCAL_STORAGE_BOOKS_KEY` de `config.ts`
- Valor real: `"mis-lecturas-books"` (diferente al hardcodeado)

**Ubicaciones:**
- Hardcodeado: `app/actions.ts` (líneas 77, 131, 247, 314)
- Config: `lib/local-storage.ts`, `lib/config.ts`

**Riesgo:** Datos en diferentes claves = pérdida de datos

#### **🟡 MEDIO: Race Conditions en Sincronización**

**Problema:**
- `syncLocalBooks()` no tiene lock
- Múltiples llamadas simultáneas pueden:
  - Duplicar sincronizaciones
  - Sobrescribir cambios
  - Perder actualizaciones

**Evidencia:**
- `SyncStatus` verifica cada 30 segundos
- Usuario puede hacer clic múltiples veces en "Sincronizar"
- No hay flag `isSyncing` compartido globalmente

### 2.2 localStorage

#### **🔴 CRÍTICO: No Hay Validación de Esquema**

**Problema:**
- `getLocalBooks()` parsea JSON sin validar estructura
- Si localStorage está corrupto → app crashea o muestra datos inválidos

**Código actual:**
```typescript
const books = JSON.parse(booksJson) // Sin try-catch de validación
return books // Puede ser cualquier cosa
```

#### **🟡 MEDIO: Merge Logic Compleja y Propensa a Errores**

**Ubicación:** `lib/books.ts` líneas 76-98

**Problema:**
- Merge manual con `Map` para evitar duplicados
- Lógica de prioridad no clara (Supabase vs local)
- Puede perder libros si `id` y `local_id` no coinciden

#### **🟡 MEDIO: Inicialización con Timeout Arbitrario**

**Ubicación:** `lib/books.ts` líneas 6-11

**Problema:**
```typescript
setTimeout(() => {
  initializeLocalStorage().catch(console.error)
}, 1000) // ¿Por qué 1000ms? ¿Es suficiente?
```

**Riesgo:** Si tarda más de 1s, no se inicializa

### 2.3 Sincronización Supabase

#### **🔴 CRÍTICO: RLS Policies No Funcionan Correctamente**

**Problema:**
- RLS usa `auth.uid() = user_id`
- App usa `user_id` fijo (`aebaf7a8-0d83-403c-b5f4-9d798b74e3ee`)
- Supabase Auth no está activo → `auth.uid()` es `null`
- **Resultado:** RLS bloquea todas las operaciones (o está deshabilitado)

**Evidencia:**
- `lib/supabase-debug.ts` tiene función `checkRLSPolicies()` que intenta insertar libro de prueba
- Si RLS estuviera activo correctamente, fallaría

#### **🟡 MEDIO: No Hay Manejo de Errores de Red Transitorios**

**Problema:**
- Si Supabase falla (timeout, 500, etc.) → se marca como `pending_sync`
- No hay retry automático
- No hay diferenciación entre error permanente vs transitorio

#### **🟡 MEDIO: Sincronización Secuencial (Lenta)**

**Ubicación:** `lib/local-storage.ts` línea 115

**Problema:**
```typescript
for (const book of pendingBooks) {
  // Procesa uno por uno
  await supabase.from("books").insert([...])
}
```

**Riesgo:** Con muchos libros pendientes, tarda mucho tiempo

### 2.4 Middleware/Auth

#### **🟡 MEDIO: Middleware Solo Verifica Cookie, No Estado Real**

**Ubicación:** `middleware.ts` línea 16

**Problema:**
```typescript
const isAuthenticated = req.cookies.has("auth-status")
```

**Riesgo:**
- Cookie puede existir pero localStorage no (o viceversa)
- No valida que el usuario realmente tenga sesión
- No verifica expiración

#### **🟡 MEDIO: Dos Sistemas de Auth Coexisten**

**Problema:**
- `lib/simple-auth.ts`: Activo
- `lib/auth.ts`: Implementado pero no usado
- Confusión sobre cuál usar
- Código muerto que puede causar bugs

### 2.5 Efectos Secundarios en Componentes

#### **🟡 MEDIO: Múltiples Listeners de Eventos Sin Cleanup Consistente**

**Ubicación:** `app/dashboard/page.tsx` líneas 99-117

**Problema:**
```typescript
window.addEventListener("booksUpdated", handleBooksUpdated)
window.addEventListener("popstate", handleRouteChange)
// Cleanup existe, pero puede haber memory leaks si componente se desmonta mal
```

#### **🟡 MEDIO: `router.refresh()` Llamado Múltiples Veces**

**Ubicación:** Varios componentes

**Problema:**
- `router.push()` + `router.refresh()` en secuencia
- Puede causar múltiples re-renders innecesarios
- No hay debounce

#### **🟡 MEDIO: Timeouts Arbitrarios para Redirecciones**

**Ubicación:** 
- `app/page.tsx`: línea 64 (100ms)
- `components/add-book-form-with-search.tsx`: línea 189 (1500ms)

**Problema:** Valores mágicos sin justificación

---

## 3. ARCHIVOS CRÍTICOS QUE NO DEBEN TOCARSE SIN CUIDADO

### 3.1 🔴 CRÍTICOS (Cambios Pueden Romper Funcionalidad Core)

#### **`lib/local-storage.ts`**
- **Razón:** Lógica central de sincronización y almacenamiento
- **Dependencias:** Usado por todos los componentes que leen/escriben libros
- **Riesgo:** Cambiar estructura puede perder datos existentes
- **Validar antes de tocar:**
  - ¿Cómo migrar datos existentes en localStorage?
  - ¿Cómo mantener compatibilidad con `pending_sync`?
  - ¿Cómo evitar race conditions?

#### **`lib/books.ts`**
- **Razón:** Funciones de lectura que determinan fuente de datos (local vs Supabase)
- **Dependencias:** Todas las páginas que muestran libros
- **Riesgo:** Cambiar lógica de merge puede duplicar o perder libros
- **Validar antes de tocar:**
  - ¿Cómo mantener compatibilidad con datos existentes?
  - ¿Cómo probar merge logic con datos reales?

#### **`app/actions.ts`**
- **Razón:** Server Actions que coordinan Supabase + localStorage
- **Dependencias:** Todos los formularios de crear/editar/eliminar
- **Riesgo:** Cambiar flujo puede romper sincronización
- **Validar antes de tocar:**
  - ¿Cómo reemplazar `eval()` sin romper funcionalidad?
  - ¿Cómo mantener compatibilidad con `clientSideCode`?

#### **`lib/simple-auth.ts`**
- **Razón:** Sistema de autenticación activo
- **Dependencias:** Middleware, todas las páginas protegidas
- **Riesgo:** Cambiar puede bloquear acceso a toda la app
- **Validar antes de tocar:**
  - ¿Cómo migrar usuarios existentes?
  - ¿Cómo mantener compatibilidad con cookies existentes?

#### **`middleware.ts`**
- **Razón:** Protección de rutas
- **Dependencias:** Todas las rutas de la app
- **Riesgo:** Cambiar puede exponer rutas o bloquear acceso legítimo
- **Validar antes de tocar:**
  - ¿Cómo probar todos los casos de acceso?
  - ¿Cómo mantener compatibilidad con cookies existentes?

### 3.2 🟡 IMPORTANTES (Cambios Requieren Testing Extensivo)

#### **`lib/supabase.ts`**
- **Razón:** Cliente de Supabase usado en toda la app
- **Dependencias:** Todas las operaciones de DB
- **Riesgo:** Cambiar configuración puede romper conexión
- **Validar:** ¿Cómo probar cambios sin afectar producción?

#### **`lib/config.ts`**
- **Razón:** Configuración centralizada
- **Dependencias:** Múltiples módulos
- **Riesgo:** Cambiar claves puede perder datos
- **Validar:** ¿Cómo migrar datos a nuevas claves?

#### **`components/sync-status.tsx`**
- **Razón:** UI de sincronización visible al usuario
- **Dependencias:** `lib/local-storage.ts`, `app/actions.ts`
- **Riesgo:** Cambiar puede confundir al usuario sobre estado real
- **Validar:** ¿Cómo mantener consistencia con estado real?

#### **`app/dashboard/page.tsx`**
- **Razón:** Página principal con lógica compleja de carga
- **Dependencias:** `lib/books.ts`, eventos personalizados
- **Riesgo:** Cambiar puede romper carga de datos o eventos
- **Validar:** ¿Cómo probar todos los casos de carga?

### 3.3 🟢 MODERADOS (Cambios Requieren Testing Básico)

#### **Componentes de UI:**
- `components/book-card.tsx`
- `components/book-detail-dialog-enhanced.tsx`
- `components/add-book-form-with-search.tsx`
- `components/edit-book-form.tsx`

**Razón:** UI puede cambiar, pero lógica de datos debe mantenerse

---

## 4. CHECKLIST DE VALIDACIÓN PRE-REFACTORIZACIÓN

### 4.1 Estado Actual del Sistema

- [ ] **Backup de localStorage:** Exportar todos los datos de `giuli-books` / `mis-lecturas-books`
- [ ] **Backup de Supabase:** Exportar tabla `books` completa
- [ ] **Documentar estado de RLS:** ¿Está activo? ¿Funciona con `user_id` fijo?
- [ ] **Inventario de claves localStorage:** Listar todas las claves usadas
- [ ] **Contar libros pendientes:** ¿Cuántos tienen `pending_sync: true`?
- [ ] **Verificar consistencia:** ¿Hay diferencias entre localStorage y Supabase?

### 4.2 Testing de Funcionalidad Actual

- [ ] **Crear libro offline:** ¿Se guarda en localStorage con `pending_sync: true`?
- [ ] **Crear libro online:** ¿Se guarda en ambos (localStorage + Supabase)?
- [ ] **Sincronizar pendientes:** ¿Se sincronizan correctamente?
- [ ] **Editar libro offline:** ¿Se marca como `pending_sync: true`?
- [ ] **Eliminar libro offline:** ¿Se elimina de localStorage?
- [ ] **Cargar página sin conexión:** ¿Muestra libros de localStorage?
- [ ] **Cargar página con conexión:** ¿Actualiza localStorage con datos de Supabase?
- [ ] **Race condition:** ¿Qué pasa si se sincroniza dos veces rápido?
- [ ] **Datos corruptos:** ¿Qué pasa si localStorage tiene JSON inválido?

### 4.3 Validación de Dependencias

- [ ] **Mapear imports:** ¿Qué archivos importan los críticos?
- [ ] **Identificar código muerto:** ¿Se usa `lib/auth.ts` en algún lugar?
- [ ] **Verificar eventos:** ¿Dónde se dispara `booksUpdated`?
- [ ] **Verificar listeners:** ¿Dónde se escucha `booksUpdated`?
- [ ] **Identificar eval():** ¿Cuántos lugares usan `clientSideCode`?

### 4.4 Validación de Configuración

- [ ] **Variables de entorno:** ¿Todas las necesarias están definidas?
- [ ] **Claves de localStorage:** ¿Son consistentes en todo el código?
- [ ] **User ID:** ¿Es siempre el mismo o puede cambiar?
- [ ] **Supabase URL/Key:** ¿Son correctas y accesibles?

---

## 5. CHECKLIST DE VALIDACIÓN POST-REFACTORIZACIÓN

### 5.1 Funcionalidad Core

- [ ] **Crear libro:** Funciona offline y online
- [ ] **Editar libro:** Funciona offline y online
- [ ] **Eliminar libro:** Funciona offline y online
- [ ] **Sincronizar:** Sincroniza todos los pendientes correctamente
- [ ] **Cargar datos:** Prioriza localStorage, actualiza desde Supabase
- [ ] **Merge:** No duplica libros, mantiene pendientes

### 5.2 Integridad de Datos

- [ ] **No pérdida de datos:** Todos los libros existentes siguen accesibles
- [ ] **Consistencia:** localStorage y Supabase están sincronizados
- [ ] **Pendientes:** Libros con `pending_sync: true` se pueden sincronizar
- [ ] **IDs:** `id` y `local_id` se mantienen correctamente

### 5.3 Performance

- [ ] **Carga inicial:** No tarda más de 2s en cargar dashboard
- [ ] **Sincronización:** No bloquea UI durante sync
- [ ] **Memory leaks:** No hay leaks de event listeners
- [ ] **Re-renders:** No hay re-renders innecesarios

### 5.4 Edge Cases

- [ ] **Sin conexión al inicio:** App funciona completamente offline
- [ ] **Pérdida de conexión durante sync:** No pierde datos
- [ ] **localStorage lleno:** Maneja error gracefully
- [ ] **Datos corruptos:** Valida y recupera o limpia
- [ ] **Múltiples tabs:** No hay conflictos entre tabs
- [ ] **Sincronización concurrente:** No duplica operaciones

### 5.5 Seguridad

- [ ] **No eval():** Eliminado completamente
- [ ] **Validación de datos:** Todos los inputs se validan
- [ ] **Sanitización:** Datos se sanitizan antes de guardar
- [ ] **Auth:** Sistema de auth funciona correctamente

### 5.6 UX

- [ ] **Feedback visual:** Usuario sabe cuándo está sincronizando
- [ ] **Errores:** Mensajes de error son claros y accionables
- [ ] **Loading states:** Hay indicadores de carga apropiados
- [ ] **Offline indicator:** Usuario sabe cuándo está offline

---

## 6. RIESGOS FUNCIONALES IDENTIFICADOS

### 6.1 🔴 ALTO RIESGO

1. **Pérdida de datos por inconsistencia de claves localStorage**
   - **Probabilidad:** Media
   - **Impacto:** Alto
   - **Mitigación:** Estandarizar clave antes de refactorizar

2. **RLS bloqueando operaciones si se activa correctamente**
   - **Probabilidad:** Alta (si se corrige RLS)
   - **Impacto:** Crítico (app no funciona)
   - **Mitigación:** Revisar y ajustar RLS antes de refactorizar

3. **Race conditions en sincronización causando duplicados**
   - **Probabilidad:** Media
   - **Impacto:** Medio
   - **Mitigación:** Implementar lock/queue antes de refactorizar

### 6.2 🟡 MEDIO RIESGO

1. **Eval() comprometido por inyección de código**
   - **Probabilidad:** Baja (pero posible)
   - **Impacto:** Crítico
   - **Mitigación:** Eliminar eval() en refactorización

2. **Merge logic perdiendo libros en edge cases**
   - **Probabilidad:** Baja
   - **Impacto:** Alto
   - **Mitigación:** Testing exhaustivo de merge

3. **Timeout de inicialización causando datos no inicializados**
   - **Probabilidad:** Baja
   - **Impacto:** Medio
   - **Mitigación:** Reemplazar timeout con promise-based init

### 6.3 🟢 BAJO RIESGO

1. **Memory leaks por event listeners**
   - **Probabilidad:** Baja
   - **Impacto:** Bajo (solo afecta performance a largo plazo)
   - **Mitigación:** Revisar cleanup en refactorización

2. **Múltiples re-renders innecesarios**
   - **Probabilidad:** Media
   - **Impacto:** Bajo (solo afecta performance)
   - **Mitigación:** Optimizar en refactorización

---

## 7. NOTAS ADICIONALES

### 7.1 Código Muerto

- `lib/auth.ts`: Implementado pero no usado (Supabase Auth)
- Posible código no usado en otros archivos (revisar con herramientas)

### 7.2 Inconsistencias de Nomenclatura

- `giuli-books` vs `mis-lecturas-books` (claves localStorage)
- `giuli-reading-app-auth` vs `mis-lecturas-auth` (claves auth)
- Estandarizar antes de refactorizar

### 7.3 Dependencias Externas

- **Google Books API:** Sin rate limiting aparente (riesgo de bloqueo)
- **Supabase:** Dependencia crítica, sin fallback si falla
- **Vercel Blob Storage:** Usado para imágenes (verificar si es crítico)

---

## 8. RECOMENDACIONES PARA REFACTORIZACIÓN

### 8.1 Prioridades

1. **Eliminar `eval()`** - Crítico para seguridad
2. **Estandarizar claves localStorage** - Crítico para integridad de datos
3. **Implementar lock en sincronización** - Importante para evitar race conditions
4. **Revisar y corregir RLS** - Crítico si se quiere usar Supabase Auth
5. **Reemplazar timeouts con promises** - Mejora de robustez

### 8.2 Orden Sugerido

1. **Fase 1: Preparación**
   - Backup de datos
   - Estandarizar claves
   - Documentar estado actual

2. **Fase 2: Eliminar eval()**
   - Crear funciones helper para localStorage
   - Reemplazar `clientSideCode` con llamadas directas
   - Testing exhaustivo

3. **Fase 3: Mejorar sincronización**
   - Implementar lock/queue
   - Agregar retry logic
   - Testing de race conditions

4. **Fase 4: Limpieza**
   - Eliminar código muerto
   - Optimizar performance
   - Mejorar error handling

---

**FIN DEL DOCUMENTO**


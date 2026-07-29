# Guía de Frontend Moderno: De los Fundamentos a la Arquitectura Avanzada en NoteDraftForge

Esta guía está diseñada como un documento de referencia técnica de alto nivel para entrevistas de ingeniería Frontend (Senior / Lead / Staff). Repasa desde los conceptos fundamentales del frontend moderno hasta los patrones arquitectónicos y algoritmos avanzados implementados en **NoteDraftForge**.

---

## Índice

1. [Arquitectura y Principios de Diseño Frontend](#1-arquitectura-y-principios-de-diseño-frontend)
2. [El Ciclo de Vida de un Componente: React vs. Angular](#2-el-ciclo-de-vida-de-un-componente-react-vs-angular)
3. [Gestión de Estado y Flujo de Datos Offline-First](#3-gestión-de-estado-y-flujo-de-datos-offline-first)
4. [Integración con Editores Rich-Text y Manipulación del DOM](#4-integración-con-editores-rich-text-y-manipulación-del-dom)
5. [Algoritmos Avanzados de Renderizado y Maquetación de Anotaciones](#5-algoritmos-avanzados-de-renderizado-y-maquetación-de-anotaciones)
6. [Rendimiento, Optimización Visual y UX Mobile-First](#6-rendimiento-optimización-visual-y-ux-mobile-first)
7. [Estrategia de Testing y Calidad](#7-estrategia-de-testing-y-calidad)
8. [Preguntas Clave de Entrevistas Técnicas y Respuestas Modelo](#8-preguntas-clave-de-entrevistas-técnicas-y-respuestas-modelo)

---

## 1. Arquitectura y Principios de Diseño Frontend

### 1.1 Arquitectura Hexagonal (Puertos y Adaptadores) + DDD en el Frontend
* **Concepto Teórico**: Tradicionalmente, las aplicaciones frontend acoplan la lógica de negocio a los componentes de UI o al framework (React/Vue). La **Arquitectura Hexagonal** aísla el núcleo de dominio (`Core Domain`) del framework y de los detalles de infraestructura (HTTP, IndexedDB, LocalStorage).
* **Cómo se implementa en NoteDraftForge**:
  * **Capa de Dominio (`src/core/domain/`)**: Contiene las entidades puras (`Piece`, `Annotation`), Objetos de Valor (`TextRangeTarget`, `BreathContent`), invariantes de negocio y fábricas (`createPiece`, `createAnnotation`). **Regla estricta**: Cero dependencias de React, Tiptap, Dexie, IndexedDB o Tailwind.
  * **Capa de Aplicación (`src/core/application/`)**: Define los casos de uso (`CreateAnnotationUseCase`, `GetPieceUseCase`, `DeleteAnnotationUseCase`, `AutosavePieceUseCase`). Depende únicamente de las interfaces de entrada/salida (**Puertos**).
  * **Capa de Infraestructura (`src/core/infrastructure/`)**: Implementa los puertos mediante **Adaptadores** concretos (`DexiePieceRepository`, `DexieAnnotationRepository`, `MarkedParserAdapter`).
  * **Capa de Presentación UI (`src/ui/`)**: Componentes de React, hooks y modales que invocan casos de uso sin conocer los detalles del almacenamiento de datos.
* **Valor para Entrevistas**: *Demuestra madurez arquitectónica. Permite cambiar React por Svelte o Dexie por SQLite en React Native sin modificar ni una línea de la lógica de negocio ni de las pruebas de dominio.*

### 1.2 Seguridad de Tipos Fuerte: TypeScript + Zod
* **Concepto Teórico**: TypeScript garantiza seguridad de tipos en tiempo de compilación (*static typing*), mientras que Zod realiza validación estructural e inferencia de tipos en tiempo de ejecución (*runtime validation*).
* **Cómo se implementa en NoteDraftForge**:
  * **Uniones Discriminadas (Discriminated Unions)**: Utilizadas para diferenciar tipos de contenido de obras (`PoemContent | TextContent | SongContent`) y tipos de blanco de anotaciones (`TextRangeTarget | TextNodeTarget`).
  * **Validación Zod para Resiliencia**: Al importar copias de seguridad o procesar archivos JSON externos, Zod valida la estructura antes de que los datos ingresen al dominio, evitando errores `undefined` silenciosos en la UI.

---

## 2. El Ciclo de Vida de un Componente: React vs. Angular

El ciclo de vida de un componente describe las etapas por las que pasa una pieza de la interfaz: **Creación/Montado**, **Actualización** y **Destrucción/Desmontado**.

### 2.1 Tabla Comparativa de Equivalencias: Angular vs. React

| Fase del Ciclo de Vida | Angular (Lifecycle Hooks) | React (Componentes Funcionales + Hooks) | React (Componentes de Clase - Legacy) |
|---|---|---|---|
| **Inicialización** | `constructor()` / Inyección de dep. | Cuerpo de la función del componente | `constructor(props)` |
| **Cambios en Inputs/Props** | `ngOnChanges(changes)` | `useEffect(() => {}, [prop1, prop2])` o derivar en render | `componentDidUpdate(prevProps)` / `getDerivedStateFromProps` |
| **Montado en DOM (Mount)** | `ngOnInit()` | `useEffect(() => {}, [])` (post-render) / `useLayoutEffect` (síncrono) | `componentDidMount()` |
| **Verificación de Vista/DOM** | `ngAfterViewInit()` / `ngAfterViewChecked()` | `useLayoutEffect()` / `useEffect()` con `useRef` | `componentDidMount()` / `componentDidUpdate()` |
| **Re-render / Chequeo** | `ngDoCheck()` | Re-ejecución de la función componente al cambiar state/prop | `shouldComponentUpdate()` / `componentDidUpdate()` |
| **Desmontado / Limpieza** | `ngOnDestroy()` | **Función de Cleanup** devuelta en `useEffect`: `return () => { ... }` | `componentWillUnmount()` |

---

### 2.2 Diferencia Fundamental de Modelo Mental (Senior Level)

* **Modelo Mental de Angular**: **Orientado a Eventos Imperativos del Framework**. Angular dispara callbacks explícitos (`ngOnInit`, `ngOnChanges`, `ngOnDestroy`) cuando el motor de Change Detection detecta eventos específicos en el ciclo de vida del componente.
* **Modelo Mental de React Moderno (Hooks)**: **Sincronización Declarativa de Efectos Secundarios**.
  * En React funcional, `useEffect` **NO es simplemente la combinación de `componentDidMount` + `componentDidUpdate` + `componentWillUnmount`**.
  * `useEffect` representa un **efecto de sincronización con un sistema externo** (el DOM, un event listener, IndexedDB, un timer). Se ejecuta cuando los valores reactivos declarados en su arreglo de dependencias `[deps]` cambian entre renders.

---

### 2.3 Casos de Uso del Ciclo de Vida en NoteDraftForge

#### 1. Limpieza de Event Listeners al Desmontar (Equivalente a `ngOnDestroy`)
En `WorkViewPage.tsx`, nos suscribimos al evento nativo del navegador `selectionchange`. Si el componente se desmonta o cambia de modo (`activeMode`), **debemos eliminar el listener** para evitar fuga de memoria (*memory leaks*) o listeners duplicados:

```typescript
useEffect(() => {
  if (activeMode !== 'visualization') return;

  const handleSelectionChange = () => {
    // Inspección de selección de texto en la vista de lectura
  };

  document.addEventListener('selectionchange', handleSelectionChange);

  // FUNCIÓN DE CLEANUP: Equivalente estricto a ngOnDestroy de Angular
  return () => {
    document.removeEventListener('selectionchange', handleSelectionChange);
  };
}, [activeMode]); // Se re-ejecuta cuando cambia activeMode
```

#### 2. Vaciado Imperativo de Temporizadores (Autosave Cleanup)
Al desmontar el editor o cambiar de pantalla, aseguramos que cualquier guardado automático pendiente (`pendingContentRef`) se escriba en IndexedDB inmediatamente cancelando el timer activo:

```typescript
useEffect(() => {
  return () => {
    // Al salir de la pantalla, limpiamos el timer y forzamos el autosave
    if (autosaveTimerRef.current) {
      clearTimeout(autosaveTimerRef.current);
      flushAutosave();
    }
  };
}, [flushAutosave]);
```

#### 3. `useEffect` vs `useLayoutEffect`
* **`useEffect`** (Asíncrono): Se ejecuta **después** de que el navegador ha pintado la pantalla (*paint*). Ideal para llamadas asíncronas (consultar IndexedDB), suscripciones y analíticas sin bloquear el renderizado visual.
* **`useLayoutEffect`** (Síncrono): Se ejecuta **después de mutar el DOM pero antes del pintado del navegador**. Ideal para medir dimensiones de elementos del DOM (`getBoundingClientRect`), ajustar posiciones de scroll o posicionar barras de herramientas flotantes sin destellos visuales (*flicker*).

---

## 3. Gestión de Estado y Flujo de Datos Offline-First

### 3.1 Patrón Offline-First (Local-First Architecture)
* **Concepto Teórico**: Las aplicaciones tradicionales dependen del servidor como fuente primaria de verdad. En una arquitectura **Offline-First**, el almacenamiento local del navegador (IndexedDB) es la fuente de verdad inmediata, permitiendo latencia cero y funcionamiento continuo sin conexión a red.
* **Cómo se implementa en NoteDraftForge**:
  * **Persistencia Indexada con Dexie.js**: Encapsula IndexedDB en repositorios reactivos basados en promesas.
  * **Contadores de Revisión e Inmutabilidad**: Cada modificación incrementa la versión de revisión de la entidad (`piece.revision + 1`) y actualiza `updatedAt`.

### 3.2 Estrategia de Colocación del Estado (State Colocation)
Para evitar la contaminación del estado global y re-renders innecesarios, organizamos el estado en 3 capas bien definidas:

| Capa de Estado | Tecnología / Ubicación | Propósito | Ejemplo en NoteDraftForge |
|---|---|---|---|
| **Estado de Dominio** | IndexedDB / Casos de uso | Entidades persistentes de la aplicación | Obras (`Piece`), Anotaciones (`Annotation`) |
| **Estado UI Global** | Zustand (`useUIStore`) | Estado efímero de sesión y preferencias | Modo de vista (`editing` vs `visualization`), modales abiertos |
| **Estado Local de Componente** | React `useState` / `useRef` | Estado efímero de un componente | Texto de selección, valores de formulario en `AnnotationModal` |

---

## 4. Integración con Editores Rich-Text y Manipulación del DOM

### 4.1 Integración de Tiptap y Modelo de Documentos
* **Concepto Teórico**: Los editores `contenteditable` nativos son propensos a inconsistencias entre navegadores. Tiptap (basado en ProseMirror) abstrae el contenido en un árbol de sintaxis abstracta (AST) inmutable.
* **Cómo se implementa en NoteDraftForge**:
  * **Mapeador Bidireccional (`tiptap-mapper.ts`)**: Transforma el AST de ProseMirror al modelo de bloques del dominio (`PieceContent` con `TextBlock` y `TextRun`) al guardar, y viceversa al cargar.

### 4.2 La API de Selecciones Nativa (`Selection` & `Range`)
* **Concepto Teórico**: La API `window.getSelection()` y `document.createRange()` permite inspeccionar los límites exactos de los nodos de texto seleccionados por el usuario.
* **Reto en NoteDraftForge**: Convertir los nodos del DOM nativo del navegador (que varían según el marcado HTML) a desplazamientos numéricos absolutos (`startOffset` y `endOffset`) basados en el texto plano del bloque del dominio.

---

## 5. Algoritmos Avanzados de Renderizado y Maquetación de Anotaciones

Uno de los desafíos más complejos del proyecto consistió en maquetar visualmente tres capas de anotaciones (`respiración`, `intención`, `comentario`) directamente sobre el texto de lectura sin alterar el flujo de lectura ni duplicar palabras.

### 5.1 Algoritmo de Segmentación por Puntos de Frontera (Boundary Segmentation)
* **El Problema**: Si múltiples anotaciones solapan el mismo texto (ej. una *Intención* y un *Comentario* sobre la frase *"Caminante no hay camino"*), renderizar cada anotación de forma independiente provocaba la duplicación del texto en el DOM (ej. *"Caminante Caminante no hay camino"*).
* **La Solución Algorítmica**:
  1. Recolectar todos los puntos de inicio y fin de las anotaciones de un bloque en un conjunto único `Set<number>`.
  2. Ordenar las fronteras numéricas de forma ascendente: `[0, p1, p2, ..., len]`.
  3. Partitionar el texto en intervalos disjuntos consecutivos `[pos, nextPos]`.
  4. Renderizar cada segmento de texto (`segmentText`) **una sola vez** en el Virtual DOM, envolviéndolo en las clases decorativas de fondo según las anotaciones que lo cubren.

```
Texto original:  |--- C a m i n a n t e ---|
Anotación 1:     |====== (Intención) =====| (0..9)
Anotación 2:     |====== (Comentario) ====| (0..9)
Segmentación:    [0 -------------------- 9]
Renderizado:     Texto "Caminante" se renderiza 1 SOLA VEZ con ambas notas apiladas.
```

### 5.2 Algoritmo de Asignación de Pistas/Líneas (`computeTrackMap`)
* **El Problema**: Las frases manuscritas flotantes (`shortNote` en fuente *Caveat*) se colisionaban horizontalmente o se cortaban si aparecía un comentario largo sobre una frase.
* **La Solución Algorítmica**:
  1. Concebir las líneas superiores al texto como pistas horizontales paralelas: **Pista 0** (`-16px`), **Pista 1** (`-38px`), **Pista 2** (`-60px`).
  2. Mantener un arreglo `trackEndOffsets: number[]` para rastrear la posición de carácter hasta la cual está ocupada cada pista.
  3. Al procesar cada anotación en su punto de inicio `s`, buscar la primera pista `tr` donde `trackEndOffsets[tr] <= s`.
  4. Si la Pista 0 está libre, asignar la nota a la Pista 0. Si está ocupada por una nota anterior larga, asignarla a la Pista 1. Si más adelante en la obra la Pista 0 queda libre, las anotaciones posteriores **vuelven a reutilizar la Pista 0**.
  5. Renderizar cada etiqueta manuscrita de una sola pieza en su punto de inicio (`pos === startOffset`).

```
Línea 2 (-38px):              [ Énfasis B ]
Línea 1 (-16px):  [ Pausa muy larga A ]             [ Nota C ]
Texto plano:      C a m i n a n t e   n o   h a y   c a m i n o
```

### 5.3 Cálculo de Desplazamientos DOM Aislado de Metadatos (`data-annotation-ignore`)
* **El Problema**: `Range.toString()` concatena el texto de todos los nodos DOM contenidos en un elemento. Si ya existían etiquetas manuscritas (ej. *"Pausa dramática"*) en el DOM, `Range.toString()` contaba esas letras y desplazaba erróneamente el offset de las selecciones posteriores.
* **La Solución Algorítmica**:
  1. Marcar todos los elementos explicativos flotantes con el atributo `data-annotation-ignore="true"`.
  2. Implementar un iterador de nodos de texto nativo (`walk`) que verifica si el nodo o sus ancestros poseen dicho atributo.
  3. Excluir dichos nodos en `getRangeOffsetsRelativeToElement` y `setRangeOffsetsRelativeToElement`, garantizando un cálculo de desplazamientos 100% puro contra el texto original de la obra.

---

## 6. Rendimiento, Optimización Visual y UX Mobile-First

### 6.1 Ocultación de Capas por CSS Puro (Zero JS Re-render)
* **Concepto Teórico**: Evitar el re-renderizado del árbol de React cuando el usuario alterna la visibilidad de capas visuales (respiración, intención, comentarios).
* **Cómo se implementa en NoteDraftForge**:
  * Los elementos de anotaciones incluyen clases semánticas (`.ndf-layer-breath`, `.ndf-layer-intention`).
  * Al conmutar una capa, se añade una clase global al contenedor (`.ndf-hide-breath`).
  * Reglas CSS puras (`display: none`) ocultan los elementos instantáneamente a 60 FPS sin invocar la reconciliación del Virtual DOM en React.

### 6.2 Optimización para Dispositivos Móviles
* **Manejo del Teclado Virtual**: Ajuste dinámico de barras de herramientas mediante `visualViewport` y `sticky` para evitar que el teclado nativo tape los controles.
* **Protección Contra Doble-Envío**: Banderas `isSubmitting` e `isProcessingMode` en botones para evitar llamadas asíncronas duplicadas y carreras de condición.

---

## 7. Estrategia de Testing y Calidad

### 7.1 Pruebas Unitarias de Capa de Aplicación y Dominio (Vitest)
* **Enfoque**: Pruebas de ejecución en milisegundos que evalúan reglas de negocio, invariantes y casos de uso en aislamiento estricto sin dependencias del DOM ni del navegador (128 pruebas unitarias pasando).

### 7.2 Pruebas de Integración y E2E (Playwright)
* **Enfoque**: Verificación de flujos de usuario completos (creación de obras, edición rich-text, selecciones en el visor y responsividad en viewports móviles vs escritorio).

---

## 8. Preguntas Clave de Entrevistas Técnicas y Respuestas Modelo

### Pregunta 1: "¿Por qué aplicar Arquitectura Hexagonal y DDD en un proyecto Frontend en lugar de la estructura tradicional por carpetas de React?"
> **Respuesta Modelo**: "El principal problema de las aplicaciones React tradicionales es que la lógica de negocio queda dispersa dentro de componentes y hooks, haciendo imposible cambiar de framework, actualizar librerías o probar la lógica sin mockear el DOM. Con Arquitectura Hexagonal y DDD, encapsulamos el dominio en JS/TS puro sin dependencias externas. Los casos de uso operan contra interfaces (puertos), y React es simplemente un adaptador de entrada. Esto nos permite ejecutar 128 pruebas unitarias en 1 segundo y garantiza que si el día de mañana migramos a React Native o Svelte, el núcleo de la aplicación permanezca intacto."

### Pregunta 2: "¿Cómo se relaciona el ciclo de vida de un componente en Angular con React funcional?"
> **Respuesta Modelo**: "En Angular el ciclo de vida está basado en hooks de eventos imperativos (`ngOnInit`, `ngOnChanges`, `ngOnDestroy`). En React funcional pasamos a un modelo declarativo basado en **efectos de sincronización** (`useEffect`). 
> - `ngOnInit` equivale a un `useEffect` con arreglo de dependencias vacío `[]`.
> - `ngOnChanges` se resuelve pasando las props específicas al arreglo de dependencias `[propA, propB]`.
> - `ngOnDestroy` equivale a la **función de retorno de limpieza (cleanup function)** dentro de `useEffect`.
> Es crucial resaltar que `useEffect` no es solo para eventos de montado/desmontado, sino para mantener el componente sincronizado con sistemas externos (DOM, timers, eventos). Para mediciones síncronas del DOM antes del pintado del navegador (equivalente a `ngAfterViewInit`), utilizamos `useLayoutEffect`."

### Pregunta 3: "¿Cómo manejaron los problemas de rendimiento y solapamiento al renderizar anotaciones sobre un texto en lectura?"
> **Respuesta Modelo**: "Nos enfrentamos a dos retos principales: duplicación de texto y colisión de notas flotantes. Lo resolvimos con un enfoque algorítmico en dos partes:
> 1. **Segmentación por Puntos de Frontera**: Extraemos todas las posiciones de inicio y fin de las anotaciones para dividir el texto en tramos disjuntos. Esto garantiza que cada fragmento de texto se renderice exactamente una sola vez.
> 2. **Asignación por Pistas (Track Allocation)**: Diseñamos un algoritmo de pistas horizontales (Línea 1, Línea 2, Línea 3) que rastrea los rangos ocupados. Si una nota flotante cabe en la Línea 1 la ubica allí; si está ocupada pasa a la Línea 2; y cuando la nota anterior termina más adelante en el texto, las notas siguientes vuelven a reutilizar la Línea 1 automáticamente.
> Además, aislamos el cálculo de desplazamientos DOM marcando los elementos explicativos con `data-annotation-ignore="true"`, evitando que `Range.toString()` desplace los offsets al seleccionar texto existente."

### Pregunta 4: "¿Cuál es su estrategia para gestionar el estado en una aplicación Offline-First?"
> **Respuesta Modelo**: "Aplicamos colocación de estado estricta en tres niveles:
> 1. **Estado de Dominio / Persistente**: Vive en IndexedDB (a través de Dexie.js), garantizando persistencia offline y cero latencia de red. Cada cambio incrementa un contador de revisión de entidad.
> 2. **Estado de Sesión UI Global**: Utiliza Zustand para manejar preferencias efímeras de la interfaz, como el modo activo (`editing` vs `visualization`) o la visibilidad de capas.
> 3. **Estado Local de Componente**: Se mantiene en `useState` o `useRef` para selecciones efímeras y campos de entrada en modales.
> Además, la alternancia de visibilidad de capas se realiza mediante clases CSS sobre el contenedor principal (`display: none`), logrando un rendimiento de 60 FPS sin provocar re-renderizados en React."

# NoteDraftForge

**A Local-First, Spec-Driven Structured Editor for Poems, Songs, and Performance Flows.**  
Built with Hexagonal Architecture and Domain-Driven Design (DDD), where every feature is engineered against strict specifications.

---

## 🌟 Overview

NoteDraftForge is a **private-first, structured editor** designed for poets, lyricists, and spoken-word performers. Unlike plain text or generic Markdown editors, NoteDraftForge cleanly decouples:
- **Canonical Content:** Structured AST of verses, paragraphs, strophes, and song cells (with chords and meter).
- **Interpretation Layers:** Performance annotations (`breath`, `intent`, `comment`) anchored to exact domain targets without polluting the text.
- **Performance Flows (Workspaces):** Hierarchical sequence graphs, reading paths, composite setlists, and live audition reading surfaces with reactive decision points.

---

## 🏛️ System Architecture

NoteDraftForge is composed of an autonomous **Local-First Frontend Client** and an optional ecosystem of **Quarkus Cloud & Serverless Satellite Services**.

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      NoteDraftForge Ecosystem                           │
├─────────────────────────────────────────┬───────────────────────────────┤
│    Frontend Client (ndf-react)          │  Backend Satellites (Quarkus) │
│    • Local-First (IndexedDB / Dexie)    │  • Maven Multi-Module         │
│    • Zero Server Lock-In                │  • API-First (OpenAPI 3.0)    │
│    • Visual Canvas & Live Audition      │  • AWS Lambda / Serverless    │
│    • YAML Frontmatter Lossless Sync     │  • Hexagonal Dual Vaults      │
│      (Local, PostgreSQL, GitHub Repo)   │    (PostgreSQL / GitHub Git)  │
└─────────────────────────────────────────┴───────────────────────────────┘
```

---

## 🚀 Key Features

* ✍️ **Structured Creative Writing:** Atomic creative units (`Piece`) supporting text, poems, and song structures with chord/meter channels.
* 🎭 **Layered Interpretation & Snapshots:** Toggleable visual channels with pre-rendered DOM snapshots for instant performance on stage.
* 🗺️ **Performance Flows & Workspaces:** Visual canvas for sequencing pieces, nesting composite workspaces, and real-time transitive traceability mapping.
* 🎙️ **Live Audition Mode:** Continuous reading surface with interactive branch selection buttons for stage recitals and rehearsals.
* 🔒 **Local-First & Sovereign Sync:** Works 100% offline via IndexedDB. Supports bidirectional Markdown import/export with YAML Frontmatter and dual-adapter cloud sync (PostgreSQL or personal GitHub repository).

---

## 🛠️ Tech Stack & Quality Gates

* **Frontend (`ndf-react`):** React 18 · TypeScript · Tiptap · Dexie (IndexedDB) · Tailwind CSS · Vite · Vitest.
* **Backend (`ndf-backend`):** Quarkus 3.x · Java 21 · Maven Multi-Module · Hibernate Panache · Neo4j · LangChain4j · AWS Lambda.
* **Test Suite:** **156/156 automated tests passing** (30 test suites).
* **Quality Assurance:** Verified with **SonarQube Scanner** (0 Bugs, 0 Vulnerabilities, 0 Hotspots, 0 Code Smells).

---

## 📂 Project Structure

```
notedraftforge/
├── ndf-react/                            # Frontend Client (React 18 + Tiptap + Dexie)
│   ├── src/core/domain/                  # Pure Domain (Zero Framework Dependencies)
│   ├── src/core/application/             # Use Cases & Port Definitions
│   ├── src/core/infrastructure/          # Dexie Adapters, Tiptap Mappers, Markdown Parser
│   └── src/ui/                           # React Features, Canvas, Audition & Components
├── ndf-backend/                          # Backend Multi-Module Monorepo (Quarkus 3.x + Java 25)
│   ├── pom.xml                           # Parent POM (Quarkus BOM & Dependency Management)
│   ├── ndf-core-domain/                  # Shared Domain Library (Pure Java 25 DDD Value Objects & Aggregates)
│   ├── ndf-api-contracts/                # API-First OpenAPI 3.0 Specifications
│   ├── ndf-gateway-auth/                 # API Gateway & Security Entry Point
│   ├── ndf-service-sync-vault/           # PostgreSQL & Sovereign GitHub Git Vault Microservice
│   ├── ndf-service-showcase/             # Public Sanitized Showcase Microservice
│   ├── ndf-service-graph-knowledge/      # Neo4j & In-Memory Graph Traceability Microservice
│   └── ndf-service-ai-gateway/           # LangChain4j Poetic & Musical Writer's Assistant Microservice
├── openspec/                             # Single Source of Truth (SDD)
│   ├── domain-model.md                   # Canonical entities and invariants
│   ├── specs/                            # Feature specs (Piece, Annotation, PerformanceFlow)
│   └── specs/quarkus-satellite-backends/ # Multi-module Quarkus & Lambda backend spec
└── docs/                                 # AI Agent workflows and design proposals
```

---

## 💻 Getting Started

### Frontend (`ndf-react`)
```bash
cd ndf-react
npm install
npm run dev        # Starts local Vite development server
npm run test       # Runs all Vitest test suites (156 tests passing)
npm run build      # TypeScript type-check and production build
```

### Backend (`ndf-backend`)
```bash
cd ndf-backend
mvn clean test     # Builds and runs all JUnit 5 domain invariant tests across all modules
```

### 🐳 Running with Docker Compose

```bash
# Option A: Start the full local stack (Datastores, 5 Quarkus microservices, React UI)
docker compose up --build

# Option B: Start only infrastructure datastores (PostgreSQL 5432 & Neo4j 7474/7687) for local Quarkus dev mode
docker compose -f docker-compose.infra.yml up -d
```

---

## 👤 Author

**Carlos López García** — [carloslg-dev.github.io/site](https://carloslg-dev.github.io/site)

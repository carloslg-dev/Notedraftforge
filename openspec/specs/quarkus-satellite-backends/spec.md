# NoteDraftForge — Quarkus Cloud & Serverless Backend Architecture Spec

> **Target Stack:** Quarkus 3.x · Java 25 · Maven Multi-Module · AWS Lambda / Serverless Ready  
> **Methodology:** API-First (OpenAPI 3.0) · Domain-Driven Design (DDD) · Hexagonal Architecture  
> **Philosophy:** Local-First Preserving & Sovereign Ownership. Frontend (`ndf-react`) remains autonomous; backend services provide optional synchronization (PostgreSQL or GitHub repository), public showcase, graph knowledge, and AI acceleration.

---

## 1. Architectural Vision

To prepare for enterprise production patterns and future **AWS Lambda Serverless deployments**, the backend is designed as a **Maven Multi-Module Monorepo** (`ndf-backend`).

```
                              ┌────────────────────────┐
                              │  Frontend Clients      │
                              │ (ndf-react, mobile...) │
                              └───────────┬────────────┘
                                          │ (OpenAPI 3.0 REST / JWT)
                                          ▼
                     ┌──────────────────────────────────────────┐
                     │          ndf-gateway-auth                │
                     │  (API Gateway & Security Boundary)       │
                     │  • SmallRye JWT / OIDC Auth              │
                     │  • Route Dispatcher (Public vs Private)  │
                     │  • SmallRye OpenAPI Aggregator           │
                     └──────┬─────────────┬──────────────┬──────┘
                            │             │              │
       [Authenticated Vault]│    [Public] │   [AI Stream]│
                            ▼             ▼              ▼
┌──────────────────────────────┐ ┌───────────────────┐ ┌──────────────────────────────┐
│   ndf-service-sync-vault     │ │ndf-service-showcase│ │    ndf-service-ai-gateway    │
│ (Hexagonal Dual Adapters)    │ │ (Cache + Panache) │ │ (LangChain4j + Fault Toler)  │
│ ├─ PostgreSQL (Cloud DB)     │ │ • Public Works    │ │ • Poetic Meter & Rhymes      │
│ └─ GitHub Repo (Sovereign)   │ │ • Recital Flows   │ │ • SSE Theatrical Notes       │
└──────────────┬───────────────┘ └─────────┬─────────┘ └──────────────┬───────────────┘
               │                           │                          │
               └───────────────────────────┴──────────────────────────┘
                                           │
                                           ▼
                       ┌───────────────────────────────────────┐
                       │     ndf-service-graph-knowledge       │
                       │   (Neo4j / File-backed In-Memory)     │
                       │ • PerformanceFlow Composite Graph     │
                       │ • Transitive Traceability Across Sets │
                       │ • Versionable Graph JSON in Git       │
                       └───────────────────────────────────────┘
```

---

## 2. Multi-Module Project Structure (`ndf-backend`)

This layout provides the modular isolation of Spring Modulith with the flexibility to compile each module either into a **standalone containerized microservice** or an **AWS Lambda function** (via GraalVM native binary or AWS SnapStart).

```
ndf-backend/
├── pom.xml                               # Root Parent POM (Quarkus BOM, Java 21, Plugin Mgmt)
│
├── ndf-core-domain/                      # Pure Domain Model (Zero Framework Dependencies)
│   ├── src/main/java/org/ndf/domain/
│   │   ├── model/piece/                  # Piece, TextBlock, TextRun, SongSection, SongCell
│   │   ├── model/flow/                   # PerformanceFlow, PieceNode, WorkspaceNode, BranchNode
│   │   ├── model/annotation/             # Annotation, AnnotationTarget, LayerKind
│   │   └── model/vault/                  # VaultSnapshot, RevisionCounter, BackupMetadata
│   └── pom.xml
│
├── ndf-api-contracts/                    # API-First OpenAPI 3.0 Specs & Generated Interfaces
│   ├── src/main/resources/openapi/
│   │   ├── gateway-api.yaml              # Aggregated Public & Private API Definitions
│   │   ├── sync-vault-api.yaml           # Vault Sync & History Contract
│   │   ├── showcase-api.yaml             # Public Showcase Contract
│   │   └── ai-assistant-api.yaml         # AI Poetic Gateway Contract
│   └── pom.xml                           # openapi-generator-maven-plugin for DTO generation
│
├── ndf-gateway-auth/                     # API Gateway & Security Entry Point
│   ├── src/main/java/org/ndf/gateway/
│   │   ├── security/                     # JWT Verification, Role Routing, Anonymous Filters
│   │   └── routing/                      # Reverse Proxy / Dispatcher to Sub-Services
│   └── pom.xml                           # quarkus-smallrye-jwt, quarkus-rest-client-reactive
│
├── ndf-service-sync-vault/               # Cloud & Sovereign Vault Sync Microservice / Lambda
│   ├── src/main/java/org/ndf/vault/
│   │   ├── application/                  # Use Cases & Port Interfaces
│   │   │   ├── ports/in/                 # SyncVaultUseCase, GetSnapshotUseCase
│   │   │   └── ports/out/                # VaultStoragePort (Outbound SPI interface)
│   │   └── infrastructure/               # Technical Adapters
│   │       ├── adapters/in/rest/         # JAX-RS / REST Resource Endpoints
│   │       └── adapters/out/             # Pluggable Storage Adapters
│   │           ├── postgres/             # PostgresVaultAdapter (Hibernate Panache + Flyway)
│   │           └── github/               # GitHubVaultAdapter (Git REST API / YAML Frontmatter)
│   └── pom.xml                           # quarkus-hibernate-orm-panache, quarkus-flyway, quarkus-rest-client
│
├── ndf-service-showcase/                 # Public Showcase & Social Feed Microservice / Lambda
│   ├── src/main/java/org/ndf/showcase/
│   │   ├── application/                  # Use Cases & Port Interfaces
│   │   │   ├── ports/in/                 # PublishPieceUseCase, ListPublicPiecesUseCase
│   │   │   └── ports/out/                # PublicPieceStoragePort, CachePort
│   │   └── infrastructure/               # Technical Adapters
│   │       ├── adapters/in/rest/         # Public Showcase @Path REST Resources
│   │       └── adapters/out/             # Panache Pagination, MapStruct, quarkus-cache
│   └── pom.xml                           # quarkus-cache, mapstruct
│
├── ndf-service-graph-knowledge/          # Graph Knowledge Engine Microservice / Lambda
│   ├── src/main/java/org/ndf/graph/
│   │   ├── application/                  # Use Cases & Port Interfaces
│   │   │   ├── ports/in/                 # ComputeTraceabilityUseCase, TraverseFlowUseCase
│   │   │   └── ports/out/                # GraphStoragePort (Outbound SPI interface)
│   │   └── infrastructure/               # Technical Adapters
│   │       ├── adapters/in/rest/         # Graph Query REST Endpoints
│   │       └── adapters/out/             # Dual Storage Adapters
│   │           ├── neo4j/                # Neo4jGraphAdapter (Cypher Queries)
│   │           └── file/                 # FileBackedGraphAdapter (.ndf-graph.json / In-Memory)
│   └── pom.xml                           # quarkus-neo4j, jackson
│
└── ndf-service-ai-gateway/               # AI Writer's Assistant Microservice / Lambda
    ├── src/main/java/org/ndf/ai/
    │   ├── application/                  # Use Cases & Port Interfaces
    │   │   ├── ports/in/                 # AnalyzePoeticMeterUseCase, SuggestChordsUseCase
    │   │   └── ports/out/                # AiModelPort (LLM Client interface)
    │   └── infrastructure/               # Technical Adapters
    │       ├── adapters/in/rest/         # AI Assistant @Path & SSE Stream Endpoints
    │       └── adapters/out/langchain4j/ # LangChain4j AiService & SmallRye Fault Tolerance
    └── pom.xml                           # quarkus-langchain4j, quarkus-smallrye-fault-tolerance
```

---

## 3. Module Specifications & Hexagonal Adapters

### 🔐 3.1 `ndf-gateway-auth` (API-First & Security Gateway)
* **Purpose:** Single entry point for external traffic. Validates JWT Bearer tokens and applies RBAC security.
* **API-First Rule:** Unauthenticated requests can only reach `/api/v1/showcase/**` and `/api/v1/health`. All other paths require valid user claims (`sub`, `roles`).
* **Quarkus Extensions:**
  * `quarkus-smallrye-jwt`: Token parsing and claim injection (`@Claim("sub") String userId`).
  * `quarkus-smallrye-openapi` & `quarkus-swagger-ui`: Unified API documentation catalog.
  * `quarkus-rest-client-reactive`: Reactive proxying to internal backend modules.

---

### 📦 3.2 `ndf-service-sync-vault` (Hexagonal Dual-Vault Sync)
* **Purpose:** Stores complete document revisions and snapshots when works are marked finished.
* **Dual Storage Strategy (Hexagonal Pluggability):**
  1. **PostgreSQL Adapter (`cloud` mode):** Multi-tenant SQL storage with optimistic locking (`revision`), ACID transactions, and Flyway migrations.
  2. **GitHub Repository Adapter (`sovereign` mode):** Commits works directly as Markdown files with YAML frontmatter headers to the user's personal GitHub repository (private or public).
* **Configuration:** Toggled seamlessly in `application.properties`:
  ```properties
  ndf.vault.storage-mode=github # or 'postgres'
  ndf.vault.github.token=${GITHUB_TOKEN}
  ndf.vault.github.repo-owner=${GITHUB_USER}
  ```

---

### 🌐 3.3 `ndf-service-showcase` (Public Sanitized Showcase)
* **Purpose:** High-throughput public feed. Filters out rehearsal annotations (`intent`, `comment`), exposes public text blocks, verses, chords, and compiled recital flows.
* **Quarkus Extensions:**
  * `quarkus-cache`: In-memory caching with `@CacheResult(cacheName = "public-works")` and `@CacheInvalidate`.
  * `mapstruct`: Compile-time DTO mapper without reflection overhead.
  * `Panache` pagination: `list("status = ?1 order by publishedAt desc", Page.of(page, size))`.

---

### 🕸️ 3.4 `ndf-service-graph-knowledge` (Dual-Mode Graph Engine)
* **Purpose:** Maps the composite network of `PerformanceFlow` (Workspaces, setlists, composite nodes, branches).
* **Storage Modes:**
  1. **Neo4j Cypher Adapter:** For scalable enterprise query execution.
  2. **In-Memory / File-backed Graph Adapter:** Loads and serializes the workspace graph from a standalone `.ndf-graph.json` file that can be committed alongside Markdown files in Git, eliminating database container requirements.
* **Cypher / Graph Traversal:**
  ```cypher
  MATCH (root:Workspace {id: $rootId})-[:NESTS*0..]->(w:Workspace)-[:INCLUDES]->(p:Piece {id: $pieceId})
  RETURN DISTINCT root.id AS workspaceId, root.title AS workspaceTitle
  ```

---

### 🤖 3.5 `ndf-service-ai-gateway` (Poetic Assistant & LangChain4j)
* **Purpose:** Analyzes verse syllables, rhyme structure, and musical progressions without exposing client API keys.
* **Quarkus Extensions:**
  * `quarkus-langchain4j-openai` (or Ollama for local offline dev): Declarative AI Services.
  * `quarkus-smallrye-fault-tolerance`: `@Retry(maxRetries = 3)`, `@Timeout(5000)`, `@Fallback`.
  * `Mutiny` & Server-Sent Events: Streaming live interpretations to stage performers.

---

## 4. AWS Lambda & Serverless Deployment Strategies

Quarkus is uniquely optimized for AWS Lambda due to build-time metadata processing (Build-Time Initialization).

| Deployment Mode | Cold Start | Memory Footprint | Quarkus Extension | Use Case in NDF |
|---|:---:|:---:|:---|:---|
| **GraalVM Native Binary** | **< 20 ms** | **~25 MB** | `quarkus-amazon-lambda-http` + `--native` | Ideal for `ndf-gateway-auth`, `ndf-service-showcase` |
| **JVM with AWS SnapStart** | **~150 ms** | **~80 MB** | `quarkus-amazon-lambda-http` (Java 21) | Ideal for `ndf-service-sync-vault` & `ndf-service-ai-gateway` |
| **Containerized Microservice** | Standard | Standard | `quarkus-container-image-docker` | Local development (`docker-compose`) & Kubernetes |

---

## 5. Implementation Roadmap

1. **Step 1 — Maven Multi-Module Parent & Domain:** Initialize `ndf-backend` root POM and `ndf-core-domain`.
2. **Step 2 — API-First Contracts:** Author OpenAPI 3.0 YAML specifications in `ndf-api-contracts`.
3. **Step 3 — Pilot Vault Service:** Implement `ndf-service-sync-vault` with dual PostgreSQL and GitHub Git adapters.
4. **Step 4 — Graph Knowledge:** Implement `ndf-service-graph-knowledge` with file-backed and Neo4j adapters.
5. **Step 5 — Security Gateway:** Configure `ndf-gateway-auth` with SmallRye JWT and OpenAPI routing.
6. **Step 6 — AI Assistant:** Implement LangChain4j service in `ndf-service-ai-gateway`.
7. **Step 7 — Lambda Build:** Verify GraalVM native Lambda packaging (`mvn clean package -Dnative -Dlambda`).

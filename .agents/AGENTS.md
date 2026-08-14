# Project Rules — NoteDraftForge

## Mandatory Rule: Knowledge Base Query First

**REGLA OBLIGATORIA:**
Antes de realizar lecturas masivas de archivos o búsquedas extensas de código en este proyecto (`notedraftforge`), el agente DEBE consultar primero la base de conocimiento (`code-knowledge-manager`) mediante el comando:

```bash
python c:\dev\workspace\IA\code-knowledge-manager\knowledge_manager.py query --project notedraftforge --text "<CONCEPTO>"
```

Esta consulta previa (que integra el Grafo AST de Neo4j y la Base Vectorial ChromaDB) debe usarse para acotar la búsqueda y optimizar el uso de tokens antes de proceder a la lectura directa de archivos en el disco.

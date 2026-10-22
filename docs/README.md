# Plan de mejoras del template

Cada archivo es **una sesión de Claude**. Ejecutarlas en orden: algunas dependen de las anteriores.

| Sesión | Archivo | Depende de |
|---|---|---|
| 1 | [01-verificacion-y-ci.md](01-verificacion-y-ci.md) | — |
| 2 | [02-contrato-openapi-frontend.md](02-contrato-openapi-frontend.md) | 1 |
| 3 ✅ | [03-skills-y-docs-ia.md](03-skills-y-docs-ia.md) | — |
| 4 | [04-modulos-opcionales.md](04-modulos-opcionales.md) | 1 |
| 5 | [05-scaffold-modulos.md](05-scaffold-modulos.md) | 4 |
| 6 | [06-fiabilidad-produccion.md](06-fiabilidad-produccion.md) | 1 |
| 7 | [07-tests-integracion-ci.md](07-tests-integracion-ci.md) | 1, 6 |
| 8 | [08-escalado-y-plantilla.md](08-escalado-y-plantilla.md) | 4 |

## Cómo usar cada archivo

Inicia la sesión con: `Ejecuta docs/0X-....md`.

Reglas para el agente:

1. Leer el archivo completo y los `AGENTS.md` que apliquen antes de tocar código.
2. Si el archivo tiene una sección **Preguntas antes de empezar**, hacerlas **todas de forma interactiva (AskUserQuestion) al inicio**, antes de editar nada. No asumir respuestas.
3. Al terminar, cumplir los **Criterios de cierre** del archivo y marcar la sesión como hecha en esta tabla (o borrar el archivo si ya no aporta).

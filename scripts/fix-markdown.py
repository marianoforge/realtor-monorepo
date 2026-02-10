#!/usr/bin/env python3
"""
Script para arreglar markdown mal convertido desde PDF.
Elimina números de página, bloques de código innecesarios, y limpia formato.

Uso:
    python3 scripts/fix-markdown.py <input.md> [output.md]

Ejemplo:
    python3 scripts/fix-markdown.py docs/tutorial.md
    python3 scripts/fix-markdown.py docs/tutorial.md docs/tutorial-fixed.md
"""

import re
import sys
from pathlib import Path


def fix_markdown(content: str) -> str:
    """Arregla el markdown mal formateado desde conversión de PDF."""

    # Eliminar bloques de código innecesarios (líneas envueltas en ```)
    content = re.sub(r"```\n([^`]+?)\n```", r"\1", content)

    # Eliminar ``` sueltos
    content = re.sub(r"^```$", "", content, flags=re.MULTILINE)

    # Arreglar headers mal formados (##### -> ## o ###)
    content = re.sub(r"^#####\s+", "### ", content, flags=re.MULTILINE)
    content = re.sub(r"^####\s+", "### ", content, flags=re.MULTILINE)

    # Eliminar líneas de página como "-- 1 of 364 --" o "Page 1"
    content = re.sub(r"^--\s*\d+\s+of\s+\d+\s*--$", "", content, flags=re.MULTILINE)
    content = re.sub(r"^Page\s+\d+$", "", content, flags=re.MULTILINE)
    content = re.sub(r"^Página\s+\d+$", "", content, flags=re.MULTILINE)

    lines = content.split("\n")
    fixed_lines = []

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Eliminar headers que son solo números de página (## 1, ## 2, etc.)
        if re.match(r"^##\s*\d+\s*$", stripped):
            continue

        # Eliminar líneas que son solo números (páginas sueltas)
        if re.match(r"^\d+$", stripped):
            continue

        # Saltar líneas vacías múltiples consecutivas
        if not stripped:
            if fixed_lines and fixed_lines[-1].strip() == "":
                continue
            fixed_lines.append(line)
            continue

        # Arreglar headers con punto al final que parecen texto mal convertido
        if re.match(r"^##\s+[A-Z][a-z]+.*\.$", stripped) and len(stripped) < 50:
            text = stripped.replace("## ", "").rstrip(".")
            fixed_lines.append(f"**{text}**")
            continue

        fixed_lines.append(line)

    content = "\n".join(fixed_lines)

    # Eliminar líneas vacías múltiples al inicio
    content = content.lstrip("\n")

    # Reducir más de 3 líneas vacías consecutivas a 2
    content = re.sub(r"\n{3,}", "\n\n", content)

    # Limpiar espacios al final de líneas
    content = re.sub(r"[ \t]+$", "", content, flags=re.MULTILINE)

    # Arreglar bullets mal formados
    content = re.sub(r"^•\s*", "- ", content, flags=re.MULTILINE)
    content = re.sub(r"^◦\s*", "  - ", content, flags=re.MULTILINE)
    content = re.sub(r"^▪\s*", "  - ", content, flags=re.MULTILINE)

    # Arreglar guiones largos usados como bullets
    content = re.sub(r"^–\s+", "- ", content, flags=re.MULTILINE)
    content = re.sub(r"^—\s+", "- ", content, flags=re.MULTILINE)

    # Unir líneas que fueron cortadas por el PDF (línea termina en letra minúscula)
    content = re.sub(r"([a-záéíóúñ])\n([a-záéíóúñ])", r"\1 \2", content)

    return content.strip()


def main():
    if len(sys.argv) < 2:
        print("Uso: python3 fix-markdown.py <input.md> [output.md]")
        print("")
        print("Ejemplos:")
        print("  python3 scripts/fix-markdown.py docs/tutorial.md")
        print(
            "  python3 scripts/fix-markdown.py docs/tutorial.md docs/tutorial-fixed.md"
        )
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_path = (
        Path(sys.argv[2])
        if len(sys.argv) > 2
        else input_path.with_stem(input_path.stem + "-fixed")
    )

    if not input_path.exists():
        print(f"❌ Archivo no encontrado: {input_path}")
        sys.exit(1)

    print(f"📄 Leyendo: {input_path}")
    content = input_path.read_text(encoding="utf-8")

    print(f"🔧 Arreglando formato...")
    fixed = fix_markdown(content)

    print(f"💾 Guardando: {output_path}")
    output_path.write_text(fixed, encoding="utf-8")

    original_lines = len(content.split("\n"))
    fixed_lines = len(fixed.split("\n"))
    removed = original_lines - fixed_lines

    print(f"✅ Completado!")
    print(f"   Líneas originales: {original_lines}")
    print(f"   Líneas finales: {fixed_lines}")
    print(f"   Líneas eliminadas: {removed}")


if __name__ == "__main__":
    main()

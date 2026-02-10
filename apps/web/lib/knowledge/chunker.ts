export interface Chunk {
  content: string;
  metadata: ChunkMetadata;
}

export interface ChunkMetadata {
  documentId: string;
  documentName: string;
  section: string;
  chunkIndex: number;
  totalChunks?: number;
}

interface ChunkOptions {
  maxChunkSize?: number;
  overlap?: number;
}

const DEFAULT_MAX_CHUNK_SIZE = 1000;
const DEFAULT_OVERLAP = 100;

interface Section {
  title: string;
  level: number;
  content: string;
}

function extractSections(markdown: string): Section[] {
  const lines = markdown.split("\n");
  const sections: Section[] = [];
  let currentSection: Section | null = null;
  let contentBuffer: string[] = [];
  let preHeaderContent: string[] = [];

  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,3})\s+(.+)$/);

    if (headerMatch) {
      if (preHeaderContent.length > 0 && !currentSection) {
        const preContent = preHeaderContent.join("\n").trim();
        if (preContent) {
          sections.push({
            title: "Introducción",
            level: 1,
            content: preContent,
          });
        }
        preHeaderContent = [];
      }

      if (currentSection) {
        currentSection.content = contentBuffer.join("\n").trim();
        if (currentSection.content) {
          sections.push(currentSection);
        }
      }

      currentSection = {
        title: headerMatch[2].trim(),
        level: headerMatch[1].length,
        content: "",
      };
      contentBuffer = [];
    } else {
      if (currentSection) {
        contentBuffer.push(line);
      } else {
        preHeaderContent.push(line);
      }
    }
  }

  if (currentSection) {
    currentSection.content = contentBuffer.join("\n").trim();
    if (currentSection.content) {
      sections.push(currentSection);
    }
  }

  if (sections.length === 0) {
    const allContent = markdown.trim();
    if (allContent) {
      sections.push({
        title: "Contenido",
        level: 1,
        content: allContent,
      });
    }
  }

  return sections;
}

function splitTextIntoChunks(
  text: string,
  maxSize: number,
  overlap: number
): string[] {
  if (text.length <= maxSize) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < text.length) {
    let end = start + maxSize;

    if (end < text.length) {
      const lastPeriod = text.lastIndexOf(".", end);
      const lastNewline = text.lastIndexOf("\n", end);
      const lastSpace = text.lastIndexOf(" ", end);

      const breakPoint = Math.max(lastPeriod, lastNewline, lastSpace);
      if (breakPoint > start + maxSize / 2) {
        end = breakPoint + 1;
      }
    } else {
      end = text.length;
    }

    chunks.push(text.slice(start, end).trim());
    start = end - overlap;

    if (start >= text.length - overlap) {
      break;
    }
  }

  return chunks.filter((chunk) => chunk.length > 0);
}

export function chunkMarkdown(
  markdown: string,
  documentId: string,
  documentName: string,
  options: ChunkOptions = {}
): Chunk[] {
  const maxChunkSize = options.maxChunkSize ?? DEFAULT_MAX_CHUNK_SIZE;
  const overlap = options.overlap ?? DEFAULT_OVERLAP;

  const sections = extractSections(markdown);
  const chunks: Chunk[] = [];
  let globalChunkIndex = 0;

  for (const section of sections) {
    const sectionChunks = splitTextIntoChunks(
      section.content,
      maxChunkSize,
      overlap
    );

    for (const chunkContent of sectionChunks) {
      chunks.push({
        content: chunkContent,
        metadata: {
          documentId,
          documentName,
          section: section.title,
          chunkIndex: globalChunkIndex,
        },
      });
      globalChunkIndex++;
    }
  }

  for (const chunk of chunks) {
    chunk.metadata.totalChunks = chunks.length;
  }

  return chunks;
}

export function extractTags(markdown: string): string[] {
  const tags = new Set<string>();

  const headers = markdown.match(/^#{1,3}\s+(.+)$/gm);
  if (headers) {
    for (const header of headers) {
      const text = header.replace(/^#+\s+/, "").toLowerCase();
      const words = text.split(/\s+/).filter((w) => w.length > 3);
      words.forEach((w) => tags.add(w));
    }
  }

  if (tags.size === 0) {
    const keywords = [
      "operación",
      "operacion",
      "venta",
      "compra",
      "alquiler",
      "propiedad",
      "inmueble",
      "departamento",
      "casa",
      "honorarios",
      "comisión",
      "comision",
      "reserva",
      "cierre",
      "dashboard",
      "formulario",
      "cliente",
      "asesor",
      "agente",
      "franquicia",
      "tutorial",
      "guía",
      "guia",
    ];

    const lowerContent = markdown.toLowerCase();
    for (const kw of keywords) {
      if (lowerContent.includes(kw)) {
        tags.add(kw);
      }
    }
  }

  return Array.from(tags).slice(0, 10);
}

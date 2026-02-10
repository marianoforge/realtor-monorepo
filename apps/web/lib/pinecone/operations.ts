import { getPineconeIndex, PINECONE_NAMESPACE } from "./client";
import { generateEmbedding, generateEmbeddings } from "./embeddings";
import type { Chunk, ChunkMetadata } from "@/lib/knowledge/chunker";
import type { RecordMetadata } from "@pinecone-database/pinecone";

const UPSERT_BATCH_SIZE = 100;

export interface VectorMetadata extends ChunkMetadata {
  content: string;
  tags?: string[];
}

export interface SearchResult {
  id: string;
  score: number;
  content: string;
  metadata: VectorMetadata;
}

export interface SearchOptions {
  topK?: number;
  filter?: Record<string, string | string[]>;
}

export async function upsertChunks(
  chunks: Chunk[],
  tags?: string[]
): Promise<{ upsertedCount: number }> {
  if (chunks.length === 0) {
    return { upsertedCount: 0 };
  }

  const index = getPineconeIndex();
  const namespace = index.namespace(PINECONE_NAMESPACE);

  const texts = chunks.map((chunk) => chunk.content);
  const embeddings = await generateEmbeddings(texts);

  const records = chunks.map((chunk, i) => ({
    id: `${chunk.metadata.documentId}-${chunk.metadata.chunkIndex}`,
    values: embeddings[i],
    metadata: {
      ...chunk.metadata,
      content: chunk.content,
      tags: tags ?? [],
    } as RecordMetadata,
  }));

  let upsertedCount = 0;
  for (let i = 0; i < records.length; i += UPSERT_BATCH_SIZE) {
    const batch = records.slice(i, i + UPSERT_BATCH_SIZE);
    await namespace.upsert({ records: batch });
    upsertedCount += batch.length;
  }

  return { upsertedCount };
}

export async function searchVectors(
  query: string,
  options: SearchOptions = {}
): Promise<SearchResult[]> {
  const index = getPineconeIndex();
  const namespace = index.namespace(PINECONE_NAMESPACE);

  const topK = options.topK ?? 5;
  const queryEmbedding = await generateEmbedding(query);

  const response = await namespace.query({
    vector: queryEmbedding,
    topK,
    includeMetadata: true,
    filter: options.filter,
  });

  return (response.matches ?? []).map((match) => {
    const metadata = match.metadata as unknown as VectorMetadata;
    return {
      id: match.id,
      score: match.score ?? 0,
      content: metadata?.content ?? "",
      metadata,
    };
  });
}

export async function deleteByDocumentId(documentId: string): Promise<void> {
  const index = getPineconeIndex();
  const namespace = index.namespace(PINECONE_NAMESPACE);

  await namespace.deleteMany({
    filter: {
      documentId: { $eq: documentId },
    },
  });
}

export async function deleteVectorsByIds(ids: string[]): Promise<void> {
  const index = getPineconeIndex();
  const namespace = index.namespace(PINECONE_NAMESPACE);

  const BATCH_SIZE = 1000;
  for (let i = 0; i < ids.length; i += BATCH_SIZE) {
    const batch = ids.slice(i, i + BATCH_SIZE);
    await namespace.deleteMany(batch);
  }
}

export async function getIndexStats(): Promise<{
  totalVectors: number;
  namespaces: Record<string, { vectorCount: number }>;
}> {
  const index = getPineconeIndex();
  const stats = await index.describeIndexStats();

  const namespaces: Record<string, { vectorCount: number }> = {};
  if (stats.namespaces) {
    for (const [key, value] of Object.entries(stats.namespaces)) {
      namespaces[key] = { vectorCount: value.recordCount ?? 0 };
    }
  }

  return {
    totalVectors: stats.totalRecordCount ?? 0,
    namespaces,
  };
}

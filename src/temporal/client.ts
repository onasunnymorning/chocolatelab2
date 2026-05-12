import { Client, Connection } from "@temporalio/client";

let _client: Client | null = null;

/**
 * Returns a singleton Temporal Client suitable for use in Next.js API routes.
 * Connects to the address specified by TEMPORAL_ADDRESS (defaults to localhost:7233).
 */
export async function getTemporalClient(): Promise<Client> {
  if (_client) return _client;

  const address = process.env.TEMPORAL_ADDRESS ?? "127.0.0.1:7233";
  const namespace = process.env.TEMPORAL_NAMESPACE ?? "default";

  try {
    const connection = await Connection.connect({ address });
    _client = new Client({ connection, namespace });
    return _client;
  } catch (err) {
    _client = null; // allow retry on next request
    throw err;
  }
}

export const TASK_QUEUE =
  process.env.TEMPORAL_TASK_QUEUE ?? "refinement-queue";

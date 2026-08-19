import { MongoClient, Db } from 'mongodb';

/**
 * Storefront Server MongoDB Connection Client
 * Phase 7 — Storefront Backend/API Foundation
 * Singleton connection caching for Next.js App Router server runtime
 */

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/veloce_ecommerce';
const dbName = process.env.MONGODB_DATABASE_NAME || 'veloce_ecommerce';

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      maxPoolSize: 10,
      minPoolSize: 1,
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 3000,
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
} else {
  client = new MongoClient(uri, {
    maxPoolSize: 50,
    minPoolSize: 5,
    connectTimeoutMS: 10000,
    serverSelectionTimeoutMS: 5000,
  });
  clientPromise = client.connect();
}

export async function getStorefrontDb(): Promise<Db | null> {
  try {
    const connectedClient = await clientPromise;
    return connectedClient.db(dbName);
  } catch {
    // Graceful fallback if database connection is unavailable in local testing
    return null;
  }
}

export { clientPromise };

import { MongoClient, Db, Collection } from "mongodb";
import { Artisulo } from "./models/artisulo";

let client: MongoClient | null = null;
let database: Db | null = null;

export async function connectToDatabase(
  uri: string,
  dbName: string
): Promise<Db> {
  if (!uri) throw new Error("MONGODB_URI is required to start the server");
  if (!dbName) throw new Error("MONGODB_DB is required to start the server");
  if (database) return database;

  client = new MongoClient(uri);
  await client.connect();
  database = client.db(dbName);

  console.log(`Servidor conectado a la base de datos: ${database.databaseName}`)
  return database;
}

export function getDatabase(): Db {
  if (!database) {
    throw new Error("MongoDB connection has not been established yet");
  }
  return database;
}

export function getArtisulosCollection(): Collection<Artisulo> {
  return getDatabase().collection<Artisulo>("KarenC");
}

export async function closeDatabase(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    database = null;
  }
}

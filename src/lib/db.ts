import mongoose from "mongoose";
// initialize server utils (global error handlers) when running server-side
import './serverUtils';

const envMongoUri = process.env.MONGODB_URI;

if (!envMongoUri) {
  throw new Error("❌ Please define the MONGODB_URI environment variable in .env.local");
}

const MONGODB_URI: string = envMongoUri;

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

declare global {
  var mongoose: MongooseCache | undefined;
}

const cached = global.mongoose ?? (global.mongoose = { conn: null, promise: null });

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
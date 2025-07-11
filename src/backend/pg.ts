// Low-level config and utilities for Postgres.

import pgInit, { IDatabase, ITask } from "pg-promise";
import { getConnectionString } from "../supabase";
import { createDatabase } from "./schema";

const pgp = pgInit();

export type Executor = ITask<unknown>;

const { isolationLevel, TransactionMode } = pgp.txMode;

// Initialize connection immediately but don't await database creation.
const db = pgp(getConnectionString());

async function init() {
  try {
    await db.tx(
      { mode: new TransactionMode({ tiLevel: isolationLevel.serializable }) },
      createDatabase,
    );
  } catch (err) {
    console.error("Error initializing database", err);
  }
}

void init();

// Helper to make sure we always access database at serializable level.
export async function tx<R>(
  f: (executor: Executor) => R,
  connection: IDatabase<unknown> = db
) {
  return connection.tx(
    { mode: new TransactionMode({ tiLevel: isolationLevel.serializable }) },
    f
  );
}

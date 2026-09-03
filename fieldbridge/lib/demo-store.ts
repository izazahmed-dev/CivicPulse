import { promises as fs } from "fs";
import path from "path";
import { INITIAL_STORE_STATE } from "@/data/seed";
import { DemoStoreState } from "@/lib/types";

const storeDir = path.join(process.cwd(), "data", "demo-store");
const storeFile = path.join(storeDir, "state.json");

async function ensureStore() {
  await fs.mkdir(storeDir, { recursive: true });
  try {
    await fs.access(storeFile);
  } catch {
    await fs.writeFile(storeFile, JSON.stringify(INITIAL_STORE_STATE, null, 2), "utf8");
  }
}

export async function readStore(): Promise<DemoStoreState> {
  await ensureStore();
  const raw = await fs.readFile(storeFile, "utf8");
  return JSON.parse(raw) as DemoStoreState;
}

export async function writeStore(state: DemoStoreState) {
  await ensureStore();
  await fs.writeFile(storeFile, JSON.stringify(state, null, 2), "utf8");
}


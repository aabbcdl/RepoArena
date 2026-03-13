import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { loadTaskPack } from "../packages/taskpacks/dist/index.js";

test("loadTaskPack parses schema v1 judges", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "repoarena-taskpack-"));
  const taskPath = path.join(tempDir, "task.json");

  await writeFile(
    taskPath,
    JSON.stringify(
      {
        schemaVersion: "repoarena.taskpack/v1",
        id: "demo",
        title: "Demo Task",
        prompt: "Do the thing",
        judges: [
          {
            id: "lint",
            type: "command",
            label: "Lint passes",
            command: "npm run lint",
            cwd: "app",
            timeoutMs: 15000
          }
        ]
      },
      null,
      2
    ),
    "utf8"
  );

  const taskPack = await loadTaskPack(taskPath);

  assert.equal(taskPack.schemaVersion, "repoarena.taskpack/v1");
  assert.equal(taskPack.judges[0].id, "lint");
  assert.equal(taskPack.judges[0].cwd, "app");
  assert.equal(taskPack.judges[0].timeoutMs, 15000);

  await rm(tempDir, { recursive: true, force: true });
});

test("loadTaskPack keeps backward compatibility with successCommands", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "repoarena-taskpack-"));
  const taskPath = path.join(tempDir, "task.json");

  await writeFile(
    taskPath,
    JSON.stringify(
      {
        id: "legacy",
        title: "Legacy Task",
        prompt: "Legacy prompt",
        successCommands: [
          {
            label: "README exists",
            command: "test -f README.md"
          }
        ]
      },
      null,
      2
    ),
    "utf8"
  );

  const taskPack = await loadTaskPack(taskPath);

  assert.equal(taskPack.schemaVersion, "repoarena.taskpack/v1");
  assert.equal(taskPack.judges[0].id, "legacy-1");
  assert.equal(taskPack.judges[0].type, "command");
  assert.equal(taskPack.judges[0].label, "README exists");

  await rm(tempDir, { recursive: true, force: true });
});

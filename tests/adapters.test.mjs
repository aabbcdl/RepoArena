import test from "node:test";
import assert from "node:assert/strict";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { __testUtils, getAdapter, listAvailableAdapters } from "../packages/adapters/dist/index.js";

test("listAvailableAdapters exposes capability metadata", () => {
  const adapters = listAvailableAdapters();
  const codex = adapters.find((adapter) => adapter.id === "codex");
  const cursor = adapters.find((adapter) => adapter.id === "cursor");

  assert.ok(codex);
  assert.equal(codex.capability.supportTier, "supported");
  assert.equal(codex.capability.tokenAvailability, "available");
  assert.equal(codex.capability.costAvailability, "unavailable");

  assert.ok(cursor);
  assert.equal(cursor.capability.supportTier, "experimental");
  assert.match(cursor.capability.invocationMethod, /Cursor/i);
});

test("demo adapter execution returns normalized benchmark output", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "repoarena-adapters-"));
  const workspacePath = path.join(tempDir, "workspace");
  await mkdir(workspacePath, { recursive: true });

  const adapter = getAdapter("demo-fast");
  const result = await adapter.execute({
    agentId: "demo-fast",
    repoPath: tempDir,
    workspacePath,
    environment: process.env,
    task: {
      schemaVersion: "repoarena.taskpack/v1",
      id: "demo-task",
      title: "Demo Task",
      prompt: "Create a minimal change.",
      envAllowList: [],
      setupCommands: [],
      judges: [],
      teardownCommands: []
    },
    trace: async () => {}
  });

  assert.equal(result.status, "success");
  assert.equal(result.costKnown, true);
  assert.equal(result.changedFilesHint.length > 0, true);
  assert.match(result.summary, /demo adapter path/i);

  await rm(tempDir, { recursive: true, force: true });
});

test("parseCodexEvents extracts file changes, tokens, and thread ids", () => {
  const stdout = [
    JSON.stringify({ type: "thread.started", thread_id: "thread-123" }),
    JSON.stringify({
      type: "item.completed",
      item: {
        type: "file_change",
        changes: [{ path: "C:\\temp\\workspace\\src\\index.ts" }]
      }
    }),
    JSON.stringify({
      type: "turn.completed",
      usage: { input_tokens: 10, cached_input_tokens: 5, output_tokens: 3 }
    }),
    JSON.stringify({
      type: "item.completed",
      item: { type: "agent_message", text: "Codex finished." }
    })
  ].join("\n");

  const parsed = __testUtils.parseCodexEvents(stdout, "C:\\temp\\workspace");
  assert.deepEqual(parsed.changedFilesHint, ["src/index.ts"]);
  assert.equal(parsed.tokenUsage, 18);
  assert.equal(parsed.threadId, "thread-123");
  assert.equal(parsed.summaryFromEvents, "Codex finished.");
});

test("parseClaudeEvents normalizes token, cost, and error data", () => {
  const stdout = [
    JSON.stringify({
      session_id: "session-1",
      message: {
        usage: {
          input_tokens: 10,
          output_tokens: 4,
          cache_creation_input_tokens: 1,
          cache_read_input_tokens: 2
        },
        content: [{ type: "text", text: "Intermediate update" }]
      }
    }),
    JSON.stringify({
      type: "result",
      total_cost_usd: 0.42,
      result: "Claude finished.",
      usage: {
        input_tokens: 7,
        output_tokens: 3,
        cache_creation_input_tokens: 0,
        cache_read_input_tokens: 1
      }
    }),
    JSON.stringify({
      type: "result",
      is_error: true,
      error: "permission_error",
      total_cost_usd: 0.11
    })
  ].join("\n");

  const parsed = __testUtils.parseClaudeEvents(stdout);
  assert.equal(parsed.sessionId, "session-1");
  assert.equal(parsed.summaryFromEvents, "Claude finished.");
  assert.equal(parsed.tokenUsage, 28);
  assert.equal(parsed.estimatedCostUsd, 0.11);
  assert.equal(parsed.costKnown, false);
  assert.equal(parsed.error, "permission_error");
});

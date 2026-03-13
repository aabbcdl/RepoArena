import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

async function writeJson(filePath, value) {
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8");
}

async function runCli(args, cwd) {
  const cliPath = path.resolve("packages/cli/dist/index.js");

  return await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [cliPath, ...args], {
      cwd,
      stdio: ["ignore", "pipe", "pipe"]
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("close", (code) => {
      resolve({ code, stdout, stderr });
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
}

test("repoarena run exits with code 0 on successful benchmark", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "repoarena-cli-"));
  const repoPath = path.join(tempDir, "repo");
  const outputPath = path.join(tempDir, "output-success");
  const taskPath = path.join(tempDir, "task-success.json");

  await mkdir(repoPath, { recursive: true });
  await writeFile(path.join(repoPath, "README.md"), "# Temp Repo\n", "utf8");

  await writeJson(taskPath, {
    schemaVersion: "repoarena.taskpack/v1",
    id: "cli-success",
    title: "CLI Success",
    prompt: "Run a passing benchmark",
    judges: [
      {
        id: "pass",
        type: "command",
        label: "Always pass",
        command: "node -e \"process.exit(0)\""
      }
    ]
  });

  const result = await runCli(
    ["run", "--repo", repoPath, "--task", taskPath, "--agents", "demo-fast", "--output", outputPath],
    path.resolve(".")
  );

  assert.equal(result.code, 0);
  assert.match(result.stdout, /RepoArena run complete/);

  await rm(tempDir, { recursive: true, force: true });
});

test("repoarena run exits with code 1 on failed benchmark", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "repoarena-cli-"));
  const repoPath = path.join(tempDir, "repo");
  const outputPath = path.join(tempDir, "output-fail");
  const taskPath = path.join(tempDir, "task-fail.json");

  await mkdir(repoPath, { recursive: true });
  await writeFile(path.join(repoPath, "README.md"), "# Temp Repo\n", "utf8");

  await writeJson(taskPath, {
    schemaVersion: "repoarena.taskpack/v1",
    id: "cli-fail",
    title: "CLI Fail",
    prompt: "Run a failing benchmark",
    judges: [
      {
        id: "fail",
        type: "command",
        label: "Always fail",
        command: "node -e \"process.exit(1)\""
      }
    ]
  });

  const result = await runCli(
    ["run", "--repo", repoPath, "--task", taskPath, "--agents", "demo-fast", "--output", outputPath],
    path.resolve(".")
  );

  assert.equal(result.code, 1);
  assert.match(result.stdout, /status=failed/);

  await rm(tempDir, { recursive: true, force: true });
});

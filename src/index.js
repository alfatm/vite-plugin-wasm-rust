import chokidar from "chokidar";
import { spawn } from "child_process";
import path from "path";

const logPrefix = (str) =>
  str
    .split("\n")
    .map((s) => `[wasm-pack] ${s}`)
    .join("\n");

export async function viteWasmPackBuild(build) {
  const process = spawn(
    `wasm-pack`,
    [
      `build`,
      build.release ? `--release` : `--dev`,
      `--target`,
      build.target ?? "web",
      `--out-name`,
      build.out_name ?? `index`,
      `--out-dir`,
      build.out_dir ?? `dist`,
      build.no_reference_types ? `` : `--reference-types`,
      build.no_weak_refs ? `` : `--weak-refs`,
      build.enable_typescript ? `` : `--no-typescript`,
      build.enable_pack ? `` : `--no-pack`,
      build.enable_opt ? `` : `--no-opt`,
      ...(build.args ?? []),
      `--`,
      ...(build.extra_args ?? []),
    ],
    {
      cwd: path.resolve(build.crate),
    }
  );

  let stderr = "";

  process.stdout.on("data", function (data) {
    console.log(logPrefix(data.toString()));
  });

  process.stderr.on("data", function (data) {
    const msg = logPrefix(data.toString());
    console.log(msg);
    stderr += msg;
  });

  process.on("error", (err) => {
    console.error("Failed to start subprocess:", err);
  });

  await new Promise((resolve, _reject) => {
    process.on("close", resolve);
  });

  await process;

  if (process.exitCode !== 0) {
    throw new Error(logPrefix(`Build failed\n${stderr}`));
  }
}

let timer;

export default function viteWasmPack(options) {
  const { watch, build } = options;
  return {
    name: "vite-wasm-pack",
    enforce: "pre",
    async buildStart() {
      return viteWasmPackBuild(build);
    },
    configureServer(server) {
      const watcher = chokidar.watch(watch.include, { ignored: watch.exclude });

      watcher.on("change", async (filePath) => {
        console.log(logPrefix(`File change:`), filePath);

        clearTimeout(timer);
        timer = setTimeout(async () => {
          try {
            await viteWasmPackBuild(options);
            console.info(logPrefix(`page full reload`));
            server.ws.send({
              type: "full-reload",
              path: "*",
            });
          } catch (error) {
            console.info(logPrefix(`page error overlay`));
            const error_str = error.toString();
            server.ws.send({
              type: "error",
              err: {
                message: error_str.split("\n")[0],
                stack: error_str,
                plugin: "vite-wasm-pack",
              },
            });
          }
        }, watch.debounce ?? 50);
      });
    },
  };
}

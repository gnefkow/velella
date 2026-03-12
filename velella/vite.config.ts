import { defineConfig, normalizePath } from "vite";
import type { Plugin, ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import yaml from "js-yaml";

const DATA_DIR = join(__dirname, "data");
const SCENARIO_FILE = join(DATA_DIR, "scenario001.yaml");
const SCENARIO_FILE_PATH = normalizePath(SCENARIO_FILE);

function scenarioApiPlugin(): Plugin {
  return {
    name: "scenario-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/scenario", (req, res, next) => {
        if (req.method === "GET") {
          try {
            const raw = readFileSync(SCENARIO_FILE, "utf-8");
            const data = yaml.load(raw) as object;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(data));
          } catch (err) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: String(err) }));
          }
          return;
        }
        if (req.method === "PUT") {
          let body = "";
          req.on("data", (chunk: Buffer) => {
            body += chunk.toString();
          });
          req.on("end", () => {
            try {
              const data = JSON.parse(body) as object;
              const yamlStr = yaml.dump(data, { lineWidth: -1 });
              writeFileSync(SCENARIO_FILE, yamlStr, "utf-8");
              res.setHeader("Content-Type", "application/json");
              res.end(JSON.stringify({ ok: true }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }
        next();
      });
    },
    handleHotUpdate(ctx: { file: string }) {
      if (normalizePath(ctx.file) === SCENARIO_FILE_PATH) {
        return [];
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), scenarioApiPlugin()],
  server: {
    fs: {
      allow: ["..", "../../counterfoil-kit"],
    },
    watch: {
      ignored: [SCENARIO_FILE_PATH],
    },
  },
});

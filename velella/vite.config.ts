import { defineConfig, normalizePath } from "vite";
import type { Plugin, ViteDevServer } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { extname, join } from "path";
import yaml from "js-yaml";

const DATA_DIR = join(__dirname, "data");

type ScenarioEntry = {
  id: string;
  file: string;
};

type ScenarioManifestItem = {
  id: string;
  label: string;
};

function discoverScenarioFiles(): ScenarioEntry[] {
  const entries: ScenarioEntry[] = [];
  const files = readdirSync(DATA_DIR, { withFileTypes: true });
  for (const file of files) {
    if (!file.isFile()) continue;
    if (!file.name.startsWith("scenario")) continue;
    const ext = extname(file.name);
    if (ext !== ".yaml" && ext !== ".yml") continue;

    const id = file.name.replace(ext, "");
    entries.push({
      id,
      file: join(DATA_DIR, file.name),
    });
  }
  return entries;
}

const SCENARIO_ENTRIES: ScenarioEntry[] = discoverScenarioFiles();
const SCENARIOS: Record<string, string> = SCENARIO_ENTRIES.reduce(
  (acc, entry) => {
    acc[entry.id] = entry.file;
    return acc;
  },
  {} as Record<string, string>
);

const DEFAULT_SCENARIO_ID =
  SCENARIO_ENTRIES[0]?.id ??
  Object.keys(SCENARIOS)[0] ??
  "scenario001";

const SCENARIO_FILE_PATHS = SCENARIO_ENTRIES.map((entry) =>
  normalizePath(entry.file)
);

function scenarioApiPlugin(): Plugin {
  return {
    name: "scenario-api",
    configureServer(server: ViteDevServer) {
      server.middlewares.use("/api/scenario", (req, res, next) => {
        const url = new URL(req.url ?? "", "http://localhost");
        const requestedId = url.searchParams.get("scenarioId") || undefined;
        const scenarioId = requestedId && SCENARIOS[requestedId]
          ? requestedId
          : DEFAULT_SCENARIO_ID;
        const scenarioFile = SCENARIOS[scenarioId];

        if (req.method === "GET") {
          try {
            const raw = readFileSync(scenarioFile, "utf-8");
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
              writeFileSync(scenarioFile, yamlStr, "utf-8");
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

      server.middlewares.use("/api/scenarios", (_req, res) => {
        try {
          const manifest: ScenarioManifestItem[] = SCENARIO_ENTRIES.map(
            ({ id, file }) => {
              const raw = readFileSync(file, "utf-8");
              const data = yaml.load(raw) as
                | {
                    "scenario-info"?: {
                      "scenario-title"?: string;
                    };
                  }
                | undefined;
              const title =
                data?.["scenario-info"]?.["scenario-title"] ?? id;
              return { id, label: title };
            }
          );
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(manifest));
        } catch (err) {
          res.statusCode = 500;
          res.end(JSON.stringify({ error: String(err) }));
        }
      });
    },
    handleHotUpdate(ctx: { file: string }) {
      const normalized = normalizePath(ctx.file);
      if (SCENARIO_FILE_PATHS.includes(normalized)) {
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
      ignored: SCENARIO_FILE_PATHS,
    },
  },
});

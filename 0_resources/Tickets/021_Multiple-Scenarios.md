


## **Implementation**
--------------------------------------------------

#### **UI**
--------------------------------------------------
In the `GlobalNav` top bar, the scenario name (upper left corner) now has a drop-down menu. 
The drop-down menu displays a list of all of the yamls in the `data` folder. 

Implementation Plan:

1. **Introduce multiple scenario files (YAML)**
   - Create multiple YAML fixtures in `velella/data/`, e.g.:
     - `scenario-baseline.yaml`
     - `scenario-coastfire.yaml`
     - `scenario-sabbatical.yaml`
   - Keep each file a *full* scenario (not diffs), using the current `ScenarioYaml` shape as the reference.

2. **Add a scenario index / manifest**
   - Add a small manifest (initially hard-coded) describing available scenarios:
     - ID (e.g. `baseline`, `coastfire`, `sabbatical`)
     - Label (for UI display)
     - File path (e.g. `scenario-baseline.yaml`)
   - Start with the manifest defined in `vite.config.ts` or a nearby module that the dev-only API plugin can import.
   - This manifest does **not** need to be persisted; it is just a convenience for dog-fooding.

3. **Extend the dev-only `/api/scenario` API to support multiple files**
   - In `velella/vite.config.ts`:
     - Replace the single `SCENARIO_FILE` constant with:
       - A `SCENARIOS` map from scenario ID → YAML file path.
       - A `DEFAULT_SCENARIO_ID` (e.g. `baseline`).
     - Update the middleware to:
       - On **GET**:
         - Read a `scenarioId` query param (e.g. `/api/scenario?scenarioId=coastfire`).
         - If missing, fall back to `DEFAULT_SCENARIO_ID`.
         - Load the appropriate YAML file from `SCENARIOS[scenarioId]`.
       - On **PUT**:
         - Require or default the same `scenarioId` query param.
         - Write the JSON body back to the corresponding YAML file.
   - Optionally add `/api/scenarios` (plural) that returns the manifest so the UI can render a dropdown of available scenarios.

4. **Update the frontend scenario loading hook to select a scenario**
   - In `velella/src/hooks/useScenario.ts`:
     - Allow `useScenario` to accept an optional `scenarioId` argument (default to `DEFAULT_SCENARIO_ID`).
     - Have `loadScenario` and `saveScenario` include `scenarioId` as a query param when calling `/api/scenario`.
   - In the top-level app (where `useScenario` is used):
     - For now, pass a hard-coded `scenarioId` (e.g. `baseline`) while wiring everything up.
     - Later, this can be driven by a simple selector UI (see next step).

5. **Add a minimal scenario-switcher UI (dev-only at first)**
   - Add a lightweight control (e.g. dropdown or buttons) in a top-level page/layout:
     - Options are the known scenario IDs from the manifest (`/api/scenarios`).
     - When the user selects a scenario:
       - Store the chosen `scenarioId` in React state (and possibly in `localStorage`).
       - Re-mount or refresh `useScenario` with the new `scenarioId` so the whole app reloads from that YAML.
   - This is primarily for internal testing/dog-fooding; it does not need final UX polish yet.

6. **Harden `yamlToScenario` with defaults for schema evolution**
   - In `velella/src/services/scenarioService.ts`:
     - Ensure `yamlToScenario`:
       - Handles missing optional sections (`scenario-info`, `assumptions`, `household-members`, `years`, `eras`) by providing sensible defaults.
       - Defaults new numeric fields to `0` or a safe value.
       - Defaults arrays to `[]` where appropriate.
       - Can tolerate older YAML files that don’t yet have newly-added fields.
   - This allows existing scenario YAMLs to continue working even as we tweak the persisted schema.

7. **Define lightweight conventions for adding new persisted fields**
   - When a new user-authored field is added:
     - Add it to the TypeScript `Scenario` / `ScenarioYaml` types.
     - Provide a default in `yamlToScenario` when the key is absent.
     - Only update individual YAML files when their behavior should differ from the default.
   - If we ever make a **breaking** shape change (e.g., splitting a field into two or renaming keys):
     - Write a one-off script or helper to read each YAML, transform it, and write it back.
     - With fewer than ~10 test scenarios, this remains manageable.

8. **Out of scope for now (future considerations)**
   - No database or multi-user persistence yet; everything remains file-backed via Vite’s dev server.
   - No base+override composition yet; if we start to feel the pain of duplicating structure across many scenarios, we can:
     - Introduce a “base scenario” YAML and small override files.
     - Compose them at load time before calling `calculateTimeline`.



## **Version 2**
--------------------------------------------------
*We decided to derive scenario labels and the list of available scenarios directly from the YAML files to keep a single source of truth for scenario metadata. Managing labels, IDs, and file paths in `vite.config.ts` introduces duplication and a high risk of drift as we add and rename scenarios over time. By treating the `velella/data/` folder and each YAML’s `scenario-info.scenario-title` as canonical, we make it much easier to evolve scenarios without touching build configuration. This approach also keeps the performance and implementation complexity appropriate for our expected small number of scenarios.*
- **Goal**: Make scenario labels and the list of available scenarios derive from the YAML data itself, not from hard-coded metadata in `vite.config.ts`.

- **Scenario discovery**
  - Treat the `velella/data/` folder as the source of truth for available scenarios.
  - Either:
    - Keep a minimal manifest of `scenarioId -> file path`, or
    - Conventionally treat all files matching a pattern like `scenario-*.yaml` as scenarios.

- **Labels derived from YAML**
  - In each scenario YAML, continue to store the human-facing name under `scenario-info.scenario-title` (or a closely related field if we later add one).
  - In the dev-only `/api/scenarios` handler:
    - For each known scenario file:
      - Read the YAML from disk.
      - Parse it with `js-yaml`.
      - Extract the label from `scenario-info.scenario-title`.
    - Return a list of `{ id, label }` objects to the frontend, where:
      - `id` is a stable identifier used in URLs (e.g. `baseline`, `coastfire`, `sabbatical`).
      - `label` is the user-facing label from YAML.

- **Dropdown behavior**
  - The scenario selector in the top global navigation calls `/api/scenarios` at app startup to populate its options.
  - The dropdown displays `label` for each option and uses `id` as the value.
  - When the user changes the selected scenario:
    - The app reloads scenario data via `/api/scenario?scenarioId=<id>`.
    - The current scenario’s title shown in the header uses the loaded `scenarioInfo.scenarioTitle`, so in-app renames are immediately reflected without needing to refetch the manifest.

- **Future rename behavior (V2+)**
  - If/when the app supports renaming a scenario:
    - The rename operation updates `scenario-info.scenario-title` in memory and persists it back to the YAML file.
    - Optionally, the app can refetch `/api/scenarios` after a successful rename to refresh the dropdown options from disk.
  - We do **not** need to rename the underlying YAML file at this stage; the scenario ID and file path mapping can remain stable even as the user-facing label changes.

- **Out of scope for this ticket**
  - Live reactivity across multiple browser tabs or windows (we accept that a manual refresh may be needed in other tabs after a rename).
  - Any database-backed storage or base+override YAML composition; those can be revisited when we feel pain from duplication or need multi-user persistence.





## **Conversation Archive**
--------------------------------------------------
*don't worry about anything down here*

I want to expand to the ability to have multiple scenarios. 
We do not want to build a database yet—there is no need to get that fancy, especially since we're really in the design phases of this app. 

However, as we're testing and "dog-fooding" the app, we need to have more scenarios to feel out how the app works. 

I like the simplicity of the single yaml because it makes it easy to iterate data modeling. 

However, if we make multiple yaml files (different ones for different scenarios), now every time we change the data model, we'll have to update multiple scenarios. 

What do you think? What are some strategies for moving forward?

Potential Strategies:
- **Recommended direction: file-backed multi-scenario support, no database yet**
  - Keep scenarios as YAML files.
  - Add a small scenario index/manifest so the app can list and load one scenario at a time.
  - This preserves the simplicity of file storage while letting us dog-food multiple life plans.

- **Strategy 1: multiple full YAML files**
  - Example: `scenario001.yaml`, `scenario002.yaml`, `coastfire.yaml`, `career-break.yaml`.
  - Pros: simplest mental model; each scenario is portable and easy to inspect.
  - Cons: when the schema changes, every scenario may need updates.

- **Strategy 2: one canonical base scenario plus small overrides**
  - Keep one "full" scenario fixture that represents the latest schema.
  - Additional scenarios only override the parts that differ (title, years, assumptions, etc.).
  - Pros: much less duplication when iterating on the data model.
  - Cons: slightly more implementation complexity because scenarios must be composed at load time.

- **Strategy 3: schema evolution layer**
  - Add a normalization/migration step when loading YAML.
  - Older scenario files can omit newer fields, and the loader fills defaults.
  - Pros: reduces the pain of changing the model; scenarios do not all need hand-editing immediately.
  - Cons: requires discipline to keep migrations/defaults clean.

- **Strategy 4: scenario templates + test fixtures**
  - Keep a small set of intentionally different scenarios for dog-fooding:
    - simple baseline household
    - early retirement / CoastFIRE
    - career break / sabbatical
    - complex multi-era household
  - Use these as fixtures to expose modeling weaknesses early.

- **Suggested phased approach**
  1. Start with multiple full YAML files because it is the fastest path.
  2. Add a load-time normalization/defaulting layer so schema changes are less painful.
  3. If duplication becomes annoying, move to a base + override model.
  4. Avoid a database until scenarios need collaboration, metadata querying, or multi-user persistence.

- **My recommendation**
  - Do **not** jump to a database yet.
  - Build support for a small library of YAML scenarios.
  - Pair that with a normalization/migration layer so old files keep working as the schema evolves.
  - If we find ourselves repeatedly editing the same fields across all scenarios, then introduce base scenario + override composition.
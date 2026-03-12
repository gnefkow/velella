# How to Use Counterfoil Kit in Your App

This guide will walk you through using Counterfoil Kit in a brand new React + TypeScript + Vite project. We'll assume you're starting from scratch and explain every step.

### Add Counterfoil to an existing app (quick path)

If your app already exists and you only need to wire Counterfoil in:

1. **Install the package:** `npm install counterfoil-starter-kit` (or use a local path / `npm link` as in Step 2.2).
2. **Tailwind:** Ensure Tailwind is installed, then add Counterfoil's preset and content (Step 3.2): `presets: [require('counterfoil-starter-kit/tailwind-preset')]` and include `'./node_modules/counterfoil-starter-kit/dist/**/*.{js,jsx,ts,tsx}'` in your `content` array.
3. **Styles:** In your main CSS file, at the top: `@import 'counterfoil-starter-kit/styles/semanticTokens.css';`
4. **Optional:** Override design tokens in your own CSS (Step 6) and/or use the pre-built utility CSS if you're on Tailwind v4 (see Tailwind v4 note in Step 3).

Then import components from `'counterfoil-starter-kit'` as in Step 5. For exact props and types, use the package's TypeScript definitions.

## Prerequisites

Before you start, make sure you have:
- **Node.js** installed (version 18 or higher)
- **npm** (comes with Node.js) or **pnpm** or **yarn**
- A code editor (like VS Code)

To check if you have Node.js installed, open your terminal and type:
```bash
node --version
```

If you see a version number (like `v20.10.0`), you're good to go!

## Step 1: Create Your New Project

First, let's create a new React + TypeScript + Vite project.

### 1.1 Open Your Terminal

Open your terminal (or command prompt on Windows). You'll use this to run commands.

### 1.2 Navigate to Where You Want Your Project

Use the `cd` command to go to the folder where you want to create your project. For example:

```bash
cd ~/Code
```

Or on Windows:
```bash
cd C:\Users\YourName\Documents\Code
```

### 1.3 Create the Vite Project

Run this command to create a new React + TypeScript project:

```bash
npm create vite@latest my-app -- --template react-ts
```

**What this does:**
- `npm create vite@latest` - Uses npm to create a new Vite project
- `my-app` - This is your project name (you can change it to whatever you want)
- `--template react-ts` - Creates a React + TypeScript template

**Wait for it to finish!** You'll see it downloading files. This might take a minute.

### 1.4 Go Into Your Project Folder

After it's done, you need to go into your new project folder:

```bash
cd my-app
```

(Replace `my-app` with whatever name you used in step 1.3)

### 1.5 Install Dependencies

Now install all the project dependencies:

```bash
npm install
```

**What this does:** This reads the `package.json` file and downloads all the packages your project needs (like React, TypeScript, etc.).

**Wait for it to finish!** This might take a minute or two.

### 1.6 Test That It Works

Let's make sure everything is set up correctly:

```bash
npm run dev
```

**What this does:** Starts a development server so you can see your app in the browser.

You should see something like:
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

Open that URL in your browser (usually `http://localhost:5173/`). You should see a React app!

**To stop the server:** Press `Ctrl + C` in your terminal.

## Step 2: Install Counterfoil Kit

Now let's add Counterfoil Kit to your project.

### 2.1 Stop the Dev Server

If your dev server is still running (from step 1.6), stop it by pressing `Ctrl + C` in your terminal.

### 2.2 Install Counterfoil Kit

**If Counterfoil Kit is published to npm:**
```bash
npm install counterfoil-starter-kit
```

**If Counterfoil Kit is local (on your computer):**

First, make sure you're in your project folder (`my-app`). Then:

**Option A: Using a file path**
```bash
npm install ../counterfoil-kit
```
(Replace `../counterfoil-kit` with the actual path to your Counterfoil Kit folder)

**Option B: Using npm link**
```bash
# First, go to the Counterfoil Kit folder
cd ../counterfoil-kit
npm link

# Then go back to your project folder
cd ../my-app
npm link counterfoil-starter-kit
```

**What this does:** Adds Counterfoil Kit to your project's `node_modules` folder so you can import it.

## Publishing and Updating Counterfoil Kit

If you're maintaining Counterfoil Kit and want to publish updates, or if you're using Counterfoil Kit in an app and want to get the latest version, follow these steps.

### Publishing Counterfoil Kit (For Toolkit Maintainers)

When you've made changes to Counterfoil Kit and want to publish a new version:

#### Step 1: Build the Library

First, make sure you're in the Counterfoil Kit folder:

```bash
cd /path/to/counterfoil-kit
```

Then build the library:

```bash
npm run build:lib
```

**What this does:** Creates the `dist` folder with all the compiled code, TypeScript definitions, and CSS files that will be published.

**Wait for it to finish!** You should see output showing the build completed successfully.

#### Step 2: Update the Version Number

Open `package.json` in the Counterfoil Kit folder and update the version number.

**Version numbers follow semantic versioning:**
- **Patch version** (1.0.0 → 1.0.1): Small bug fixes, no breaking changes
- **Minor version** (1.0.0 → 1.1.0): New features, but backwards compatible
- **Major version** (1.0.0 → 2.0.0): Breaking changes that might break existing apps

For example, if the current version is `1.0.0` and you added a new component:
```json
{
  "version": "1.1.0"
}
```

#### Step 3: Test Your Build

Before publishing, make sure everything works:

```bash
# Check that dist folder exists and has files
ls dist

# You should see files like:
# - counterfoil-kit.es.js
# - counterfoil-kit.umd.js
# - index.d.ts
# - styles.css
# - semanticTokens.css
# - base.css
# - CounterfoilComponents.css
```

#### Step 4: Login to npm (First Time Only)

If you haven't published to npm before, you need to create an account and login:

1. Go to [npmjs.com](https://www.npmjs.com) and create an account
2. Then in your terminal, login:
```bash
npm login
```

You'll be asked for:
- Username
- Password
- Email address

#### Step 5: Publish to npm

Make sure you're still in the Counterfoil Kit folder, then:

```bash
npm publish
```

**What this does:** Uploads your package to npm so others (including your other apps) can install it.

**Wait for it to finish!** You should see a message like "published counterfoil-starter-kit@1.1.0".

**Important:** Make sure you've committed your changes to git before publishing!

#### Step 6: Verify It's Published

You can check that it's published by visiting:
```
https://www.npmjs.com/package/counterfoil-starter-kit
```

Or check from the command line:
```bash
npm view counterfoil-starter-kit version
```

This should show the version number you just published.

### Updating Counterfoil Kit in Your App (For App Developers)

When a new version of Counterfoil Kit is published, here's how to update your app to use it.

#### Step 1: Check Current Version

First, let's see what version you're currently using. In your app folder (`my-app`):

```bash
cd /path/to/my-app
```

Check your `package.json` file. Look for a line like:
```json
{
  "dependencies": {
    "counterfoil-starter-kit": "^1.0.0"
  }
}
```

The version number shows what you have installed.

#### Step 2: Check for Updates

See what the latest version is on npm:

```bash
npm view counterfoil-starter-kit version
```

This shows the latest published version.

#### Step 3: Update to Latest Version

**Option A: Update to the latest version automatically**

```bash
npm update counterfoil-starter-kit
```

**What this does:** Updates Counterfoil Kit to the latest version that matches your version range in `package.json`.

**Option B: Update to a specific version**

If you want a specific version:

```bash
npm install counterfoil-starter-kit@1.1.0
```

(Replace `1.1.0` with the version you want)

**Option C: Update to the absolute latest**

To get the very latest version regardless of version ranges:

```bash
npm install counterfoil-starter-kit@latest
```

**What this does:** Installs the latest published version and updates your `package.json`.

#### Step 4: Verify the Update

Check that it updated by looking at `package.json`:

```bash
cat package.json | grep counterfoil-starter-kit
```

You should see the new version number.

#### Step 5: Restart Your Dev Server

If your dev server is running, stop it (`Ctrl + C`) and restart it:

```bash
npm run dev
```

**Why:** Sometimes npm updates don't fully take effect until you restart.

#### Step 6: Test Your App

Open your app in the browser and make sure everything still works. Check:
- Components still render correctly
- Styles are still applied
- No errors in the browser console (F12 → Console tab)

### Understanding Version Ranges in package.json

When you install Counterfoil Kit, npm adds a version range to your `package.json`:

- `^1.0.0` - Allows updates to any 1.x.x version (1.0.1, 1.1.0, etc.) but not 2.0.0
- `~1.0.0` - Allows only patch updates (1.0.1, 1.0.2, etc.) but not 1.1.0
- `1.0.0` - Exact version only, no automatic updates
- `latest` - Always use the latest version

The `^` symbol (caret) is the default and is usually what you want - it allows minor and patch updates but prevents breaking major version changes.

### Troubleshooting Updates

**Problem:** Update didn't work

**Solution:**
1. Delete `node_modules` folder:
   ```bash
   rm -rf node_modules
   ```
2. Delete `package-lock.json`:
   ```bash
   rm package-lock.json
   ```
3. Reinstall everything:
   ```bash
   npm install
   ```

**Problem:** App broke after update

**Solution:**
1. Check what version you had before (look at git history or `package-lock.json`)
2. Install the previous version:
   ```bash
   npm install counterfoil-starter-kit@1.0.0
   ```
   (Replace with the version that worked)
3. Check the Counterfoil Kit changelog or release notes for breaking changes

### 2.3 Install Tailwind CSS (Required)

Counterfoil Kit uses Tailwind CSS, so you need to install it in your project:

```bash
npm install -D tailwindcss postcss autoprefixer
```

**What this does:**
- `-D` means these are "dev dependencies" (only needed during development)
- Installs Tailwind CSS and its required tools

### 2.4 Initialize Tailwind

Create a Tailwind configuration file:

```bash
npx tailwindcss init -p
```

**What this does:**
- `npx` runs a command from a package without installing it globally
- Creates `tailwind.config.js` and `postcss.config.js` files

## Step 3: Configure Tailwind

Now we need to tell Tailwind to use Counterfoil Kit's preset.

### 3.1 Open `tailwind.config.js`

Open the `tailwind.config.js` file in your project root. It should look something like this:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### 3.2 Update the Config

Replace the entire file with this:

```js
/** @type {import('tailwindcss').Config} */
export default {
  presets: [require('counterfoil-starter-kit/tailwind-preset')],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
    './node_modules/counterfoil-starter-kit/dist/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**What this does:**
- `presets` - Uses Counterfoil Kit's Tailwind configuration
- `content` - Tells Tailwind which files to scan for classes (including Counterfoil Kit components)

**Tailwind v4:** If your app uses Tailwind v4, you can instead import the pre-built utility CSS: `@import 'counterfoil-starter-kit/styles/CounterfoilComponents.css';` (in addition to or instead of using the preset, depending on your setup). The preset above is Tailwind v3–style; both approaches are supported.

### 3.3 Save the File

Save the file (Ctrl+S or Cmd+S).

## Step 4: Set Up Styles

Now we need to import Counterfoil Kit's styles.

### 4.1 Open Your Main CSS File

Find your main CSS file. It's usually `src/index.css` or `src/main.css`. Open it.

### 4.2 Add Counterfoil Kit Styles

At the **top** of the file, add this line:

```css
@import 'counterfoil-starter-kit/styles/semanticTokens.css';
```

**Important:** This line should be at the very top, before any other CSS.

Your file should look something like this:

```css
@import 'counterfoil-starter-kit/styles/semanticTokens.css';

/* Rest of your existing CSS... */
```

### 4.3 Make Sure It's Imported in Your App

Check your `src/main.tsx` (or `src/main.jsx`) file. It should have a line that imports your CSS file:

```tsx
import './index.css'  // or whatever your CSS file is called
```

If it's not there, add it!

### 4.4 Save the File

Save the file.

## Step 5: Use Components!

Now you can start using Counterfoil Kit components!

### 5.1 Open Your App Component

Open `src/App.tsx` (or `src/App.jsx`).

### 5.2 Import Components

At the top of the file, add imports for the components you want to use:

```tsx
import { Button, Card, Stack, Input } from 'counterfoil-starter-kit'
```

**What this does:** Imports the Button, Card, Stack, and Input components from Counterfoil Kit.

### 5.3 Use the Components

Replace the content of your App component. Here's a simple example:

```tsx
import { Button, Card, Stack } from 'counterfoil-starter-kit'

function App() {
  return (
    <div style={{ padding: '2rem' }}>
      <Card>
        <Stack gap="lg">
          <h1>Welcome to My App!</h1>
          <Button variant="primary" onClick={() => alert('Hello!')}>
            Click Me
          </Button>
          <Button variant="secondary">
            Secondary Button
          </Button>
        </Stack>
      </Card>
    </div>
  )
}

export default App
```

### 5.4 Save and Test

1. Save the file
2. Make sure your dev server is running (`npm run dev`)
3. Check your browser - you should see the components!

## Step 6: Customize Your Theme (Optional)

One of the best things about Counterfoil Kit is how easy it is to customize colors!

### 6.1 Create a Theme File

Create a new file called `src/theme.css` in your project.

### 6.2 Add Your Custom Colors

In `src/theme.css`, add your custom colors:

```css
:root {
  /* Change background from dark to white */
  --bg-primary: #ffffff;
  
  /* Change text from light to dark */
  --text-primary: #000000;
  
  /* Change accent color to red */
  --accent-primary: #ef4444;
  
  /* Change button colors */
  --button-primary-bg: #ef4444;
  --button-primary-text: #ffffff;
  --button-primary-bg-hover: #dc2626;
}
```

**What this does:** Overrides Counterfoil Kit's default colors with your own.

### 6.3 Import Your Theme

In your main CSS file (`src/index.css`), import your theme **after** the Counterfoil Kit import:

```css
@import 'counterfoil-starter-kit/styles/semanticTokens.css';
@import './theme.css';  /* Your custom theme */
```

**Important:** Your theme file must come **after** the Counterfoil Kit import so your overrides take effect.

### 6.4 Save and Refresh

Save both files and refresh your browser. Your components should now use your custom colors!

## Common Components You'll Use

Here are some common components and how to use them:

### Button

```tsx
import { Button } from 'counterfoil-starter-kit'

<Button variant="primary" size="md" onClick={() => console.log('Clicked!')}>
  Click Me
</Button>
```

**Variants:** `primary`, `secondary`, `tertiary`, `quaternary`, `link`, `destructive-primary`, `destructive-secondary`  
**Sizes:** `sm`, `md`, `lg`, `2xl`  
**Width:** `hug` (auto width) or `fill` (full width)

### Card

```tsx
import { Card } from 'counterfoil-starter-kit'

<Card>
  <p>Content goes here</p>
</Card>
```

### Stack (Vertical Layout)

```tsx
import { Stack } from 'counterfoil-starter-kit'

<Stack gap="lg">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</Stack>
```

**Gap options:** `xs`, `sm`, `m`, `lg`, `xl`

### Inline (Horizontal Layout)

```tsx
import { Inline } from 'counterfoil-starter-kit'

<Inline gap="m" align="center">
  <Button>Button 1</Button>
  <Button>Button 2</Button>
</Inline>
```

**Gap options:** `xs`, `sm`, `m`, `lg`, `xl`  
**Align options:** `start`, `center`, `end`, `baseline`

### Input

```tsx
import { Input, InputField } from 'counterfoil-starter-kit'

// Just the input
<Input type="text" placeholder="Enter text..." />

// Input with label
<InputField
  label="Email"
  type="email"
  placeholder="you@example.com"
/>
```

### Form Components

```tsx
import { CheckboxField, RadioField, TextareaField } from 'counterfoil-starter-kit'

<CheckboxField label="I agree to terms" />
<RadioField label="Option 1" name="choice" value="1" />
<TextareaField label="Message" placeholder="Enter your message..." />
```

## Package exports and API reference

All of the following are exported from `'counterfoil-starter-kit'`:

- **Primitives:** `Button`, `Card`, `Inline`, `Stack`, `Text`
- **Form:** `Checkbox`, `CheckboxField`, `Input`, `InputField`, `Radio`, `RadioField`, `Textarea`, `TextareaField`
- **Data:** `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`, `TableFooter`, `TableEmptyState`
- **Navigation:** `Tab`, `TabBar`
- **Icons:** Re-exports from lucide-react (e.g. `Home`, `Menu`, `Close`, `ChevronRight`, `ChevronLeft`, `ChevronDown`, `ChevronUp`, `Plus`, `Minus`, `Edit`, `Trash`, `Save`, `Search`, `Settings`, `User`, `Users`, `Bell`, `Mail`, `Calendar`, `Check`, `AlertCircle`, `Info`, `Image`, `File`, `FileText`, `Folder`, and more). Import from `'counterfoil-starter-kit'` or see the package source for the full list.

For exact prop types, required/optional fields, and handler signatures, use the package's TypeScript definitions (e.g. your editor's "Go to definition" on an import from `counterfoil-starter-kit`).

## Troubleshooting

### "Module not found" error

**Problem:** You see an error like `Cannot find module 'counterfoil-starter-kit'`

**Solution:**
1. Make sure you ran `npm install counterfoil-starter-kit` (or your local path)
2. Check that you're in your project folder (`my-app`)
3. Try deleting `node_modules` and running `npm install` again:
   ```bash
   rm -rf node_modules
   npm install
   ```

### Components look unstyled

**Problem:** Components render but don't have any styling

**Solution:**
1. Make sure you imported the styles: `@import 'counterfoil-starter-kit/styles/semanticTokens.css';`
2. Check that your CSS file is imported in `main.tsx`
3. Make sure Tailwind is configured correctly (step 3)
4. Restart your dev server (`Ctrl + C` then `npm run dev`)

### Tailwind classes don't work

**Problem:** Classes like `bg-bg-primary` don't work

**Solution:**
1. Make sure you added the Tailwind preset in `tailwind.config.js` (step 3.2)
2. Make sure your `content` array includes Counterfoil Kit's dist folder
3. Restart your dev server

### Colors don't change when I override them

**Problem:** You added custom colors but nothing changed

**Solution:**
1. Make sure your theme file is imported **after** the Counterfoil Kit styles
2. Check that you're using the correct CSS variable names (they start with `--`)
3. Make sure you're overriding them in `:root`

## Next Steps

- Explore all the components in the Counterfoil Kit (see the export list above)
- Read the component source code to see how they work
- Experiment with different color themes
- In the Counterfoil Kit repo, read `0_resources/design_philosophy.md` to understand the design principles

## Getting Help

If you're stuck:
1. Check the browser console for errors (F12 → Console tab)
2. Check your terminal for errors
3. Make sure all files are saved
4. Try restarting your dev server

Happy coding! 🎉

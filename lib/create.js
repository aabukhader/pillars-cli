import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import readline from 'readline';

function createInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

async function promptPackageManager() {
  const rl = createInterface();
  
  return new Promise((resolve) => {
    console.log('\n📦 Select a package manager:');
    console.log('1. npm (default)');
    console.log('2. yarn');
    console.log('3. pnpm');
    
    rl.question('\nEnter your choice (1-3): ', (answer) => {
      rl.close();
      
      switch (answer.trim()) {
        case '2':
          resolve('yarn');
          break;
        case '3':
          resolve('pnpm');
          break;
        default:
          resolve('npm');
      }
    });
  });
}

function detectPackageManager() {
  // Check if any package manager is installed globally
  try {
    execSync('yarn --version', { stdio: 'ignore' });
    return 'yarn';
  } catch {
    try {
      execSync('pnpm --version', { stdio: 'ignore' });
      return 'pnpm';
    } catch {
      return 'npm';
    }
  }
}

function installDependencies(packageManager, projectPath) {
  try {
    switch (packageManager) {
      case 'yarn':
        execSync('yarn', { cwd: projectPath, stdio: 'inherit' });
        break;
      case 'pnpm':
        execSync('pnpm install', { cwd: projectPath, stdio: 'inherit' });
        break;
      default: // npm
        execSync('npm install', { cwd: projectPath, stdio: 'inherit' });
    }
  } catch (error) {
    console.error(`❌ Error installing dependencies using ${packageManager}:`, error.message);
    process.exit(1);
  }
}

export async function createProject(projectName, useTypeScript = false) {
  useTypeScript = Object.keys(useTypeScript).includes("typescript")
    ? useTypeScript.typescript
    : false;
  const projectPath = path.join(process.cwd(), projectName);
  const srcPath = path.join(projectPath, "src");
  const folders = [
    "models",
    "repositories",
    "services",
    "controllers",
    "routes",
  ];

  if (fs.existsSync(projectPath)) {
    console.error(`❌ Project "${projectName}" already exists.`);
    return;
  }

  // Create src structure
  fs.mkdirSync(srcPath, { recursive: true });
  folders.forEach((folder) =>
    fs.mkdirSync(path.join(srcPath, folder), { recursive: true })
  );

  // Create index file (js or ts)
  const indexContent = useTypeScript
    ? `
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
});
`.trimStart()
    : `
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(morgan('dev'));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Server is running!');
});

app.listen(PORT, () => {
  console.log(\`🚀 Server running on http://localhost:\${PORT}\`);
});
`.trimStart();

  fs.writeFileSync(
    path.join(srcPath, useTypeScript ? "index.ts" : "index.js"),
    indexContent
  );

  // Create package.json
  const packageJson = {
    name: projectName,
    version: "1.0.0",
    description: "",
    license: "ISC",
    author: "",
    main: useTypeScript ? "dist/index.js" : "src/index.js",
    scripts: {
      dev: useTypeScript
        ? "ts-node-dev --respawn --transpile-only src/index.ts"
        : "node --watch src/index.js",
      start: useTypeScript ? "node dist/index.js" : "node src/index.js",
      build: useTypeScript ? "tsc" : undefined,
    },
    dependencies: {
      "body-parser": "^2.2.0",
      cors: "^2.8.5",
      dotenv: "^16.4.7",
      express: "^5.1.0",
      jsonwebtoken: "^9.0.2",
      morgan: "^1.10.0",
      path: "^0.12.7",
    },
    devDependencies: useTypeScript
      ? {
          "@types/body-parser": "^1.19.5",
          "@types/cors": "^2.8.17",
          "@types/express": "^4.17.21",
          "@types/morgan": "^1.9.9",
          "@types/node": "^20.11.24",
          "ts-node-dev": "^2.0.0",
          typescript: "^5.3.3",
        }
      : {},
  };
  if (!useTypeScript) {
    packageJson.type = "module";
  }
  fs.writeFileSync(
    path.join(projectPath, "package.json"),
    JSON.stringify(packageJson, null, 2)
  );

  // Create tsconfig.json if TypeScript
  if (useTypeScript) {
    const tsConfig = {
      compilerOptions: {
        target: "ES2020",
        module: "NodeNext",
        moduleResolution: "NodeNext",
        outDir: "./dist",
        rootDir: "./src",
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        allowImportingTsExtensions: true,
        noEmit: true,
      },
      include: ["src/**/*"],
      exclude: ["node_modules"],
    };
    fs.writeFileSync(
      path.join(projectPath, "tsconfig.json"),
      JSON.stringify(tsConfig, null, 2)
    );
  }

  // Create .env file
  fs.writeFileSync(path.join(projectPath, ".env"), "PORT=3000\n");

  // Create .gitignore
  fs.writeFileSync(
    path.join(projectPath, ".gitignore"),
    "node_modules/\n.env\n" + (useTypeScript ? "dist/\n" : "")
  );

  // Ask user to select package manager
  const packageManager = await promptPackageManager();
  console.log(`\n📦 Using ${packageManager} as package manager`);

  // Install dependencies
  console.log("📦 Installing dependencies...");
  installDependencies(packageManager, projectPath);
  
  process.chdir(projectPath);
  console.log(`✅ Project "${projectName}" created successfully with ${useTypeScript ? "TypeScript" : "JavaScript"}.`);
  console.log(`\n🚀 To start the project:`);
  console.log(`   cd ${projectName}`);
  console.log(`   ${packageManager} run dev`);
}

import fs from "fs";
import path from "path";
import { execSync } from 'child_process';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function isTypeScriptProject() {
  return fs.existsSync(path.join(process.cwd(), 'tsconfig.json'));
}

function detectPackageManager() {
  if (fs.existsSync(path.join(process.cwd(), 'yarn.lock'))) {
    return 'yarn';
  } else if (fs.existsSync(path.join(process.cwd(), 'pnpm-lock.yaml'))) {
    return 'pnpm';
  } else {
    return 'npm';
  }
}

function installDependencies(packageManager, dependencies, isDev = false) {
  const flag = isDev ? '-D' : '-S';
  const deps = dependencies.join(' ');
  
  try {
    switch (packageManager) {
      case 'yarn':
        execSync(`yarn add ${isDev ? '--dev' : ''} ${deps}`, { stdio: 'inherit' });
        break;
      case 'pnpm':
        execSync(`pnpm add ${flag} ${deps}`, { stdio: 'inherit' });
        break;
      default: // npm
        execSync(`npm install ${flag} ${deps}`, { stdio: 'inherit' });
    }
  } catch (error) {
    console.error(`❌ Failed to install dependencies using ${packageManager}:`, error.message);
    process.exit(1);
  }
}

export function addComponent(type, name) {
  const baseDir = path.join(process.cwd(), "src");
  const capName = capitalize(name);
  const isTS = isTypeScriptProject();
  const fileExt = isTS ? '.ts' : '.js';
  const packageManager = detectPackageManager();

  if (type === "resource" || type === "rs") {
    // create model
    const modelPath = path.join(baseDir, "models", `${name}${fileExt}`);
    if (fs.existsSync(modelPath)) {
      console.error(`❌ Model "${name}" already exists.`);
      process.exit(1);
    }
    const modelContent = isTS ? `
// ${capName} model (dummy example)
export interface ${capName}Data {
  id?: string;
  [key: string]: any;
}

export class ${capName} {
  id?: string;
  [key: string]: any;

  constructor(data: ${capName}Data) {
    Object.assign(this, data);
  }
}
`.trim() : `
// ${capName} model (dummy example)
export class ${capName} {
  constructor(data) {
    Object.assign(this, data);
  }
}
`.trim();
    fs.writeFileSync(modelPath, modelContent);

    // create repository
    const repoPath = path.join(baseDir, "repositories", `${name}Repository${fileExt}`);
    if (fs.existsSync(repoPath)) {
      console.error(`❌ Repository for "${name}" already exists.`);
      process.exit(1);
    }
    const repoContent = isTS ? `
import { ${capName}, ${capName}Data } from '../models/${name}';

export class ${capName}Repository {
  private items: ${capName}[] = []; // pretend DB

  create(data: ${capName}Data): ${capName} {
    const item = new ${capName}(data);
    this.items.push(item);
    return item;
  }

  findAll(): ${capName}[] {
    return this.items;
  }

  findById(id: string): ${capName} | undefined {
    return this.items.find(item => item.id === id);
  }

  update(id: string, data: Partial<${capName}Data>): ${capName} | null {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...data };
      return this.items[index];
    }
    return null;
  }

  delete(id: string): ${capName} | null {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = this.items[index];
      this.items.splice(index, 1);
      return deleted;
    }
    return null;
  }
}
`.trim() : `
import { ${capName} } from '../models/${name}${fileExt}';
  
export class ${capName}Repository {
  constructor() {
    this.items = []; // pretend DB
  }
  
  create(data) {
    const item = new ${capName}(data);
    this.items.push(item);
    return item;
  }
  
  findAll() {
    return this.items;
  }

  findById(id) {
    return this.items.find(item => item.id === id);
  }

  update(id, data) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      this.items[index] = { ...this.items[index], ...data };
      return this.items[index];
    }
    return null;
  }

  delete(id) {
    const index = this.items.findIndex(item => item.id === id);
    if (index !== -1) {
      const deleted = this.items[index];
      this.items.splice(index, 1);
      return deleted;
    }
    return null;
  }
}
`.trim();
    fs.writeFileSync(repoPath, repoContent);

    // create service
    const servicePath = path.join(baseDir, "services", `${name}Service${fileExt}`);
    if (fs.existsSync(servicePath)) {
      console.error(`❌ Service for "${name}" already exists.`);
      process.exit(1);
    }
    const serviceContent = isTS ? `
import { ${capName}Repository } from '../repositories/${name}Repository';
import { ${capName}, ${capName}Data } from '../models/${name}';

export class ${capName}Service {
  private repository: ${capName}Repository;

  constructor() {
    this.repository = new ${capName}Repository();
  }

  async getAll(): Promise<${capName}[]> {
    return this.repository.findAll();
  }

  async create(data: ${capName}Data): Promise<${capName}> {
    return this.repository.create(data);
  }

  async getById(id: string): Promise<${capName} | undefined> {
    return this.repository.findById(id);
  }

  async update(id: string, data: Partial<${capName}Data>): Promise<${capName} | null> {
    return this.repository.update(id, data);
  }

  async delete(id: string): Promise<${capName} | null> {
    return this.repository.delete(id);
  }
}
`.trim() : `
import { ${capName}Repository } from '../repositories/${name}Repository${fileExt}';
  
export class ${capName}Service {
  constructor() {
    this.repository = new ${capName}Repository();
  }
  
  async getAll() {
    return this.repository.findAll();
  }
  
  async create(data) {
    return this.repository.create(data);
  }

  async getById(id) {
    return this.repository.findById(id);
  }

  async update(id, data) {
    return this.repository.update(id, data);
  }

  async delete(id) {
    return this.repository.delete(id);
  }
}
`.trim();
    fs.writeFileSync(servicePath, serviceContent);

    // create controller
    const controllerPath = path.join(baseDir, "controllers", `${name}Controller${fileExt}`);
    if (fs.existsSync(controllerPath)) {
      console.error(`❌ Controller for "${name}" already exists.`);
      process.exit(1);
    }
    const controllerContent = isTS ? `
import { Request, Response } from 'express';
import { ${capName}Service } from '../services/${name}Service';
import { ${capName}Data } from '../models/${name}';

const service = new ${capName}Service();

export class ${capName}Controller {
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      const items = await service.getAll();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const newItem = await service.create(req.body as ${capName}Data);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const item = await service.getById(req.params.id);
      if (!item) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const updatedItem = await service.update(req.params.id, req.body);
      if (!updatedItem) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }

  async delete(req: Request, res: Response): Promise<void> {
    try {
      const deletedItem = await service.delete(req.params.id);
      if (!deletedItem) {
        res.status(404).json({ error: 'Item not found' });
        return;
      }
      res.json(deletedItem);
    } catch (error) {
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
`.trim() : `
import { ${capName}Service } from '../services/${name}Service${fileExt}';
  
const service = new ${capName}Service();
  
export class ${capName}Controller {
  async getAll(req, res) {
    try {
      const items = await service.getAll();
      res.json(items);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
  
  async create(req, res) {
    try {
      const newItem = await service.create(req.body);
      res.status(201).json(newItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getById(req, res) {
    try {
      const item = await service.getById(req.params.id);
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async update(req, res) {
    try {
      const updatedItem = await service.update(req.params.id, req.body);
      if (!updatedItem) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(updatedItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async delete(req, res) {
    try {
      const deletedItem = await service.delete(req.params.id);
      if (!deletedItem) {
        return res.status(404).json({ error: 'Item not found' });
      }
      res.json(deletedItem);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}
`.trim();
    fs.writeFileSync(controllerPath, controllerContent);

    // create routes
    const routesPath = path.join(baseDir, "routes", `${name}Routes${fileExt}`);
    if (fs.existsSync(routesPath)) {
      console.error(`❌ Routes for "${name}" already exists.`);
      process.exit(1);
    }
    const routesContent = isTS ? `
import { Router } from 'express';
import { ${capName}Controller } from '../controllers/${name}Controller';

const router = Router();
const controller = new ${capName}Controller();

router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
`.trim() : `
import express from 'express';
import { ${capName}Controller } from '../controllers/${name}Controller${fileExt}';
  
const router = express.Router();
const controller = new ${capName}Controller();
  
router.get('/', (req, res) => controller.getAll(req, res));
router.post('/', (req, res) => controller.create(req, res));
router.get('/:id', (req, res) => controller.getById(req, res));
router.put('/:id', (req, res) => controller.update(req, res));
router.delete('/:id', (req, res) => controller.delete(req, res));
  
export default router;
`.trim();
    fs.writeFileSync(routesPath, routesContent);

    console.log(
      `✅ Resource "${name}" created with model, repository, service, controller, and routes.`
    );
  } else if (type === "test") {
    const testDir = path.join(process.cwd(), "__tests__");
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    const testPath = path.join(testDir, `${name}.test${fileExt}`);
    if (fs.existsSync(testPath)) {
      console.error(`❌ Test file for "${name}" already exists.`);
      process.exit(1);
    }

    const testContent = isTS ? `
import { describe, it, expect, beforeEach } from '@jest/globals';

describe('${capName}', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should pass this test', () => {
    expect(true).toBe(true);
  });

  // Add more test cases here
});
`.trim() : `
describe('${capName}', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should pass this test', () => {
    expect(true).toBe(true);
  });

  // Add more test cases here
});
`.trim();

    fs.writeFileSync(testPath, testContent);

    // Update package.json and install Jest
    try {
      const packageJsonPath = path.join(process.cwd(), 'package.json');
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      
      // Update scripts
      packageJson.scripts = {
        ...packageJson.scripts,
        test: 'node --experimental-vm-modules node_modules/jest/bin/jest.js',
        'test:watch': 'node --experimental-vm-modules node_modules/jest/bin/jest.js --watch'
      };

      // Add Jest configuration
      packageJson.jest = {
        preset: 'ts-jest',
        testEnvironment: 'node',
        moduleNameMapper: {
          '^(\\.{1,2}/.*)\\.js$': '$1'
        },
        transform: {
          '^.+\\.tsx?$': ['ts-jest', {
            useESM: true
          }]
        }
      };

      // Write updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));

      // Install Jest and TypeScript dependencies if not already installed
      if (!packageJson.devDependencies?.jest) {
        console.log(`📦 Installing Jest and dependencies using ${packageManager}...`);
        const dependencies = [
          'jest@latest',
          '@jest/globals@latest',
          'ts-jest@latest',
          'typescript@latest',
          '@types/jest@latest'
        ];
        installDependencies(packageManager, dependencies, true);

        // Create tsconfig.json if it doesn't exist
        const tsConfigPath = path.join(process.cwd(), 'tsconfig.json');
        if (!fs.existsSync(tsConfigPath)) {
          const tsConfig = {
            "compilerOptions": {
              "target": "ES2020",
              "module": "ESNext",
              "moduleResolution": "node",
              "esModuleInterop": true,
              "strict": true,
              "skipLibCheck": true,
              "forceConsistentCasingInFileNames": true
            },
            "include": ["**/*.ts"],
            "exclude": ["node_modules"]
          };
          fs.writeFileSync(tsConfigPath, JSON.stringify(tsConfig, null, 2));
          console.log('✅ Created TypeScript configuration');
        }
      }

      console.log(`✅ Created test file: ${testPath}`);
      console.log('✅ Jest has been configured and installed');
      console.log(`📝 You can now run tests using: ${packageManager} test`);
    } catch (error) {
      console.error('❌ Failed to setup Jest:', error.message);
      process.exit(1);
    }
    return;
  } else {
    const typeMap = {
      model: "models",
      md: "models",
      repository: "repositories",
      rp: "repositories",
      service: "services",
      sv: "services",
      controller: "controllers",
      ct: "controllers",
      route: "routes",
      r: "routes",
    };

    const folder = typeMap[type.toLowerCase()];
    if (!folder) {
      console.error(
        "❌ Invalid type. Valid types: model, repository, service, controller, route, resource"
      );
      process.exit(1);
    }

    const filePath = path.join(baseDir, folder, `${name}${fileExt}`);
    if (fs.existsSync(filePath)) {
      console.error(`❌ ${type} "${name}" already exists.`);
      process.exit(1);
    }

    const content = `// ${type} for ${name}`;
    fs.writeFileSync(filePath, content);
    console.log(`✅ Created ${type} "${name}" in ${folder}/`);
  }
}

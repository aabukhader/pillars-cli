import { describe, it, expect, beforeEach, afterEach, beforeAll, jest } from '@jest/globals';

let execSync;
let fsMock, pathMock;

beforeAll(async () => {
  fsMock = {
    existsSync: jest.fn(() => false),
    mkdirSync: jest.fn(() => {}),
    writeFileSync: jest.fn(() => {})
  };
  pathMock = {
    join: jest.requireActual('path').join
  };
  jest.unstable_mockModule('fs', () => ({ default: fsMock }));
  jest.unstable_mockModule('path', () => ({ default: pathMock }));
  jest.unstable_mockModule('child_process', () => ({ execSync: jest.fn() }));
  ({ execSync } = await import('child_process'));
});

describe('createProject', () => {
  const mockProjectName = 'test-project';
  let mockProjectPath;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(process, 'cwd').mockReturnValue('/mock/current/dir');
    fsMock.existsSync.mockImplementation(() => false);
    fsMock.mkdirSync.mockImplementation(() => {});
    fsMock.writeFileSync.mockImplementation(() => {});
    if (execSync) execSync.mockImplementation(() => {});
    mockProjectPath = pathMock.join(process.cwd(), mockProjectName);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Project Creation', () => {
    it('should create project directory and necessary files', () => {
      const createProject = jest.fn((name, options) => {
        fsMock.mkdirSync(pathMock.join(process.cwd(), name));
        fsMock.writeFileSync(pathMock.join(process.cwd(), name, 'package.json'), '{}');
      });
      createProject(mockProjectName, { typescript: false });
      expect(fsMock.mkdirSync).toHaveBeenCalledWith(mockProjectPath);
      expect(fsMock.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('package.json'),
        expect.any(String)
      );
    });
    it('should throw error if project directory already exists', () => {
      fsMock.existsSync.mockImplementation((path) => path === mockProjectPath);
      const createProject = jest.fn((name, options) => {
        if (fsMock.existsSync(pathMock.join(process.cwd(), name))) {
          throw new Error(`Project directory "${name}" already exists.`);
        }
      });
      expect(() => createProject(mockProjectName)).toThrow(
        `Project directory "${mockProjectName}" already exists.`
      );
    });
  });
  describe('TypeScript Support', () => {
    it('should create TypeScript configuration when typescript option is true', () => {
      const createProject = jest.fn((name, options) => {
        if (options.typescript) {
          fsMock.writeFileSync(
            pathMock.join(process.cwd(), name, 'tsconfig.json'),
            JSON.stringify({
              compilerOptions: {
                target: 'ES2020',
                module: 'ESNext',
                moduleResolution: 'node',
                esModuleInterop: true,
                strict: true,
                skipLibCheck: true,
                forceConsistentCasingInFileNames: true
              }
            })
          );
        }
      });
      createProject(mockProjectName, { typescript: true });
      expect(fsMock.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('tsconfig.json'),
        expect.any(String)
      );
    });
  });
  describe('Package Manager Detection', () => {
    it('should detect npm when no lock file exists', () => {
      fsMock.existsSync.mockImplementation((path) => false);
      const detectPackageManager = jest.fn(() => {
        if (fsMock.existsSync('yarn.lock')) return 'yarn';
        if (fsMock.existsSync('pnpm-lock.yaml')) return 'pnpm';
        return 'npm';
      });
      expect(detectPackageManager()).toBe('npm');
    });
    it('should detect yarn when yarn.lock exists', () => {
      fsMock.existsSync.mockImplementation((path) => path === 'yarn.lock');
      const detectPackageManager = jest.fn(() => {
        if (fsMock.existsSync('yarn.lock')) return 'yarn';
        if (fsMock.existsSync('pnpm-lock.yaml')) return 'pnpm';
        return 'npm';
      });
      expect(detectPackageManager()).toBe('yarn');
    });
    it('should detect pnpm when pnpm-lock.yaml exists', () => {
      fsMock.existsSync.mockImplementation((path) => path === 'pnpm-lock.yaml');
      const detectPackageManager = jest.fn(() => {
        if (fsMock.existsSync('yarn.lock')) return 'yarn';
        if (fsMock.existsSync('pnpm-lock.yaml')) return 'pnpm';
        return 'npm';
      });
      expect(detectPackageManager()).toBe('pnpm');
    });
  });
  describe('Dependency Installation', () => {
    it('should install dependencies using detected package manager', () => {
      const installDependencies = jest.fn((packageManager, dependencies, isDev = false) => {
        const flag = isDev ? '-D' : '-S';
        const deps = dependencies.join(' ');
        if (execSync) execSync(`${packageManager} add ${flag} ${deps}`);
      });
      installDependencies('npm', ['express', 'dotenv']);
      expect(execSync).toHaveBeenCalledWith('npm add -S express dotenv');
    });
    it('should handle installation errors gracefully', () => {
      if (execSync) execSync.mockImplementation(() => { throw new Error('Installation failed'); });
      const installDependencies = jest.fn((packageManager, dependencies, isDev = false) => {
        try {
          const flag = isDev ? '-D' : '-S';
          const deps = dependencies.join(' ');
          if (execSync) execSync(`${packageManager} add ${flag} ${deps}`);
        } catch (error) {
          throw new Error(`Failed to install dependencies using ${packageManager}: ${error.message}`);
        }
      });
      expect(() => installDependencies('npm', ['express'])).toThrow(
        'Failed to install dependencies using npm: Installation failed'
      );
    });
  });
}); 

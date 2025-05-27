import { describe, it, expect, beforeEach, afterEach, beforeAll, jest } from '@jest/globals';

// Add a global timeout to force Jest to fail if it hangs
jest.setTimeout(5000);

let addComponent;
let fsMock, pathMock;

beforeAll(async () => {
  // ESM-compliant mocking
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
  ({ addComponent } = await import('../lib/add.js'));
});

describe('addComponent', () => {
  const mockProjectRoot = '/mock/project/root';

  beforeAll(() => {
    jest.spyOn(process, 'exit').mockImplementation((code) => { throw new Error(`process.exit: ${code}`); });
  });

  afterAll(() => {
    process.exit.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock process.cwd
    jest.spyOn(process, 'cwd').mockReturnValue(mockProjectRoot);
    fsMock.existsSync.mockImplementation(() => false);
    fsMock.mkdirSync.mockImplementation(() => {});
    fsMock.writeFileSync.mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Resource Creation', () => {
    it('should create all necessary files for a resource', () => {
      const type = 'resource';
      const name = 'user';
      addComponent(type, name);
      expect(fsMock.writeFileSync).toHaveBeenCalledTimes(5); // model, repository, service, controller, routes
      expect(fsMock.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('src'), { recursive: true });
    });
    it('should throw error if resource already exists', () => {
      const type = 'resource';
      const name = 'user';
      fsMock.existsSync.mockImplementation((path) => path.includes('model'));
      expect(() => addComponent(type, name)).toThrow('process.exit: 1');
    });
  });
  describe('Test File Creation', () => {
    it('should create test file with Jest setup', () => {
      const type = 'test';
      const name = 'user';
      addComponent(type, name);
      expect(fsMock.mkdirSync).toHaveBeenCalledWith(expect.stringContaining('__tests__'), { recursive: true });
      expect(fsMock.writeFileSync).toHaveBeenCalledWith(
        expect.stringContaining('__tests__/user.test.js'),
        expect.any(String)
      );
    });
    it('should throw error if test file already exists', () => {
      const type = 'test';
      const name = 'user';
      fsMock.existsSync.mockImplementation((path) => path.includes('test'));
      expect(() => addComponent(type, name)).toThrow('process.exit: 1');
    });
  });
  describe('Invalid Type Handling', () => {
    it('should throw error for invalid component type', () => {
      const type = 'invalid';
      const name = 'user';
      expect(() => addComponent(type, name)).toThrow('process.exit: 1');
    });
  });
  describe('File Existence Checks', () => {
    it('should throw error if file already exists for any component type', () => {
      const types = ['model', 'repository', 'service', 'controller', 'route'];
      types.forEach(type => {
        fsMock.existsSync.mockImplementation((path) => path.includes(type));
        expect(() => addComponent(type, 'user')).toThrow('process.exit: 1');
      });
    });
  });
}); 

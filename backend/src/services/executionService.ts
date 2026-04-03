import Docker from 'dockerode';
import { SupportedLanguage, ExecutionOutput } from '../types';
import { logger } from '../utils/logger';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { tmpdir } from 'os';
import { v4 as uuidv4 } from 'uuid';

const docker = new Docker();

const TIMEOUT_MS = parseInt(process.env.CODE_TIMEOUT_MS || '30000');
const MEMORY_LIMIT_MB = parseInt(process.env.CONTAINER_MEMORY_LIMIT_MB || '512');
const MEMORY_LIMIT_BYTES = MEMORY_LIMIT_MB * 1024 * 1024;

interface LanguageConfig {
  image: string;
  fileExtension: string;
  compileCommand?: string;
  runCommand: string;
}

const languageConfigs: Record<SupportedLanguage, LanguageConfig> = {
  cpp: {
    image: 'code-executor-cpp:latest',
    fileExtension: 'cpp',
    compileCommand: 'g++ -o /code/program /code/code.cpp',
    runCommand: '/code/program'
  },
  python: {
    image: 'code-executor-python:latest',
    fileExtension: 'py',
    runCommand: 'python3 /code/code.py'
  },
  java: {
    image: 'code-executor-java:latest',
    fileExtension: 'java',
    compileCommand: 'javac /code/Main.java',
    runCommand: 'java -cp /code Main'
  },
  javascript: {
    image: 'code-executor-javascript:latest',
    fileExtension: 'js',
    runCommand: 'node /code/code.js'
  }
};

export class ExecutionService {
  async executeCode(
    code: string,
    language: SupportedLanguage,
    stdin: string = '',
    timeout: number = TIMEOUT_MS
  ): Promise<ExecutionOutput> {
    const startTime = Date.now();
    const config = languageConfigs[language];
    
    if (!config) {
      throw new Error(`Unsupported language: ${language}`);
    }

    let container: Docker.Container | null = null;

    try {
      // Create container
      container = await this.createContainer(code, language, stdin, config);
      
      // Start container
      await container.start();

      // Wait for container with timeout
      const result = await Promise.race([
        container.wait(),
        this.createTimeout(timeout)
      ]);

      // Get logs
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        follow: false
      });

      const logString = logs.toString('utf-8');
      const stdout = this.extractStdout(logString);
      const stderr = this.extractStderr(logString);

      // Get stats
      const stats = await container.stats({ stream: false });
      const memoryUsed = stats.memory_stats?.usage || 0;

      const executionTime = Date.now() - startTime;

      return {
        stdout,
        stderr,
        exitCode: result.StatusCode,
        executionTime,
        memoryUsed,
        timestamp: Date.now()
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;

      if (error.message === 'Execution timeout') {
        logger.warn('Code execution timeout', { language, timeout });
        return {
          stdout: '',
          stderr: 'Execution timed out',
          exitCode: 124,
          executionTime: timeout,
          memoryUsed: 0,
          timestamp: Date.now()
        };
      }

      logger.error('Code execution error', { error: error.message, language });
      return {
        stdout: '',
        stderr: `Execution error: ${error.message}`,
        exitCode: 1,
        executionTime,
        memoryUsed: 0,
        timestamp: Date.now()
      };

    } finally {
      // Cleanup container
      if (container) {
        try {
          await container.stop();
          await container.remove();
        } catch (error) {
          logger.error('Error cleaning up container', { error });
        }
      }
    }
  }

  private async createContainer(
    code: string,
    language: SupportedLanguage,
    stdin: string,
    config: LanguageConfig
  ): Promise<Docker.Container> {
    const fileName = language === 'java' ? 'Main.java' : `code.${config.fileExtension}`;
    
    // Prepare command
    let cmd: string[];
    if (config.compileCommand) {
      cmd = ['/bin/sh', '-c', `${config.compileCommand} && ${config.runCommand}`];
    } else {
      cmd = ['/bin/sh', '-c', config.runCommand];
    }

    // Create container
    const container = await docker.createContainer({
      Image: config.image,
      Cmd: cmd,
      HostConfig: {
        Memory: MEMORY_LIMIT_BYTES,
        MemorySwap: MEMORY_LIMIT_BYTES,
        CpuQuota: 100000,
        CpuPeriod: 100000,
        NetworkMode: 'none',
        ReadonlyRootfs: false,
        AutoRemove: false,
        PidsLimit: 50
      },
      WorkingDir: '/code',
      OpenStdin: stdin.length > 0,
      StdinOnce: true,
      AttachStdin: stdin.length > 0,
      AttachStdout: true,
      AttachStderr: true,
      Tty: false,
      User: 'coderunner',
      Env: [
        `CODE=${Buffer.from(code).toString('base64')}`,
        `STDIN=${Buffer.from(stdin).toString('base64')}`
      ]
    });

    // Write code to container
    const codeContent = Buffer.from(code, 'utf-8');
    await container.putArchive(
      this.createTarArchive(fileName, codeContent),
      { path: '/code' }
    );

    return container;
  }

  private createTarArchive(fileName: string, content: Buffer): Buffer {
    const tar = require('tar-stream');
    const pack = tar.pack();
    
    pack.entry({ name: fileName, size: content.length }, content);
    pack.finalize();

    const chunks: Buffer[] = [];
    pack.on('data', (chunk: Buffer) => chunks.push(chunk));
    
    return new Promise((resolve, reject) => {
      pack.on('end', () => resolve(Buffer.concat(chunks)));
      pack.on('error', reject);
    });
  }

  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Execution timeout')), ms);
    });
  }

  private extractStdout(logs: string): string {
    // Docker logs format: 8 bytes header + content
    // First byte indicates stream type (1=stdout, 2=stderr)
    const lines = logs.split('\n');
    return lines
      .filter(line => line.length > 8 && line.charCodeAt(0) === 1)
      .map(line => line.substring(8))
      .join('\n');
  }

  private extractStderr(logs: string): string {
    const lines = logs.split('\n');
    return lines
      .filter(line => line.length > 8 && line.charCodeAt(0) === 2)
      .map(line => line.substring(8))
      .join('\n');
  }
}

export const executionService = new ExecutionService();

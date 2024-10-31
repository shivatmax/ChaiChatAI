type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  level: LogLevel;
  prefix?: string;
}

class Logger {
  private options: LoggerOptions;
  private isDevelopment: boolean;

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = {
      level: options.level || 'info',
      prefix: options.prefix,
    };
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.isDevelopment) return false;

    const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];
    return levels.indexOf(level) >= levels.indexOf(this.options.level);
  }

  private formatMessage(
    level: LogLevel,
    message: string,
    data?: unknown
  ): string {
    const timestamp = new Date().toISOString();
    const prefix = this.options.prefix ? `[${this.options.prefix}]` : '';
    const dataString = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `${timestamp} ${prefix}[${level.toUpperCase()}] ${message}${dataString}`;
  }

  debug(message: string, data?: unknown): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, error));
      if (error instanceof Error && error.stack) {
        console.error(error.stack);
      }
    }
  }
}

// Create default logger instance
const logger = new Logger();

export { Logger, type LogLevel, type LoggerOptions, logger };

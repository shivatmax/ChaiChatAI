type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  level: LogLevel;
  prefix?: string;
  enabled: boolean;
}

class Logger {
  private options: LoggerOptions;

  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = {
      level: options.level || 'info',
      prefix: options.prefix,
      enabled: options.enabled ?? process.env.NODE_ENV !== 'production',
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.options.enabled) return false;

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
      logger.debug(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: unknown): void {
    if (this.shouldLog('info')) {
      logger.info(this.formatMessage('info', message, data));
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.shouldLog('warn')) {
      logger.warn(this.formatMessage('warn', message, data));
    }
  }

  error(message: string, error?: unknown): void {
    if (this.shouldLog('error')) {
      logger.error(this.formatMessage('error', message, error));
      if (error instanceof Error && error.stack) {
        logger.error(error.stack);
      }
    }
  }
}

// Create default logger instance
const logger = new Logger();

export { Logger, type LogLevel, type LoggerOptions, logger };

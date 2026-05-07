class Logger {
  constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development';
  }

  log(level, message, data) {
    if (!this.isDevelopment && level === 'debug') return;

    const timestamp = new Date().toISOString();
    const style = {
      info: 'color: #3b82f6',
      warn: 'color: #f59e0b',
      error: 'color: #ef4444',
      debug: 'color: #6b7280',
    };

    console.log(
      `%c[${level.toUpperCase()}] %c${timestamp}: %c${message}`,
      style[level] || '',
      'color: inherit',
      'font-weight: bold',
      data || ''
    );
  }

  info(message, data) {
    this.log('info', message, data);
  }

  warn(message, data) {
    this.log('warn', message, data);
  }

  error(message, data) {
    this.log('error', message, data);
  }

  debug(message, data) {
    this.log('debug', message, data);
  }
}

export const logger = new Logger();

/**
 * Sistema de logging configurável para desenvolvimento e produção
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  enabled: boolean;
  level: LogLevel;
  showTimestamp: boolean;
  showComponent: boolean;
}

class Logger {
  private config: LogConfig = {
    enabled: process.env.NODE_ENV === 'development',
    level: 'debug',
    showTimestamp: true,
    showComponent: true
  };

  private getTimestamp(): string {
    if (!this.config.showTimestamp) return '';
    return `[${new Date().toLocaleTimeString()}]`;
  }

  private formatMessage(level: LogLevel, component: string, message: string): string {
    const timestamp = this.getTimestamp();
    const comp = this.config.showComponent && component ? `[${component}]` : '';
    return `${timestamp} ${comp} ${message}`;
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    
    const levels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    
    return messageLevelIndex >= currentLevelIndex;
  }

  debug(component: string, message: string, ...args: unknown[]) {
    if (this.shouldLog('debug')) {
      console.log(this.formatMessage('debug', component, message), ...args);
    }
  }

  info(component: string, message: string, ...args: unknown[]) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', component, message), ...args);
    }
  }

  warn(component: string, message: string, ...args: unknown[]) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', component, message), ...args);
    }
  }

  error(component: string, message: string, ...args: unknown[]) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', component, message), ...args);
    }
  }

  // Configurar o logger
  configure(config: Partial<LogConfig>) {
    this.config = { ...this.config, ...config };
  }

  // Métodos específicos para componentes comuns
  hooks = {
    debug: (hook: string, message: string, ...args: unknown[]) => 
      this.debug(`Hook:${hook}`, message, ...args),
    info: (hook: string, message: string, ...args: unknown[]) => 
      this.info(`Hook:${hook}`, message, ...args),
    warn: (hook: string, message: string, ...args: unknown[]) => 
      this.warn(`Hook:${hook}`, message, ...args),
    error: (hook: string, message: string, ...args: unknown[]) => 
      this.error(`Hook:${hook}`, message, ...args)
  };

  api = {
    debug: (endpoint: string, message: string, ...args: unknown[]) => 
      this.debug(`API:${endpoint}`, message, ...args),
    info: (endpoint: string, message: string, ...args: unknown[]) => 
      this.info(`API:${endpoint}`, message, ...args),
    warn: (endpoint: string, message: string, ...args: unknown[]) => 
      this.warn(`API:${endpoint}`, message, ...args),
    error: (endpoint: string, message: string, ...args: unknown[]) => 
      this.error(`API:${endpoint}`, message, ...args)
  };

  component = {
    debug: (comp: string, message: string, ...args: unknown[]) => 
      this.debug(`Component:${comp}`, message, ...args),
    info: (comp: string, message: string, ...args: unknown[]) => 
      this.info(`Component:${comp}`, message, ...args),
    warn: (comp: string, message: string, ...args: unknown[]) => 
      this.warn(`Component:${comp}`, message, ...args),
    error: (comp: string, message: string, ...args: unknown[]) => 
      this.error(`Component:${comp}`, message, ...args)
  };
}

// Instância global do logger
export const logger = new Logger();

// Para facilitar o uso
export default logger;
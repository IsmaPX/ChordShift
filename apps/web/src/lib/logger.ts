type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: {
    message: string
    stack?: string
  }
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

const currentLevel: LogLevel = import.meta.env.DEV ? 'debug' : 'info'

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel]
}

function formatEntry(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`
  if (entry.context) {
    return `${base} ${JSON.stringify(entry.context)}`
  }
  if (entry.error) {
    return `${base}\n  Error: ${entry.error.message}${entry.error.stack ? `\n  Stack: ${entry.error.stack}` : ''}`
  }
  return base
}

function createEntry(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error): LogEntry {
  return {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error: error ? { message: error.message, stack: error.stack } : undefined,
  }
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error) {
  if (!shouldLog(level)) return
  const entry = createEntry(level, message, context, error)
  const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : level === 'debug' ? console.debug : console.info
  fn(formatEntry(entry))
}

export const logger = {
  debug(message: string, context?: Record<string, unknown>) {
    log('debug', message, context)
  },
  info(message: string, context?: Record<string, unknown>) {
    log('info', message, context)
  },
  warn(message: string, context?: Record<string, unknown>) {
    log('warn', message, context)
  },
  error(message: string, error?: Error, context?: Record<string, unknown>) {
    log('error', message, context, error)
  },
}

export function createModuleLogger(module: string) {
  return {
    debug: (message: string, context?: Record<string, unknown>) => logger.debug(`[${module}] ${message}`, context),
    info: (message: string, context?: Record<string, unknown>) => logger.info(`[${module}] ${message}`, context),
    warn: (message: string, context?: Record<string, unknown>) => logger.warn(`[${module}] ${message}`, context),
    error: (message: string, error?: Error, context?: Record<string, unknown>) => logger.error(`[${module}] ${message}`, error, context),
  }
}
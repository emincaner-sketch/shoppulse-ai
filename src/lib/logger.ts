/**
 * Centralized Enterprise Logger & Error Handler (Sentry / Datadog Pattern)
 */

type LogLevel = 'info' | 'warn' | 'error' | 'audit';

interface LogPayload {
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  timestamp: string;
  errorStack?: string;
}

class Logger {
  private format(level: LogLevel, message: string, context?: Record<string, any>, error?: Error): LogPayload {
    return {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      errorStack: error?.stack,
    };
  }

  info(message: string, context?: Record<string, any>) {
    const payload = this.format('info', message, context);
    console.log(`[INFO] ${payload.timestamp} — ${message}`, context ? JSON.stringify(context) : '');
  }

  warn(message: string, context?: Record<string, any>) {
    const payload = this.format('warn', message, context);
    console.warn(`[WARN] ${payload.timestamp} — ${message}`, context ? JSON.stringify(context) : '');
  }

  error(message: string, error?: Error | any, context?: Record<string, any>) {
    const errObj = error instanceof Error ? error : new Error(String(error || message));
    const payload = this.format('error', message, context, errObj);
    console.error(`[ERROR] ${payload.timestamp} — ${message}`, payload.errorStack || '', context ? JSON.stringify(context) : '');
  }

  audit(action: string, userId: string, metadata?: Record<string, any>) {
    const payload = this.format('audit', `AUDIT_EVENT: ${action}`, { userId, ...metadata });
    console.log(`[AUDIT] ${payload.timestamp} — User: ${userId} -> Action: ${action}`, metadata ? JSON.stringify(metadata) : '');
  }
}

export const logger = new Logger();

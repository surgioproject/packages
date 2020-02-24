import winston, { format, Logger, LoggerOptions } from 'winston';

const LOG_LEVEL = process.env.SURGIO_LOG_LEVEL || 'info';

export const transports = {
  console: new winston.transports.Console({ level: LOG_LEVEL }),
};

export const createLogger = (options: CreateLoggerOptions = {}): Logger => {
  const customFormat = format.printf(({ label, timestamp, level, message }) => {
    return `${timestamp}${label ? ` [${label}]` : ''} ${level}: ${message}`;
  });
  const formats = [
    options.service ? format.label({ label: options.service }) : format.label(),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    format.errors({ stack: true }),
    format.splat(),
    format.colorize(),
    customFormat,
  ];
  const loggerFormat = format.combine(...formats);

  return winston.createLogger({
    format: loggerFormat,
    transports: [
      transports.console,
    ],
  });
};

export const logger = createLogger({
  service: 'surgio'
});

export interface CreateLoggerOptions extends LoggerOptions {
  readonly service?: string;
}

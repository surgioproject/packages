import { logger, createLogger, transports } from './';

it('should works', () => {
  const dummy1 = createLogger({
    service: 'test service',
  });
  const dummy2 = createLogger();

  expect(transports.console).toBeDefined();
  expect(logger).toBeDefined();
  expect(dummy1).toBeDefined();
  expect(dummy2).toBeDefined();

  dummy1.info('test log');
  dummy2.info('test log');
});

export default () => ({
  port: parseInt(process.env.PORT as string, 10) || 4000,
  secret: 'surgio-gateway',
  defaultCookieMaxAge: 60 * 60 * 24 * 31, // 默认一个月
});

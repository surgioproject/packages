export default () => ({
  port: parseInt(process.env.PORT as string, 10) || 4000,
  secret: process.env.SURGIO_GATEWAY_SECRET,
  defaultCookieMaxAge: 60 * 60 * 24 * 31, // 默认一个月
})

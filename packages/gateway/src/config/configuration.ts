export default () => ({
  port: parseInt(process.env.PORT, 10) || 4000,
  secret: 'surgio-gateway',
});

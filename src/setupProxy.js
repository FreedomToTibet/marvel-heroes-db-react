const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api/vine',
    createProxyMiddleware({
      target: 'https://comicvine.gamespot.com/api',
      changeOrigin: true,
      pathRewrite: {
        '^/api/vine': '', // Remove /api/vine prefix
      },
      onProxyReq: (proxyReq) => {
        // Add required User-Agent header
        proxyReq.setHeader('User-Agent', 'ReactMarvelApp/1.0');
      },
    })
  );
};
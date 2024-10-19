module.exports = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.unify.ai/v0/:path*',
      },
    ];
  },
};

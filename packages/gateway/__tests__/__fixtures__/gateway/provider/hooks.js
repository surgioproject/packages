'use strict';

module.exports = {
  type: 'custom',
  addFlag: true,
  nodeList: [
    {
      type: 'shadowsocks',
      nodeName: 'US',
      hostname: 'us.example.com',
      port: '443',
      method: 'chacha20-ietf-poly1305',
      password: 'password',
      udpRelay: true,
      obfs: 'tls',
      obfsHost: 'gateway-carry.icloud.com',
      tfo: true,
    },
    {
      type: 'snell',
      nodeName: 'Snell',
      hostname: 'us.example.com',
      port: '443',
      psk: 'password',
      obfs: 'tls',
    },
    {
      type: 'https',
      nodeName: 'HTTPS',
      hostname: 'us.example.com',
      port: '443',
      username: 'username',
      password: 'password',
    },
  ],
  hooks: {
    afterFetchNodeList: async (nodeList, customParams) => {
      return [
        {
          ...nodeList[0],
          nodeName: customParams.requestUserAgent,
        }
      ]
    }
  }
};

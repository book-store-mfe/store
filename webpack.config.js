const { shareAll, withModuleFederationPlugin } = require('@angular-architects/module-federation/webpack');

module.exports = withModuleFederationPlugin({

  name: 'store',

  shared: {
    ...shareAll({ singleton: true, strictVersion: true, requiredVersion: 'auto' }),
    "@bookstore-app/shared-lib": { singleton: true, strictVersion: false, requiredVersion: '~0.0.1' }
  },

});

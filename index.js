module.exports = {
  name: 'apostrophe-crossref',
  alias: 'crossref',
  label: 'CrossRef',
  extend: 'apostrophe-pieces',

  beforeConstruct: function(self, options) {
  },

  afterConstruct: function(self, callback) {
    self.crossrefAddRoute();
    return setImmediate(callback);
  },

  construct: function(self, options) {
    var superGetCreateSingletonOptions = self.getCreateSingletonOptions;
    self.getCreateSingletonOptions = function(req) {
      var browserOptions = superGetCreateSingletonOptions(req);
      browserOptions.crossrefConfig = self.options.crossref
      return browserOptions;
    };

    self.crossrefAddRoute = function() {
      require('./lib/routes.js')(self, options);
    };

    self.pushAsset('script', 'editor-modal', { when: 'user' });
    self.pushAsset('stylesheet', 'user', { when: 'user' });
  }
}

const $ = require('jquery');

window.StaticConfig = window.StaticConfig || {};

class PublicClient {
  constructor (apiURI = '/api/v3') {
    this.apiURI = apiURI;
  }

  get (...args) {
    return this.request('get', ...args);
  }
  put (...args) {
    return this.request('put', ...args);
  }
  post (...args) {
    return this.request('post', ...args);
  }
  delete (...args) {
    return this.request('delete', ...args);
  }

  addHeaders (obj, additional) {
    return Object.assign(
      {},
      obj.headers,
      additional
    );
  }

  makeRelativeURI (parts) {
    return `/${parts.join('/')}`;
  }

  makeAbsoluteURI (relativeURI) {
    return `${this.apiURI}${relativeURI}`;
  }

  successCallback (callback) {
    return (data, textStatus, jqXHR) => {
      try {
        data = JSON.parse(JSON.stringify(data));
      } catch (e) {
        data = null;
      }

      callback(null, textStatus, data);
    };
  }

  errorCallback (callback) {
    return (jqXHR, textStatus, errorThrown) => {
      const err = errorThrown || new Error('Failed to fetch');

      callback(err, textStatus, null);
    };
  }

  getAssetsBaseUrl () {
    const { host, protocol } = window.location;
    return window.StaticConfig.baseUrl || `${protocol}//${host}`;
  }

  request (method, uriParts, opts = {}, callback) {
    if (!callback && typeof opts === 'function') {
      callback = opts;
      opts = {};
    }

    Object.assign(opts, {
      'contentType': 'application/json; charset=utf-8',
      'method': method.toUpperCase()
    });

    this.addHeaders(opts);

    const baseUrl = this.getAssetsBaseUrl();
    const url = this.makeAbsoluteURI(this.makeRelativeURI(uriParts));

    $.ajax(`${baseUrl}${url}`, opts)
      .done(this.successCallback(callback))
      .fail(this.errorCallback(callback));
  }
}

module.exports = exports = PublicClient;

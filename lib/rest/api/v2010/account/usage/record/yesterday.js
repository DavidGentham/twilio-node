'use strict';

var Q = require('q');
var _ = require('lodash');
var InstanceResource = require('../../../../../../base/InstanceResource');
var Page = require('../../../../../../base/Page');
var values = require('../../../../../../base/values');

var YesterdayPage;
var YesterdayList;
var YesterdayInstance;
var YesterdayContext;

/**
 * Initialize the YesterdayPage
 *
 * :param Version version: Version that contains the resource
 * :param Response response: Response from the API
 * :param accountSid: A 34 character string that uniquely identifies this resource.
 *
 * @returns YesterdayPage
 */
function YesterdayPage(version, response, accountSid) {
  Page.prototype.constructor.call(this, version, response);

  // Path Solution
  this._solution = {
    accountSid: accountSid
  };
}

_.extend(YesterdayPage.prototype, Page.prototype);
YesterdayPage.prototype.constructor = YesterdayPage;

/**
 * Build an instance of YesterdayInstance
 *
 * :param dict payload: Payload response from the API
 *
 * @returns YesterdayInstance
 */
YesterdayPage.prototype.getInstance = function getInstance(payload) {
  return new YesterdayInstance(
    this._version,
    payload,
    this._solution.accountSid
  );
};


/**
 * Initialize the YesterdayList
 *
 * :param Version version: Version that contains the resource
 * :param accountSid: A 34 character string that uniquely identifies this resource.
 *
 * @returns YesterdayList
 */
function YesterdayList(version, accountSid) {
  function YesterdayListInstance(sid) {
    return YesterdayListInstance.get(sid);
  }

  YesterdayListInstance._version = version;
  // Path Solution
  YesterdayListInstance._solution = {
    accountSid: accountSid
  };
  YesterdayListInstance._uri = _.template(
    '/Accounts/<%= accountSid %>/Usage/Records/Yesterday.json' // jshint ignore:line
  )(YesterdayListInstance._solution);
  /**
   * Streams YesterdayInstance records from the API.
   * This operation lazily loads records as efficiently as possible until the limit
   * is reached.
   * The results are passed into the callback function, so this operation is memory efficient.
   *
   * @param {Function} opts.callback - A callback function to process records
   * @param {number} [opts.limit] -
   *         Upper limit for the number of records to return.
   *         list() guarantees never to return more than limit.
   *         Default is no limit
   * @param {number} [opts.pageSize=50] -
   *         Number of records to fetch per request,
   *         when not set will use the default value of 50 records.
   *         If no pageSize is defined but a limit is defined,
   *         list() will attempt to read the limit with the most efficient
   *         page size, i.e. min(limit, 1000)
   */
  YesterdayListInstance.stream = function stream(opts) {
    if (!(opts && 'callback' in opts)) {
      throw new Error('opts.callback parameter required');
    }

    var currentPage = 1;
    var limits = this._version.readLimits({
      limit: opts.limit,
      pageSize: opts.pageSize
    });

    var deferred = Q.defer();
    function fetchNextPage(fn) {
      var promise = fn();

      promise.then(function(page) {
        if (_.isEmpty(page.instances)) {
          deferred.resolve();
        }

        _.each(page.instances, opts.callback);

        if ((limits.pageLimit && limits.pageLimit <= currentPage)) {
          deferred.resolve();
        } else {
          currentPage++;
          fetchNextPage(_.bind(page.nextPage, page));
        }
      });

      promise.catch(deferred.reject);
    }

    fetchNextPage(_.bind(this.page, this, opts));

    return deferred.promise;
  };

  /**
   * Lists YesterdayInstance records from the API as a list.
   *
   * @param {number} [opts.limit] -
   *         Upper limit for the number of records to return.
   *         list() guarantees never to return more than limit.
   *         Default is no limit
   * @param {number} [opts.pageSize] -
   *         Number of records to fetch per request,
   *         when not set will use the default value of 50 records.
   *         If no page_size is defined but a limit is defined,
   *         list() will attempt to read the limit with the most
   *         efficient page size, i.e. min(limit, 1000)
   *
   * @returns {Array} A list of records
   */
  YesterdayListInstance.list = function list(opts) {
    opts = opts || {};

    var allResources = [];
    opts.callback = function(resource) {
      allResources.push(resource);
    };

    var promise = this.stream(opts);
    promise = promise.then(function() {
      return allResources;
    });

    return promise;
  };

  /**
   * Retrieve a single page of YesterdayInstance records from the API.
   * Request is executed immediately
   *
   * @param {string} [opts.pageToken] - PageToken provided by the API
   * @param {number} [opts.pageNumber] -
   *          Page Number, this value is simply for client state
   * @param {number} [opts.pageSize] - Number of records to return, defaults to 50
   *
   * @returns Page of YesterdayInstance
   */
  YesterdayListInstance.page = function page(opts) {
    opts = opts || {};
    var params = values.of({
      'PageToken': opts.pageToken,
      'Page': opts.pageNumber,
      'PageSize': opts.pageSize
    });

    var promise = version.page(
      'GET',
      this._uri,
      { params: params }
    );

    promise = promise.then(function(response) {
      return new YesterdayPage(
        this._version,
        response,
        this._solution.accountSid
      );
    }.bind(this));

    return promise;
  };

  return YesterdayListInstance;
}


/**
 * Initialize the YesterdayContext
 *
 * @param {Version} version - Version that contains the resource
 * @param {object} payload - The instance payload
 *
 * @returns {YesterdayContext}
 */
function YesterdayInstance(version, payload, accountSid) {
  InstanceResource.prototype.constructor.call(this, version);

  // Marshaled Properties
  this._properties = {
    accountSid: payload.account_sid, // jshint ignore:line,
    apiVersion: payload.api_version, // jshint ignore:line,
    category: payload.category, // jshint ignore:line,
    count: payload.count, // jshint ignore:line,
    countUnit: payload.count_unit, // jshint ignore:line,
    description: payload.description, // jshint ignore:line,
    endDate: payload.end_date, // jshint ignore:line,
    price: payload.price, // jshint ignore:line,
    priceUnit: payload.price_unit, // jshint ignore:line,
    startDate: payload.start_date, // jshint ignore:line,
    subresourceUris: payload.subresource_uris, // jshint ignore:line,
    uri: payload.uri, // jshint ignore:line,
    usage: payload.usage, // jshint ignore:line,
    usageUnit: payload.usage_unit, // jshint ignore:line,
  };

  // Context
  this._context = undefined;
  this._solution = {
    accountSid: accountSid,
  };
}

_.extend(YesterdayInstance.prototype, InstanceResource.prototype);
YesterdayInstance.prototype.constructor = YesterdayInstance;

Object.defineProperty(YesterdayInstance.prototype,
  'accountSid', {
  get: function() {
    return this._properties.accountSid;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'apiVersion', {
  get: function() {
    return this._properties.apiVersion;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'category', {
  get: function() {
    return this._properties.category;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'count', {
  get: function() {
    return this._properties.count;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'countUnit', {
  get: function() {
    return this._properties.countUnit;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'description', {
  get: function() {
    return this._properties.description;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'endDate', {
  get: function() {
    return this._properties.endDate;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'price', {
  get: function() {
    return this._properties.price;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'priceUnit', {
  get: function() {
    return this._properties.priceUnit;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'startDate', {
  get: function() {
    return this._properties.startDate;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'subresourceUris', {
  get: function() {
    return this._properties.subresourceUris;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'uri', {
  get: function() {
    return this._properties.uri;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'usage', {
  get: function() {
    return this._properties.usage;
  },
});

Object.defineProperty(YesterdayInstance.prototype,
  'usageUnit', {
  get: function() {
    return this._properties.usageUnit;
  },
});

module.exports = {
  YesterdayPage: YesterdayPage,
  YesterdayList: YesterdayList,
  YesterdayInstance: YesterdayInstance,
  YesterdayContext: YesterdayContext
};
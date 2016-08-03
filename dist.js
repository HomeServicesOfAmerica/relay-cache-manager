'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _GraphQLRange = require('react-relay/lib/GraphQLRange');

var _GraphQLRange2 = _interopRequireDefault(_GraphQLRange);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var CACHE_KEY = '__RelayCacheManager__';

/**
 * Stores field metadata and values, provides
 * an interface to deserialized cached data
 */

var CacheRecord = function () {
  function CacheRecord(dataId, typeName) {
    _classCallCheck(this, CacheRecord);

    this.dataId = dataId;
    this.typeName = typeName;
    this.fields = {};
  }

  _createClass(CacheRecord, [{
    key: 'saveField',
    value: function saveField(field, value) {
      this.fields[field] = value;
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(data) {
      return new CacheRecord(data.dataId, data.typeName);
    }
  }]);

  return CacheRecord;
}();

var CacheRecordStore = function () {
  function CacheRecordStore(records, rootCallMap) {
    _classCallCheck(this, CacheRecordStore);

    this.records = records || {};
    this.rootCallMap = rootCallMap || {};
  }

  _createClass(CacheRecordStore, [{
    key: 'writeRootCall',
    value: function writeRootCall(storageKey, identifyingArgValue, dataId) {
      this.rootCallMap[storageKey] = dataId;
    }
  }, {
    key: 'getDataIdFromRootCallName',
    value: function getDataIdFromRootCallName(callName, callValue) {
      return this.rootCallMap[callName];
    }
  }, {
    key: 'readNode',
    value: function readNode(id) {
      return this.records[id] || null;
    }
  }], [{
    key: 'fromJSON',
    value: function fromJSON(_ref) {
      var records = _ref.records;
      var rootCallMap = _ref.rootCallMap;

      for (var key in records) {
        var record = records[key];
        var range = record.__range__;
        if (range) {
          record.__range__ = _GraphQLRange2.default.fromJSON(range);
        }
      }
      return new CacheRecordStore(records, rootCallMap);
    }
  }]);

  return CacheRecordStore;
}();

/**
 *  Implements the CacheWriter interface specified by
 *  RelayTypes, uses an instance of CacheRecordStore
 *  to manage the CacheRecord instances
 */


var CacheWriter = function () {
  function CacheWriter() {
    _classCallCheck(this, CacheWriter);

    try {
      var localCache = localStorage.getItem(CACHE_KEY);
      if (localCache) {
        localCache = JSON.parse(localCache).cache;
        this.cache = CacheRecordStore.fromJSON(localCache);
      } else {
        this.cache = new CacheRecordStore();
      }
    } catch (err) {
      this.cache = new CacheRecordStore();
    }
  }

  _createClass(CacheWriter, [{
    key: 'writeField',
    value: function writeField(dataId, field, value, typeName) {
      var record = this.cache.records[dataId];
      if (!record) {
        record = {
          __dataID__: dataId,
          __typename: typeName
        };
      }
      record[field] = value;
      this.cache.records[dataId] = record;
      try {
        var serialized = JSON.stringify(this.cache);
        localStorage.setItem(CACHE_KEY, serialized);
      } catch (err) {
        /* noop */
      }
    }
  }, {
    key: 'writeNode',
    value: function writeNode(dataId, record) {
      this.cache.records[dataId] = record;
    }
  }, {
    key: 'readNode',
    value: function readNode(dataId) {
      var record = this.cache.readNode(dataId);
      return record;
    }
  }, {
    key: 'writeRootCall',
    value: function writeRootCall(storageKey, identifyingArgValue, dataId) {
      this.cache.rootCallMap[storageKey] = dataId;
    }
  }, {
    key: 'readRootCall',
    value: function readRootCall(callName, callValue, callback) {
      var dataId = this.cache.rootCallMap[callName];
      callback(null, dataId);
    }
  }]);

  return CacheWriter;
}();

var RelayCacheManager = function () {
  function RelayCacheManager() {
    _classCallCheck(this, RelayCacheManager);

    this.cacheWriter = new CacheWriter();
  }

  _createClass(RelayCacheManager, [{
    key: 'clear',
    value: function clear() {
      return;
    }
  }, {
    key: 'getMutationWriter',
    value: function getMutationWriter() {
      return this.cacheWriter;
    }
  }, {
    key: 'getQueryWriter',
    value: function getQueryWriter() {
      return this.cacheWriter;
    }
  }, {
    key: 'getAllRecords',
    value: function getAllRecords() {
      return this.cacheWriter.cache.records;
    }
  }, {
    key: 'readNode',
    value: function readNode(id, callback) {
      var node = this.cacheWriter.readNode(id);
      callback(null, node);
    }
  }, {
    key: 'readRootCall',
    value: function readRootCall(callName, callValue, callback) {
      this.cacheWriter.readRootCall(callName, callValue, callback);
    }
  }]);

  return RelayCacheManager;
}();

exports.default = RelayCacheManager;

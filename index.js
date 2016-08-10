import GraphQLRange from 'react-relay/lib/GraphQLRange';

const CACHE_KEY = '__RelayCacheManager__'

/**
 * Stores field metadata and values, provides
 * an interface to deserialized cached data
 */
class CacheRecord {
  constructor(dataId, typeName) {
    this.dataId = dataId;
    this.typeName = typeName;
    this.fields = {};
  }
  saveField(field, value) {
    this.fields[field] = value;
  }
  static fromJSON(data) {
    return new CacheRecord(data.dataId, data.typeName);
  }
}


class CacheRecordStore {
  constructor(records, rootCallMap) {
    this.records = records || {}
    this.rootCallMap = rootCallMap || {}
  }
  writeRootCall(storageKey, identifyingArgValue, dataId) {
    this.rootCallMap[storageKey] = dataId;
  }
  getDataIdFromRootCallName(callName, callValue) {
    return this.rootCallMap[callName];
  }
  readNode(id) {
    return this.records[id] || null;
  }
  static fromJSON({ records, rootCallMap }) {
    for (var key in records) {
      const record = records[key];
      const range = record.__range__;
      if (range) {
        record.__range__ = GraphQLRange.fromJSON(range)
      }
     }
    return new CacheRecordStore(records, rootCallMap);
  }
}


/**
 *  Implements the CacheWriter interface specified by
 *  RelayTypes, uses an instance of CacheRecordStore
 *  to manage the CacheRecord instances
 */
class CacheWriter {
  constructor() {
    try {
      let localCache = localStorage.getItem(CACHE_KEY);
      if (localCache) {
        localCache = JSON.parse(localCache);
        this.cache = CacheRecordStore.fromJSON(localCache);
      } else {
        this.cache = new CacheRecordStore();
      }
    } catch(err) {
      this.cache = new CacheRecordStore();
    }
  }

  writeField(dataId, field, value, typeName) {
    let record = this.cache.records[dataId];
    if (!record) {
      record = {
        __dataID__: dataId,
        __typename: typeName,
      }
    }
    record[field] = value;
    this.cache.records[dataId] = record;
    try {
      const serialized = JSON.stringify(this.cache);
      localStorage.setItem(CACHE_KEY, serialized);
    } catch (err) {
      /* noop */
    }
  }

  writeNode(dataId, record) {
    this.cache.records[dataId] = record;
  }

  readNode(dataId) {
    const record = this.cache.readNode(dataId)
    return record;
  }

  writeRootCall(storageKey, identifyingArgValue, dataId) {
    this.cache.rootCallMap[storageKey] = dataId;
  }

  readRootCall(callName, callValue, callback) {
    const dataId = this.cache.rootCallMap[callName];
    setImmediate(callback.bind(null, null, dataId));
  }

}

export default class RelayCacheManager {
  constructor() {
    this.cacheWriter = new CacheWriter();
  }
  clear() {
    localStorage.removeItem(CACHE_KEY);
    this.cacheWriter = new CacheWriter();
  };

  getMutationWriter() {
    return this.cacheWriter;
  };

  getQueryWriter() {
    return this.cacheWriter;
  };

  getAllRecords() {
    return this.cacheWriter.cache.records;
  };

  readNode(id, callback) {
    const node = this.cacheWriter.readNode(id);
    setImmediate(callback.bind(null, null, node));
  };

  readRootCall(callName, callValue, callback) {
    this.cacheWriter.readRootCall(callName, callValue, callback);
  }
}

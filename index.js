import GraphQLRange from 'react-relay/lib/GraphQLRange';

const CACHE_KEY = '__RelayCacheManager__'

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



export default class RelayCacheManager {
  constructor() {
    this.cacheWriter = new CacheWriter();
  }
  clear() {
    return;
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

/**
 *  Implements the CacheWriter interface specified by
 *  RelayTypes, uses an instance of CacheRecordStore
 *  to manage the CacheRecord instances
 *  @flow
 */

import CacheRecordStore from './CacheRecordStore';
import type { CacheRecord } from './CacheRecordStore';

const DEFAULT_CACHE_KEY: string = '__RelayCacheManager__';

type CacheWriterOptions = {
  cacheKey?: string,
}

export default class CacheWriter {
  cache: CacheRecordStore;
  cacheKey: string;
  constructor(options: CacheWriterOptions = {}) {
    this.cacheKey = options.cacheKey || DEFAULT_CACHE_KEY
    try {
      let localCache = localStorage.getItem(this.cacheKey);
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

  clearStorage() {
    localStorage.removeItem(this.cacheKey);
    this.cache = new CacheRecordStore();
  }

  writeField(
    dataId: string,
    field: string,
    value: ?mixed,
    typeName: ?string
  ) {
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
      localStorage.setItem(this.cacheKey, serialized);
    } catch (err) {
      /* noop */
    }
  }

  writeNode(dataId: string, record: CacheRecord) {
    this.cache.writeRecord(dataId, record);
  }

  readNode(dataId: string) {
    const record = this.cache.readNode(dataId)
    return record;
  }

  writeRootCall(
    storageKey: string,
    identifyingArgValue: string,
    dataId: string
  ) {
    this.cache.rootCallMap[storageKey] = dataId;
  }

  readRootCall(
    callName: string,
    callValue: string,
    callback: (error: any, value: any) => void
  ) {
    const dataId = this.cache.rootCallMap[callName];
    setImmediate(callback.bind(null, null, dataId));
  }

}

/**
 *  Implements the CacheWriter interface specified by
 *  RelayTypes, uses an instance of CacheRecordStore
 *  to manage the CacheRecord instances
 *  @flow
 */

import CacheRecordStore from './CacheRecordStore';
import type { CacheRecord } from './CacheRecordStore';

import localForage from 'localforage';

const DEFAULT_CACHE_KEY: string = '__RelayCacheManager__';

type CacheWriterOptions = {
  cacheKey?: string,
  localForage?: mixed,
}

export default class CacheWriter {
  cache: CacheRecordStore;
  cacheKey: string;
  constructor(options: CacheWriterOptions = {}) {
    this.cacheKey = options.cacheKey || DEFAULT_CACHE_KEY
    localForage.config(options.localForage || {});

    localForage.getItem(this.cacheKey)
      .then(localCache => {
        if (!localCache) {
          this.cache = new CacheRecordStore();
        } else {
          this.cache = CacheRecordStore.fromJSON(localCache)
        }
      })
      .catch(err => this.cache = new CacheRecordStore());
  }

  clearStorage() {
    localForage.removeItem(this.cacheKey)
      .then(() => this.cache = new CacheRecordStore())
      .catch(err => this.cache = new CacheRecordStore());
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
    localForage.setItem(this.cacheKey, this.cache);
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

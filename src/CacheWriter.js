/**
 *  Implements the CacheWriter interface specified by
 *  RelayTypes, uses an instance of CacheRecordStore
 *  to manage the CacheRecord instances
 *  @flow
 */

import CacheRecordStore from './CacheRecordStore';
import LocalStorageCacheStorageAdapter from './LocalStorageCacheStorageAdapter';
import type { CacheRecord } from './CacheRecordStore';

const DEFAULT_CACHE_KEY: string = '__RelayCacheManager__';

export type CacheStorageAdapter = {
  getItem(key: string, callback: (error: any, value: ?string) => void): void;
  setItem(key: string, data: string): void;
  removeItem(key: string): void;
};

export type CacheWriterOptions = {
  cacheKey?: string,
  cacheStorageAdapter?: CacheStorageAdapter,
};

export default class CacheWriter {
  cache: CacheRecordStore;
  cacheStorageAdapter: CacheStorageAdapter;
  cacheKey: string;

  constructor(options: CacheWriterOptions = {}) {
    this.cacheKey = options.cacheKey || DEFAULT_CACHE_KEY;
    this.cacheStorageAdapter = options.cacheStorageAdapter || new LocalStorageCacheStorageAdapter();

    this.cache = new CacheRecordStore();

    this.cacheStorageAdapter.getItem(this.cacheKey, (error: any, value: ?string) => {
      if (value && !error) {
        this.cache.ingestJSON(JSON.parse(value));
      }
    });
  }

  clearStorage() {
    this.cacheStorageAdapter.removeItem(this.cacheKey);
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
      };
    }
    record[field] = value;
    this.cache.records[dataId] = record;
    try {
      const serialized = JSON.stringify(this.cache);
      this.cacheStorageAdapter.setItem(this.cacheKey, serialized);
    } catch (err) {
      /* noop */
    }
  }

  writeNode(dataId: string, record: CacheRecord): void {
    this.cache.writeRecord(dataId, record);
  }

  readNode(dataId: string, callback: (error: any, value: any) => void): void {
    const record = this.cache.readNode(dataId);
    setImmediate(callback.bind(null, null, record));
  }

  writeRootCall(
    storageKey: string,
    identifyingArgValue: string,
    dataId: string
  ): void {
    this.cache.writeRootCall(storageKey, identifyingArgValue, dataId);
  }

  readRootCall(
    callName: string,
    callValue: string,
    callback: (error: any, value: any) => void
  ) {
    const dataId = this.cache.getDataIdFromRootCallName(callName, callValue);
    setImmediate(callback.bind(null, null, dataId));
  }

}

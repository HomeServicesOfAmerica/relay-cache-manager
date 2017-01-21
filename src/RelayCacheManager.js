/**
 * The public API for RelayCacheManager. Users should
 * pass an instance of this class to `injectCacheManager`.
 * @flow
 */

import CacheWriter from './CacheWriter';

import type { CacheWriterOptions } from './CacheWriter';

type RelayCacheManagerOptions = CacheWriterOptions;

export default class RelayCacheManager {
  cacheWriter: CacheWriter;
  constructor(options: RelayCacheManagerOptions) {
    this.cacheWriter = new CacheWriter(options);
  }

  clear(): void {
    this.cacheWriter.clearStorage();
  };

  getMutationWriter(): CacheWriter {
    return this.cacheWriter;
  };

  getQueryWriter(): CacheWriter {
    return this.cacheWriter;
  };

  getAllRecords() {
    return this.cacheWriter.cache.records;
  };

  getAllRootCalls() {
    return this.cacheWriter.cache.rootCallMap;
  }

  readNode(
    id: string,
    callback: (error: any, value: any) => void
  ) {
    this.cacheWriter.readNode(id, callback);
  };

  readRootCall(
    callName: string,
    callValue: string,
    callback: (error: any, value: any) => void
  ) {
    this.cacheWriter.readRootCall(callName, callValue, callback);
  }
}

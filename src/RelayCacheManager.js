/**
 * The public API for RelayCacheManager. Users should
 * pass an instance of this class to `injectCacheManager`.
 * @flow
 */

import CacheWriter from './CacheWriter';

type RelayCacheManagerOptions = {
  cacheKey?: string,
  localForage?: mixed,
}

export default class RelayCacheManager {
  cacheWriter: CacheWriter;
  constructor(options: RelayCacheManagerOptions) {
    this.cacheWriter = new CacheWriter(options);
  }

  clear() {
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

  readNode(
    id: string,
    callback: (error: any, value: any) => void
  ) {
    const node = this.cacheWriter.readNode(id);
    setImmediate(callback.bind(null, null, node));
  };

  readRootCall(
    callName: string,
    callValue: string,
    callback: (error: any, value: any) => void
  ) {
    this.cacheWriter.readRootCall(callName, callValue, callback);
  }
}

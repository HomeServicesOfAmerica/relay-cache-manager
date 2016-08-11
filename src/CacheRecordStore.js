/**
 * Manages all cached records, including read/write and
 * deserialization.
 * @flow
 */

import GraphQLRange from 'react-relay/lib/GraphQLRange'


/**
 * These types are being copied from RelayInternalTypes.
 * Relay does not currently offer a way to use internal
 * type definitions. Since this library is essentially
 * mimicking internal data structures, we just copy what we
 * need manually until a better solution presents itself.
 *
 * https://github.com/facebook/relay/blob/master/src/tools/RelayInternals.js
 */

type CallValue = ?(
  boolean |
  number |
  string |
  {[key: string]: CallValue} |
  Array<CallValue>
);

type Call = {
  name: string,
  type?: string,
  value: CallValue,
};

export type CacheRecord = {
  [key: string]: mixed;
  __dataID__: string,
  __filterCalls__?: Array<Call>,
  __forceIndex__?: number,
  __mutationIDs__?: Array<string>,
  __mutationStatus__?: string,
  __path__?: Object,
  __range__?: GraphQLRange,
  __resolvedDeferredFragments__?: {[fragmentID: string]: boolean},
  __resolvedFragmentMapGeneration__?: number,
  __resolvedFragmentMap__?: {[fragmentID: string]: boolean},
  __status__?: number,
  __typename?: ?string,
};

export type CacheRecordMap = {
  [dataId: string]: CacheRecord,
}

export type CacheRootCallMap = {
  [root: string]: string,
}

export default class CacheRecordStore {
  records: CacheRecordMap;
  rootCallMap: CacheRootCallMap;
  constructor(
    records?: CacheRecordMap,
    rootCallMap?: CacheRootCallMap
  ) {
    this.records = records || {}
    this.rootCallMap = rootCallMap || {}
  }

  writeRootCall(
    storageKey: string,
    identifyingArgValue: string,
    dataId: string
  ) {
    this.rootCallMap[storageKey] = dataId;
  }

  writeRecord(
    dataId: string,
    record: CacheRecord
  ) {
    this.records[dataId] = record;
  }

  getDataIdFromRootCallName(
    callName: string,
    callValue: string
  ): ?string {
    return this.rootCallMap[callName];
  }

  readNode(dataID: string): ?CacheRecord {
    return this.records[dataID] || null;
  }

  /**
   * Takes an object that represents a partially
   * deserialized instance of CacheRecordStore
   * and creates a new instance from it. This is required
   * so that __range__ values can be correctly restored.
   */
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

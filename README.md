# relay-cache-manager

> A CacheManager implementation for local data caching in Relay


## Overview

Relay defines the [`CacheManager` interface](https://github.com/facebook/relay/blob/master/src/tools/RelayTypes.js#L185-L198) which lets you write and read records to a local cache. Relay will
check the cache first when identifying what data it has/needs; by implementing a `CacheManager` you can render locally cached data quickly while Relay queries your API and updates the data when the response comes in.

## Install

```
$ npm install --save relay-cache-manager
```

## Usage

[Until `RelayEnvironment` exposes `injectCacheManager`](https://github.com/facebook/relay/pull/1320) you have to inject it directly from the `RelayStoreData` instance used by your store. You can access that via the `getStoreData()` method on your `RelayEnvironment` instance. If you're using `Relay.Store` you can just do:

```js
import CacheManager from 'relay-cache-manager';
const cacheManager = new CacheManager();
Relay.Store.getStoreData().injectCacheManager(cacheManager);
```

If you wish, you can specify a key for the cache to use in the constructor, like so:

```js
const cacheManager = new CacheManager('testCacheKey');
```

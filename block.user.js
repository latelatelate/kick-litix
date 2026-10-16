// ==UserScript==
// @name         Kick.com - Block litix.io beacon spam
// @namespace    local.kick.blockLitixIO
// @version      1.0.0
// @license MIT
// @updateURL    https://raw.githubusercontent.com/latelatelate/kick-litix/refs/heads/main/block.user.js
// @downloadURL  https://raw.githubusercontent.com/latelatelate/kick-litix/refs/heads/main/block.user.js
// @author       https://github.com/latelatelate/kick-litix
// @description  Prevents litix.io send beacon request spam when using DNS level adblock or extensions like uBlock Origin
// @match        https://kick.com/*
// @match        https://*.kick.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const BLOCK_PATTERN = /litix\.io/;

  // Block navigator.sendBeacon
  const originalSendBeacon = navigator.sendBeacon.bind(navigator);
  navigator.sendBeacon = function (url, data) {
    if (typeof url === 'string' && BLOCK_PATTERN.test(url)) {
      return true; // pretend it succeeded so the app doesn't retry/error
    }
    return originalSendBeacon(url, data);
  };

  // Block fetch
  const originalFetch = window.fetch.bind(window);
  window.fetch = function (input, init) {
    const url = typeof input === 'string' ? input : input?.url;
    if (url && BLOCK_PATTERN.test(url)) {
      return Promise.resolve(new Response(null, { status: 204 }));
    }
    return originalFetch(input, init);
  };

  // Block XHR
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    if (typeof url === 'string' && BLOCK_PATTERN.test(url)) {
      this._blocked = true;
    }
    return originalOpen.call(this, method, url, ...rest);
  };
  const originalSend = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (...args) {
    if (this._blocked) return;
    return originalSend.apply(this, args);
  };
})();
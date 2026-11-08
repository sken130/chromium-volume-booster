/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

const DEFAULT_VOLUME = 100;

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ volume: DEFAULT_VOLUME }, (stored) => {
    if (stored.volume === undefined || stored.volume === null) {
      chrome.storage.sync.set({ volume: DEFAULT_VOLUME });
    }
  });
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "GET_VOLUME") {
    chrome.storage.sync.get({ volume: DEFAULT_VOLUME }, (stored) => {
      sendResponse({ volume: stored.volume });
    });
    return true;
  }
  return false;
});

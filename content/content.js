/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

const PAGE_SCRIPT_ID = "volume-booster-page-script";
const MESSAGE_SOURCE = "volume-booster-extension";

function injectPageScript() {
  if (document.getElementById(PAGE_SCRIPT_ID)) {
    return;
  }
  const script = document.createElement("script");
  script.id = PAGE_SCRIPT_ID;
  script.src = chrome.runtime.getURL("page/page.js");
  script.type = "text/javascript";
  (document.head || document.documentElement).appendChild(script);
}

function postVolumeToPage(volume) {
  window.postMessage(
    {
      source: MESSAGE_SOURCE,
      type: "SET_VOLUME",
      volume,
    },
    "*",
  );
}

function syncVolumeFromStorage() {
  chrome.storage.sync.get({ volume: 100 }, (stored) => {
    postVolumeToPage(stored.volume);
  });
}

injectPageScript();
syncVolumeFromStorage();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync" || !changes.volume) {
    return;
  }
  postVolumeToPage(changes.volume.newValue);
});

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "SET_VOLUME" && typeof message.volume === "number") {
    postVolumeToPage(message.volume);
  }
});

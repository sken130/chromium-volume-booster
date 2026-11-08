/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

const slider = document.getElementById("volumeSlider");
const volumeValue = document.getElementById("volumeValue");
const statusEl = document.getElementById("status");
const presetButtons = document.querySelectorAll(".preset[data-volume]");

function clampVolume(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    return 100;
  }
  return Math.min(800, Math.max(0, Math.round(n)));
}

function updateUi(percent) {
  const v = clampVolume(percent);
  slider.value = String(v);
  volumeValue.textContent = String(v);
}

function setStatus(message, isError = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", isError);
}

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function applyVolume(percent) {
  const volume = clampVolume(percent);
  updateUi(volume);
  await chrome.storage.sync.set({ volume });

  try {
    const tab = await getActiveTab();
    if (tab?.id != null) {
      await chrome.tabs.sendMessage(tab.id, { type: "SET_VOLUME", volume });
    }
    setStatus("Applied to active tab");
  } catch {
    setStatus("Reload the page once, then try again.", true);
  }
}

async function init() {
  const stored = await chrome.storage.sync.get({ volume: 100 });
  updateUi(stored.volume);

  slider.addEventListener("input", () => {
    updateUi(slider.value);
  });

  slider.addEventListener("change", () => {
    void applyVolume(slider.value);
  });

  presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.getAttribute("data-volume");
      void applyVolume(target);
    });
  });
}

void init();

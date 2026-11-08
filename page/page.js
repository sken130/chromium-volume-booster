/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

(function volumeBoosterPage() {
  const MESSAGE_SOURCE = "volume-booster-extension";
  const mediaGraphs = new WeakMap();

  let currentPercent = 100;

  function clampPercent(value) {
    const n = Number(value);
    if (!Number.isFinite(n)) {
      return 100;
    }
    return Math.min(800, Math.max(0, Math.round(n)));
  }

  function linearGain(percent) {
    return percent / 100;
  }

  function ensureGraph(mediaEl) {
    if (!(mediaEl instanceof HTMLMediaElement)) {
      return null;
    }
    if (mediaGraphs.has(mediaEl)) {
      return mediaGraphs.get(mediaEl);
    }

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        return null;
      }
      const ctx = new AudioCtx();
      const source = ctx.createMediaElementSource(mediaEl);
      const gainNode = ctx.createGain();
      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      const graph = { ctx, gainNode };
      mediaGraphs.set(mediaEl, graph);

      const resume = () => {
        if (ctx.state === "suspended") {
          ctx.resume().catch(() => {});
        }
      };
      mediaEl.addEventListener("play", resume);
      mediaEl.addEventListener("volumechange", () => {
        if (currentPercent > 100 || currentPercent === 0) {
          mediaEl.volume = 1;
        }
      });

      return graph;
    } catch {
      return null;
    }
  }

  function applyToElement(mediaEl) {
    const gain = linearGain(currentPercent);
    const needsGraph = currentPercent > 100 || currentPercent === 0;

    if (needsGraph) {
      const graph = ensureGraph(mediaEl);
      if (graph) {
        mediaEl.volume = 1;
        graph.gainNode.gain.value = gain;
        if (graph.ctx.state === "suspended") {
          graph.ctx.resume().catch(() => {});
        }
      } else {
        mediaEl.volume = Math.min(1, gain);
      }
      return;
    }

    const graph = mediaGraphs.get(mediaEl);
    if (graph) {
      graph.gainNode.gain.value = gain;
    }
    mediaEl.volume = gain;
  }

  function scanMedia(root) {
    if (!root) {
      return;
    }
    if (root instanceof HTMLMediaElement) {
      applyToElement(root);
      return;
    }
    if (root.querySelectorAll) {
      root.querySelectorAll("audio, video").forEach(applyToElement);
    }
  }

  function applyVolume(percent) {
    currentPercent = clampPercent(percent);
    scanMedia(document);
  }

  window.addEventListener("message", (event) => {
    if (event.source !== window) {
      return;
    }
    const data = event.data;
    if (!data || data.source !== MESSAGE_SOURCE || data.type !== "SET_VOLUME") {
      return;
    }
    applyVolume(data.volume);
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }
        scanMedia(node);
      }
    }
  });

  function startObserver() {
    const target = document.documentElement || document.body;
    if (!target) {
      return;
    }
    observer.observe(target, { childList: true, subtree: true });
    scanMedia(document);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }
})();

const state = {
  entries: [],
  selectedId: null,
  playing: false,
  exportTimer: null,
  playTimer: null,
  settings: {
    aspectRatio: "9:16",
    cropMode: "Crop-to-Fill",
    outputDuration: 30,
    exportFormat: "MP4",
    theme: "neon"
  }
};

const sampleEntries = [
  {
    url: "https://youtube.com/shorts/comeback",
    title: "Last-second comeback",
    trimStart: 0,
    trimEnd: 10,
    duration: 10
  },
  {
    url: "https://youtube.com/shorts/save",
    title: "The impossible save",
    trimStart: 0,
    trimEnd: 8,
    duration: 8
  },
  {
    url: "https://youtube.com/shorts/reaction",
    title: "Crowd goes silent",
    trimStart: 0,
    trimEnd: 9,
    duration: 9
  }
];

const elements = {
  videoUrl: document.querySelector("#videoUrl"),
  videoTitle: document.querySelector("#videoTitle"),
  importButton: document.querySelector("#importButton"),
  addVideoButton: document.querySelector("#addVideoButton"),
  loadSampleButton: document.querySelector("#loadSampleButton"),
  generateButton: document.querySelector("#generateButton"),
  entryList: document.querySelector("#entryList"),
  timeline: document.querySelector("#timeline"),
  previewCanvas: document.querySelector("#previewCanvas"),
  previewTitle: document.querySelector("#previewTitle"),
  rankingStack: document.querySelector("#rankingStack"),
  previewMeta: document.querySelector("#previewMeta"),
  aspectRatio: document.querySelector("#aspectRatio"),
  cropMode: document.querySelector("#cropMode"),
  duration: document.querySelector("#duration"),
  durationOutput: document.querySelector("#durationOutput"),
  previousButton: document.querySelector("#previousButton"),
  playButton: document.querySelector("#playButton"),
  nextButton: document.querySelector("#nextButton"),
  showRank: document.querySelector("#showRank"),
  showTitle: document.querySelector("#showTitle"),
  showMeta: document.querySelector("#showMeta"),
  fontFamily: document.querySelector("#fontFamily"),
  fontWeight: document.querySelector("#fontWeight"),
  fontSize: document.querySelector("#fontSize"),
  fontColor: document.querySelector("#fontColor"),
  outlineColor: document.querySelector("#outlineColor"),
  backgroundColor: document.querySelector("#backgroundColor"),
  textPosition: document.querySelector("#textPosition"),
  textAlign: document.querySelector("#textAlign"),
  stylePreset: document.querySelector("#stylePreset"),
  exportFormat: document.querySelector("#exportFormat"),
  exportStatus: document.querySelector("#exportStatus"),
  exportProgress: document.querySelector("#exportProgress"),
  progressBar: document.querySelector("#progressBar"),
  resolution: document.querySelector("#resolution"),
  fileSize: document.querySelector("#fileSize"),
  formatLabel: document.querySelector("#formatLabel"),
  exportButton: document.querySelector("#exportButton"),
  exportCopy: document.querySelector("#exportCopy"),
  downloadLink: document.querySelector("#downloadLink")
};

function createEntry({ url, title, trimStart = 0, trimEnd = 10, duration = 10 }) {
  const id = crypto.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
  return {
    id,
    url,
    title,
    rank: state.entries.length + 1,
    trimStart,
    trimEnd,
    duration,
    overlaySettings: {
      fontFamily: elements.fontFamily.value,
      fontSize: Number(elements.fontSize.value),
      fontWeight: elements.fontWeight.value,
      fontColor: elements.fontColor.value,
      outline: elements.outlineColor.value,
      background: elements.backgroundColor.value,
      position: elements.textPosition.value,
      alignment: elements.textAlign.value
    }
  };
}

function normalizeRanks() {
  state.entries.forEach((entry, index) => {
    entry.rank = index + 1;
  });
}

function validateUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function importEntry() {
  const url = elements.videoUrl.value.trim();
  const title = elements.videoTitle.value.trim();

  if (!validateUrl(url)) {
    elements.videoUrl.focus();
    elements.videoUrl.setCustomValidity("Paste a valid http or https video URL.");
    elements.videoUrl.reportValidity();
    return;
  }

  elements.videoUrl.setCustomValidity("");
  const entry = createEntry({
    url,
    title: title || `Moment ${state.entries.length + 1}`,
    duration: Math.min(Number(elements.duration.value), 12),
    trimEnd: Math.min(Number(elements.duration.value), 12)
  });

  state.entries.push(entry);
  state.selectedId = entry.id;
  elements.videoUrl.value = "";
  elements.videoTitle.value = "";
  setExportIdle();
  render();
}

function loadSamples() {
  state.entries = sampleEntries.map(createEntry);
  normalizeRanks();
  state.selectedId = state.entries[0]?.id || null;
  setExportIdle();
  render();
}

function selectedIndex() {
  return Math.max(0, state.entries.findIndex((entry) => entry.id === state.selectedId));
}

function selectedEntry() {
  return state.entries[selectedIndex()];
}

function moveEntry(id, direction) {
  const index = state.entries.findIndex((entry) => entry.id === id);
  const nextIndex = index + direction;
  if (index < 0 || nextIndex < 0 || nextIndex >= state.entries.length) return;
  const [entry] = state.entries.splice(index, 1);
  state.entries.splice(nextIndex, 0, entry);
  normalizeRanks();
  state.selectedId = id;
  setExportIdle();
  render();
}

function removeEntry(id) {
  const index = state.entries.findIndex((entry) => entry.id === id);
  if (index < 0) return;
  state.entries.splice(index, 1);
  normalizeRanks();
  state.selectedId = state.entries[Math.min(index, state.entries.length - 1)]?.id || null;
  setExportIdle();
  render();
}

function selectEntry(id) {
  state.selectedId = id;
  render();
}

function setAspectClass() {
  const classMap = {
    "9:16": "ratio-916",
    "1:1": "ratio-11",
    "4:5": "ratio-45",
    "16:9": "ratio-169",
    custom: "ratio-custom"
  };
  elements.previewCanvas.className = `preview-canvas ${classMap[state.settings.aspectRatio]}`;
}

function updateResolution() {
  const resolutionMap = {
    "9:16": "1080 x 1920",
    "1:1": "1080 x 1080",
    "4:5": "1080 x 1350",
    "16:9": "1920 x 1080",
    custom: "1200 x 1600"
  };
  elements.resolution.textContent = resolutionMap[state.settings.aspectRatio];
  elements.fileSize.textContent = `${Math.max(8, Math.round(state.settings.outputDuration * 0.8))} MB`;
  elements.formatLabel.textContent = state.settings.exportFormat;
  elements.exportButton.textContent = `Export ${state.settings.exportFormat}`;
  elements.downloadLink.download = `ranking-the-moments.${state.settings.exportFormat.toLowerCase().replace(" optional", "")}`;
}

function applyOverlayStyles() {
  const canvas = elements.previewCanvas;
  const title = elements.previewTitle;
  const preset = elements.stylePreset.value;
  const presetColors = {
    neon: ["#22d3ee", "#f43f5e", "#07111f"],
    minimal: ["#f8fafc", "#0f172a", "#111827"],
    bold: ["#facc15", "#111827", "#7f1d1d"],
    cinematic: ["#f5f5f4", "#030712", "#1c1917"]
  };
  const [accent, outline, background] = presetColors[preset];

  document.documentElement.style.setProperty("--accent", accent);
  canvas.style.setProperty("--preview-bg", background);
  canvas.style.setProperty("--overlay-bg", `${elements.backgroundColor.value}cc`);
  canvas.style.setProperty("--overlay-color", elements.fontColor.value);
  canvas.style.setProperty("--outline", elements.outlineColor.value || outline);
  canvas.style.setProperty("--overlay-size", `${elements.fontSize.value}px`);
  canvas.style.setProperty("--overlay-weight", elements.fontWeight.value);
  title.style.fontFamily = `${elements.fontFamily.value}, Inter, sans-serif`;
  title.style.textAlign = elements.textAlign.value;
}

function renderRankingStack() {
  elements.rankingStack.innerHTML = "";

  const entries = state.entries.length
    ? state.entries
    : Array.from({ length: 7 }, (_, index) => ({
        id: `placeholder-${index + 1}`,
        rank: index + 1,
        title: index === 0 ? "Add videos to begin" : ""
      }));

  entries.forEach((entry) => {
    const row = document.createElement("div");
    const isActive = entry.id === state.selectedId;
    row.className = `ranking-row ${isActive ? "active" : ""} ${state.playing ? "playing" : ""}`;
    row.innerHTML = `
      <span>${entry.rank}.</span>
      <span class="ranking-title">${escapeHtml(entry.title)}</span>
    `;
    elements.rankingStack.append(row);
  });
}

function renderEntries() {
  elements.entryList.innerHTML = "";

  if (!state.entries.length) {
    const empty = document.createElement("p");
    empty.className = "empty-state";
    empty.textContent = "Paste a video URL and import it to start ranking moments.";
    elements.entryList.append(empty);
    return;
  }

  state.entries.forEach((entry) => {
    const item = document.createElement("article");
    item.className = `entry-item ${entry.id === state.selectedId ? "active" : ""}`;
    item.draggable = true;
    item.innerHTML = `
      <button class="entry-rank" type="button" aria-label="Select ${entry.title}">#${entry.rank}</button>
      <div class="entry-meta">
        <strong>${escapeHtml(entry.title)}</strong>
        <span>${escapeHtml(entry.url)}</span>
      </div>
      <div class="entry-actions">
        <button type="button" data-action="up">Move up</button>
        <button type="button" data-action="down">Move down</button>
        <button type="button" data-action="remove">Remove</button>
      </div>
    `;
    item.querySelector(".entry-rank").addEventListener("click", () => selectEntry(entry.id));
    item.querySelector('[data-action="up"]').addEventListener("click", () => moveEntry(entry.id, -1));
    item.querySelector('[data-action="down"]').addEventListener("click", () => moveEntry(entry.id, 1));
    item.querySelector('[data-action="remove"]').addEventListener("click", () => removeEntry(entry.id));
    item.addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", entry.id);
      event.dataTransfer.effectAllowed = "move";
    });
    item.addEventListener("dragover", (event) => {
      event.preventDefault();
      item.classList.add("drag-over");
    });
    item.addEventListener("dragleave", () => item.classList.remove("drag-over"));
    item.addEventListener("drop", (event) => {
      event.preventDefault();
      item.classList.remove("drag-over");
      reorderByDrop(event.dataTransfer.getData("text/plain"), entry.id);
    });
    elements.entryList.append(item);
  });
}

function reorderByDrop(sourceId, targetId) {
  if (!sourceId || sourceId === targetId) return;
  const sourceIndex = state.entries.findIndex((entry) => entry.id === sourceId);
  const targetIndex = state.entries.findIndex((entry) => entry.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  const [source] = state.entries.splice(sourceIndex, 1);
  state.entries.splice(targetIndex, 0, source);
  normalizeRanks();
  state.selectedId = sourceId;
  setExportIdle();
  render();
}

function renderTimeline() {
  elements.timeline.innerHTML = "";

  if (!state.entries.length) {
    const clip = document.createElement("div");
    clip.className = "timeline-clip";
    clip.textContent = "Imported clips appear here";
    elements.timeline.append(clip);
    return;
  }

  state.entries.forEach((entry) => {
    const clip = document.createElement("button");
    clip.className = `timeline-clip ${entry.id === state.selectedId ? "active" : ""}`;
    clip.type = "button";
    clip.innerHTML = `<strong>#${entry.rank}</strong><br>${escapeHtml(entry.title)}<br><span>${entry.duration}s</span>`;
    clip.addEventListener("click", () => selectEntry(entry.id));
    elements.timeline.append(clip);
  });
}

function renderPreview() {
  const entry = selectedEntry();
  setAspectClass();
  applyOverlayStyles();

  elements.previewTitle.textContent = entry ? entry.title : "Add videos to begin";
  elements.previewMeta.textContent = `${state.settings.aspectRatio} • ${state.settings.cropMode} • ${state.settings.exportFormat}`;
  elements.durationOutput.textContent = `${state.settings.outputDuration}s`;
  elements.rankingStack.hidden = !elements.showRank.checked;
  elements.previewTitle.hidden = !elements.showTitle.checked;
  elements.previewMeta.hidden = !elements.showMeta.checked;
  renderRankingStack();
  updateResolution();
}

function render() {
  renderEntries();
  renderTimeline();
  renderPreview();
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    };
    return map[character];
  });
}

function stepSelection(direction) {
  if (!state.entries.length) return;
  const index = selectedIndex();
  const nextIndex = (index + direction + state.entries.length) % state.entries.length;
  state.selectedId = state.entries[nextIndex].id;
  render();
}

function setExportIdle() {
  clearInterval(state.exportTimer);
  elements.exportStatus.textContent = "Idle";
  elements.exportProgress.textContent = "0%";
  elements.progressBar.style.width = "0%";
  elements.exportCopy.textContent = "Ready to queue a render when your ranking order looks right.";
  elements.downloadLink.classList.remove("ready");
  elements.downloadLink.setAttribute("aria-disabled", "true");
}

function runExport() {
  if (!state.entries.length) {
    loadSamples();
  }

  clearInterval(state.exportTimer);
  const stages = [
    { label: "Queued", at: 0 },
    { label: "Processing", at: 16 },
    { label: "Rendering", at: 42 },
    { label: "Finalizing", at: 86 },
    { label: "Ready", at: 100 }
  ];
  let progress = 0;
  elements.downloadLink.classList.remove("ready");
  elements.downloadLink.setAttribute("aria-disabled", "true");

  state.exportTimer = setInterval(() => {
    const step = progress >= 86 ? 14 : Math.floor(Math.random() * 14) + 13;
    progress = Math.min(100, progress + step);
    const stage = stages.reduce((current, item) => (progress >= item.at ? item : current), stages[0]);
    elements.exportStatus.textContent = stage.label;
    elements.exportProgress.textContent = `${progress}%`;
    elements.progressBar.style.width = `${progress}%`;
    elements.exportCopy.textContent = `${stage.label} ${state.entries.length} ranked clips into a short-form ${state.settings.exportFormat}.`;

    if (progress >= 100) {
      clearInterval(state.exportTimer);
      elements.exportStatus.textContent = "Ready";
      elements.exportProgress.textContent = "100%";
      elements.progressBar.style.width = "100%";
      elements.exportCopy.textContent = "Your preview render is ready. Production would return a signed storage URL here.";
      elements.downloadLink.classList.add("ready");
      elements.downloadLink.setAttribute("aria-disabled", "false");
      elements.downloadLink.href = makeDownloadUrl();
    }
  }, 150);
}

function makeDownloadUrl() {
  const payload = {
    videoEntries: state.entries,
    editorSettings: state.settings,
    exportJob: {
      status: "Ready",
      progress: 100,
      outputUrl: "signed-production-url-placeholder"
    }
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  return URL.createObjectURL(blob);
}

function syncSettings() {
  state.settings.aspectRatio = elements.aspectRatio.value;
  state.settings.cropMode = elements.cropMode.value;
  state.settings.outputDuration = Number(elements.duration.value);
  state.settings.exportFormat = elements.exportFormat.value.replace(" optional", "");
  state.settings.theme = elements.stylePreset.value;
  renderPreview();
}

[
  elements.aspectRatio,
  elements.cropMode,
  elements.duration,
  elements.fontFamily,
  elements.fontWeight,
  elements.fontSize,
  elements.fontColor,
  elements.outlineColor,
  elements.backgroundColor,
  elements.textPosition,
  elements.textAlign,
  elements.stylePreset,
  elements.exportFormat,
  elements.showRank,
  elements.showTitle,
  elements.showMeta
].forEach((control) => control.addEventListener("input", syncSettings));

elements.importButton.addEventListener("click", importEntry);
elements.videoUrl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") importEntry();
});
elements.videoTitle.addEventListener("keydown", (event) => {
  if (event.key === "Enter") importEntry();
});
elements.addVideoButton.addEventListener("click", () => elements.videoUrl.focus());
elements.loadSampleButton.addEventListener("click", loadSamples);
elements.generateButton.addEventListener("click", () => {
  if (!state.entries.length) loadSamples();
  render();
});
elements.previousButton.addEventListener("click", () => stepSelection(-1));
elements.nextButton.addEventListener("click", () => stepSelection(1));
elements.playButton.addEventListener("click", () => {
  state.playing = !state.playing;
  elements.playButton.textContent = state.playing ? "Pause Preview" : "Play Preview";
  elements.previewCanvas.classList.toggle("is-playing", state.playing);
  clearInterval(state.playTimer);
  if (state.playing) {
    if (!state.entries.length) loadSamples();
    state.playTimer = setInterval(() => stepSelection(1), 1300);
  }
  renderPreview();
});
elements.exportButton.addEventListener("click", runExport);

syncSettings();
render();

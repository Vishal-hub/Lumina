import { ui } from './state.js';

export function toFileSrc(filePath) {
    if (!filePath) return '';
    return encodeURI(`file:///${filePath.replace(/\\/g, '/')}`);
}

export function getDisplayPath(item) {
    return item.convertedPath || item.thumbnailPath || item.path;
}

export function getFullSizePath(item) {
    return item.convertedPath || item.path;
}

export function formatDate(timestamp) {
    if (timestamp == null || !Number.isFinite(Number(timestamp))) return '';
    return new Date(timestamp).toLocaleString();
}

export function nodeCountLabel(cluster) {
    const items = cluster.items || [];
    const videos = items.filter((item) => item.type === 'video').length;
    const images = items.length - videos;
    if (videos > 0 && images > 0) return `${items.length} items (${images} photos, ${videos} videos)`;
    if (videos > 0) return `${videos} video${videos > 1 ? 's' : ''}`;
    return `${images} photo${images > 1 ? 's' : ''}`;
}

let _hintTimer = 0;
export function showIndexingHint(message) {
    if (!ui.indexingHint) return;
    clearTimeout(_hintTimer);
    ui.indexingHint.textContent = message;
    ui.indexingHint.classList.remove('hidden');
    _hintTimer = setTimeout(() => {
        ui.indexingHint.classList.add('hidden');
    }, 4000);
}

export function renderEmptyState(message) {
    if (!ui.gallery || !ui.connections) return;
    ui.gallery.innerHTML = '';
    ui.connections.innerHTML = '';
    const empty = document.createElement('div');
    empty.className = 'details';
    empty.innerText = message;
    ui.gallery.appendChild(empty);
}

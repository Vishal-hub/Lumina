const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');
const crypto = require('crypto');
const { HEIC_EXTENSIONS } = require('./constants');

let _convertDir = null;
let _convert = null;

const _queue = [];
let _running = false;

function getConvertDir(app) {
    if (_convertDir) return _convertDir;
    const userDataPath = app.getPath('userData');
    _convertDir = path.join(userDataPath, 'heic-cache');
    if (!fs.existsSync(_convertDir)) fs.mkdirSync(_convertDir, { recursive: true });
    return _convertDir;
}

function isHeic(filePath) {
    return HEIC_EXTENSIONS.has(path.extname(filePath).toLowerCase());
}

function getCachedJpegPath(convertDir, filePath, mtimeMs, size) {
    const seed = `${filePath}|${mtimeMs}|${size}`;
    const hash = crypto.createHash('sha1').update(seed).digest('hex').slice(0, 20);
    return path.join(convertDir, `heic_${hash}.jpg`);
}

function getConverter() {
    if (!_convert) _convert = require('heic-convert');
    return _convert;
}

function drainQueue() {
    if (_running || _queue.length === 0) return;
    _running = true;
    const { jpegPath, filePath, resolve, reject } = _queue.shift();

    fsp.readFile(filePath)
        .then((inputBuffer) => getConverter()({ buffer: inputBuffer, format: 'JPEG', quality: 0.92 }))
        .then((outputBuffer) => {
            const buf = Buffer.isBuffer(outputBuffer) ? outputBuffer : Buffer.from(outputBuffer);
            return fsp.writeFile(jpegPath, buf);
        })
        .then(() => {
            console.log(`[ImageConverter] Converted HEIC -> JPEG: ${path.basename(filePath)}`);
            resolve(jpegPath);
        })
        .catch(reject)
        .finally(() => {
            _running = false;
            drainQueue();
        });
}

async function convertHeicToJpeg(filePath, convertDir, mtimeMs, size) {
    const jpegPath = getCachedJpegPath(convertDir, filePath, mtimeMs, size);

    try {
        await fsp.access(jpegPath);
        return jpegPath;
    } catch { }

    return new Promise((resolve, reject) => {
        _queue.push({ jpegPath, filePath, resolve, reject });
        drainQueue();
    });
}

async function ensureDisplayablePath(file, app) {
    if (!isHeic(file.path)) return file.path;
    const convertDir = getConvertDir(app);
    return convertHeicToJpeg(file.path, convertDir, file.mtimeMs, file.size);
}

function getConvertedPathSync(filePath, mtimeMs, size, convertDir) {
    if (!isHeic(filePath)) return null;
    const jpegPath = getCachedJpegPath(convertDir, filePath, mtimeMs, size);
    return fs.existsSync(jpegPath) ? jpegPath : null;
}

module.exports = {
    isHeic,
    convertHeicToJpeg,
    ensureDisplayablePath,
    getConvertDir,
    getConvertedPathSync,
};

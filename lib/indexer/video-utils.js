const ffmpeg = require('fluent-ffmpeg');
const ffmpegStatic = require('ffmpeg-static');
const ffprobeStatic = require('ffprobe-static');
const path = require('path');
const os = require('os');
const fs = require('fs');
const crypto = require('crypto');

ffmpeg.setFfmpegPath(ffmpegStatic);
ffmpeg.setFfprobePath(ffprobeStatic.path);

const MAX_CONCURRENT_FFMPEG = 2;
const _queue = [];
let _active = 0;

function drainFfmpegQueue() {
  while (_active < MAX_CONCURRENT_FFMPEG && _queue.length > 0) {
    const { videoPath, resolve } = _queue.shift();
    _active++;
    runExtraction(videoPath)
      .then(resolve)
      .finally(() => {
        _active--;
        drainFfmpegQueue();
      });
  }
}

function runExtraction(videoPath) {
  return new Promise((resolve) => {
    const tempDir = path.join(os.homedir(), '.memory-desktop', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const uid = crypto.randomBytes(6).toString('hex');
    const outputFilename = `frame_${uid}.jpg`;
    const outputPath = path.join(tempDir, outputFilename);

    ffmpeg(videoPath)
      .screenshots({
        timestamps: ['50%'],
        filename: outputFilename,
        folder: tempDir,
        size: '300x?',
      })
      .on('end', () => resolve(outputPath))
      .on('error', (err) => {
        console.error(`Error extracting frame from ${videoPath}:`, err.message);
        resolve(null);
      });
  });
}

async function extractFrame(videoPath) {
  return new Promise((resolve) => {
    _queue.push({ videoPath, resolve });
    drainFfmpegQueue();
  });
}

module.exports = {
  extractFrame,
};

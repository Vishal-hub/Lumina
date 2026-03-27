const SUPPORTED_MEDIA = new Set([
  '.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff', '.tif', '.svg',
  '.heic', '.heif',
  '.mp4', '.mov', '.avi',
]);
const VIDEO_EXTENSIONS = new Set(['.mp4', '.mov', '.avi']);
const HEIC_EXTENSIONS = new Set(['.heic', '.heif']);
const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
const MAX_CLUSTER_SIZE = 30;
const LOCATION_SPLIT_DISTANCE_KM = 80;

module.exports = {
  SUPPORTED_MEDIA,
  VIDEO_EXTENSIONS,
  HEIC_EXTENSIONS,
  TWO_HOURS_MS,
  MAX_CLUSTER_SIZE,
  LOCATION_SPLIT_DISTANCE_KM,
};

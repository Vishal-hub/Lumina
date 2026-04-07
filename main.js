const log = require('electron-log');
const { startApp } = require('./src/main');

// Configure logging
log.transports.file.level = 'info';
log.transports.file.maxSize = 5 * 1024 * 1024;
log.transports.file.fileName = 'main.log';
log.info('--- Lumina Session Starting ---');
log.info(`Version: ${require('./package.json').version}`);
log.info(`Platform: ${process.platform} (${process.arch})`);

process.on('uncaughtException', (error) => {
    log.error('[Fatal] Uncaught exception:', error);
});

process.on('unhandledRejection', (reason) => {
    log.error('[Fatal] Unhandled promise rejection:', reason);
});

startApp();
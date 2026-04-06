// Registers global error handlers once for the Node process to help debugging
declare global {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  var __serverUtilsInitialized: any;
}

if (!global.__serverUtilsInitialized) {
  global.__serverUtilsInitialized = true;

  process.on('unhandledRejection', (reason) => {
    try {
      console.error('[server] Unhandled Rejection:', reason);
    } catch (e) {
      // ignore
    }
  });

  process.on('uncaughtException', (err) => {
    try {
      console.error('[server] Uncaught Exception:', err);
    } catch (e) {
      // ignore
    }
    // don't exit in dev automatically
  });
}

export {};

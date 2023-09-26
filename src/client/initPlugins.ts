import log from "~/util/log";

__optic$config.plugins?.forEach((plugin) => {
  if (plugin.client) {
    try {
      plugin.client();

      log.info(`Loaded plugin ${plugin.name}:`, plugin);
    } catch (e: unknown) {
      if (e instanceof Error) {
        log.error(`Error loading plugin ${plugin.name}`, e);
      }
    }
  }
});

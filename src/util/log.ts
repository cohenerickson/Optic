function info(message: string, ...args: any[]) {
  if (__optic$config.logLevel > 2) {
    console.log(message, ...args);
  }
}

function warn(message: string, ...args: any[]) {
  if (__optic$config.logLevel > 1) {
    console.warn(message, ...args);
  }
}

function error(message: string, error?: Error) {
  if (__optic$config.logLevel > 0) {
    if (error) {
      error.message = `${message} ${error.message}`;
    }
    console.error(error ? error : message);
  }
}

export default { info, warn, error };

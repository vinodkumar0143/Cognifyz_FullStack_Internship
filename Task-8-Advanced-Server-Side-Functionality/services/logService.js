class LogService {
  constructor() {
    this.logs = [];
    this.maxLogs = 100;
    this.interceptConsole();
  }

  interceptConsole() {
    const originalLog = console.log;
    const originalError = console.error;
    const originalWarn = console.warn;

    console.log = (...args) => {
      originalLog.apply(console, args);
      this.addLog('info', args.join(' '));
    };

    console.error = (...args) => {
      originalError.apply(console, args);
      this.addLog('error', args.join(' '));
    };

    console.warn = (...args) => {
      originalWarn.apply(console, args);
      this.addLog('warn', args.join(' '));
    };
  }

  addLog(type, message) {
    const timestamp = new Date().toISOString();
    // Strip ANSI color escape codes from logs
    const cleanMessage = message.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
    this.logs.push({ timestamp, type, message: cleanMessage });
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }
  }

  getLogs() {
    return this.logs;
  }

  clearLogs() {
    this.logs = [];
  }
}

module.exports = new LogService();

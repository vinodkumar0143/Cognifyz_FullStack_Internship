const logService = require('../services/logService');

module.exports = {
  getLogs: (req, res) => {
    res.json({
      success: true,
      logs: logService.getLogs()
    });
  },
  clearLogs: (req, res) => {
    logService.clearLogs();
    res.json({
      success: true,
      message: 'Server log buffer cleared'
    });
  }
};

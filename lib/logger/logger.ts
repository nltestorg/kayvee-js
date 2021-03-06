var _   = require("underscore");
_.mixin(require("underscore.deep"));
var kv  = require("../kayvee");


var LEVELS = {
  Debug:    "debug",
  Info:     "info",
  Warning:  "warning",
  Error:    "error",
  Critical: "critical",
};

var LOG_LEVEL_ENUM = {
  debug:    0,
  info:     1,
  warning:  2,
  error:    3,
  critical: 4,
};

// This is a port from kayvee-go/logger/logger.go
class Logger {
  formatter = null;
  logLvl = null;
  globals = null;
  logWriter = null;

  constructor(source, logLvl = process.env.KAYVEE_LOG_LEVEL, formatter = kv.format, output = console.error) {
    this.formatter = formatter;
    this.logLvl = this._validateLogLvl(logLvl);
    this.globals = {};
    this.globals.source = source;
    this.logWriter = output;
  }

  setConfig(source, logLvl, formatter, output) {
    this.globals.source = source;
    this.logLvl = this._validateLogLvl(logLvl);
    this.formatter = formatter;
    this.logWriter = output;
    return this.logWriter;
  }

  _validateLogLvl(logLvl) {
    if (logLvl == null) {
      return LEVELS.Debug;
    }
    for (var key in LEVELS) {
      if (Object.prototype.hasOwnProperty.call(LEVELS, key)) {
        var value = LEVELS[key];
        if (logLvl.toLowerCase() === value) {
          return value;
        }
      }
    }
    return LEVELS.Debug;
  }

  setLogLevel(logLvl) {
    this.logLvl = this._validateLogLvl(logLvl);
    return this.logLvl;
  }

  setFormatter(formatter) {
    this.formatter = formatter;
    return this.formatter;
  }

  setOutput(output) {
    this.logWriter = output;
    return this.logWriter;
  }

  debug(title) {
    this.debugD(title, {});
  }

  info(title) {
    this.infoD(title, {});
  }

  warn(title) {
    this.warnD(title, {});
  }

  error(title) {
    this.errorD(title, {});
  }

  critical(title) {
    this.criticalD(title, {});
  }

  counter(title) {
    this.counterD(title, 1, {});
  }

  gauge(title, value) {
    this.gaugeD(title, value, {});
  }

  debugD(title, data) {
    this._logWithLevel(LEVELS.Debug, {
      title,
    }, data);
  }

  infoD(title, data) {
    this._logWithLevel(LEVELS.Info, {
      title,
    }, data);
  }

  warnD(title, data) {
    this._logWithLevel(LEVELS.Warning, {
      title,
    }, data);
  }

  errorD(title, data) {
    this._logWithLevel(LEVELS.Error, {
      title,
    }, data);
  }

  criticalD(title, data) {
    this._logWithLevel(LEVELS.Critical, {
      title,
    }, data);
  }

  counterD(title, value, data) {
    this._logWithLevel(LEVELS.Info, {
      title,
      value,
      type: "counter",
    }, data);
  }

  gaugeD(title, value, data) {
    this._logWithLevel(LEVELS.Info, {
      title,
      value,
      type:  "gauge",
    }, data);
  }

  _logWithLevel(logLvl, metadata, userdata) {
    if (LOG_LEVEL_ENUM[logLvl] < LOG_LEVEL_ENUM[this.logLvl]) {
      return;
    }
    const data = _.extend(metadata, _(userdata).deepClone());
    data.level = logLvl;
    _.defaults(data, this.globals);
    this.logWriter(this.formatter(data));
  }
}

module.exports = Logger;
_.extend(module.exports, LEVELS);
module.exports.LEVELS = ["debug", "info", "warn", "error", "critical"];
module.exports.METRICS = ["counter", "gauge"];

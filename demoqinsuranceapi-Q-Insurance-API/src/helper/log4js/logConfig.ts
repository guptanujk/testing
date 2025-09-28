export default {
  local: {
    appenders: {
      DEMOAPP: {
        type: "dateFile",
        filename: "./logs/server.log",
        maxLogSize: 5242880,
        numBackups: 3,
        daysToKeep: 10,
        pattern: ".yyyy-MM-dd",
        keepFileExt: false,
      },
      consolelogs: {
        type: "console",
        category: "console",
      },
    },
    categories: {
      default: {
        appenders: ["DEMOAPP", "consolelogs"],
        level: "ALL",
      },
    },
  },
  prod: {
    appenders: {
      DEMOAPP: {
        type: "dateFile",
        filename: "/var/log/accelq-demo-app-logs/server.log",
        maxLogSize: 5242880,
        numBackups: 3,
        daysToKeep: 90,
        keepFileExt: false,
        pattern: ".yyyy-MM-dd",
      },
      consolelogs: {
        type: "console",
        category: "console",
      },
    },
    categories: {
      default: {
        appenders: ["DEMOAPP", "consolelogs"],
        level: "ALL",
      },
    },
  },
  test: {
    appenders: {
      DEMOAPP: {
        type: 'dateFile',
        filename: './logs/server.log',
        maxLogSize: 5242880,
        numBackups: 3,
        daysToKeep: 90,
        keepFileExt: false,
        pattern: '.yyyy-MM-dd',
      },
    },
    categories: {
      default: {
        appenders: ['DEMOAPP'],
        level: 'OFF',
      },
    },
  },
};

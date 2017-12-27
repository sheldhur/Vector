import consoleLogSQL from './consoleLogSQL';

export default (params, onMessageCallback) => {
  const STD_OUT = 'stdout';
  const STD_ERR = 'stderr';
  const { spawn } = require('child_process');

  const electronVersion = process.versions.electron;

  params = Object.assign({}, {
    exec: process.execPath,
    options: {},
    args: [],
    timeout: 1000 * 60 * 5,
    killSignal: 'SIGTERM',
    killOnError: false,
    killOnDisconnect: true,
  }, params);

  if (params.script) {
    params.args.push(params.script);
  }
  params.options.stdio = ['pipe', 'pipe', 'pipe', 'ipc'];
  if (params.options.env === undefined) {
    params.options.env = {};
  }
  if (electronVersion) {
    params.options.env.ELECTRON_VERSION = electronVersion;
  }

  const child = spawn(params.exec, params.args, params.options);

  let lastMessageTime = (new Date()).getTime();
  const timer = setInterval(() => {
    if (params.timeout && params.timeout > 0 && lastMessageTime + params.timeout < (new Date()).getTime()) {
      child.kill(params.killSignal);
      clearInterval(timer);
      console.log('Kill child process by timeout %s sec.', params.timeout / 1000);
    }
  }, 100);

  const prepareStd = (message, type) => {
    message = message.toString();
    try {
      message = JSON.parse(message);
    } catch (e) {

    }

    const messageType = `${type} (${child.pid}):`;

    if (type === STD_ERR) {
      console.error(messageType, message);
    } else {
      console.log(messageType, message);
    }
  };

  const killChild = (kill) => {
    if (kill) {
      child.kill(params.killSignal);
      clearInterval(timer);
    } else {
      lastMessageTime = (new Date()).getTime();
    }
  };

  child.stdout.on('data', (data) => prepareStd(data, STD_OUT));
  child.stderr.on('data', (data) => prepareStd(data, STD_ERR));

  child.on('disconnect', () => {
    killChild(params.killOnDisconnect);
    console.log('Kill child process. Disconnect.');
  });
  child.on('error', () => {
    killChild(params.killOnDisconnect);
    console.log('Kill child process. Error.');
  });

  child.on('exit', () => {
    clearInterval(timer);
  });


  child.on('message', (data, sendHandle) => {
    lastMessageTime = (new Date()).getTime();
    if (data.consoleLogSQL !== undefined) {
      consoleLogSQL(`stdout (${child.pid}) ${data.consoleLogSQL}`);
    } else if (onMessageCallback) {
      onMessageCallback(data, sendHandle);
    }
  });

  return child;
};

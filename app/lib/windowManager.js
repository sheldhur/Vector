import { remote, screen } from 'electron';


class WindowManager {
  window = {};
  defaultOptions = {
    minWidth: 800,
    minHeight: 600,
    width: 800,
    height: 600,
    webPreferences: {
      devTools: true,
    }
  };

  get = (name) => {
    if (this.window.hasOwnProperty(name)) {
      return this.window[name];
    }

    return null;
  };

  open = (name, url, options = {}, menu = null) => {
    const windowOptions = {
      ...this.defaultOptions,
      ...options
    };

    const { width, height } = screen.getPrimaryDisplay().workAreaSize;
    ['minWidth', 'minHeight', 'maxWidth', 'maxHeight', 'width', 'height', 'x', 'y'].forEach((propName) => {
      if (windowOptions.hasOwnProperty(propName)) {
        let prop = windowOptions[propName];
        if (/^\d+(\.\d+)?%$/.test(prop)) {
          const propPercentage = parseFloat(prop);
          if (/^(.+)?width$/.test(propName) || propName === 'x') {
            prop = Math.floor((width / 100) * propPercentage);
          } else if (/^(.+)?height$/.test(propName) || propName === 'y') {
            prop = Math.floor((height / 100) * propPercentage);
          }

          windowOptions[propName] = prop;
        }
      }
    });

    // console.log(windowOptions);

    const win = this.get(name, url) || new remote.BrowserWindow(windowOptions);
    win.setMenu(menu);
    win.on('closed', () => {
      this.window[name] = null;
      console.log(this.window);
    });
    win.on('page-title-updated', (e, title) => {
      if (title !== windowOptions.title) {
        e.preventDefault();
        win.setTitle(windowOptions.title);
      }
    });

    this.window[name] = win;
    this.show(name, url, true);

    return this.get(name);
  };

  show = (name, url = null, reload = false) => {
    const win = this.get(name);
    if (reload) {
      win.once('ready-to-show', () => {
        win.show();
      });
      win.loadURL(`${window.location.origin + window.location.pathname}#${url}`);
    } else {
      win.webContents.send('windowManger', { push: url });
    }
    win.show();
  };

  close = (name) => {
    this.get(name).close();
  };

  closeAll = () => {
    for (const name in this.window) {
      this.close(name);
    }
  };
}

let manager = null;
if (!manager) {
  manager = new WindowManager();
}

export default manager;

const { app, BrowserWindow,ipcMain,Menu} = require('electron');
const fs = require('fs'); // 引入文件系统模块
const https = require('https');
const md5 = require('md5');

let mainWindow;
let isAlwaysOnTop = false; // 跟踪窗口是否置顶
let config = {};

// 读取配置文件
function loadConfig() {
  try {
    const configData = fs.readFileSync('config.json', 'utf8');
    config = JSON.parse(configData);
  } catch (err) {
    console.error('Error reading config file:', err);
    return null;
  }
}

//创建窗口代码
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 730,
    height: 226,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    },
    titleBarStyle:"hidden",//隐藏菜单栏（快捷键还能用）
    titleBarOverlay: {
      color: '#fff',
      symbolColor: '#74b1be',
    }, //右上角的缩小放大和关闭按钮
    resizable: true
  }
  );

  mainWindow.loadFile('index.html');
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
// 监听窗口的 resize 事件
mainWindow.on('resize', () => {
  // 保持高度不变
  mainWindow.setSize(mainWindow.getBounds().width, 226);
});
//创建菜单功能函数
  function updateMenu() {
    const menuTemplate = [
      { role: 'reload' },
      { role: 'toggledevtools' },
      {
        label: isAlwaysOnTop ? '📌置顶' : '置顶',
        type: 'checkbox',
        accelerator: 'CommandOrControl+T',
        checked: isAlwaysOnTop,
        click: () => {
          isAlwaysOnTop = !isAlwaysOnTop;
          mainWindow.setAlwaysOnTop(isAlwaysOnTop);
          updateMenu(); // 重新构建菜单
          // 发送置顶状态事件到渲染进程
          mainWindow.webContents.send('update-top-icon', isAlwaysOnTop);
        }
      }
    ];

    const menu = Menu.buildFromTemplate(menuTemplate);
    Menu.setApplicationMenu(menu);
  }
  updateMenu(); // 初始构建菜单

}

app.on('ready', () => {
  loadConfig(); // 在应用程序准备就绪时加载配置
  createWindow();
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

// 处理翻译请求
ipcMain.on('translate', (event, text) => {
  const { appid, secretKey } = config; // 使用从配置文件中读取的值  
  const from = 'auto'; // 源语言
  const salt = (new Date).getTime();
  const query = text;
  // 使用正则表达式检查文本是否包含中文字符
  const isChinese = /[\u4e00-\u9fa5]/.test(query);

  // 根据文本内容设置目标语言
  const to = isChinese ? 'en' : 'zh';

  // 使用MD5生成签名
  const md5 = require('md5');
  const sign = md5(appid + query + salt + secretKey);

  // 构建请求参数
  const params = {
    q: query,
    appid: appid,
    salt: salt,
    from: from,
    to: to,
    sign: sign
  };

  // 将参数转换为URL编码的字符串
  const queryStr = Object.keys(params).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`).join('&');

  // 发送请求到百度翻译API
  const options = {
    hostname: 'api.fanyi.baidu.com',
    path: '/api/trans/vip/translate?' + queryStr,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => {
      data += chunk;
    });
    res.on('end', () => {
      // 解析返回的JSON数据
      const result = JSON.parse(data);
      if (result && result.trans_result) {
        // 发送翻译结果回渲染进程
        event.reply('translated', result.trans_result[0].dst);
      }
    });
  });

  req.on('error', (e) => {
    console.error(e);
  });

  req.end();
});

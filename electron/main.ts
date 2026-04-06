import { app, BrowserWindow, globalShortcut, Tray, Menu, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

// 检测是否为开发模式：如果 dist/index.html 不存在，则为开发模式
const distIndexHtml = path.join(__dirname, '../dist/index.html');
const isDev = !fs.existsSync(distIndexHtml);

console.log('[忆流] dist/index.html 路径:', distIndexHtml);
console.log('[忆流] 文件存在:', fs.existsSync(distIndexHtml));
console.log('[忆流] isDev:', isDev);

function getResourcePath(...parts: string[]): string {
  // 打包后，__dirname 是 Resources/app/dist-electron
  // 所以需要相对于这个路径查找
  if (!isDev) {
    // 打包后：Resources/app 是根目录
    const appPath = path.resolve(__dirname, '..');
    return path.join(appPath, ...parts);
  }
  return path.join(__dirname, ...parts);
}

// 使用 createRequire 来动态加载 CommonJS 模块
const require = createRequire(import.meta.url);

// 动态导入后端模块
let db: any = null;

const SETTINGS_PATH = path.join(app.getPath('userData'), 'settings.json');

async function loadBackend() {
  try {
    process.env.YILIU_DATA_PATH = app.getPath('userData');
    console.log('[忆流] 数据路径:', process.env.YILIU_DATA_PATH);
    console.log('[忆流] isPackaged:', app.isPackaged);
    console.log('[忆流] __dirname:', __dirname);

    const backendPath = path.join(__dirname, 'backend', 'storage', 'db.js');
    console.log('[忆流] 后端路径:', backendPath);
    
    const getModulePath = (relPath: string): string => {
      const mainPath = path.join(__dirname, relPath);
      if (fs.existsSync(mainPath)) return mainPath;
      const altPath = path.join(process.resourcesPath, 'app', 'dist-electron', relPath);
      return altPath;
    };

    if (!fs.existsSync(backendPath)) {
      console.error('[忆流] 后端文件不存在:', backendPath);
      const altPath = getModulePath('backend/storage/db.js');
      console.log('[忆流] 尝试备用路径:', altPath);
      
      if (!fs.existsSync(altPath)) {
        console.error('[忆流] 备用路径也不存在');
        return;
      }
      
      const module = await import(`file://${altPath}`);
      db = module;
      await db.initDB();
      console.log('[忆流] 后端模块已加载 (备用路径)');
      return;
    }

    const module = await import(`file://${backendPath}`);
    db = module;
    
    const aiModulePath = getModulePath('backend/ai/index.js');
    if (fs.existsSync(aiModulePath)) {
      try {
        const aiModule = await import(`file://${aiModulePath}`);
        if (aiModule.setProgressCallback) {
          aiModule.setProgressCallback((stage: string, progress: number) => {
            mainWindow?.webContents.send('model-load-progress', { stage, progress });
          });
          console.log('[忆流] AI 进度回调已设置');
        }
      } catch (aiErr) {
        console.log('[忆流] AI 模块进度回调设置失败:', aiErr);
      }
    }
    
    await db.initDB();
    console.log('[忆流] 后端模块已加载');
  } catch (err) {
    console.error('[忆流] 后端模块加载失败:', err);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: '忆流',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    show: false,
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    console.log('[忆流] 窗口已就绪');
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('close', (event) => {
    if (process.platform === 'darwin') {
      event.preventDefault();
      mainWindow?.hide();
    }
  });
}

function createTray() {
  const iconPath = isDev 
    ? path.join(__dirname, '../public/icon.png')
    : path.join(__dirname, '../dist/icon.png');
  
  try {
    tray = new Tray(iconPath);
  } catch {
    console.log('[忆流] 托盘图标未找到，跳过托盘创建');
    return;
  }

  const contextMenu = Menu.buildFromTemplate([
    { label: '显示忆流', click: () => mainWindow?.show() },
    { label: '隐藏', click: () => mainWindow?.hide() },
    { type: 'separator' },
    { label: '退出', click: () => app.quit() }
  ]);

  tray.setToolTip('忆流 - 第二大脑');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow?.show();
  });
}

function registerShortcuts() {
  globalShortcut.register('CommandOrControl+Shift+Y', () => {
    if (mainWindow?.isVisible()) {
      mainWindow.hide();
    } else {
      mainWindow?.show();
      mainWindow?.focus();
    }
  });
  
  globalShortcut.register('CommandOrControl+K', () => {
    mainWindow?.show();
    mainWindow?.focus();
    mainWindow?.webContents.send('focus-input');
  });
}

function registerIPCHandlers() {
  // 笔记操作
  ipcMain.handle('note:create', async (_, content: string, source?: string, url?: string) => {
    if (!db) return null;
    try {
      return await db.createNoteAsync(content, source, url);
    } catch (err) {
      console.error('[IPC] note:create error:', err);
      mainWindow?.webContents.send('error', String(err));
      return null;
    }
  });

  ipcMain.handle('note:get', async (_, id: string) => {
    if (!db) return null;
    try {
      return await db.getNote(id);
    } catch (err) {
      console.error('[IPC] note:get error:', err);
      return null;
    }
  });

  ipcMain.handle('note:getAll', async (_, limit?: number) => {
    if (!db) return [];
    try {
      return await db.getAllNotes(limit);
    } catch (err) {
      console.error('[IPC] note:getAll error:', err);
      return [];
    }
  });

  ipcMain.handle('note:update', async (_, id: string, content: string) => {
    if (!db) return null;
    try {
      return await db.updateNote(id, content);
    } catch (err) {
      console.error('[IPC] note:update error:', err);
      mainWindow?.webContents.send('error', String(err));
      return null;
    }
  });

  ipcMain.handle('note:delete', async (_, id: string) => {
    if (!db) return false;
    try {
      return await db.deleteNote(id);
    } catch (err) {
      console.error('[IPC] note:delete error:', err);
      mainWindow?.webContents.send('error', String(err));
      return false;
    }
  });

  ipcMain.handle('note:search', async (_, keyword: string) => {
    if (!db) return [];
    try {
      return await db.searchNotes(keyword);
    } catch (err) {
      console.error('[IPC] note:search error:', err);
      return [];
    }
  });

  ipcMain.handle('note:semanticSearch', async (_, query: string, topK?: number) => {
    if (!db) return [];
    try {
      return await db.semanticSearchNotes(query, topK);
    } catch (err) {
      console.error('[IPC] note:semanticSearch error:', err);
      return [];
    }
  });

  ipcMain.handle('note:export', async (_, format?: string) => {
    if (!db) return '';
    try {
      return await db.exportToMarkdown(format);
    } catch (err) {
      console.error('[IPC] note:export error:', err);
      return '';
    }
  });

  ipcMain.handle('note:stats', async () => {
    if (!db) return { notes: 0, vectorized: 0, avgLength: 0 };
    try {
      return await db.getDBStats();
    } catch (err) {
      console.error('[IPC] note:stats error:', err);
      return { notes: 0, vectorized: 0, avgLength: 0 };
    }
  });

  // 版本操作
  ipcMain.handle('note:getVersions', async (_, noteId: string) => {
    if (!db) return [];
    try {
      return await db.getVersions(noteId);
    } catch (err) {
      console.error('[IPC] note:getVersions error:', err);
      return [];
    }
  });

  ipcMain.handle('note:revertToVersion', async (_, noteId: string, version: number) => {
    if (!db) return null;
    try {
      return await db.revertToVersion(noteId, version);
    } catch (err) {
      console.error('[IPC] note:revertToVersion error:', err);
      return null;
    }
  });

  ipcMain.handle('settings:get', async () => {
    try {
      if (fs.existsSync(SETTINGS_PATH)) {
        return JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
      }
      return { apiKey: '', embeddingModel: 'local', dataPath: app.getPath('userData') };
    } catch (err) {
      console.error('[IPC] settings:get error:', err);
      return { apiKey: '', embeddingModel: 'local', dataPath: app.getPath('userData') };
    }
  });

  ipcMain.handle('settings:save', async (_, settings: { apiKey?: string; embeddingModel?: string }) => {
    try {
      let current: any = { apiKey: '', embeddingModel: 'local' };
      if (fs.existsSync(SETTINGS_PATH)) {
        current = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
      }
      const merged = { ...current, ...settings };
      fs.writeFileSync(SETTINGS_PATH, JSON.stringify(merged, null, 2));
      if (settings.apiKey) {
        process.env.OPENAI_API_KEY = settings.apiKey;
      }
      return true;
    } catch (err) {
      console.error('[IPC] settings:save error:', err);
      return false;
    }
  });

  ipcMain.handle('settings:openDataDir', async () => {
    try {
      shell.openPath(app.getPath('userData'));
    } catch (err) {
      console.error('[IPC] settings:openDataDir error:', err);
    }
  });

  ipcMain.handle('settings:openExternal', async (_, url: string) => {
    try {
      shell.openExternal(url);
    } catch (err) {
      console.error('[IPC] settings:openExternal error:', err);
    }
  });

  ipcMain.handle('settings:openFile', async (_, filePath: string) => {
    try {
      shell.showItemInFolder(filePath);
    } catch (err) {
      console.error('[IPC] settings:openFile error:', err);
    }
  });

  ipcMain.handle('settings:testAI', async () => {
    try {
      let settings: any = { apiKey: '' };
      if (fs.existsSync(SETTINGS_PATH)) {
        settings = JSON.parse(fs.readFileSync(SETTINGS_PATH, 'utf-8'));
      }
      if (!settings.apiKey) {
        return { success: false, message: '未配置 API Key' };
      }
      const { default: OpenAI } = await import('openai');
      const client = new OpenAI({ apiKey: settings.apiKey });
      await client.models.list();
      return { success: true, message: '连接成功' };
    } catch (err: any) {
      console.error('[IPC] settings:testAI error:', err);
      return { success: false, message: err?.message || String(err) };
    }
  });

  // 标签管理
  ipcMain.handle('tags:getAll', async () => {
    if (!db) return [];
    try {
      return await db.getAllTags();
    } catch (err) {
      console.error('[IPC] tags:getAll error:', err);
      return [];
    }
  });

  ipcMain.handle('tags:rename', async (_, oldName: string, newName: string) => {
    if (!db) return false;
    try {
      const updated = await db.renameTag(oldName, newName);
      return updated > 0;
    } catch (err) {
      console.error('[IPC] tags:rename error:', err);
      return false;
    }
  });

  ipcMain.handle('tags:delete', async (_, name: string) => {
    if (!db) return false;
    try {
      const deleted = await db.deleteTag(name);
      return deleted > 0;
    } catch (err) {
      console.error('[IPC] tags:delete error:', err);
      return false;
    }
  });

  ipcMain.handle('tags:merge', async (_, source: string, target: string) => {
    if (!db) return false;
    try {
      const merged = await db.mergeTags(source, target);
      return merged > 0;
    } catch (err) {
      console.error('[IPC] tags:merge error:', err);
      return false;
    }
  });

  console.log('[忆流] IPC handlers 已注册');
}

app.whenReady().then(async () => {
  console.log('[忆流] 应用启动');
  
  // 先注册 IPC handlers，再加载后端
  registerIPCHandlers();
  await loadBackend();
  
  createWindow();
  createTray();
  registerShortcuts();
  
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      mainWindow?.show();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle('get-app-path', () => {
  return app.getPath('userData');
});
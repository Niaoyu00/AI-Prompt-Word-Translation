## 基于Electron Fiddle开发的，适合ai绘画使用者的翻译程序。

### 介绍

#### 主页面

![image-20240923053330639](https://niaoyu.oss-cn-shenzhen.aliyuncs.com/img/image-20240923053330639.png)

鼠标移上来会显示按键提示

![image-20240923053441013](https://niaoyu.oss-cn-shenzhen.aliyuncs.com/img/image-20240923053441013.png)

#### 功能

鼠标移到输出窗口的单词，可以中英对照查看，目前只支持中英文互译。

![image-20240923053643542](https://niaoyu.oss-cn-shenzhen.aliyuncs.com/img/image-20240923053643542.png)

点击单个词组可以进行单独复制。

![image-20240923053649955](https://niaoyu.oss-cn-shenzhen.aliyuncs.com/img/image-20240923053649955.png)

仔细看输出窗口的右下角有一个按钮，它可以复制所有的内容。

![image-20240923053751957](https://niaoyu.oss-cn-shenzhen.aliyuncs.com/img/image-20240923053751957.png)

英译中

![image-20240923053822178](https://niaoyu.oss-cn-shenzhen.aliyuncs.com/img/image-20240923053822178.png)

### 使用

- 我也是第一次开发electeon，直接用的`Electron Fiddle`，如果你不知道怎么用这些源码，可以下载个`Electron Fiddle`，很方便。

- 需要配置`config.json`，里面输入百度翻译的key等参数。
- 左下角可以直接添加需要的库，比如`md5`加密。

![image-20240923055440166](https://niaoyu.oss-cn-shenzhen.aliyuncs.com/img/image-20240923055440166.png)
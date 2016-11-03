# Electron API app

## app
> 控制您的应用程序的事件生命周期。

下面的示例演示如何在最后一个窗口关闭时退出应用程序：

``` js
// 引入electron框架的app对象
const {app} = require('electron');
// 注册所以窗体被关闭的事件
app.on('window-all-closed', () => {
	// 退出应用程序
  	app.quit()
});
```

## Events
app对象可以分发以下事件：  

### 1、事件: ‘will-finish-launching’

当应用程序已完成基本启动时触发。  

在Windows和Linux上，该事件和**“ready”**事件一样；在macOS上，这个事件可以看成是**NSApplication**的**applicationWillFinishLaunching**通知。通常会在这里设置**open-file**和**open-url**的监听，并开始崩溃报告记录和默认刷新。  

在大多数情况下，应该在**“ready”**事件中进行所有的操作。

### 2、事件: ‘ready’

返回：

- *launchInfo*  **Object**

该事件在electron初始化结束时触发。  

在macOS上，如果它是从通知中心启动，**launchInfo**在**NSUserNotification**上持有一个**userInfo**，用于打开应用程序。你可以调用**app.isReady()**来检查此事件是否已被触发。

### 3、事件: ‘window-all-closed’

在所有窗口被关闭时触发。  

如果您不订阅此事件，当所有的窗口都关闭时，默认的行为是退出应用程序；如果你订阅了改事件，就可以控制的应用程序是否退出。  

如果用户按下了**Cmd + Q**，或者当前应用程序调用**app.quit()**，Electron首先会尝试关闭所有窗体，然后触发**will-quit**事件。并且在这种情况下，**window-all-closed**将不会被触发。

### 4、事件: ‘before-quit’

返回：

- *event* **Event**  


在应用程序开始关闭它的窗口之前触发。  

调用**event.preventDefault()**将阻止默认行为，这是终止应用程序。

### 5、事件: ‘will-quit’ 

返回：

- *event* **Event** 

当所有的窗口关闭后，应用程序将退出时触发。

调用**event.preventDefault()**将阻止默认行为，这是终止应用程序。这是**window-all-closed**和**will-quit**之间的差异。

### 6、事件: ‘quit’

返回：

- *event* **Event** 
- *exitCode* **Integer**

当应用程序退出时触发。

### 7、事件: ‘open-file’

返回：

- *event* **Event** 
- *path* **String**

应用程序在用户需要打开一个文件时触发。  

此事件通常在应用程序已经打开时触发，操作系统希望重用应用程序来打开该文件。当一个文件被删除到基座上，并且应用程序尚未运行时，该事件也会被触发。应该确保监听**open-file**事件在应用程序启动时处理（甚至在**ready**事件之前）。  

如果需要处理这个事件，应该调用**event.preventDefault()**。

在Windows上，应该从process.argv（主进程）获取这个文件路径。

### 8、事件: ‘open-url’ 

返回：

- *event* **Event** 
- *url* **String**

在用户想通过当前应用程序打开一个网页链接，并且在链接打开之后触发。

如果你想要处理该事件，你需要调用**event.preventDefault()**。

### 9、事件: ‘activate’ 

返回：

- *event* **Event** 
- *hasVisibleWindows* **Boolean** 

应用被激活时触发。通常会在用户点击应用程序的图标时发生。

### 10、事件：‘continue-activity’ 

返回：

- *event* **Event** 



---
原文链接：[http://www.yyyweb.com/ctools/demo.php?t=http%3A%2F%2Felectron.atom.io%2F&h=2800&c=&n=electron](http://www.yyyweb.com/ctools/demo.php?t=http%3A%2F%2Felectron.atom.io%2F&h=2800&c=&n=electron)
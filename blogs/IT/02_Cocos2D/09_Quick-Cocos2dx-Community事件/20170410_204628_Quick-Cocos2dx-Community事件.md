# Quick-Cocos2dx-Community事件

## 事件类型

- 单点触摸：TouchOneByOne
- 多点触摸：TouchAllAtOnce
- 自定义事件：Custom  
- 加速计事件：Acceleration  
- 键盘事件：Keyboard  
- 鼠标事件：Mouse

## 单点touch事件

### 添加事件监听器

```lua
	-- 创建事件监听器对象
	local listener = cc.EventListenerTouchOneByOne:create()
	
	listener:registerScriptHandler(function(touch, eventTouch)
		print("touch开始")
		return true  
	end, cc.Handler.EVENT_TOUCH_BEGAN)
	listener:registerScriptHandler(function(touch, eventTouch)
		print("touch移动")
	end, cc.Handler.EVENT_TOUCH_MOVED)
	listener:registerScriptHandler(function(touch, eventTouch)
		print("touch结束")
	end, cc.Handler.EVENT_TOUCH_ENDED)
	listener:registerScriptHandler(function(touch, eventTouch)
		print("touch取消")
	end, cc.Handler.EVENT_TOUCH_CANCELLED)
	
	-- 添加事件监听器对象到事件管理器中
	local eventDispatcher = cc.Director:getInstance():getEventDispatcher()
    eventDispatcher:addEventListenerWithFixedPriority(listener, 1)
```

### 回调函数参数说明

每个回调函数都会接收两个参数，类型分别是*cc.Touch*和*cc.EventTouch*。  
- **cc.Touch：**源码在CCTouch.h内，主要是一些touch坐标相关的信息。  
- **cc.EventTouch：**源码在CCEventTouch.h内，主要是跟事件相关的信息。  


## 多点touch事件

### 添加事件监听器

```lua
-- 创建事件监听器对象
	local listener = cc.EventListenerTouchAllAtOnce:create()
	
	listener:registerScriptHandler(function(touches, eventTouch)
		print("touch开始")
		return true  
	end, cc.Handler.EVENT_TOUCHES_BEGAN)  -- 注意这里的事件类型和单点不一样
	listener:registerScriptHandler(function(touches, eventTouch)
		print("touch移动")
	end, cc.Handler.EVENT_TOUCHES_MOVED)  -- 注意这里的事件类型和单点不一样
	listener:registerScriptHandler(function(touches, eventTouch)
		print("touch结束")
	end, cc.Handler.EVENT_TOUCHES_ENDED)  -- 注意这里的事件类型和单点不一样
	listener:registerScriptHandler(function(touches, eventTouch)
		print("touch取消")
	end, cc.Handler.EVENT_TOUCHES_CANCELLED)  -- 注意这里的事件类型和单点不一样
	
	-- 添加事件监听器对象到事件管理器中
	local eventDispatcher = cc.Director:getInstance():getEventDispatcher()
    eventDispatcher:addEventListenerWithFixedPriority(listener, 1)
```


### 回调函数参数说明

每个回调函数都会接收两个参数，类型分别是*table*和*cc.EventTouch*。  
第一个参数是当前触摸点的数组，里面包含了每个触摸点的*cc.Touch*对象。

- **cc.Touch：**源码在CCTouch.h内，主要是一些touch坐标相关的信息。  
- **cc.EventTouch：**源码在CCEventTouch.h内，主要是跟事件相关的信息。  

## 自定义事件

### 添加事件监听器

```lua
	-- 创建事件监听器对象
	local listener = cc.EventListenerCustom:create("MY_CUSTOM_EVENT", function(event)
		dump(event)
	end)
	
	-- 添加事件监听器对象到事件管理器中
	cc.Director:getInstance():getEventDispatcher():addEventListenerWithFixedPriority(listener, 1)

```

### 回调函数参数说明

回调函数都会接收一个类型是*Event*的参数。  
关于自定义事件的用法，请参考*CCEventDispatcher.h*和*CCEventCustom.h*。  

### 触发自定义事件

```lua 
	-- 分发事件  
	 cc.Director:getInstance():getEventDispatcher():dispatchCustomEvent("MY_CUSTOM_EVENT", {name = "MY_CUSTOM_EVENT"})
```


## 加速计事件

### 添加事件监听器

```lua
	-- 创建事件监听器对象
	local listener = cc.EventListenerAcceleration:create(function(event)
		print(tolua.type(event))
		dump(event)
	end)

	-- 添加事件监听器对象到事件管理器中
	local eventDispatcher = cc.Director:getInstance():getEventDispatcher()
    eventDispatcher:addEventListenerWithFixedPriority(listener, 1)
```

### 回调函数参数说明

回调函数接收一个加速计事件的信息对象。详细请参考**CCEventListenerAcceleration.h**文件。


## 键盘事件

### 添加事件监听器

```lua
	-- 创建事件监听器对象
	local listener = cc.EventListenerKeyboard:create()
	
	listener:registerScriptHandler(function(keycode, eventKeyboard)
		print("键盘按下", keycode, cc.KeyCode.KEY_R)
		return true  
	end, cc.Handler.EVENT_KEYBOARD_PRESSED)
	listener:registerScriptHandler(function(keycode, eventKeyboard)
		print("键盘松开" .. keycode, cc.KeyCodeKey[keycode + 1])
	end, cc.Handler.EVENT_KEYBOARD_RELEASED)
	
	-- 添加事件监听器对象到事件管理器中
	local eventDispatcher = cc.Director:getInstance():getEventDispatcher()
    eventDispatcher:addEventListenerWithFixedPriority(listener, 1)
```

### 回调函数参数说明

每个回调函数都会接收两个参数，类型分别是*cc.KeyCode*和*cc.EeventKeyboard*。  

- **cc.KeyCode：**源码在Cocos2dConstants.lua内，表示的是Cocos2d官方定义的按键编号。  
- **cc.EeventKeyboard：**源码在CCEeventKeyboard.h内，主要是跟事件相关的信息。


## 鼠标事件

### 添加事件监听器

```lua

	-- 创建事件监听器对象
	local listener = cc.EventListenerMouse:create()

	-- 事件类型
	-- cc.Handler.EVENT_MOUSE_DOWN
	-- cc.Handler.EVENT_MOUSE_UP
	-- cc.Handler.EVENT_MOUSE_MOVE
	-- cc.Handler.EVENT_MOUSE_SCROLL
	
	listener:registerScriptHandler(function(eventMouse)
		print("鼠标按键按下")
	end, cc.Handler.EVENT_MOUSE_DOWN)
	listener:registerScriptHandler(function(eventMouse)
		print("鼠标按键释放")
	end, cc.Handler.EVENT_MOUSE_UP)
	listener:registerScriptHandler(function(eventMouse)
		print("鼠标移动")
	end, cc.Handler.EVENT_MOUSE_MOVE)
	listener:registerScriptHandler(function(eventMouse)
		print("鼠标滚轮滚动")
	end, cc.Handler.EVENT_MOUSE_SCROLL)
	
	-- 添加事件监听器对象到事件管理器中
	local eventDispatcher = cc.Director:getInstance():getEventDispatcher()
    eventDispatcher:addEventListenerWithFixedPriority(listener, 1)

```

### 回调函数参数说明

每个回调函数都会接收一个参数类型是*cc.EventMouse*的参数。  
  
- **cc.EventMouse：**源码在CCEeventMouse.h内，主要是跟事件相关的信息。
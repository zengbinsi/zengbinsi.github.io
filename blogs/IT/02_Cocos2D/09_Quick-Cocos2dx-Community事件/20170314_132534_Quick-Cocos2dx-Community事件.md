# Quick-Cocos2dx-Community事件

## 事件类型



## 单点touch事件

### 添加事件监听器

### 回调函数参数说明



## 多点touch事件

### 添加事件监听器

### 回调函数参数说明



## 自定义事件

### 添加事件监听器

### 回调函数参数说明

### 触发自定义事件



## 加速计事件

### 添加事件监听器

### 回调函数参数说明




## 键盘事件

### 添加事件监听器

### 回调函数参数说明




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
	
	listener:registerScriptHandler(function(event)
		print("鼠标按键按下")
	end, cc.Handler.EVENT_MOUSE_DOWN)
	listener:registerScriptHandler(function(event)
		print("鼠标按键释放")
	end, cc.Handler.EVENT_MOUSE_UP)
	listener:registerScriptHandler(function(event)
		print("鼠标移动")
	end, cc.Handler.EVENT_MOUSE_MOVE)
	listener:registerScriptHandler(function(event)
		print("鼠标滚轮滚动")
	end, cc.Handler.EVENT_MOUSE_SCROLL)
	
	-- 添加事件监听器对象到事件管理器中
	local eventDispatcher = cc.Director:getInstance():getEventDispatcher()
    eventDispatcher:addEventListenerWithFixedPriority(listener, 1)

```

### 回调函数参数说明

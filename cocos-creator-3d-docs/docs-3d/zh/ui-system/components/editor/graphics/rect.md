# rect

`rect()` 方法创建矩形。

| 参数 |   描述
| -------------- | ----------- |
|x | 矩形左下点的 x 坐标。
|y | 矩形左下点的中心的 y 坐标。
|width | 矩形的宽度。
|height | 矩形的高度。

## 实例

```javascript
var ctx = node.getComponent(cc.GraphicsComponent);
ctx.rect(20,20,150,100);
ctx.stroke();
```

<a href="rect.png"><img src="rect.png"></a>

```javascript
var ctx = node.getComponent(cc.GraphicsComponent);

// 红色矩形
ctx.lineWidth = 6;
ctx.strokeColor = cc.Color.RED;
ctx.rect(5,5,290,140);
ctx.stroke();

// 绿色矩形
ctx.lineWidth=4;
ctx.strokeColor = cc.Color.GREEN;
ctx.rect(30,30,50,50);
ctx.stroke();

// 蓝色矩形
ctx.lineWidth = 10;
ctx.strokeColor = cc.Color.BLUE;
ctx.rect(50,50,150,80);
ctx.stroke();
```

<a href="rect2.png"><img src="rect2.png"></a>

<hr>

返回 [绘图组件](index.md)

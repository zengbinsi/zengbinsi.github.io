# moveTo

`moveTo` 表示一条路径的起点。

| 参数 |   描述
| -------------- | ----------- |
| x | 路径的目标位置的 x 坐标
| y | 路径的目标位置的 y 坐标

## 实例

```javascript
var ctx = node.getComponent(cc.GraphicsComponent);
ctx.moveTo(0,0);
ctx.lineTo(300,150);
ctx.stroke();
```

<a href="moveTo.png"><img src="moveTo.png"></a>

<hr>

返回 [绘图组件](index.md)

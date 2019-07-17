# lineWidth

`lineWidth()` 方法添加一个新点，然后创建从该点到画布中最后指定点的线条。

| 参数 |   描述
| -------------- | ----------- |
|number | 当前线条的宽度，以像素计。

## 实例

```javascript
var ctx = node.getComponent(cc.GraphicsComponent);
ctx.lineWidth = 20;
ctx.rect(20,20,80,100);
ctx.stroke();
```

<a href="lineWidth.png"><img src="lineWidth.png"></a>

<hr>

返回 [绘图组件](index.md)

# 球面光（Sphere Light）

Cocos Creator 3D 中使用球面光替代 **点光源（Point Light）**，因为真实世界中的物理光源都具有光源大小属性。

![sphere light](sphere-light.jpg)

| 参数名称 | 说明 |
|:-------:|:---:|
| Color | 光源颜色 |
| UseColorTemperature | 是否启用色温 |
| ColorTemperature | 色温 |
| Size | 光源大小 |
| Range | 光照影响范围 |
| Term | 选用的光照强度单位术语<br>球面光支持两种单位制系统：**发光功率（LUMINOUS_POWER）** 和 **亮度（LUMINANCE）** |
| LuminousPower | 发光功率，单位**流明（*lm*）**<br>当 Term 指定为 LUMINOUS_POWER 时，选用流明来表示光照强度 |
| Luminance | 亮度，单位**坎德拉每平方米（*cd/m<sup>2</sup>*）**<br>当 Term 指定为 LUMININANCE 时，选用亮度来表示光照强度 |

---

继续前往 [聚光灯](spot-light.md) 说明文档。

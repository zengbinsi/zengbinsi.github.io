# 定制项目构建流程

## 自定义发布模版

Cocos Creator 3D 支持对每个项目分别定制发布模板，只需要在项目路径下添加一个 `build-templates` 目录，里面按照平台路径划分子目录，然后里面的所有文件在构建结束后都会自动按照对应的目录结构复制到构建出的工程里。

结构类似：

```
project-folder
 |--assets
 |--build
 |--build-templates
      |--web-mobile
            |--index.html
```

这样如果当前构建的平台是 `web-mobile` 的话，那么 `build-templates/web-mobile/index.html` 就会在构建后被拷贝到对应构建任务文件夹下。
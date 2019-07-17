# 声音资源

声音资源就是音频文件<br>
对于声音系统来说，其接口主要面向两种需求：长度较长的音乐，长度短的音效。<br>
但对于声音资源来说，两者并没有区别，所有的音频资源在导入编辑器之后，AudioClip 资源通过 AudioSourceComponent 声音系统组件来进行相关的音频操作。关于声音系统的使用，请参考： [声音系统](../audio-system/overview.md)

## 支持的声音资源的格式

目前引擎的音频系统已经能够支持 web 原生支持的格式：
- .ogg
- .mp3
- .wav
- .mp4
- .m4a

## 声音资源的使用

在节点上添加了 AudioSourceComponent 组件之后，将导入的声音资源从 `资源管理器` 中 拖动到节点AudioSourceComponent组件的 `Clip` 中即可对该声音资源进行控制：

![](audio/audiocilp.gif)
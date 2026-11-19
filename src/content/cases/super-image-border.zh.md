---
project: super-image-border
locale: zh
---
## 从单张照片到完整编辑流程

灵感边框 2.0 是一个 Kotlin / Jetpack Compose 原生 Android 应用。它将模板、画布比例、边框、文字、EXIF 元数据、水印和色彩整理为七组工具，在本地完成编辑，不需要账号。

应用提供八类、三十二款原创模板。EXIF 可自动读取，也允许逐字段覆盖或隐藏；文字、标志与水印作为独立图层调整。重点是让这些能力共享同一套场景描述，而不是各自处理一份图片。

<figure class="case-screenshot">
  <img src="/images/photo-frame-zh.webp" width="528" height="1147" alt="灵感边框编辑器，显示照片预览、模板与编辑工具" loading="lazy" decoding="async">
  <figcaption>原生 Android 编辑器的界面快照。示例图片来自公开仓库。</figcaption>
</figure>

## 预览与导出共享场景

移动端需要轻量预览，导出则需要保留原始尺寸。应用使用共享场景模型描述画布、图层和元数据，在预览阶段缩小工作图，在 SDR 原图导出时结合分区解码与条带编码控制内存。

导出链路提供 JPEG、PNG 和与实际输出相匹配的 ICC 色彩配置。Android 14 及以上设备的 Ultra HDR 支持有明确条件：色彩调整、图像切分等模式与设备内存会影响可用能力，不能把它概括为任意操作下都保留 HDR。

## 本地状态与任务管理

Room 管理草稿、预设与导出任务，DataStore 保存设置。编辑支持撤销、重做，批量导出采用串行队列，并提供暂停、继续和失败重试。原图只读，输出默认清除 GPS 与设备序列号。

公开仓库包含 2.0 版原生应用源码、应用测试和设备验收记录。

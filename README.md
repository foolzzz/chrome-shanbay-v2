# chrome-shanbay-v2

> shanbay chrome 网页查单词插件

是 [jinntrance/shanbay-crx](https://github.com/jinntrance/shanbay-crx) 的重构版

Chrome 商店地址：https://chrome.google.com/webstore/detail/%E6%89%87%E8%B4%9D%E5%8A%A9%E6%89%8Bv2/pkibohmmnmpgbnaoappgndlfncanookc


## 提供的功能
- 单词双击选中自动弹出释义
- 选中之后右键菜单查词
- 可供选择中英文释义
- 角标上显示今天还有多少单词需要背，这个是在扇贝网设置的
- 有定时提醒，默认3小时一次，提醒你非常丑，该背单词了😂
- 如果查询的是新词，会有一个添加的按钮，用来添加到单词本里。如果已经在你的单词本里，会有一个按钮叫我忘了，点击一下相当于把单词的熟悉度重置里，以后还得背的意思
- 登录之后点击插件图标，显示的背单词和批量添加生词的两个按钮，顾名思义咯。这功能是扇贝做的，按钮就是一扇贝网的链接。
- 由于内核相同，这个插件也可以在360极速浏览器、QQ浏览器上使用。~~由于某些不可描述的原因，你可以去[这里](https://github.com/maicss/chrome-shanbay-v2/releases)下载crx包，然后拖到扩展管理界面就行了。2010年开始，Chrome加强了限制，只能在开发模式这样使用插件，不推荐下载crx包，而且也不会更新crx包了~~。**2023年更新：推荐使用 Edge 浏览器，可以无障碍打开 Chrome 商店安装插件。**



## 已知的问题

- 有些词语的释义渲染的很差。这个锅主要由扇贝的API来背……
- 网页中嵌套iframe的时候，不能正确触发事件。这个不打算处理。
- 在input和textarea里面双击的时候，能查询单词，但是弹出框的定位是在页面的左上角。这个也不打算处理。



## 更新记录：
- 2018年之前，使用的是扇贝开放API。~~虽然没有官方自己用的库全，API更好用~~
- 2020.10 扇贝关闭了原来的2.0API，使用了新的3.0API，插件改成直接调官方未开放的API。
- 2021.6 扇贝修改查不到单词的API，导致未找到单词没有正确渲染结果，修改了一点样式。
- 2023.2 更新到 Chrome manifest v3，修改一个小 BUG。

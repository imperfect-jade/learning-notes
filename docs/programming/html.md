
# 一、HTML 概述
- HTML（HyperText Markup Language）即超文本标记语言，是用于创建网页的标准标记语言
- 它不是编程语言，而是一种标记语言，通过标记标签来描述网页内容
- 超文本的含义：可以包含文本、图片、链接、音频、视频等多种内容

HTML文档有固定的基础结构，所有网页内容都基于此展开：
```html
<!DOCTYPE html> <!-- 声明文档类型为HTML5 -->
<html lang="zh-CN"> <!-- 根标签，lang属性定义页面语言为中文 -->
<head>
    <meta charset="UTF-8"> <!-- 设置字符编码为UTF-8，避免中文乱码 -->
    <title>我的第一个HTML页面</title> <!-- 页面标题，显示在浏览器标签栏 -->
</head>
<body>
    <!-- 页面的可见内容都写在body标签内 -->
    <h1>欢迎学习HTML</h1>
    <p>这是我的第一个HTML段落。</p>
</body>
</html>
```
各部分说明：
- `<!DOCTYPE html>`：必须放在文档最开头，告诉浏览器这是HTML5文档
- `<html>`：整个HTML页面的根元素，所有其他标签都嵌套在其中
- `<head>`：包含页面的元数据（如编码、视口、标题），这些内容不会在页面中直接显示
- `<body>`：包含网页的所有可见内容，是用户能看到的部分

# 二、HTML 核心语法
## 1. HTML 标签（元素）
HTML使用**标签**来标记内容，分为两类：
- 双标签（闭合标签）：由开始标签和结束标签组成，内容嵌套在中间，例如：
  ```html
  <p>这是一个段落</p>
  <h2>这是二级标题</h2>
  ```
- 单标签（自闭合标签）：没有结束标签，通常用于插入内容或执行特定功能，例如：
  ```html
  <br> <!-- 换行 -->
  <hr> <!-- 水平线 -->
  <img src="image.jpg" alt="示例图片"> <!-- 插入图片 -->
  ```

### 常用基础HTML标签

| 标签 | 说明 | 示例 |
| --- | --- | --- |
| `<h1>`-`<h6>` | 标题标签，h1最大，h6最小，一个页面建议只使用一个h1 | `<h1>主标题</h1>` |
| `<p>` | 段落标签，用于定义段落，自动在段落前后添加空白 | `<p>这是一个普通段落</p>` |
| `<a>` | 链接标签，用于创建超链接 | `<a href="https://www.baidu.com">百度</a>` |
| `<img>` | 图片标签，用于插入图片 | `<img src="dog.jpg" alt="小狗">` |
| `<br>` | 换行标签，强制换行 | `这是第一行<br>这是第二行` |
| `<hr>` | 水平线标签，在页面中插入一条水平线 | `<hr>` |
| `<strong>` | 加粗文本，强调内容（语义化） | `<strong>重要内容</strong>` |
| `<em>` | 斜体文本，强调内容（语义化） | `<em>需要强调的内容</em>` |

## 2. HTML 属性
属性是HTML标签的附加信息，用于修改标签的行为或提供额外数据，语法规则：
- 属性写在开始标签的内部，以`属性名="属性值"`的形式存在
- 一个标签可以同时拥有多个属性，用空格分隔
- 属性值推荐使用双引号包裹（单引号也可，无空格时甚至可以省略，但不推荐）
示例：
```html
<a href="https://www.runoob.com" target="_blank">访问菜鸟教程</a>
<!-- href：链接地址；target="_blank"：在新窗口打开链接 -->
<img src="cat.png" alt="猫咪图片" width="200" height="150">
<!-- src：图片路径；alt：图片加载失败时的替代文本；width/height：图片尺寸 -->
```

## 3. HTML 注释
注释用于在代码中添加说明，不会在页面中显示，语法：
```html
<!-- 这是一行HTML注释 -->
<!-- 
这是多行HTML注释
可以写多行内容
-->
```
注释的作用：
- 标注代码功能，方便自己或他人后续理解
- 临时注释掉不需要显示的内容，便于调试
- 
---

## 4.HTML 头部（`<head>`）元素
`<head>`标签包含页面的**元数据（Metadata）**，是浏览器、搜索引擎读取的核心配置信息，不会直接显示在页面可见区域，但决定了页面的编码规范、渲染方式、SEO表现等关键特性。

### 核心头部元素

| 元素 | 核心作用 | 必要性 |
| --- | --- | --- |
| `<title>` | 定义页面标题，显示在浏览器标签栏 | 必选 |
| `<meta>` | 提供编码、视口、SEO等元信息 | 必选（至少包含字符编码设置） |
| `<link>` | 引入外部资源（CSS样式、网站图标等） | 可选（使用外部资源时需要） |
| `<style>` | 定义页面内部CSS样式 | 可选 |
| `<script>` | 定义或引入JavaScript脚本 | 可选 |
| `<base>` | 设置所有相对链接的基准URL | 可选 |

####  `<title>`：页面标题标签
- **核心价值**：唯一显示在浏览器标签栏的文本，是搜索引擎判断页面主题的核心依据之一
- **语法规则**：
  ```html
  <title>页面核心主题 - 站点/笔记名称</title>
  ```
  - 长度控制在30-60字符之间，避免被搜索引擎截断
  - 包含核心关键词，同时保持可读性（如：`HTML头部元素 - 菜鸟教程学习笔记`）
  - 每个页面标题需唯一，避免重复

#### `<meta>`：元信息标签
`<meta>`是单标签，通过`name`/`http-equiv`和`content`属性定义不同类型的元数据，常见用法如下：
（1）字符编码设置（必选）
确保页面文字无乱码，必须放在`<head>`最顶部：
```html
<meta charset="UTF-8">
```

（2）移动端视口设置（必选，适配手机/平板）
控制页面在移动设备上的渲染方式，解决移动端页面缩放、布局错乱问题：
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
```
属性说明：
- `width=device-width`：页面宽度等于设备屏幕宽度
- `initial-scale=1.0`：初始缩放比例为100%
- `maximum-scale=1.0`：禁止用户放大页面
- `user-scalable=no`：禁止用户手动缩放

（3）SEO相关元信息
帮助搜索引擎抓取和理解页面内容，提升搜索排名：
```html
<!-- 页面核心关键词，逗号分隔，不超过5个核心词 -->
<meta name="keywords" content="HTML头部,元信息,SEO优化">
<!-- 页面描述，100-150字符，概括页面核心内容 -->
<meta name="description" content="本文是基于菜鸟教程的HTML头部元素学习笔记，包含meta、link、script等核心标签用法">
<!-- 页面作者信息 -->
<meta name="author" content="你的名字">
```

####  `<link>`：外部资源引入标签
主要用于引入CSS样式表和网站图标，核心属性：

| 属性 | 作用 |
| --- | --- |
| `rel` | 定义资源与页面的关系（如`stylesheet`表示样式表，`icon`表示图标） |
| `href` | 指定资源的URL路径（支持本地相对路径或CDN远程路径） |
| `type` | 资源的MIME类型（可选，现代浏览器可自动识别） |

（1）引入外部CSS文件
```html
<!-- 引入本地CSS文件，相对路径适配Obsidian笔记结构 -->
<link rel="stylesheet" href="../CSS学习/style.css">
<!-- 引入CDN上的公共CSS框架 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
```

（2）设置网站图标
```html
<!-- 标准桌面端图标 -->
<link rel="icon" href="favicon.ico" type="image/x-icon">
<!-- 苹果设备专用图标 -->
<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">
```

#### `<style>`：内部样式标签
用于在页面内嵌入CSS样式，适合单个页面的专属样式定义：
```html
<head>
    <style>
        /* 给所有h2标签设置蓝色字体和底部边框 */
        h2 {
            color: #0066cc;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
        }
        /* 给类名为tip的提示框设置背景色 */
        .tip {
            background-color: #f0f8ff;
            padding: 10px;
            border-radius: 4px;
        }
    </style>
</head>
```
- 注意：内部样式仅作用于当前页面，多页面共享样式建议使用外部CSS文件

#### `<script>`：脚本标签
用于定义或引入JavaScript代码，有两种使用方式：

（1）内部脚本
直接在页面内编写JavaScript代码：
```html
<head>
    <script>
        // 页面加载完成后弹出提示
        window.onload = function() {
            alert("HTML头部元素笔记加载完成！");
        }
    </script>
</head>
```

（2）外部脚本
引入外部JavaScript文件，推荐用于复杂逻辑代码（便于复用和维护）：
```html
<!-- 常规引入：页面加载到此处时立即下载并执行脚本 -->
<script src="../js/main.js"></script>
<!-- async：异步下载脚本，下载完成后立即执行（不保证顺序），适合独立脚本如统计代码 -->
<script src="../js/analytics.js" async></script>
<!-- defer：异步下载脚本，页面解析完成后再执行（保证顺序），适合依赖DOM的交互逻辑 -->
<script src="../js/app.js" defer></script>
```

#### `<base>`：基准链接标签
设置页面所有相对链接的默认基准URL，整个页面只能有一个`<base>`标签：
```html
<head>
    <!-- 所有相对链接都会自动拼接成https://www.example.com/xxx -->
    <base href="https://www.example.com/" target="_blank">
</head>
<body>
    <!-- 实际跳转地址为https://www.example.com/about.html -->
    <a href="about.html">关于我们</a>
</body>
```

---
## 4. HTML 链接（`<a>`标签）
`<a>`标签是实现页面跳转、资源访问的核心标签，支持多种链接场景，以下是完整用法说明：

###  基本语法
```html
<a href="目标地址" 附加属性="属性值">链接显示内容</a>
```

### 核心属性详解
| 属性名 | 作用 | 常用取值/示例 |
| --- | --- | --- |
| `href` | 必须属性，指定链接目标 | 外部URL：`https://www.runoob.com`；内部页面路径：`notes/html基础.html`；锚点：`#section1`；特殊协议：`mailto:xxx@mail.com` |
| `target` | 指定链接打开位置 | `_blank`（新窗口打开，需配合`rel`提升安全性）、`_self`（当前窗口，默认值）、`_parent`（父框架）、`_top`（顶级框架） |
| `download` | 触发文件下载，可指定下载文件名 | `<a href="report.pdf" download="学习报告.pdf">下载报告</a>` |
| `rel` | 定义页面与目标链接的关系，用于SEO和安全 | `noopener noreferrer`（防止新页面窃取当前页面控制权，搭配`_blank`使用）、`nofollow`（告诉搜索引擎不要追踪此链接） |

### 常见链接类型示例
- **外部链接**：跳转至其他网站，需填写完整URL
  ```html
  <a href="https://www.runoob.com/html/html-tutorial.html" target="_blank" rel="noopener noreferrer">菜鸟教程HTML专区</a>
  ```
- **内部链接**：跳转至当前Obsidian vault内的笔记，使用相对路径或Obsidian内部链接格式
  ```html
  <a href="../CSS学习.md">跳转至CSS学习笔记</a>
  ```
- **锚点链接**：实现页面内或跨页面的精准定位
  ```html
  <!-- 跳转到当前页面id为"语法总结"的位置 -->
  <a href="#语法总结">快速查看语法总结</a>
  <!-- 跳转到HTML进阶笔记的"表单设计"章节 -->
  <a href="HTML进阶.md#表单设计">查看表单设计内容</a>
  <!-- 定义锚点：给目标元素添加id属性 -->
  <h3 id="语法总结">HTML语法总结</h3>
  ```
- **特殊功能链接**：触发系统原生功能
  ```html
  <a href="mailto:example@test.com?subject=HTML学习疑问&body=我在学习中遇到了以下问题：">发送学习疑问邮件</a>
  <a href="tel:13800138000">拨打客服电话</a>
  ```

---
## 5. 文本格式化
HTML提供两类文本格式化标签：**语义化标签**（带明确含义，利于SEO和无障碍访问）和**非语义化标签**（仅用于样式控制），推荐优先使用语义化标签。

### 语义化文本格式化标签
| 标签             | 语义含义                  | 示例代码                                                 | 显示效果                       |
| -------------- | --------------------- | ---------------------------------------------------- | -------------------------- |
| `<strong>`     | 强调重要内容（优先级最高）         | `<strong>警告：此操作不可逆</strong>`                         | **警告：此操作不可逆**              |
| `<em>`         | 强调内容（语气/逻辑上的强调）       | `<em>重点掌握标签嵌套规则</em>`                                | *重点掌握标签嵌套规则*               |
| `<mark>`       | 标记高亮文本（用于突出重点）        | `考试重点：<mark>HTML文档结构</mark>`                         | 考试重点：<mark>HTML文档结构</mark> |
| `<del>`        | 表示已删除的内容              | `<del>原价：99元</del>`                                  | ~~原价：99元~~                 |
| `<ins>`        | 表示新增/插入的内容            | `<ins>现价：59元</ins>`                                  | <ins>现价：59元</ins>          |
| `<sup>`        | 上标文本（用于公式、脚注）         | `勾股定理：a<sup>2</sup>+b<sup>2</sup>=c<sup>2</sup>`     | 勾股定理：a²+b²=c²              |
| `<sub>`        | 下标文本（用于化学分子式、注释）      | `水的分子式：H<sub>2</sub>O`                               | 水的分子式：H₂O                  |
| `<blockquote>` | 长引用文本（默认缩进显示）         | `<blockquote>学而时习之，不亦说乎？——《论语》</blockquote>`         | （显示为缩进的引用块）                |
| `<code>`       | 表示计算机代码片段（默认等宽字体）     | `<code>&lt;html&gt;是HTML的根标签</code>`                 | `<html>是HTML的根标签`          |
| `<pre>`        | 保留文本格式（空格、换行），常用于展示代码 | `<pre>function hello() { console.log("Hi"); }</pre>` | （保留代码的换行和缩进格式）             |

以下标签无明确语义，仅改变文本外观，建议优先用CSS替代：
- `<b>`：加粗文本
- `<i>`：斜体文本
- `<u>`：下划线文本


# 语法注意事项
- 标签不区分大小写，例如`<P>`和`<p>`效果相同，但**推荐使用小写**，符合W3C标准
- 所有双标签必须正确闭合，避免出现标签嵌套错误（如`<p><h1>错误</p></h1>`）
- 属性值尽量使用双引号包裹，提升代码可读性和规范性
- HTML对缩进和换行不敏感，但合理的缩进可以让代码结构更清晰，便于维护
- 特殊字符需要使用转义字符，例如空格用`&nbsp;`，小于号`<`用`&lt;`，大于号`>`用`&gt;`


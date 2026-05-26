<!-- learning-notes
course: HTML 教程
textbook: 未指定
style: tutorial
source_policy: references-section
last_updated: 2026-05-25
-->

# HTML 教程

HTML（HyperText Markup Language，超文本标记语言）用于描述网页结构。它不是编程语言，而是用标签告诉浏览器：这里是标题、段落、链接、图片、表格、表单或页面区域。

学习目标：

- 能写出完整 HTML5 页面结构。
- 能正确使用常见标签和属性。
- 能用语义化标签组织页面。
- 能创建链接、图片、表格、表单、媒体内容。
- 能把 HTML 与 CSS、JavaScript 连接起来。
- 能写出清晰、可维护、适合发布的网页代码。

## 一、HTML 基础认识

### 1. HTML 负责什么

HTML 负责网页的“结构”和“内容语义”。

| 技术 | 作用 | 示例 |
|---|---|---|
| HTML | 定义内容结构 | 标题、段落、图片、表单 |
| CSS | 控制视觉样式 | 颜色、布局、字体、动画 |
| JavaScript | 控制交互逻辑 | 点击事件、表单校验、动态数据 |

最小示例：

```html
<h1>我的网页</h1>
<p>这是一个段落。</p>
<a href="https://www.runoob.com">学习 HTML</a>
```

### 2. 超文本是什么

“超文本”表示网页不只包含普通文字，还可以包含：

- 链接：跳转到其他页面或位置。
- 图片、音频、视频：展示多媒体内容。
- 表单：收集用户输入。
- 脚本和样式：实现交互与视觉效果。

示例：

```html
<p>
  查看
  <a href="https://www.runoob.com/html/html-tutorial.html">HTML 教程</a>
  学习网页结构。
</p>
```

### 3. HTML 文件后缀

HTML 文件通常使用 `.html` 后缀。

```text
index.html
about.html
contact.html
```

说明：

- `.html` 和 `.htm` 都可以表示 HTML 文件。
- 现代项目中推荐统一使用 `.html`，命名清晰且一致。

## 二、HTML5 页面骨架

### 1. 标准结构

用途：每个 HTML 页面都应从一个清晰的文档结构开始。

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>我的第一个 HTML 页面</title>
</head>
<body>
  <h1>欢迎学习 HTML</h1>
  <p>这是我的第一个段落。</p>
</body>
</html>
```

结构说明：

| 部分 | 作用 |
|---|---|
| `<!DOCTYPE html>` | 声明当前文档使用 HTML5 标准 |
| `<html>` | HTML 根元素，包裹整个页面 |
| `lang="zh-CN"` | 声明页面主要语言，利于搜索和无障碍工具 |
| `<head>` | 页面元数据，不直接显示在页面主体中 |
| `<meta charset="UTF-8">` | 设置字符编码，避免中文乱码 |
| `<meta name="viewport">` | 移动端适配基础配置 |
| `<title>` | 浏览器标签页标题 |
| `<body>` | 用户可见的页面内容 |

### 2. `DOCTYPE`

用途：告诉浏览器用标准模式解析 HTML5。

```html
<!DOCTYPE html>
```

使用指南：

- 必须放在 HTML 文件第一行。
- 不需要结束标签。
- 写错或缺失可能导致浏览器进入兼容模式，页面显示异常。

### 3. 字符编码

用途：让中文和特殊字符正常显示。

```html
<meta charset="UTF-8">
```

使用指南：

- 推荐统一使用 `UTF-8`。
- 放在 `<head>` 前部，越早越好。

### 4. 移动端视口

用途：让页面在手机上按设备宽度显示，而不是被缩放成桌面宽度。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

说明：

- `width=device-width`：页面宽度等于设备宽度。
- `initial-scale=1.0`：初始缩放比例为 1。
- 不建议随意禁止用户缩放，会影响可访问性。

## 三、标签、元素与属性

### 1. 标签与元素

HTML 使用标签标记内容。由开始标签、内容和结束标签组成的整体叫元素。

```html
<p>这是一个段落。</p>
```

说明：

- `<p>` 是开始标签。
- `这是一个段落。` 是内容。
- `</p>` 是结束标签。
- 整体是一个段落元素。

### 2. 双标签

用途：包裹内容。

```html
<h1>一级标题</h1>
<p>段落内容</p>
<strong>重要内容</strong>
```

### 3. 单标签

用途：插入没有内部文本内容的元素。

```html
<br>
<hr>
<img src="cat.jpg" alt="猫">
<input type="text" name="username">
```

常见单标签：

| 标签 | 作用 |
|---|---|
| `<br>` | 换行 |
| `<hr>` | 分隔线 |
| `<img>` | 图片 |
| `<input>` | 输入控件 |
| `<meta>` | 元数据 |
| `<link>` | 外部资源引用 |

### 4. 属性

属性用于给标签提供附加信息。

```html
<a href="https://www.runoob.com" target="_blank" rel="noopener noreferrer">
  菜鸟教程
</a>
```

属性规则：

- 写在开始标签中。
- 使用 `属性名="属性值"`。
- 多个属性用空格分隔。
- 属性值推荐使用双引号。

### 5. 注释

用途：给代码添加说明，不会显示在页面中。

```html
<!-- 页面主标题 -->
<h1>HTML 教程</h1>

<!--
  多行注释：
  这里可以解释复杂结构。
-->
```

使用指南：

- 注释适合说明结构和意图。
- 不要在注释里保存密码、密钥、隐私信息。

## 四、标题与段落

### 1. 标题标签

用途：建立页面层级。

```html
<h1>页面主标题</h1>
<h2>章节标题</h2>
<h3>小节标题</h3>
```

使用指南：

- 一个页面建议只有一个 `<h1>`。
- 标题按层级使用，不要为了字体大小乱用标题。
- 标题对搜索引擎和屏幕阅读器都很重要。

### 2. 段落

用途：表示一段完整文字。

```html
<p>HTML 用标签描述网页内容。</p>
<p>浏览器读取 HTML 后，会把它渲染成网页。</p>
```

注意：

- HTML 会把连续空格、换行、制表符合并为一个空格。
- 需要保留格式时使用 `<pre>`。

### 3. 换行与分隔线

用途：在文本中强制换行或分隔内容。

```html
<p>第一行<br>第二行</p>
<hr>
<p>新的内容区域。</p>
```

使用指南：

- 普通段落分隔优先使用多个 `<p>`。
- `<br>` 适合地址、诗歌、短文本换行。
- `<hr>` 表示主题切换，不只是装饰线。

### 4. 预格式化文本

用途：保留空格和换行。

```html
<pre>
function hello() {
  console.log("Hello");
}
</pre>
```

搭配代码：

```html
<pre><code>const name = "HTML";</code></pre>
```

## 五、文本格式化

### 1. 语义化强调

用途：表达内容重要性或语气强调。

```html
<p><strong>重要：</strong>提交前请检查表单内容。</p>
<p>你需要<em>优先</em>完成 HTML 结构。</p>
```

说明：

- `<strong>` 表示重要内容，默认加粗。
- `<em>` 表示语气强调，默认斜体。
- 推荐优先使用语义化标签，而不是只追求视觉效果。

### 2. 常见文本标签

| 标签 | 语义 | 示例 |
|---|---|---|
| `<strong>` | 重要内容 | `<strong>警告</strong>` |
| `<em>` | 强调语气 | `<em>必须填写</em>` |
| `<mark>` | 高亮标记 | `<mark>关键词</mark>` |
| `<del>` | 删除内容 | `<del>原价 99 元</del>` |
| `<ins>` | 新增内容 | `<ins>现价 59 元</ins>` |
| `<sup>` | 上标 | `x<sup>2</sup>` |
| `<sub>` | 下标 | `H<sub>2</sub>O` |
| `<code>` | 行内代码 | `<code>npm install</code>` |

### 3. 特殊字符实体

用途：显示 HTML 语法字符或特殊符号。

```html
<p>&lt;html&gt; 是根元素。</p>
<p>Tom &amp; Jerry</p>
<p>版权符号：&copy;</p>
<p>连续空格：A&nbsp;&nbsp;B</p>
```

常见实体：

| 实体 | 显示 | 用途 |
|---|---|---|
| `&lt;` | < | 小于号 |
| `&gt;` | > | 大于号 |
| `&amp;` | & | 与号 |
| `&quot;` | " | 双引号 |
| `&apos;` | ' | 单引号 |
| `&nbsp;` | 不换行空格 | 保留空格 |
| `&copy;` | © | 版权符号 |

## 六、链接

### 1. 基本链接

用途：跳转到网页、文件或页面位置。

```html
<a href="https://www.runoob.com/html/html-tutorial.html">HTML 教程</a>
```

### 2. 新窗口打开

用途：打开外部链接时保留当前页面。

```html
<a href="https://www.runoob.com"
   target="_blank"
   rel="noopener noreferrer">
  菜鸟教程
</a>
```

使用指南：

- `target="_blank"` 表示新标签页打开。
- 外链新开时推荐加 `rel="noopener noreferrer"`，提升安全性。

### 3. 相对链接

用途：链接本站内页面或资源。

```html
<a href="about.html">关于我们</a>
<a href="../index.html">返回首页</a>
<a href="docs/guide.pdf">下载指南</a>
```

### 4. 锚点链接

用途：跳转到当前页面或其他页面的指定位置。

```html
<a href="#contact">跳转到联系方式</a>

<h2 id="contact">联系方式</h2>
```

跨页面锚点：

```html
<a href="guide.html#install">查看安装步骤</a>
```

### 5. 邮件和电话链接

用途：调用系统邮件客户端或拨号功能。

```html
<a href="mailto:example@test.com">发送邮件</a>
<a href="tel:13800138000">拨打电话</a>
```

带主题和正文：

```html
<a href="mailto:example@test.com?subject=HTML学习&body=我想咨询：">
  发送学习问题
</a>
```

## 七、图片与多媒体

### 1. 图片

用途：插入图片。

```html
<img src="images/cat.jpg" alt="一只猫">
```

常用属性：

| 属性 | 作用 |
|---|---|
| `src` | 图片路径 |
| `alt` | 图片无法显示时的替代文本，也利于无障碍访问 |
| `width` | 图片显示宽度 |
| `height` | 图片显示高度 |
| `loading="lazy"` | 懒加载图片，提升页面性能 |

示例：

```html
<img src="images/banner.jpg"
     alt="网站首页横幅"
     width="800"
     loading="lazy">
```

使用指南：

- 必须写有意义的 `alt`。
- 不建议只靠 HTML `width/height` 做复杂布局，样式交给 CSS。
- 图片文件名使用英文小写和连字符，例如 `product-card.jpg`。

### 2. 图片链接

用途：点击图片跳转。

```html
<a href="product.html">
  <img src="images/product.jpg" alt="查看产品详情">
</a>
```

### 3. 音频

用途：在网页中播放音频。

```html
<audio controls>
  <source src="audio/intro.mp3" type="audio/mpeg">
  您的浏览器不支持 audio 标签。
</audio>
```

### 4. 视频

用途：在网页中播放视频。

```html
<video controls width="640" poster="images/video-cover.jpg">
  <source src="video/demo.mp4" type="video/mp4">
  您的浏览器不支持 video 标签。
</video>
```

常用属性：

| 属性 | 作用 |
|---|---|
| `controls` | 显示播放控件 |
| `autoplay` | 自动播放，通常会受到浏览器限制 |
| `muted` | 静音 |
| `loop` | 循环播放 |
| `poster` | 视频封面 |

## 八、列表

### 1. 无序列表

用途：展示没有顺序要求的项目。

```html
<ul>
  <li>HTML</li>
  <li>CSS</li>
  <li>JavaScript</li>
</ul>
```

### 2. 有序列表

用途：展示步骤或排名。

```html
<ol>
  <li>创建 HTML 文件</li>
  <li>编写页面结构</li>
  <li>在浏览器中打开</li>
</ol>
```

### 3. 定义列表

用途：展示术语和解释。

```html
<dl>
  <dt>HTML</dt>
  <dd>用于描述网页结构的标记语言。</dd>
  <dt>CSS</dt>
  <dd>用于控制网页样式。</dd>
</dl>
```

### 4. 嵌套列表

用途：展示层级结构。

```html
<ul>
  <li>前端
    <ul>
      <li>HTML</li>
      <li>CSS</li>
    </ul>
  </li>
  <li>后端</li>
</ul>
```

## 九、表格

### 1. 基础表格

用途：展示二维数据。

```html
<table>
  <tr>
    <th>姓名</th>
    <th>年龄</th>
    <th>城市</th>
  </tr>
  <tr>
    <td>张三</td>
    <td>20</td>
    <td>北京</td>
  </tr>
  <tr>
    <td>李四</td>
    <td>22</td>
    <td>上海</td>
  </tr>
</table>
```

常用标签：

| 标签 | 作用 |
|---|---|
| `<table>` | 表格 |
| `<tr>` | 表格行 |
| `<th>` | 表头单元格 |
| `<td>` | 普通单元格 |
| `<caption>` | 表格标题 |
| `<thead>` | 表头区域 |
| `<tbody>` | 表格主体 |
| `<tfoot>` | 表尾区域 |

### 2. 语义化表格结构

用途：让表格更清晰，也便于样式控制和屏幕阅读器理解。

```html
<table>
  <caption>学生成绩表</caption>
  <thead>
    <tr>
      <th scope="col">姓名</th>
      <th scope="col">成绩</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>张三</td>
      <td>95</td>
    </tr>
    <tr>
      <td>李四</td>
      <td>88</td>
    </tr>
  </tbody>
</table>
```

### 3. 合并单元格

用途：让一个单元格跨多行或多列。

```html
<table>
  <tr>
    <th colspan="2">用户信息</th>
  </tr>
  <tr>
    <td>姓名</td>
    <td>张三</td>
  </tr>
  <tr>
    <td rowspan="2">联系方式</td>
    <td>phone: 13800138000</td>
  </tr>
  <tr>
    <td>email: demo@example.com</td>
  </tr>
</table>
```

说明：

- `colspan` 横向合并列。
- `rowspan` 纵向合并行。

## 十、区块与语义化布局

### 1. `div` 与 `span`

用途：通用容器，本身没有明确语义。

```html
<div class="card">
  <h2>卡片标题</h2>
  <p>卡片内容</p>
</div>

<p>价格：<span class="price">99 元</span></p>
```

说明：

- `<div>` 是块级容器，常用于布局。
- `<span>` 是行内容器，常用于包裹一小段文字。

### 2. HTML5 语义化标签

用途：用有意义的标签组织页面结构。

| 标签 | 作用 |
|---|---|
| `<header>` | 页眉或区域头部 |
| `<nav>` | 导航 |
| `<main>` | 页面主要内容 |
| `<section>` | 页面章节 |
| `<article>` | 独立文章或卡片内容 |
| `<aside>` | 侧边栏、补充内容 |
| `<footer>` | 页脚 |

示例：

```html
<header>
  <h1>学习笔记</h1>
  <nav>
    <a href="index.html">首页</a>
    <a href="html.html">HTML</a>
  </nav>
</header>

<main>
  <article>
    <h2>HTML 基础</h2>
    <p>HTML 用于描述网页结构。</p>
  </article>
</main>

<footer>
  <p>&copy; 2026 Learning Notes</p>
</footer>
```

### 3. 语义化布局建议

使用指南：

- 页面主体内容放入 `<main>`，每页通常只写一个 `<main>`。
- 导航链接放入 `<nav>`。
- 独立内容块使用 `<article>`。
- 普通主题分组使用 `<section>`。
- 不要把所有内容都写成 `<div>`。

## 十一、表单

### 1. 基础表单

用途：收集用户输入并提交。

```html
<form action="/submit" method="post">
  <label for="username">用户名</label>
  <input type="text" id="username" name="username">

  <button type="submit">提交</button>
</form>
```

核心属性：

| 属性 | 作用 |
|---|---|
| `action` | 表单提交地址 |
| `method` | 提交方法，常用 `get` 或 `post` |
| `name` | 表单字段名，提交数据时使用 |
| `id` | 页面内唯一标识，可与 `<label for="">` 关联 |

### 2. `label` 与输入框

用途：提升可点击区域和可访问性。

```html
<label for="email">邮箱</label>
<input type="email" id="email" name="email">
```

说明：

- `label` 的 `for` 值应等于输入框的 `id`。
- 点击文字“邮箱”也能聚焦到输入框。

### 3. 常见 input 类型

```html
<input type="text" name="nickname" placeholder="昵称">
<input type="password" name="password" placeholder="密码">
<input type="email" name="email" placeholder="邮箱">
<input type="number" name="age" min="0" max="120">
<input type="date" name="birthday">
<input type="file" name="avatar">
<input type="checkbox" name="agree" value="yes">
<input type="radio" name="gender" value="male">
```

### 4. 下拉框和多行文本

```html
<label for="city">城市</label>
<select id="city" name="city">
  <option value="">请选择</option>
  <option value="beijing">北京</option>
  <option value="shanghai">上海</option>
</select>

<label for="message">留言</label>
<textarea id="message" name="message" rows="4"></textarea>
```

### 5. 表单校验

用途：在浏览器端做基础输入校验。

```html
<form>
  <label for="email">邮箱</label>
  <input type="email" id="email" name="email" required>

  <label for="password">密码</label>
  <input type="password" id="password" name="password" minlength="8" required>

  <button type="submit">注册</button>
</form>
```

常用校验属性：

| 属性 | 作用 |
|---|---|
| `required` | 必填 |
| `minlength` | 最小长度 |
| `maxlength` | 最大长度 |
| `min`、`max` | 数值或日期范围 |
| `pattern` | 正则校验 |
| `placeholder` | 输入提示 |

### 6. GET 与 POST

| 方法 | 特点 | 适合场景 |
|---|---|---|
| `get` | 参数出现在 URL 中，可收藏，可缓存 | 搜索、筛选、分页 |
| `post` | 数据放在请求体中，不直接显示在 URL | 登录、注册、提交表单 |

```html
<form action="/search" method="get">
  <input type="search" name="q">
  <button type="submit">搜索</button>
</form>
```

```html
<form action="/login" method="post">
  <input type="text" name="username">
  <input type="password" name="password">
  <button type="submit">登录</button>
</form>
```

## 十二、HTML 头部

### 1. 常用 head 模板

用途：配置编码、移动端适配、标题、描述、样式和脚本。

```html
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="HTML 学习教程，包含常见标签与示例。">
  <title>HTML 教程</title>
  <link rel="stylesheet" href="styles.css">
  <script src="app.js" defer></script>
</head>
```

### 2. `title`

用途：定义浏览器标签页标题，也影响搜索结果展示。

```html
<title>HTML 基础教程 - 学习笔记</title>
```

使用指南：

- 每个页面的标题应唯一。
- 标题要能概括页面主题。

### 3. `meta`

用途：提供页面元信息。

```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="学习 HTML 页面结构、标签、表单与语义化。">
<meta name="author" content="imperfect-jade">
```

### 4. `link`

用途：引入外部资源，如 CSS 和网站图标。

```html
<link rel="stylesheet" href="styles.css">
<link rel="icon" href="favicon.ico">
```

### 5. `script`

用途：引入或编写 JavaScript。

```html
<script src="app.js" defer></script>
```

常用属性：

| 属性 | 作用 |
|---|---|
| `defer` | 脚本下载不阻塞 HTML 解析，HTML 解析完成后按顺序执行 |
| `async` | 异步下载，下载完立即执行，不保证顺序 |

使用指南：

- 普通页面脚本优先使用 `defer`。
- 统计脚本等独立脚本可用 `async`。

### 6. `base`

用途：设置页面相对链接的基准地址。

```html
<base href="https://example.com/docs/" target="_blank">
```

注意：

- 一个页面只能有一个 `<base>`。
- 使用后所有相对链接都会受影响，容易造成路径误判，谨慎使用。

## 十三、CSS 与 JavaScript 连接

### 1. 内联样式

用途：快速测试，不推荐大量使用。

```html
<p style="color: red;">这是一段红色文字。</p>
```

### 2. 内部样式

用途：当前页面少量专属样式。

```html
<style>
  body {
    font-family: Arial, sans-serif;
  }

  .tip {
    color: #0f766e;
    background: #ecfdf5;
  }
</style>
```

### 3. 外部样式

用途：多页面共享样式，推荐使用。

```html
<link rel="stylesheet" href="styles.css">
```

`styles.css` 示例：

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}

.card {
  border: 1px solid #ddd;
  padding: 16px;
}
```

### 4. 内部脚本

用途：少量页面交互。

```html
<button id="helloBtn">打招呼</button>

<script>
  const button = document.querySelector("#helloBtn");
  button.addEventListener("click", () => {
    alert("Hello, HTML!");
  });
</script>
```

### 5. 外部脚本

用途：复杂逻辑单独放入 JS 文件。

```html
<script src="app.js" defer></script>
```

`app.js` 示例：

```javascript
document.querySelector("#helloBtn").addEventListener("click", () => {
  alert("Hello, HTML!");
});
```

## 十四、iframe 与嵌入内容

### 1. iframe

用途：在当前页面嵌入另一个页面。

```html
<iframe
  src="https://www.runoob.com"
  title="菜鸟教程"
  width="800"
  height="400">
</iframe>
```

使用指南：

- 必须写 `title`，方便无障碍工具识别。
- 不要随意嵌入不可信页面。
- 有些网站会禁止被 iframe 嵌入。

### 2. 嵌入地图或视频

```html
<iframe
  src="https://www.example.com/embed/demo"
  title="示例嵌入内容"
  width="560"
  height="315"
  allowfullscreen>
</iframe>
```

## 十五、可访问性与 SEO

### 1. 图片替代文本

用途：图片加载失败或读屏软件访问时仍能理解内容。

```html
<img src="chart.png" alt="2026 年第一季度销售额柱状图">
```

使用指南：

- 装饰性图片可写 `alt=""`。
- 重要图片要描述信息，而不是只写“图片”。

### 2. 表单标签

用途：让输入框和说明文字关联。

```html
<label for="phone">手机号</label>
<input id="phone" name="phone" type="tel">
```

### 3. 按钮文本

用途：按钮文本要说明动作。

```html
<button type="submit">提交订单</button>
<button type="button">打开菜单</button>
```

不推荐：

```html
<button>点击这里</button>
```

### 4. 语义化结构

用途：让页面结构对人、搜索引擎、辅助技术都更清晰。

```html
<main>
  <article>
    <h1>HTML 教程</h1>
    <p>学习 HTML 的基本结构和常用标签。</p>
  </article>
</main>
```

### 5. SEO 基础

```html
<title>HTML 教程：从结构到表单</title>
<meta name="description" content="学习 HTML5 页面结构、常用标签、表格、表单与语义化布局。">
```

使用指南：

- 每页一个清晰主题。
- 标题和描述要准确，不堆砌关键词。
- 重要内容使用文本，不要全部做成图片。

## 十六、HTML 编写规范

### 1. 推荐小写标签和属性

```html
<p class="intro">推荐写法</p>
```

不推荐：

```html
<P CLASS="intro">不推荐写法</P>
```

### 2. 正确嵌套

推荐：

```html
<p>学习 <strong>HTML</strong> 基础。</p>
```

不推荐：

```html
<p>学习 <strong>HTML</p></strong>
```

### 3. 使用清晰缩进

```html
<main>
  <section>
    <h2>课程介绍</h2>
    <p>HTML 是网页结构的基础。</p>
  </section>
</main>
```

### 4. 属性值使用引号

推荐：

```html
<input type="text" name="username">
```

不推荐：

```html
<input type=text name=username>
```

### 5. 文件和路径命名

推荐：

```text
index.html
about-us.html
product-card.jpg
styles.css
```

使用指南：

- 使用英文小写。
- 单词之间用连字符 `-`。
- 避免空格、中文路径和特殊符号，减少部署问题。

## 十七、完整示例：个人介绍页面

### 1. 项目结构

```text
my-site/
  index.html
  styles.css
  images/
    avatar.jpg
```

### 2. `index.html`

```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="个人介绍页面示例，展示 HTML 常用结构。">
  <title>个人介绍页面</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <header>
    <h1>张三的个人主页</h1>
    <nav>
      <a href="#about">关于我</a>
      <a href="#skills">技能</a>
      <a href="#contact">联系我</a>
    </nav>
  </header>

  <main>
    <section id="about">
      <h2>关于我</h2>
      <img src="images/avatar.jpg" alt="张三的头像" width="160">
      <p>我正在学习 HTML、CSS 和 JavaScript。</p>
    </section>

    <section id="skills">
      <h2>技能</h2>
      <ul>
        <li>HTML 页面结构</li>
        <li>CSS 基础样式</li>
        <li>JavaScript 交互</li>
      </ul>
    </section>

    <section id="contact">
      <h2>联系我</h2>
      <form action="/contact" method="post">
        <label for="email">邮箱</label>
        <input type="email" id="email" name="email" required>

        <label for="message">留言</label>
        <textarea id="message" name="message" rows="4" required></textarea>

        <button type="submit">发送</button>
      </form>
    </section>
  </main>

  <footer>
    <p>&copy; 2026 张三</p>
  </footer>
</body>
</html>
```

### 3. `styles.css`

```css
body {
  margin: 0;
  font-family: system-ui, sans-serif;
  line-height: 1.6;
  color: #222;
}

header,
main,
footer {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
}

nav a {
  margin-right: 12px;
}

label {
  display: block;
  margin-top: 12px;
}

input,
textarea,
button {
  width: 100%;
  box-sizing: border-box;
  padding: 8px;
}

button {
  margin-top: 12px;
  cursor: pointer;
}
```

## 十八、常见问题与排错

### 1. 中文乱码

原因：字符编码未声明或文件编码不是 UTF-8。

处理：

```html
<meta charset="UTF-8">
```

同时确认编辑器保存编码为 UTF-8。

### 2. 图片不显示

常见原因：

- `src` 路径写错。
- 文件名大小写不一致。
- 图片没有放到项目目录。
- 浏览器无权访问本地绝对路径。

排查：

```html
<img src="images/demo.jpg" alt="示例图片">
```

检查：

```text
index.html
images/
  demo.jpg
```

### 3. 链接打不开

常见原因：

- `href` 写错。
- 相对路径层级错误。
- 外链缺少 `https://`。
- 锚点 id 不存在。

示例：

```html
<a href="https://www.runoob.com">正确外链</a>
<a href="#top">跳转到页面顶部</a>
<h1 id="top">页面顶部</h1>
```

### 4. 表单提交没有数据

原因：输入控件缺少 `name` 属性。

```html
<input type="text" name="username">
```

说明：

- `id` 用于页面内关联。
- `name` 用于提交表单数据。

### 5. 样式没有生效

常见原因：

- CSS 路径错误。
- 选择器写错。
- 样式被后面的规则覆盖。

检查：

```html
<link rel="stylesheet" href="styles.css">
```

## 十九、标签速查表

| 场景 | 标签 |
|---|---|
| 页面根元素 | `<html>` |
| 页面元数据 | `<head>` |
| 页面标题 | `<title>` |
| 可见内容 | `<body>` |
| 标题 | `<h1>` 到 `<h6>` |
| 段落 | `<p>` |
| 链接 | `<a>` |
| 图片 | `<img>` |
| 换行 | `<br>` |
| 分隔线 | `<hr>` |
| 无序列表 | `<ul>`、`<li>` |
| 有序列表 | `<ol>`、`<li>` |
| 表格 | `<table>`、`<tr>`、`<th>`、`<td>` |
| 表单 | `<form>` |
| 输入框 | `<input>` |
| 多行文本 | `<textarea>` |
| 下拉框 | `<select>`、`<option>` |
| 按钮 | `<button>` |
| 页面头部 | `<header>` |
| 导航 | `<nav>` |
| 主内容 | `<main>` |
| 章节 | `<section>` |
| 独立内容 | `<article>` |
| 侧边内容 | `<aside>` |
| 页脚 | `<footer>` |
| 音频 | `<audio>` |
| 视频 | `<video>` |
| 嵌入页面 | `<iframe>` |

## 二十、学习路线

### 1. 入门顺序

1. 掌握 HTML5 页面骨架。
2. 学会标题、段落、链接、图片。
3. 学会列表、表格、表单。
4. 使用语义化标签组织页面。
5. 连接 CSS 控制样式。
6. 连接 JavaScript 实现交互。
7. 学习可访问性、SEO 和代码规范。

### 2. 练习任务

- 写一个个人介绍页。
- 写一个课程表页面。
- 写一个登录表单。
- 写一个文章详情页。
- 写一个产品卡片列表。

### 3. 发布前检查清单

- [ ] 页面包含 `<!DOCTYPE html>`。
- [ ] `<html>` 写了 `lang`。
- [ ] `<head>` 中包含 `charset`、`viewport`、`title`。
- [ ] 页面只有一个主要 `<h1>`。
- [ ] 图片都写了 `alt`。
- [ ] 表单输入项有 `label` 和 `name`。
- [ ] 外链新开页面时使用 `rel="noopener noreferrer"`。
- [ ] 标签正确闭合和嵌套。
- [ ] 文件名和路径大小写一致。

## 参考资料

- 菜鸟教程 HTML 教程：<https://www.runoob.com/html/html-tutorial.html>

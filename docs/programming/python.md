<!-- learning-notes
course: Python 编程
textbook: Python编程：从入门到实践（第三版）
style: tool-docs
source_policy: references-section
last_updated: 2026-05-19
-->

# Python 编程笔记

这份笔记按“工具文档”方式组织：先给用途和规则，再给最小可运行示例。默认使用 Python 3，示例尽量保持短小、直接、可复制。

## 一、运行与项目环境

### 1. 运行脚本

用途：把 Python 代码保存为 `.py` 文件后用解释器执行。

```python
# hello.py
print("Hello, Python!")
```

```bash
python hello.py
```

### 2. 交互式解释器

用途：快速验证表达式、函数调用和小段逻辑。

```python
>>> 2 + 3
5
>>> "python".title()
'Python'
```

### 3. 虚拟环境

用途：为每个项目隔离依赖，避免不同项目的包版本互相影响。

```bash
python -m venv .venv
.\.venv\Scripts\activate
python -m pip install requests
```

### 4. 脚本入口

用途：让文件既可以被导入，也可以直接运行。

```python
def main():
    print("run as script")


if __name__ == "__main__":
    main()
```

## 二、变量与基本类型

### 1. 变量命名

规则：变量名用小写和下划线，表达含义，避免覆盖内置函数名。

```python
user_name = "Ada"
login_count = 3
print(user_name, login_count)
```

### 2. 字符串

用途：保存文本；常用方法包括大小写转换、去空格、查找和替换。

```python
name = "  ada lovelace  "
print(name.strip().title())      # Ada Lovelace
print(name.strip().replace("ada", "Ada"))
```

### 3. f-string 格式化

用途：把变量嵌入字符串，生成可读输出。

```python
language = "Python"
version = 3.12
print(f"{language} {version} is ready.")
```

### 4. 数字

用途：处理整数、浮点数和常见算术运算。

```python
total = 10 + 5
average = total / 2
power = 2 ** 3
print(total, average, power)
```

### 5. 布尔值与 None

用途：表示真假状态和“暂时没有值”。

```python
is_active = True
result = None

if is_active and result is None:
    print("waiting for result")
```

### 6. 类型转换

用途：把输入或数据转换成需要的类型。

```python
age_text = "20"
age = int(age_text)
print(age + 1)
```

## 三、容器类型

### 1. 列表 list

用途：保存有序、可变的一组元素。

```python
users = ["ada", "linus", "grace"]
users.append("guido")
print(users[0])
print(users[-1])
```

### 2. 切片

用途：从序列中取出一段，不修改原序列。

```python
numbers = [1, 2, 3, 4, 5]
print(numbers[1:4])   # [2, 3, 4]
print(numbers[:3])    # [1, 2, 3]
print(numbers[::2])   # [1, 3, 5]
```

### 3. 元组 tuple

用途：保存不希望被修改的有序数据。

```python
point = (3, 5)
x, y = point
print(f"x={x}, y={y}")
```

### 4. 字典 dict

用途：保存键值对，适合表示对象属性、配置、查找表。

```python
user = {"name": "Ada", "role": "admin"}
user["active"] = True
print(user["name"])
print(user.get("email", "not set"))
```

### 5. 集合 set

用途：去重和集合运算。

```python
tags = {"python", "web", "python"}
tags.add("data")
print(tags)
print("web" in tags)
```

### 6. 推导式

用途：用简洁表达生成列表、字典或集合。

```python
squares = [n ** 2 for n in range(1, 6)]
name_lengths = {name: len(name) for name in ["Ada", "Grace"]}
print(squares)
print(name_lengths)
```

## 四、流程控制

### 1. if 条件判断

用途：按条件执行不同分支。

```python
score = 86

if score >= 90:
    level = "A"
elif score >= 80:
    level = "B"
else:
    level = "C"

print(level)
```

### 2. for 循环

用途：遍历列表、字符串、字典等可迭代对象。

```python
for name in ["ada", "linus", "grace"]:
    print(name.title())
```

### 3. range

用途：生成整数序列，常用于循环计数。

```python
for number in range(1, 4):
    print(number)
```

### 4. enumerate

用途：遍历时同时拿到索引和值。

```python
tasks = ["read", "code", "test"]

for index, task in enumerate(tasks, start=1):
    print(f"{index}. {task}")
```

### 5. zip

用途：并行遍历多个序列。

```python
names = ["Ada", "Grace"]
scores = [95, 98]

for name, score in zip(names, scores):
    print(f"{name}: {score}")
```

### 6. while 循环

用途：在条件为真时重复执行。

```python
count = 3

while count > 0:
    print(count)
    count -= 1
```

### 7. break 与 continue

用途：提前结束循环或跳过本轮循环。

```python
for number in range(1, 8):
    if number == 3:
        continue
    if number == 6:
        break
    print(number)
```

## 五、函数

### 1. 定义函数

用途：把可复用逻辑封装成命名代码块。

```python
def greet(name):
    return f"Hello, {name.title()}!"


print(greet("ada"))
```

### 2. 默认参数

用途：为常用参数提供默认值。

```python
def make_profile(name, role="user"):
    return {"name": name, "role": role}


print(make_profile("Ada"))
print(make_profile("Grace", role="admin"))
```

### 3. 关键字参数

用途：调用时明确参数含义，减少顺序错误。

```python
def describe_pet(animal_type, name):
    print(f"{name} is a {animal_type}.")


describe_pet(name="Mimi", animal_type="cat")
```

### 4. 可变参数

用途：接收数量不固定的位置参数或关键字参数。

```python
def total(*numbers):
    return sum(numbers)


def build_user(**info):
    return info


print(total(1, 2, 3))
print(build_user(name="Ada", role="admin"))
```

### 5. 文档字符串

用途：说明函数行为，便于 `help()` 和编辑器提示。

```python
def fahrenheit_to_celsius(value):
    """Convert Fahrenheit temperature to Celsius."""
    return (value - 32) * 5 / 9


print(fahrenheit_to_celsius(68))
```

### 6. lambda

用途：定义短小的匿名函数，常用于排序键或简单转换。

```python
users = [{"name": "Ada", "score": 95}, {"name": "Grace", "score": 98}]
users.sort(key=lambda user: user["score"], reverse=True)
print(users)
```

## 六、模块与包

### 1. 导入模块

用途：复用标准库、第三方库或自己写的代码。

```python
import math

print(math.sqrt(16))
```

### 2. 从模块导入对象

用途：只导入需要的函数、类或常量。

```python
from pathlib import Path

path = Path("notes.txt")
print(path.suffix)
```

### 3. 自定义模块

用途：把函数拆到独立文件，保持主程序清晰。

```python
# helpers.py
def slugify(text):
    return text.lower().replace(" ", "-")
```

```python
# app.py
from helpers import slugify

print(slugify("Python Notes"))
```

## 七、类与面向对象

### 1. 定义类

用途：把数据和操作数据的方法组合在一起。

```python
class User:
    def __init__(self, name):
        self.name = name

    def greet(self):
        return f"Hello, {self.name.title()}!"


user = User("ada")
print(user.greet())
```

### 2. 实例属性

用途：保存每个对象自己的状态。

```python
class Counter:
    def __init__(self):
        self.value = 0

    def increment(self):
        self.value += 1


counter = Counter()
counter.increment()
print(counter.value)
```

### 3. 继承

用途：在已有类的基础上扩展行为。

```python
class Admin(User):
    def delete_user(self, user_name):
        return f"deleted {user_name}"


admin = Admin("grace")
print(admin.greet())
print(admin.delete_user("test"))
```

### 4. super

用途：在子类中复用父类初始化或方法逻辑。

```python
class PremiumUser(User):
    def __init__(self, name, level):
        super().__init__(name)
        self.level = level


premium = PremiumUser("ada", "gold")
print(premium.name, premium.level)
```

### 5. property

用途：把方法包装成只读或受控属性。

```python
class Rectangle:
    def __init__(self, width, height):
        self.width = width
        self.height = height

    @property
    def area(self):
        return self.width * self.height


rect = Rectangle(3, 4)
print(rect.area)
```

### 6. dataclass

用途：快速定义主要用于保存数据的类。

```python
from dataclasses import dataclass


@dataclass
class Book:
    title: str
    pages: int


book = Book("Python Crash Course", 552)
print(book)
```

## 八、文件、JSON 与异常

### 1. pathlib 路径

用途：用面向对象方式处理文件路径。

```python
from pathlib import Path

path = Path("data") / "users.txt"
print(path.parent)
print(path.name)
```

### 2. 读取文本文件

用途：把文件内容读入字符串。

```python
from pathlib import Path

path = Path("message.txt")
text = path.read_text(encoding="utf-8")
print(text)
```

### 3. 写入文本文件

用途：保存程序生成的文本。

```python
from pathlib import Path

path = Path("message.txt")
path.write_text("Hello\n", encoding="utf-8")
```

### 4. 逐行处理

用途：处理较大的文本或需要按行解析的数据。

```python
from pathlib import Path

for line in Path("scores.txt").read_text(encoding="utf-8").splitlines():
    print(line.strip())
```

### 5. JSON

用途：保存结构化数据，便于程序读写。

```python
import json
from pathlib import Path

data = {"name": "Ada", "score": 95}
Path("user.json").write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")

loaded = json.loads(Path("user.json").read_text(encoding="utf-8"))
print(loaded["name"])
```

### 6. try-except

用途：捕获可预期错误，让程序给出可控响应。

```python
try:
    number = int("abc")
except ValueError:
    print("请输入数字")
```

### 7. else 与 finally

用途：区分“没有异常才执行”和“无论如何都执行”。

```python
try:
    result = 10 / 2
except ZeroDivisionError:
    print("不能除以 0")
else:
    print(result)
finally:
    print("done")
```

## 九、常用标准库

### 1. random

用途：生成随机数或随机选择。

```python
import random

print(random.randint(1, 6))
print(random.choice(["red", "green", "blue"]))
```

### 2. datetime

用途：处理日期和时间。

```python
from datetime import datetime

now = datetime.now()
print(now.strftime("%Y-%m-%d %H:%M"))
```

### 3. collections.Counter

用途：统计元素出现次数。

```python
from collections import Counter

words = ["python", "data", "python"]
counts = Counter(words)
print(counts["python"])
```

### 4. argparse

用途：编写命令行工具。

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("--name", default="world")
args = parser.parse_args()

print(f"Hello, {args.name}!")
```

### 5. typing

用途：给函数和变量加类型提示，提高可读性和编辑器提示质量。

```python
def average(scores: list[int]) -> float:
    return sum(scores) / len(scores)


print(average([90, 95, 100]))
```

## 十、测试与调试

### 1. assert

用途：快速检查程序内部假设。

```python
def add(a, b):
    return a + b


assert add(2, 3) == 5
```

### 2. pytest 测试函数

用途：把验证逻辑写成可重复运行的测试。

```python
# test_math_tools.py
def add(a, b):
    return a + b


def test_add():
    assert add(2, 3) == 5
```

```bash
pytest
```

### 3. 打印调试

用途：检查变量值和分支是否符合预期。

```python
items = [1, 2, 3]
print(f"debug: items={items}, count={len(items)}")
```

### 4. 断点调试

用途：暂停程序并逐步检查状态。

```python
name = "Ada"
breakpoint()
print(name.upper())
```

## 十一、常见项目任务

### 1. 安装并使用第三方库

用途：扩展 Python 能力，例如请求网页、画图、数据处理。

```bash
python -m pip install requests
```

```python
import requests

response = requests.get("https://example.com", timeout=10)
print(response.status_code)
```

### 2. 读取 CSV

用途：处理表格型文本数据。

```python
import csv
from pathlib import Path

with Path("scores.csv").open(newline="", encoding="utf-8") as file:
    reader = csv.DictReader(file)
    for row in reader:
        print(row["name"], row["score"])
```

### 3. 简单数据可视化

用途：把数据变成图表，适合项目展示和趋势观察。

```python
import matplotlib.pyplot as plt

days = [1, 2, 3, 4]
values = [10, 13, 12, 16]

plt.plot(days, values, marker="o")
plt.xlabel("Day")
plt.ylabel("Value")
plt.show()
```

### 4. 简单 API 调用

用途：从网页服务获取 JSON 数据。

```python
import requests

url = "https://api.github.com/repos/python/cpython"
data = requests.get(url, timeout=10).json()
print(data["stargazers_count"])
```

## 十二、代码风格速查

### 1. 缩进

规则：统一使用 4 个空格。

```python
if True:
    print("4 spaces")
```

### 2. 命名

规则：变量和函数用 `snake_case`，类名用 `PascalCase`，常量用大写。

```python
MAX_RETRY = 3


class UserProfile:
    pass


def load_user_profile():
    return UserProfile()
```

### 3. 函数保持短小

规则：一个函数只做一件清晰的事。

```python
def normalize_name(name):
    return name.strip().title()


def greet(name):
    return f"Hello, {normalize_name(name)}!"
```

### 4. 优先明确错误

规则：不要静默吞掉异常；至少给出可定位的信息。

```python
try:
    value = int("abc")
except ValueError as exc:
    raise ValueError("age must be an integer") from exc
```

## 十三、易错点

### 1. 可变默认参数

问题：默认参数只在函数定义时创建一次。

```python
# 推荐写法
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

### 2. 复制列表

问题：直接赋值不会复制列表，只会创建新的引用。

```python
original = [1, 2, 3]
copy = original[:]
copy.append(4)
print(original)
print(copy)
```

### 3. 浮点数精度

问题：浮点数不适合直接表示精确十进制金额。

```python
from decimal import Decimal

price = Decimal("0.1") + Decimal("0.2")
print(price)
```

### 4. 字典缺失键

问题：直接访问不存在的键会抛出 `KeyError`。

```python
user = {"name": "Ada"}
print(user.get("email", "not set"))
```

### 5. 文件编码

问题：跨平台读写文本时不指定编码，可能出现乱码。

```python
from pathlib import Path

Path("note.txt").write_text("你好，Python", encoding="utf-8")
print(Path("note.txt").read_text(encoding="utf-8"))
```

## 参考资料

- Eric Matthes，《Python编程：从入门到实践（第三版）》。

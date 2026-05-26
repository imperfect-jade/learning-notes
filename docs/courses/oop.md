<!-- learning-notes
course: 面向对象程序设计
textbook: Effective C++
style: exam-review
source_policy: references-section
last_updated: 2026-05-26
-->

# OOP

面向对象程序设计（Object-Oriented Programming, OOP）在 C++ 中不只是“写 class”，而是围绕**封装、资源管理、对象生命周期、接口设计、继承多态、泛型与异常安全**建立一套可维护的程序结构。《Effective C++》的核心精神可以概括为：让接口难以误用、让资源自动管理、让对象语义清晰、让继承和多态只在真正合适时出现。

!!! tip "复习主线"
    学 OOP 时要始终追踪三个问题：对象由谁创建和销毁？对象能否被拷贝、移动和赋值？调用者通过什么接口使用它、是否会误用？

## 一、课程地图与 C++ OOP 总览

### 1.1 C++ 的多范式特征

C++ 不是纯 OOP 语言，它同时支持多种编程范式。

| 范式 | 代表机制 | 适用场景 |
| --- | --- | --- |
| 过程式编程 | 函数、语句、指针 | 简单算法、系统接口 |
| 面向对象 | 类、封装、继承、多态 | 有稳定概念模型和行为边界的系统 |
| 泛型编程 | 模板、STL | 类型无关的数据结构和算法 |
| 资源管理 | RAII、智能指针 | 文件、内存、锁、网络连接 |
| 函数式风格 | lambda、不可变数据 | 回调、算法组合 |

### 1.2 OOP 的三大核心

| 核心 | 含义 | C++ 体现 |
| --- | --- | --- |
| 封装 | 隐藏实现细节，只暴露稳定接口 | `private` 数据成员、public 成员函数 |
| 继承 | 表达类型之间的“is-a”关系 | `class Derived : public Base` |
| 多态 | 同一接口在不同对象上表现不同 | `virtual` 函数、基类指针/引用 |

```text
Client code
    |
    v
Public interface
    |
    v
Private representation
```

### 1.3 一个最小类示例

```cpp
#include <string>
#include <iostream>

class Student {
public:
    Student(std::string name, int id)
        : name_(std::move(name)), id_(id) {}

    const std::string& name() const {
        return name_;
    }

    int id() const {
        return id_;
    }

    void print() const {
        std::cout << id_ << " " << name_ << '\n';
    }

private:
    std::string name_;
    int id_;
};
```

要点：

- 数据成员设为 `private`，外界通过函数访问。
- 构造函数用初始化列表。
- 不修改对象状态的成员函数加 `const`。
- 字符串参数可按值传入再 `std::move` 到成员中。

## 二、对象、类与封装

### 2.1 `struct` 与 `class`

在 C++ 中，`struct` 和 `class` 的主要区别是默认访问权限。

| 关键字 | 默认成员访问权限 | 默认继承权限 | 常用语义 |
| --- | --- | --- | --- |
| `struct` | `public` | `public` | 简单数据聚合 |
| `class` | `private` | `private` | 有不变量和行为的对象 |

```cpp
struct Point {
    double x;
    double y;
};

class BankAccount {
public:
    explicit BankAccount(double balance) : balance_(balance) {}

    void deposit(double amount) {
        if (amount > 0) {
            balance_ += amount;
        }
    }

    double balance() const {
        return balance_;
    }

private:
    double balance_;
};
```

### 2.2 封装不只是隐藏数据

封装的目标是维护对象不变量（invariant）。

```cpp
class Date {
public:
    Date(int year, int month, int day)
        : year_(year), month_(month), day_(day) {
        if (!is_valid()) {
            throw std::invalid_argument("invalid date");
        }
    }

private:
    bool is_valid() const {
        return month_ >= 1 && month_ <= 12 && day_ >= 1 && day_ <= 31;
    }

    int year_;
    int month_;
    int day_;
};
```

若把 `month_` 和 `day_` 直接公开，外部代码可随意改出非法日期，对象就失去可靠边界。

### 2.3 接口设计原则

Effective C++ 风格的接口设计强调：**让正确用法自然，让错误用法困难**。

```cpp
class Timer {
public:
    explicit Timer(int seconds) : seconds_(seconds) {}

private:
    int seconds_;
};

Timer t1(10);     // OK
// Timer t2 = 10; // 禁止隐式转换
```

`explicit` 可防止单参数构造函数被用于意外隐式转换。

### 2.4 成员可见性

| 权限 | 访问范围 | 建议 |
| --- | --- | --- |
| `public` | 所有人可访问 | 稳定接口 |
| `protected` | 本类和派生类可访问 | 谨慎使用，派生类耦合较强 |
| `private` | 仅本类和友元可访问 | 数据成员默认使用 |

**高频考点**：优先让数据成员 `private`。这给后续修改实现、增加检查、维护不变量留下空间。

## 三、作用域、引用、`const` 与初始化

### 3.1 作用域

```cpp
int value = 1; // global

void f() {
    int value = 2; // local, hides global
    {
        int value = 3; // inner scope
        std::cout << value << '\n'; // 3
    }
}
```

复习点：

- 局部作用域可以隐藏外层同名变量。
- 类作用域中的成员通过 `object.member` 或 `this->member` 访问。
- 命名空间用于组织大型项目，减少命名冲突。

### 3.2 引用

引用是对象的别名，声明后必须绑定，通常不能重新绑定。

```cpp
void add_one(int& x) {
    ++x;
}

int a = 1;
add_one(a); // a == 2
```

常见用法：

| 形式 | 作用 |
| --- | --- |
| `T&` | 可修改左值引用 |
| `const T&` | 只读引用，避免拷贝 |
| `T&&` | 右值引用，支持移动语义 |

### 3.3 `const` 正确性

`const` 是接口承诺。

```cpp
class Book {
public:
    const std::string& title() const {
        return title_;
    }

    void rename(std::string title) {
        title_ = std::move(title);
    }

private:
    std::string title_;
};
```

两个 `const` 的含义：

```cpp
const std::string& title() const
// ^ 返回值不能通过引用修改
//                            ^ 该成员函数不修改对象状态
```

### 3.4 初始化优先于赋值

构造函数应使用成员初始化列表。

```cpp
class User {
public:
    User(std::string name, int age)
        : name_(std::move(name)), age_(age) {}

private:
    std::string name_;
    int age_;
};
```

不推荐：

```cpp
class User {
public:
    User(std::string name, int age) {
        name_ = std::move(name); // 先默认构造，再赋值
        age_ = age;
    }

private:
    std::string name_;
    int age_;
};
```

**易错点**：成员初始化顺序由成员声明顺序决定，不由初始化列表书写顺序决定。

### 3.5 `constexpr`、`enum`、`inline`

优先使用语言特性替代宏。

```cpp
constexpr int max_size = 1024;

enum class Color {
    red,
    green,
    blue
};

inline int square(int x) {
    return x * x;
}
```

不推荐：

```cpp
#define MAX_SIZE 1024
#define SQUARE(x) ((x) * (x))
```

宏没有作用域和类型检查，调试也更困难。

## 四、构造、析构与对象生命周期

### 4.1 构造函数

构造函数负责建立对象不变量。

```cpp
class Vector2D {
public:
    Vector2D() : x_(0), y_(0) {}
    Vector2D(double x, double y) : x_(x), y_(y) {}

private:
    double x_;
    double y_;
};
```

构造函数设计建议：

- 单参数构造函数通常加 `explicit`。
- 成员用初始化列表初始化。
- 构造失败应抛异常，不要留下半初始化对象。

### 4.2 析构函数

析构函数负责释放资源，不应让异常逃出。

```cpp
class File {
public:
    explicit File(const char* path) : fp_(std::fopen(path, "r")) {
        if (!fp_) {
            throw std::runtime_error("open failed");
        }
    }

    ~File() {
        if (fp_) {
            std::fclose(fp_);
        }
    }

private:
    std::FILE* fp_;
};
```

!!! warning "析构函数不要抛异常"
    栈展开过程中如果析构函数再次抛异常，程序可能直接终止。资源释放失败应在析构函数内部处理、记录或提供显式 `close()`。

### 4.3 构造/析构期间不要调用虚函数

```cpp
class Base {
public:
    Base() {
        // log(); // 不推荐：构造期间虚调用不会分派到派生类版本
    }

    virtual void log() const {}
};

class Derived : public Base {
public:
    void log() const override {}
};
```

原因：

- 构造基类时，派生类部分还没构造好。
- 析构基类时，派生类部分已经析构。
- 此时虚调用按当前构造/析构层级分派，不符合直觉。

### 4.4 成员对象生命周期图

```text
Construct Derived
  1. Base subobject
  2. members in declaration order
  3. Derived constructor body

Destroy Derived
  1. Derived destructor body
  2. members in reverse declaration order
  3. Base subobject
```

## 五、拷贝、移动与赋值

### 5.1 Rule of Three/Five/Zero

| 规则 | 含义 |
| --- | --- |
| Rule of Three | 若自定义析构、拷贝构造、拷贝赋值之一，通常要考虑三者 |
| Rule of Five | C++11 后还要考虑移动构造、移动赋值 |
| Rule of Zero | 优先使用标准库资源管理类型，让编译器生成特殊成员函数 |

推荐：

```cpp
class Person {
public:
    Person(std::string name) : name_(std::move(name)) {}

private:
    std::string name_;
};
```

这里 `std::string` 自己管理内存，类无需手写析构、拷贝和移动。

### 5.2 深拷贝

管理裸资源时要小心浅拷贝。

```cpp
class Buffer {
public:
    explicit Buffer(std::size_t n)
        : size_(n), data_(std::make_unique<int[]>(n)) {}

    Buffer(const Buffer& other)
        : size_(other.size_), data_(std::make_unique<int[]>(other.size_)) {
        std::copy(other.data_.get(), other.data_.get() + size_, data_.get());
    }

    Buffer& operator=(const Buffer& other) {
        if (this == &other) {
            return *this;
        }
        Buffer temp(other);
        swap(temp);
        return *this;
    }

    void swap(Buffer& other) noexcept {
        std::swap(size_, other.size_);
        std::swap(data_, other.data_);
    }

private:
    std::size_t size_;
    std::unique_ptr<int[]> data_;
};
```

这里赋值使用 copy-and-swap，兼顾自赋值和异常安全。

### 5.3 移动语义

移动语义用于转移资源所有权，减少昂贵拷贝。

```cpp
class Image {
public:
    explicit Image(std::vector<unsigned char> pixels)
        : pixels_(std::move(pixels)) {}

private:
    std::vector<unsigned char> pixels_;
};
```

移动后对象必须仍处于可析构、可赋值的有效状态，但值通常不应再依赖。

### 5.4 禁止拷贝

某些对象不应该被拷贝，如文件句柄、互斥锁、唯一所有权对象。

```cpp
class NonCopyableFile {
public:
    NonCopyableFile(const NonCopyableFile&) = delete;
    NonCopyableFile& operator=(const NonCopyableFile&) = delete;

    explicit NonCopyableFile(const char* path);
    ~NonCopyableFile();
};
```

### 5.5 拷贝所有成员

若手写拷贝函数，必须拷贝所有成员和基类部分。

```cpp
class Derived : public Base {
public:
    Derived(const Derived& other)
        : Base(other), value_(other.value_) {}

    Derived& operator=(const Derived& other) {
        if (this != &other) {
            Base::operator=(other);
            value_ = other.value_;
        }
        return *this;
    }

private:
    int value_;
};
```

## 六、资源管理与 RAII

### 6.1 RAII

RAII（Resource Acquisition Is Initialization）表示：资源获取放在对象构造中，资源释放放在析构中。

```text
constructor acquires resource
        |
        v
object owns resource
        |
        v
destructor releases resource
```

### 6.2 智能指针

| 类型 | 所有权语义 | 使用场景 |
| --- | --- | --- |
| `std::unique_ptr<T>` | 独占所有权，不可拷贝，可移动 | 默认首选 |
| `std::shared_ptr<T>` | 共享所有权，引用计数 | 多个对象共同拥有 |
| `std::weak_ptr<T>` | 弱引用，不增加引用计数 | 打破环形引用 |

```cpp
#include <memory>

class Widget {};

std::unique_ptr<Widget> make_widget() {
    return std::make_unique<Widget>();
}
```

### 6.3 `shared_ptr` 环形引用

错误示例：

```cpp
struct Node {
    std::shared_ptr<Node> next;
    std::shared_ptr<Node> prev;
};
```

若两个节点互相持有 `shared_ptr`，引用计数无法归零。

改进：

```cpp
struct Node {
    std::shared_ptr<Node> next;
    std::weak_ptr<Node> prev;
};
```

### 6.4 避免裸 `new` 和 `delete`

推荐：

```cpp
auto p = std::make_unique<int>(42);
```

不推荐：

```cpp
int* p = new int(42);
delete p;
```

手动 `new/delete` 容易出现：

- 忘记释放。
- 重复释放。
- 异常路径泄漏。
- `new[]` 和 `delete` 不匹配。

### 6.5 资源句柄类

```cpp
class LockGuard {
public:
    explicit LockGuard(std::mutex& m) : mutex_(m) {
        mutex_.lock();
    }

    ~LockGuard() {
        mutex_.unlock();
    }

    LockGuard(const LockGuard&) = delete;
    LockGuard& operator=(const LockGuard&) = delete;

private:
    std::mutex& mutex_;
};
```

标准库已有 `std::lock_guard`，这里用于理解 RAII。

## 七、组合、继承与多态

### 7.1 组合优先

组合表达“has-a”或“is-implemented-in-terms-of”关系。

```cpp
class Engine {
public:
    void start() {}
};

class Car {
public:
    void start() {
        engine_.start();
    }

private:
    Engine engine_;
};
```

优先组合的原因：

- 耦合更低。
- 不暴露基类接口。
- 不受虚函数和对象切片影响。
- 更容易替换实现。

### 7.2 public 继承表示 is-a

```cpp
class Shape {
public:
    virtual ~Shape() = default;
    virtual double area() const = 0;
};

class Circle : public Shape {
public:
    explicit Circle(double radius) : radius_(radius) {}

    double area() const override {
        return 3.1415926 * radius_ * radius_;
    }

private:
    double radius_;
};
```

`Circle` 可以在任何需要 `Shape` 的地方使用，所以 public 继承合理。

### 7.3 虚析构函数

作为多态基类时，析构函数应为 `virtual`。

```cpp
class Base {
public:
    virtual ~Base() = default;
};

class Derived : public Base {
public:
    ~Derived() override = default;
};

std::unique_ptr<Base> p = std::make_unique<Derived>();
```

若基类析构函数非虚，通过基类指针删除派生对象会产生未定义行为。

### 7.4 override 与 final

```cpp
class Base {
public:
    virtual void draw() const = 0;
};

class Button final : public Base {
public:
    void draw() const override {}
};
```

| 关键字 | 作用 |
| --- | --- |
| `override` | 明确重写基类虚函数，签名不匹配时报错 |
| `final` | 禁止继续派生或禁止继续重写虚函数 |

### 7.5 对象切片

```cpp
void print_shape(Shape shape); // 错误：按值传递会切片

void print_shape(const Shape& shape); // 正确：引用保持动态类型
```

对象切片（object slicing）会丢失派生类部分，应通过指针或引用使用多态对象。

### 7.6 纯虚函数与抽象类

```cpp
class Serializer {
public:
    virtual ~Serializer() = default;
    virtual std::string serialize() const = 0;
};
```

包含纯虚函数的类是抽象类，不能直接实例化，只能作为接口或基类。

### 7.7 继承中的名字隐藏

```cpp
class Base {
public:
    void f(int) {}
    void f(double) {}
};

class Derived : public Base {
public:
    using Base::f;
    void f(const std::string&) {}
};
```

派生类中声明同名函数会隐藏基类所有同名重载，使用 `using Base::f;` 可引入基类重载集合。

## 八、运算符重载

### 8.1 基本原则

运算符重载应符合使用者直觉。

```cpp
class Complex {
public:
    Complex(double r, double i) : real_(r), imag_(i) {}

    Complex& operator+=(const Complex& rhs) {
        real_ += rhs.real_;
        imag_ += rhs.imag_;
        return *this;
    }

    friend Complex operator+(Complex lhs, const Complex& rhs) {
        lhs += rhs;
        return lhs;
    }

private:
    double real_;
    double imag_;
};
```

技巧：

- 先实现复合赋值 `+=`。
- 再用它实现非成员 `+`。
- 二元对称运算常实现为非成员函数。

### 8.2 赋值运算符

赋值运算符应返回 `*this` 的引用。

```cpp
class Widget {
public:
    Widget& operator=(const Widget& rhs) {
        if (this == &rhs) {
            return *this;
        }
        value_ = rhs.value_;
        return *this;
    }

private:
    int value_{};
};
```

这样支持链式赋值：

```cpp
a = b = c;
```

### 8.3 输入输出运算符

```cpp
class Point {
public:
    Point(int x, int y) : x_(x), y_(y) {}

    friend std::ostream& operator<<(std::ostream& os, const Point& p) {
        return os << "(" << p.x_ << ", " << p.y_ << ")";
    }

private:
    int x_;
    int y_;
};
```

`operator<<` 通常作为非成员函数，因为左操作数是 `std::ostream`。

## 九、模板与泛型编程

### 9.1 函数模板

```cpp
template <typename T>
const T& max_value(const T& a, const T& b) {
    return (a < b) ? b : a;
}
```

模板把类型作为参数，让算法独立于具体类型。

### 9.2 类模板

```cpp
template <typename T>
class Box {
public:
    explicit Box(T value) : value_(std::move(value)) {}

    const T& value() const {
        return value_;
    }

private:
    T value_;
};
```

使用：

```cpp
Box<int> a(42);
Box<std::string> b("hello");
```

### 9.3 模板与编译期

模板通常在头文件中定义，因为编译器需要看到完整定义才能实例化。

```text
template definition
        |
        v
compiler sees T = int
        |
        v
generate max_value<int>
```

### 9.4 STL 容器与迭代器

```cpp
#include <vector>
#include <algorithm>
#include <iostream>

std::vector<int> values{3, 1, 4, 1, 5};
std::sort(values.begin(), values.end());

for (int x : values) {
    std::cout << x << ' ';
}
```

常用容器：

| 容器 | 特点 |
| --- | --- |
| `std::vector` | 连续内存，随机访问快 |
| `std::list` | 双向链表，随机访问慢 |
| `std::deque` | 双端队列 |
| `std::map` | 有序键值表 |
| `std::unordered_map` | 哈希键值表 |
| `std::set` | 有序集合 |

### 9.5 迭代器失效

```cpp
std::vector<int> v{1, 2, 3};
auto it = v.begin();
v.push_back(4); // 可能触发扩容
// *it 可能已经失效
```

复习重点：

- `vector` 扩容会使迭代器、指针、引用失效。
- 删除元素后，被删位置及其后的迭代器可能失效。
- 容器不同，失效规则不同。

## 十、异常与异常安全

### 10.1 异常基本用法

```cpp
double divide(double a, double b) {
    if (b == 0.0) {
        throw std::invalid_argument("division by zero");
    }
    return a / b;
}

try {
    std::cout << divide(1.0, 0.0);
} catch (const std::invalid_argument& e) {
    std::cerr << e.what() << '\n';
}
```

异常适合处理无法在本层恢复的错误。

### 10.2 异常安全等级

| 等级 | 含义 |
| --- | --- |
| Basic guarantee | 异常后对象仍有效，无资源泄漏 |
| Strong guarantee | 异常后状态不变，像操作没发生 |
| No-throw guarantee | 操作不抛异常 |

### 10.3 copy-and-swap 与强异常安全

```cpp
class Widget {
public:
    Widget& operator=(Widget rhs) {
        swap(rhs);
        return *this;
    }

    void swap(Widget& other) noexcept {
        std::swap(data_, other.data_);
    }

private:
    std::vector<int> data_;
};
```

参数按值传入，先完成拷贝；若拷贝失败，原对象不变。`swap` 成功后再替换状态。

### 10.4 析构与异常

```cpp
class Transaction {
public:
    ~Transaction() noexcept {
        try {
            rollback_if_needed();
        } catch (...) {
            // log and suppress
        }
    }

private:
    void rollback_if_needed() {}
};
```

析构函数默认应 `noexcept`，不要把异常传播出去。

## 十一、流与文件 I/O

### 11.1 标准输入输出

```cpp
#include <iostream>
#include <string>

int main() {
    std::string name;
    std::cin >> name;
    std::cout << "Hello, " << name << '\n';
}
```

### 11.2 文件流

```cpp
#include <fstream>
#include <string>

std::ifstream in("input.txt");
if (!in) {
    throw std::runtime_error("cannot open file");
}

std::string line;
while (std::getline(in, line)) {
    // process line
}
```

文件流对象本身使用 RAII，离开作用域会自动关闭文件。

### 11.3 字符串流

```cpp
#include <sstream>
#include <string>

std::string text = "42 Alice";
std::istringstream iss(text);

int id;
std::string name;
iss >> id >> name;
```

适合解析字符串中的结构化内容。

## 十二、Effective C++ 设计原则速查

### 12.1 让对象语义明确

| 问题 | 建议 |
| --- | --- |
| 对象是否可拷贝 | 明确默认、删除或自定义拷贝 |
| 对象是否拥有资源 | 使用 RAII 类型表达所有权 |
| 对象能否被继承 | 有虚函数则通常需要虚析构；不希望继承可 `final` |
| 接口是否可能误用 | 使用类型、`explicit`、`const`、引用限定等约束 |

### 12.2 优先使用语言和标准库

| 不推荐 | 推荐 |
| --- | --- |
| 宏常量 | `constexpr`、`enum class` |
| 裸数组 | `std::array`、`std::vector` |
| 裸 `new/delete` | `std::make_unique`、`std::make_shared` |
| 手写资源释放 | RAII 类型 |
| C 风格强转 | `static_cast`、`dynamic_cast`、`const_cast` 等有名转换 |

### 12.3 参数传递

```cpp
void read_only(const std::string& s); // 避免拷贝
void take_ownership(std::unique_ptr<Widget> p); // 表达所有权转移
void set_name(std::string name); // 需要保存副本时可按值传入再 move
```

### 12.4 返回值

不要返回局部变量引用。

错误：

```cpp
const std::string& bad() {
    std::string s = "temp";
    return s; // dangling reference
}
```

正确：

```cpp
std::string good() {
    return "temp";
}
```

现代 C++ 返回值优化和移动语义通常会让按值返回足够高效。

### 12.5 少用类型转换

```cpp
Base* base = get_base();

if (auto* derived = dynamic_cast<Derived*>(base)) {
    derived->specific();
}
```

频繁向下转型通常说明基类接口设计不够好，应考虑虚函数、多态接口或重新建模。

## 十三、常见题型与解题模板

### 13.1 类设计题

步骤：

1. 明确类维护什么不变量。
2. 数据成员设为 `private`。
3. 构造函数建立合法状态。
4. 不修改对象的成员函数加 `const`。
5. 决定是否允许拷贝/移动。
6. 若有资源，优先使用 RAII 成员。

### 13.2 继承与多态题

步骤：

1. 判断是否真的是 is-a。
2. 基类析构函数是否 `virtual`。
3. 虚函数是否用 `override`。
4. 是否存在对象切片。
5. 是否在构造/析构中调用虚函数。
6. 是否可以用组合替代继承。

### 13.3 拷贝控制题

步骤：

1. 类是否拥有资源。
2. 默认拷贝是否会浅拷贝资源。
3. 是否需要深拷贝、禁止拷贝或支持移动。
4. 赋值运算符是否处理自赋值。
5. 拷贝构造和拷贝赋值是否拷贝所有成员和基类。

### 13.4 异常安全题

步骤：

1. 找出可能抛异常的操作。
2. 检查异常后是否泄漏资源。
3. 检查对象是否仍满足不变量。
4. 判断达到 basic、strong 还是 no-throw。
5. 需要强保证时考虑 copy-and-swap。

### 13.5 模板与 STL 题

步骤：

1. 确定模板参数需要支持哪些操作。
2. 注意模板定义通常放头文件。
3. 判断容器选择是否合理。
4. 检查迭代器是否可能失效。
5. 使用标准算法替代手写循环。

## 十四、高频易错点

| 知识点 | 易错说法 | 正确理解 |
| --- | --- | --- |
| `class` vs `struct` | 二者完全不同 | 主要区别是默认访问权限 |
| 封装 | 只是把成员设为 private | 本质是维护不变量、隔离变化 |
| `const` 成员函数 | 只是语法装饰 | 它承诺不修改对象逻辑状态 |
| 初始化列表 | 和构造函数体赋值等价 | 初始化更直接，且某些成员必须初始化 |
| 析构函数 | 可以随便抛异常 | 析构函数不应让异常逃出 |
| 虚函数 | 构造函数里可正常多态 | 构造/析构期间虚调用不会进入派生类版本 |
| 继承 | 复用代码就用继承 | public 继承应表达 is-a，复用优先组合 |
| 多态参数 | 按值传递基类对象 | 应用指针或引用，否则对象切片 |
| 基类析构 | 有虚函数也可非虚析构 | 多态基类通常需要虚析构 |
| 拷贝 | 编译器默认拷贝总是安全 | 资源类可能浅拷贝导致 double free |
| 移动后对象 | 可以继续依赖原值 | 只能假定它有效但值未指定 |
| `shared_ptr` | 智能指针不会泄漏 | 环形引用仍会泄漏，要用 `weak_ptr` |
| 运算符重载 | 可以随意改变语义 | 应符合内建运算符直觉 |
| 模板 | 只影响运行时 | 模板主要在编译期实例化 |
| 迭代器 | 获取后永远有效 | 容器修改可能导致迭代器失效 |

## 十五、代码模板速查

### 15.1 不可拷贝资源类

```cpp
class Resource {
public:
    Resource();
    ~Resource();

    Resource(const Resource&) = delete;
    Resource& operator=(const Resource&) = delete;

    Resource(Resource&&) noexcept = default;
    Resource& operator=(Resource&&) noexcept = default;
};
```

### 15.2 多态基类

```cpp
class Interface {
public:
    virtual ~Interface() = default;
    virtual void run() = 0;
};
```

### 15.3 值类型

```cpp
class Value {
public:
    Value(int x, std::string name)
        : x_(x), name_(std::move(name)) {}

    int x() const { return x_; }
    const std::string& name() const { return name_; }

private:
    int x_;
    std::string name_;
};
```

### 15.4 工厂函数

```cpp
std::unique_ptr<Shape> make_circle(double radius) {
    return std::make_unique<Circle>(radius);
}
```

### 15.5 swap

```cpp
class Widget {
public:
    void swap(Widget& other) noexcept {
        using std::swap;
        swap(data_, other.data_);
    }

private:
    std::vector<int> data_;
};
```

## 十六、复习路线

### 第一轮：语言基础

1. `class`、`struct`、访问控制。
2. 作用域、引用、`const`。
3. 构造函数、析构函数、初始化列表。
4. `std::string`、容器、迭代器、流。

### 第二轮：对象语义

1. 拷贝构造、拷贝赋值。
2. 移动构造、移动赋值。
3. Rule of Three/Five/Zero。
4. 自赋值、深拷贝、对象切片。

### 第三轮：资源管理

1. RAII。
2. `unique_ptr`、`shared_ptr`、`weak_ptr`。
3. 异常安全。
4. 避免裸 `new/delete`。

### 第四轮：OOP 设计

1. 封装和不变量。
2. 组合与继承选择。
3. 多态、虚函数、虚析构。
4. 运算符重载、模板、STL。

### 第五轮：Effective C++ 思维

1. 接口让正确用法自然。
2. 资源交给对象管理。
3. 拷贝、移动、销毁语义要明确。
4. public 继承表达 is-a。
5. 少写底层控制代码，多用标准库和类型系统。

## 十七、参考资料

- Scott Meyers.《Effective C++》。
- WintermelonC Docs：[面向对象程序设计](https://wintermelonc.github.io/WintermelonC_Docs/zju/basic_courses/OOP/)，用于参考课程章节结构与主题范围。
- WintermelonC Docs OOP 章节：Introduction、Object and String、Containers and Iterators、Struct and Class、Scope/Reference/Constant/Dynamic Memory Allocation、Constructors and Inline Functions、Composition、Inheritance、Polymorphism、Copy and Move、Overloaded Operator、Template、Exception、Smart Pointer、Stream。

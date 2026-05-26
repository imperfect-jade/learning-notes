<!-- learning-notes
course: 数据库系统
textbook: 数据库系统概念（第七版）
style: exam-review
source_policy: references-section
last_updated: 2026-05-26
-->

# 数据库系统

数据库系统研究如何**可靠、高效、并发、可恢复**地管理大量结构化数据。复习时要把知识点串成一条主线：从现实世界建模为关系表，用 SQL 查询与更新数据，再由 DBMS 负责存储、索引、查询优化、事务并发和故障恢复。

!!! tip "复习主线"
    这门课最核心的四条线是：**关系模型与 SQL、数据库设计与范式、查询处理与优化、事务并发与恢复**。前两条偏逻辑设计，后两条偏系统实现。

## 一、课程地图与数据库系统总览

### 1.1 数据库系统解决什么问题

传统文件系统直接由应用程序管理数据，容易出现：

- 数据冗余和不一致。
- 并发访问互相覆盖。
- 程序和数据格式强耦合。
- 故障后难以恢复。
- 安全控制分散。

DBMS（Database Management System）在应用和数据之间提供统一管理层。

```text
Users / Applications
        |
        v
      SQL
        |
        v
+---------------------------+
|           DBMS            |
|  Parser / Optimizer       |
|  Query Executor           |
|  Transaction Manager      |
|  Concurrency Control      |
|  Recovery Manager         |
|  Buffer / Storage Manager |
+---------------------------+
        |
        v
 Database files / Indexes / Logs
```

### 1.2 三层数据抽象

| 层次 | 含义 | 例子 |
| --- | --- | --- |
| 物理层 | 数据如何存储 | 文件、页、记录、索引、磁盘块 |
| 逻辑层 | 数据库中有什么数据和关系 | 表结构、约束、视图 |
| 视图层 | 不同用户看到的数据子集 | 学生成绩视图、管理员视图 |

**数据独立性**：

- 物理数据独立性：改变存储方式不影响逻辑模式。
- 逻辑数据独立性：改变逻辑模式尽量不影响外部视图和应用。

### 1.3 数据库系统的核心对象

| 对象 | 说明 |
| --- | --- |
| Schema | 数据库结构定义，相当于“类型” |
| Instance | 某一时刻数据库中的具体数据 |
| Relation | 关系表 |
| Tuple | 表中的一行 |
| Attribute | 表中的一列 |
| Key | 能唯一标识元组的属性集合 |
| Constraint | 数据必须满足的规则 |
| Transaction | 作为一个逻辑工作单元执行的一组操作 |

### 1.4 复习知识树

```text
数据库系统
|
|-- 逻辑层
|   |-- 关系模型
|   |-- SQL
|   |-- ER 建模
|   |-- 函数依赖与范式
|
|-- 物理层
|   |-- 文件组织
|   |-- Buffer 管理
|   |-- B+ 树 / Hash 索引
|
|-- 查询层
|   |-- 选择、投影、连接、排序
|   |-- 查询代价估计
|   |-- 查询优化
|
|-- 事务层
|   |-- ACID
|   |-- 可串行化
|   |-- 锁 / 时间戳 / MVCC
|   |-- 日志 / 检查点 / 恢复
```

## 二、关系模型

### 2.1 关系模型基本概念

关系模型把数据表示为关系表：

```text
student(ID, name, dept_name, tot_cred)
instructor(ID, name, dept_name, salary)
course(course_id, title, dept_name, credits)
takes(ID, course_id, sec_id, semester, year, grade)
```

| 概念 | 说明 |
| --- | --- |
| Domain | 属性取值范围 |
| Relation Schema | 关系名和属性集合 |
| Relation Instance | 当前表中所有元组 |
| Tuple | 一行记录 |
| Superkey | 能唯一标识元组的属性集合 |
| Candidate Key | 最小 superkey |
| Primary Key | 被选中的候选码 |
| Foreign Key | 引用其他关系主码的属性 |

### 2.2 码与约束

候选码必须满足：

1. 唯一性：能唯一标识元组。
2. 最小性：去掉任意属性后不再唯一。

例：

```text
student(ID, name, dept_name, tot_cred)

候选码：ID
超码：{ID}, {ID, name}, {ID, dept_name}
非候选码：{name}，因为可能重名
```

外码用于维护引用完整性：

```sql
CREATE TABLE takes (
    ID        VARCHAR(10),
    course_id VARCHAR(10),
    sec_id    VARCHAR(10),
    semester  VARCHAR(10),
    year      INT,
    grade     VARCHAR(2),
    PRIMARY KEY (ID, course_id, sec_id, semester, year),
    FOREIGN KEY (ID) REFERENCES student(ID)
);
```

### 2.3 关系代数

关系代数是 SQL 的理论基础。

| 运算 | 符号 | 含义 |
| --- | --- | --- |
| Selection | \(\sigma\) | 选择满足条件的行 |
| Projection | \(\Pi\) | 选择列 |
| Union | \(\cup\) | 并 |
| Set Difference | \(-\) | 差 |
| Cartesian Product | \(\times\) | 笛卡尔积 |
| Rename | \(\rho\) | 重命名 |
| Join | \(\bowtie\) | 连接 |
| Aggregation | \(\gamma\) | 分组聚合 |

例：查询 CS 系教师姓名：

\[
\Pi_{name}(\sigma_{dept\_name='CS'}(instructor))
\]

对应 SQL：

```sql
SELECT name
FROM instructor
WHERE dept_name = 'CS';
```

### 2.4 连接运算

连接可理解为“先笛卡尔积，再按条件筛选”：

\[
r \bowtie_{\theta} s = \sigma_{\theta}(r \times s)
\]

例：查询学生及其选课：

```sql
SELECT student.ID, student.name, takes.course_id
FROM student
JOIN takes ON student.ID = takes.ID;
```

**易错点**：

- 自然连接会自动按同名属性连接，可能误把不该连接的同名列连上。
- 外连接会保留无匹配行，并用 `NULL` 补齐。
- `NULL` 参与比较时使用三值逻辑：true、false、unknown。

## 三、SQL 基础与高级查询

### 3.1 SQL 分类

| 类型 | 作用 | 典型语句 |
| --- | --- | --- |
| DDL | 定义数据库结构 | `CREATE`, `ALTER`, `DROP` |
| DML | 查询和修改数据 | `SELECT`, `INSERT`, `UPDATE`, `DELETE` |
| DCL | 权限控制 | `GRANT`, `REVOKE` |
| TCL | 事务控制 | `COMMIT`, `ROLLBACK` |

### 3.2 建表与约束

```sql
CREATE TABLE student (
    ID        VARCHAR(10) PRIMARY KEY,
    name      VARCHAR(30) NOT NULL,
    dept_name VARCHAR(30),
    tot_cred  INT CHECK (tot_cred >= 0)
);

CREATE TABLE course (
    course_id VARCHAR(10) PRIMARY KEY,
    title     VARCHAR(80) NOT NULL,
    dept_name VARCHAR(30),
    credits   INT CHECK (credits > 0)
);
```

常用约束：

| 约束 | 含义 |
| --- | --- |
| `PRIMARY KEY` | 主码，唯一且非空 |
| `FOREIGN KEY` | 外码，引用其他表 |
| `UNIQUE` | 值唯一，可用于候选码 |
| `NOT NULL` | 不允许空值 |
| `CHECK` | 自定义条件 |

### 3.3 查询基本结构

SQL 查询基本形式：

```sql
SELECT 属性列表
FROM 表列表
WHERE 行条件
GROUP BY 分组属性
HAVING 分组条件
ORDER BY 排序属性;
```

例：查询 CS 系工资高于 80000 的教师：

```sql
SELECT ID, name, salary
FROM instructor
WHERE dept_name = 'CS' AND salary > 80000
ORDER BY salary DESC;
```

### 3.4 聚合与分组

```sql
SELECT dept_name, COUNT(*) AS teacher_count, AVG(salary) AS avg_salary
FROM instructor
GROUP BY dept_name
HAVING AVG(salary) > 70000;
```

执行理解：

```text
FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY
```

**易错点**：

- `WHERE` 过滤行，`HAVING` 过滤分组。
- `SELECT` 中非聚合列通常必须出现在 `GROUP BY` 中。
- `COUNT(*)` 统计行数，`COUNT(column)` 不统计该列为 `NULL` 的行。

### 3.5 子查询

```sql
-- 查询工资高于本系平均工资的教师
SELECT i.ID, i.name, i.salary
FROM instructor AS i
WHERE i.salary > (
    SELECT AVG(j.salary)
    FROM instructor AS j
    WHERE j.dept_name = i.dept_name
);
```

常见谓词：

| 谓词 | 含义 |
| --- | --- |
| `IN` | 属于子查询结果 |
| `EXISTS` | 子查询结果非空 |
| `ALL` | 与全部结果比较 |
| `ANY` / `SOME` | 与至少一个结果比较 |

### 3.6 视图

视图是由查询定义的虚拟表：

```sql
CREATE VIEW cs_instructor AS
SELECT ID, name, salary
FROM instructor
WHERE dept_name = 'CS';
```

优点：

- 简化复杂查询。
- 限制用户可见字段，提高安全性。
- 提供逻辑数据独立性。

限制：

- 并非所有视图都可更新。
- 复杂视图可能导致查询优化变难。

### 3.7 递归查询

适合树、图、层级关系。

```sql
WITH RECURSIVE prereq_path(course_id, prereq_id) AS (
    SELECT course_id, prereq_id
    FROM prereq
  UNION
    SELECT p.course_id, r.prereq_id
    FROM prereq AS p
    JOIN prereq_path AS r ON p.prereq_id = r.course_id
)
SELECT *
FROM prereq_path;
```

## 四、ER 模型与数据库设计

### 4.1 ER 模型元素

| 元素 | 含义 |
| --- | --- |
| Entity | 实体，如学生、课程 |
| Entity Set | 同类实体集合 |
| Attribute | 实体属性 |
| Relationship | 实体间联系 |
| Weak Entity | 依赖其他实体存在的弱实体 |
| Cardinality | 一对一、一对多、多对多 |
| Participation | 全参与或部分参与 |

### 4.2 简单 ER 示意

```text
+---------+       enrolls        +--------+
| Student |----------------------| Course |
+---------+                      +--------+
| ID      |                      | cid    |
| name    |                      | title  |
+---------+                      +--------+
      \                              /
       \                            /
        +--------- Takes ----------+
        | semester, year, grade    |
        +--------------------------+
```

如果联系本身有属性，如选课的 `grade`，通常需要单独映射为关系表。

### 4.3 ER 到关系模式映射

| ER 结构 | 映射方式 |
| --- | --- |
| 强实体集 | 建一张表，属性变列 |
| 弱实体集 | 表中包含自身属性 + 所依赖强实体主码 |
| 一对多联系 | 在“多”的一侧加入“一”的主码作外码 |
| 多对多联系 | 新建联系表，包含两侧主码和联系属性 |
| 多值属性 | 新建表保存实体主码和该属性 |

多对多例子：

```sql
CREATE TABLE takes (
    ID        VARCHAR(10),
    course_id VARCHAR(10),
    semester  VARCHAR(10),
    year      INT,
    grade     VARCHAR(2),
    PRIMARY KEY (ID, course_id, semester, year),
    FOREIGN KEY (ID) REFERENCES student(ID),
    FOREIGN KEY (course_id) REFERENCES course(course_id)
);
```

### 4.4 设计质量判断

好的数据库设计应尽量：

- 减少冗余。
- 避免更新异常、插入异常、删除异常。
- 保持语义清晰。
- 支持常用查询高效执行。
- 约束能由数据库而非应用程序保证。

## 五、函数依赖与范式

### 5.1 第一范式

第一范式要求属性值是原子的，不应在单个字段里塞列表或复杂结构。

反例：

```text
person(name, phones)
('Alice', '138...,139...')
```

推荐拆分：

```text
person(name)
phone(name, phone)
```

### 5.2 函数依赖

函数依赖 \(X \to Y\) 表示：若两个元组在属性集 \(X\) 上相同，则它们在属性集 \(Y\) 上也必须相同。

例：

```text
student(ID, name, dept_name)

ID -> name
ID -> dept_name
```

若 \(X\) 是关系 \(R\) 的超码，则 \(X\) 能函数决定 \(R\) 中所有属性。

### 5.3 Armstrong 公理

| 规则 | 形式 |
| --- | --- |
| 自反性 | 若 \(Y \subseteq X\)，则 \(X \to Y\) |
| 增广性 | 若 \(X \to Y\)，则 \(XZ \to YZ\) |
| 传递性 | 若 \(X \to Y\)，且 \(Y \to Z\)，则 \(X \to Z\) |

常用推导规则：

| 规则 | 形式 |
| --- | --- |
| 合并 | \(X \to Y\) 且 \(X \to Z\)，得 \(X \to YZ\) |
| 分解 | \(X \to YZ\)，得 \(X \to Y\) 和 \(X \to Z\) |
| 伪传递 | \(X \to Y\) 且 \(WY \to Z\)，得 \(WX \to Z\) |

### 5.4 属性闭包

属性集闭包 \(X^+\)：在函数依赖集合 \(F\) 下，能由 \(X\) 推出的所有属性。

算法：

```text
result = X
repeat
    for each FD Y -> Z in F:
        if Y is subset of result:
            result = result union Z
until result no longer changes
```

用途：

- 判断 \(X\) 是否是超码。
- 判断函数依赖 \(X \to Y\) 是否被 \(F\) 推出。
- 求候选码。

例：

```text
R(A, B, C, D)
F = { A -> B, B -> C, AC -> D }

A+ 初始为 {A}
A -> B，所以加入 B: {A, B}
B -> C，所以加入 C: {A, B, C}
AC -> D，A 和 C 都已有，所以加入 D: {A, B, C, D}

因此 A 是超码。
```

### 5.5 正则覆盖

正则覆盖（canonical cover）用于去掉冗余依赖和冗余属性，使依赖集合更简洁。

处理思路：

1. 把右侧多属性依赖拆成单属性。
2. 检查左侧是否有多余属性。
3. 检查右侧依赖是否冗余。
4. 能合并同左侧依赖时再合并。

**易错点**：判断某个属性是否多余，要在修改后的依赖集上重新计算闭包。

### 5.6 分解的两个性质

| 性质 | 含义 | 为什么重要 |
| --- | --- | --- |
| Lossless Join | 分解后自然连接能还原原关系 | 防止产生伪元组或丢数据 |
| Dependency Preservation | 原函数依赖能在分解后的关系上局部检查 | 避免每次检查依赖都要连接 |

二元分解 \(R \to R_1, R_2\) 无损连接条件：

\[
(R_1 \cap R_2) \to R_1
\]

或

\[
(R_1 \cap R_2) \to R_2
\]

至少有一个能由 \(F^+\) 推出。

### 5.7 BCNF

关系 \(R\) 满足 BCNF，当且仅当对每个非平凡函数依赖 \(X \to Y\)，\(X\) 都是 \(R\) 的超码。

若存在违反依赖 \(X \to Y\)，可分解为：

\[
R_1 = X \cup Y
\]

\[
R_2 = R - (Y - X)
\]

**特点**：

- 冗余少。
- 分解无损。
- 可能不保持依赖。

### 5.8 第三范式

关系 \(R\) 满足 3NF，当且仅当对每个非平凡依赖 \(X \to A\)，至少满足：

1. \(X\) 是超码；或
2. \(A\) 是某个候选码的一部分，也称 prime attribute。

**特点**：

- 可做到无损连接。
- 可做到依赖保持。
- 允许少量受控冗余。

### 5.9 BCNF 与 3NF 对比

| 维度 | BCNF | 3NF |
| --- | --- | --- |
| 冗余消除 | 更强 | 稍弱 |
| 无损连接 | 可以保证 | 可以保证 |
| 依赖保持 | 不一定 | 可以保证 |
| 考试重点 | 判断违反依赖、分解 | 综合得到依赖保持设计 |

### 5.10 多值依赖与 4NF

多值依赖 \(X \twoheadrightarrow Y\) 表示：给定 \(X\) 后，\(Y\) 的取值集合与其他属性独立。

典型反例：

```text
person(name, phone, hobby)
```

若一个人有多个电话和多个爱好，电话与爱好互相独立，放在同一表会产生组合冗余。

拆分：

```text
person_phone(name, phone)
person_hobby(name, hobby)
```

4NF 要求每个非平凡多值依赖 \(X \twoheadrightarrow Y\) 中，\(X\) 是超码。

## 六、存储与文件组织

### 6.1 存储层次

```text
CPU
 |
Buffer Pool in Memory
 |
Disk / SSD Pages
 |
Database Files
```

DBMS 通常以页（page/block）为磁盘和内存之间传输单位。

| 单位 | 含义 |
| --- | --- |
| File | 数据库中的一组页 |
| Page / Block | I/O 基本单位 |
| Record | 表中的一条元组 |
| Field | 记录中的属性值 |

### 6.2 页与记录

可变长记录常用 slotted page 组织：

```text
+-------------------------------+
| Page Header                    |
| free space pointer             |
| slot count                     |
+-------------------------------+
| Slot Directory                 |
| slot -> record offset, length  |
+-------------------------------+
|           Free Space           |
+-------------------------------+
| Record n | ... | Record 2 | 1  |
+-------------------------------+
```

优点：

- 记录移动时只需更新 slot。
- 外部引用可使用 page id + slot id。
- 适合可变长记录和删除后的空间复用。

### 6.3 文件组织

| 组织方式 | 优点 | 缺点 | 适用场景 |
| --- | --- | --- | --- |
| Heap File | 插入快 | 查找慢 | 临时表、无序数据 |
| Sorted File | 范围查询快 | 插入维护成本高 | 按排序字段频繁范围查 |
| Hash File | 等值查询快 | 范围查询差 | 主键等值查找 |
| Clustered File | 相关记录放近 | 维护复杂 | join 或范围访问频繁 |

### 6.4 Buffer Manager

Buffer manager 把磁盘页缓存到内存中。

```text
Query Executor requests page P
        |
        v
Buffer Pool has P?
   | yes -> return frame
   | no  -> choose victim frame -> if dirty write back -> read P
```

关键概念：

| 概念 | 含义 |
| --- | --- |
| Pin | 页正在被使用，不能替换 |
| Dirty bit | 页被修改，需要写回 |
| Replacement policy | LRU、Clock 等 |
| Write-ahead logging | 脏页写回前日志必须先落盘 |

## 七、索引与哈希

### 7.1 为什么需要索引

无索引时，等值查询可能需要全表扫描：

```sql
SELECT *
FROM student
WHERE ID = '20240001';
```

若表有 \(N\) 页，全表扫描代价约为 \(N\) 次页读。索引通过额外数据结构快速定位记录。

### 7.2 索引分类

| 分类 | 说明 |
| --- | --- |
| Primary Index | 建在排序文件的主码上 |
| Secondary Index | 建在非排序字段上 |
| Clustered Index | 数据记录按索引顺序存放 |
| Nonclustered Index | 索引顺序与数据存放顺序不同 |
| Dense Index | 每个搜索键值都有索引项 |
| Sparse Index | 只为部分搜索键建索引项 |

### 7.3 B+ 树索引

B+ 树适合范围查询和等值查询，是数据库中最常见的磁盘索引结构。

```text
                 [30 | 60]
                /    |    \
        [10|20]   [40|50]   [70|80]
          |          |          |
       leaves -> leaves -> leaves
```

特点：

- 所有数据项或记录指针在叶子结点。
- 叶子结点按键顺序链接，适合范围扫描。
- 内部结点只存搜索键和子指针。
- 树高度低，磁盘 I/O 次数少。

查找代价近似：

\[
O(\log_f N)
\]

其中 \(f\) 是扇出，数据库页较大时 \(f\) 通常很大，所以 B+ 树高度通常很低。

### 7.4 B+ 树插入与删除

插入：

1. 找到目标叶子。
2. 若有空间，直接插入。
3. 若溢出，分裂叶子。
4. 把分裂键插入父结点。
5. 父结点也可能递归分裂。

删除：

1. 从叶子删除。
2. 若仍满足最少占用，结束。
3. 否则向兄弟借键或合并。
4. 父结点可能递归调整。

### 7.5 哈希索引

哈希索引适合等值查询：

```text
h(key) -> bucket
```

| 方法 | 思路 |
| --- | --- |
| Static Hashing | bucket 数固定 |
| Dynamic Hashing | bucket 数随数据增长变化 |
| Extendible Hashing | 使用目录和全局深度 |
| Linear Hashing | 渐进式分裂 bucket |

**对比**：

| 查询类型 | B+ 树 | Hash |
| --- | --- | --- |
| 等值查询 | 好 | 很好 |
| 范围查询 | 很好 | 差 |
| 排序输出 | 好 | 差 |
| 动态增长 | 好 | 需处理溢出 |

## 八、查询处理

### 8.1 查询处理流程

```text
SQL
 |
Parser
 |
Relational Algebra
 |
Optimizer
 |
Physical Plan
 |
Execution Engine
 |
Result
```

查询处理通常分为：

1. 解析与语义检查。
2. 转换为关系代数表达式。
3. 查询优化，选择代价较低的执行计划。
4. 执行物理算子。

### 8.2 查询代价模型

课程中常用磁盘 I/O 次数估计代价。

| 符号 | 含义 |
| --- | --- |
| \(b_r\) | 关系 \(r\) 的块数 |
| \(n_r\) | 关系 \(r\) 的元组数 |
| \(V(A,r)\) | 关系 \(r\) 中属性 \(A\) 的不同值数量 |
| \(M\) | 可用内存缓冲块数 |

### 8.3 选择运算

```sql
SELECT *
FROM instructor
WHERE dept_name = 'CS';
```

| 算法 | 适用条件 | 代价直觉 |
| --- | --- | --- |
| Linear Scan | 无索引或选择率高 | 扫描全表 |
| Binary Search | 文件按条件属性排序 | \(\log\) 定位后顺序读 |
| Primary Index | 主索引等值查 | 树高 + 少量数据页 |
| Secondary Index | 非聚簇索引 | 低选择率好，高选择率可能差 |

**易错点**：二级索引在返回很多记录时可能造成大量随机 I/O，不一定比全表扫描好。

### 8.4 外部排序

外部归并排序适合数据大于内存的排序。

```text
Pass 0: read M pages, sort in memory, write sorted runs
Pass 1..k: merge up to M-1 runs each pass
```

若关系有 \(b\) 个块，内存有 \(M\) 块：

- 初始 run 数约为 \(\lceil b/M \rceil\)。
- 每轮最多归并 \(M-1\) 个 run。

I/O 代价常按每轮读写全部数据估计。

### 8.5 Join 算法

#### Nested-loop Join

```text
for each tuple r in R:
    for each tuple s in S:
        if join_condition(r, s):
            output r join s
```

简单但代价高。

#### Block Nested-loop Join

```text
for each block Br in R:
    for each block Bs in S:
        compare tuples in Br and Bs
```

比 tuple nested-loop 更少 I/O。

#### Index Nested-loop Join

适合内层连接属性有索引：

```text
for each tuple r in R:
    use index on S.join_key to find matching S tuples
```

#### Merge Join

适合两个输入已按连接键排序：

```text
sort R on join key
sort S on join key
merge sorted streams
```

#### Hash Join

适合等值连接：

```text
partition R and S by hash(join_key)
for each partition pair:
    build hash table on smaller partition
    probe with other partition
```

| Join 算法 | 适用场景 |
| --- | --- |
| Nested-loop | 小表或无条件简单场景 |
| Block nested-loop | 内存能容纳外层若干块 |
| Index nested-loop | 内层有高效索引 |
| Merge join | 输入已排序或结果需要排序 |
| Hash join | 等值连接，大表连接常用 |

### 8.6 Materialization 与 Pipelining

| 执行方式 | 含义 | 优缺点 |
| --- | --- | --- |
| Materialization | 中间结果完整写出后再传给下个算子 | 简单，但占空间和 I/O |
| Pipelining | 上游产生一部分，下游立即消费 | 节省 I/O，但实现复杂 |

```text
Selection -> Projection -> Join
    |            |         |
    +--- pipeline stream --+
```

## 九、查询优化

### 9.1 为什么需要优化

同一个 SQL 可以有多个等价执行计划，但代价差异巨大。

```sql
SELECT *
FROM student
JOIN takes ON student.ID = takes.ID
WHERE student.dept_name = 'CS';
```

优先下推选择：

```text
先筛选 CS 学生，再与 takes 连接
```

通常比：

```text
先全量连接，再筛选 CS
```

更高效。

### 9.2 等价变换规则

常见优化规则：

- 选择下推：尽早减少行数。
- 投影下推：尽早减少列数。
- 连接交换律：\(r \bowtie s = s \bowtie r\)。
- 连接结合律：\((r \bowtie s) \bowtie t = r \bowtie (s \bowtie t)\)。
- 把笛卡尔积 + 选择转换为连接。
- 合并连续选择和投影。

### 9.3 代价估计

优化器依赖统计信息：

| 统计信息 | 用途 |
| --- | --- |
| 表大小 \(n_r\) | 估计扫描和连接代价 |
| 块数 \(b_r\) | 估计 I/O |
| distinct value \(V(A,r)\) | 估计选择率 |
| 直方图 | 处理数据倾斜 |
| 索引高度 | 估计索引查找成本 |

选择率估计例：

若 `dept_name` 有 \(V(dept_name, instructor)=20\) 个不同值，且假设均匀分布：

\[
selectivity(dept\_name='CS') \approx \frac{1}{20}
\]

### 9.4 Join Order

多表连接的连接顺序非常重要。

```text
R join S join T
```

可能计划：

```text
(R join S) join T
R join (S join T)
(R join T) join S
```

优化目标：尽量让中间结果小、可利用索引、避免不必要排序。

**考试写法**：

1. 估算每个选择后的行数。
2. 优先连接选择性强、结果小的关系。
3. 说明使用何种 join 算法。
4. 计算或比较 I/O 代价。

## 十、事务与可串行化

### 10.1 事务与 ACID

事务是一组数据库操作的逻辑工作单元。

| 性质 | 含义 |
| --- | --- |
| Atomicity | 原子性：要么全做，要么全不做 |
| Consistency | 一致性：事务把数据库从一个一致状态带到另一个一致状态 |
| Isolation | 隔离性：并发事务互不干扰，效果像串行执行 |
| Durability | 持久性：提交后的结果即使故障也不丢 |

```sql
BEGIN;
UPDATE account SET balance = balance - 100 WHERE id = 'A';
UPDATE account SET balance = balance + 100 WHERE id = 'B';
COMMIT;
```

若第二条失败，第一条也必须撤销。

### 10.2 调度

调度（schedule）是多个事务操作交错执行的顺序。

```text
S1:
T1: read(A)  write(A)          read(B) write(B)
T2:                  read(A) write(A)
```

DBMS 希望并发执行提高吞吐，但结果要等价于某个串行顺序。

### 10.3 冲突可串行化

两个操作冲突，当且仅当：

1. 属于不同事务；
2. 访问同一数据项；
3. 至少一个是 write。

冲突类型：

```text
read-write
write-read
write-write
```

判断冲突可串行化：画 precedence graph。

```text
T_i -> T_j
```

表示 \(T_i\) 的某个冲突操作必须在 \(T_j\) 前。

结论：

- 图无环：冲突可串行化。
- 图有环：不是冲突可串行化。

### 10.4 可恢复性

| 类型 | 要求 |
| --- | --- |
| Recoverable Schedule | 若 \(T_j\) 读了 \(T_i\) 写的数据，则 \(T_i\) 必须先于 \(T_j\) 提交 |
| Cascadeless Schedule | 事务只能读已提交数据 |
| Strict Schedule | 若事务写了数据，其他事务在其提交/中止前不能读写该数据 |

严格调度最常用，因为恢复简单。

## 十一、并发控制

### 11.1 锁

| 锁类型 | 含义 |
| --- | --- |
| Shared Lock | 共享锁，读锁 |
| Exclusive Lock | 排他锁，写锁 |

兼容矩阵：

| 请求/已有 | S | X |
| --- | --- | --- |
| S | 兼容 | 不兼容 |
| X | 不兼容 | 不兼容 |

### 11.2 两阶段锁协议

2PL（Two-Phase Locking）：

```text
Growing phase: 只能加锁，不能释放锁
Shrinking phase: 只能释放锁，不能加锁
```

性质：

- 保证冲突可串行化。
- 可能发生死锁。
- 不一定避免级联回滚。

Strict 2PL：

- 写锁持有到事务提交或中止。
- 常用于保证严格调度，便于恢复。

### 11.3 死锁

死锁示例：

```text
T1 holds X(A), waits for X(B)
T2 holds X(B), waits for X(A)
```

等待图：

```text
T1 -> T2
T2 -> T1
```

有环表示死锁。

处理方式：

- 死锁预防：按统一顺序加锁、时间戳策略。
- 死锁检测：周期性检查等待图。
- 死锁恢复：选择 victim 回滚。

### 11.4 时间戳协议

每个事务有时间戳 \(TS(T)\)，每个数据项维护：

| 字段 | 含义 |
| --- | --- |
| \(R\_timestamp(Q)\) | 成功读过 Q 的最大事务时间戳 |
| \(W\_timestamp(Q)\) | 成功写过 Q 的最大事务时间戳 |

基本思想：让操作效果符合时间戳顺序，太旧的事务若试图读写新值，可能被拒绝并回滚。

### 11.5 MVCC

MVCC（Multi-Version Concurrency Control）保存多个版本，让读操作读取合适版本，减少读写冲突。

```text
item A:
  version 1: value=100, valid from T1
  version 2: value=80,  valid from T5
```

优点：

- 读操作通常不阻塞写操作。
- 适合读多写少场景。

代价：

- 需要版本回收。
- 隔离级别和可见性判断更复杂。

## 十二、恢复系统

### 12.1 故障类型

| 类型 | 例子 | 恢复目标 |
| --- | --- | --- |
| Transaction Failure | 除零、约束违反、用户回滚 | 撤销该事务影响 |
| System Crash | 断电、操作系统崩溃 | 恢复内存中未落盘状态 |
| Disk Failure | 磁盘损坏 | 从备份和日志恢复 |

### 12.2 日志

日志记录用于支持 undo 和 redo。

常见日志记录：

```text
<T start>
<T, A, old_value, new_value>
<T commit>
<T abort>
```

### 12.3 Write-Ahead Logging

WAL 原则：

1. 数据页写入磁盘前，对应日志必须先写入稳定存储。
2. 事务提交前，commit 记录必须写入稳定存储。

```text
log record flushed
      |
      v
dirty data page may be written
```

WAL 是恢复系统的核心保障。

### 12.4 Undo 与 Redo

| 操作 | 作用 | 用于 |
| --- | --- | --- |
| Undo | 撤销未提交事务影响 | 保证原子性 |
| Redo | 重做已提交事务影响 | 保证持久性 |

崩溃后：

- 已提交但数据页没落盘的事务需要 redo。
- 未提交但部分数据页已落盘的事务需要 undo。

### 12.5 Checkpoint

检查点减少恢复时需要扫描的日志范围。

```text
... old log ... <checkpoint active_txns> ... recent log ...
```

恢复时可以从最近检查点附近开始，而不必从日志开头扫描。

### 12.6 ARIES 思想

ARIES 恢复大致分三阶段：

1. Analysis：确定崩溃时哪些事务活跃、哪些页可能脏。
2. Redo：重复历史，重做必要更新。
3. Undo：撤销崩溃时未提交事务。

!!! note "恢复题抓手"
    先区分事务是否已提交，再区分数据页是否可能已经写盘。提交不代表数据页一定写盘，未提交也不代表数据页一定没写盘。

## 十三、典型题型与解题模板

### 13.1 SQL 查询题

步骤：

1. 找出需要的表。
2. 写连接条件，避免笛卡尔积。
3. 用 `WHERE` 处理行过滤。
4. 用 `GROUP BY` 和 `HAVING` 处理分组。
5. 注意 `NULL`、重复值和外连接。

### 13.2 关系代数题

步骤：

1. 先用 \(\sigma\) 选择行。
2. 再用 \(\bowtie\) 连接关系。
3. 最后用 \(\Pi\) 投影需要属性。
4. 需要重名时使用 \(\rho\) 重命名。

### 13.3 范式与分解题

步骤：

1. 用属性闭包找候选码。
2. 对每个 FD 判断左侧是否超码。
3. 若违反 BCNF，按 \(R_1=X\cup Y\)、\(R_2=R-(Y-X)\) 分解。
4. 检查无损连接。
5. 检查是否依赖保持。
6. 若要求依赖保持，考虑 3NF 综合算法。

### 13.4 B+ 树题

步骤：

1. 明确阶数、最大键数、最小占用。
2. 插入时先放叶子，满则分裂。
3. 分裂后把分隔键插入父结点。
4. 删除时先删叶子，不足则借或合并。
5. 画树时保持所有叶子同层。

### 13.5 查询代价题

步骤：

1. 写出关系块数、元组数、可用缓冲块数。
2. 判断使用的物理算法。
3. 对选择、排序、连接分别估算 I/O。
4. 比较多个计划时重点看中间结果大小和随机 I/O。

### 13.6 可串行化题

步骤：

1. 列出每个事务的 read/write 操作。
2. 找不同事务、同一数据项、至少一个写的冲突。
3. 按先后顺序画有向边。
4. 图无环则可串行化，并给出拓扑序。
5. 图有环则不可冲突串行化。

### 13.7 恢复题

步骤：

1. 找到 crash 前已 commit 的事务。
2. 找到 crash 时未 commit 的事务。
3. 已提交事务可能需要 redo。
4. 未提交事务需要 undo。
5. 检查 WAL：数据页写盘前日志是否已经落盘。

## 十四、高频易错点

| 知识点 | 易错说法 | 正确理解 |
| --- | --- | --- |
| 候选码 | 任意能唯一标识的属性集都是候选码 | 候选码还要求最小性 |
| 外码 | 外码必须引用同名属性 | 名称可不同，但引用目标通常是主码/候选码 |
| `NULL` | `NULL = NULL` 为 true | SQL 中结果是 unknown |
| `WHERE` vs `HAVING` | 都能过滤分组 | `WHERE` 过滤行，`HAVING` 过滤组 |
| 自然连接 | 总是安全简洁 | 会按所有同名属性连接，可能误连 |
| 1NF | 表有主键就是 1NF | 关键是属性值原子 |
| BCNF | 总能保持依赖 | BCNF 分解可能不依赖保持 |
| 3NF | 一定没有冗余 | 允许少量冗余以保持依赖 |
| B+ 树 | 数据在所有结点 | 数据项通常在叶子，内部结点作导航 |
| Hash 索引 | 范围查询也快 | Hash 主要适合等值查询 |
| 二级索引 | 一定比全表扫描快 | 低选择率时可能随机 I/O 很多 |
| 2PL | 不会死锁 | 2PL 保证可串行化，但可能死锁 |
| 可串行化 | 等于串行执行 | 并发交错执行，只要效果等价于某个串行顺序 |
| `COMMIT` | 数据页一定已写盘 | 日志必须落盘，数据页可稍后写 |
| Redo/Undo | 二者任选其一 | 已提交可能 redo，未提交需要 undo |

## 十五、重难点速查

### 15.1 关键公式与判定

| 内容 | 公式/判定 |
| --- | --- |
| 属性闭包 | 反复用 \(X \to Y\) 扩张属性集 |
| 超码判定 | 若 \(X^+\) 包含 \(R\) 全部属性，则 \(X\) 是超码 |
| 二元无损分解 | \((R_1 \cap R_2) \to R_1\) 或 \((R_1 \cap R_2) \to R_2\) |
| BCNF | 每个非平凡 FD 左侧都是超码 |
| 3NF | 左侧是超码，或右侧属性是 prime attribute |
| AMAT 类查询代价 | 常以磁盘 I/O 次数为主要成本 |
| 冲突可串行化 | precedence graph 无环 |
| 可用性类比 | 事务恢复中提交事务 redo，未提交事务 undo |

### 15.2 SQL 速查

```sql
-- join
SELECT s.ID, s.name, t.course_id
FROM student AS s
JOIN takes AS t ON s.ID = t.ID;

-- group by
SELECT dept_name, AVG(salary)
FROM instructor
GROUP BY dept_name
HAVING AVG(salary) > 70000;

-- exists
SELECT s.ID, s.name
FROM student AS s
WHERE EXISTS (
    SELECT 1
    FROM takes AS t
    WHERE t.ID = s.ID AND t.course_id = 'CS101'
);

-- transaction
BEGIN;
UPDATE account SET balance = balance - 100 WHERE id = 'A';
UPDATE account SET balance = balance + 100 WHERE id = 'B';
COMMIT;
```

### 15.3 复习路线

第一轮：建立概念框架。

1. DBMS 架构、三层抽象、数据独立性。
2. 关系模型、码、完整性约束。
3. SQL 基本查询、连接、分组、子查询。
4. ER 图到关系表。

第二轮：攻克设计与理论。

1. 函数依赖与属性闭包。
2. 候选码求解。
3. 无损连接与依赖保持。
4. BCNF/3NF/4NF 判断和分解。

第三轮：攻克系统实现。

1. 页、记录、文件组织、Buffer。
2. B+ 树与 Hash 索引。
3. 查询处理算法和代价估计。
4. 查询优化的等价变换和 join order。

第四轮：攻克事务。

1. ACID 与调度。
2. 冲突可串行化。
3. 2PL、死锁、时间戳、MVCC。
4. WAL、checkpoint、undo/redo、ARIES。

## 十六、参考资料

- Abraham Silberschatz, Henry F. Korth, S. Sudarshan.《数据库系统概念（第七版）》。
- WintermelonC Docs：[数据库系统](https://wintermelonc.github.io/WintermelonC_Docs/zju/compulsory_courses/database_system/)，用于参考课程章节结构与复习资料入口。
- WintermelonC Docs 数据库系统章节：Introduction、Introduction to the Relational Model、Introduction to SQL、Advanced SQL、Entity-Relationship Model、Relational Database Design、Storage and File Structure、Indexing and Hashing、Query Processing、Query Optimization、Transactions、Concurrency Control、Recovery System。

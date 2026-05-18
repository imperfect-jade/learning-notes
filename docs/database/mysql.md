图形化界面教程
[MySQL Workbench基本用法_mysql workbench怎么运行-CSDN博客](https://blog.csdn.net/potato123232/article/details/128528266?ops_request_misc=elastic_search_misc&request_id=590455ffd12ced8adc6035072fee919a&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-128528266-null-null.142%5Ev102%5Epc_search_result_base2&utm_term=mysql%20workbench%E4%BD%BF%E7%94%A8%E6%95%99%E7%A8%8B&spm=1018.2226.3001.4187)


JDBC教程
[【MySQL】使用 JDBC 连接数据库_mysql jdbc-CSDN博客](https://blog.csdn.net/flmz_kk/article/details/142747849?ops_request_misc=elastic_search_misc&request_id=29c9d7aacf14579867ebef3b8be5d1ce&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_click~default-2-142747849-null-null.142^v102^pc_search_result_base2&utm_term=jdbc%E8%BF%9E%E6%8E%A5mysql&spm=1018.2226.3001.4187)
[JDBC 连接 MySQL_jdbc连接mysql-CSDN博客](https://blog.csdn.net/aasd23/article/details/124218870?ops_request_misc=elastic_search_misc&request_id=29c9d7aacf14579867ebef3b8be5d1ce&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-124218870-null-null.142^v102^pc_search_result_base2&utm_term=jdbc%E8%BF%9E%E6%8E%A5mysql&spm=1018.2226.3001.4187)

大程教程
https://blog.csdn.net/weixin_49614712/article/details/142899300?spm=1001.2014.3001.5502

# 存储引擎

InnoDB是MySQL的默认存储引擎，支持事务、外键、行级锁。

# 数据类型 

- char(n) 指定长度为n的字符串
- varchar(n) 最大长度为n的可变长度的字符串
- int 整数
- smallint 小整数
- numeric(p, d) 指定精度的定点数，p位数字，保留小数点后d位
- real, double precision 浮点数与双精度浮点数
- float(n) 精度至少为n位数字的浮点数

# DDL
## 数据库操作
### 查询

查询所有数据库
```SQL
SHOW DTABASES;
```

查询当前数据库
```SQL
SELECT DATABASE();
```

### 创建

创建数据库
```SQL
CREATE DATABASE [IF NOT EXISTS] 数据库名 [DEFAULT CHARSET 字符集] [COLLATE 排序规则];
```

### 删除
```SQL
DROP DATABASE [IF EXISTS] 数据库名;
```

### 使用

```SQL
USE 数据库名;
```

## 表操作

### 查询

查询当前数据库所有表
```SQL
SHOW TABLES;
```

查询表结构
```SQL
DESC 表名;
```

查询指定表的建表语句
```SQL
SHOW CREATE TABLE 表名;
```

### 创建

创建表
```SQL
CREATE TABLE 表名(
	字段1 字段1类型[COMMENT 字段1注释],
	字段2 字段2类型[COMMENT 字段2注释],
	字段3 字段3类型[COMMENT 字段3注释],
	字段n 字段n类型[COMMENT 字段n注释]
)[COMMENT 表注释];
```

### 约束

约束表中的字段，保证正确性、有效性、完整性

| 约束   | 描述                   | 关键字         |
| ---- | -------------------- | ----------- |
| 非空约束 | 限制字段不能为null          | NOT NULL    |
| 唯一约束 | 保证该字段数据不重复           | UNIQUE      |
| 主键约束 | 确定该字段为主键，非空且唯一       | PRIMARY KEY |
| 默认约束 | 未指定该字段的值则使用默认值       | DEFAULT     |
| 检查约束 | 检查字段值满足条件            | CHECK       |
| 外键约束 | 将两张表建立连接，外键需为另一个表的主键 | FOREIGN KEY |

```SQL
create table instructor(
	ID           varchar(5),
	name         varchar(20) not null,
	dept_name    varchar(20),
	salary       numeric(8,2) check(salary>29000),
	primary key (ID),
	foreign key (dept_name) references department
);
```

给约束赋名
```SQL
salary numeric(8,2), constraint minsalary check(salary>29000);
alter table instructor drop constraint minsalary;
```

**外键约束**

| 行为          | 说明                                  |
| ----------- | ----------------------------------- |
| NO ACTION   | 在父表中删改记录时，检查是否存在对应外键，如果有则不允许删改      |
| RESTRICT    | 在父表中删改记录时，检查是否存在对应外键，如果有则不允许删改      |
| CASCADE     | 在父表中删改记录时，检查是否存在对应外键，如果有则同步删改子表     |
| SET NULL    | 在父表中删除记录时，检查是否存在对应外键，如果有则将子表值置为null |
| SET DEFAULT | 在父表中删除记录时，检查是否存在对应外键，如果有则将子表值置为默认值  |

```SQL
foreign key (dept_name) references department on delete cascade on update cascade
```


### 修改

添加字段
```SQL
ALTER TABLE 表名 ADD 字段名 类型(长度) [COMMENT 注释] [约束];
```

修改数据类型
```SQL
ALTER TABLE 表名 MODIFY 字段名 新数据类型(长度);
```

修改字段名和字段类型
```SQL
ALTER TABLE 表名 CHANGE 旧字段名 新字段名 类型(长度) [COMMENT 注释] [约束];
```

删除字段
```SQL
ALTER TABLE 表名 DROP 字段名;
```

修改表名
```SQL
ALTER TABLE 表名 RENAME TO 新表名;
```

非空约束
```SQL
ALTER TABLE 表名 MODIFY 字段名 字段类型 NOT NULL;
```

唯一约束
```SQL
-- 指定约束名
ALTER TABLE 表名 ADD [CONSTRAINT 约束名] UNIQUE(字段名);
```

主键约束
```SQL
ALTER TABLE 表名 ADD PRIMARY KEY(字段名);
```
> 注意：一个表仅能存在一个主键，添加前需确保表中无现有主键，且目标字段值满足非空、唯一要求。

默认约束
```SQL
ALTER TABLE 表名 MODIFY 字段名 字段类型 DEFAULT 默认值;
```

检查约束
```SQL
ALTER TABLE 表名 ADD [CONSTRAINT 约束名] CHECK(约束条件);
```

外键约束
```SQL
ALTER TABLE 子表名 ADD CONSTRAINT 外键名 FOREIGN KEY(外键字段名) REFERENCES 主表名(主表主键字段) ON DELETE CASCADE ON UPDATE CASCADE;
```

### 删除

删除表
```SQL
DROP TABLE [IF EXISTS] 表名;
```

删除指定表，并重新创建该表
```SQL
TRUNCATE TABLE 表名;
```

---

# DML

### 增

给指定字段添加数据
```SQL
INSERT INTO 表名 (字段1,字段2,……) VALUES(值1,值2,……);
```

给全部字段添加数据
```SQL
INSERT INTO 表名 VALUES(值1,值2,……);
```

批量添加数据
```SQL
INSERT INTO 表名(字段名1,字段名2,……) VALUES(值1,值2,……),(值1,值2,……),(值1,值2,……);
INSERT INTO 表名 VALUES(值1,值2,……),(值1,值2,……),(值1,值2,……);
```

### 改

修改数据
```SQL
UPDATE 表名 SET 字段名1=值1,字段名2=值2,…… [WHERE 条件];
```

删除数据
```SQL
DELETE FROM 表名 [WHERE 条件];
```

---

# DQL

## 查询
```SQL
SELECT          # 4
	字段列表
FROM            # 1
	表名列表
WHERE           # 2
	条件列表
GROUP BY        # 3
	分组字段列表
HAVING
	分组后条件列表
ORDER BY        # 5
	排序字段列表
LIMIT           # 6
	分页参数
```

查询多个字段
```SQL
SELECT 字段1, 字段2, 字段3, …… FROM 表名;

SELECT * FROM 表名;
```

设置别名
```SQL
SELECT 字段1 [AS 别名1], 字段2 [AS 别名2] …… FROM 表名;
```

去除重复记录
```SQL
SELECT DISTINCT 字段列表 FROM 表名;
```

### 条件查询 WHERE

| 比较运算符                 | 功能                          |
| --------------------- | --------------------------- |
| `>`                   | 大于                          |
| `>=`                  | 大于等于                        |
| `<`                   | 小于                          |
| `<=`                  | 小于等于                        |
| `=`                   | 等于                          |
| `<>` 或 `!=`           | 不等于                         |
| `BETWEEN ... AND ...` | 在某个范围之内 (含最小、最大值)           |
| `IN(...)`             | 在 in 之后的列表中的值，多选一           |
| `LIKE 占位符`            | 模糊匹配 (`_`匹配单个字符，`%`匹配任意个字符) |
| `IS NULL`             | 是 NULL                      |
| AND &&                | 并且                          |
| OR \|\|               | 或者                          |
| NOT !                 | 非                           |

### 集合运算

并集
```SQL
(SELECT course_id FROM section WHERE semester='Fall')
UNION [ALL]
(SELECT course_id FROM section WHERE semester='Spring')
```

交集
```SQL
(SELECT course_id FROM section WHERE semester='Fall')
INTERSECT [ALL]
(SELECT course_id FROM section WHERE semester='Spring')
```

差运算
```SQL
(SELECT course_id FROM section WHERE semester='Fall')
EXCEPT
(SELECT course_id FROM section WHERE semester='Spring')
```

### 连接查询

用于多表关联获取数据

| 连接类型 | 描述 | 关键字 |
| ---- | -------------------- | ----------- |
| 内连接 | 返回两表满足连接条件的交集数据 | INNER JOIN / JOIN |
| 左外连接 | 返回左表全部数据，右表无匹配则填充null | LEFT OUTER JOIN / LEFT JOIN |
| 右外连接 | 返回右表全部数据，左表无匹配则填充null | RIGHT OUTER JOIN / RIGHT JOIN |
| 自连接 | 表与自身关联查询，需用别名区分 | 无特定关键字 |

```SQL
SELECT 字段列表 FROM 表1 JOIN 表2 ON 条件;
SELECT 字段列表 FROM 表1 LEFT JOIN 表2 ON 条件;
SELECT 字段列表 FROM 表1 RIGHT JOIN 表2 ON 条件;
SELECT 字段列表 FROM 表名 别名A JOIN 表名 别名B ON 条件;

SELECT e.name, d.dept_name FROM emp e JOIN dept d ON e.dept_id = d.id;

SELECT e.name emp_name, m.name manager_name FROM emp e JOIN emp m ON e.manager_id = m.id;
```

### 子查询

嵌套在SQL中的查询语句
子查询外部的语句可以是INSERT /UPDATE/DELETE/SELECT的任何一个

| 子查询类型 | 说明       |
| ----- | -------- |
| 标量子查询 | 查询结果为单个值 |
| 列子查询  | 查询结果为一列  |
| 行子查询  | 查询结果为一行  |
| 表子查询  | 查询结果为表   |


```SQL
# 标量子查询（返回单个值）
SELECT name FROM emp WHERE dept_id = (SELECT id FROM dept WHERE dept_name = '研发部');

# 列子查询（返回单列多行） 
# 常用操作符为 IN、 NOT IN、 ANY、 SOME、 ALL
SELECT name FROM emp WHERE dept_id IN (SELECT id FROM dept WHERE dept_name IN ('研发部','市场部'));

# 行子查询（返回单行多列）
SELECT name FROM emp WHERE (salary, managerid) = (SELECT salary, managerid FROM emp WHERE name = '张三');

# 表子查询（返回多行多列）
SELECT e.* d.* FROM (SELECT * FROM emp WHERE age > 30) e LEFT JOIN dept d ON e.dept_id = d.id;
```

### IN与EXISTS的区别

IN和EXISTS都用于子查询中的条件判断，但执行逻辑和适用场景存在显著差异：

|维度|IN 子查询|EXISTS 子查询|
|---|---|---|
|执行逻辑|先执行子查询，得到结果集后，主查询再匹配该结果集（**先子后主**）|先执行主查询的每一行数据，代入子查询判断是否存在满足条件的记录（**先主后子**）|
|结果集要求|子查询必须返回单列数据，主查询字段与该列进行匹配|子查询无列数限制，只需判断是否存在符合条件的记录（通常用`SELECT 1`代替具体字段以提升性能）|
|性能适用场景|适合**子查询结果集较小**的场景，子查询结果会被加载到内存中做匹配|适合**主查询结果集较小**的场景，主查询每一行触发一次子查询，主数据量小则总执行次数少|
|NULL值处理|若子查询结果包含NULL，`x IN (NULL)`会返回NULL，无法匹配任何行|子查询中的NULL不影响判断，只要存在满足条件的记录就返回true|


```sql
# IN子查询：查询属于研发部或市场部的员工
SELECT name, dept_id FROM emp WHERE dept_id IN (SELECT id FROM dept WHERE dept_name IN ('研发部','市场部'));

# EXISTS子查询：查询有下属的管理者员工
SELECT name AS manager_name FROM emp m
WHERE EXISTS (SELECT 1 FROM emp e WHERE e.manager_id = m.id);
```

### 公共表表达式（WITH）

WITH子句用于定义**临时公共表表达式（CTE）**，可以将复杂的子查询逻辑封装为可复用的临时表，简化SQL语句的可读性和维护性，尤其适合多次使用相同子查询的场景，支持递归查询层级数据。

```sql
# 定义单个临时表
WITH 临时表名 AS (子查询语句)
SELECT 字段列表 FROM 临时表名 [WHERE 条件];

# 定义多个临时表，用逗号分隔
WITH 临时表名1 AS (子查询语句1),
     临时表名2 AS (子查询语句2)
SELECT 字段列表 FROM 临时表名1 JOIN 临时表名2 ON 关联条件;
```


```sql
-- 示例1：统计每个部门的平均工资，查询平均工资高于6000的部门
WITH dept_avg_sal AS (
    SELECT dept_id, AVG(salary) avg_salary FROM emp GROUP BY dept_id
)
SELECT d.dept_name, das.avg_salary
FROM dept_avg_sal das
JOIN dept d ON das.dept_id = d.id
WHERE das.avg_salary > 6000;
```

### 聚合函数

将一列数据作为一个整体，进行纵向计算

| 函数    | 功能   |
| ----- | ---- |
| count | 统计数量 |
| max   | 最大值  |
| min   | 最小值  |
| avg   | 平均值  |
| sum   | 求和   |
```SQL
SELECT 聚合函数(字段名) FROM 表名;
```

### 分组查询

```SQL
SELECT 字段列表 FROM 表名 [WHERE 条件] GROUP BY 分组字段名 [HAVING 分组后过滤条件];
```

- where是分组前进行过滤，不满足where条件的不参与分组；having是分组后进行过滤
- where中不能使用聚合函数，having中可以使用聚合函数

```SQL
# 查询年龄小于45的员工，并根据工作地点分组，获取员工数量大于等于3的工作地址
select workaddress, count(*) address_count from emp where age<45 group by workaddress having address_count >= 3;
```

### 排序查询

```SQL
SELECT 字段列表 FROM 表名 ORDER BY 字段名1 排序方式1， 字段名2 排序方式2;
```

```SQL
# 先按照年龄升序排序，如果年龄相同，按照入职时间降序排序
select * from emp order by age asc, entrydate desc;
```

### 分页查询

```SQL
SELECT 字段列表 FROM 表名 LIMIT 起始索引, 查询记录数;
```
- 起始索引从0开始，起始索引=（查询页码-1）* 每页记录数

---

# DCL
## 管理用户

查询用户
```SQL
USE mysql;
SELECT * FROM user;
```

创建用户
```SQL
CREATE USER '用户名'@'主机名' IDENTIFIED BY '密码';
```

修改用户密码
```SQL
ALTER USER '用户名'@'主机名' IDENTIFIED WITH mysql_native_password BY '新密码';
```

删除用户
```SQL
DROP USER '用户名'@'主机名';
```

## 权限控制

| 权限                 | 说明         |
| ------------------ | ---------- |
| ALL，ALL PRIVILEGES | 所有权限       |
| SELECT             | 查询权限       |
| INSERT             | 插入数据       |
| UPDATE             | 修改数据       |
| DELETE             | 删除数据       |
| ALTER              | 修改表        |
| DROP               | 删除数据库/表/视图 |
| CREATE             | 创建数据库/表    |

查询权限
```SQL
SHOW GRANTS FOR '用户名'@'主机名';
```

授予权限
```SQL
GRANT 权限列表 ON 数据库名.表名 TO '用户名'@'主机名';
```

撤销权限
```SQL
REVOKE 权限列表 ON 数据库名.表名 FROM '用户名'@'主机名';
```

---

# 函数

## 字符串函数

| 函数                         | 功能                    |
| -------------------------- | --------------------- |
| CONCAT(S1, S2, …… Sn)      | 字符串拼接                 |
| LOWER(str)                 | 字符串转小写                |
| UPPER(str)                 | 字符串转大写                |
| LPAD(str, n, pad)          | 在str左侧填充pad至字符串长度为n   |
| RPAD(str, n, pad)          | 在str右侧填充pad至字符串长度为n   |
| TRIM(str)                  | 去掉字符串头部和尾部的空格         |
| SUBSTRING(str, start, len) | 返回从字符串start位置起的len个字符 |
```SQL
SELECT CONCAT(name, ' - ', dept_name) AS emp_info FROM emp;
```

## 数值函数

| 函数         | 功能            |
| ---------- | ------------- |
| CEIL(x)    | 向上取整          |
| FLOOR(x)   | 向下取整          |
| MOD(x,y)   | 返回x%y         |
| RAND()     | 返回0~1的随机数     |
| ROUND(x,y) | 对x四舍五入，保留y位小数 |

## 日期函数

| 函数                                 | 功能                      |
| ---------------------------------- | ----------------------- |
| CURDATE()                          | 返回当前日期                  |
| CURTIME()                          | 返回当前时间                  |
| NOW()                              | 返回当前日期和时间               |
| YEAR(date)                         | 获取date的年份               |
| MONTH(date)                        | 获取date的月份               |
| DAY(date)                          | 获取date的日期               |
| DATE_ADD(date, INTERVAL expr type) | 返回date加上一个时间间隔expr后的时间值 |
| DATEDIFF(date1, date2)             | 返回date1与date2之间的天数      |
```SQL
# 查询入职30天以上的员工
SELECT name FROM emp WHERE DATEDIFF(NOW(), entrydate) > 30;
```

## 流程函数

| 函数                                                      | 功能                                      |
| ------------------------------------------------------- | --------------------------------------- |
| IF(value, t, f)                                         | 如果value为true则返回t，否则返回f                  |
| IFNULL(value1, value2)                                  | 如果value1不为空，返回value1，否则返回value2         |
| CASE WHEN [val1] THEN [res1] ……ELSE [default] END       | 如果val1为true，返回res1，……，否则返回default默认值    |
| CASE [expr] WHEN [val1] THEN [res1]……ELSE [default] END | 如果expr的值等于val1，返回res1，……，否则返回default默认值 |
```SQL
# 根据工资返回等级
SELECT name, salary,
CASE 
    WHEN salary > 15000 THEN '高薪'
    WHEN salary > 8000 THEN '中薪'
    ELSE '底薪'
END AS salary_level
FROM emp;
```


---

# 事务

一组不可分割的数据库操作序列，保证数据一致性，遵循ACID特性。

## 事务的特性与操作

| 特性 | 描述 |
| ---- | -------------------- |
| 原子性 | 操作要么全部成功，要么全部回滚 |
| 一致性 | 事务前后数据完整性约束保持一致 |
| 隔离性 | 多事务并发执行时互不干扰 |
| 持久性 | 事务提交后修改永久生效 |

```SQL
# 查看提交方式
SELECT @@autocommit;

# 设置手动提交
SET @@autocommit = 0;

# 开启事务
START TRANSACTION;

# 提交事务
COMMIT;

# 回滚事务
ROLLBACK;

# 保存点
SAVEPOINT sp1;

# 回滚到指定位置
ROLLBACK TO sp1;
```

## 事务隔离级别

| 隔离级别 | 解决并发问题 | 性能 |
| ---- | -------------------- | ----------- |
| READ UNCOMMITTED | 无 | 最高 |
| READ COMMITTED | 脏读 | 较高 |
| REPEATABLE READ | 脏读、不可重复读 | 中等 |
| SERIALIZABLE | 所有并发问题（脏读/不可重复读/幻读） | 最低 |

---

# 索引

帮助MySQL高效获取数据的数据结构，降低查询IO成本。

## 常见索引类型
| 索引类型 | 适用场景                  |     |
| ---- | --------------------- | --- |
| 主键索引 | 主键字段自动创建，唯一非空，加速主键查询  |     |
| 唯一索引 | 字段值唯一（允许null），加速唯一值查询 |     |
| 普通索引 | 无约束，加速普通字段查询          |     |
| 联合索引 | 多字段组合创建，遵循**最左前缀原则**  |     |
| 全文索引 | 长文本内容的全文检索            |     |

## 索引操作
```SQL
# 查看索引
SHOW INDEX FROM 表名;

# 创建普通索引
CREATE INDEX 索引名 ON 表名(字段名);

# 创建联合索引
CREATE INDEX 索引名 ON 表名(字段名, ……);

# 删除索引
DROP INDEX 索引名 ON 表名;
```

# 视图

视图是基于一个或多个表（或其他视图）创建的**虚拟表**，本身不存储实际数据，仅保存查询逻辑，数据来源于原表，原表数据变化时视图结果同步更新。

核心作用：
- 简化复杂查询：将多表关联、聚合计算等复杂逻辑封装为视图，用户直接查询视图即可获取结果，无需重复编写复杂SQL。
- 保障数据安全：隐藏原表中的敏感字段，仅向用户暴露必要的数据内容。
- 统一数据接口：原表结构变更时，只需修改视图的查询逻辑，不影响用户的查询操作，实现数据访问与底层结构的解耦。

## 视图操作

### 查询视图

查询当前数据库所有视图
```SQL
SHOW TABLES WHERE TABLE_TYPE = 'VIEW';
```

查询视图结构
```SQL
DESC 视图名;
```

查询视图的创建语句
```SQL
SHOW CREATE VIEW 视图名;
```

### 创建视图
```SQL
CREATE [OR REPLACE] VIEW 视图名[(自定义列名列表)]
AS SELECT语句
[WITH [CASCADED | LOCAL] CHECK OPTION];
```
参数说明：
- `OR REPLACE`：若视图已存在，则覆盖原视图定义
- `WITH CHECK OPTION`：保证通过视图插入/修改的数据，必须满足视图的查询条件
  - `CASCADED`（默认）：检查当前视图及所有依赖的上游视图的条件
  - `LOCAL`：仅检查当前视图的条件

```SQL
# 创建视图，展示员工姓名、所属部门、工资信息
CREATE VIEW emp_dept_view
AS
SELECT e.name AS 员工姓名, d.dept_name AS 部门名称, e.salary AS 工资
FROM emp e
JOIN dept d ON e.dept_id = d.id;

# 创建带检查选项的视图，仅展示工资大于5000的员工，且修改时不能低于5000
CREATE VIEW high_sal_emp_view
AS
SELECT name, salary, dept_id
FROM emp
WHERE salary > 5000
WITH CASCADED CHECK OPTION;
```

### 修改视图

使用`CREATE OR REPLACE`覆盖原视图
```SQL
CREATE OR REPLACE VIEW 视图名 AS 新的查询语句;
```

使用`ALTER`语句修改
```SQL
ALTER VIEW 视图名 AS 新的查询语句;
```

### 删除视图
```SQL
DROP VIEW [IF EXISTS] 视图名1, 视图名2, ...;
```

## 视图的更新

视图是否可更新，取决于其定义的查询逻辑，以下场景视图**不可更新**：
- 视图查询包含聚合函数（`COUNT`/`SUM`/`AVG`等）、`DISTINCT`、`GROUP BY`、`HAVING`、`UNION`/`UNION ALL`
- 视图查询包含子查询
- 视图由多表`JOIN`创建，且更新的字段来自多个表
- 视图带`WITH CHECK OPTION`，且修改操作违反视图的查询条件

可更新视图的修改操作：
```SQL
-- 通过视图修改员工工资（需满足视图的检查条件）
UPDATE high_sal_emp_view
SET salary = 6500
WHERE name = '张三';

-- 通过视图插入新员工（需满足视图的检查条件）
INSERT INTO high_sal_emp_view(name, salary, dept_id)
VALUES ('李四', 7000, 2);
```

---

# 触发器
触发器是与数据表关联的特殊存储逻辑，当目标表执行`INSERT`/`UPDATE`/`DELETE`等DML操作时，会自动触发执行预设的SQL语句，常用于实现数据自动校验、日志记录、数据同步等场景，保障数据的一致性与完整性。

## 触发器类型
触发器根据触发时机和触发事件的不同，分为以下6种类型：

| 触发时机 | 触发事件 | 说明 |
| ---- | ---- | ---- |
| BEFORE | INSERT | 在向表中插入记录**之前**触发执行 |
| BEFORE | UPDATE | 在更新表中记录**之前**触发执行 |
| BEFORE | DELETE | 在删除表中记录**之前**触发执行 |
| AFTER | INSERT | 在向表中插入记录**之后**触发执行 |
| AFTER | UPDATE | 在更新表中记录**之后**触发执行 |
| AFTER | DELETE | 在删除表中记录**之后**触发执行 |

在触发器逻辑中，可通过关键字访问变更前后的数据：
- `NEW`：代表触发事件产生的新数据，仅在`INSERT`/`UPDATE`触发时可用
- `OLD`：代表触发事件前的旧数据，仅在`UPDATE`/`DELETE`触发时可用

## 触发器操作
### 创建触发器
```SQL
CREATE TRIGGER 触发器名
触发时机 触发事件 ON 关联表名
FOR EACH ROW  -- 行级触发器：每一条数据变更都会触发一次
BEGIN
    -- 触发器执行的SQL逻辑（单条或多条语句）
END 
```

**示例**：创建日志触发器，当员工表新增记录时，自动插入操作日志到日志表
```SQL
CREATE TABLE emp_operation_log(
    log_id INT PRIMARY KEY AUTO_INCREMENT COMMENT '日志ID',
    emp_id INT COMMENT '员工ID',
    operate_action VARCHAR(20) COMMENT '操作类型',
    operate_time DATETIME DEFAULT NOW() COMMENT '操作时间'
) COMMENT '员工操作日志表';

CREATE TRIGGER trg_emp_after_insert
AFTER INSERT ON emp
FOR EACH ROW
BEGIN
    INSERT INTO emp_operation_log(emp_id, operate_action)
    VALUES(NEW.id, '新增员工');
END 
```

### 查看触发器
```SQL
-- 查看当前数据库所有触发器
SHOW TRIGGERS;

-- 查看指定触发器的创建语句
SHOW CREATE TRIGGER 触发器名;
```

### 删除触发器
```SQL
DROP TRIGGER [IF EXISTS] 触发器名;
```

## 触发器注意事项
- 触发器为**行级触发**，批量操作（如批量插入1000条数据）时会触发对应次数，显著影响性能，需谨慎使用
- 触发器中不能执行返回结果集的语句（如`SELECT * FROM 表名`），仅支持DML语句（INSERT/UPDATE/DELETE）
- 避免在触发器中修改触发源表的数据，可能导致递归触发，引发死循环
- 触发器执行逻辑隐式，问题排查难度大，生产环境建议优先使用应用程序逻辑实现，而非过度依赖触发器

---

# 自定义函数
MySQL内置函数可满足大部分基础需求，自定义函数是用户根据业务需求编写的可复用SQL逻辑，**必须返回单个值**，可在SELECT语句、WHERE条件或其他SQL中直接调用。

## 创建自定义函数
```SQL
CREATE FUNCTION 函数名(参数1 参数类型, 参数2 参数类型, ...)
RETURNS 返回值类型
BEGIN
    -- 函数逻辑处理
    RETURN 返回值;  # 必须有RETURN语句返回结果
END
```

```SQL
create function dept_count(dept_name varchar(20))
returns integer
begin
    declare d_count integer;
    select count(*) into d_count
    from instructor
    where instructor.dept_name = dept_name
return d_count;
end

create function instructor_of(dept_name varchar(20))
returns table (
    ID varchar(5),
    name varchar(20),
    dept_name varchar(20),
    salary numeric(8, 2)
)
return table (
    select ID, name, dept_name, salary
    from instructor
    where instructor.dept_name = instructor_of.dept_name
);

CREATE FUNCTION calc_annual_salary(salary NUMERIC(8,2))
RETURNS NUMERIC(10,2)
BEGIN
    RETURN salary * 13;
END
```

## 调用自定义函数
```SQL
-- 在SELECT语句中调用，查询员工姓名、月薪、年薪
SELECT name, salary, calc_annual_salary(salary) AS annual_salary FROM emp;

-- 在WHERE条件中调用，筛选年薪大于10万的员工
SELECT name, salary FROM emp WHERE calc_annual_salary(salary) > 100000;
```

## 查看自定义函数
```SQL
-- 查看当前数据库所有自定义函数
SHOW FUNCTION STATUS WHERE Db = '你的数据库名';

-- 查看指定函数的创建语句
SHOW CREATE FUNCTION 函数名;
```

## 删除自定义函数
```SQL
DROP FUNCTION [IF EXISTS] 函数名;
```


# 存储过程

存储过程是一组预编译的SQL语句集合，预先存储在MySQL服务器中，可通过指定名称直接调用，用于封装复杂的业务逻辑。
- **核心优点**：
  - 封装复杂SQL逻辑，简化应用层调用
  - 预编译执行，重复调用时无需重新解析，提升执行效率
  - 减少应用与数据库的网络传输量（仅传递调用指令）
  - 提高代码复用性，统一业务逻辑实现
  - 增强安全性，可通过权限控制限制存储过程的调用范围

## 存储过程基本语法

### 创建存储过程
```SQL
# 修改语句分隔符（避免与存储过程内的;冲突）
DELIMITER //

CREATE PROCEDURE 存储过程名([参数列表])
BEGIN
    # 存储过程执行的SQL语句集合
    # 可包含变量定义、条件判断、循环等逻辑
END //

# 恢复默认分隔符
DELIMITER ;

# 调用存储过程
CALL 存储过程名([参数值列表]);
```

```SQL
DELIMITER //
CREATE PROCEDURE getAllEmployees()
BEGIN
    SELECT id, name, salary, entrydate, dept_id FROM emp;
END //
DELIMITER ;

-- 调用
CALL getAllEmployees();
```

### 查看存储过程
```SQL
# 查看当前数据库所有存储过程
SHOW PROCEDURE STATUS WHERE Db = '数据库名';

# 查看指定存储过程的创建语句
SHOW CREATE PROCEDURE 存储过程名;
```

### 删除存储过程
```SQL
DROP PROCEDURE [IF EXISTS] 存储过程名;
```

### 存储过程参数类型
存储过程支持三种参数方向，用于实现数据的传入与返回：

| 参数类型 | 描述                     | 用途                     |
| ------ | ------------------------ | ------------------------ |
| IN     | 输入参数，调用时需传入值     | 向存储过程传递业务数据       |
| OUT    | 输出参数，存储过程执行后返回值 | 从存储过程获取计算结果或状态   |
| INOUT  | 输入输出参数，可传入也可返回 | 既传递初始数据，又接收处理后的结果 |

带IN参数的存储过程：根据部门ID查询员工
```SQL
DELIMITER //
CREATE PROCEDURE getEmpByDeptId(IN deptId INT)
BEGIN
    SELECT id, name, salary FROM emp WHERE dept_id = deptId;
END //
DELIMITER ;

-- 调用：查询部门ID为1的员工
CALL getEmpByDeptId(1);
```

带OUT参数的存储过程：统计指定部门员工数量
```SQL
DELIMITER //
CREATE PROCEDURE countEmpByDept(IN deptId INT, OUT empCount INT)
BEGIN
    -- 将查询结果赋值给输出参数
    SELECT COUNT(*) INTO empCount FROM emp WHERE dept_id = deptId;
END //
DELIMITER ;

-- 调用
SET @count = 0; -- 定义用户变量接收返回值
CALL countEmpByDept(1, @count);
SELECT @count AS 部门员工总数;
```

带INOUT参数的存储过程：计算工资涨幅
```SQL
DELIMITER //
CREATE PROCEDURE calculateRaisedSalary(INOUT currentSalary DOUBLE, IN raiseRate DECIMAL(3,2))
BEGIN
    -- 计算涨薪后的工资，直接修改输入输出参数的值
    SET currentSalary = currentSalary * (1 + raiseRate);
END //
DELIMITER ;

-- 调用
SET @salary = 8000;
CALL calculateRaisedSalary(@salary, 0.15); -- 涨幅15%
SELECT @salary AS 涨薪后工资;
```

带控制逻辑的存储过程：判断员工工资等级
```SQL
DELIMITER //
CREATE PROCEDURE getSalaryLevel(IN empId INT, OUT level VARCHAR(20))
BEGIN
    DECLARE empSalary DOUBLE; -- 声明局部变量存储员工工资
    SELECT salary INTO empSalary FROM emp WHERE id = empId;
    
    -- 条件判断逻辑
    IF empSalary >= 10000 THEN
        SET level = '高薪';
    ELSEIF empSalary >= 6000 THEN
        SET level = '中薪';
    ELSE
        SET level = '底薪';
    END IF;
END //
DELIMITER ;

-- 调用
SET @level = '';
CALL getSalaryLevel(3, @level);
SELECT @level AS 工资等级;
```

注意事项
- 创建存储过程时必须修改语句分隔符，避免与存储过程内部的`;`冲突
- 存储过程内部可使用`DECLARE`声明局部变量，变量作用域仅限当前存储过程
- 可通过`GRANT EXECUTE ON PROCEDURE 数据库名.存储过程名 TO '用户名'@'主机';`分配存储过程调用权限
- 复杂业务逻辑需权衡存储过程与应用层实现：存储过程便于数据库端统一管理，但调试和维护成本较高，适合固定且复用性强的逻辑
- 存储过程不支持动态SQL的直接拼接，如需动态SQL可使用`PREPARE`+`EXECUTE`实现

# JDBC 操作数据库

[JDBC 连接 MySQL_jdbc连接mysql-CSDN博客](https://blog.csdn.net/aasd23/article/details/124218870?ops_request_misc=elastic_search_misc&request_id=f08e1dbc57313aef33c6ceea53dfa938&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~top_positive~default-1-124218870-null-null.142^v102^pc_search_result_base6&utm_term=jdbc%E8%BF%9E%E6%8E%A5mysql&spm=1018.2226.3001.4187)
[MySQL | JDBC连接数据库详细教程【全程干货】_mysql jdbc-CSDN博客](https://blog.csdn.net/fire_cloud_1/article/details/130791820?ops_request_misc=elastic_search_misc&request_id=f08e1dbc57313aef33c6ceea53dfa938&biz_id=0&utm_medium=distribute.pc_search_result.none-task-blog-2~all~sobaiduend~default-4-130791820-null-null.142^v102^pc_search_result_base6&utm_term=jdbc%E8%BF%9E%E6%8E%A5mysql&spm=1018.2226.3001.4187)

## JDBC 概述
- JDBC（Java Database Connectivity）是Java访问关系型数据库的标准API，通过统一接口实现跨数据库操作，屏蔽不同数据库的底层差异。
- 核心价值：让Java程序与MySQL等数据库建立连接，执行SQL语句并处理返回结果，实现数据的持久化操作。

## JDBC 核心组件
| 组件                | 作用                                 |
| ----------------- | ---------------------------------- |
| DriverManager     | 管理JDBC驱动，负责加载驱动类并创建数据库连接实例         |
| Connection        | 代表Java程序与数据库的物理连接，用于创建SQL执行对象、管理事务 |
| Statement         | 执行静态SQL语句，存在SQL注入风险，适合执行固定SQL      |
| PreparedStatement | 预编译SQL语句，支持参数化查询，有效防止SQL注入，性能更优    |
| ResultSet         | 存储查询语句返回的结果集，通过游标遍历获取单行/列数据        |

## JDBC 操作数据库步骤
- 1. 导入JDBC驱动（MySQL官方提供的`mysql-connector-java`包）
- 2. 加载并注册JDBC驱动（MySQL 8.0+版本可省略，驱动会自动注册）
- 3. 通过`DriverManager`获取数据库连接
- 4. 创建`Statement`/`PreparedStatement`对象
- 5. 执行SQL语句（查询用`executeQuery`，增删改用`executeUpdate`）
- 6. 处理查询结果集（仅查询操作需要）
- 7. 按逆序释放资源（ResultSet → Statement → Connection）

## 代码示例

```java
import java.sql.*;

public class JdbcBasicQuery {
    public static void main(String[] args) {
        // 数据库连接参数
        String url = "jdbc:mysql://localhost:3306/testdb?useSSL=false&serverTimezone=Asia/Shanghai";
        String username = "root";
        String password = "123456";

        Connection conn = null;
        Statement stmt = null;
        ResultSet rs = null;

        try {
            // 1. 获取数据库连接
            conn = DriverManager.getConnection(url, username, password);
            // 2. 创建Statement对象
            stmt = conn.createStatement();
            // 3. 执行查询SQL
            String sql = "SELECT id, name, salary, entrydate FROM emp WHERE age < 35";
            rs = stmt.executeQuery(sql);
            // 4. 遍历结果集
            while (rs.next()) {
                int id = rs.getInt("id");
                String name = rs.getString("name");
                double salary = rs.getDouble("salary");
                Date entryDate = rs.getDate("entrydate");
                System.out.printf("ID: %d, 姓名: %s, 工资: %.2f, 入职日期: %s%n", 
                                  id, name, salary, entryDate);
            }
        } catch (SQLException e) {
            e.printStackTrace();
        } finally {
            // 5. 释放资源
            try {
                if (rs != null) rs.close();
                if (stmt != null) stmt.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
```

注意事项
- 优先使用`PreparedStatement`替代`Statement`，避免SQL注入风险，同时提升预编译SQL的执行效率。
- 必须按逆序释放资源，避免数据库连接泄漏。
- MySQL 8.0+版本的JDBC驱动无需手动调用`Class.forName()`加载，驱动会自动通过SPI机制注册。
- 事务操作中，需确保所有数据库操作在同一个`Connection`实例下执行，避免事务失效。
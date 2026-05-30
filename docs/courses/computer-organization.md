<!-- learning-notes
course: 计算机组成
textbook: 计算机组成与设计：硬件软件接口（RISC-V版）
style: exam-review
source_policy: references-section
last_updated: 2026-05-28
-->

# 计算机组成

计算机组成关注一条高级语言语句从程序、指令、数据通路、控制信号、存储层次到 I/O 设备的执行过程。复习时不要把知识点背成孤岛，要始终围绕一句话：**硬件通过指令集架构（ISA）向软件暴露一个稳定接口，处理器、存储器和 I/O 系统共同完成这套接口的高效实现**。

!!! tip "复习抓手"
    这门课最容易混乱的地方不是概念数量，而是层次切换。建议按“程序怎么变成指令”“指令怎么被数据通路执行”“执行时间由什么决定”“存储层次为什么有效”四条线索反复串联。

## 零、复习总览与知识主线

### 0.1 一句话串起全课

计算机组成可以看成一条“抽象逐层落地”的链条：

```text
程序需求
  -> 编译器选择指令
  -> ISA 规定指令语义
  -> 数据通路搬运数据
  -> 控制器产生控制信号
  -> 流水线提高吞吐
  -> Cache/虚存缩短平均访存
  -> I/O 与中断让外设参与系统运行
```

复习时每个知识点都要回答三个问题：

1. 它解决什么瓶颈？
2. 它改变的是 IC、CPI、Clock Cycle Time 还是 AMAT？
3. 它由软件可见的 ISA 决定，还是硬件实现可以自由选择？

### 0.2 章节之间的依赖关系

| 先学内容 | 支撑后续内容 | 典型联系 |
| --- | --- | --- |
| 补码、浮点、数字逻辑 | ALU、数据通路、异常 | ALU 如何判断零、溢出、符号 |
| RISC-V 指令格式 | 译码、立即数生成、控制信号 | opcode/funct 字段决定控制路径 |
| 性能公式 | 流水线、Cache、I/O 优化 | 优化必须落到时间或 CPI 上 |
| 单周期 CPU | 多周期、流水线 CPU | 先理解完整路径，再切阶段 |
| 局部性 | Cache、TLB、虚拟内存 | 让“常用数据更近”成为可能 |
| 中断与 DMA | I/O、异常、系统调用 | CPU 不可能一直轮询慢设备 |

### 0.3 高频考试能力清单

- 能用 \(CPU\ Time = IC \times CPI \times Cycle\ Time\) 比较两台机器或两种优化方案。
- 能把简单 C 语句翻译成 RISC-V 指令，尤其是数组、循环、函数调用。
- 能根据指令类型写出数据通路上经过的部件和关键控制信号。
- 能画五级流水线时序图，判断 RAW、load-use、branch 带来的 stall/flush。
- 能做 cache 地址划分、命中判断、AMAT 和 miss 分类。
- 能区分 cache miss、TLB miss、page fault、中断、异常这些“看起来都会停一下”的事件。
- 能看懂实验代码中的 ALU、RegFile、ImmGen、Control、Hazard Unit 分工。

### 0.4 软件可见与硬件不可见

| 角度 | 软件可见 | 硬件可自由实现 |
| --- | --- | --- |
| 指令 | 指令语义、寄存器编号、异常行为 | 数据通路结构、流水线级数 |
| 存储 | 地址空间、load/store 结果 | Cache 大小、相联度、替换策略 |
| 性能 | 程序运行时间 | 分支预测器、转发路径、预取器 |
| I/O | 设备寄存器、系统调用语义 | 总线协议、DMA 控制器实现 |

!!! note "理解标准"
    如果一个优化不会改变程序的最终可见结果，只改变执行速度、功耗或成本，它通常属于微体系结构实现；如果改变后程序必须重新编译或行为语义变化，它更可能属于 ISA 或软件接口层面。

## 一、课程地图与系统层次

### 1.1 从程序到硬件的路径

```text
高级语言程序
  -> 编译器生成汇编代码
  -> 汇编器生成机器码
  -> 链接器合并目标文件和库
  -> 加载器把程序放入内存
  -> CPU 按取指、译码、执行、访存、写回运行指令
```

| 层次 | 主要对象 | 复习重点 |
| --- | --- | --- |
| 应用程序 | C/C++/Java/Python 等 | 算法、数据结构、局部性 |
| 编译器 | 汇编代码、优化 | 指令数、寄存器使用、函数调用 |
| 指令集架构 | RISC-V 指令、寄存器、内存模型 | 硬件/软件接口 |
| 微体系结构 | 数据通路、控制器、流水线 | CPI、冒险、转发、停顿 |
| 数字逻辑 | ALU、寄存器、MUX、FSM | 组合逻辑和时序逻辑 |
| 器件与工艺 | 晶体管、存储单元、总线 | 延迟、功耗、容量 |

### 1.2 计算机组成的核心抽象

- **ISA（Instruction Set Architecture）**：软件能看见的机器接口，包括指令格式、寄存器、寻址方式、异常、中断、内存访问规则。
- **实现（implementation）**：硬件如何完成 ISA，包括单周期、多周期、流水线、缓存、总线等。
- **兼容性**：同一个 ISA 可以有不同实现，只要执行结果符合规范，软件就能运行。

```text
软件看到的是 ISA：

  add x5, x6, x7
  lw  x8, 0(x9)

硬件内部可能是：

  PC -> I-Mem -> RegFile -> ALU -> D-Mem -> RegFile
```

### 1.3 八个基本设计思想

| 思想 | 含义 | 在本课程中的体现 |
| --- | --- | --- |
| 面向摩尔定律设计 | 设计周期长，要预判未来资源 | 更复杂的缓存、更深流水线 |
| 用抽象简化设计 | 隐藏低层细节 | ISA、虚拟内存、模块化数据通路 |
| 加速常见情况 | 优化出现频率最高的路径 | cache 命中、顺序执行、简单指令 |
| 通过并行提高性能 | 同时做多件事 | 多核、SIMD、流水线 |
| 通过流水线提高性能 | 把任务拆阶段重叠执行 | IF/ID/EX/MEM/WB |
| 通过预测提高性能 | 先猜测再修正 | 分支预测、cache 预取 |
| 存储层次结构 | 小而快 + 大而慢组合 | 寄存器、cache、内存、磁盘 |
| 通过冗余提高可靠性 | 出错时可检测或恢复 | RAID、ECC、备份路径 |

### 1.4 一张总图

```text
                   +----------------------+
                   |      Processor       |
                   |                      |
                   |  +----+  +--------+  |
Instruction stream |  | PC |->| I-Cache|  |
------------------>|  +----+  +--------+  |
                   |      |       |       |
                   |      v       v       |
                   |  RegFile -> ALU      |
                   |      ^       |       |
Data stream        |      |       v       |
<----------------->|   D-Cache <- MEM/WB  |
                   +----------|-----------+
                              v
                     Main Memory / I/O
```

**重难点**：课程后半部分几乎都在解释这张图：PC 为什么变化、指令如何译码、ALU 如何选择操作、访存地址如何计算、写回数据从哪里来、cache 如何让平均访存变快。

## 二、性能与定量分析

### 2.1 基本定义

性能常用运行时间衡量：

\[
Performance = \frac{1}{Execution\ Time}
\]

若说机器 X 比机器 Y 快 \(n\) 倍：

\[
\frac{Performance_X}{Performance_Y}
= \frac{Execution\ Time_Y}{Execution\ Time_X}
= n
\]

### 2.2 CPU 性能公式

最核心公式：

\[
CPU\ Time = Instruction\ Count \times CPI \times Clock\ Cycle\ Time
\]

等价写法：

\[
CPU\ Time = \frac{Instruction\ Count \times CPI}{Clock\ Rate}
\]

| 符号 | 含义 | 常见优化方式 |
| --- | --- | --- |
| Instruction Count | 指令条数 | 编译优化、算法优化、ISA 选择 |
| CPI | 每条指令平均周期数 | 流水线、cache、减少停顿 |
| Clock Cycle Time | 时钟周期时间 | 缩短关键路径、改进工艺 |
| Clock Rate | 时钟频率 | 与周期时间互为倒数 |

!!! warning "常见误区"
    只看主频会误判性能。主频提高可能导致 CPI 上升，或者指令数不同。比较 CPU 必须同时看指令数、CPI 和时钟周期。

### 2.3 CPI 分解

若程序有多类指令：

\[
CPI = \sum_i (Instruction\ Fraction_i \times CPI_i)
\]

例子：

| 指令类型 | 占比 | CPI |
| --- | ---: | ---: |
| ALU | 50% | 1 |
| Load/Store | 30% | 2 |
| Branch | 20% | 3 |

\[
CPI = 0.5 \times 1 + 0.3 \times 2 + 0.2 \times 3 = 1.7
\]

### 2.4 从程序运行到性能公式

完整地看，程序运行时间来自两层乘法：

\[
CPU\ Time = CPU\ Clock\ Cycles \times Clock\ Cycle\ Time
\]

\[
CPU\ Clock\ Cycles = Instruction\ Count \times CPI
\]

合并得到：

\[
CPU\ Time = Instruction\ Count \times CPI \times Clock\ Cycle\ Time
\]

所以优化必须明确作用点：

| 优化 | 主要影响 | 可能副作用 |
| --- | --- | --- |
| 更好算法 | 降低指令数 \(IC\) | 数据结构复杂，局部性可能变差 |
| 编译优化 | 降低 \(IC\) 或 CPI | 编译时间增加，调试困难 |
| 流水线 | 降低平均 CPI | 冒险、控制复杂度、周期寄存器开销 |
| 更高主频 | 降低周期时间 | 功耗上升，可能需要更深流水线 |
| Cache | 降低访存带来的 CPI | 命中时间、面积、功耗增加 |

!!! warning "性能题常见陷阱"
    不要把“指令更少”直接等价于“更快”。如果减少指令数的同时每条指令更复杂，CPI 或周期时间可能上升。比较方案时要把 \(IC\)、\(CPI\)、\(Clock\ Cycle\ Time\) 全部代入。

### 2.5 Benchmark 与平均性能

实际评价机器不能只跑一个程序。若有多个 benchmark，常见处理方式：

- 对运行时间求和：适合关心一组任务总耗时。
- 对归一化性能取几何平均：适合比较多台机器在不同程序上的相对表现。
- 不建议简单平均主频或 MIPS，因为它们不直接等价于真实运行时间。

MIPS 的定义为：

\[
MIPS = \frac{Instruction\ Count}{Execution\ Time \times 10^6}
\]

但 MIPS 可能误导：

- 不同 ISA 的指令完成工作量不同。
- 同一机器上不同程序的 MIPS 也会不同。
- MIPS 没有直接体现程序总指令数是否增加。

### 2.6 Amdahl 定律

如果某部分占原运行时间比例为 \(f\)，该部分加速 \(s\) 倍，则整体加速比：

\[
Speedup = \frac{1}{(1-f)+\frac{f}{s}}
\]

例子：访存占 40%，cache 改进使访存快 2 倍：

\[
Speedup = \frac{1}{0.6 + \frac{0.4}{2}} = 1.25
\]

**考点**：

- 被优化部分占比越大，整体收益越高。
- 只优化少量时间占比的部分，即使局部加速巨大，整体收益也有限。
- Amdahl 定律经常和 cache、浮点单元、并行化一起考。

### 2.7 功耗与能耗

动态功耗常见近似：

\[
Power_{dynamic} \propto C \times V^2 \times f
\]

其中 \(C\) 是负载电容，\(V\) 是电压，\(f\) 是频率。

**理解**：

- 降低电压对功耗影响很大，因为电压是平方项。
- 只提高频率可能带来更高功耗和散热压力。
- 性能设计不是单纯“越快越好”，还要考虑能耗、面积和可靠性。

## 三、数据表示与数字逻辑基础

### 3.1 二进制与字长

计算机只直接处理比特。常见单位：

| 单位 | 大小 |
| --- | --- |
| bit | 1 个二进制位 |
| byte | 8 bit |
| half word | 16 bit |
| word | RISC-V 常指 32 bit |
| double word | RISC-V 常指 64 bit |

### 3.2 无符号整数

一个 \(n\) 位无符号数范围：

\[
0 \sim 2^n - 1
\]

例：8 位无符号数 `11111111`：

\[
255 = 2^8 - 1
\]

### 3.3 补码有符号整数

一个 \(n\) 位补码整数范围：

\[
-2^{n-1} \sim 2^{n-1}-1
\]

8 位补码范围：

\[
-128 \sim 127
\]

| 二进制 | 解释 |
| --- | --- |
| `0000 0001` | 1 |
| `0111 1111` | 127 |
| `1000 0000` | -128 |
| `1111 1111` | -1 |

求负数补码的常用方法：**按位取反再加 1**。

```text
+5 = 0000 0101
-5 = 1111 1011
```

### 3.4 溢出判断

有符号加法溢出只发生在同号相加：

| 操作 | 是否可能溢出 |
| --- | --- |
| 正 + 正 = 负 | 溢出 |
| 负 + 负 = 正 | 溢出 |
| 正 + 负 | 不会溢出 |

例：8 位补码

```text
  0111 1111   127
+ 0000 0001     1
-----------
  1000 0000  -128  溢出
```

### 3.5 大端与小端

多字节数据在内存中的排列方式：

| 类型 | 低地址存放 | 例：0x12345678 |
| --- | --- | --- |
| Big Endian | 最高有效字节 | `12 34 56 78` |
| Little Endian | 最低有效字节 | `78 56 34 12` |

**易错点**：大小端影响内存中字节顺序，不改变寄存器中数值本身。

### 3.6 符号扩展、零扩展与移位

当一个短位宽的数被放入更宽寄存器时，需要扩展：

| 扩展方式 | 做法 | 适用场景 |
| --- | --- | --- |
| 零扩展 | 高位补 0 | 无符号数、逻辑立即数 |
| 符号扩展 | 高位补原最高位 | 有符号数、分支/访存偏移 |

例：8 位补码 `1111 1011` 表示 \(-5\)，扩展到 16 位：

```text
1111 1011
-> 1111 1111 1111 1011
```

如果误用零扩展：

```text
0000 0000 1111 1011 = 251
```

这会把负数变成大正数，是立即数生成器和 load 指令中非常常见的 bug。

移位也要区分逻辑移位和算术移位：

| 操作 | 高位补什么 | 用途 |
| --- | --- | --- |
| 逻辑左移 | 低位补 0 | 乘以 \(2^k\)、位操作 |
| 逻辑右移 | 高位补 0 | 无符号除以 \(2^k\)、位字段提取 |
| 算术右移 | 高位补符号位 | 有符号数除以 \(2^k\) 的近似 |

### 3.7 布尔代数与常用组合部件

常见组合逻辑部件：

| 部件 | 功能 | 在 CPU 中的位置 |
| --- | --- | --- |
| MUX | 多路选择 | 选择 ALU 输入、写回数据、next PC |
| Decoder | 根据编码激活某一路 | 指令译码、寄存器地址译码 |
| Encoder | 把多路输入编码 | 中断优先级编码 |
| Adder | 加法 | `PC+4`、地址计算、ALU |
| Comparator | 比较 | 分支判断、cache tag 比较 |

MUX 是数据通路题里最重要的图形之一。凡是“这个值可能来自两个来源”，几乎都需要 MUX：

```text
       rs2 --------+
                   v
              +---------+
imm --------->|  MUX    |----> ALU input B
              +---------+
                   ^
                ALUSrc
```

### 3.8 组合逻辑与时序逻辑

| 类型 | 输出取决于 | 典型部件 |
| --- | --- | --- |
| 组合逻辑 | 当前输入 | ALU、加法器、MUX、译码器 |
| 时序逻辑 | 当前输入 + 历史状态 | 寄存器、PC、寄存器堆、存储器 |

```text
组合逻辑：
输入 -> [逻辑门] -> 输出

时序逻辑：
输入 -> [组合逻辑] -> [寄存器] -> 状态
                      ^ 时钟沿更新
```

**重难点**：

- 单周期 CPU 的周期时间由最长组合逻辑路径决定。
- 寄存器在时钟沿更新，组合逻辑在周期内传播。
- 流水线寄存器把一条长路径切成多个较短阶段。

## 四、RISC-V 指令系统

### 4.1 RISC-V 的基本特征

- RISC-V 是精简指令集，指令格式规整。
- 采用 load-store 架构：只有 load/store 访问内存，算术逻辑指令只操作寄存器。
- 通用寄存器通常为 32 个，记作 `x0` 到 `x31`。
- `x0` 恒为 0，写入 `x0` 的结果会被丢弃。

### 4.2 常用寄存器约定

| 寄存器 | ABI 名称 | 用途 |
| --- | --- | --- |
| `x0` | `zero` | 常量 0 |
| `x1` | `ra` | 返回地址 |
| `x2` | `sp` | 栈指针 |
| `x5-x7` | `t0-t2` | 临时寄存器 |
| `x8` | `s0/fp` | 保存寄存器/帧指针 |
| `x10-x17` | `a0-a7` | 参数和返回值 |
| `x18-x27` | `s2-s11` | 保存寄存器 |
| `x28-x31` | `t3-t6` | 临时寄存器 |

### 4.3 指令格式

| 格式 | 典型指令 | 字段特点 |
| --- | --- | --- |
| R-type | `add`, `sub`, `and` | `rd`, `rs1`, `rs2`, `funct3`, `funct7` |
| I-type | `addi`, `lw`, `jalr` | `rd`, `rs1`, 立即数 |
| S-type | `sw` | `rs1`, `rs2`, store 立即数 |
| B-type | `beq`, `bne` | `rs1`, `rs2`, branch 偏移 |
| U-type | `lui`, `auipc` | 高 20 位立即数 |
| J-type | `jal` | 跳转偏移 |

**难点**：立即数字段在机器码中可能被拆开存放，但硬件译码后会重新拼接并符号扩展。

### 4.4 指令编码字段速记

RISC-V 基础整数指令通常为 32 bit，常见字段如下：

| 字段 | 含义 | 常见位宽 |
| --- | --- | ---: |
| `opcode` | 大类操作码，决定指令格式和主控制信号 | 7 |
| `rd` | 目的寄存器 | 5 |
| `funct3` | 子操作码 | 3 |
| `rs1` | 源寄存器 1 | 5 |
| `rs2` | 源寄存器 2 | 5 |
| `funct7` | 扩展子操作码，如区分 `add/sub` | 7 |
| `imm` | 立即数，需根据格式拼接和符号扩展 | 不定 |

R-type 的典型布局：

```text
31        25 24    20 19    15 14    12 11     7 6       0
+-----------+--------+--------+--------+--------+---------+
|  funct7   |  rs2   |  rs1   | funct3 |   rd   | opcode  |
+-----------+--------+--------+--------+--------+---------+
```

I-type 的典型布局：

```text
31                 20 19    15 14    12 11     7 6       0
+--------------------+--------+--------+--------+---------+
|       imm[11:0]    |  rs1   | funct3 |   rd   | opcode  |
+--------------------+--------+--------+--------+---------+
```

B-type 和 J-type 最容易错，因为立即数字段被拆散，且目标地址通常按 2 字节对齐编码。做题时不要直接按机器码连续切片，要按指令格式重新拼接。

### 4.5 立即数生成 ImmGen

立即数生成器要完成两件事：

1. 按指令格式抽取并拼接立即数字段。
2. 对立即数进行符号扩展，得到 ALU、branch 或 jump 可直接使用的宽度。

| 格式 | 立即数用途 | 典型指令 |
| --- | --- | --- |
| I-type | ALU 立即数、load 偏移、`jalr` 偏移 | `addi`, `lw`, `jalr` |
| S-type | store 偏移 | `sw` |
| B-type | 分支目标偏移 | `beq`, `bne` |
| U-type | 高 20 位常量 | `lui`, `auipc` |
| J-type | 跳转目标偏移 | `jal` |

!!! warning "立即数考点"
    访存偏移和分支偏移都是字节地址意义上的偏移，但机器码中 B/J 型偏移的最低位常被隐含为 0。实验中如果 branch 跳转差 2 倍或 4 倍，优先检查立即数拼接和左移位置。

### 4.6 算术逻辑指令

```asm
# x5 = x6 + x7
add x5, x6, x7

# x5 = x6 - x7
sub x5, x6, x7

# x5 = x6 + 12
addi x5, x6, 12

# 位运算
and x5, x6, x7
or  x5, x6, x7
xor x5, x6, x7
```

立即数通常有位数限制。例如 `addi` 的立即数是 12 位有符号数，范围为：

\[
-2048 \sim 2047
\]

### 4.7 Load/Store 指令

RISC-V 中内存访问通常采用“基址 + 偏移”：

```asm
# x5 = Memory[x6 + 8]
lw x5, 8(x6)

# Memory[x6 + 12] = x5
sw x5, 12(x6)
```

```text
地址计算：

base register rs1
      +
sign-extended immediate
      =
effective address
```

**易错点**：

- `lw rd, offset(rs1)`：从内存读到寄存器 `rd`。
- `sw rs2, offset(rs1)`：把寄存器 `rs2` 写入内存。
- `offset` 是字节偏移，不是数组下标。

### 4.8 分支与跳转

```asm
# if (x5 == x6) goto label
beq x5, x6, label

# if (x5 != x6) goto label
bne x5, x6, label

# unconditional jump and link
jal x1, func

# return
jalr x0, 0(x1)
```

C 代码：

```c
if (a == b) {
    c = a + b;
} else {
    c = a - b;
}
```

可能对应：

```asm
    bne x10, x11, else
    add x12, x10, x11
    jal x0, done
else:
    sub x12, x10, x11
done:
```

### 4.9 循环翻译示例

C 代码：

```c
for (int i = 0; i < n; i++) {
    sum += A[i];
}
```

假设：

- `x10` 保存 `A` 的首地址。
- `x11` 保存 `n`。
- `x12` 保存 `sum`。
- `x5` 作为 `i`。

```asm
    addi x5, x0, 0        # i = 0
    addi x12, x0, 0       # sum = 0
loop:
    beq  x5, x11, done    # if i == n, exit
    slli x6, x5, 2        # byte offset = i * 4
    add  x7, x10, x6      # &A[i]
    lw   x8, 0(x7)        # A[i]
    add  x12, x12, x8     # sum += A[i]
    addi x5, x5, 1        # i++
    jal  x0, loop
done:
```

**翻译技巧**：

- `for` 循环通常先初始化，再在循环头判断是否结束。
- 小于、大于等比较可以用 `slt` 配合 `bne/beq`，也可以使用汇编器提供的伪指令。
- 数组访问一定要把元素下标换成字节偏移。

### 4.10 数组访问示例

C 代码：

```c
A[i] = A[i] + 1;
```

假设：

- `x10` 保存数组首地址 `A`
- `x11` 保存下标 `i`
- `int` 为 4 字节

```asm
slli x5, x11, 2      # x5 = i * 4
add  x5, x10, x5     # x5 = &A[i]
lw   x6, 0(x5)       # x6 = A[i]
addi x6, x6, 1       # x6 = A[i] + 1
sw   x6, 0(x5)       # A[i] = x6
```

**考点**：数组下标要乘以元素字节数，`slli x, y, 2` 等价于乘 4。

### 4.11 伪指令与真实指令

汇编中常见的一些“指令”其实是伪指令，由汇编器展开：

| 伪指令 | 可能展开 | 含义 |
| --- | --- | --- |
| `li rd, imm` | `addi` 或 `lui+addi` | 加载立即数 |
| `mv rd, rs` | `addi rd, rs, 0` | 寄存器复制 |
| `nop` | `addi x0, x0, 0` | 空操作 |
| `j label` | `jal x0, label` | 无条件跳转 |
| `ret` | `jalr x0, 0(ra)` | 函数返回 |

考试若要求“机器指令”或“真实 RISC-V 指令”，要注意伪指令可能不能直接算作一条硬件指令。

### 4.12 函数调用基本流程

函数调用需要处理：

- 参数传递：`a0-a7`
- 返回值：通常放在 `a0`
- 返回地址：`ra`
- 栈空间：`sp`
- 调用者保存和被调用者保存寄存器

```asm
func:
    addi sp, sp, -16
    sw   ra, 12(sp)
    sw   s0, 8(sp)

    # 函数主体
    add  s0, a0, a1
    addi a0, s0, 1

    lw   s0, 8(sp)
    lw   ra, 12(sp)
    addi sp, sp, 16
    jalr x0, 0(ra)
```

典型栈帧：

```text
高地址
+----------------+
| caller frame   |
+----------------+
| saved ra       |
| saved s0/fp    |
| local vars     |
| spilled temps  |
+----------------+ <- sp
低地址
```

调用约定要分清：

| 类型 | 寄存器 | 谁负责保存 |
| --- | --- | --- |
| caller-saved | `t0-t6`, `a0-a7` | 调用者在调用前保存 |
| callee-saved | `s0-s11` | 被调用者若使用就保存并恢复 |
| special | `sp`, `ra`, `zero` | 按约定维护 |

递归函数一定要保存 `ra`，因为每次 `jal` 都会覆盖返回地址。

## 五、整数与浮点算术

### 5.1 加减法器

减法可转化为补码加法：

\[
A - B = A + (-B)
\]

硬件实现中，通常对 \(B\) 取反并在最低位进位加 1。

```text
      A --------------------+
                            v
                       +---------+
      B -> XOR(sub) -> |  Adder  | -> Result
sub -----------------> | Cin = sub
                       +---------+

sub = 0: A + B
sub = 1: A + (~B) + 1 = A - B
```

#### 5.1.1 进位、溢出与符号

无符号数关心进位，有符号补码数关心溢出：

| 情况 | 判断对象 | 例子 |
| --- | --- | --- |
| 无符号加法 | 最高位是否产生进位 | `255 + 1` 在 8 位无符号中回到 0 |
| 有符号加法 | 同号相加结果异号 | `127 + 1` 在 8 位补码中变成 -128 |
| 无符号减法 | 是否需要借位 | `0 - 1` 在 8 位无符号中变成 255 |
| 有符号减法 | 转成加法后判断溢出 | `A - B = A + (-B)` |

硬件中常见的有符号溢出判断：

\[
Overflow = Carry_{in\ to\ MSB} \oplus Carry_{out\ of\ MSB}
\]

也可以从符号位理解：

- 正数 + 正数得到负数：溢出。
- 负数 + 负数得到正数：溢出。
- 正数 + 负数：不会溢出。

#### 5.1.2 加法器延迟

最简单的 ripple-carry adder 让进位逐位传播：

```text
bit0 -> bit1 -> bit2 -> ... -> bit31
```

优点是结构简单，缺点是延迟随位宽增长。更快的加法器会提前计算 generate/propagate：

\[
G_i = A_i \cdot B_i
\]

\[
P_i = A_i \oplus B_i
\]

\[
C_{i+1} = G_i + P_i C_i
\]

这类思想用于 carry-lookahead adder，核心是减少长进位链造成的关键路径。

### 5.2 乘法

二进制乘法和十进制竖式类似，本质是移位加法。

```text
     1011   (11)
   x 0101   (5)
   ------
     1011
    0000
   1011
  0000
  -------
  110111   (55)
```

**重点**：

- 两个 \(n\) 位数相乘，结果最多需要 \(2n\) 位。
- 乘法器比加法器复杂，常见实现会在多个周期内迭代完成。
- 有符号乘法要处理符号扩展或使用 Booth 算法思想。

#### 5.2.1 乘法器实现思路

一个顺序乘法器通常包含：

- 被乘数寄存器。
- 乘数/乘积寄存器。
- 加法器。
- 控制逻辑，决定当前位为 1 时是否加被乘数。

迭代思想：

```text
for each bit of multiplier:
    if current bit == 1:
        product += multiplicand shifted by bit position
```

Booth 算法利用连续 1 的模式减少加减次数，适合有符号乘法和较长连续位模式。

### 5.3 除法

除法常用“试商 + 减法 + 移位”迭代。

| 项 | 含义 |
| --- | --- |
| dividend | 被除数 |
| divisor | 除数 |
| quotient | 商 |
| remainder | 余数 |

基本关系：

\[
Dividend = Divisor \times Quotient + Remainder
\]

**易错点**：除法中余数符号和溢出规则要根据 ISA 规定判断，不要直接套数学直觉。

### 5.4 IEEE 754 浮点数

单精度浮点数 32 位：

```text
31          30              23 22                    0
+-------------+---------------+-----------------------+
| sign: 1 bit | exponent: 8   | fraction: 23          |
+-------------+---------------+-----------------------+
```

一般规格化数：

\[
(-1)^S \times 1.F \times 2^{E-Bias}
\]

单精度 Bias：

\[
Bias = 127
\]

| 字段 | 含义 |
| --- | --- |
| sign | 符号位，0 为正，1 为负 |
| exponent | 阶码，使用偏置表示 |
| fraction | 尾数的小数部分，规格化数隐含前导 1 |

### 5.5 浮点数特殊值

| exponent | fraction | 含义 |
| --- | --- | --- |
| 全 0 | 0 | \(+0\) 或 \(-0\) |
| 全 0 | 非 0 | 非规格化数 |
| 全 1 | 0 | \(+\infty\) 或 \(-\infty\) |
| 全 1 | 非 0 | NaN |

### 5.6 浮点加法流程

```text
1. 对阶：让两个数指数相同
2. 尾数相加或相减
3. 规格化：调整尾数和指数
4. 舍入：按舍入规则处理低位
5. 检查溢出、下溢、NaN、无穷大
```

!!! warning "浮点易错点"
    浮点数不是实数。它有有限精度，很多十进制小数无法精确表示，因此浮点比较应避免直接判断相等。

### 5.7 浮点数复习重点

浮点题通常围绕三件事：

1. 能否从 sign/exponent/fraction 还原数值。
2. 能否解释规格化数、非规格化数、0、无穷、NaN。
3. 能否说明浮点加法为什么要对阶、规格化和舍入。

规格化数的指数范围不直接等于 exponent 字段值，而是：

\[
E_{real} = E_{stored} - Bias
\]

单精度中，若 `exponent = 130`，则真实指数：

\[
E_{real} = 130 - 127 = 3
\]

**易错点**：

- fraction 字段不存隐含前导 1，但规格化数计算时要补上。
- 非规格化数没有隐含前导 1。
- 浮点加法中小数可能因对阶右移而丢失精度。
- 浮点乘法要处理符号异或、指数相加再减 bias、尾数相乘、规格化和舍入。

## 六、处理器数据通路与控制

### 6.1 单周期 CPU 总览

单周期 CPU 的特点：**一条指令在一个时钟周期内完成全部阶段**。

```text
             +-----+
             | PC  |
             +--+--+
                |
                v
          +-----------+
          | Instr Mem |
          +-----+-----+
                |
                v
        +---------------+
        | Control Unit  |
        +-------+-------+
                |
                v
rs1/rs2 -> +---------+      +-----+
           | RegFile |----->| ALU |----+
           +----+----+      +--+--+    |
                ^             |        v
                |             |   +----------+
                |             +-->| Data Mem |
                |                 +----+-----+
                |                      |
                +------ Write Back <---+
```

### 6.2 五个逻辑阶段

| 阶段 | 名称 | 主要工作 |
| --- | --- | --- |
| IF | Instruction Fetch | 用 PC 取指令，计算 `PC + 4` |
| ID | Instruction Decode | 译码，读寄存器，生成立即数 |
| EX | Execute | ALU 运算，计算分支目标或访存地址 |
| MEM | Memory Access | 读写数据存储器 |
| WB | Write Back | 写回寄存器 |

单周期中这五个阶段不分周期，只是组合逻辑路径上的逻辑分段。

### 6.3 关键控制信号

| 控制信号 | 作用 |
| --- | --- |
| `RegWrite` | 是否写寄存器 |
| `ALUSrc` | ALU 第二操作数来自寄存器还是立即数 |
| `MemRead` | 是否读数据存储器 |
| `MemWrite` | 是否写数据存储器 |
| `MemToReg` | 写回数据来自 ALU 还是内存 |
| `Branch` | 是否为条件分支 |
| `ALUOp` | 指示 ALU 运算类型 |

### 6.4 主控制器与 ALU 控制器

控制通常分两层：

```text
Instruction opcode
      |
      v
Main Control -----> RegWrite / MemRead / MemWrite / ALUSrc / Branch ...
      |
      v
    ALUOp ----+
              v
funct3/funct7 -> ALU Control -> ALUCtrl
```

这样设计的好处是主控制器只根据 opcode 判断大类，ALU 控制器再根据 funct 字段区分具体运算。

| 指令类型 | 主控制器关心 | ALU 控制器关心 |
| --- | --- | --- |
| R-type | 需要写回、ALU 第二输入来自 `rs2` | `funct3/funct7` 决定加减与逻辑操作 |
| I-type ALU | 需要写回、ALU 第二输入来自立即数 | `funct3` 决定操作 |
| Load/Store | 需要 ALU 做地址加法 | 通常固定为 add |
| Branch | 不写回，ALU/比较器判断条件 | 比较类型，如相等/不等/小于 |

### 6.5 立即数、控制信号与数据的同步

单周期 CPU 中所有逻辑都在一个周期内完成，控制信号不需要保存；流水线 CPU 中控制信号必须和数据一起进入流水线寄存器：

```text
ID 阶段产生控制信号
      |
      v
ID/EX.RegWrite, MemRead, MemWrite, ALUSrc ...
      |
      v
EX/MEM.MemRead, MemWrite, RegWrite ...
      |
      v
MEM/WB.RegWrite, MemToReg ...
```

如果忘记让控制信号随指令流动，常见现象是：

- 错误指令写回寄存器。
- store 在不该写内存时写内存。
- load 的数据没有进入写回 MUX。
- branch 后错误路径的控制信号没有被清零。

### 6.6 不同指令的数据路径

#### R-type: `add rd, rs1, rs2`

```text
PC -> 指令存储器 -> 读 rs1/rs2 -> ALU 加法 -> 写 rd
```

控制信号：

| 信号 | 值 |
| --- | --- |
| `RegWrite` | 1 |
| `ALUSrc` | 0 |
| `MemRead` | 0 |
| `MemWrite` | 0 |
| `MemToReg` | 0 |

#### Load: `lw rd, imm(rs1)`

```text
PC -> 指令存储器 -> 读 rs1 -> ALU 计算地址 -> 读内存 -> 写 rd
```

控制信号：

| 信号 | 值 |
| --- | --- |
| `RegWrite` | 1 |
| `ALUSrc` | 1 |
| `MemRead` | 1 |
| `MemWrite` | 0 |
| `MemToReg` | 1 |

#### Store: `sw rs2, imm(rs1)`

```text
PC -> 指令存储器 -> 读 rs1/rs2 -> ALU 计算地址 -> 写内存
```

控制信号：

| 信号 | 值 |
| --- | --- |
| `RegWrite` | 0 |
| `ALUSrc` | 1 |
| `MemRead` | 0 |
| `MemWrite` | 1 |

#### Branch: `beq rs1, rs2, label`

```text
PC -> 指令存储器 -> 读 rs1/rs2 -> ALU 比较 -> 选择 next PC
```

分支目标：

\[
Branch\ Target = PC + SignExt(Immediate)
\]

### 6.7 数据通路题的标准写法

遇到“某条指令经过哪些部件”或“填写控制信号”的题，按以下步骤：

1. 判断指令格式：R/I/S/B/U/J。
2. 列源寄存器和目的寄存器：`rs1`、`rs2`、`rd` 是否存在。
3. 判断 ALU 做什么：加地址、加减逻辑、比较、生成目标地址。
4. 判断是否访问数据存储器：load 读、store 写，其余通常不访问。
5. 判断是否写回寄存器：store/branch 不写回，load/ALU/jump 通常写回。
6. 判断 next PC：默认 `PC+4`，branch/jump 可能改写。

例：`lw x5, 12(x6)`

```text
PC -> I-Mem -> Decode
rs1=x6 -> RegFile -> ALU
imm=12 -> ALU
ALU result = x6 + 12 -> D-Mem read
D-Mem data -> WriteBack MUX -> x5
next PC = PC + 4
```

关键控制信号：

| 信号 | 值 | 原因 |
| --- | --- | --- |
| `RegWrite` | 1 | load 要写回 `rd` |
| `ALUSrc` | 1 | 地址偏移来自立即数 |
| `MemRead` | 1 | 需要读内存 |
| `MemWrite` | 0 | 不写内存 |
| `MemToReg` | 1 | 写回值来自内存 |
| `Branch` | 0 | 不是分支 |

### 6.8 关键路径

单周期 CPU 的时钟周期必须覆盖最慢指令的最长路径。

通常 `lw` 路径较长：

```text
PC -> I-Mem -> RegFile -> ALU -> D-Mem -> MUX -> RegFile
```

**结论**：

- 单周期 CPU 简单，但所有指令都被最慢指令拖慢。
- 这也是引入多周期 CPU 和流水线 CPU 的动机。

### 6.9 多周期 CPU 的动机

多周期 CPU 把一条指令拆成多个较短周期执行：

```text
IF -> ID -> EX -> MEM -> WB
```

和单周期相比：

| 实现 | 优点 | 缺点 |
| --- | --- | --- |
| 单周期 | 控制简单，一条指令一个周期 | 周期必须按最慢指令设置 |
| 多周期 | 不同指令可用不同周期数，部件可复用 | 控制器更复杂，CPI 大于 1 |
| 流水线 | 多条指令重叠，吞吐率高 | 冒险处理复杂 |

多周期 CPU 常用有限状态机控制，每个状态做一部分工作，例如取指、译码、执行、访存、写回。

### 6.10 Verilog 风格的控制逻辑示例

```verilog
always @(*) begin
    RegWrite = 0;
    ALUSrc   = 0;
    MemRead  = 0;
    MemWrite = 0;
    MemToReg = 0;
    Branch   = 0;

    case (opcode)
        OPCODE_RTYPE: begin
            RegWrite = 1;
            ALUSrc   = 0;
        end
        OPCODE_LOAD: begin
            RegWrite = 1;
            ALUSrc   = 1;
            MemRead  = 1;
            MemToReg = 1;
        end
        OPCODE_STORE: begin
            ALUSrc   = 1;
            MemWrite = 1;
        end
        OPCODE_BRANCH: begin
            Branch = 1;
        end
    endcase
end
```

**实验提示**：组合逻辑中要给默认值，避免综合出不期望的锁存器。

## 七、流水线 CPU

### 7.1 流水线基本思想

把一条指令的执行拆成多个阶段，让多条指令在不同阶段重叠执行。

```text
Cycle:  1   2   3   4   5   6   7
I1:    IF  ID  EX  MEM WB
I2:        IF  ID  EX  MEM WB
I3:            IF  ID  EX  MEM WB
I4:                IF  ID  EX  MEM WB
```

理想情况下，五级流水线填满后每个周期完成一条指令，吞吐率提升，但单条指令延迟不一定下降。

### 7.2 流水线寄存器

```text
IF/ID   保存取到的指令和 PC
ID/EX   保存寄存器读数、立即数、控制信号
EX/MEM  保存 ALU 结果、store 数据、访存控制
MEM/WB  保存内存读数或 ALU 结果、写回控制
```

**难点**：控制信号也要随指令一起流过流水线，否则后续阶段不知道当前指令要不要访存和写回。

### 7.3 流水线性能

理想加速比接近流水线级数，但受以下因素限制：

- 流水线寄存器开销
- 阶段不均衡
- 数据冒险
- 控制冒险
- 结构冒险
- cache miss

若每条指令平均停顿 \(s\) 个周期：

\[
CPI_{pipeline} = 1 + s
\]

### 7.4 三类冒险

| 冒险 | 原因 | 解决方式 |
| --- | --- | --- |
| 结构冒险 | 同一硬件资源同时被多条指令需要 | 分离 I/D cache、增加端口、停顿 |
| 数据冒险 | 后续指令依赖前一条结果 | 转发、停顿、编译器调度 |
| 控制冒险 | 分支改变 PC，下一条指令不确定 | 分支预测、延迟判断、冲刷流水线 |

### 7.5 数据冒险与转发

例：

```asm
add x5, x6, x7
sub x8, x5, x9
```

`sub` 在 EX 阶段需要 `x5`，但 `add` 还没写回。可以从 EX/MEM 或 MEM/WB 直接转发。

```text
add 结果
  EX/MEM --------+
                 v
              ALU 输入
                 ^
  MEM/WB --------+
```

#### 7.5.1 转发条件

以五级流水线为例，EX 阶段需要的两个源操作数来自 `ID/EX.rs1` 和 `ID/EX.rs2`。若前面指令将结果写入这些寄存器，就需要转发。

从 EX/MEM 转发：

```text
if EX/MEM.RegWrite
   and EX/MEM.rd != 0
   and EX/MEM.rd == ID/EX.rs1:
       ForwardA = EX/MEM
```

从 MEM/WB 转发：

```text
if MEM/WB.RegWrite
   and MEM/WB.rd != 0
   and MEM/WB.rd == ID/EX.rs1:
       ForwardA = MEM/WB
```

`rs2` 对应 `ForwardB`，判断方式相同。

!!! note "优先级"
    如果 EX/MEM 和 MEM/WB 都能转发同一个寄存器，通常优先使用 EX/MEM，因为它更新，距离当前指令更近。

### 7.6 Load-use 冒险

例：

```asm
lw  x5, 0(x6)
add x7, x5, x8
```

`lw` 的数据要到 MEM 阶段末才可用，而下一条 `add` 在 EX 阶段就需要，因此即使有转发通常仍需停顿 1 个周期。

```text
lw:   IF  ID  EX  MEM WB
add:      IF  ID  ST  EX  MEM WB
```

优化方法：

```asm
lw  x5, 0(x6)
addi x10, x10, 1    # 插入无关指令填空
add x7, x5, x8
```

#### 7.6.1 Load-use 检测条件

典型检测逻辑：

```text
if ID/EX.MemRead
   and (
        ID/EX.rd == IF/ID.rs1
        or ID/EX.rd == IF/ID.rs2
   ):
       stall pipeline
```

处理动作通常包括：

- PCWrite = 0：PC 保持不变。
- IF/IDWrite = 0：IF/ID 寄存器保持不变。
- ID/EX 控制信号清零：插入 bubble。

这解释了为什么时间表中后一条指令的 IF/ID 会“卡住”，而 EX 阶段出现一个空泡。

### 7.7 控制冒险

分支指令在真正比较前，CPU 不确定下一条指令地址。

常见策略：

- 停顿直到分支结果确定。
- 默认预测不跳转。
- 静态预测：例如向后跳转预测为 taken。
- 动态预测：根据历史行为预测。
- 分支错误时冲刷流水线中错误路径的指令。

!!! note "考试写法"
    遇到流水线题，先画时间表，再标出依赖关系，最后判断能否通过转发解决。不要凭感觉数 stall。

#### 7.7.1 分支提前判断

若在 EX 阶段才知道分支结果，错误路径可能已经取入多条指令。为了减少 penalty，可以把分支比较和目标地址计算提前到 ID 阶段，但这会带来新问题：

- ID 阶段需要比较器。
- 分支源寄存器可能也需要转发。
- ID 阶段组合逻辑变长，可能影响时钟周期。

所以“提前分支判断”减少 CPI，但可能增加周期时间，仍需回到性能公式综合判断。

#### 7.7.2 flush 与 stall 的区别

| 动作 | 含义 | 典型场景 |
| --- | --- | --- |
| stall | 正确指令暂时不能前进 | load-use、结构资源冲突 |
| bubble | 插入一条空操作 | 为等待数据制造空周期 |
| flush | 已经进入流水线的指令不该执行，清除其控制信号 | 分支预测错误、跳转改 PC |

一句话：stall 是“等等再走”，flush 是“这条路走错了，清掉”。

### 7.8 流水线时间表例题

指令序列：

```asm
lw  x1, 0(x2)
add x3, x1, x4
sub x5, x3, x6
```

考虑转发，`lw` 后的 `add` 需要 1 个 stall，`add` 到 `sub` 可通过转发解决。

```text
Cycle: 1   2   3   4   5   6   7   8
lw:    IF  ID  EX  MEM WB
add:       IF  ID  ST  EX  MEM WB
sub:           IF  IF  ID  EX  MEM WB
```

**注意**：停顿时 PC 和 IF/ID 往往保持不变，ID/EX 插入 bubble。

### 7.9 异常与流水线

异常（exception）是在指令执行过程中由当前指令触发的事件，例如非法指令、算术溢出、缺页等。流水线中处理异常要保证精确异常（precise exception）：

- 异常之前的指令都已经完成。
- 异常之后的指令看起来还没有执行。
- 处理程序能准确知道是哪条指令触发异常。

这要求处理器能够清除异常指令之后的流水线状态，并保存异常原因和异常 PC。

### 7.10 流水线性能计算模板

若理想 CPI 为 1，额外停顿来自 load-use、branch miss、cache miss：

\[
CPI = 1 + Stall_{load} + Stall_{branch} + Stall_{cache}
\]

例如：

- 20% 指令是 load。
- 其中 30% 发生 load-use，停顿 1 cycle。
- 15% 指令是 branch。
- 分支预测错误率 20%，错误代价 2 cycle。

\[
Stall_{load} = 0.20 \times 0.30 \times 1 = 0.06
\]

\[
Stall_{branch} = 0.15 \times 0.20 \times 2 = 0.06
\]

\[
CPI = 1 + 0.06 + 0.06 = 1.12
\]

## 八、存储层次与 Cache

### 8.1 为什么需要存储层次

理想存储器希望同时满足：

- 容量大
- 速度快
- 价格低
- 功耗低

现实中无法同时满足，所以使用层次结构。

```text
更快、更小、更贵

Registers
    |
L1 Cache
    |
L2 Cache
    |
L3 Cache
    |
Main Memory
    |
SSD / Disk

更慢、更大、更便宜
```

### 8.2 局部性原理

| 类型 | 含义 | 例子 |
| --- | --- | --- |
| 时间局部性 | 最近访问过的数据可能很快再次访问 | 循环变量、栈顶数据 |
| 空间局部性 | 访问某地址后可能访问附近地址 | 数组顺序遍历、指令顺序执行 |

Cache 能有效工作，根本原因是程序通常具有局部性。

### 8.3 Cache 基本术语

| 术语 | 含义 |
| --- | --- |
| block / line | cache 与内存传输的基本单位 |
| hit | 访问内容在 cache 中 |
| miss | 访问内容不在 cache 中 |
| hit rate | 命中率 |
| miss rate | 缺失率 |
| miss penalty | miss 后从下层取数据的额外代价 |

### 8.4 AMAT

平均访存时间：

\[
AMAT = Hit\ Time + Miss\ Rate \times Miss\ Penalty
\]

例：命中时间 1 cycle，miss rate 为 5%，miss penalty 为 100 cycles：

\[
AMAT = 1 + 0.05 \times 100 = 6
\]

**考点**：小小的 miss rate 也可能造成很大性能损失，因为 miss penalty 通常很大。

### 8.5 Cache 映射方式

| 映射方式 | 位置选择 | 优点 | 缺点 |
| --- | --- | --- | --- |
| Direct-mapped | 每个内存块只能放一个 cache 位置 | 硬件简单、命中快 | 冲突缺失多 |
| Fully associative | 可放任意位置 | 冲突少 | 比较器多，硬件复杂 |
| Set associative | 可放某个 set 内任意 way | 折中方案 | 需要替换策略 |

### 8.6 地址划分

对于 cache 地址：

```text
+----------------+-------------+--------------+
|      Tag       |    Index    | Block Offset |
+----------------+-------------+--------------+
```

- `Block Offset`：块内偏移，由块大小决定。
- `Index`：选择 cache 的 set。
- `Tag`：判断该 set 中是否是目标内存块。

例：32 位地址，cache 有 1024 个 set，block 为 16 byte。

\[
Offset = \log_2 16 = 4
\]

\[
Index = \log_2 1024 = 10
\]

\[
Tag = 32 - 10 - 4 = 18
\]

#### 8.6.1 命中判断步骤

给一个地址，判断 cache 是否命中：

1. 用 block size 算出 block offset 位数。
2. 用 set 数算出 index 位数。
3. 剩余高位作为 tag。
4. 根据 index 找到对应 set。
5. 比较该 set 中每个有效块的 tag。
6. tag 相同且 valid bit 为 1，则 hit；否则 miss。

例：直接映射 cache，有 4 个 line，每块 4 byte，地址为字节地址。

```text
block offset = log2(4) = 2 bit
index        = log2(4) = 2 bit
```

地址 `0x00000014`：

```text
0x14 = 20 = 0001 0100b
block offset = 00
index        = 01
tag          = 剩余高位
```

因此它只能放到 index=1 的 cache line 中。

#### 8.6.2 访问序列模拟例题

直接映射 cache，4 个 line，每块 4 byte，初始为空。访问地址：

```text
0, 4, 8, 0, 16, 4
```

块号为地址除以 4：

| 地址 | 块号 | index = 块号 mod 4 | 结果 |
| ---: | ---: | ---: | --- |
| 0 | 0 | 0 | miss，装入块 0 |
| 4 | 1 | 1 | miss，装入块 1 |
| 8 | 2 | 2 | miss，装入块 2 |
| 0 | 0 | 0 | hit |
| 16 | 4 | 0 | miss，替换块 0 |
| 4 | 1 | 1 | hit |

命中率：

\[
Hit\ Rate = \frac{2}{6}
\]

缺失率：

\[
Miss\ Rate = \frac{4}{6}
\]

### 8.7 Cache 缺失分类

| 类型 | 原因 | 改进方式 |
| --- | --- | --- |
| Compulsory miss | 第一次访问，cache 中必然没有 | 预取、增大 block |
| Capacity miss | cache 容量不足 | 增大 cache |
| Conflict miss | 多个块竞争同一位置 | 提高相联度 |
| Coherence miss | 多核中其他核心修改数据 | 一致性协议 |

### 8.8 写策略

| 策略 | 含义 | 特点 |
| --- | --- | --- |
| Write-through | 每次写 cache 同时写下层存储 | 简单一致，但带宽压力大 |
| Write-back | 先只写 cache，替换时再写回 | 性能好，但需要 dirty bit |
| Write-allocate | 写 miss 时把块调入 cache 再写 | 适合 write-back |
| No-write-allocate | 写 miss 时直接写下层 | 常配 write-through |

### 8.9 替换策略与 dirty/valid 位

每个 cache line 通常至少包含：

| 字段 | 作用 |
| --- | --- |
| valid bit | 当前 line 是否保存有效数据 |
| tag | 判断是否是目标内存块 |
| data block | 实际缓存的数据 |
| dirty bit | write-back cache 中表示该块是否被修改过 |

组相联 cache 在 set 满时需要替换策略：

| 策略 | 思想 | 特点 |
| --- | --- | --- |
| Random | 随机替换 | 硬件简单 |
| FIFO | 替换最早进入的块 | 不一定符合最近使用情况 |
| LRU | 替换最久未使用的块 | 效果好，但高相联度下硬件复杂 |
| Pseudo-LRU | 近似 LRU | 实际处理器常见折中 |

write-back cache 替换 dirty block 时必须写回下层存储；替换 clean block 时可以直接丢弃。

### 8.10 多级 Cache

现代处理器常有 L1/L2/L3 多级缓存：

```text
CPU -> L1 I-cache / L1 D-cache -> L2 -> L3 -> Memory
```

多级 AMAT 可递归计算：

\[
AMAT = HitTime_{L1} + MissRate_{L1} \times MissPenalty_{L1}
\]

若 L1 miss 后访问 L2：

\[
MissPenalty_{L1} = HitTime_{L2} + MissRate_{L2} \times MissPenalty_{L2}
\]

所以：

\[
AMAT = HitTime_{L1} + MissRate_{L1} \times (HitTime_{L2} + MissRate_{L2} \times MissPenalty_{L2})
\]

!!! note "局部 miss rate 与全局 miss rate"
    L2 的局部 miss rate 是“到达 L2 的访问中有多少 miss”；全局 miss rate 是“所有 CPU 访存中有多少一路 miss 到 L2 之后”。题目中要看清分母。

### 8.11 虚拟内存

虚拟内存提供三个核心能力：

- 让每个程序看到独立、连续的地址空间。
- 让主存作为磁盘上程序数据的 cache。
- 支持保护和隔离，避免程序互相破坏。

```text
Virtual Address
      |
      v
    TLB lookup
      |
      +---- hit  -> Physical Address -> Cache
      |
      +---- miss -> Page Table lookup
```

### 8.12 页表与 TLB

| 结构 | 作用 |
| --- | --- |
| Page table | 记录虚拟页到物理页的映射 |
| Page table entry | 包含物理页号、有效位、权限位、dirty 位等 |
| TLB | 页表项的高速缓存 |
| Page fault | 访问页不在内存中，需要操作系统介入 |

**易错点**：

- cache miss 通常由硬件处理。
- page fault 通常需要操作系统处理，代价远高于 cache miss。
- TLB miss 不一定是 page fault，可能只是页表项不在 TLB 中。

### 8.13 地址转换与 Cache 的关系

典型访问路径：

```text
Virtual Address
      |
      v
TLB / Page Table
      |
      v
Physical Address
      |
      v
Cache
      |
      v
Memory
```

容易混淆的几个事件：

| 事件 | 发生位置 | 含义 | 处理代价 |
| --- | --- | --- | --- |
| TLB hit | 地址转换 | 页表项在 TLB 中 | 很低 |
| TLB miss | 地址转换 | TLB 中没有页表项 | 查页表，可能硬件或 OS |
| Page fault | 虚拟内存 | 页不在物理内存或权限错误 | 很高，需要 OS |
| Cache hit | 数据访问 | 数据在 cache 中 | 低 |
| Cache miss | 数据访问 | 数据不在 cache 中 | 从下层存储取块 |

**判断顺序**：先完成地址转换，再用物理地址访问 cache。若 page fault，通常不会继续做普通 cache 访问。

### 8.14 Cache 优化方向

| 优化 | 降低什么 | 可能代价 |
| --- | --- | --- |
| 增大 block | 降低 compulsory miss，利用空间局部性 | miss penalty 增大，污染 cache |
| 增大 cache | 降低 capacity miss | 命中时间、面积、功耗增加 |
| 提高相联度 | 降低 conflict miss | tag 比较更多，命中路径变慢 |
| 多级 cache | 降低主存访问代价 | 层次一致性复杂 |
| 预取 | 提前取可能访问的数据 | 预测错误会浪费带宽 |

## 九、存储与 I/O

### 9.1 I/O 的基本问题

I/O 设备速度差异很大，CPU 不能像访问寄存器一样直接等待慢设备。I/O 系统要解决：

- 设备寻址：CPU 如何找到设备寄存器。
- 数据传输：CPU、内存和设备之间如何搬运数据。
- 同步：设备什么时候准备好。
- 中断：设备如何通知 CPU。
- 可靠性：磁盘、网络、外设出错如何处理。

### 9.2 Memory-mapped I/O

把设备寄存器映射到内存地址空间，CPU 用普通 load/store 访问设备。

```c
#define UART_STATUS (*(volatile unsigned int*)0x10000000)
#define UART_DATA   (*(volatile unsigned int*)0x10000004)

void put_char(char c) {
    while ((UART_STATUS & 1) == 0) {
        // wait until device is ready
    }
    UART_DATA = (unsigned int)c;
}
```

`volatile` 的意义：告诉编译器该地址的值可能被外部设备改变，不要随意优化掉读写。

### 9.3 轮询、中断和 DMA

| 方式 | 工作方式 | 优点 | 缺点 |
| --- | --- | --- | --- |
| Polling | CPU 反复检查设备状态 | 简单 | 浪费 CPU 时间 |
| Interrupt | 设备准备好后打断 CPU | CPU 利用率高 | 中断处理有开销 |
| DMA | 设备直接和内存传输数据 | 适合大块数据 | 控制逻辑复杂，需要一致性处理 |

#### 9.3.1 三种方式的选择

| 场景 | 更适合方式 | 原因 |
| --- | --- | --- |
| 极简单、很少发生的小设备操作 | Polling | 实现简单，等待成本可接受 |
| 键盘、网卡等异步事件 | Interrupt | 设备不定时发生，CPU 不应空等 |
| 磁盘、网卡大块数据传输 | DMA | 数据量大，逐字节中断开销过高 |

DMA 的典型流程：

```text
CPU 设置 DMA 描述符
  -> DMA 控制器从设备搬运数据到内存
  -> 搬运完成后产生中断
  -> CPU 检查状态并继续处理数据
```

DMA 与 cache 的一致性要特别小心：

- 设备写内存后，CPU cache 中可能还有旧数据。
- CPU 写了 cache 但没写回内存，设备可能读到旧数据。
- 系统常通过 cache flush/invalidate、不可缓存映射或一致性互连解决。

### 9.4 中断基本流程

```text
设备完成操作
  -> 向 CPU 发出中断请求
  -> CPU 保存当前上下文
  -> 跳转到中断处理程序
  -> 处理中断并清除状态
  -> 恢复上下文
  -> 回到原程序继续执行
```

### 9.5 异常、中断与系统调用

| 事件 | 来源 | 同步/异步 | 例子 |
| --- | --- | --- | --- |
| Exception | 当前指令执行内部 | 同步 | 非法指令、除零、page fault |
| Interrupt | 外部设备 | 异步 | 定时器、键盘、网卡 |
| System call | 程序主动请求 OS 服务 | 同步 | 文件读写、进程控制 |

同步的意思是与当前指令执行位置相关；异步的意思是可能在指令之间由外部设备触发。

### 9.6 存储设备

| 设备 | 特点 | 性能瓶颈 |
| --- | --- | --- |
| HDD | 容量大、便宜、机械结构 | 寻道时间、旋转延迟 |
| SSD | 随机访问快、无机械结构 | 写放大、擦除块限制 |
| RAID | 多磁盘组合 | 性能、容量、可靠性权衡 |

**复习点**：I/O 章节常与可靠性、冗余、带宽、延迟联系，不要只背设备名。

### 9.7 RAID 速查

RAID 用多块磁盘组合提高容量、性能或可靠性：

| RAID | 思想 | 优点 | 缺点 |
| --- | --- | --- | --- |
| RAID 0 | 条带化，无冗余 | 性能高、容量利用率高 | 任一磁盘坏都会丢数据 |
| RAID 1 | 镜像 | 可靠性高，读性能可提高 | 容量利用率低 |
| RAID 4 | 块级条带 + 专用校验盘 | 可恢复单盘故障 | 校验盘成为写瓶颈 |
| RAID 5 | 块级条带 + 分布式校验 | 避免单校验盘热点 | 小写仍需读改写校验 |

奇偶校验的核心思想：用异或保存冗余信息。

\[
P = D_0 \oplus D_1 \oplus D_2
\]

若 \(D_1\) 丢失：

\[
D_1 = P \oplus D_0 \oplus D_2
\]

## 十、实验与实现要点

### 10.1 Vivado 和模块化设计

硬件实验要把系统拆成可验证模块：

```text
Top
 |-- CPU
 |    |-- Control
 |    |-- Datapath
 |    |-- ALU
 |    |-- RegFile
 |
 |-- Instruction Memory
 |-- Data Memory
 |-- Debug Interface
```

模块设计原则：

- 输入输出端口清晰。
- 组合逻辑和时序逻辑分开。
- 每个模块先单独仿真，再连入系统。
- 不要一上来调整个 CPU，先验证 ALU、寄存器堆、立即数生成器。

### 10.2 ALU 设计示例

```verilog
module alu(
    input  [31:0] a,
    input  [31:0] b,
    input  [3:0]  alu_ctrl,
    output reg [31:0] result,
    output zero
);
    always @(*) begin
        case (alu_ctrl)
            4'b0000: result = a + b;
            4'b0001: result = a - b;
            4'b0010: result = a & b;
            4'b0011: result = a | b;
            4'b0100: result = a ^ b;
            4'b0101: result = a << b[4:0];
            4'b0110: result = a >> b[4:0];
            default: result = 32'b0;
        endcase
    end

    assign zero = (result == 32'b0);
endmodule
```

### 10.3 寄存器堆要点

```verilog
module regfile(
    input         clk,
    input         we,
    input  [4:0]  rs1,
    input  [4:0]  rs2,
    input  [4:0]  rd,
    input  [31:0] wd,
    output [31:0] rd1,
    output [31:0] rd2
);
    reg [31:0] regs[31:0];

    assign rd1 = (rs1 == 5'b0) ? 32'b0 : regs[rs1];
    assign rd2 = (rs2 == 5'b0) ? 32'b0 : regs[rs2];

    always @(posedge clk) begin
        if (we && rd != 5'b0) begin
            regs[rd] <= wd;
        end
    end
endmodule
```

**重难点**：

- `x0` 必须恒为 0。
- 读通常是组合逻辑，写通常在时钟沿。
- 同周期读写同一寄存器时，要按实验框架约定处理。

### 10.4 立即数生成器示例

立即数生成器是 RISC-V CPU 实验中最容易写错的模块之一：

```verilog
module imm_gen(
    input  [31:0] instr,
    output reg [31:0] imm
);
    wire [6:0] opcode = instr[6:0];

    always @(*) begin
        case (opcode)
            7'b0010011,  // I-type ALU
            7'b0000011,  // load
            7'b1100111:  // jalr
                imm = {{20{instr[31]}}, instr[31:20]};

            7'b0100011:  // store
                imm = {{20{instr[31]}}, instr[31:25], instr[11:7]};

            7'b1100011:  // branch
                imm = {{19{instr[31]}}, instr[31], instr[7],
                       instr[30:25], instr[11:8], 1'b0};

            7'b0110111,  // lui
            7'b0010111:  // auipc
                imm = {instr[31:12], 12'b0};

            7'b1101111:  // jal
                imm = {{11{instr[31]}}, instr[31], instr[19:12],
                       instr[20], instr[30:21], 1'b0};

            default:
                imm = 32'b0;
        endcase
    end
endmodule
```

检查点：

- I/S/B/J 型都要符号扩展。
- B/J 型最低位补 0。
- U 型低 12 位补 0。
- 不要把 `instr[11:7]` 当成所有格式的 `rd`，S/B 型这里是立即数字段的一部分。

### 10.5 单周期 CPU 调试顺序

1. PC 能否正确 `+4`。
2. 指令存储器是否按 PC 取出正确指令。
3. 指令字段解析是否正确。
4. 立即数生成是否符号扩展正确。
5. 寄存器堆读写地址是否正确。
6. ALU 控制信号是否正确。
7. load/store 地址和数据是否正确。
8. branch/jump 的 next PC 是否正确。
9. 写回 MUX 是否选择正确来源。
10. 用小程序逐条跟踪寄存器和内存变化。

### 10.6 流水线 CPU 调试顺序

1. 先让无冒险指令序列跑通。
2. 加入 ALU-ALU 数据冒险，检查 EX/MEM 和 MEM/WB 转发。
3. 加入 load-use，检查 stall 和 bubble。
4. 加入 branch，检查 PC 更新和 flush。
5. 加入 store 数据依赖，检查 store 数据是否也需要转发。
6. 加入综合测试程序，观察每级流水线寄存器。

```text
建议波形观察：

PC
IF/ID.instruction
ID/EX.rs1, rs2, rd
EX/MEM.alu_result
MEM/WB.write_data
RegWrite
MemRead
MemWrite
stall
flush
forwardA / forwardB
```

### 10.7 Testbench 编写建议

实验不要只靠波形肉眼看，应尽量写自检式 testbench：

```verilog
initial begin
    a = 32'd10;
    b = 32'd3;
    alu_ctrl = 4'b0000; #1;
    if (result !== 32'd13) $fatal("add failed");

    alu_ctrl = 4'b0001; #1;
    if (result !== 32'd7) $fatal("sub failed");

    alu_ctrl = 4'b0010; #1;
    if (result !== (32'd10 & 32'd3)) $fatal("and failed");

    $display("ALU tests passed");
end
```

建议按模块层次逐步测试：

1. ALU：加减、位运算、零标志。
2. RegFile：`x0` 恒零、读写、同时读两个端口。
3. ImmGen：每种格式各测一个正立即数和负立即数。
4. Control：每类指令的控制信号。
5. Single-cycle CPU：逐条执行小程序，检查寄存器最终值。
6. Pipeline CPU：先无冒险，再加转发、stall、flush。

### 10.8 常见实验 bug 对照表

| 现象 | 可能原因 | 排查点 |
| --- | --- | --- |
| `x0` 被写成非零 | RegFile 未屏蔽 `rd=0` 写入 | 写端口判断 `rd != 0` |
| 分支跳转地址不对 | B 型立即数拼接或左移错 | `instr[7]`、`instr[11:8]` 位置 |
| `lw` 读错地址 | ALU 输入 B 没选立即数 | `ALUSrc`、ImmGen |
| `sw` 写错数据 | store 数据端误接 `rd` 或写回数据 | 应使用 `rs2` 读数 |
| R-type 加减混淆 | ALU control 没看 `funct7` | `add/sub` opcode/funct3 相同 |
| load-use 结果错 | 没有插入 stall | hazard detection |
| branch 后多执行一条错指令 | flush 控制信号没清零 | IF/ID 或 ID/EX flush |
| 仿真出现锁存器 | 组合逻辑未给默认值 | `always @(*)` 中默认赋值 |

## 十一、常见题型与解题模板

### 11.1 性能计算题

模板：

1. 写出公式 \(CPU\ Time = IC \times CPI \times Cycle\ Time\)。
2. 若有多类指令，先算平均 CPI。
3. 若有 cache 或 stall，把额外周期加入 CPI。
4. 比较性能时用运行时间比值。

例：

```text
IC = 1,000,000
CPI = 1.5
Clock rate = 2 GHz

CPU Time = 1,000,000 * 1.5 / (2 * 10^9)
         = 0.00075 s
```

### 11.2 指令翻译题

步骤：

1. 确定变量在哪些寄存器。
2. 数组访问先计算字节偏移。
3. load 后才能使用内存中的值。
4. if/loop 使用条件分支和标签。
5. 函数调用注意保存 `ra`、`sp` 和必要寄存器。

### 11.3 数据通路题

步骤：

1. 判断指令类型。
2. 标出使用的部件：PC、I-Mem、RegFile、ALU、D-Mem、MUX。
3. 写出数据流向。
4. 填控制信号。
5. 判断写回来源和 next PC 来源。

### 11.4 流水线题

步骤：

1. 画五级流水线时间表。
2. 找 RAW 依赖。
3. 判断能否转发。
4. load-use 插入 stall。
5. 分支判断 flush 或 stall。
6. 计算总周期数和 CPI。

### 11.5 Cache 题

步骤：

1. 根据 block size 算 offset 位数。
2. 根据 set 数算 index 位数。
3. 剩余为 tag。
4. 按地址序列模拟命中和缺失。
5. 区分 compulsory、capacity、conflict miss。
6. 用 AMAT 计算平均访存时间。

## 十二、高频易错点

| 知识点 | 易错说法 | 正确理解 |
| --- | --- | --- |
| 主频 | 主频越高一定越快 | 还要看 IC 和 CPI |
| CPI | 每条指令 CPI 都一样 | CPI 是平均值，不同指令可不同 |
| RISC-V 访存 | ALU 指令可直接操作内存 | RISC-V 是 load-store 架构 |
| `sw` 指令 | `sw rd, offset(rs1)` | store 写入的是 `rs2` 的值 |
| 立即数 | 所有立即数位数一样 | 不同格式立即数位数和拼接方式不同 |
| `x0` | 可以保存普通结果 | `x0` 恒为 0，写入无效 |
| 单周期 CPU | 每条指令花费不同周期 | 单周期实现中每条指令都是一个长周期 |
| 流水线 | 单条指令变快 5 倍 | 主要提高吞吐率，不一定降低单条延迟 |
| 转发 | 可以解决所有数据冒险 | load-use 通常仍需停顿 |
| cache miss | miss 后程序一定错误 | miss 是性能事件，不是程序错误 |
| TLB miss | 等同于 page fault | TLB miss 可能只需查页表 |
| 大小端 | 改变数值大小 | 只改变多字节数据在内存中的字节顺序 |

## 十三、重难点速查

### 13.1 公式速查

| 公式 | 用途 |
| --- | --- |
| \(Performance = 1 / Execution\ Time\) | 性能定义 |
| \(CPU\ Time = IC \times CPI \times Cycle\ Time\) | CPU 运行时间 |
| \(CPU\ Time = IC \times CPI / Clock\ Rate\) | 用主频计算时间 |
| \(CPI = \sum_i Fraction_i \times CPI_i\) | 平均 CPI |
| \(Speedup = 1 / ((1-f)+f/s)\) | Amdahl 定律 |
| \(AMAT = Hit\ Time + Miss\ Rate \times Miss\ Penalty\) | 平均访存时间 |
| \(Memory\ Stall\ Cycles = Memory\ Accesses \times Miss\ Rate \times Miss\ Penalty\) | cache 停顿周期 |

### 13.2 RISC-V 速查

| 指令 | 含义 |
| --- | --- |
| `add rd, rs1, rs2` | `rd = rs1 + rs2` |
| `sub rd, rs1, rs2` | `rd = rs1 - rs2` |
| `addi rd, rs1, imm` | `rd = rs1 + imm` |
| `lw rd, imm(rs1)` | `rd = Mem[rs1 + imm]` |
| `sw rs2, imm(rs1)` | `Mem[rs1 + imm] = rs2` |
| `beq rs1, rs2, label` | 相等则跳转 |
| `bne rs1, rs2, label` | 不相等则跳转 |
| `jal rd, label` | 保存返回地址并跳转 |
| `jalr rd, imm(rs1)` | 间接跳转 |
| `lui rd, imm20` | 加载高 20 位立即数 |

### 13.3 CPU 实现速查

| 指令类型 | ALU 输入 B | 是否访存 | 是否写回 | 写回来源 | PC 来源 |
| --- | --- | --- | --- | --- | --- |
| R-type | `rs2` | 否 | 是 | ALU | `PC+4` |
| I-type ALU | `imm` | 否 | 是 | ALU | `PC+4` |
| Load | `imm` | 读 | 是 | Memory | `PC+4` |
| Store | `imm` | 写 | 否 | 无 | `PC+4` |
| Branch | `rs2` | 否 | 否 | 无 | `PC+4` 或目标地址 |
| Jump | 视实现 | 否 | 是 | `PC+4` | 目标地址 |

## 十四、复习路线

### 第一轮：建立主干

1. 背熟 CPU 性能公式和 AMAT。
2. 会读写 RISC-V 常用指令。
3. 能解释单周期 CPU 的数据通路。
4. 能画五级流水线并处理数据冒险。
5. 能做 cache 地址划分和命中判断。

### 第二轮：做题串联

1. 性能题：IC、CPI、频率、Amdahl、cache stall。
2. 汇编题：数组、循环、条件分支、函数调用。
3. 数据通路题：控制信号、关键路径、next PC。
4. 流水线题：转发、stall、flush、CPI。
5. 存储题：直接映射、组相联、AMAT、TLB。

### 第三轮：实验回顾

1. 回看 ALU、RegFile、ImmGen、Control 的接口。
2. 回看单周期 CPU 每类指令的波形。
3. 回看流水线寄存器中携带的数据和控制信号。
4. 整理自己调试时遇到的 bug，往往就是考试中的理解盲区。

## 十五、参考资料

- David A. Patterson, John L. Hennessy.《计算机组成与设计：硬件软件接口（RISC-V版）》。
- WintermelonC Docs：[计算机组成](https://wintermelonc.github.io/WintermelonC_Docs/zju/compulsory_courses/computer_organization/)（访问日期：2026-05-28），用于参考课程章节结构、RISC-V 相关资料入口、理论与实验部分脉络。
- WintermelonC Docs 课程章节：Computer Abstractions and Technology、Instructions: Language of the Computer、Arithmetic for Computers、The Processor、Large and Fast: Exploiting Memory Hierarchy、Storage and Other I/O Topics。

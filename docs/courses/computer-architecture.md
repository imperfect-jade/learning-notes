<!-- learning-notes
course: 计算机体系结构
textbook: 计算机体系结构：量化研究方法（第六版）
style: exam-review
source_policy: references-section
last_updated: 2026-05-26
-->

# 计算机体系结构

计算机体系结构研究如何选择和组织硬件机制，使计算机系统在**性能、功耗、成本、可靠性、可扩展性**之间取得可量化的平衡。它比“计算机组成”更强调设计取舍和定量分析：不仅要知道流水线、Cache、分支预测、动态调度、多核和 GPU 怎么工作，还要会判断它们在什么工作负载下值得实现。

!!! tip "课程主线"
    这门课可以用一句话串起来：**先用量化方法判断瓶颈，再围绕指令级并行、数据级并行、线程级并行和存储层次结构设计硬件机制，最后用性能、功耗和成本约束检验设计是否划算。**

## 一、课程地图与复习框架

### 1.1 体系结构与组成的区别

| 层次 | 关注问题 | 典型内容 |
| --- | --- | --- |
| 计算机组成 | 一条指令如何被硬件正确执行 | 数据通路、控制器、ALU、寄存器、单周期/流水线 CPU |
| 计算机体系结构 | 一类系统如何在约束下更高效地执行程序 | 性能评价、Cache 优化、动态调度、分支预测、向量/GPU、多核 |

```text
应用程序
  |
  v
编译器与运行时
  |
  v
ISA: 软件可见的硬件接口
  |
  v
微体系结构: 流水线、乱序执行、预测、Cache、多核
  |
  v
电路、工艺、封装、功耗与成本
```

### 1.2 本课程知识树

```text
计算机体系结构
|
|-- 量化方法
|   |-- CPU Time / CPI / Amdahl
|   |-- benchmark / SPEC
|   |-- power / cost / dependability
|
|-- 流水线与 ILP
|   |-- 冒险与停顿
|   |-- 动态调度: Scoreboard / Tomasulo
|   |-- 分支预测与推测执行
|   |-- 多发射: Superscalar / VLIW
|
|-- 存储层次
|   |-- Cache 基础
|   |-- miss penalty / miss rate / hit time
|   |-- 主存技术与带宽
|
|-- 并行体系结构
|   |-- DLP: Vector / SIMD / GPU
|   |-- TLP: multithreading / SMT / CMP
|   |-- Multiprocessor / coherence / synchronization
```

### 1.3 并行性的四条线

| 并行性 | 英文 | 粒度 | 典型机制 |
| --- | --- | --- | --- |
| 指令级并行 | ILP | 单线程内多条指令 | 流水线、动态调度、乱序执行、超标量 |
| 数据级并行 | DLP | 同一操作作用于大量数据 | 向量处理器、SIMD、GPU |
| 线程级并行 | TLP | 多线程/多任务 | 多线程处理器、SMT、多核 |
| 请求级并行 | RLP | 多个独立请求 | 服务器、数据中心、批处理吞吐 |

**复习抓手**：每种并行性都要回答三个问题：

1. 程序中哪里有独立工作？
2. 硬件如何发现或表达这些独立工作？
3. 瓶颈从计算转移到了哪里：取指、访存、提交、同步、通信还是功耗？

## 二、量化设计方法

### 2.1 体系结构设计的核心指标

| 指标 | 含义 | 常见场景 |
| --- | --- | --- |
| Response Time | 完成单个任务所需时间 | 桌面程序、交互式服务 |
| Throughput | 单位时间完成任务数量 | 服务器、批处理、数据库 |
| Energy | 完成任务消耗能量 | 移动设备、数据中心 |
| Power | 单位时间功耗 | 散热、供电、封装 |
| Cost | 制造和部署成本 | 商业产品 |
| Dependability | 可靠性、可用性、安全性 | 云服务、存储系统 |

性能定义：

\[
Performance = \frac{1}{Execution\ Time}
\]

若机器 A 比机器 B 快 \(n\) 倍：

\[
n = \frac{Performance_A}{Performance_B}
  = \frac{Execution\ Time_B}{Execution\ Time_A}
\]

### 2.2 CPU 时间公式

\[
CPU\ Time = Instruction\ Count \times CPI \times Clock\ Cycle\ Time
\]

也可写为：

\[
CPU\ Time = \frac{Instruction\ Count \times CPI}{Clock\ Rate}
\]

| 项 | 受谁影响 | 常见优化 |
| --- | --- | --- |
| Instruction Count | ISA、编译器、算法 | 更好算法、编译优化、向量化 |
| CPI | 微体系结构、存储层次 | 流水线、乱序执行、Cache |
| Clock Cycle Time | 电路关键路径、工艺 | 更短流水级、更高工艺水平 |

!!! warning "不要只看主频"
    主频提高不一定让程序更快。如果更深流水线导致分支错误代价增大、Cache miss 更多或 CPI 上升，最终 CPU time 可能不降反升。

### 2.3 平均 CPI 与停顿分解

多类指令平均 CPI：

\[
CPI = \sum_i Fraction_i \times CPI_i
\]

流水线常用分解：

\[
Pipeline\ CPI =
Ideal\ CPI
+ Structural\ Stalls
+ Data\ Hazard\ Stalls
+ Control\ Stalls
+ Memory\ Stalls
\]

理想单发射流水线 \(Ideal\ CPI \approx 1\)。若每条指令平均有 0.25 个数据冒险停顿、0.15 个控制停顿和 0.4 个访存停顿：

\[
CPI = 1 + 0.25 + 0.15 + 0.4 = 1.8
\]

### 2.4 Amdahl 定律

若某部分占原执行时间比例为 \(f\)，该部分加速 \(s\) 倍：

\[
Speedup = \frac{1}{(1-f) + \frac{f}{s}}
\]

例：程序 60% 时间花在内存访问，Cache 优化使内存访问快 3 倍：

\[
Speedup = \frac{1}{0.4 + \frac{0.6}{3}} = 1.67
\]

**高频考点**：

- 加速常见情况比加速少见情况更有效。
- 局部加速无限大时，整体加速上限是 \(1/(1-f)\)。
- Amdahl 定律适用于 Cache、分支预测、向量化、多核并行等题目。

### 2.5 Benchmark 与性能报告

| 指标 | 含义 | 使用提醒 |
| --- | --- | --- |
| SPECspeed | 关注单任务响应时间 | 适合比较单程序快慢 |
| SPECrate | 关注吞吐量 | 适合服务器并发任务 |
| MIPS | 每秒百万条指令 | 跨 ISA 比较常常误导 |
| MFLOPS/GFLOPS | 每秒浮点操作数 | 只适合浮点密集程序 |

**报告性能时要说明**：

- 测试程序和输入规模。
- 编译器、优化选项和运行环境。
- 使用响应时间还是吞吐量。
- 是否包含 I/O、系统调用、等待时间。
- 是否使用几何平均数汇总多个 benchmark。

### 2.6 功耗与能耗

动态功耗近似：

\[
P_{dynamic} \propto C \times V^2 \times f
\]

能耗：

\[
Energy = Power \times Time
\]

能效：

\[
Performance\ per\ Watt = \frac{Performance}{Power}
\]

**理解**：

- 电压是平方项，降低电压对功耗影响很大。
- 频率提高会增大功耗，也可能需要提高电压。
- ILP 密集设计往往带来复杂控制逻辑和更高功耗，TLP/DLP 有时能更高效地提升吞吐。

### 2.7 可靠性与可用性

可用性常用：

\[
Availability = \frac{MTTF}{MTTF + MTTR}
\]

| 符号 | 含义 |
| --- | --- |
| MTTF | Mean Time To Failure，平均无故障时间 |
| MTTR | Mean Time To Repair，平均修复时间 |

提高可用性的方法：

- 增大 MTTF：冗余、纠错码、更可靠部件。
- 减小 MTTR：热插拔、快速恢复、自动迁移。

## 三、流水线基础与冒险

### 3.1 流水线目标

流水线把一条指令拆成多个阶段，让不同指令重叠执行。

```text
Cycle:  1   2   3   4   5   6   7
I1:    IF  ID  EX  MEM WB
I2:        IF  ID  EX  MEM WB
I3:            IF  ID  EX  MEM WB
I4:                IF  ID  EX  MEM WB
```

理想情况下，单发射流水线填满后每周期完成一条指令：

\[
CPI_{ideal} = 1
\]

### 3.2 流水线不会自动提高所有性能

| 维度 | 流水线影响 |
| --- | --- |
| 吞吐率 | 通常提高 |
| 单条指令延迟 | 不一定降低，可能因流水寄存器开销增加 |
| 时钟周期 | 由最长流水级 + 寄存器开销决定 |
| CPI | 理想为 1，但冒险和 miss 会增加 |

### 3.3 三类冒险

| 冒险 | 原因 | 解决方式 |
| --- | --- | --- |
| Structural Hazard | 多条指令争用同一硬件资源 | 复制资源、分离 I/D Cache、停顿 |
| Data Hazard | 指令间存在数据依赖 | 转发、停顿、乱序执行、寄存器重命名 |
| Control Hazard | 分支/跳转改变控制流 | 分支预测、延迟槽、flush、推测执行 |

### 3.4 数据相关与数据冒险

| 类型 | 名称 | 含义 | 是否是真数据流 |
| --- | --- | --- | --- |
| RAW | Read After Write | 后指令读前指令写的值 | 是 |
| WAR | Write After Read | 后指令写了前指令要读的名字 | 否，名字相关 |
| WAW | Write After Write | 两条指令写同一个名字 | 否，名字相关 |

示例：

```asm
# RAW: sub 需要 add 产生的 x1
add x1, x2, x3
sub x4, x1, x5

# WAR: 后写 x1，不能破坏前读 x1
add x6, x1, x2
sub x1, x3, x4

# WAW: 两条指令都写 x1，最终值必须来自后一条
mul x1, x2, x3
add x1, x4, x5
```

**重点**：寄存器重命名可以消除 WAR 和 WAW，但不能消除 RAW，因为 RAW 表示真实数据流。

### 3.5 控制冒险代价

分支停顿近似：

\[
Control\ Stall\ Cycles =
Branch\ Frequency \times Misprediction\ Rate \times Misprediction\ Penalty
\]

降低控制冒险代价的三个方向：

- 降低分支频率：循环展开、条件移动、编译优化。
- 提高预测准确率：2-bit、相关预测、锦标赛预测。
- 降低错误代价：更早解析分支、更短流水线、更快重定向取指。

## 四、存储层次结构

### 4.1 为什么 Cache 是体系结构核心

处理器速度增长长期快于主存速度，导致 processor-memory gap。Cache 的目标是利用局部性，让平均访问时间接近小而快的存储器，同时容量接近大而慢的存储器。

```text
更快、更小、更贵

Register
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

### 4.2 Cache 四个基本问题

| 问题 | 英文 | 典型答案 |
| --- | --- | --- |
| 块放在哪里 | Block placement | direct-mapped、set associative、fully associative |
| 如何找到块 | Block identification | tag、index、offset、valid bit |
| miss 时替换谁 | Block replacement | random、LRU、FIFO |
| 写操作怎么办 | Write strategy | write-through、write-back、write-allocate |

### 4.3 地址划分

```text
Address:
+----------------+---------------+----------------+
|      Tag       |     Index     |  Block Offset  |
+----------------+---------------+----------------+
```

若地址为 32 位，Cache 有 256 个 set，block size 为 64 Byte：

\[
Offset = \log_2 64 = 6
\]

\[
Index = \log_2 256 = 8
\]

\[
Tag = 32 - 8 - 6 = 18
\]

### 4.4 AMAT 与 Memory Stall

平均访存时间：

\[
AMAT = Hit\ Time + Miss\ Rate \times Miss\ Penalty
\]

访存停顿周期：

\[
Memory\ Stall\ Cycles =
Memory\ Accesses \times Miss\ Rate \times Miss\ Penalty
\]

每条指令平均访存停顿：

\[
Memory\ Stall\ Cycles\ per\ Instruction =
Memory\ Accesses\ per\ Instruction \times Miss\ Rate \times Miss\ Penalty
\]

例：

```text
I-cache miss rate = 2%
D-cache miss rate = 5%
load/store 占比 = 40%
miss penalty = 50 cycles

每条指令 I-cache stall = 1 * 0.02 * 50 = 1.0
每条指令 D-cache stall = 0.4 * 0.05 * 50 = 1.0
总 memory stall CPI = 2.0
```

### 4.5 3C Miss 模型

| 类型 | 原因 | 优化方向 |
| --- | --- | --- |
| Compulsory Miss | 首次访问必然 miss | 预取、增大 block |
| Capacity Miss | 工作集超过 Cache 容量 | 增大 Cache、改进算法局部性 |
| Conflict Miss | 多个块映射到同一位置 | 增加相联度、victim cache |

多核中还会出现 coherence miss，与一致性协议有关。

### 4.6 Cache 优化思路

| 目标 | 方法 | 代价 |
| --- | --- | --- |
| 降低 miss penalty | 多级 Cache、critical word first、early restart、write buffer | 设计复杂、能耗增加 |
| 降低 miss rate | 增大 Cache、增大 block、提高相联度、编译优化 | hit time 可能增加 |
| 降低 hit time | 小而简单的 L1、way prediction、pipeline cache access | 容量/相联度受限 |
| 提高带宽 | 多 bank、非阻塞 Cache、预取 | 需要处理乱序返回和一致性 |

!!! warning "Cache 设计的常见取舍"
    增大 block 能利用空间局部性，但可能增加 miss penalty，并在空间局部性差时浪费带宽。提高相联度能减少 conflict miss，但可能增加 hit time 和功耗。

### 4.7 写策略

| 策略 | 含义 | 常见搭配 |
| --- | --- | --- |
| Write-through | 写 Cache 同时写下层 | 常配 write buffer |
| Write-back | 先写 Cache，替换时写回 | 需要 dirty bit |
| Write-allocate | 写 miss 时先把块调入 Cache | 常配 write-back |
| No-write-allocate | 写 miss 时直接写下层 | 常配 write-through |

### 4.8 主存技术与带宽

体系结构中关注主存不只是容量，还包括：

- 延迟：单次访问多久返回第一个字。
- 带宽：单位时间能传输多少数据。
- bank 组织：能否并行服务多个访问。
- 行缓冲命中：DRAM 同一行连续访问更快。
- 能耗：访存可能占系统能耗大头。

```text
CPU request
   |
Memory Controller
   |
+------+------+------+------+
|Bank0 |Bank1 |Bank2 |Bank3 |
+------+------+------+------+
```

## 五、动态调度与乱序执行

### 5.1 为什么需要动态调度

静态编译器调度无法完全解决：

- Cache miss 和内存延迟运行时才知道。
- 分支路径运行时才确定。
- 不同实现的功能部件数量和延迟不同。
- 指针和数组别名关系有时编译期无法确定。

动态调度的核心思想：**允许后面的独立指令越过被阻塞的指令先执行，只要不破坏程序语义**。

### 5.2 程序顺序、数据流与异常

乱序执行要同时满足：

| 要求 | 含义 |
| --- | --- |
| 保持真实数据相关 | RAW 不能被破坏 |
| 消除或处理名字相关 | WAR/WAW 可通过重命名消除 |
| 保持精确异常 | 异常看起来像按程序顺序执行时发生 |
| 保持提交顺序 | 对外可见状态按程序顺序更新 |

```text
乱序执行内部：
  issue -> execute -> write result

对外提交：
  commit in program order
```

### 5.3 Scoreboard

Scoreboard 是集中式动态调度机制，负责跟踪功能部件和寄存器状态。

典型阶段：

```text
Issue -> Read Operands -> Execute -> Write Result
```

| 阶段 | 检查内容 |
| --- | --- |
| Issue | 功能部件是否空闲，是否有 WAW |
| Read Operands | 源操作数是否可读，处理 RAW |
| Execute | 功能部件执行 |
| Write Result | 写回前检查 WAR |

**优点**：能让部分无关指令越过停顿点执行。

**局限**：

- 集中控制复杂。
- WAR 和 WAW 会限制并行。
- 没有寄存器重命名时，名字相关仍然显著。

### 5.4 Tomasulo 算法

Tomasulo 用保留站（Reservation Station）和公共数据总线（CDB）实现分布式调度与隐式寄存器重命名。

```text
Instruction Queue
       |
       v
+-------------------+
| Reservation Station| <--- operands or tags
+-------------------+
       |
       v
 Functional Unit
       |
       v
 Common Data Bus ----> waiting reservation stations
```

保留站常见字段：

| 字段 | 含义 |
| --- | --- |
| Op | 操作类型 |
| Vj, Vk | 已经可用的源操作数值 |
| Qj, Qk | 将产生源操作数的保留站标签 |
| Busy | 该保留站是否占用 |

### 5.5 Tomasulo 三阶段

| 阶段 | 行为 |
| --- | --- |
| Issue | 若保留站空闲，发射指令，并把寄存器名替换为值或标签 |
| Execute | 源操作数都可用后执行 |
| Write Result | 结果通过 CDB 广播给等待者 |

**关键收益**：

- 通过标签和保留站实现寄存器重命名。
- 消除 WAR 和 WAW。
- RAW 通过等待标签广播解决。
- 多个等待同一结果的指令可在 CDB 广播后同时就绪。

### 5.6 Scoreboard 与 Tomasulo 对比

| 维度 | Scoreboard | Tomasulo |
| --- | --- | --- |
| 控制方式 | 集中式 | 分布式 |
| 依赖跟踪 | Scoreboard 表 | 保留站 + 标签 |
| 寄存器重命名 | 原始形式没有 | 隐式重命名 |
| WAR/WAW | 可能导致停顿 | 通常被重命名消除 |
| 转发 | 受限 | CDB 广播 |
| 硬件复杂度 | 集中表复杂 | CDB/保留站复杂 |

### 5.7 显式寄存器重命名

现代处理器常使用比 ISA 寄存器更多的物理寄存器。

```text
ISA register x1
   |
Rename Table
   v
Physical register P37
```

核心思想：

- 每条写寄存器的指令分配新的物理寄存器。
- Rename Table 记录当前架构寄存器对应哪个物理寄存器。
- 提交后释放旧物理寄存器。

**重点**：寄存器重命名只是解决名字冲突，不改变真实数据依赖。

## 六、分支预测与推测执行

### 6.1 为什么分支预测重要

流水线越深、发射宽度越大，错误路径浪费越严重。若每次分支错误要 flush 很多级，少量预测错误也会显著提高 CPI。

\[
Branch\ Penalty\ CPI =
Branch\ Frequency \times Misprediction\ Rate \times Penalty
\]

例：

```text
branch frequency = 20%
misprediction rate = 5%
penalty = 12 cycles

CPI penalty = 0.2 * 0.05 * 12 = 0.12
```

### 6.2 静态预测

| 策略 | 思路 | 问题 |
| --- | --- | --- |
| Predict not taken | 默认顺序执行 | 循环回边常预测错 |
| Predict taken | 默认跳转 | 需要尽早知道目标地址 |
| Profile-guided | 根据历史运行统计 | 输入变化时可能不准 |
| Delayed branch | 编译器填延迟槽 | 深流水线和复杂实现中效果有限 |

### 6.3 1-bit 与 2-bit 预测器

1-bit predictor 记录上次结果：

```text
last = taken     -> predict taken
last = not taken -> predict not taken
```

循环中常见问题：循环退出时错一次，下一次进入循环时又错一次。

2-bit 饱和计数器要连续两次错误才改变强预测方向：

```text
00 Strong NT
01 Weak NT
10 Weak T
11 Strong T
```

更新规则：

- 实际 taken：计数器加 1，最多到 3。
- 实际 not taken：计数器减 1，最少到 0。
- 高位为 1 预测 taken，高位为 0 预测 not taken。

### 6.4 相关预测与锦标赛预测

有些分支的行为取决于最近其他分支的结果，单独看该分支历史不够。

```text
Global Branch History Register
        |
        v
Pattern History Table -> 2-bit counters -> prediction
```

| 预测器 | 思想 |
| --- | --- |
| Local Predictor | 每个分支维护自己的局部历史 |
| Global Predictor | 用最近若干全局分支结果预测 |
| Correlating Predictor | 用分支历史选择预测项 |
| Tournament Predictor | 在 local/global 等预测器之间动态选择 |

### 6.5 BTB 与返回地址预测

只预测 taken/not taken 还不够，taken 时还需要目标地址。

| 结构 | 作用 |
| --- | --- |
| BHT | 预测是否跳转 |
| BTB | 缓存分支目标地址 |
| Return Address Stack | 预测函数返回地址 |

```text
PC -> BTB lookup
       |
       +-- hit and predict taken -> next PC = target
       |
       +-- miss / predict NT -> next PC = PC + 4
```

### 6.6 推测执行

推测执行先按预测路径执行指令，但在确认预测正确前不把结果提交到架构状态。

```text
Fetch -> Rename -> Issue -> Execute -> Write Result -> Commit
                              speculative       in order
```

需要解决：

- 预测错误时撤销错误路径。
- 异常必须精确。
- store 不能提前破坏内存状态。
- 多条指令乱序完成但按序提交。

### 6.7 Reorder Buffer

ROB 保存未提交指令的结果和状态，让乱序执行具备按序提交能力。

| 字段 | 含义 |
| --- | --- |
| Instruction type | 指令类型 |
| Destination | 目的寄存器或内存位置 |
| Value | 执行结果 |
| Ready | 结果是否可提交 |

提交规则：

```text
while ROB head is ready:
    if instruction is normal:
        update architectural state
    if instruction is branch and prediction wrong:
        flush younger instructions
    if instruction raises exception:
        handle precise exception
```

### 6.8 Memory Disambiguation

load 跟在 store 后面时，必须判断二者地址是否相关。

```asm
sw x5, 0(x2)
lw x6, 0(x3)
```

若 `x2 == x3`，load 依赖 store；若不同，可以提前执行。

硬件常用：

- Store Queue 保存未提交 store 的地址和值。
- Load 执行前检查更老的 store。
- 如果更老 store 地址未知，load 可能停顿或被预测执行。
- 如果预测错误，需要重放 load 和依赖指令。

## 七、多发射：Superscalar 与 VLIW

### 7.1 多发射目标

单发射流水线理想 CPI 为 1。多发射希望每周期发射多条指令，使：

\[
CPI < 1
\]

或等价地：

\[
IPC = \frac{Instructions}{Cycle} > 1
\]

### 7.2 Superscalar

Superscalar 由硬件在运行时决定每周期发射哪些指令。

```text
Fetch many instructions
       |
Decode / Rename
       |
Issue Queue
       |
+------+-------+-------+
| ALU  | Load  | FP    |
+------+-------+-------+
       |
Commit in order
```

特点：

- 硬件复杂，适合通用程序。
- 可结合动态调度、寄存器重命名、推测执行。
- 发射宽度越大，取指、译码、重命名、唤醒选择和提交越难。

### 7.3 VLIW

VLIW（Very Long Instruction Word）由编译器把多个独立操作打包进一条很长指令。

```text
| memory op | memory op | FP op | FP op | int/branch |
```

特点：

- 硬件相对简单。
- 编译器承担调度责任。
- 代码尺寸可能增大。
- 二进制兼容性较难，因为不同实现的功能部件数量可能不同。

### 7.4 Loop Unrolling

循环展开通过复制循环体减少分支开销，并暴露更多独立指令。

原循环：

```c
for (int i = 0; i < n; i++) {
    y[i] = a * x[i] + y[i];
}
```

展开 4 次：

```c
for (int i = 0; i < n; i += 4) {
    y[i]     = a * x[i]     + y[i];
    y[i + 1] = a * x[i + 1] + y[i + 1];
    y[i + 2] = a * x[i + 2] + y[i + 2];
    y[i + 3] = a * x[i + 3] + y[i + 3];
}
```

收益：

- 减少 loop overhead。
- 产生更多可调度的独立 load、multiply、add、store。
- 减少分支频率。

代价：

- 代码体积变大。
- 寄存器压力增加。
- 若迭代间有依赖，展开效果有限。

### 7.5 多发射难点

| 难点 | 原因 |
| --- | --- |
| 取指带宽 | 每周期需要取多条有效指令 |
| 分支预测 | 错误路径浪费随发射宽度放大 |
| 重命名带宽 | 同周期多条指令可能多次写同一逻辑寄存器 |
| 唤醒选择 | 大 issue queue 中选择就绪指令很复杂 |
| 提交带宽 | 每周期要按序提交多条指令 |
| 功耗 | 比较器、端口、旁路网络迅速膨胀 |

## 八、数据级并行：Vector、SIMD 与 GPU

### 8.1 DLP 的基本思想

数据级并行来自大量数据执行相同或相似操作。

```c
for (int i = 0; i < n; i++) {
    y[i] = a * x[i] + y[i];
}
```

每次迭代之间基本独立，适合向量化或 SIMD。

### 8.2 Vector Processor

向量处理器用一条向量指令表示对多个元素的操作。

```text
LV    V1, Rx      # load vector X
MULSV V2, F0, V1  # V2 = scalar a * V1
LV    V3, Ry      # load vector Y
ADDV  V4, V2, V3  # V4 = V2 + V3
SV    Ry, V4      # store vector Y
```

优势：

- 减少取指和译码开销。
- 数据相关关系清晰。
- 访存访问模式更规则。
- 向量功能部件可深流水化。

### 8.3 Vector Register 与 MVL

| 概念 | 含义 |
| --- | --- |
| Vector Register | 保存一组元素的寄存器 |
| MVL | Maximum Vector Length，向量寄存器最大元素数 |
| VL | Vector Length，当前向量操作实际元素数 |
| Lane | 并行执行向量元素的通道 |

当 \(N > MVL\) 时使用 strip mining。

```c
for (int i = 0; i < n; i += MVL) {
    int vl = min(MVL, n - i);
    // vector operation on vl elements
}
```

### 8.4 Chaining 与多 Lane

Chaining 类似向量版本的转发：前一个向量操作产生第一个元素后，后续依赖向量操作即可开始。

```text
Without chaining:
MULV produces all elements -> ADDV starts

With chaining:
MULV element 0 -> ADDV element 0 starts
MULV element 1 -> ADDV element 1 starts
...
```

多 lane 把元素分配到多个并行通道：

```text
Vector elements:
e0 e1 e2 e3 e4 e5 e6 e7

Lane0: e0 e4
Lane1: e1 e5
Lane2: e2 e6
Lane3: e3 e7
```

### 8.5 Mask 与 Scatter/Gather

条件执行可用 mask：

```text
VM[i] = (A[i] != B[i])
if VM[i]:
    A[i] = A[i] - B[i]
```

间接访问需要 gather/scatter：

```text
gather:  V[i] -> Memory[index[i]]
scatter: Memory[index[i]] <- V[i]
```

**难点**：不规则访存会削弱 DLP 的效率，因为带宽、bank conflict 和 cache miss 会成为瓶颈。

### 8.6 SIMD 与 GPU

SIMD 让多个处理单元执行同一指令流，对不同数据元素操作。

GPU 适合：

- 大量线程。
- 高算术强度。
- 规则或可合并的内存访问。
- 分支发散较少的程序。

GPU 不适合：

- 串行依赖强。
- 分支高度不规则。
- 随机访存多。
- 数据规模太小，启动和传输开销占主导。

## 九、线程级并行与多线程处理器

### 9.1 进程与线程

| 概念 | 说明 |
| --- | --- |
| Process | 拥有独立地址空间 |
| Thread | 拥有独立执行上下文，共享进程地址空间 |
| Hardware Thread | 硬件维护的线程上下文 |

线程上下文通常包括：

- PC。
- 架构寄存器。
- 异常/中断状态。
- 部分重命名或资源标签。

### 9.2 多线程体系结构分类

| 类型 | 思想 | 优点 | 缺点 |
| --- | --- | --- | --- |
| Coarse-grain MT | 长延迟事件时切换线程 | 实现简单 | 无法隐藏短停顿 |
| Fine-grain MT | 每周期或频繁切换线程 | 隐藏流水线停顿 | 单线程性能下降 |
| SMT | 同周期发射多个线程的指令 | 提高功能部件利用率 | 资源竞争复杂 |
| CMP / Multicore | 多个核心并行执行线程 | 扩展吞吐 | 需要同步和一致性 |

### 9.3 SMT 的核心问题

SMT（Simultaneous Multithreading）在乱序超标量核心上同时调度多个线程的指令。

```text
Thread 0 instructions ----+
                          v
Thread 1 instructions -> Shared issue queue -> Functional units
                          ^
Thread 2 instructions ----+
```

设计挑战：

- 取指策略：优先哪个线程。
- 共享资源分配：ROB、issue queue、load/store queue、Cache。
- 公平性与吞吐：偏向某线程可能牺牲总体吞吐。
- 单线程性能：多线程共享资源可能拖慢关键线程。

### 9.4 TLP 与 ILP 的取舍

| 方向 | 代表 | 优势 | 代价 |
| --- | --- | --- | --- |
| 深挖 ILP | 宽发射乱序核心 | 单线程快 | 功耗高、复杂度高 |
| 利用 TLP | 多线程/多核 | 吞吐和能效好 | 依赖应用并行度 |

**复习点**：当单线程 ILP 越来越难挖、功耗限制越来越强时，体系结构自然转向多核、SMT 和专用加速。

## 十、多处理器与共享内存

### 10.1 多处理器基本模型

```text
+------+     +------+
|Core0 |     |Core1 |
| L1   |     | L1   |
+---+--+     +--+---+
    |           |
    +-----+-----+
          |
        L2/L3
          |
      Main Memory
```

共享内存多处理器要解决：

- 多个核心如何通信。
- 各核心私有 Cache 如何保持一致。
- 程序如何同步。
- 内存访问顺序如何被观察。

### 10.2 Cache Coherence

一致性要保证：同一地址的多个副本不会让程序看到矛盾结果。

常见协议状态：

| 状态 | 含义 |
| --- | --- |
| M Modified | 本 Cache 修改过，内存旧 |
| S Shared | 多个 Cache 可共享只读 |
| I Invalid | 本副本无效 |

MSI 思路：

```text
Read miss:
  I -> S

Write hit on S:
  invalidate others
  S -> M

Other core writes:
  S/M -> I
```

### 10.3 False Sharing

两个核心访问不同变量，但变量位于同一个 cache block，导致不必要的一致性失效。

```c
struct Counter {
    long a; // thread 0 updates
    long b; // thread 1 updates
};
```

如果 `a` 和 `b` 在同一 cache line，不同线程频繁写会反复让对方 cache line 失效。

改进：

```c
struct Counter {
    long a;
    char pad1[64];
    long b;
    char pad2[64];
};
```

### 10.4 Synchronization

同步原语：

- lock / mutex。
- semaphore。
- barrier。
- atomic compare-and-swap。
- load-linked / store-conditional。

简单自旋锁伪代码：

```c
while (test_and_set(&lock) == 1) {
    // spin
}

// critical section

lock = 0;
```

**难点**：锁本身会产生共享写，可能造成总线/互连流量和 cache coherence 压力。

### 10.5 Memory Consistency

Cache coherence 关注同一地址，memory consistency 关注不同地址操作的可见顺序。

```c
// Thread 1
x = 1;
flag = 1;

// Thread 2
while (flag == 0) {}
print(x);
```

若体系结构或编译器重排 `x = 1` 与 `flag = 1`，Thread 2 可能看到 `flag == 1` 但 `x` 仍旧。需要内存屏障或同步原语约束顺序。

## 十一、典型题型与解题模板

### 11.1 量化性能题

步骤：

1. 确定比较的是响应时间还是吞吐量。
2. 写出 \(CPU\ Time = IC \times CPI / Clock\ Rate\)。
3. 将 CPI 拆成理想 CPI 和各类停顿。
4. 对局部优化使用 Amdahl 定律。
5. 最后用执行时间比值算 speedup。

### 11.2 Cache 题

步骤：

1. 由 block size 算 offset 位数。
2. 由 set 数算 index 位数。
3. 剩余为 tag。
4. 对每次访问判断 tag 是否匹配、valid 是否有效。
5. 统计 hit/miss。
6. 用 AMAT 或 memory stall 公式计算性能影响。

### 11.3 流水线与分支题

步骤：

1. 画出每条指令的阶段表。
2. 标 RAW/WAR/WAW。
3. 判断哪些能用转发解决。
4. 对 load-use、结构冲突和分支错误插入 stall/flush。
5. 计算总周期数、CPI 或 IPC。

### 11.4 Tomasulo/ROB 题

步骤：

1. 写出指令序列的源寄存器和目的寄存器。
2. 发射时分配保留站/ROB 项。
3. 若源操作数未就绪，记录生产者标签。
4. 执行完成后通过 CDB 广播。
5. ROB 头部就绪后按序提交。
6. 遇到分支错误或异常时 flush younger instructions。

### 11.5 分支预测题

步骤：

1. 给预测器初态。
2. 对每个分支结果先预测再更新。
3. 统计错误次数。
4. 对 2-bit 饱和计数器注意上下界。
5. 对 global/local predictor 注意使用哪段历史索引。

### 11.6 并行体系结构题

步骤：

1. 判断程序主要并行性：ILP、DLP、TLP 还是 RLP。
2. 判断瓶颈：计算、访存、同步、分支、通信。
3. 选择机制：向量化、SIMD/GPU、SMT、多核、Cache 优化。
4. 用 Amdahl 或吞吐模型估算收益上限。
5. 说明代价：功耗、复杂度、代码膨胀、一致性流量。

## 十二、高频易错点

| 知识点 | 易错说法 | 正确理解 |
| --- | --- | --- |
| 性能 | 主频越高越快 | 还要看 IC、CPI 和工作负载 |
| MIPS | 可跨架构公平比较 | 不同 ISA 指令含义不同，MIPS 可能误导 |
| Amdahl | 局部无限加速即可整体无限快 | 整体上限由未加速部分决定 |
| 流水线 | 让每条指令延迟降低 | 主要提高吞吐率 |
| RAW | 可用重命名消除 | RAW 是真实数据依赖，只能等待或转发 |
| WAR/WAW | 一定是真依赖 | 是名字相关，可用重命名消除 |
| Tomasulo | 只是一种转发机制 | 核心是保留站、标签、CDB 和隐式重命名 |
| ROB | 用于加快执行 | 主要用于按序提交和精确异常 |
| 分支预测 | 只需预测方向 | taken 时还需要目标地址 |
| Cache | 增大容量总是更快 | hit time、功耗和延迟可能上升 |
| 相联度 | 越高越好 | 冲突少但命中时间和复杂度增加 |
| Vector | 适合所有循环 | 需要迭代独立和较规则访存 |
| GPU | 线程越多越快 | 受内存合并、分支发散、占用率限制 |
| Coherence | 等于 Consistency | 前者管同一地址，后者管不同地址可见顺序 |
| SMT | 等于多核 | SMT 是同一核心共享资源执行多硬件线程 |

## 十三、重难点速查

### 13.1 公式速查

| 公式 | 用途 |
| --- | --- |
| \(Performance = 1 / Execution\ Time\) | 性能定义 |
| \(CPU\ Time = IC \times CPI \times Cycle\ Time\) | CPU 时间 |
| \(CPU\ Time = IC \times CPI / Clock\ Rate\) | 主频形式 |
| \(CPI = \sum_i Fraction_i \times CPI_i\) | 平均 CPI |
| \(Speedup = 1 / ((1-f)+f/s)\) | Amdahl 定律 |
| \(AMAT = Hit\ Time + Miss\ Rate \times Miss\ Penalty\) | 平均访存时间 |
| \(Memory\ Stall = Accesses \times Miss\ Rate \times Miss\ Penalty\) | 访存停顿 |
| \(Availability = MTTF/(MTTF+MTTR)\) | 可用性 |
| \(Power \propto C V^2 f\) | 动态功耗近似 |
| \(IPC = Instructions / Cycle\) | 每周期指令数 |

### 13.2 机制速查

| 机制 | 解决问题 | 主要代价 |
| --- | --- | --- |
| Pipeline | 提高指令吞吐 | 冒险、分支代价、流水寄存器开销 |
| Forwarding | 减少 RAW 停顿 | 旁路网络复杂 |
| Scoreboard | 动态调度 | WAR/WAW 限制、集中控制 |
| Tomasulo | 乱序执行和重命名 | CDB、保留站复杂 |
| ROB | 精确异常和按序提交 | 容量限制、提交带宽 |
| 2-bit Predictor | 降低简单循环分支错误 | 表项冲突 |
| Tournament Predictor | 适应不同分支模式 | 硬件表和选择器复杂 |
| Cache | 降低平均访存延迟 | 一致性、功耗、面积 |
| Vector/SIMD | 利用 DLP | 对程序结构敏感 |
| SMT | 提高核心资源利用率 | 线程间资源竞争 |
| Multicore | 提升吞吐和能效 | 同步、一致性、负载均衡 |

## 十四、复习路线

### 第一轮：建立主线

1. 背熟 CPU Time、Amdahl、AMAT、Availability。
2. 理清 ILP、DLP、TLP、RLP 的区别。
3. 能解释 Cache 四个基本问题。
4. 能说清 Scoreboard、Tomasulo、ROB 的作用差异。
5. 能区分 branch predictor、BTB、return address stack。

### 第二轮：专题刷题

1. 性能题：CPU time、CPI 分解、Amdahl。
2. Cache 题：地址划分、miss 类型、AMAT。
3. 流水线题：RAW/WAR/WAW、stall、flush、IPC。
4. 动态调度题：保留站、CDB、ROB、提交顺序。
5. 分支预测题：2-bit counter、global/local/tournament。
6. 并行题：向量化、SMT、多核、一致性。

### 第三轮：系统串联

用同一个循环例子反复问：

```c
for (int i = 0; i < n; i++) {
    y[i] = a * x[i] + y[i];
}
```

- 量化方法：瓶颈是计算、访存还是循环控制？
- Cache：顺序访问是否命中？block size 是否合适？
- ILP：能否展开循环并调度 load/mul/add/store？
- 分支预测：循环分支错误代价如何？
- DLP：能否向量化或 SIMD？
- TLP：能否把数组分块给多个线程？
- 多核：是否有 false sharing 或同步开销？

## 十五、参考资料

- John L. Hennessy, David A. Patterson.《计算机体系结构：量化研究方法（第六版）》。
- WintermelonC Docs：[计算机体系结构](https://wintermelonc.github.io/WintermelonC_Docs/zju/compulsory_courses/computer_architecture/)，用于参考课程章节结构与理论/实验资料入口。
- PPT：`Arch_2_ch1_1_fundamentals1.pptx`，第 1-64 页，体系结构基础、性能、功耗、分类与设计目标。
- PPT：`Arch_3_ch1_2_fundamentals2.pptx`，第 1-74 页，成本、可靠性、可用性、benchmark 与性能报告。
- PPT：`Arch_4_pipeline.pptx`，第 1-106 页，流水线、冒险、停顿和基础流水线性能。
- PPT：`Arch_5_ch2_1_cache_basics.pptx`，第 1-38 页，Cache 基本概念、映射、替换和写策略。
- PPT：`Arch_6_ch2_2_cache_miss.pptx`，第 1-71 页，降低 miss penalty、miss rate、hit time 与并行访存。
- PPT：`Arch_7_ch2_3_memory_technology.pptx`，第 1-28 页，主存技术、组织方式和带宽优化。
- PPT：`Arch_8_ch3_1_dynamic_scheduling.pptx`，第 1-158 页，ILP、Scoreboard、Tomasulo、寄存器重命名。
- PPT：`Arch_9_ch3_2_branch_predictor.pptx`，第 1-56 页，动态分支预测、相关预测、锦标赛预测、BTB 和返回地址预测。
- PPT：`Arch_10_ch3_3_speculation.pptx`，第 1-42 页，推测执行、ROB、按序提交和 memory disambiguation。
- PPT：`Arch_11_ch3_4_superscalar_VLIW.pptx`，第 1-47 页，多发射、超标量、VLIW、循环展开和编译器调度。
- PPT：`Arch_12_ch3_5_multithreading.pptx`，第 1-67 页，多线程、SMT、Hyper-Threading、TLP 与能效。
- PPT：`Arch_13_ch4_dlp_vector_simd_gpu.pptx`，第 1-71 页，DLP、向量处理器、SIMD、GPU、mask、scatter/gather。
- PPT：`Arch_14_ch5_1_multiprocessor.pptx`，第 1-38 页，多处理器、共享内存、同步、Cache coherence 与一致性。

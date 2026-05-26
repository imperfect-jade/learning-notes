<!-- learning-notes
course: 计算机组成
textbook: 计算机组成与设计：硬件软件接口（RISC-V版）
style: exam-review
source_policy: references-section
last_updated: 2026-05-26
-->

# 计算机组成

计算机组成关注一条高级语言语句从程序、指令、数据通路、控制信号、存储层次到 I/O 设备的执行过程。复习时不要把知识点背成孤岛，要始终围绕一句话：**硬件通过指令集架构（ISA）向软件暴露一个稳定接口，处理器、存储器和 I/O 系统共同完成这套接口的高效实现**。

!!! tip "复习抓手"
    这门课最容易混乱的地方不是概念数量，而是层次切换。建议按“程序怎么变成指令”“指令怎么被数据通路执行”“执行时间由什么决定”“存储层次为什么有效”四条线索反复串联。

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

### 2.4 Amdahl 定律

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

### 2.5 功耗与能耗

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

### 3.6 组合逻辑与时序逻辑

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

### 4.4 算术逻辑指令

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

### 4.5 Load/Store 指令

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

### 4.6 分支与跳转

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

### 4.7 数组访问示例

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

### 4.8 函数调用基本流程

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

### 6.4 不同指令的数据路径

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

### 6.5 关键路径

单周期 CPU 的时钟周期必须覆盖最慢指令的最长路径。

通常 `lw` 路径较长：

```text
PC -> I-Mem -> RegFile -> ALU -> D-Mem -> MUX -> RegFile
```

**结论**：

- 单周期 CPU 简单，但所有指令都被最慢指令拖慢。
- 这也是引入多周期 CPU 和流水线 CPU 的动机。

### 6.6 Verilog 风格的控制逻辑示例

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

### 8.9 虚拟内存

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

### 8.10 页表与 TLB

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

### 9.5 存储设备

| 设备 | 特点 | 性能瓶颈 |
| --- | --- | --- |
| HDD | 容量大、便宜、机械结构 | 寻道时间、旋转延迟 |
| SSD | 随机访问快、无机械结构 | 写放大、擦除块限制 |
| RAID | 多磁盘组合 | 性能、容量、可靠性权衡 |

**复习点**：I/O 章节常与可靠性、冗余、带宽、延迟联系，不要只背设备名。

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

### 10.4 单周期 CPU 调试顺序

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

### 10.5 流水线 CPU 调试顺序

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
- WintermelonC Docs：[计算机组成](https://wintermelonc.github.io/WintermelonC_Docs/zju/compulsory_courses/computer_organization/)，用于参考课程章节结构、RISC-V 相关资料入口、理论与实验部分脉络。
- WintermelonC Docs 课程章节：Computer Abstractions and Technology、Instructions: Language of the Computer、Arithmetic for Computers、The Processor、Large and Fast: Exploiting Memory Hierarchy、Storage and Other I/O Topics。

# MiniSQL 实验教程记录

本文档用于记录 MiniSQL 数据库课程大作业的逐步实验教程。后续每完成一个小实验讲解，都会在这里追加完整教程，方便回顾、复盘和准备验收。

## 使用方式

每个小实验都会按以下结构记录：

1. 实验目标：这一节最终要实现什么。
2. 相关文件：需要阅读或修改的核心代码位置。
3. 核心概念：先把数据库原理讲明白。
4. 接口契约：每个函数输入、输出、状态变化是什么。
5. 实现思路：按步骤推导代码应该怎么写。
6. 常见错误：容易踩坑的位置。
7. 测试方法：对应测试文件和通过标准。
8. 验收问答：老师可能会追问的实现细节。

## 当前实验路线

官方文档对应的实验顺序如下：

| 顺序 | 模块 | 主要内容 | 对应测试 |
| --- | --- | --- | --- |
| 1 | Disk and Buffer Pool Manager | 位图页、磁盘页分配、LRU、缓冲池管理 | `disk_manager_test.cpp`, `lru_replacer_test.cpp`, `buffer_pool_manager_test.cpp` |
| 2 | Record Manager | `Row` / `Column` / `Schema` 序列化，堆表和表迭代器 | `tuple_test.cpp`, `table_heap_test.cpp` |
| 3 | Index Manager | B+ 树页、插入、删除、查找、索引迭代器 | `b_plus_tree_test.cpp`, `b_plus_tree_index_test.cpp`, `index_iterator_test.cpp` |
| 4 | Catalog Manager | 表和索引元信息持久化，创建/删除/加载表与索引 | `catalog_test.cpp` |
| 5 | Planner and Executor | 顺序扫描、索引扫描、插入、更新、删除、数据库/表/索引 SQL 命令 | `executor_test.cpp` |
| 6 | Recovery Manager | 内存日志结构、Redo、Undo | `recovery_manager_test.cpp` |
| 7 | Lock Manager | 共享锁、排他锁、锁升级、2PL、等待图、死锁检测 | `lock_manager_test.cpp` |

## 当前项目观察

这是一个 C++ MiniSQL 框架，整体结构已经搭好，主要任务是在带有 `TODO: Student Implement` 的位置补齐实现。项目根目录下的关键目录如下：

- `src/include`：核心头文件，定义公共接口和类结构。
- `src`：各模块 `.cpp` 实现文件。
- `test`：GoogleTest 测试代码，是判断每个模块是否完成的直接依据。
- `thirdparty`：`gtest` 和 `glog` 等第三方库。

重要提醒：

- 当前框架文档说明 Windows 原生编译不推荐，建议使用 WSL、Linux 或 macOS 环境构建。
- 不应随意修改公共接口签名，否则可能无法通过测试。
- 每个模块后续讲解时，会优先从测试文件反推接口行为，再回到源码设计实现。

## 讲解进度

| 状态 | 小实验 | 记录 |
| --- | --- | --- |
| 已讲解 | 1.1 项目与环境概览 | 见“实验一” |
| 已讲解 | 1.2 Bitmap Page | 见“实验一” |
| 已讲解 | 1.3 Disk Manager | 见“实验一” |
| 已讲解 | 1.4 LRU Replacer | 见“实验一” |
| 已讲解 | 1.5 Buffer Pool Manager | 见“实验一” |
| 已讲解 | 2.1 Record Manager 概览 | 见“实验二” |
| 已讲解 | 2.2 Row / Column / Schema 序列化 | 见“实验二” |
| 已讲解 | 2.3 TablePage / TableHeap / TableIterator | 见“实验二” |
| 已讲解 | 3.1 Index Manager 概览 | 见“实验三” |
| 已讲解 | 3.2 B+ 树页结构 | 见“实验三” |
| 已讲解 | 3.3 B+ 树插入、查找、删除 | 见“实验三” |
| 已讲解 | 3.4 IndexIterator 与 BPlusTreeIndex | 见“实验三” |

## 下一步

建议先按本教程完成 `BitmapPage`，运行 `disk_manager_test` 中的 `BitMapPageTest`；通过后再继续实现 `DiskManager`、`LRUReplacer` 和 `BufferPoolManager`。

## 实验一：Disk and Buffer Pool Manager

### 1. 实验目标

实验一要完成 MiniSQL 最底层的存储管理能力。上层模块以后要创建表、插入记录、建立索引，最终都要落到“读写某个数据页”这件事上。所以这一节可以理解为给整个数据库打地基。

本实验包含四个小模块：

1. `BitmapPage`：用位图记录哪些磁盘页已经分配，哪些还空闲。
2. `DiskManager`：在数据库文件中分配、回收、读写逻辑页。
3. `LRUReplacer`：当内存缓冲池满了，找一个最近最少使用的页帧淘汰。
4. `BufferPoolManager`：管理内存中的页缓存，负责取页、新建页、取消固定、刷盘和删除页。

对应文件：

- `src/include/page/bitmap_page.h`
- `src/page/bitmap_page.cpp`
- `src/include/storage/disk_manager.h`
- `src/storage/disk_manager.cpp`
- `src/include/buffer/lru_replacer.h`
- `src/buffer/lru_replacer.cpp`
- `src/include/buffer/buffer_pool_manager.h`
- `src/buffer/buffer_pool_manager.cpp`
- `src/include/page/page.h`
- `src/include/page/disk_file_meta_page.h`

对应测试：

- `test/storage/disk_manager_test.cpp`
- `test/buffer/lru_replacer_test.cpp`
- `test/buffer/buffer_pool_manager_test.cpp`

### 2. 相关数据库知识

#### 2.1 为什么数据库按页管理数据

数据库不会每次只从磁盘读一个字段或一条记录，而是以固定大小的页为单位读写。本项目中：

```cpp
static constexpr int PAGE_SIZE = 4096;
```

也就是说，一个数据库页大小是 4KB。

这样做有几个原因：

1. 磁盘和文件系统本来就更适合块式读写。
2. 固定页大小方便定位：第 `n` 个物理页的位置就是 `n * PAGE_SIZE`。
3. 上层记录、索引、目录都可以统一存放在页里。
4. 缓冲池可以缓存有限数量的页，而不是缓存无限大小的对象。

所以 MiniSQL 的底层抽象非常朴素：磁盘文件是一串页，内存缓冲池也是一组页帧。

#### 2.2 逻辑页号和物理页号

本实验中一定要分清两个概念：

- 逻辑页号 `logical_page_id`：上层模块看到的页号，比如 Catalog 第 0 页、Index Roots 第 1 页。
- 物理页号 `physical_page_id`：真实数据库文件里的页号，用于计算文件偏移。

为什么两者不同？因为数据库文件里除了真正的数据页，还有元数据页和位图页。

磁盘文件布局是：

```text
physical page 0:
  DiskFileMetaPage

extent 0:
  bitmap page
  data page 0
  data page 1
  ...
  data page BITMAP_SIZE - 1

extent 1:
  bitmap page
  data page BITMAP_SIZE
  data page BITMAP_SIZE + 1
  ...
```

因此逻辑页 `0` 不是物理页 `0`。物理页 `0` 被磁盘元信息占了，逻辑页 `0` 通常会映射到第一个 extent 的第一个数据页。

映射关系可以这样推导：

```text
extent_id = logical_page_id / BITMAP_SIZE
page_offset = logical_page_id % BITMAP_SIZE
bitmap_physical_page_id = 1 + extent_id * (BITMAP_SIZE + 1)
data_physical_page_id = bitmap_physical_page_id + 1 + page_offset
```

等价写法：

```text
physical_page_id = logical_page_id + 2 + extent_id
```

这里的 `+2` 来自：

1. 跳过物理页 0 的 `DiskFileMetaPage`。
2. 跳过当前 extent 开头的 bitmap page。

多出来的 `extent_id` 是因为每个历史 extent 都额外插入了一个 bitmap page。

#### 2.3 什么是 Buffer Pool

磁盘慢，内存快。数据库不可能每次查询都直接读磁盘，所以会维护一个内存缓冲池。

在本项目中：

- `Page` 表示缓冲池里的一个页容器。
- `pages_` 是一组固定数量的 `Page`。
- 每个 `Page` 所在的位置叫 frame，编号是 `frame_id`。
- 一个 frame 今天可以装逻辑页 1，明天被淘汰后也可以装逻辑页 100。

`Page` 里最重要的元信息：

```cpp
page_id_t page_id_;
int pin_count_;
bool is_dirty_;
```

含义：

- `page_id_`：这个 frame 当前装的是哪个逻辑页。
- `pin_count_`：有多少使用者正在使用这个页。
- `is_dirty_`：内存中的内容是否比磁盘新。

只要 `pin_count_ > 0`，这个页就不能被淘汰。因为还有人正在用它。

#### 2.4 什么是 Dirty Page

如果把页从磁盘读进内存后只是看了一眼，它不是脏页。

如果改了它的内容，例如写入记录、修改索引、更新元信息，它就是脏页。脏页被淘汰前必须写回磁盘，否则修改会丢。

这就是 `FlushPage` 和淘汰时写回的意义。

#### 2.5 什么是 LRU

LRU 是 Least Recently Used，最近最少使用。

它的直觉是：如果一个页很久没被访问，那么未来短期内也可能不太会被访问，可以优先淘汰。

注意本实验中的 `LRUReplacer` 只管理“可以被淘汰”的 frame，也就是 `pin_count_ == 0` 的 frame。正在使用的页不应该出现在 replacer 里。

### 3. 小实验 1.2：BitmapPage

#### 3.1 要实现什么

`BitmapPage` 用一个页中的字节数组记录一段连续数据页的分配状态。

相关文件：

- `src/include/page/bitmap_page.h`
- `src/page/bitmap_page.cpp`

需要实现：

```cpp
bool AllocatePage(uint32_t &page_offset);
bool DeAllocatePage(uint32_t page_offset);
bool IsPageFree(uint32_t page_offset) const;
bool IsPageFreeLow(uint32_t byte_index, uint8_t bit_index) const;
```

内部成员：

```cpp
uint32_t page_allocated_;
uint32_t next_free_page_;
unsigned char bytes[MAX_CHARS];
```

含义：

- `page_allocated_`：当前位图页管理的区间里，已经分配了多少页。
- `next_free_page_`：下一个可能空闲的位置，用来减少扫描成本。
- `bytes`：真正的位图内容。

一个 bit 对应一个数据页：

- bit = 0：空闲。
- bit = 1：已分配。

#### 3.2 容量怎么算

`BitmapPage` 自己也占一个页，里面前 8 字节给了两个 `uint32_t`，剩余部分才是位图数组。

```cpp
static constexpr size_t MAX_CHARS = PageSize - 2 * sizeof(uint32_t);
static constexpr size_t GetMaxSupportedSize() { return 8 * MAX_CHARS; }
```

如果 `PageSize = 4096`，则：

```text
MAX_CHARS = 4096 - 8 = 4088
可管理页数 = 4088 * 8 = 32704
```

#### 3.3 位运算怎么写

给定 `page_offset`：

```text
byte_index = page_offset / 8
bit_index = page_offset % 8
mask = 1 << bit_index
```

判断是否空闲：

```text
(bytes[byte_index] & mask) == 0
```

设置为已分配：

```text
bytes[byte_index] |= mask
```

清空为未分配：

```text
bytes[byte_index] &= ~mask
```

#### 3.4 实现指导

`IsPageFreeLow(byte_index, bit_index)`：

1. 构造 mask。
2. 检查对应 bit 是否为 0。

`IsPageFree(page_offset)`：

1. 检查 `page_offset` 是否越界。
2. 转成 `byte_index` 和 `bit_index`。
3. 调用 `IsPageFreeLow`。

`AllocatePage(page_offset)`：

1. 如果 `page_allocated_ >= GetMaxSupportedSize()`，返回 `false`。
2. 从 `next_free_page_` 开始扫描，找到第一个空闲 bit。
3. 把这个 bit 设置成 1。
4. `page_allocated_++`。
5. 把找到的位置写入输出参数 `page_offset`。
6. 更新 `next_free_page_` 到下一个空闲位置。如果后面没有空闲页，可以设置为最大容量。
7. 返回 `true`。

`DeAllocatePage(page_offset)`：

1. 如果越界，返回 `false`。
2. 如果本来就是空闲页，返回 `false`。
3. 把对应 bit 清 0。
4. `page_allocated_--`。
5. 如果 `page_offset < next_free_page_`，更新 `next_free_page_ = page_offset`。
6. 返回 `true`。

#### 3.5 测试怎么理解

测试文件：`test/storage/disk_manager_test.cpp`

`BitMapPageTest` 会检查：

1. 初始状态所有页都空闲。
2. 连续分配时，每次返回的 offset 不重复。
3. 分配满后，再分配返回 `false`。
4. 释放第 233 页后，下一次分配必须返回 233。
5. 同一个页释放两次，第二次必须返回 `false`。

如果第 4 点失败，通常是 `next_free_page_` 没维护好。

### 4. 小实验 1.3：DiskManager

#### 4.1 要实现什么

`DiskManager` 负责在数据库文件里分配、回收、判断和映射逻辑页。

相关文件：

- `src/include/storage/disk_manager.h`
- `src/storage/disk_manager.cpp`
- `src/include/page/disk_file_meta_page.h`

需要实现：

```cpp
page_id_t AllocatePage();
void DeAllocatePage(page_id_t logical_page_id);
bool IsPageFree(page_id_t logical_page_id);
page_id_t MapPageId(page_id_t logical_page_id);
```

#### 4.2 DiskFileMetaPage 管什么

磁盘文件的物理页 0 是元信息页：

```cpp
uint32_t num_allocated_pages_;
uint32_t num_extents_;
uint32_t extent_used_page_[0];
```

含义：

- `num_allocated_pages_`：全文件已经分配的数据页总数。
- `num_extents_`：当前有多少个 extent。
- `extent_used_page_[i]`：第 `i` 个 extent 中已经分配了多少数据页。

注意：`extent_used_page_[0]` 是 C/C++ 中常见的柔性数组写法。对象本身在 `meta_data_` 这块 4096 字节内，数组会继续使用后面的空间。

#### 4.3 AllocatePage 实现指导

目标：返回一个新的逻辑页号。

推荐步骤：

1. 把 `meta_data_` 解释成 `DiskFileMetaPage *`。
2. 从第 0 个 extent 开始找，找到 `extent_used_page_[i] < BITMAP_SIZE` 的 extent。
3. 如果没有可用 extent，就创建一个新的 extent：
   - `extent_id = num_extents_`
   - `num_extents_++`
   - 新 extent 的 bitmap 页初始全 0。
4. 计算该 extent 对应的 bitmap 物理页号：

```text
bitmap_physical_page_id = 1 + extent_id * (BITMAP_SIZE + 1)
```

5. 读出 bitmap page。
6. 调用 `bitmap->AllocatePage(page_offset)`。
7. 更新元信息：

```text
num_allocated_pages_++
extent_used_page_[extent_id]++
```

8. 写回 bitmap page。
9. 返回逻辑页号：

```text
logical_page_id = extent_id * BITMAP_SIZE + page_offset
```

#### 4.4 DeAllocatePage 实现指导

目标：释放一个逻辑页。

步骤：

1. 根据逻辑页号计算：

```text
extent_id = logical_page_id / BITMAP_SIZE
page_offset = logical_page_id % BITMAP_SIZE
```

2. 找到对应 bitmap 物理页。
3. 读 bitmap page。
4. 调用 `bitmap->DeAllocatePage(page_offset)`。
5. 如果释放成功：
   - `num_allocated_pages_--`
   - `extent_used_page_[extent_id]--`
   - 写回 bitmap page。

#### 4.5 IsPageFree 实现指导

步骤：

1. 计算 `extent_id` 和 `page_offset`。
2. 如果 `extent_id >= num_extents_`，说明对应 extent 还不存在，可以视为 free。
3. 读对应 bitmap page。
4. 调用 `bitmap->IsPageFree(page_offset)`。

#### 4.6 MapPageId 实现指导

这是最容易 off-by-one 的函数。

推导公式：

```text
extent_id = logical_page_id / BITMAP_SIZE
page_offset = logical_page_id % BITMAP_SIZE
bitmap_physical_page_id = 1 + extent_id * (BITMAP_SIZE + 1)
physical_page_id = bitmap_physical_page_id + 1 + page_offset
```

简化：

```text
physical_page_id = logical_page_id + 2 + extent_id
```

例子：

```text
logical 0 -> physical 2
logical 1 -> physical 3
logical BITMAP_SIZE - 1 -> physical BITMAP_SIZE + 1
logical BITMAP_SIZE -> physical BITMAP_SIZE + 3
```

#### 4.7 测试怎么理解

`FreePageAllocationTest` 会连续分配两个 extent 的所有页，并期望：

```cpp
EXPECT_EQ(i, page_id);
EXPECT_EQ(i / BITMAP_SIZE + 1, meta_page->GetExtentNums());
EXPECT_EQ(i + 1, meta_page->GetAllocatedPages());
EXPECT_EQ(i % BITMAP_SIZE + 1, meta_page->GetExtentUsedPage(...));
```

也就是说，分配逻辑页必须从 0 开始连续增长，不能跳号。

释放这些页：

```cpp
0
BITMAP_SIZE - 1
BITMAP_SIZE
BITMAP_SIZE + 1
BITMAP_SIZE + 2
```

测试会检查总分配数和每个 extent 的使用数是否正确下降。

### 5. 小实验 1.4：LRUReplacer

#### 5.1 要实现什么

`LRUReplacer` 只负责一件事：在所有“可以被淘汰”的 frame 里，选出最近最少使用的 frame。

相关文件：

- `src/include/buffer/lru_replacer.h`
- `src/buffer/lru_replacer.cpp`
- `src/include/buffer/replacer.h`

需要实现：

```cpp
bool Victim(frame_id_t *frame_id);
void Pin(frame_id_t frame_id);
void Unpin(frame_id_t frame_id);
size_t Size();
```

#### 5.2 Pin 和 Unpin 的含义

名字容易误解。这里的 `Pin(frame_id)` 不是增加 `Page::pin_count_`，而是告诉 replacer：

```text
这个 frame 正在被使用，不能被淘汰，请从 LRU 候选集合中移除。
```

`Unpin(frame_id)` 的意思是：

```text
这个 frame 已经没人使用，可以成为淘汰候选。
```

所以：

- `Pin`：从 LRU 集合移除。
- `Unpin`：加入 LRU 集合。
- `Victim`：从 LRU 集合取出最老的 frame。

#### 5.3 推荐数据结构

可以在 `lru_replacer.h` 里添加私有成员：

```cpp
std::list<frame_id_t> lru_list_;
std::unordered_map<frame_id_t, std::list<frame_id_t>::iterator> lru_map_;
std::mutex latch_;
size_t capacity_;
```

其中：

- `lru_list_` 前端是最久未使用，后端是最近加入。
- `lru_map_` 用于 O(1) 判断某个 frame 是否已经在 list 里，并快速删除。

也可以用 `unordered_set` 搭配 `list`，但删除 list 中间元素时没有 iterator 会变慢。

#### 5.4 实现指导

`Unpin(frame_id)`：

1. 如果 frame 已经在 `lru_map_` 中，直接返回，不能重复插入。
2. 否则把 frame 插入 `lru_list_` 尾部。
3. 在 map 中记录 iterator。

注意：测试里有：

```cpp
lru_replacer.Unpin(1);
...
lru_replacer.Unpin(1);
EXPECT_EQ(6, lru_replacer.Size());
```

重复 `Unpin(1)` 不应该让 size 变 7，也不应该刷新它的位置。否则后面第一个 victim 就不是 1 了。

`Pin(frame_id)`：

1. 如果 frame 不在 LRU 集合中，什么都不做。
2. 如果在，就从 list 和 map 中删除。

`Victim(frame_id)`：

1. 如果 LRU 集合为空，返回 `false`。
2. 取 `lru_list_.front()`。
3. 删除它。
4. 写入输出参数。
5. 返回 `true`。

`Size()`：

返回当前可淘汰 frame 数量。

#### 5.5 测试怎么理解

`lru_replacer_test.cpp` 的核心顺序是：

```text
Unpin: 1,2,3,4,5,6
Victim -> 1
Victim -> 2
Victim -> 3
Pin(4)
Unpin(4)
Victim -> 5
Victim -> 6
Victim -> 4
```

这个测试说明：

- 被 victim 的 frame 会离开 LRU。
- `Pin(4)` 会让 4 不能被淘汰。
- 之后再 `Unpin(4)`，它作为最新加入的候选，排在 5 和 6 后面。

### 6. 小实验 1.5：BufferPoolManager

#### 6.1 要实现什么

`BufferPoolManager` 是实验一的核心，把前面三个模块串起来。

相关文件：

- `src/include/buffer/buffer_pool_manager.h`
- `src/buffer/buffer_pool_manager.cpp`
- `src/include/page/page.h`

需要实现：

```cpp
Page *FetchPage(page_id_t page_id);
Page *NewPage(page_id_t &page_id);
bool DeletePage(page_id_t page_id);
bool UnpinPage(page_id_t page_id, bool is_dirty);
bool FlushPage(page_id_t page_id);
frame_id_t TryToFindFreePage();
```

类中的核心状态：

```cpp
size_t pool_size_;
Page *pages_;
DiskManager *disk_manager_;
unordered_map<page_id_t, frame_id_t> page_table_;
Replacer *replacer_;
list<frame_id_t> free_list_;
recursive_mutex latch_;
```

含义：

- `pages_`：真正的内存页帧数组。
- `page_table_`：逻辑页号到 frame 号的映射。
- `free_list_`：从未使用或已重置的空 frame。
- `replacer_`：已经使用过、当前 unpinned、可以被淘汰的 frame。

#### 6.2 找一个可用 frame

很多函数都要先找 frame，推荐写好 `TryToFindFreePage()`。

顺序必须是：

1. 优先从 `free_list_` 取。
2. 如果 free list 空了，再从 `replacer_` 取 victim。
3. 如果两者都没有，说明所有页都被 pin，返回 `INVALID_FRAME_ID`。

如果取到的是 victim frame，还要注意：

1. 如果旧页是 dirty，先写回磁盘。
2. 从 `page_table_` 删除旧页号。
3. 再复用这个 frame。

#### 6.3 FetchPage 实现指导

目标：获取某个已经存在的逻辑页。

步骤：

1. 加锁。
2. 查 `page_table_`。
3. 如果页已经在内存：
   - 找到 frame。
   - `pin_count_++`。
   - 调用 `replacer_->Pin(frame)`，确保它不能被淘汰。
   - 返回 `&pages_[frame]`。
4. 如果页不在内存：
   - 找可用 frame。
   - 如果找不到，返回 `nullptr`。
   - 如果 frame 原来装着 dirty 页，写回磁盘。
   - 删除旧映射。
   - 从磁盘读取目标逻辑页内容到 `pages_[frame].data_`。
   - 设置元信息：

```text
page_id_ = page_id
pin_count_ = 1
is_dirty_ = false
```

   - 写入 `page_table_`。
   - 返回页指针。

#### 6.4 NewPage 实现指导

目标：创建一个新的逻辑页，并放入缓冲池。

测试里有一个非常重要的陷阱：

```cpp
for (size_t i = buffer_pool_size; i < buffer_pool_size * 2; ++i) {
  EXPECT_EQ(nullptr, bpm->NewPage(page_id_temp));
}
```

此时所有页都被 pin，`NewPage` 应该失败，而且不能悄悄消耗磁盘页号。否则后面测试期望新页号是 10、11、12、13、14 时，你可能已经分配到了 20。

稳妥步骤：

1. 先找可用 frame。
2. 如果没有可用 frame，直接返回 `nullptr`，不要分配新逻辑页。
3. 找到 frame 后，再调用 `AllocatePage()` 得到新的逻辑页号。
4. 如果旧 frame 是 dirty，写回旧页。
5. 删除旧映射。
6. 清空 frame 的内存。
7. 设置：

```text
page_id_ = new_page_id
pin_count_ = 1
is_dirty_ = false
```

8. 插入 `page_table_`。
9. 输出参数 `page_id = new_page_id`。
10. 返回页指针。

#### 6.5 UnpinPage 实现指导

目标：告诉缓冲池，这个页当前少了一个使用者。

步骤：

1. 如果页不在 `page_table_`，返回 `false`。
2. 如果 `pin_count_ <= 0`，返回 `false`。
3. 如果 `is_dirty == true`，把页的 `is_dirty_` 标记为 true。
4. `pin_count_--`。
5. 如果 `pin_count_ == 0`，调用 `replacer_->Unpin(frame)`。
6. 返回 `true`。

注意 dirty 标记应该是累积的。也就是说：

```text
page.is_dirty_ = page.is_dirty_ || is_dirty
```

不能因为某次 `UnpinPage(page_id, false)` 就把之前的脏标记清掉。

#### 6.6 FlushPage 实现指导

目标：把内存页写回磁盘。

步骤：

1. 如果页不在内存，通常返回 `false`。
2. 如果在内存，调用 `disk_manager_->WritePage(page_id, page.GetData())`。
3. 设置 `is_dirty_ = false`。
4. 返回 `true`。

测试中会先写入二进制数据，再 `UnpinPage(i, true)`，随后 `FlushPage(i)`，最后重新 `FetchPage(0)` 验证数据还在。

#### 6.7 DeletePage 实现指导

目标：删除一个逻辑页。

步骤：

1. 如果页在内存且 `pin_count_ > 0`，返回 `false`。正在使用的页不能删。
2. 如果页在内存且 `pin_count_ == 0`：
   - 从 replacer 中移除，可以调用 `replacer_->Pin(frame)`。
   - 从 `page_table_` 删除映射。
   - 重置 frame 的元信息。
   - 清空内存。
   - 把 frame 放回 `free_list_`。
3. 调用 `DeallocatePage(page_id)` 回收磁盘页。
4. 返回 `true`。

如果页不在缓冲池中，也可以直接回收磁盘页并返回 `true`。

#### 6.8 Buffer Pool 测试怎么理解

`buffer_pool_manager_test.cpp` 主要检查以下行为：

1. 空缓冲池可以创建新页，第一页逻辑页号为 0。
2. 页内容可以保存任意二进制数据，包括 `'\0'`，所以比较时必须用 `memcmp`，不能当 C 字符串处理。
3. 缓冲池大小是 10，连续 `NewPage` 10 次后所有页都被 pin。
4. 所有页都 pinned 时，继续 `NewPage` 必须返回 `nullptr`。
5. `UnpinPage(0..4, true)` 后，这些页可以被替换。
6. 创建新页时，页号应该继续是 10、11、12、13、14。
7. 再次 `FetchPage(0)` 时，之前写入并刷盘的数据必须还能读回来。

### 7. 推荐完成顺序

不要一口气写完整个实验一。推荐顺序：

1. 完成 `BitmapPage`。
2. 运行 `disk_manager_test`，先只关注 `BitMapPageTest`。
3. 完成 `DiskManager`。
4. 运行完整 `disk_manager_test`。
5. 完成 `LRUReplacer`。
6. 运行 `lru_replacer_test`。
7. 完成 `BufferPoolManager`。
8. 运行 `buffer_pool_manager_test`。
9. 最后运行总测试，确认没有连带问题。

构建命令建议在 Linux、macOS 或 WSL 中执行：

```bash
mkdir build
cd build
cmake ..
make disk_manager_test -j
./test/disk_manager_test
make lru_replacer_test -j
./test/lru_replacer_test
make buffer_pool_manager_test -j
./test/buffer_pool_manager_test
```

如果已经 `cmake ..` 过，后面只改 `.cpp/.h`，通常不需要重新 cmake，直接 `make xxx -j` 即可。

### 8. 常见错误清单

1. `BitmapPage::AllocatePage` 分配满后没有返回 `false`。
2. `BitmapPage::DeAllocatePage` 对已经空闲的页仍然返回 `true`。
3. 忘记维护 `next_free_page_`，导致释放 233 后下一次不是分配 233。
4. `DiskManager::MapPageId` 把逻辑页 0 映射成物理页 0 或 1。
5. 新建 extent 后没有更新 `num_extents_`。
6. 分配或释放页后没有更新 `num_allocated_pages_` 和 `extent_used_page_`。
7. `LRUReplacer::Unpin` 重复插入同一个 frame。
8. `LRUReplacer::Pin` 没有从候选集合删除 frame。
9. `BufferPoolManager::NewPage` 在没有可用 frame 时仍然消耗了磁盘页号。
10. 淘汰 dirty page 前忘记写回磁盘。
11. `UnpinPage(page_id, false)` 错误地把已有 dirty 标记清掉。
12. 页被 `FetchPage` 命中后忘记增加 `pin_count_`。
13. `pin_count_` 变成 0 后忘记加入 replacer。
14. 删除页时忘记把 frame 放回 `free_list_`。

### 9. 验收问答准备

问题：为什么要区分逻辑页号和物理页号？

回答要点：上层模块只关心数据页编号，但文件中还混有元数据页和位图页。为了隐藏文件布局细节，需要通过 `MapPageId` 把逻辑页号转换成真实文件偏移对应的物理页号。

问题：BitmapPage 为什么能管理很多页？

回答要点：一个 bit 就能表示一个页是否被分配。4KB 页去掉两个 `uint32_t` 后还有 4088 字节，能提供 32704 个 bit，也就是管理 32704 个数据页。

问题：Buffer Pool 中 pin count 的作用是什么？

回答要点：pin count 表示当前有多少使用者正在使用这个页。只要 pin count 大于 0，这个页就不能被替换或删除。

问题：dirty page 什么时候写回？

回答要点：显式 `FlushPage` 时写回；被替换淘汰前也必须写回。否则内存修改会丢失。

问题：LRUReplacer 里放的是 page id 还是 frame id？

回答要点：放的是 frame id。Replacer 管理的是缓冲池中的页帧，而不是磁盘上的逻辑页。

问题：为什么 `NewPage` 失败时不能先分配磁盘页号？

回答要点：如果缓冲池没有可用 frame，新页无法放入内存。此时提前分配会造成页号泄漏，测试后续期望连续页号也会失败。

## 实验二：Record Manager

### 1. 实验目标

实验二要实现 MiniSQL 中“记录如何存储、读取、删除、遍历”的能力。实验一解决的是“页从哪里来、如何读写页”，实验二则开始真正把数据库中的一行行记录放进这些页里。

这一节分为两大部分：

1. 记录与模式的序列化：
   - `Column`
   - `Schema`
   - `Row`
   - `Field` 已经基本实现好，可以作为参考。
2. 堆表管理：
   - `TablePage`
   - `TableHeap`
   - `TableIterator`

对应文件：

- `src/include/record/field.h`
- `src/record/types.cpp`
- `src/include/record/column.h`
- `src/record/column.cpp`
- `src/include/record/schema.h`
- `src/record/schema.cpp`
- `src/include/record/row.h`
- `src/record/row.cpp`
- `src/include/page/table_page.h`
- `src/page/table_page.cpp`
- `src/include/storage/table_heap.h`
- `src/storage/table_heap.cpp`
- `src/include/storage/table_iterator.h`
- `src/storage/table_iterator.cpp`
- `src/include/common/rowid.h`

对应测试：

- `test/record/tuple_test.cpp`
- `test/storage/table_heap_test.cpp`

### 2. 相关数据库知识

#### 2.1 记录、字段、模式分别是什么

数据库表可以这样看：

```text
表 = 很多行 Row
行 = 很多字段 Field
表结构 = Schema
列定义 = Column
```

例如：

```sql
create table account (
  id int,
  name char(64),
  balance float
);
```

在代码中：

- `Column("id", kTypeInt, 0, false, false)` 表示第 0 列，名字是 `id`，类型是整数。
- `Schema` 是一组 `Column *`。
- `Row` 是一组 `Field *`。
- `Field` 是某个具体值，比如 `188`、`"minisql"`、`19.99f`。

所以 `Schema` 负责解释一行数据：第几个字段是什么类型、能不能是空、最大长度是多少。

#### 2.2 为什么要序列化

内存里的 C++ 对象不能直接写入磁盘。比如 `std::string` 内部有指针，`std::vector` 也有指针和容量信息。如果把对象的内存直接 `memcpy` 到磁盘，重启后这些指针都失效。

因此数据库要把对象转换成连续字节流：

```text
内存对象 -> SerializeTo -> char buffer -> 写入页
char buffer -> DeserializeFrom -> 内存对象
```

这就是序列化和反序列化。

在 MiniSQL 中：

- `Field` 序列化的是具体值。
- `Row` 序列化的是一整行。
- `Column` 序列化的是列定义。
- `Schema` 序列化的是一张表或索引的结构。

#### 2.3 定长字段和变长字段

本项目支持三种类型：

- `integer`
- `float`
- `char(n)`

`int` 和 `float` 是定长字段：

```text
int   -> 4 bytes
float -> 4 bytes
```

`char(n)` 在这里按变长字符串存储。`Field` 的实现中，`TypeChar::SerializeTo` 会先写字符串实际长度，再写字符串内容：

```text
char field = [length: uint32_t][content bytes]
```

注意：字符串内容可能包含 `'\0'`，不能依赖 C 字符串结束符。测试里已经出现了这种情况。

#### 2.4 Null 值和 Null Bitmap

数据库里字段可以是 `NULL`。如果某个字段是 `NULL`，它不需要保存具体值，只需要记录“这个字段为空”。

`Field` 已经支持空值：

```cpp
Field(TypeId::kTypeInt)
Field(TypeId::kTypeFloat)
Field(TypeId::kTypeChar)
```

这些构造出来的字段 `IsNull()` 为 true。

`Row` 序列化时，推荐使用 null bitmap：

```text
[field_count][null bitmap][field payloads...]
```

其中 null bitmap 的每一位表示一个字段是否为 NULL：

```text
bit = 1 -> NULL
bit = 0 -> not NULL
```

如果一行有 3 个字段，那么 null bitmap 至少需要 1 字节。如果一行有 10 个字段，那么需要 2 字节。

计算方法：

```text
bitmap_size = (field_count + 7) / 8
```

#### 2.5 RowId 是什么

每条记录都有一个唯一位置标识 `RowId`。

代码位置：

- `src/include/common/rowid.h`

`RowId` 内部由两部分组成：

```text
| page_id: 32 bits | slot_num: 32 bits |
```

含义：

- `page_id`：记录在哪个 `TablePage` 中。
- `slot_num`：记录是这个页里的第几个槽位。

所以如果你有一个 `RowId`，就可以直接定位记录：

1. 通过 `page_id` 找到表页。
2. 通过 `slot_num` 找到页内槽位。
3. 根据槽位中的 offset 和 size 找到实际数据。

这也是后面索引为什么只需要保存 `key -> RowId` 的原因：索引找到 key 对应的 RowId，堆表就能拿到完整记录。

#### 2.6 什么是堆表

堆表 `TableHeap` 是一种最简单的表组织方式：

- 记录无序存放。
- 插入时找一个能放下记录的页。
- 页不够就新建页。
- 多个 `TablePage` 通过链表连接。

它不保证记录按照主键、插入时间或任何字段排序。它只是“把记录塞进去，并能通过 RowId 找回来”。

#### 2.7 什么是 Slotted Page

`TablePage` 使用的是槽页结构，也叫 slotted page。

一个页内大致长这样：

```text
| page header | slot 0 | slot 1 | slot 2 | free space | tuple data |
```

头部和槽数组从前往后增长，真实记录数据从后往前增长：

```text
低地址                                                     高地址
| header | slots ---->       free space       <---- tuples |
```

每个 slot 保存两件事：

```text
tuple_offset
tuple_size
```

好处是：

1. 记录可以变长。
2. 页内记录移动后，只需要更新 slot 中的 offset。
3. `RowId` 中的 `slot_num` 可以稳定定位记录。

### 3. 小实验 2.2：Column / Schema / Row 序列化

#### 3.1 Field 已经给你什么

`Field` 的序列化已经由 `Type` 子类实现。

关键接口：

```cpp
field.SerializeTo(buf);
Field::DeserializeFrom(buf, type_id, &field, is_null);
field.GetSerializedSize();
```

不同类型行为：

- `int`：写 4 字节。
- `float`：写 4 字节。
- `char`：写 4 字节长度，再写内容。
- `NULL`：不写具体值，序列化长度为 0。

所以实现 `Row` 时，你不需要自己判断 int/float/char 的具体编码，只要调用 `Field` 的接口。

#### 3.2 Column 推荐序列化格式

`Column` 保存的是列定义：

```cpp
std::string name_;
TypeId type_;
uint32_t len_;
uint32_t table_ind_;
bool nullable_;
bool unique_;
```

推荐格式：

```text
[magic: uint32_t]
[name_len: uint32_t]
[name bytes]
[type: uint32_t]
[len: uint32_t]
[table_ind: uint32_t]
[nullable: uint32_t]
[unique: uint32_t]
```

这里建议把 `bool` 也用 `uint32_t` 存，原因是磁盘格式最好固定，不要依赖 C++ 中 `bool` 的大小和对象布局。

`GetSerializedSize()`：

```text
4 + 4 + name.length() + 4 + 4 + 4 + 4 + 4
= 28 + name.length()
```

`SerializeTo(buf)`：

1. 写 `COLUMN_MAGIC_NUM`。
2. 写名字长度。
3. 写名字内容。
4. 写类型。
5. 写长度。
6. 写列下标。
7. 写 nullable。
8. 写 unique。
9. 返回写入字节数。

`DeserializeFrom(buf, column)`：

1. 读 magic 并检查。
2. 读名字长度和名字。
3. 读 type、len、index、nullable、unique。
4. 根据 type 创建 Column：
   - 如果是 `kTypeChar`，使用带 length 的构造函数。
   - 如果是 `kTypeInt` 或 `kTypeFloat`，使用非 char 构造函数。
5. 返回读过的字节数。

#### 3.3 Schema 推荐序列化格式

`Schema` 是一组 `Column *`。

推荐格式：

```text
[magic: uint32_t]
[column_count: uint32_t]
[column 0]
[column 1]
...
```

`GetSerializedSize()`：

```text
8 + sum(column.GetSerializedSize())
```

`SerializeTo(buf)`：

1. 写 `SCHEMA_MAGIC_NUM`。
2. 写列数量。
3. 依次调用每个 `Column::SerializeTo`。
4. 返回总字节数。

`DeserializeFrom(buf, schema)`：

1. 读 magic 并检查。
2. 读列数量。
3. 循环调用 `Column::DeserializeFrom`。
4. 把得到的 `Column *` 放入 vector。
5. 创建 `new Schema(columns, true)`。
6. 返回总字节数。

内存管理重点：这里反序列化出来的列对象是新建的，所以 `Schema` 应该管理它们，也就是 `is_manage_ = true`。

#### 3.4 Row 推荐序列化格式

`Row` 是一组字段值，必须结合 `Schema` 才能解释。

推荐格式：

```text
[field_count: uint32_t]
[null bitmap]
[non-null field payloads...]
```

例子：

```text
schema: id int, name char, account float
row:    188, "minisql", 19.99

serialized:
[3]
[00000000]
[int payload][char payload][float payload]
```

如果第二列为 NULL：

```text
row: 188, NULL, 19.99

null bitmap:
bit 1 = 1

payload:
[int payload][float payload]
```

NULL 字段不占 payload 空间。

`GetSerializedSize(schema)`：

1. header 大小：`sizeof(uint32_t)`。
2. null bitmap 大小：`(field_count + 7) / 8`。
3. 对每个非空字段，加上 `field->GetSerializedSize()`。

`SerializeTo(buf, schema)`：

1. 检查 `schema->GetColumnCount() == fields_.size()`。
2. 写字段数量。
3. 清空 null bitmap 区域。
4. 遍历字段：
   - 如果字段是 NULL，设置 bitmap 对应 bit。
   - 如果不是 NULL，在 payload 区域调用 `field->SerializeTo`。
5. 返回写入字节数。

`DeserializeFrom(buf, schema)`：

1. 读字段数量，并检查等于 schema 列数。
2. 定位 null bitmap。
3. 对每一列：
   - 从 schema 中取类型。
   - 判断这一列是否 NULL。
   - 调用 `Field::DeserializeFrom(payload_ptr, type, &field, is_null)`。
   - 把返回的字节数加到 payload offset。
   - 把 `field` 放入 `fields_`。
4. 返回读过的总字节数。

注意：`Row::DeserializeFrom` 里创建的 `Field *` 会被 `Row` 析构函数释放，不要手动提前 delete。

#### 3.5 测试怎么理解

`tuple_test.cpp` 有两个测试。

`FieldSerializeDeserializeTest`：

- 这个测试验证 `Field` 自己已经能正常序列化。
- 你通常不用改 `Field`。
- 它也提醒你：char 不能按 C 字符串处理，因为测试里有 `"\0"`。

`RowTest`：

流程：

1. 创建 schema：`id int, name char(64), account float`。
2. 创建 row：`188, "minisql", 19.99f`。
3. 把 row 插入一个 `TablePage`。
4. 通过 rid 读出 row2。
5. 比较 row2 的每个字段和原字段是否相等。
6. 测试逻辑删除和物理删除。

因此这个测试主要依赖：

- `Row::SerializeTo`
- `Row::DeserializeFrom`
- `Row::GetSerializedSize`

如果 Row 序列化不对，`TablePage::GetTuple` 读出的字段就会错。

### 4. 小实验 2.3：TablePage

#### 4.1 当前代码状态

`TablePage` 的大部分实现已经在 `src/page/table_page.cpp` 中给出，包括：

- `Init`
- `InsertTuple`
- `MarkDelete`
- `UpdateTuple`
- `ApplyDelete`
- `RollbackDelete`
- `GetTuple`
- `GetFirstTupleRid`
- `GetNextTupleRid`

这意味着你需要重点读懂它，而不是重写它。

#### 4.2 TablePage 页内布局

头部字段：

```text
PageId
LSN
PrevPageId
NextPageId
FreeSpacePointer
TupleCount
Slot array...
```

每个 slot 由 8 字节组成：

```text
TupleOffset: 4 bytes
TupleSize:   4 bytes
```

`FreeSpacePointer` 初始为 `PAGE_SIZE`，插入记录后向低地址移动。

#### 4.3 InsertTuple 做了什么

插入一条记录时：

1. 调用 `row.GetSerializedSize(schema)` 得到记录字节数。
2. 检查剩余空间是否足够容纳：
   - 记录本体。
   - 一个 slot。
3. 优先复用空 slot，即 `TupleSize == 0` 的槽。
4. 移动 `FreeSpacePointer`。
5. 调用 `row.SerializeTo` 把记录写到页尾区域。
6. 设置 slot 的 offset 和 size。
7. 给 row 设置 `RowId(page_id, slot_num)`。
8. 如果用了新 slot，`TupleCount++`。

#### 4.4 MarkDelete 和 ApplyDelete 的区别

删除分两步：

1. `MarkDelete`：逻辑删除，只是在 tuple size 的最高位打 delete mask。
2. `ApplyDelete`：物理删除，真正移动页内数据，释放空间，把 slot 清空。

为什么要分两步？因为真实数据库里删除可能和事务有关。事务还没提交时，不能马上把数据物理抹掉；否则回滚时很难恢复。

本实验事务暂时不完整，但保留了这个设计。

#### 4.5 GetFirstTupleRid 和 GetNextTupleRid

这两个函数是迭代器的基础：

- `GetFirstTupleRid`：找当前页第一条未删除记录。
- `GetNextTupleRid`：从当前 slot 后面继续找下一条未删除记录。

如果当前页没有下一条，`TableIterator` 要跳到链表中的下一个 `TablePage`。

### 5. 小实验 2.3：TableHeap

#### 5.1 TableHeap 是什么

`TableHeap` 管理一整张表的数据页链表。

它只保存第一个页：

```cpp
page_id_t first_page_id_;
```

每个 `TablePage` 内部保存：

```cpp
PrevPageId
NextPageId
```

所以整张表是一个双向链表。

#### 5.2 构造函数实现指导

当前 `TableHeap` 创建新表的构造函数里有：

```cpp
ASSERT(false, "Not implemented yet.");
```

你需要做的是：

1. 调用 `buffer_pool_manager_->NewPage(first_page_id_)` 创建第一页。
2. 把返回的 `Page *` 转成 `TablePage *`。
3. 调用：

```cpp
table_page->Init(first_page_id_, INVALID_PAGE_ID, log_manager_, txn);
```

4. 调用 `UnpinPage(first_page_id_, true)`。

这里 `true` 表示第一页头部已经被初始化，是脏页，需要未来写回。

#### 5.3 InsertTuple 实现指导

目标：把一行插入表中，并通过 `row.SetRowId` 返回它的位置。

步骤：

1. 如果行太大，直接返回 `false`。

```cpp
row.GetSerializedSize(schema_) > TablePage::SIZE_MAX_ROW
```

2. 从 `first_page_id_` 开始遍历表页。
3. 对每个页：
   - `FetchPage`
   - 转成 `TablePage *`
   - 加写锁 `WLatch`
   - 调用 `page->InsertTuple(row, schema_, txn, lock_manager_, log_manager_)`
4. 如果插入成功：
   - 解锁。
   - `UnpinPage(page_id, true)`。
   - 返回 `true`。
5. 如果当前页放不下：
   - 如果有 `NextPageId`，解锁并 unpin 当前页，继续下一页。
   - 如果没有下一页，创建新页。
6. 创建新页时：
   - `NewPage(new_page_id)`
   - `new_page->Init(new_page_id, old_page_id, ...)`
   - 当前页 `SetNextPageId(new_page_id)`
   - 当前页 dirty unpin。
   - 在新页插入 row。
   - 新页 dirty unpin。

注意：每次 `FetchPage` 后都必须 `UnpinPage`，否则实验一里的 pin count 会卡住，后续缓冲池可能无法替换页面。

#### 5.4 GetTuple 实现指导

目标：根据 row 中已有的 RowId 读出完整字段。

步骤：

1. 从 `row->GetRowId().GetPageId()` 得到页号。
2. `FetchPage(page_id)`。
3. 转成 `TablePage *`。
4. 可以加读锁 `RLatch`。
5. 调用：

```cpp
page->GetTuple(row, schema_, txn, lock_manager_)
```

6. 解锁。
7. `UnpinPage(page_id, false)`。
8. 返回结果。

测试 `table_heap_test.cpp` 会大量调用它验证插入的 10000 条记录是否都能读回。

#### 5.5 MarkDelete 实现提示

当前 `MarkDelete` 已经写了一部分，但有一个细节值得你检查：它调用了 `page->MarkDelete(...)`，但没有保存这个函数的返回值。

更稳妥的行为应该是：

1. 如果页不存在，返回 `false`。
2. 如果 slot 无效或记录已删除，返回 `false`。
3. 只有真正标记成功才返回 `true`。

这对后面的 `DeleteExecutor` 更友好。

#### 5.6 ApplyDelete 实现指导

目标：物理删除某个 RowId 对应的记录。

步骤：

1. `FetchPage(rid.GetPageId())`。
2. 转成 `TablePage *`。
3. 加写锁。
4. 调用 `page->ApplyDelete(rid, txn, log_manager_)`。
5. 解锁。
6. `UnpinPage(page_id, true)`。

#### 5.7 UpdateTuple 实现指导

目标：更新某个 RowId 对应的记录。

最基础版本：

1. 根据 rid 找到页面。
2. 构造 `Row old_row(rid)`。
3. 调用 `page->UpdateTuple(new_row, &old_row, schema_, txn, lock_manager_, log_manager_)`。
4. 如果成功，把 `new_row` 的 RowId 设置为原 rid。
5. unpin dirty page。

更完整版本需要处理“更新后记录变大，当前页放不下”的情况：

1. 先确认旧记录存在。
2. 如果 `TablePage::UpdateTuple` 失败是因为空间不足，可以：
   - 逻辑删除旧记录。
   - 物理删除旧记录。
   - 把新记录作为一条新 tuple 插入表中。
3. 此时新记录的 RowId 可能变化。

实验文档也提醒：当前 `TablePage::UpdateTuple` 只返回 bool，无法区分失败原因。因此实现时最好先 `GetTuple` 确认记录存在，再决定是否 fallback。

#### 5.8 Begin 和 End 实现指导

`Begin(txn)`：

1. 从 `first_page_id_` 开始。
2. 对每一页调用 `GetFirstTupleRid`。
3. 找到第一条未删除记录后，返回：

```cpp
TableIterator(this, first_rid, txn)
```

4. 如果所有页都没有记录，返回 `End()`。

`End()`：

可以用无效 RowId 表示：

```cpp
TableIterator(this, INVALID_ROWID, nullptr)
```

或者自己在 iterator 中维护 `is_end_` 标志。关键是比较操作要稳定。

### 6. 小实验 2.3：TableIterator

#### 6.1 迭代器为什么重要

后面的执行器 `SeqScanExecutor` 会依赖表迭代器来做全表扫描。

SQL：

```sql
select * from account;
```

底层就是：

```cpp
for (auto iter = table_heap->Begin(txn); iter != table_heap->End(); ++iter) {
  Row row = *iter;
}
```

所以 `TableIterator` 是 Record Manager 和 Executor 之间的重要桥梁。

#### 6.2 推荐成员变量

当前 `table_iterator.h` 允许你添加私有成员。

推荐：

```cpp
TableHeap *table_heap_;
Txn *txn_;
Row row_;
```

其中：

- `table_heap_`：知道自己属于哪张表。
- `txn_`：传给 GetTuple。
- `row_`：当前迭代器指向的记录。

如果 `row_.GetRowId() == INVALID_ROWID`，就表示 end。

#### 6.3 构造函数实现指导

```cpp
TableIterator(TableHeap *table_heap, RowId rid, Txn *txn)
```

步骤：

1. 保存 `table_heap_` 和 `txn_`。
2. 如果 `rid` 是无效 RowId，设置为空迭代器。
3. 否则构造 `Row row(rid)`。
4. 调用 `table_heap_->GetTuple(&row, txn_)` 把完整字段读出来。
5. 保存到 `row_`。

#### 6.4 operator* 和 operator->

`operator*()`：

```cpp
return row_;
```

`operator->()`：

```cpp
return &row_;
```

如果当前是 end，最好 assert，避免误用。

#### 6.5 operator== 和 operator!=

推荐比较：

```text
table_heap_ 是否相同
当前 RowId 是否相同
```

`operator!=` 可以直接取反。

#### 6.6 operator++ 实现指导

`++iter` 要移动到下一条有效记录。

步骤：

1. 如果当前已经是 end，直接返回自己。
2. 取当前 `RowId cur_rid`。
3. Fetch 当前页。
4. 调用 `GetNextTupleRid(cur_rid, &next_rid)`。
5. 如果当前页还有下一条：
   - unpin 当前页。
   - 用 `next_rid` 重新加载 `row_`。
   - 返回。
6. 如果当前页没有下一条：
   - 取当前页的 `NextPageId`。
   - unpin 当前页。
   - 沿链表向后找。
   - 对每个后续页调用 `GetFirstTupleRid`。
7. 如果找到，加载该 row。
8. 如果一直找不到，设置为 end。

`iter++` 是后置自增，语义是“返回移动前的副本，然后自己前进”：

```cpp
TableIterator old(*this);
++(*this);
return old;
```

### 7. 测试怎么理解

#### 7.1 tuple_test.cpp

这个测试的核心是：

1. `Field` 本身能序列化和反序列化。
2. `Row` 能通过 `TablePage` 写入，再通过 RowId 读出。
3. 读出的字段和原字段逐一相等。
4. 删除接口能工作。

如果这个测试失败：

- 优先检查 `Row::SerializeTo`。
- 然后检查 `Row::DeserializeFrom`。
- 再检查 `Row::GetSerializedSize` 是否和真正写入字节数一致。

`TablePage::InsertTuple` 中有断言：

```cpp
ASSERT(write_bytes == serialized_size, "Unexpected behavior in row serialize.");
```

所以 `GetSerializedSize` 和 `SerializeTo` 必须严格一致。

#### 7.2 table_heap_test.cpp

这个测试会：

1. 创建一个 `TableHeap`。
2. 随机生成 10000 条记录。
3. 每条记录插入后保存 `RowId -> Fields`。
4. 再根据每个 RowId 调用 `GetTuple`。
5. 比较读出的字段和原字段是否一致。

它主要验证：

- `TableHeap` 构造函数能创建第一页。
- `InsertTuple` 能跨页插入大量记录。
- 每条记录的 RowId 唯一。
- `GetTuple` 能通过 RowId 正确读回记录。

注意：这个测试没有直接测 iterator、update、delete 的所有边界，但后面的 executor 会依赖它们。

### 8. 推荐完成顺序

建议不要先碰 `TableHeap`。先把序列化写稳。

推荐顺序：

1. 完成 `Column::SerializeTo / DeserializeFrom / GetSerializedSize`。
2. 完成 `Schema::SerializeTo / DeserializeFrom / GetSerializedSize`。
3. 完成 `Row::SerializeTo / DeserializeFrom / GetSerializedSize`。
4. 运行 `tuple_test`。
5. 实现 `TableHeap` 创建第一页。
6. 实现 `TableHeap::InsertTuple`。
7. 实现 `TableHeap::GetTuple`。
8. 运行 `table_heap_test`。
9. 补全 `ApplyDelete / UpdateTuple / Begin / End / TableIterator`。
10. 回头为后续 executor 准备更多自测。

构建命令：

```bash
mkdir build
cd build
cmake ..
make tuple_test -j
./test/tuple_test
make table_heap_test -j
./test/table_heap_test
```

如果已经构建过，通常只需要：

```bash
make tuple_test -j
./test/tuple_test
make table_heap_test -j
./test/table_heap_test
```

### 9. 常见错误清单

1. `Column` 序列化时写了 `std::string` 对象本身，而不是字符串长度和内容。
2. `Schema::DeserializeFrom` 创建的 Column 没有交给 Schema 管理，导致内存泄漏。
3. `Row::GetSerializedSize` 和 `Row::SerializeTo` 返回值不一致。
4. NULL 字段仍然写入 payload，导致反序列化 offset 错位。
5. `char` 字段按 C 字符串处理，遇到 `'\0'` 截断。
6. `TableHeap` 构造函数创建第一页后忘记 `UnpinPage(first_page_id_, true)`。
7. `InsertTuple` 遍历页时，Fetch 后忘记 Unpin。
8. 当前页满了，新建页后忘记设置当前页的 `NextPageId`。
9. 新页 Init 时 `prev_id` 没设置为当前页号。
10. `GetTuple` 根据 RowId 取页后忘记 unpin。
11. `TableIterator::operator++` 只在当前页找下一条，忘记跳到下一页。
12. `iter++` 返回了移动后的迭代器，而不是移动前的副本。
13. 删除时只做 MarkDelete，忘记 ApplyDelete 才会真正释放页内空间。
14. 更新失败时不区分“记录不存在”和“空间不足”。

### 10. 验收问答准备

问题：为什么 Row 的序列化需要 Schema？

回答要点：Row 只保存字段值，字段类型和列数量来自 Schema。反序列化时必须知道第 i 个字段是什么类型，才能正确调用 `Field::DeserializeFrom`。

问题：为什么不能直接把 Column 或 Schema 对象 memcpy 到磁盘？

回答要点：它们包含 `std::string`、`std::vector`、指针等内存结构，直接写入磁盘后重启无法恢复。必须转成稳定的字节格式。

问题：为什么 Row 要有 null bitmap？

回答要点：NULL 字段没有实际 payload。如果不额外记录哪些字段为 NULL，反序列化时无法判断这个字段是空值还是一个长度为 0 的普通值。

问题：RowId 的作用是什么？

回答要点：RowId 把记录位置编码为 `page_id + slot_num`，可以直接定位到表页和页内槽位。后续索引只需要保存 `key -> RowId`，就能回表读取完整记录。

问题：TableHeap 和 TablePage 的关系是什么？

回答要点：TablePage 管理单个页内的记录布局；TableHeap 管理一张表的多个 TablePage，它通过页链表完成跨页插入、查找和遍历。

问题：为什么 Slotted Page 适合存变长记录？

回答要点：slot 保存 offset 和 size，真实记录可以放在页尾。记录移动或压缩时，只需要更新 slot，不需要改变 RowId 中的 slot_num。

问题：逻辑删除和物理删除有什么区别？

回答要点：逻辑删除只是打标记，方便事务回滚；物理删除才真正移动页内数据并释放空间。真实数据库通常不会在事务未提交前直接物理删除。

问题：TableIterator 为什么要跨页？

回答要点：一张表通常由多个 TablePage 组成。全表扫描不能只扫第一页，必须在当前页没有下一条记录时跳到 `NextPageId` 指向的下一页。

## 实验三：Index Manager

### 1. 实验目标

实验三要实现 MiniSQL 的索引管理，核心是一个基于磁盘页的 B+ 树。前两次实验之后，数据库已经能分配页、缓存页、把记录插入堆表，也能通过 `RowId` 读回记录。但如果没有索引，查询一条记录只能全表扫描。

例如：

```sql
select * from account where id = 10086;
```

没有索引时，需要从 `TableHeap::Begin()` 一直扫到 `End()`，逐行比较 `id`。如果表里有十万条记录，就可能比较十万次。

有 B+ 树索引后，查询变成：

```text
key(id=10086) -> B+ 树查找 -> RowId -> TableHeap::GetTuple
```

这一节要完成四层内容：

1. B+ 树通用页头：`BPlusTreePage`
2. B+ 树叶子页与内部页：`BPlusTreeLeafPage`、`BPlusTreeInternalPage`
3. 整棵 B+ 树：`BPlusTree`
4. 索引封装与迭代器：`BPlusTreeIndex`、`IndexIterator`

对应文件：

- `src/include/page/b_plus_tree_page.h`
- `src/page/b_plus_tree_page.cpp`
- `src/include/page/b_plus_tree_leaf_page.h`
- `src/page/b_plus_tree_leaf_page.cpp`
- `src/include/page/b_plus_tree_internal_page.h`
- `src/page/b_plus_tree_internal_page.cpp`
- `src/include/index/b_plus_tree.h`
- `src/index/b_plus_tree.cpp`
- `src/include/index/index_iterator.h`
- `src/index/index_iterator.cpp`
- `src/include/index/b_plus_tree_index.h`
- `src/index/b_plus_tree_index.cpp`
- `src/include/index/generic_key.h`
- `src/include/page/index_roots_page.h`
- `src/page/index_roots_page.cpp`

对应测试：

- `test/index/b_plus_tree_test.cpp`
- `test/index/b_plus_tree_index_test.cpp`
- `test/index/index_iterator_test.cpp`

### 2. 相关数据库知识

#### 2.1 为什么需要索引

堆表的优点是插入简单，但缺点是查找慢。对于条件查询：

```sql
where id = 123
```

没有索引时只能顺序扫描。复杂度是：

```text
O(N)
```

B+ 树索引把查找复杂度降为：

```text
O(log_f N)
```

这里 `f` 是一个内部节点能容纳的孩子数，也叫 fanout。数据库页通常是 4KB，一个内部节点可以存很多 key 和 child pointer，所以树高通常很低。

真实数据库中，即使有几百万条记录，B+ 树高度也常常只有 3 到 4 层。

#### 2.2 B 树和 B+ 树有什么区别

B 树可以在内部节点和叶子节点都存数据。

B+ 树的特点是：

1. 真正的数据指针只存在叶子节点。
2. 内部节点只负责导航。
3. 所有叶子节点按 key 顺序串成链表。

这非常适合数据库：

- 点查：从根走到叶子。
- 范围查：先找到起点叶子，再沿叶子链表往后扫。
- 顺序遍历：直接从最左叶子开始扫。

本项目中的叶子节点存：

```text
key -> RowId
```

内部节点存：

```text
key -> child page_id
```

拿到 `RowId` 后，再回到 `TableHeap` 读取完整记录。

#### 2.3 为什么索引里存 RowId 而不是整行

索引通常不保存整条记录，只保存索引键和记录位置。

例如对 `id` 建索引：

```text
id = 10086 -> RowId(page_id, slot_num)
```

好处：

1. 索引更小，一个页能放更多 key。
2. 树高度更低。
3. 表记录更新时，只要 RowId 不变，索引不需要保存整行副本。

代价是：通过索引找到 RowId 后，还需要回表读取完整 Row。

#### 2.4 本项目中的 GenericKey

索引键可能是单列，也可能是多列。

例如：

```sql
create index idx on account(id, name);
```

这个 key 由两列组成：`id` 和 `name`。

为了统一处理不同类型的 key，框架提供了：

- `GenericKey`
- `KeyManager`

`GenericKey` 本质是一段字节数组。`KeyManager::SerializeFromKey` 会把一个 `Row` 序列化进 `GenericKey`。`KeyManager::CompareKeys` 会把两个 `GenericKey` 反序列化成 Row，然后逐字段比较。

所以写 B+ 树时，不要自己解释 key 的类型，只要调用：

```cpp
processor_.CompareKeys(lhs, rhs)
```

比较结果：

```text
< 0: lhs < rhs
= 0: lhs == rhs
> 0: lhs > rhs
```

#### 2.5 本项目只支持 Unique Key

文档和代码都说明：

```text
Only support unique key.
```

也就是说同一个索引 key 只能出现一次。

因此：

- 插入重复 key 应返回 `false`。
- `GetValue` 最多返回一个 RowId。
- 叶子页的 `Lookup` 找到后即可结束。

### 3. B+ 树页结构

#### 3.1 BPlusTreePage：公共页头

`BPlusTreePage` 是内部页和叶子页的公共头部。

字段：

```cpp
IndexPageType page_type_;
int key_size_;
lsn_t lsn_;
int size_;
int max_size_;
page_id_t parent_page_id_;
page_id_t page_id_;
```

含义：

- `page_type_`：叶子页还是内部页。
- `key_size_`：每个 key 的字节数。
- `size_`：当前页内有多少 pair。
- `max_size_`：最多能放多少 pair。
- `parent_page_id_`：父节点页号。
- `page_id_`：当前节点页号。

要实现的函数：

```cpp
IsLeafPage()
IsRootPage()
SetPageType()
GetMaxSize()
SetMaxSize()
GetMinSize()
GetParentPageId()
```

实现要点：

- `IsLeafPage()` 判断 `page_type_ == IndexPageType::LEAF_PAGE`。
- `IsRootPage()` 判断 `parent_page_id_ == INVALID_PAGE_ID`。
- `GetMinSize()` 通常返回 `max_size_ / 2`。
- 根节点是特殊情况，根节点允许比普通节点更少。

根节点最小大小可以这样理解：

```text
叶子根：至少 1 个 key，空树除外
内部根：至少 2 个 child pointer
普通节点：至少半满
```

在简单实现中，`GetMinSize()` 可以先处理普通节点半满逻辑，根节点收缩由 `AdjustRoot` 单独处理。

#### 3.2 LeafPage：叶子页

叶子页保存真正的索引项：

```text
key -> RowId
```

页内格式：

```text
| BPlusTreePage header | next_page_id | pair array |
```

代码里用宏计算 pair 位置：

```cpp
#define pair_size (GetKeySize() + sizeof(RowId))
#define key_off 0
#define val_off GetKeySize()
```

也就是说，第 `i` 个 pair 的位置是：

```text
data_ + i * pair_size
```

要实现的关键函数：

```cpp
Init()
KeyIndex()
Insert()
Lookup()
RemoveAndDeleteRecord()
MoveHalfTo()
MoveAllTo()
MoveFirstToEndOf()
MoveLastToFrontOf()
```

#### 3.3 LeafPage::Init

初始化时需要设置：

```text
page_type = LEAF_PAGE
size = 0
page_id = page_id
parent_page_id = parent_id
key_size = key_size
max_size = max_size 或根据页面大小计算
next_page_id = INVALID_PAGE_ID
lsn = INVALID_LSN
```

默认 `max_size` 可以按容量计算：

```text
max_size = (PAGE_SIZE - LEAF_PAGE_HEADER_SIZE) / (key_size + sizeof(RowId))
```

有些实现会保守地减 1，给 split 留余量；关键是插入、split 和测试保持一致。

#### 3.4 LeafPage::KeyIndex

目标：找到第一个 `key_at(i) >= input_key` 的位置。

这是典型 lower_bound。

伪逻辑：

```text
left = 0
right = size
while left < right:
  mid = (left + right) / 2
  if KeyAt(mid) < key:
    left = mid + 1
  else:
    right = mid
return left
```

这个函数用于：

- 插入时找到插入位置。
- 查找时找到可能位置。
- `Begin(key)` 找范围扫描起点。

#### 3.5 LeafPage::Insert

目标：把 `(key, RowId)` 按 key 顺序插入。

步骤：

1. 调用 `KeyIndex(key)` 找位置。
2. 如果位置未越界且 key 相等，说明重复 key，通常不插入。
3. 把当前位置之后的 pair 整体右移一个位置。
4. 写入 key 和 RowId。
5. `IncreaseSize(1)`。
6. 返回新 size。

因为 B+ 树只支持 unique key，重复 key 必须拒绝。

#### 3.6 LeafPage::Lookup

步骤：

1. 调用 `KeyIndex(key)`。
2. 如果 index < size 且 key 相等：
   - 输出 `ValueAt(index)`。
   - 返回 true。
3. 否则返回 false。

#### 3.7 LeafPage::RemoveAndDeleteRecord

步骤：

1. 调用 `KeyIndex(key)`。
2. 如果没找到相等 key，返回原 size 或 `-1`，但树级代码要能正确理解。
3. 如果找到，把后面的 pair 左移覆盖当前位置。
4. `IncreaseSize(-1)`。
5. 返回新 size。

#### 3.8 LeafPage 分裂、合并、重分配

`MoveHalfTo(recipient)`：

- 把当前页后一半 pair 移到新叶子页。
- 当前页 size 减少。
- recipient size 增加。
- 更新叶子链表：

```text
recipient.next = this.next
this.next = recipient.page_id
```

`MoveAllTo(recipient)`：

- 把当前页所有 pair 追加到 recipient 末尾。
- recipient 的 next 指向当前页的 next。

`MoveFirstToEndOf(recipient)`：

- 把当前页第一个 pair 移到 recipient 末尾。
- 当前页删除第一个 pair。

`MoveLastToFrontOf(recipient)`：

- 把当前页最后一个 pair 移到 recipient 开头。
- 当前页 size 减少。

注意：叶子页移动 pair 时，不涉及孩子节点 parent 更新，因为叶子页的 value 是 RowId，不是 child page_id。

### 4. InternalPage：内部页

#### 4.1 内部页存什么

内部页保存：

```text
key -> child_page_id
```

但是 B+ 树内部节点有一个经典问题：

```text
n 个 key 对应 n+1 个 child pointer
```

本框架为了统一 pair 数组，牺牲了第 0 个 key：

```text
pair 0: [invalid key, leftmost child]
pair 1: [key1, child1]
pair 2: [key2, child2]
...
```

所以内部页的 `size_` 表示 child pointer 数量，也就是 pair 数量。真正有效 key 从 index 1 开始。

#### 4.2 InternalPage::Init

类似叶子页，但类型是 `INTERNAL_PAGE`。

默认容量：

```text
max_size = (PAGE_SIZE - INTERNAL_PAGE_HEADER_SIZE) / (key_size + sizeof(page_id_t))
```

#### 4.3 InternalPage::Lookup

目标：根据 key 找到应该进入哪个 child page。

规则：

```text
ValueAt(0): keys < KeyAt(1)
ValueAt(1): KeyAt(1) <= keys < KeyAt(2)
ValueAt(2): KeyAt(2) <= keys < KeyAt(3)
...
```

实现时从有效 key 范围 `[1, size - 1]` 二分：

```text
找到最后一个 KeyAt(i) <= key
返回 ValueAt(i)
如果所有 KeyAt(i) 都 > key，返回 ValueAt(0)
```

#### 4.4 PopulateNewRoot

当旧根分裂时，需要创建新根。

新根内容应该是：

```text
pair 0: invalid key, old_root_page_id
pair 1: new_key,     new_root_child_page_id
size = 2
```

其中 `new_key` 是右子树第一个 key。

#### 4.5 InsertNodeAfter

目标：在 value 等于 `old_value` 的 pair 后面插入 `(new_key, new_value)`。

步骤：

1. 用 `ValueIndex(old_value)` 找位置。
2. 把后面的 pair 右移。
3. 在 `index + 1` 写入新 key 和新 value。
4. size 加 1。
5. 返回新 size。

#### 4.6 InternalPage 分裂

内部页分裂比叶子页更绕，因为中间 key 要上推到父节点。

常见策略：

```text
原内部页: [P0, K1 P1, K2 P2, K3 P3, K4 P4]

分裂后:
左页: [P0, K1 P1]
上推: K2
右页: [P2, K3 P3, K4 P4]
```

但本框架 pair 0 的 key 无效，所以移动到右页时要特别处理右页第 0 个 pair 的 key。

简单记忆：

- 内部页 split 后，右页也必须有一个无效 key 的第 0 pair。
- 被上推到父节点的 key 不应该继续作为右页第 0 个有效 key 使用。
- 移动 child page 到右页后，要把这些 child 的 parent_page_id 改成右页 page_id。

#### 4.7 内部页移动 child 时必须更新 parent

叶子页 value 是 RowId，不需要改 parent。

内部页 value 是 child page id。把 child 从 A 内部页移动到 B 内部页后，child 的父亲必须变成 B：

```cpp
auto child = reinterpret_cast<BPlusTreePage *>(bpm->FetchPage(child_page_id)->GetData());
child->SetParentPageId(recipient->GetPageId());
bpm->UnpinPage(child_page_id, true);
```

这是实验三常见大坑。

### 5. BPlusTree 整体逻辑

#### 5.1 根节点在哪里

`BPlusTree` 成员里有：

```cpp
page_id_t root_page_id_{INVALID_PAGE_ID};
```

并且索引根页持久化在：

```text
logical page INDEX_ROOTS_PAGE_ID = 1
```

对应类：

- `IndexRootsPage`

每当 root 改变，都要调用：

```cpp
UpdateRootPageId(...)
```

否则数据库重启后不知道索引根在哪。

#### 5.2 构造函数

构造函数需要：

1. 保存 `index_id_`、`buffer_pool_manager_`、`processor_`。
2. 设置 leaf/internal max size。
3. 从 `INDEX_ROOTS_PAGE_ID` 读取 `IndexRootsPage`。
4. 尝试根据 `index_id_` 获取已有 root。
5. 如果找到，设置 `root_page_id_`。
6. 如果找不到，保持 `INVALID_PAGE_ID`，表示空树。

注意：测试里 `DBStorageEngine` 会预先分配 Catalog Meta Page 和 Index Roots Page。

#### 5.3 IsEmpty

最直接判断：

```text
root_page_id_ == INVALID_PAGE_ID
```

#### 5.4 FindLeafPage

这是查找、插入、删除都会用到的基础函数。

输入：

- `key`：目标 key。
- `page_id`：默认从 root 开始。
- `leftMost`：是否找最左叶子。

步骤：

1. 如果树空，返回 `nullptr`。
2. 如果 `page_id == INVALID_PAGE_ID`，从 `root_page_id_` 开始。
3. Fetch 当前页。
4. 如果是叶子页，返回这个 Page。
   - 注意：返回时这个页保持 pinned，由调用者负责 unpin。
5. 如果是内部页：
   - 如果 `leftMost == true`，进入 `ValueAt(0)`。
   - 否则调用 `internal->Lookup(key, processor_)` 找 child。
6. unpin 当前内部页。
7. 继续向下。

这一步最重要的是：不要忘记 unpin 路径上的内部页。

#### 5.5 GetValue

点查流程：

1. 如果空树，返回 false。
2. 调用 `FindLeafPage(key)`。
3. 在叶子页调用 `Lookup`。
4. 如果找到，把 RowId 放入 `result`。
5. unpin 叶子页。
6. 返回是否找到。

测试里 `result` 没有每次清空，所以一种稳妥做法是：找到就 `result.push_back(value)`，不要假设 result 初始为空。

#### 5.6 Insert

插入有两种情况：

1. 空树：创建根叶子页。
2. 非空树：插入到对应叶子页。

`Insert` 顶层逻辑：

```text
if empty:
  StartNewTree(key, value)
  return true
else:
  return InsertIntoLeaf(key, value)
```

#### 5.7 StartNewTree

步骤：

1. 调用 `buffer_pool_manager_->NewPage(root_page_id_)`。
2. 把 Page data 转成 `LeafPage *`。
3. `leaf->Init(root_page_id_, INVALID_PAGE_ID, key_size, leaf_max_size_)`。
4. 插入第一条 key-value。
5. 调用 `UpdateRootPageId(true)`，插入 root 记录。
6. unpin root page，dirty = true。

#### 5.8 InsertIntoLeaf

步骤：

1. 调用 `FindLeafPage(key)`。
2. 如果叶子页已经有相同 key，unpin 后返回 false。
3. 调用 `leaf->Insert(key, value, processor_)`。
4. 如果插入后 size <= max_size，unpin dirty 后返回 true。
5. 如果溢出：
   - 调用 `Split(leaf)` 创建新叶子页。
   - 新叶子页第一个 key 作为上推 key。
   - 调用 `InsertIntoParent(old_leaf, first_key_of_new_leaf, new_leaf)`。
6. unpin 两个叶子页，dirty = true。
7. 返回 true。

#### 5.9 Split

叶子页 split：

1. NewPage 创建新页。
2. 新页 Init，parent 等于旧页 parent。
3. 调用旧页 `MoveHalfTo(new_leaf)`。
4. 返回新页指针。

内部页 split：

1. NewPage 创建新内部页。
2. Init，parent 等于旧页 parent。
3. 调用旧页 `MoveHalfTo(new_internal, bpm)`。
4. 返回新页指针。

注意：split 后新页保持 pinned。调用者负责后续 unpin。

#### 5.10 InsertIntoParent

这是插入最关键的递归逻辑。

如果 `old_node` 是根：

1. 新建 internal root。
2. `PopulateNewRoot(old_node->GetPageId(), key, new_node->GetPageId())`。
3. 更新 old_node 和 new_node 的 parent 为新 root。
4. 更新 `root_page_id_`。
5. 调用 `UpdateRootPageId(false)`。

如果 `old_node` 不是根：

1. Fetch parent。
2. 调用 `parent->InsertNodeAfter(old_node->GetPageId(), key, new_node->GetPageId())`。
3. 设置 `new_node->parent = parent.page_id`。
4. 如果 parent 未溢出，结束。
5. 如果 parent 溢出：
   - split parent。
   - 选出要上推的 key。
   - 递归 `InsertIntoParent(parent, push_up_key, new_parent_sibling)`。

这一步最容易忘的是 parent/new_node/old_node 的 dirty unpin。

### 6. 删除：Remove、Coalesce、Redistribute

#### 6.1 Remove 顶层流程

步骤：

1. 如果树空，直接返回。
2. 找到包含 key 的叶子页。
3. 调用 `RemoveAndDeleteRecord`。
4. 如果 key 不存在，unpin 返回。
5. 如果删除后页仍然满足最小大小，unpin 返回。
6. 如果不足，调用 `CoalesceOrRedistribute(leaf)`。

根节点特殊，不用强制半满，交给 `AdjustRoot`。

#### 6.2 下溢是什么

B+ 树要求普通节点至少半满。

如果删除后：

```text
node.size < node.GetMinSize()
```

就发生下溢，需要修复。

修复方式有两种：

1. Redistribute：向兄弟借一个 key。
2. Coalesce：和兄弟合并。

#### 6.3 CoalesceOrRedistribute

步骤：

1. 如果当前节点是根，调用 `AdjustRoot`。
2. Fetch parent。
3. 找到当前节点在 parent 中的位置 `index`。
4. 选兄弟：
   - 如果 `index == 0`，兄弟是右兄弟 `ValueAt(1)`。
   - 否则兄弟是左兄弟 `ValueAt(index - 1)`。
5. 如果兄弟和当前节点总 size 能放进一个页，合并。
6. 否则重分配。

常见约定：

```text
index == 0: 当前节点在最左边，使用右兄弟
index > 0: 使用左兄弟
```

这个 index 也会影响 parent 中分隔 key 的位置。

#### 6.4 Redistribute

重分配就是借一个 pair。

叶子页：

- 如果当前节点是最左，向右兄弟借第一个 pair 到当前页末尾。
- 否则向左兄弟借最后一个 pair 到当前页开头。
- 更新 parent 中对应分隔 key。

内部页：

- 借 child pointer 时还要处理 middle key。
- 被移动 child 的 parent_page_id 必须更新。
- parent 中分隔 key 也要更新。

#### 6.5 Coalesce

合并就是把一个节点全部移动到兄弟，然后从 parent 删除对应分隔项。

叶子页合并：

1. 把 node 的所有 pair 移到 neighbor。
2. 更新叶子链表 next 指针。
3. parent 删除对应 entry。
4. 删除 node 对应 page。
5. 如果 parent 下溢，递归处理 parent。

内部页合并：

1. 从 parent 取 middle key。
2. 把 middle key 和 node 内容合并进 neighbor。
3. 移动的 child 都更新 parent_page_id。
4. parent 删除 entry。
5. 必要时递归处理 parent。

#### 6.6 AdjustRoot

删除可能导致 root 缩小。

两种情况：

1. root 是叶子页，删到 size = 0：
   - 树变空。
   - `root_page_id_ = INVALID_PAGE_ID`。
   - 更新 IndexRootsPage。
   - 删除旧 root page。
2. root 是内部页，删到只剩一个 child：
   - 这个唯一 child 升为新 root。
   - child parent 设置为 `INVALID_PAGE_ID`。
   - 更新 root_page_id。
   - 删除旧 root page。

### 7. IndexIterator

#### 7.1 为什么需要索引迭代器

B+ 树叶子节点是有序链表，所以天然适合范围查询。

例如：

```sql
where id >= 10 and id < 100
```

可以：

1. 找到第一个 `id >= 10` 的叶子位置。
2. 沿叶子链表一直扫。
3. 到 `id >= 100` 停止。

本项目中的 `BPlusTreeIndex::ScanKey` 已经使用 `IndexIterator` 实现 `>`, `>=`, `<`, `<=`, `<>` 等比较。

#### 7.2 IndexIterator 成员

已有成员：

```cpp
page_id_t current_page_id;
LeafPage *page;
int item_index;
BufferPoolManager *buffer_pool_manager;
```

构造函数会 fetch 当前叶子页，因此析构函数要 unpin 当前页。

#### 7.3 operator*

返回当前 pair：

```cpp
return page->GetItem(item_index);
```

需要确保当前不是 end。

#### 7.4 operator++

步骤：

1. `item_index++`。
2. 如果仍然小于 `page->GetSize()`，停在当前页。
3. 如果到达当前页末尾：
   - 记录 `next_page_id = page->GetNextPageId()`。
   - unpin 当前页。
   - 如果 next 是 `INVALID_PAGE_ID`，设置为 end。
   - 否则 fetch next leaf，`item_index = 0`。

end 可以表示为：

```text
current_page_id = INVALID_PAGE_ID
item_index = 0
page = nullptr
```

#### 7.5 Begin 和 End

`BPlusTree::Begin()`：

- 找最左叶子页。
- 返回指向第 0 个 item 的 iterator。
- 如果树空，返回 `End()`。

`BPlusTree::Begin(key)`：

- 找 key 所在叶子。
- 用 `LeafPage::KeyIndex(key)` 得到起始 index。
- 如果 index 等于当前页 size，应该跳到下一叶子页的开头。

`BPlusTree::End()`：

- 返回默认构造的 `IndexIterator()`，即 invalid page。

### 8. BPlusTreeIndex 封装

`BPlusTreeIndex` 已经基本实现，它把上层传来的 `Row key` 转为 `GenericKey`，再调用 `BPlusTree`。

重要接口：

```cpp
InsertEntry(row_key, row_id, txn)
RemoveEntry(row_key, row_id, txn)
ScanKey(row_key, result, txn, compare_operator)
```

`ScanKey` 支持：

```text
=
>
>=
<
<=
<>
```

这些范围查询依赖：

- `BPlusTree::Begin()`
- `BPlusTree::Begin(key)`
- `BPlusTree::End()`
- `IndexIterator::operator++`
- `IndexIterator::operator*`

所以即使点查通过，迭代器没写好，`BPlusTreeIndexSimpleTest` 仍然会失败。

### 9. 测试怎么理解

#### 9.1 b_plus_tree_test.cpp

测试做了这些事：

1. 创建单列 int key 的 B+ 树。
2. 随机插入 2000 个 key。
3. 检查所有页最终都 unpinned。
4. 逐个 key 查询。
5. 删除一半 key。
6. 检查被删 key 查不到，未删 key 查得到。

这主要验证：

- 插入时 split 正确。
- root 分裂正确。
- 查找路径正确。
- 删除、合并、重分配正确。
- BufferPool pin/unpin 没泄漏。

#### 9.2 b_plus_tree_index_test.cpp

分两部分：

1. `BPlusTreeIndexGenericKeyTest`
   - 验证复合 key 序列化比较正确。
   - 依赖实验二的 Row 序列化。
2. `BPlusTreeIndexSimpleTest`
   - 插入 10 条复合 key。
   - 用 `ScanKey("=")` 查询。
   - 用 iterator 从头扫到尾。

这里会检验 B+ 树和索引封装是否能一起工作。

#### 9.3 index_iterator_test.cpp

流程：

1. 插入 1 到 50。
2. 删除偶数。
3. 确认偶数查不到，奇数查得到。
4. 用 iterator 顺序遍历。
5. 期待遍历结果是 1, 3, 5, ..., 49。

这会重点检查：

- 删除后叶子链表仍然正确。
- iterator 能跨叶子页。
- key 顺序仍然正确。

### 10. 推荐实现顺序

B+ 树很容易写乱。建议严格按层次来：

1. 实现 `BPlusTreePage` 的基础 getter/setter。
2. 实现 `LeafPage`：
   - `Init`
   - `KeyIndex`
   - `Insert`
   - `Lookup`
   - `RemoveAndDeleteRecord`
   - `MoveHalfTo`
3. 实现 `InternalPage`：
   - `Init`
   - `Lookup`
   - `PopulateNewRoot`
   - `InsertNodeAfter`
   - `Remove`
4. 实现 B+ 树只插入不删除：
   - `IsEmpty`
   - `FindLeafPage`
   - `GetValue`
   - `StartNewTree`
   - `Insert`
   - `InsertIntoLeaf`
   - `Split`
   - `InsertIntoParent`
5. 先用小数据手测插入和查询。
6. 实现 `IndexIterator` 和 `Begin/End`。
7. 再实现删除：
   - `Remove`
   - `AdjustRoot`
   - `CoalesceOrRedistribute`
   - `Redistribute`
   - `Coalesce`
8. 最后跑完整 index 测试。

建议测试命令：

```bash
make b_plus_tree_test -j
./test/b_plus_tree_test

make b_plus_tree_index_test -j
./test/b_plus_tree_index_test

make index_iterator_test -j
./test/index_iterator_test
```

如果已经构建过，只改 `.cpp/.h`，通常不需要重新 `cmake ..`。

### 11. 调试建议

#### 11.1 从小阶数开始

默认页很大，节点容量很大，插入很多数据才会 split。调试时可以显式传小一点的 max size：

```cpp
BPlusTree tree(index_id, bpm, key_manager, 3, 4);
```

这样插入几个 key 就能触发 split、root split、merge。

#### 11.2 画树

框架提供：

```cpp
tree.PrintTree(out, schema);
```

它会输出 DOT 格式，可以拿去 Graphviz 可视化。调 B+ 树时，画图比盯变量更有效。

#### 11.3 每个 Fetch 都找对应 Unpin

实验三最常见的问题不是逻辑错，而是页面 pin 泄漏。

经验规则：

```text
FetchPage / NewPage 得到的页，都要明确谁负责 UnpinPage。
```

测试中 `tree.Check()` 会调用：

```cpp
buffer_pool_manager_->CheckAllUnpinned()
```

如果失败，说明有页没释放。

### 12. 常见错误清单

1. 内部页从 index 0 开始比较 key，忘记第 0 个 key 是 invalid。
2. split 内部页时，把上推 key 继续留在右页有效 key 位置。
3. 移动内部页 child 后，忘记更新 child 的 parent_page_id。
4. 叶子页 split 后，忘记维护 next_page_id。
5. root 改变后，忘记调用 `UpdateRootPageId`。
6. `FindLeafPage` 返回叶子页后，调用者忘记 unpin。
7. `GetValue` 找到 key 后没有把 RowId push 到 result。
8. `Insert` 对重复 key 没有返回 false。
9. `InsertIntoParent` 没有递归处理 parent overflow。
10. 删除后节点下溢，没有做 redistribute 或 coalesce。
11. coalesce 后删除了错误的 parent entry。
12. iterator 到达叶子页末尾后，没有跳到 next leaf。
13. `Begin(key)` 落在页末尾时，没有跳到下一页。
14. `IndexIterator` 析构时重复 unpin 或忘记 unpin。
15. `Destroy` 删除树页时，只删 root，忘记递归删除所有 child。

### 13. 验收问答准备

问题：为什么数据库索引常用 B+ 树，而不是普通二叉搜索树？

回答要点：B+ 树节点 fanout 很大，树高低，适合磁盘页读写。二叉树高度太高，随机 I/O 次数多，不适合数据库。

问题：B+ 树为什么适合范围查询？

回答要点：所有数据项都在叶子页，叶子页按 key 有序并通过 next 指针连接。找到范围起点后，可以沿叶子链表顺序扫描。

问题：内部页第 0 个 key 为什么无效？

回答要点：内部节点有 n 个 key 和 n+1 个 child pointer。框架用 pair 数组统一存储，为了让每个 child pointer 都跟一个 pair 绑定，第 0 个 pair 只使用 value，key 作为无效占位。

问题：索引叶子页为什么存 RowId？

回答要点：RowId 能定位堆表中的完整记录。索引只存 key 和 RowId，可以减少索引大小，提高 fanout，需要完整记录时再回表。

问题：插入导致叶子页满了怎么办？

回答要点：创建新叶子页，把一半 key 移过去，维护叶子链表，把新叶子页第一个 key 插入父节点。如果父节点也满，继续向上分裂，必要时创建新根。

问题：删除导致节点太空怎么办？

回答要点：先看兄弟节点是否能借一个 key，能借就 redistribute；不能借就 coalesce 合并，并从父节点删除分隔项。父节点如果下溢，递归处理。

问题：为什么 root 可以不满足普通节点的半满约束？

回答要点：root 是树入口。空树、只有一个叶子根、或内部根只有两个孩子都是合法状态。删除时 root 还可能收缩，把唯一 child 提升为新 root。

问题：BPlusTreeIndex 和 BPlusTree 的关系是什么？

回答要点：`BPlusTree` 只处理 `GenericKey -> RowId` 的树结构；`BPlusTreeIndex` 是上层索引接口，负责把 `Row key` 序列化成 `GenericKey`，并支持不同比较操作的扫描。

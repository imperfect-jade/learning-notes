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

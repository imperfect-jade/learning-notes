<!-- learning-notes
course: Linux 使用手册
textbook: 未指定
style: tool-docs
source_policy: references-section
last_updated: 2026-05-25
-->

# Linux 使用手册

这份手册按“基本概念 + 常用命令 + 使用指南”组织，适合快速查看和直接复制命令。示例默认面向 Ubuntu/Debian 系发行版，其他发行版的软件包管理命令可能不同。

## 一、Linux 基本知识

### 1. Linux 是什么

Linux 通常指基于 Linux 内核的操作系统。它由内核、Shell、系统工具、软件包管理器和应用程序组成。

| 概念 | 说明 |
|---|---|
| 内核 Kernel | 管理 CPU、内存、磁盘、网络、进程等底层资源 |
| 发行版 Distribution | 把内核、工具和软件打包成可安装系统，如 Ubuntu、Debian、Fedora、Arch |
| Shell | 命令解释器，负责接收命令并执行，如 Bash、Zsh |
| 终端 Terminal | 输入 Shell 命令的窗口程序 |
| 软件包管理器 | 安装、升级、卸载软件，如 `apt`、`dnf`、`pacman` |

查看系统信息：

```bash
uname -a
cat /etc/os-release
hostnamectl
```

### 2. 一切皆文件

Linux 的核心思想之一是“一切皆文件”：普通文件、目录、硬件设备、进程信息、系统状态都可以用类似文件的方式访问。

| 类型 | 示例 | 说明 |
|---|---|---|
| 普通文件 | `/home/user/a.txt` | 文本、图片、程序等 |
| 目录 | `/etc` | 保存文件名和路径关系的特殊文件 |
| 设备文件 | `/dev/sda`、`/dev/null` | 磁盘、终端、空设备等 |
| 进程信息 | `/proc/1234` | PID 为 1234 的进程信息 |
| 系统信息 | `/proc/cpuinfo`、`/proc/meminfo` | CPU、内存等运行状态 |
| Socket/Pipe | 网络连接、管道 | 进程间通信 |

示例：

```bash
cat /proc/cpuinfo
cat /proc/meminfo
ls -l /dev/null
```

使用指南：

- 设备和系统信息也能通过文件路径访问，但不代表都能随意编辑。
- `/proc` 和 `/sys` 多数是虚拟文件系统，内容由内核动态生成。

### 3. 根目录与路径

Linux 文件系统从 `/` 根目录开始，所有文件和设备都挂载在这棵目录树上。

```text
/
├── bin
├── boot
├── dev
├── etc
├── home
├── tmp
├── usr
└── var
```

常见目录：

| 路径 | 用途 |
|---|---|
| `/` | 根目录 |
| `/home` | 普通用户家目录 |
| `/root` | root 用户家目录 |
| `/etc` | 系统和软件配置文件 |
| `/bin`、`/usr/bin` | 常用命令和程序 |
| `/sbin`、`/usr/sbin` | 系统管理命令 |
| `/var` | 日志、缓存、运行时数据 |
| `/tmp` | 临时文件，可能被系统自动清理 |
| `/dev` | 设备文件 |
| `/proc` | 进程和内核状态 |
| `/mnt`、`/media` | 临时挂载点 |

### 4. 绝对路径与相对路径

用途：定位文件或目录。

```bash
# 绝对路径：从 / 开始
cd /home/user/projects

# 相对路径：从当前位置开始
cd ../docs
```

常用路径符号：

| 符号 | 含义 |
|---|---|
| `/` | 根目录 |
| `.` | 当前目录 |
| `..` | 上一级目录 |
| `~` | 当前用户家目录 |
| `-` | 上一次所在目录，常用于 `cd -` |

### 5. 用户、用户组与权限

Linux 是多用户系统。每个文件都有所属用户、所属用户组和权限。

```bash
ls -l
```

输出示例：

```text
-rw-r--r-- 1 alice dev 1200 May 25 10:00 note.txt
```

含义：

| 位置 | 示例 | 说明 |
|---|---|---|
| 文件类型 | `-` | 普通文件；`d` 表示目录；`l` 表示软链接 |
| 用户权限 | `rw-` | 所属用户可读写 |
| 用户组权限 | `r--` | 所属组可读 |
| 其他人权限 | `r--` | 其他用户可读 |
| 所属用户 | `alice` | 文件拥有者 |
| 所属组 | `dev` | 文件所属用户组 |

权限字符：

| 字符 | 含义 |
|---|---|
| `r` | read，读 |
| `w` | write，写 |
| `x` | execute，执行；对目录表示可进入 |
| `-` | 无该权限 |

数字权限：

| 数字 | 权限 |
|---|---|
| `0` | `---` |
| `1` | `--x` |
| `2` | `-w-` |
| `3` | `-wx` |
| `4` | `r--` |
| `5` | `r-x` |
| `6` | `rw-` |
| `7` | `rwx` |

### 6. 命令格式

Linux 命令通常由命令名、选项和参数组成。

```bash
command [options] [arguments]
```

示例：

```bash
ls -lh /var/log
```

说明：

- `ls` 是命令。
- `-lh` 是选项，等价于 `-l -h`。
- `/var/log` 是参数。

### 7. 获取帮助

用途：查看命令说明、参数和示例。

```bash
命令 --help
man 命令
info 命令
```

示例：

```bash
ls --help
man grep
```

`man` 常用操作：

| 按键 | 作用 |
|---|---|
| `q` | 退出 |
| `/关键字` | 搜索 |
| `n` | 下一个匹配 |
| `Space` | 下一页 |

## 二、终端快捷键

### 1. 常用快捷键

| 快捷键 | 作用 |
|---|---|
| `Ctrl + Alt + T` | 打开终端 |
| `Ctrl + C` | 终止当前命令 |
| `Ctrl + D` | 退出当前 Shell 或发送 EOF |
| `Ctrl + L` | 清屏，类似 `clear` |
| `Ctrl + A` | 光标到行首 |
| `Ctrl + E` | 光标到行尾 |
| `Ctrl + U` | 删除光标前内容 |
| `Ctrl + K` | 删除光标后内容 |
| `Ctrl + R` | 搜索历史命令 |
| `Tab` | 自动补全 |
| `Ctrl + Shift + C` | 终端复制 |
| `Ctrl + Shift + V` | 终端粘贴 |
| `Ctrl + Shift + +` | 放大字体 |
| `Ctrl + -` | 缩小字体 |

### 2. 命令历史

用途：快速复用之前执行过的命令。

```bash
history
!100
!!
```

使用指南：

- `!100` 执行历史中编号为 100 的命令。
- `!!` 执行上一条命令。
- 执行历史命令前要确认内容，尤其是删除、覆盖、重启类命令。

## 三、目录与文件操作

### 1. 查看当前位置

用途：显示当前所在目录。

```bash
pwd
```

### 2. 查看目录内容

用途：列出文件和目录。

```bash
ls
ls -l
ls -a
ls -lh
ls -lah /var/log
```

常用选项：

| 选项 | 作用 |
|---|---|
| `-l` | 详细信息 |
| `-a` | 显示隐藏文件 |
| `-h` | 文件大小显示为 KB/MB/GB |
| `-R` | 递归列出 |
| `-t` | 按修改时间排序 |

### 3. 切换目录

用途：进入指定目录。

```bash
cd /etc
cd ..
cd ../..
cd ~
cd -
```

### 4. 创建目录

用途：创建一个或多级目录。

```bash
mkdir notes
mkdir -p projects/linux/logs
```

### 5. 创建文件

用途：创建空文件或更新时间戳。

```bash
touch README.md
touch app.log
```

### 6. 复制文件或目录

用途：复制文件、目录和保留属性。

```bash
cp source.txt target.txt
cp source.txt /tmp/
cp -r docs docs-backup
cp -a project project-backup
```

常用选项：

| 选项 | 作用 |
|---|---|
| `-r` | 递归复制目录 |
| `-a` | 归档模式，尽量保留权限、时间等属性 |
| `-i` | 覆盖前询问 |
| `-v` | 显示操作过程 |

### 7. 移动与重命名

用途：移动文件或修改文件名。

```bash
mv old.txt new.txt
mv file.txt /tmp/
mv docs docs-old
```

### 8. 删除文件或目录

用途：删除不需要的文件。

```bash
rm file.txt
rm -r old-dir
rm -i file.txt
```

!!! warning "谨慎使用删除命令"
    `rm` 删除后通常不会进入回收站。执行 `rm -r`、通配符删除、批量删除前先用 `ls` 确认匹配结果。

通配符示例：

```bash
ls test*
rm test*

ls *test
rm *test

ls *test*
rm *test*
```

## 四、查看与编辑文件

### 1. 直接查看文件

用途：快速输出小文件内容。

```bash
cat file.txt
```

带行号：

```bash
cat -n file.txt
```

### 2. 分页查看

用途：查看较长文件。

```bash
less file.txt
```

`less` 常用操作：

| 按键 | 作用 |
|---|---|
| `q` | 退出 |
| `/关键字` | 搜索 |
| `n` | 下一个匹配 |
| `g` | 文件开头 |
| `G` | 文件结尾 |

### 3. 查看文件头尾

用途：查看前几行或后几行。

```bash
head file.txt
head -n 20 file.txt
tail file.txt
tail -n 50 file.txt
```

实时查看日志：

```bash
tail -f /var/log/syslog
```

### 4. 编辑文件 nano

用途：简单编辑文件，适合新手。

```bash
nano file.txt
```

常用操作：

| 快捷键 | 作用 |
|---|---|
| `Ctrl + O` | 保存 |
| `Enter` | 确认文件名 |
| `Ctrl + X` | 退出 |
| `Ctrl + W` | 搜索 |

### 5. 编辑文件 vim

用途：服务器常见编辑器。

```bash
vim file.txt
```

最小操作：

| 操作 | 说明 |
|---|---|
| `i` | 进入插入模式 |
| `Esc` | 返回普通模式 |
| `:w` | 保存 |
| `:q` | 退出 |
| `:wq` | 保存并退出 |
| `:q!` | 不保存强制退出 |

## 五、查找、过滤与统计

### 1. 查找命令位置

用途：确认命令来自哪里。

```bash
which python
command -v git
type cd
```

### 2. 按名称查找文件

用途：在目录树中找文件。

```bash
find . -name "main.py"
find . -name "*.md"
find /var/log -name "*.log"
```

忽略大小写：

```bash
find . -iname "*.JPG"
```

### 3. 按大小或时间查找

用途：找大文件、旧文件、最近修改文件。

```bash
find . -size +100M
find . -size -10k
find . -mtime -7
find . -mtime +30
```

说明：

- `+100M` 大于 100MB。
- `-7` 最近 7 天内。
- `+30` 30 天以前。

### 4. grep 搜索文本

用途：在文件中按关键字过滤行。

```bash
grep "error" app.log
grep -n "error" app.log
grep -i "error" app.log
grep -r "TODO" .
```

常用选项：

| 选项 | 作用 |
|---|---|
| `-n` | 显示行号 |
| `-i` | 忽略大小写 |
| `-r` | 递归搜索目录 |
| `-v` | 反向匹配 |
| `-E` | 使用扩展正则 |

### 5. 统计 wc

用途：统计行数、词数、字节数。

```bash
wc file.txt
wc -l file.txt
wc -w file.txt
wc -c file.txt
```

常用选项：

| 选项 | 作用 |
|---|---|
| `-l` | 行数 |
| `-w` | 单词数 |
| `-c` | 字节数 |
| `-m` | 字符数 |

### 6. 排序与去重

用途：处理文本列表。

```bash
sort names.txt
sort -n numbers.txt
uniq names.txt
sort names.txt | uniq
sort names.txt | uniq -c
```

## 六、管道、重定向与命令组合

### 1. 管道 |

用途：把左侧命令输出作为右侧命令输入。

```bash
cat app.log | grep "error"
ps aux | grep nginx
ls -lah | less
```

使用指南：

- 管道适合组合小工具。
- 很多命令可直接接文件参数，`grep "error" app.log` 比 `cat app.log | grep "error"` 更简洁。

### 2. 输出重定向

用途：把命令输出写入文件。

```bash
echo "hello Linux" > test.txt
echo "second line" >> test.txt
```

说明：

| 符号 | 作用 |
|---|---|
| `>` | 覆盖写入 |
| `>>` | 追加写入 |
| `<` | 从文件读取输入 |

### 3. 错误输出重定向

用途：保存错误信息或丢弃错误信息。

```bash
command > out.txt 2> err.txt
command > all.log 2>&1
command 2> /dev/null
```

### 4. echo 与命令替换

用途：输出文本或嵌入命令结果。

```bash
echo "hello"
echo "$(pwd)"
echo "today is $(date +%F)"
```

!!! note "推荐写法"
    命令替换优先用 `$(command)`，比反引号更清晰，也更容易嵌套。

### 5. 组合执行

用途：根据前一条命令结果决定下一步。

```bash
mkdir build && cd build
test -f app.log || touch app.log
```

说明：

| 符号 | 作用 |
|---|---|
| `&&` | 前一条成功才执行下一条 |
| `||` | 前一条失败才执行下一条 |
| `;` | 不管成功失败，继续执行下一条 |

## 七、权限、用户与用户组

### 1. 切换用户

用途：切换到其他用户或 root。

```bash
su - 用户名
su - root
exit
```

临时使用管理员权限：

```bash
sudo 命令
sudo apt update
```

### 2. 查看用户身份

用途：确认当前用户、用户组和权限。

```bash
whoami
id
groups
id 用户名
```

### 3. 管理用户和用户组

用途：创建、删除用户和用户组。

```bash
sudo groupadd dev
sudo groupdel dev

sudo useradd -m -g dev alice
sudo passwd alice
sudo userdel -r alice
```

查看所有用户和用户组：

```bash
getent passwd
getent group
```

把用户加入附加组：

```bash
sudo usermod -aG sudo alice
sudo usermod -aG docker alice
```

使用指南：

- `-aG` 表示追加到附加组，不要漏掉 `-a`。
- 加入新组后通常需要重新登录才生效。

### 4. 修改权限 chmod

用途：修改文件或目录的读写执行权限。

```bash
chmod 644 file.txt
chmod 755 script.sh
chmod -R 755 public-dir
```

符号写法：

```bash
chmod u+x script.sh
chmod g-w file.txt
chmod o-r private.txt
chmod u=rwx,g=rx,o=rx script.sh
```

使用指南：

- 普通文本常用 `644`。
- 可执行脚本常用 `755` 或 `u+x`。
- 不要随意对整个系统目录执行 `chmod -R`。

### 5. 修改所有者 chown

用途：修改文件所属用户或用户组。

```bash
sudo chown alice file.txt
sudo chown alice:dev file.txt
sudo chown -R alice:dev project/
```

## 八、进程与系统资源

### 1. 查看进程

用途：查看当前系统进程。

```bash
ps aux
ps aux | grep nginx
```

实时查看：

```bash
top
htop
```

### 2. 结束进程

用途：停止异常进程。

```bash
kill PID
kill -15 PID
kill -9 PID
pkill 进程名
```

使用指南：

- 优先使用默认 `kill` 或 `kill -15`，给进程清理机会。
- `kill -9` 是强制终止，可能导致数据未保存。

### 3. 查看内存

用途：查看内存占用。

```bash
free -h
cat /proc/meminfo
```

### 4. 查看磁盘空间

用途：检查分区空间和目录大小。

```bash
df -h
du -sh .
du -sh *
```

### 5. 查看 CPU 和系统负载

```bash
uptime
lscpu
top
```

### 6. 后台运行

用途：让命令在后台执行。

```bash
python app.py &
jobs
fg %1
```

忽略退出信号：

```bash
nohup python app.py > app.log 2>&1 &
```

## 九、网络与远程连接

### 1. 查看 IP

用途：查看本机网络地址。

```bash
hostname -I
ip addr
ip route
```

### 2. 测试网络连通

```bash
ping 8.8.8.8
ping github.com
```

限制次数：

```bash
ping -c 4 github.com
```

### 3. 查看端口

用途：确认服务是否监听端口。

```bash
ss -tulnp
ss -tulnp | grep 8080
```

### 4. 下载文件

```bash
curl -L https://example.com/file.txt -o file.txt
wget https://example.com/file.txt
```

### 5. SSH 远程登录

用途：连接远程 Linux 主机。

```bash
ssh 用户名@服务器IP
ssh -p 端口 用户名@服务器IP
```

首次连接会提示确认指纹，确认来源可信后输入 `yes`。

### 6. scp 传输文件

用途：在本机和远程主机之间复制文件。

```bash
# 本地复制到远程
scp file.txt 用户名@服务器IP:/home/用户名/

# 远程复制到本地
scp 用户名@服务器IP:/home/用户名/file.txt .

# 复制目录
scp -r docs 用户名@服务器IP:/home/用户名/
```

### 7. rsync 同步目录

用途：高效同步文件，适合重复传输。

```bash
rsync -av docs/ 用户名@服务器IP:/home/用户名/docs/
rsync -av --delete docs/ backup/docs/
```

使用指南：

- `docs/` 表示同步目录内容。
- `docs` 表示同步目录本身。
- `--delete` 会删除目标端多余文件，先确认再用。

## 十、软件安装 Ubuntu/Debian

### 1. 更新软件源

用途：获取最新软件包列表。

```bash
sudo apt update
```

### 2. 升级已安装软件

```bash
sudo apt upgrade
```

### 3. 安装软件

```bash
sudo apt install 软件名
```

示例：

```bash
sudo apt install git
sudo apt install gcc
sudo apt install g++
sudo apt install make
sudo apt install curl
```

### 4. 卸载软件

```bash
sudo apt remove 软件名
sudo apt purge 软件名
sudo apt autoremove
```

说明：

- `remove` 删除软件，通常保留配置。
- `purge` 删除软件和配置。
- `autoremove` 清理不再需要的依赖。

### 5. 查询软件

```bash
apt search 关键字
apt show 软件名
apt list --installed
```

## 十一、压缩与解压

### 1. tar.gz

用途：Linux 常见打包压缩格式。

```bash
tar -czf archive.tar.gz folder/
tar -xzf archive.tar.gz
tar -tzf archive.tar.gz
```

说明：

| 选项 | 作用 |
|---|---|
| `-c` | 创建归档 |
| `-x` | 解包 |
| `-t` | 查看内容 |
| `-z` | gzip 压缩 |
| `-f` | 指定文件 |
| `-v` | 显示过程 |

### 2. zip

```bash
zip -r archive.zip folder/
unzip archive.zip
```

## 十二、服务与日志

### 1. systemctl 管理服务

用途：管理系统服务。

```bash
sudo systemctl start nginx
sudo systemctl stop nginx
sudo systemctl restart nginx
sudo systemctl reload nginx
sudo systemctl status nginx
```

开机自启：

```bash
sudo systemctl enable nginx
sudo systemctl disable nginx
```

### 2. 查看日志 journalctl

用途：查看 systemd 日志。

```bash
journalctl
journalctl -u nginx
journalctl -u nginx -f
journalctl --since "1 hour ago"
```

### 3. 常见日志位置

```bash
ls /var/log
tail -f /var/log/syslog
tail -f /var/log/auth.log
```

## 十三、环境变量与 Shell 配置

### 1. 查看环境变量

```bash
env
echo $PATH
printenv PATH
```

### 2. 临时设置变量

用途：只在当前终端会话生效。

```bash
export APP_ENV=dev
echo $APP_ENV
```

### 3. 永久设置变量

用途：每次打开终端自动生效。

```bash
nano ~/.bashrc
```

添加：

```bash
export APP_ENV=dev
export PATH="$HOME/bin:$PATH"
```

重新加载：

```bash
source ~/.bashrc
```

### 4. alias 别名

用途：缩短常用命令。

```bash
alias ll='ls -lah'
alias gs='git status'
```

写入 `~/.bashrc` 后长期生效。

## 十四、Shell 脚本基础

### 1. 创建脚本

用途：把多条命令保存为可重复执行的脚本。

```bash title="hello.sh"
#!/usr/bin/env bash

echo "Hello, Linux"
echo "Current path: $(pwd)"
```

运行：

```bash
chmod +x hello.sh
./hello.sh
```

### 2. 参数

用途：从命令行给脚本传值。

```bash title="greet.sh"
#!/usr/bin/env bash

name="$1"
echo "Hello, ${name}"
```

运行：

```bash
./greet.sh Alice
```

### 3. 条件判断

```bash
if [ -f "app.log" ]; then
  echo "log exists"
else
  echo "log missing"
fi
```

### 4. 循环

```bash
for file in *.log; do
  echo "$file"
done
```

## 十五、关机、重启与定时任务

### 1. 关机与重启

```bash
sudo reboot
sudo poweroff
sudo shutdown now
sudo shutdown -r now
```

### 2. 定时任务 cron

用途：定时执行命令。

```bash
crontab -e
crontab -l
```

示例：每天凌晨 2 点执行脚本。

```cron
0 2 * * * /home/user/backup.sh
```

cron 时间格式：

```text
分钟 小时 日期 月份 星期 命令
```

## 十六、常见排错

### 1. Permission denied

常见原因：

- 当前用户没有读写执行权限。
- 脚本没有执行权限。
- 需要管理员权限。

处理：

```bash
ls -l 文件名
chmod u+x script.sh
sudo 命令
```

### 2. command not found

常见原因：

- 命令未安装。
- 命令不在 `PATH` 中。
- 命令拼写错误。

处理：

```bash
command -v 命令
echo $PATH
sudo apt install 软件名
```

### 3. No such file or directory

常见原因：

- 路径写错。
- 当前目录不是预期目录。
- 文件名大小写不一致。

处理：

```bash
pwd
ls -lah
find . -name "文件名"
```

### 4. 端口被占用

处理：

```bash
ss -tulnp | grep 端口号
sudo kill PID
```

### 5. 磁盘空间不足

处理：

```bash
df -h
du -sh * | sort -h
sudo apt autoremove
sudo journalctl --vacuum-time=7d
```

## 十七、命令速查表

| 场景 | 命令 |
|---|---|
| 查看当前位置 | `pwd` |
| 查看目录 | `ls -lah` |
| 切换目录 | `cd 路径` |
| 回到家目录 | `cd ~` |
| 返回上次目录 | `cd -` |
| 创建目录 | `mkdir -p 目录` |
| 创建文件 | `touch 文件` |
| 复制文件 | `cp 源 目标` |
| 复制目录 | `cp -r 源目录 目标` |
| 移动/重命名 | `mv 源 目标` |
| 删除文件 | `rm 文件` |
| 删除目录 | `rm -r 目录` |
| 查看文件 | `cat 文件` |
| 分页查看 | `less 文件` |
| 查看文件尾部 | `tail -n 50 文件` |
| 实时日志 | `tail -f 日志文件` |
| 搜索文本 | `grep -n "关键字" 文件` |
| 查找文件 | `find . -name "*.md"` |
| 统计行数 | `wc -l 文件` |
| 查看命令位置 | `which 命令` |
| 查看 IP | `hostname -I` |
| 查看端口 | `ss -tulnp` |
| 查看进程 | `ps aux` |
| 结束进程 | `kill PID` |
| 查看磁盘 | `df -h` |
| 查看目录大小 | `du -sh 目录` |
| 查看内存 | `free -h` |
| 修改权限 | `chmod 755 文件` |
| 修改所有者 | `sudo chown 用户:组 文件` |
| 安装软件 | `sudo apt install 软件名` |
| 更新软件源 | `sudo apt update` |
| 远程登录 | `ssh 用户@IP` |
| 复制到远程 | `scp 文件 用户@IP:路径` |
| 后台运行 | `nohup 命令 > out.log 2>&1 &` |
| 查看服务 | `systemctl status 服务名` |
| 查看服务日志 | `journalctl -u 服务名 -f` |
| 清屏 | `clear` |

## 参考资料

- Linux man pages：<https://man7.org/linux/man-pages/>
- Filesystem Hierarchy Standard：<https://refspecs.linuxfoundation.org/fhs.shtml>
- Ubuntu Server Documentation：<https://documentation.ubuntu.com/server/>

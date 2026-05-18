

打开终端快捷键：**Ctrl + Alt + T**
放大字体**Ctrl + Shift + +**
缩小字体**Ctrl + -**
终止当前命令**Ctrl + C**
终端复制**Ctrl + Shift + C**
终端黏贴**Ctrl + Shift + V**
补全**Tab**

---

# 常用命令

```
command [-options] [parameter]

su name # 切换用户
sudo apt update # 获取更新列表
sudo apt upgrade # 更新安装

hostname -I # 查看IP

scp -r 文件地址 虚拟机用户名@虚拟机IP:目标地址 # 传输文件
```

## 1. 查看当前位置

```
pwd # Print Work Directory
```

## 2. 查看目录里有什么

```
ls [文件路径]       # 列出文件
ls -l [文件路径]    # 以列表形式展示详细信息（权限、大小、时间）
ls -a [文件路径]    # 显示所有文件
ls -lh [文件路径]   # 以列表形式展示详细信息（带单位）
```

## 3. 切换目录

```
cd [文件路径]    # 进入
cd ..           # 返回上一级
cd ../..        # 返回上两级
cd ~            # 回到家目录
cd /            # 回到根目录
```

## 4. 创建 / 删除文件 / 文件夹

```
mkdir [-p] 文件夹名    # 创建文件夹 [创建不存在的父目录]
touch 文件名           # 创建空文件
rm 文件名              # 删除文件
rm -r 文件夹名         # 删除文件夹
```

```
rm test* 删除以test开头的文件
rm *test 删除以test结尾的文件
rm *test* 删除包含test的文件
```
## 5. 复制 / 移动

```
cp [-r] 源文件 目标路径    # 复制文件/文件夹
mv 源文件 目标路径         # 移动/重命名
```

## 6. 查看文件内容

```
cat 文件名    # 直接显示全部
less 文件名   # 分页查看（上下键翻页，q退出）
head 文件名   # 看前10行
tail [-f -num] 文件名   # 跟踪查看后10行
```

## 7. 编辑文件

```
nano 文件名   # 最简单编辑器
```

- 编辑完：**Ctrl+O 保存，Ctrl+X 退出**

## 8.查找

```
which 要查找的命令    # 查找使用的命令
find 起始路径 -name "被查找文件名"  # 按文件名查找文件 可使用*模糊查找
find 起始路径 -size +|-n[KMG]     # 按文件大小查找文件
grep [-n] 关键字 文件路径 # 从文件中通过关键字过滤文件行
```

```
find / -size -10k # 查找小于10KB的文件
find / -size +1G  # 查找大于1GB的文件
grep -n "test" test.txt # 找到文件中包含text的行，并列出行号
```

## 9.统计

```
wc [-c -m -l -w] 文件路径 # 统计文件的行数、单词数量等
-c 统计字节数
-m 统计字符数
-l 统计行数
-w 统计单词数
```

## 10. 清屏

```
clear
```

## 11.管道符 |

```
cat test.txt | grep test  # 管道符|将左侧命令的返回结果作为右侧命令的输入
```

## 12.命令行输出

```
echo 输出的内容  # 在命令行内输出指定内容(类似print)
echo `pwd`     # ``将其中内容作为命令执行，然后输出结果
```

## 13.重定向符

```
echo "hello Linux" > test.txt  # >将左侧命令的结果覆盖写入右侧文件
echo "hello Linux" >> test.txt # >>将左侧命令的结果追加写入右侧文件
```

---
# 权限

```
# 权限信息(10位)
-表示文件 d表示文件夹 l表示软链接  r read w write x execute
		 所属用户权限    所属用户组权限  其他用户权限
-或d或l   r/- w/- x/-   r/- w/- x/-   r/- w/- x/-

数字表示
0:--- 1:--x 2:-w- 3:-wx 4:r-- 5:r-x 6:rw- 7:rwx
```

```
su - 用户名  # 切换用户
su - root   # 超级管理员
exit        # 退出
sudo 命令  # 临时root权限使用
```

```
# root下运行
groupadd 用户组名  # 创建用户组
groupdel 用户组名  # 删除用户组
useradd [-g -d] 用户名 # 创建用户 -g指定用户组 -d指定HOME目录
userdel [-r] 用户名 # 删除用户 -r同时删除HOME目录
id[用户名]  # 查看用户信息
usermod -aG 用户组 用户名  # 修改用户的用户组
getent passwd  # 查看系统中的所有用户
getent group  # 查看系统中的所有用户组
```

```
# 只有文件、文件夹的所属用户或root用户可修改权限
chmod [-R] 权限 文件或文件夹  # 修改权限 -R对文件夹内所有文件操作
chmod u=rwx,g=rx,o=x hello.txt  # 修改权限为drwxr-x--x
chmod 751 hello.txt  # 修改权限为drwxr-x--x

chown [-R] [用户] [:] [用户组] 文件或文件夹  # 修改所属用户、所属用户组
chown root hello.txtx  # 修改所属用户为root
chown root : test hello.txt # 修改所属用户为root所属用户组为test
```


---

# 安装软件（Ubuntu 专用）

```
sudo apt update
sudo apt install 软件名
```

```
sudo apt install gcc    # 安装C编译器
sudo apt install g++    # 安装C++编译器
```

---

# 关机 / 重启

```
sudo reboot     # 重启
sudo poweroff   # 关机
```

---

# 文件系统结构

- `/`：根目录
- `/home`：你的用户文件夹
- `/etc`：配置文件
- `/bin`、`/usr/bin`：命令、程序
- `/tmp`：临时文件

```
/user/local/hello.txt
```
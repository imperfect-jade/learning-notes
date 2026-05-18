# Git常用指令

```bash
# 配置用户名
git config --global user.name "你的用户名"

# 配置邮箱
git config --global user.email "你的邮箱地址"

# 查看配置信息
git config --list
```

```bash
# 查看文件状态（红色：未跟踪；绿色：已暂存）
git status

# 添加文件到暂存区
git add 文件名           # 添加单个文件
git add 文件夹/          # 添加整个文件夹
git add .               # 添加所有修改的文件

# 提交到本地仓库
git commit -m "提交说明"  # 提交时必须写说明
git commit -am "提交说明" # 将所有已经跟踪过的文件中的修改添加到暂存区，并执行一次提交，并允                            许你附带提交信息。

# 查看提交历史
git log                 # 详细日志
git log --oneline       # 简洁日志
git log --all           # 显示所有分支
git log --graph         # 图形化显示

# 回退到指定版本
git reset --hard 版本号    # 版本号可通过git log查看
git reflog                #查看以删除的版本记录

#删除文件
git rm 文件名

```


```bash
# 查看本地所有分支（当前分支前有*标记）
git branch

# 查看远程所有分支
git branch -r

# 查看本地和远程所有分支
git branch -a


# 创建新分支（基于当前分支）
git branch 分支名

# 示例：创建一个功能分支
git branch feature/payment
```


.gitignore 是 Git 中用于指定不需要纳入版本控制的文件或目录的配置文件。它能帮助你避免将临时文件、编译产物、敏感信息等不必要的内容提交到代码仓库。
1. 在仓库根目录创建 .gitignore 文件
2. 在文件中添加需要忽略的文件 / 目录规则
3. 将 .gitignore 本身提交到仓库

连接指令 ssh -T -i C:/dev/ssh_keys/gitee_key git@gitee.com
export GIT_SSH_COMMAND="ssh -i C:/dev/ssh_keys/gitee_key/id_ed25519"
<!-- learning-notes
course: Git 使用手册
textbook: 未指定
style: tool-docs
source_policy: references-section
last_updated: 2026-05-25
-->

# Git 使用手册

这份笔记按工具手册方式组织：先给常用场景，再给可复制的命令。执行会改历史或丢弃修改的命令前，先确认 `git status` 和 `git log --oneline --graph --decorate --all`。

## 一、常用流程速查

### 1. 新项目初始化

用途：把当前目录变成 Git 仓库。

```bash
git init
git status
git add .
git commit -m "init project"
```

使用指南：

- `git init` 会创建 `.git` 目录。
- 第一次提交前，先检查 `.gitignore`，避免提交缓存、密钥、编译产物。

### 2. 克隆远程仓库

用途：把 GitHub/Gitee/GitLab 上的仓库下载到本地。

```bash
git clone https://github.com/user/repo.git
cd repo
git status
```

指定目录名：

```bash
git clone https://github.com/user/repo.git my-project
```

### 3. 日常提交

用途：查看修改、暂存修改、提交到本地仓库。

```bash
git status
git diff
git add docs/git.md
git diff --cached
git commit -m "docs: update git manual"
```

使用指南：

- `git diff` 看工作区未暂存改动。
- `git diff --cached` 看即将提交的改动。
- 提交前确认 diff，能减少误提交。

### 4. 同步远程

用途：把远程更新拉下来，把本地提交推上去。

```bash
git pull
git push
```

更稳的拆分写法：

```bash
git fetch origin
git status
git pull --ff-only
git push origin main
```

使用指南：

- `fetch` 只下载远程信息，不改当前工作区。
- `pull` 约等于 `fetch + merge`。
- `pull --ff-only` 只允许快进合并，能避免意外生成 merge commit。

## 二、配置

### 1. 用户信息

用途：设置提交记录里的作者名称和邮箱。

```bash
git config --global user.name "你的用户名"
git config --global user.email "你的邮箱地址"
```

查看配置：

```bash
git config --list
git config user.name
git config user.email
```

### 2. 默认分支名

用途：让新仓库默认使用 `main`。

```bash
git config --global init.defaultBranch main
```

### 3. 换行符处理

用途：减少 Windows 和 Linux/macOS 协作时的换行符差异。

```bash
# Windows 常用
git config --global core.autocrlf true

# Linux/macOS 常用
git config --global core.autocrlf input
```

### 4. 常用别名

用途：缩短高频命令。

```bash
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.cm commit
git config --global alias.lg "log --oneline --graph --decorate --all"
```

使用示例：

```bash
git st
git lg
```

## 三、工作区、暂存区、提交

### 1. 查看状态

用途：确认哪些文件未跟踪、已修改、已暂存。

```bash
git status
git status --short
```

状态含义：

| 标记 | 含义 |
|---|---|
| `??` | 未跟踪文件 |
| `M` | 已修改 |
| `A` | 新增 |
| `D` | 删除 |

### 2. 查看差异

用途：确认具体改了什么。

```bash
git diff
git diff 文件名
git diff --cached
git diff HEAD
```

使用指南：

- `git diff`：工作区 vs 暂存区。
- `git diff --cached`：暂存区 vs 最新提交。
- `git diff HEAD`：工作区整体 vs 最新提交。

### 3. 添加到暂存区

用途：选择本次提交包含哪些修改。

```bash
git add 文件名
git add 文件夹/
git add .
git add -A
```

交互式选择部分修改：

```bash
git add -p
```

使用指南：

- `git add .` 添加当前目录下的修改。
- `git add -A` 添加整个仓库的新增、修改、删除。
- `git add -p` 适合把同一个文件里的多组修改拆成不同提交。

### 4. 从暂存区移出

用途：取消暂存，但保留工作区修改。

```bash
git restore --staged 文件名
git restore --staged .
```

旧写法：

```bash
git reset HEAD 文件名
```

### 5. 提交

用途：把暂存区内容保存为一个版本。

```bash
git commit -m "提交说明"
```

修改最近一次提交说明或补充暂存内容：

```bash
git add 漏掉的文件
git commit --amend
```

使用指南：

- `--amend` 会改写最近一次提交，不要随便改已经推送且被别人基于开发的提交。
- 提交说明建议写清“做了什么”，例如 `docs: update git manual`。

### 6. 快速提交已跟踪文件

用途：跳过 `git add`，直接提交已经被 Git 跟踪的修改。

```bash
git commit -am "fix: update config"
```

注意：

- `-a` 不会添加新文件。
- 新文件仍需先执行 `git add 新文件`。

## 四、查看历史

### 1. 提交日志

用途：查看提交历史。

```bash
git log
git log --oneline
git log --oneline --graph --decorate --all
```

按文件查看历史：

```bash
git log -- docs/systems-tools/git.md
```

### 2. 查看某次提交

用途：查看指定提交的元信息和 diff。

```bash
git show 提交哈希
git show --stat 提交哈希
git show --name-only 提交哈希
```

### 3. 查看文件每行来源

用途：排查某一行是谁、在哪次提交中修改的。

```bash
git blame 文件名
git blame -L 10,30 文件名
```

### 4. 搜索历史

用途：查找提交说明或内容中包含关键字的历史。

```bash
git log --grep="keyword"
git log -S "函数名"
git log -G "正则表达式"
```

## 五、分支

### 1. 查看分支

用途：确认当前分支和已有分支。

```bash
git branch
git branch -r
git branch -a
```

### 2. 创建分支

用途：从当前提交创建独立开发线。

```bash
git branch feature/login
git switch feature/login
```

创建并切换：

```bash
git switch -c feature/login
```

旧写法：

```bash
git checkout -b feature/login
```

### 3. 切换分支

用途：在不同开发线之间切换。

```bash
git switch main
git switch feature/login
```

使用指南：

- 切换前先执行 `git status`。
- 若有未提交修改，Git 可能阻止切换，或把修改带到目标分支。

### 4. 重命名分支

用途：修正本地分支名。

```bash
git branch -m old-name new-name
```

重命名当前分支：

```bash
git branch -m new-name
```

### 5. 删除分支

用途：清理已合并或不再需要的分支。

```bash
git branch -d feature/login
git branch -D feature/login
```

使用指南：

- `-d` 只删除已合并分支。
- `-D` 强制删除，可能丢失未合并提交。

## 六、合并与变基

### 1. 合并分支

用途：把一个分支的修改合入当前分支。

```bash
git switch main
git merge feature/login
```

使用指南：

- 合并前确认自己在目标分支。
- 合并后运行测试或构建。

### 2. 快进合并

用途：当前分支没有新提交时，直接移动分支指针。

```bash
git merge --ff-only feature/login
```

### 3. 变基 rebase

用途：把当前分支的提交“搬到”目标分支最新提交之后，让历史更线性。

```bash
git switch feature/login
git fetch origin
git rebase origin/main
```

使用指南：

- rebase 会改写提交哈希。
- 不要随便 rebase 已经公开给别人协作的分支。

### 4. 解决冲突

用途：手动处理两个分支改到同一位置的冲突。

```bash
git status
# 编辑冲突文件，删除 <<<<<<< ======= >>>>>>> 标记
git add 冲突文件
git merge --continue
```

rebase 冲突继续：

```bash
git add 冲突文件
git rebase --continue
```

放弃当前合并或变基：

```bash
git merge --abort
git rebase --abort
```

## 七、远程仓库

### 1. 查看远程地址

用途：确认本地仓库连接到哪里。

```bash
git remote -v
```

### 2. 添加远程仓库

用途：把本地仓库连接到远程仓库。

```bash
git remote add origin https://github.com/user/repo.git
```

修改远程地址：

```bash
git remote set-url origin https://github.com/user/repo.git
```

### 3. 拉取远程信息

用途：更新远程分支引用，不改工作区。

```bash
git fetch origin
git branch -r
```

### 4. 拉取并合并

用途：获取远程更新并合入当前分支。

```bash
git pull origin main
git pull --ff-only origin main
```

### 5. 推送分支

用途：把本地提交上传到远程。

```bash
git push origin main
```

首次推送新分支并建立上游关系：

```bash
git push -u origin feature/login
```

之后可简写：

```bash
git push
git pull
```

### 6. 删除远程分支

用途：清理远程上的旧分支。

```bash
git push origin --delete feature/login
```

清理本地已失效的远程分支引用：

```bash
git fetch --prune
```

## 八、撤销、回退与恢复

!!! warning "先确认再执行"
    `reset --hard`、`clean -fd`、强制推送等命令可能丢失本地修改或改写远程历史。执行前先看 `git status`、`git log` 和 `git reflog`。

### 1. 丢弃工作区某个文件的修改

用途：恢复文件到最新提交状态。

```bash
git restore 文件名
```

恢复全部工作区修改：

```bash
git restore .
```

### 2. 恢复已删除文件

用途：把误删文件从最新提交中恢复出来。

```bash
git restore 文件名
```

从指定提交恢复：

```bash
git restore --source=提交哈希 -- 文件名
```

### 3. 回退提交但保留修改

用途：撤销最近提交，让修改回到暂存区或工作区。

```bash
# 撤销提交，保留暂存状态
git reset --soft HEAD~1

# 撤销提交，保留工作区修改但取消暂存
git reset --mixed HEAD~1
```

### 4. 强制回退到指定提交

用途：让当前分支完全回到某个版本。

```bash
git reset --hard 提交哈希
```

使用指南：

- 会丢弃该提交之后的本地提交和工作区修改。
- 如果只是撤销已经推送的提交，优先考虑 `git revert`。

### 5. 用新提交反向撤销

用途：安全撤销一个已发布提交。

```bash
git revert 提交哈希
```

使用指南：

- `revert` 不改写历史，会创建一个新的反向提交。
- 适合团队协作和已经推送到远程的提交。

### 6. 找回误删提交

用途：用 reflog 找回分支曾经指向过的提交。

```bash
git reflog
git switch -c rescue 提交哈希
```

### 7. 删除未跟踪文件

用途：清理未被 Git 跟踪的临时文件。

```bash
git clean -n
git clean -fd
```

使用指南：

- `-n` 预览将删除哪些文件。
- 确认无误后再执行 `-fd`。

## 九、暂存当前工作 stash

### 1. 保存临时修改

用途：临时切分支或拉取更新，但当前修改还不想提交。

```bash
git stash push -m "work in progress"
```

包含未跟踪文件：

```bash
git stash push -u -m "include untracked files"
```

### 2. 查看 stash

用途：查看保存过的临时修改。

```bash
git stash list
git stash show stash@{0}
git stash show -p stash@{0}
```

### 3. 恢复 stash

用途：把临时修改应用回来。

```bash
git stash apply stash@{0}
git stash pop stash@{0}
```

使用指南：

- `apply` 应用后保留 stash。
- `pop` 应用后删除 stash。

### 4. 删除 stash

```bash
git stash drop stash@{0}
git stash clear
```

## 十、标签 tag

### 1. 查看标签

用途：查看版本号或发布点。

```bash
git tag
git tag --list "v1.*"
```

### 2. 创建标签

用途：标记一个稳定版本。

```bash
git tag v1.0.0
git tag -a v1.0.0 -m "release v1.0.0"
```

### 3. 推送标签

```bash
git push origin v1.0.0
git push origin --tags
```

### 4. 删除标签

```bash
git tag -d v1.0.0
git push origin --delete v1.0.0
```

## 十一、.gitignore

### 1. 基本用法

用途：指定不需要纳入版本控制的文件或目录。

```gitignore
# Python
__pycache__/
*.py[cod]
.venv/

# Editor
.vscode/
.idea/

# Build output
dist/
build/
site/

# Secrets
.env
*.pem
```

使用步骤：

```bash
# 在仓库根目录创建 .gitignore
git add .gitignore
git commit -m "chore: add gitignore"
```

### 2. 忽略已经被跟踪的文件

用途：文件已经提交过，仅写入 `.gitignore` 不会停止跟踪。

```bash
git rm --cached 文件名
git commit -m "chore: stop tracking generated file"
```

目录写法：

```bash
git rm -r --cached site/
```

## 十二、协作流程

### 1. 功能分支流程

用途：多人协作时隔离开发内容。

```bash
git switch main
git pull --ff-only origin main
git switch -c feature/git-notes

# 修改文件
git status
git add .
git commit -m "docs: update git notes"
git push -u origin feature/git-notes
```

使用指南：

- 一个分支只做一个主题。
- 提交前运行项目检查，例如测试、格式化或站点构建。
- 合并前让分支基于最新 `main`。

### 2. 更新功能分支

用途：把主分支最新修改同步到当前功能分支。

```bash
git fetch origin
git switch feature/git-notes
git rebase origin/main
```

如果团队不使用 rebase：

```bash
git merge origin/main
```

### 3. 合并后清理分支

```bash
git switch main
git pull --ff-only origin main
git branch -d feature/git-notes
git fetch --prune
```

## 十三、提交信息

### 1. 推荐格式

用途：让历史可读，方便回溯。

```text
type: summary
```

常见类型：

| 类型 | 用途 |
|---|---|
| `feat` | 新功能 |
| `fix` | 修复问题 |
| `docs` | 文档 |
| `style` | 格式，不影响逻辑 |
| `refactor` | 重构 |
| `test` | 测试 |
| `chore` | 构建、依赖、杂项 |

示例：

```bash
git commit -m "docs: update git usage guide"
git commit -m "fix: handle empty config file"
```

### 2. 好提交的标准

使用指南：

- 一次提交只做一件事。
- 提交说明使用祈使句或简洁动作描述。
- 不把格式化、重构、功能修改混在一个提交里。

## 十四、排错速查

### 1. 当前分支不知道推到哪里

现象：`git push` 提示没有 upstream。

```bash
git push -u origin 当前分支名
```

### 2. pull 时出现分叉提示

现象：Git 要求选择 merge、rebase 或 fast-forward。

```bash
git pull --ff-only
```

或设置默认策略：

```bash
git config --global pull.ff only
```

### 3. 提交到了错误分支

用途：把最近提交移动到新分支。

```bash
git branch correct-branch
git reset --hard HEAD~1
git switch correct-branch
```

更安全的做法：先确认 `git log --oneline -3`，必要时用 `git reflog` 找回。

### 4. 忘记提交前拉取远程更新

用途：先下载远程，再整理本地提交。

```bash
git fetch origin
git rebase origin/main
```

若冲突：

```bash
git status
git add 冲突文件
git rebase --continue
```

### 5. 大文件误提交

用途：从最近一次提交中移除大文件但保留本地文件。

```bash
git rm --cached 大文件
git commit --amend
```

如果大文件已经推送到远程，清理历史会影响协作者，需要单独规划。

## 十五、命令速查表

| 场景 | 命令 |
|---|---|
| 查看状态 | `git status` |
| 查看简洁状态 | `git status --short` |
| 查看未暂存差异 | `git diff` |
| 查看已暂存差异 | `git diff --cached` |
| 添加文件 | `git add 文件名` |
| 交互式添加 | `git add -p` |
| 提交 | `git commit -m "message"` |
| 修改最近提交 | `git commit --amend` |
| 查看日志 | `git log --oneline --graph --decorate --all` |
| 创建并切换分支 | `git switch -c 分支名` |
| 切换分支 | `git switch 分支名` |
| 合并分支 | `git merge 分支名` |
| 变基到主分支 | `git rebase origin/main` |
| 下载远程信息 | `git fetch origin` |
| 拉取更新 | `git pull --ff-only` |
| 推送当前分支 | `git push` |
| 首次推送分支 | `git push -u origin 分支名` |
| 取消暂存 | `git restore --staged 文件名` |
| 丢弃工作区修改 | `git restore 文件名` |
| 安全撤销提交 | `git revert 提交哈希` |
| 强制回退 | `git reset --hard 提交哈希` |
| 临时保存修改 | `git stash push -m "说明"` |
| 恢复 stash | `git stash pop` |
| 查看历史位置 | `git reflog` |
| 删除未跟踪文件预览 | `git clean -n` |

## 参考资料

- Git 官方文档：<https://git-scm.com/docs>
- Pro Git Book：<https://git-scm.com/book>

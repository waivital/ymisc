# Snippets


### macOS 已经安装了 Xcode 还报错 'gyp: No Xcode or CLT version detected!'

[#macOS]()

可能之前用过 `xcode-select --install` 安装过 command line tools，之后又安装了完整版的 xcode

运行 `sudo xcodebuild -license accept` 会提示

```
xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance
```

可以用下面这个命令重置 default command line tools path

```bash
sudo xcode-select -r
```


### Manjaro 中如何用命令行更新系统

[#manjaro]()

```
 -u, --sysupgrade
    Upgrades all packages that are out-of-date.
    Pass this option twice to enable package downgrades
 -y, --refresh
    Passing two --refresh or -y flags will force a refresh of all package databases
```

```bash
# update whole system
sudo pacman -Syu
# update system and enable package downgrades
sudo pacman -Syyuu
```

### Fish Shell Installation on Macos

Install fish shell

```bash
brew install fish
```

Add homebrew env to fish shell

```fish
# Add this line to the top of ~/.config/fish/config.fish
eval (/opt/homebrew/bin/brew shellenv)
```


### git 恢复不小心丢失的修改

[#git]()

- 在使用了 git add 的情况下，并且丢失时间不是很久，理论上可以从 index objects 中恢复，首先使用 `git fsck --lost-found` 命令，将孤立的 objects 写入 `.git/lost-found/commit/` 或者 `.git/lost-found/other/` 中，再使用 `git show <hash>` 来检查相关文件的内容并且筛选需要的改动，下面是使用此方法的例子。

<details>
  <summary>点击查看例子</summary>

   ```bash
   # Demo 1 使用 git fsck --lost-found 恢复丢失的修改

   # 新建个用于测试的 git 项目
   mkdir demo-1
   cd demo-1
   git init
   echo 'demo string 1' > example.txt
   git add example.txt
   git commit -m "Initial Commit"

   # 添加改动, 添加一行到文件结尾
   echo 'some modification' >> example.txt
   # 查看状态
   git status

   # add 修改的文件
   git add example.txt

   # 模拟不小心 reset 了项目
   git reset --hard
   git status

   # 此时改动已经没有了，通过此方法恢复
   git fsck --lost-found

   # 会看到类似下面的输出
   #
   #   Checking object directories: 100% (256/256), done.
   #   dangling blob b2bbed52e6ff3c99c4934758389601e7837d8be9

   # 查看 lost-found 输出的目录，里面会有个 other 文件夹
   ls .git/lost-found/

   # 用 git show 或者 cat 查看并找回的文件内容，用对应的内容恢复文件即可
   git show b2bbed52e6ff3c99c4934758389601e7837d8be9
   cat .git/lost-found/other/b2bbed52e6ff3c99c4934758389601e7837d8be9
   ```
</details>

- 在使用了 git stash pop 后，因为各种操作丢失了这个 stash 的内容。这种情况下，上次 stash 的内容可能还没被清理掉，如果知道这次 stash 的 hash 的话（一种方法是搜索命令行历史记录 Dropped refs/stash@{0} (...hash...) 来找到这次 drop 的 hash），可以使用 `git stash apply <hash>` 来恢复内容。

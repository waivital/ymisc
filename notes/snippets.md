# NOTES


### macOS 已经安装了 Xcode 还报错 'gyp: No Xcode or CLT version detected!'

可能之前用过 `xcode-select --install` 安装过 command line tools，之后又安装了完整版的 xcode

运行 `sudo xcodebuild -license accept` 会提示

```
xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '/Library/Developer/CommandLineTools' is a command line tools instance
```

可以用下面这个命令重置 default command line tools path

```bash
sudo xcode-select -r
```

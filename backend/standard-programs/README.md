# 标准程序目录

此目录用于存放各个PA的标准程序。

## 目录结构

```
standard-programs/
├── PA1/
│   ├── problem1     (或 problem1.exe)
│   └── problem2     (或 problem2.exe)
├── PA2/
│   ├── problem1
│   ├── problem2
│   └── problem3
├── PA3/
│   ├── problem1
│   ├── problem2
│   └── problem3
└── PA4/
    ├── problem1
    ├── problem2
    └── problem3
```

## 使用说明

1. 将每道题的标准程序编译后放入对应的目录
2. 文件名格式为 `problem{题号}` (Linux/Mac) 或 `problem{题号}.exe` (Windows)
3. 确保标准程序有执行权限 (Linux/Mac: `chmod +x problem1`)

## 注意事项

- 标准程序必须能够从标准输入读取数据,并将结果输出到标准输出
- 程序应该具有确定性输出(相同输入总是产生相同输出)
- 建议在放置标准程序前先测试其正确性

# 3.2.2 简单函数的应用
## 练习3.9
在1.2.1节，我们用代换模型分析了两个计算阶乘的函数。一个递归版本：
```javascript
function factorial(n) {
    return n === 1 ? 1 : n * factorial(n - 1);
}
```
和一个迭代版本：
```javascript
function factorial(n) {
    return fact_iter(1, 1, n);
}
function fact_iter(product, counter, max_count) {
    return counter > max_count
           ? product
           : fact_iter(counter * product, 
                       counter + 1, 
                       max_count);
}
```
请分别描绘对函数factorial的这两个版本求值factorial(6)时创建的环境结构。

## 解答
#### 递归版本的环境结构

递归版本的`factorial`函数在每次调用时都会创建一个新的环境，并且这些环境会一直保留，直到递归调用完全结束。这是因为递归调用需要保存每次调用的上下文信息，以便在返回时使用。

调用`factorial(6)`时，环境结构如下：

1. 程序环境 (Program Environment)：
    * 存储`factorial`函数的代码及其指向的环境。
    * 这是所有调用的基础环境。

2. 递归调用创建的环境：
    * 每次递归调用都会创建一个新环境，绑定参数`n`的值。
    * 这些环境形成一个链条，从`factorial(6)`到 `factorial(1)`。

具体环境结构：
```
[Program Environment]
  └── [factorial(6)] n = 6
        └── [factorial(5)] n = 5
              └── [factorial(4)] n = 4
                    └── [factorial(3)] n = 3
                          └── [factorial(2)] n = 2
                                └── [factorial(1)] n = 1

```
说明：

* 每个环境保存了当前调用的参数`n`的值。
* 每个环境都指向其外层环境，最终指向程序环境。
* 只有当递归调用完全结束时，所有环境才会被销毁。

#### 迭代版本的环境结构

迭代版本使用尾递归优化，因此在每次调用时，不会保留旧的调用环境，而是直接销毁旧环境并重用当前环境。这使得迭代版本可以在常量空间内完成计算。

调用`factorial(6)`时，环境结构如下：

1. 程序环境 (Program Environment)：
    * 存储`factorial`和`fact_iter`函数的代码及其指向的环境。
    * 这是所有调用的基础环境。

2. 迭代调用创建的环境：
    * 每次调用`fact_iter`都会创建一个新环境，但由于尾递归优化，旧环境会被销毁。
    * 最终只有一个环境被保留。

具体环境结构：
```
[Program Environment]
  └── [factorial(6)] n = 6
        └── [fact_iter] product = 1, counter = 1, max_count = 6
更新环境：
[Program Environment]
  └── [factorial(6)] n = 6
        └── [fact_iter] product = 1, counter = 2, max_count = 6
更新环境：
[Program Environment]
  └── [factorial(6)] n = 6
        └── [fact_iter] product = 2, counter = 3, max_count = 6
更新环境：
[Program Environment]
  └── [factorial(6)] n = 6
        └── [fact_iter] product = 6, counter = 4, max_count = 6
更新环境：
[Program Environment]
  └── [factorial(6)] n = 6
        └── [fact_iter] product = 24, counter = 5, max_count = 6
更新环境：
[Program Environment]
  └── [factorial(6)] n = 6
        └── [fact_iter] product = 120, counter = 6, max_count = 6
```
最终的环境结构为：
```
[Program Environment]
  └── [factorial(6)] n = 6
        └── [fact_iter] product = 720, counter = 7, max_count = 6
```
说明：

* 每次调用`fact_iter`都会更新环境中的参数`product`和 `counter`的值。
* 由于尾递归优化，旧的调用环境会被销毁，因此不会形成环境链条。
* 只有最后一次调用的环境被保留，用于返回最终结果。

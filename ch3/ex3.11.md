# 3.2.4 内部定义
## 练习3.11
在3.2.3节里，我们看到环境模型如何描述带有局部状态的函数的行为，现在我们又看到了局部定义如何工作。一个典型的消息传递函数同时包含这两个方面。现在考虑3.1.1节的银行账户函数：
```javascript
function make_account(balance) {
    function withdraw(amount) {
        if (balance >= amount) {
            balance = balance - amount;
            return balance;
        } else {
            return "Insufficient funds";
        }
    }
    function deposit(amount) {
        balance = balance + amount;
        return balance;  
    }
    function dispatch(m) {
        return m === "withdraw"
               ? withdraw
               : m === "deposit"
               ? deposit
               : error(m, "Unknown request: make_account");
    }
    return dispatch;
}
```
请描绘下面交互序列生成的环境结构：
```javascript
const acc = make_account(50);

acc("deposit")(40);

90

acc("withdraw")(60);

30
```
acc的局部状态保存在哪里？假定我们定义了另一个账户：
```javascript
const acc2 = make_account(100);
```
这两个账户的局部状态如何保持不同？环境结构中的哪些部分被acc和acc2共享？

## 解答
#### 交互序列分析

以下是交互序列的环境模型分析：
###### 第一步：创建账户 acc

执行`const acc = make_account(50)`时：

1. 创建了一个新的环境**E1**，用于存储`make_account`的局部变量和函数：
    * `balance`被绑定到初始值`50`。
    * `withdraw`、`deposit` 和 `dispatch` 被绑定为函数对象。
2. 返回的闭包是`dispatch`，它引用环境**E1**。
3. `acc`是一个函数对象，包含代码`dispatch(m)`和环境**E1**。

环境结构图：
```
[Program Env]
    └── make_account
    └── acc → [Env E1]
                ├── balance = 50
                ├── withdraw → function object (Env E1)
                ├── deposit → function object (Env E1)
                └── dispatch → function object (Env E1)
```

###### 第二步：调用 acc("deposit")(40)

执行`acc("deposit")(40)`时：

1. 调用`dispatch("deposit")`：
    * 创建了一个新的环境**E2**，其中`m`被绑定到`"deposit"`。
    * 在环境**E1**中找到并返回`deposit`函数。
2. 调用`deposit(40)`：
    * 创建了一个新的环境**E3**，其中`amount`被绑定到`40`。
    * `deposit`的代码在环境**E1**中执行，更新**E1**中的`balance`值为`90`。

环境结构图：
```
[Program Env]
    └── make_account
    └── acc → [Env E1]
                ├── balance = 90
                ├── withdraw → function object (Env E1)
                ├── deposit → function object (Env E1)
                └── dispatch → function object (Env E1)
        └── [Env E2]
                ├── m = "deposit"
        └── [Env E3]
                ├── amount = 40
```

###### 第三步：调用 acc("withdraw")(60)

执行`acc("withdraw")(60)`时：

1. 调用`dispatch("withdraw")`：
    * 创建了一个新的环境**E4**，其中`m`被绑定到`"withdraw"`。
    * 在环境**E1**中找到并返回`withdraw`函数。
2. 调用`withdraw(60)`：
    * 创建了一个新的环境**E5**，其中`amount`被绑定到`60`。
    * `withdraw`的代码在环境**E1**中执行，更新**E1**中的`balance`值为`30`。

环境结构图：
```
[Program Env]
    └── make_account
    └── acc → [Env E1]
                ├── balance = 30
                ├── withdraw → function object (Env E1)
                ├── deposit → function object (Env E1)
                └── dispatch → function object (Env E1)
        └── [Env E4]
                ├── m = "withdraw"
        └── [Env E5]
                ├── amount = 60
```

###### 第四步：创建账户 acc2

执行`const acc2 = make_account(100)`时：

1. 创建了一个新的环境**E6**，用于存储`make_account`的局部变量和函数：
    * `balance`被绑定到初始值`100`。
    * `withdraw`、`deposit` 和 `dispatch` 被绑定为函数对象。
2. 返回的闭包是`dispatch`，它引用环境**E6**。
3. `acc2`是一个函数对象，包含代码`dispatch(m)`和环境**E6**。

环境结构图：
```
[Program Env]
    └── make_account
    ├── acc → [Env E1]
                ├── balance = 30
                ├── withdraw → function object (Env E1)
                ├── deposit → function object (Env E1)
                └── dispatch → function object (Env E1)
    └── acc2 → [Env E6]
                ├── balance = 100
                ├── withdraw → function object (Env E6)
                ├── deposit → function object (Env E6)
                └── dispatch → function object (Env E6)
```

#### 问题解答

1. 局部状态保存位置：
    * `acc` 的局部状态`balance`保存在环境 E1 中。
    * `acc2` 的局部状态`balance`保存在环境 E6 中。

2. 两个账户的局部状态如何保持独立：
    * 每次调用`make_account`都会创建一个新的环境，用于存储该账户的局部变量`balance`和函数对象。`acc` 和 `acc2` 分别引用不同的环境（**E1** 和 **E6**），因此它们的状态互不干扰。

3. 共享的部分：
    * `make_account`的代码和函数定义（`withdraw`、`deposit` 和 `dispatch` 的代码）在所有账户间是共享的。
    * 每个账户的函数对象都指向相同的代码，但它们绑定到不同的环境（**E1** 和 **E6**）。


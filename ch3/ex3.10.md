# 3.2.3 框架作为局部状态的仓库
## 练习3.10
在函数make_withdraw里，balance是作为函数参数创建的局部变量。我们也可以用下面可称为立即调用lambda表达式的方式，独立创建一个局部状态变量：
```javascript
function make_withdraw(initial_amount) {
    return (balance => 
              amount => {
                  if (balance >= amount) {
                      balance = balance - amount;
                      return balance;
                   } else {
                      return "insufficient funds";
                   }
              })(initial_amount);
}
```
外层的lambda表达式在求值后被立即调用，其作用就是创建局部变量balance并将其初始化为init_amount的值。请用环境模型分析make_withdraw的这个不同版本，画出类似上面形式的环境结构图，展示下面代码执行时的情况：
```javascript
const W1 = make_withdraw(100);

W1(50);
	
const W2 = make_withdraw(100);
```
请说明make_withdraw的这两个版本创建的对象具有相同的行为。这两个函数版本生成的环境结构有什么不同吗？

## 解答

#### 环境结构分析
###### 第一步：创建 W1

执行`const W1 = make_withdraw(100)`时：

* 创建了一个新的环境**E1**，其中`balance`被绑定到初始值`100`。
* 返回的闭包引用**E1**，闭包的代码是`amount => { ... }`。
* **W1** 是一个函数对象，包含代码和环境 **E1**。

###### 第二步：调用 W1(50)

执行`W1(50)`时：

* 创建了一个新的环境 **E2**，其中`amount`被绑定到`50`。
* **E2** 的外部环境是 **E1**，因此代码可以访问 **E1** 中的`balance`。
* 执行减法操作后，更新 **E1** 中的`balance`值为`50`。

###### 第三步：创建 W2

执行`const W2 = make_withdraw(100)`时：

* 创建了一个新的环境 **E3**，其中`balance`被绑定到初始值`100`。
* 返回的闭包引用 **E3**，闭包的代码是`amount => { ... }`。
* **W2** 是一个函数对象，包含代码和环境 **E3**。

#### 环境结构图

###### 创建 W1：
```
[Program Env]
    └── make_withdraw
    └── W1 → [Env E1]
                ├── balance = 100
                └── [Closure: amount => { ... }]
```
###### 调用 W1(50)：
```
[Program Env]
    └── make_withdraw
    └── W1 → [Env E1]
                ├── balance = 50
                └── [Closure: amount => { ... }]
    └── [Env E2]
            ├── amount = 50
            └── [Body Execution]
```
###### 创建 W2：
```
[Program Env]
    └── make_withdraw
    └── W2 → [Env E3]
                ├── balance = 100
                └── [Closure: amount => { ... }]
```

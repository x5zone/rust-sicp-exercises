# 3.3.1 可变的表结构
## 练习3.20
请画出环境图，展示下面一系列语句的求值过程：
```javascript
const x = pair(1, 2);
const z = pair(x, x);
set_head(tail(z), 17); 

head(x); 

//17
```
其中使用上面给出的序对的函数实现。​（请与练习3.11比较。​）

## 解答

#### 环境图

因较为繁琐，仅给出最终结果环境图。
```
[Program Env]
    ├── x → [Pair Obj]
            ├── head: 17
            └── tail: 2
    ├── z → [Pair Obj]
            ├── head: [Pair Obj] (x)
            └── tail: [Pair Obj] (x)
```

#### 与练习 3.11 的对比

* 练习 3.11 主要关注的是函数的局部状态如何通过闭包保存在环境中。
* 练习 3.20 主要关注的是序对的共享子结构和可变状态如何影响整个环境。

在练习 3.20 中，序对的共享子结构导致对一个变量的修改会影响到其他引用该变量的地方。这种行为在环境模型中通过共享的对象引用来体现
。

#### 代码实现
```rust
use sicp_rs::prelude::*;

fn main() {
    let x =  pair!(1,2);
    let z = pair!(x.clone(),x.clone()); // clone增加了Rc的引用计数
    z.tail().set_head(17.to_listv());

    println!("{}", z); // ((17, 2), (17, 2))
}
```
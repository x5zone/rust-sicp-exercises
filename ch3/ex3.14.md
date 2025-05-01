# 3.3.1 可变的表结构
## 练习3.14
下面这个函数相当有用，但也有些费解：
```javascript
function mystery(x) {
    function loop(x, y) {
        if (is_null(x)) {
            return y;
        } else {
            const temp = tail(x);
            set_tail(x, y);
            return loop(temp, x);
        }
    }
    return loop(x, null);
}
```
函数loop里用一个“临时”变量temp保存x的tail的原值，因为下一行的set_tail将破坏这个tail。请一般性地解释mystery做些什么。假定v由下面声明得到：
```javascript
const v = list("a", "b", "c", "d");
```
请画出v约束的表的盒子指针图。假定现在求值
```javascript
const w = mystery(v);
```
请画出求值这个程序后结构v和w的盒子指针图。打印v和w的值会得到什么？

## 解答
#### 一般性解释 mystery 函数的作用：

* `mystery`函数的作用：将链表`v`的元素顺序反转。
* 实现方式：
    * `mystery`使用了一个辅助函数`loop`来递归遍历链表，并逐步将每个节点的`tail`指向前一个节点。
    * 最终返回反转后的链表的头节点。

#### 盒子指针图：
调用前：

链表`v`的结构如下：
```
v: a -> b -> c -> d -> null
```
调用后：

链表`v`和`w`的结构如下：
```
v: a -> null
w: d -> c -> b -> a -> null
```
#### rust代码如下：
```rust
use sicp_rs::prelude::*;
fn mystery(x: List) -> List {
    fn loopf(x: List, y: List) -> List {
        if x.is_empty() {
            y
        } else {
            let temp = x.tail();
            x.set_tail(y);
            loopf(temp, x)
        }
    }
    loopf(x, List::Nil)
}
fn main() {
    let v = list![1, 2, 3, 4];
    let w = mystery(v.clone());
    println!("v: {}\nw: {}", v, w);
    // v: (1, Nil)
    // w: (4, (3, (2, (1, Nil))))
}
```
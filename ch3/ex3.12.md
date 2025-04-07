# 3.3.1 可变的表结构
## 练习3.12
下面是2.2.1节介绍过的表拼接函数：
```javascript
function append(x, y) {
    return is_null(x)
           ? y
           : pair(head(x), append(tail(x), y));
}
```
append通过顺序地把x的元素加到y前面的方法构造新表。函数append_mutator与append类似，但它是一个变动函数而不是构造函数。它做表拼接的方法是把两个表粘到一起，也就是修改x最后的序对，使其tail变成y（对空的x调用append_mutator是错误的）​。
```javascript
function append_mutator(x, y) {
    set_tail(last_pair(x), y);
    return x;
}
```
这里的函数last_pair返回其参数的最后一个序对：
```javascript
function last_pair(x) {
    return is_null(tail(x))
           ? x
           : last_pair(tail(x));
}
```
考虑下面的交互
```javascript
const x = list("a", "b"); 

const y = list("c", "d"); 

const z = append(x, y); 

z; 
// ["a", ["b", ["c", ["d", null]]]]

tail(x); 
// response

const w = append_mutator(x, y);

w;
// ["a", ["b", ["c", ["d", null]]]]

tail(x);
// response
```
上面空缺的两个response是什么？请画出相应的盒子指针图来解释你的回答。

## 解答
完整的rust代码如下所示：
```rust
use sicp_rs::prelude::*;

fn main() {
    let x = list![1, 2];
    let y = list![3, 4];
    let z = x.append(&y);
    println!("{}", z);
    println!("{}", x.tail()); // response

    x.last_pair().set_tail(y.clone());

    println!("{}", x.tail()); // response
}
// (1, (2, (3, (4, Nil))))
// (2, Nil)
// (2, (3, (4, Nil)))
```
盒子指针图绘图较为繁琐，此处省略。
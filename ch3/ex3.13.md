# 3.3.1 可变的表结构
## 练习3.13
考虑下面的make_cycle函数，其中用到练习3.12定义的last_pair函数：
```javascript
function make_cycle(x) {
    set_tail(last_pair(x), x);
    return x;
}
```
请画出盒子指针图，说明下面声明创建的z的结构：
```javascript
const z = make_cycle(list("a", "b", "c"));
```
如果我们尝试去计算last_pair(z)，会出现什么情况？

## 解答
#### 1. 盒子指针图：
调用`make_cycle(list("a", "b", "c"))` 时，链表 `z` 的结构变成了一个循环链表，如下图所示：
```
a -> b -> c
^         |
|---------|
```

* `last_pair(x)`修改了链表最后一个节点的`tail`，使其指向链表的头部，从而形成循环。
* 这意味着链表没有明确的结尾。
#### 2. 计算 last_pair(z) 的行为：

* 调用`last_pair(z)`会导致无限递归，因为`last_pair`的实现会不断沿着`tail`遍历链表，而循环链表的尾部永远指向链表的头部，进而导致panic。

#### 3. rust示意代码：

* 使用`Rc`实现循环列表：
    * 如果直接使用`Rc`来实现循环列表，会导致内存泄露问题。因为`Rc`的引用计数`(strong_count)`永远不会降为`0`，从而导致内存无法被释放。
    * **Warning:** 本`sicp_rs crate`使用`Rc`来实现`List`结构，如果使用`List`实现循环列表，则会出现内存泄露。

* 尝试使用`Weak`修复循环列表：
    * 如果使用`Weak`来避免循环引用的问题，虽然可以解决内存泄露，但由于`Weak`的引用计数不计入强引用，可能会导致数据丢失（无法升级为 Rc，数据不可用）。

```rust
use sicp_rs::prelude::*;

fn make_cycle(x: List) -> List {
    x.last_pair().set_tail(x.clone());
    x
}
fn main() {
    let x = list![1, 2, 3];
    let y = make_cycle(x.clone());

    let mut z = y.clone();
    for _ in 0..10 {
        print!("{} ", z.head());
        z = z.tail();
    }
    println!();
    // y.last_pair(); // will panic
    test();
}
// 1 2 3 1 2 3 1 2 3 1
use std::cell::RefCell;
use std::rc::{Rc, Weak};

#[derive(Debug)]
pub enum NewList {
    Cons(Rc<RefCell<i32>>, Weak<RefCell<i32>>),
    Nil,
}

fn create_cons() -> NewList {
    let node1 = Rc::new(RefCell::new(1));
    let node2 = Rc::new(RefCell::new(2));

    let cons = NewList::Cons(node1.clone(), Rc::downgrade(&node2));

    println!("Inside create_cons:");
    println!(
        "node1 strong_count: {} (held by node1 & cons)",
        Rc::strong_count(&node1)
    );
    println!(
        "node2 strong_count: {} (held by node2)",
        Rc::strong_count(&node2)
    );
    println!(
        "node2 weak_count: {} (held by cons)",
        Rc::weak_count(&node2)
    );

    cons
}

fn test() {
    let cons = create_cons(); 

    println!("\nInside test:");
    match &cons {
        NewList::Cons(node1, node2) => {
            println!(
                "node1 strong_count: {} (held by cons)",
                Rc::strong_count(&node1)
            );
            println!(
                "node2 value: {:?} upgrade: {:?} weak_count: {}",
                node2,
                node2.upgrade(),
                node2.weak_count()
            );
        }
        NewList::Nil => println!("Cons is Nil"),
    }
}
// Inside create_cons:
// node1 strong_count: 2 (held by node1 & cons)
// node2 strong_count: 1 (held by node2)
// node2 weak_count: 1 (held by cons)

// Inside test:
// node1 strong_count: 1 (held by cons)
// node2 value: (Weak) upgrade: None weak_count: 0
```
# 3.3.1 可变的表结构
## 练习3.18
请写一个函数，它检查一个表，确定其中是否有环路。而所谓的有环路，也就是说，如果一个程序打算通过不断做tail去找到这个表的尾，就会陷入无穷循环。练习3.13构造了这种表。

## 解答

相比习题的简单要求，本解答构建了更复杂的链表结构，分为以下三种情况进行测试：

1. 共享子结构，不包含环路：
    * 表的某些部分共享子结构，但整体没有环路。
    * 可以直接打印链表，打印结果有限且不会栈溢出。
2. 环路包含在 `tail` 中：
    * 表是普通单链表结构，但其 `tail` 指向之前的某个节点，形成环路。
    * 直接打印链表会陷入无限循环。
3. 环路包含在 `head` 中：
    * 表是复杂链表结构，或者说是图结构，`head` 中存在环路。
    * 按照传统c语言的双向链表而言，相邻节点的尾指针和头指针应该是对称的，此结构应该是不合法的，但是对于sicp中，却又显得并不突兀。
    * 直接打印链表会陷入无限循环。

#### 判断是否包含环路的思路：

最简单的方法是尝试打印链表，观察是否栈溢出（无限循环）。在本解答中，我们实现了一个函数 `has_cycle`，通过记录访问过的节点来检测环路。

#### 代码实现
```rust
use std::collections::HashSet;

use sicp_rs::prelude::*;

fn has_cycle(x: List) -> bool {
    fn iter(a: List, visited: &mut HashSet<u64>) -> bool {
        if a.is_pair() {
            // println!("a unique: {}", a.unique_id());
            // if a.head().is_value() {
            //     println!("a head value {}", a.head())
            // }
            // if a.tail().is_value() {
            //     println!("a tail value {}", a.tail())
            // }
            if visited.contains(&a.unique_id()) {
                return true;
            }
            visited.insert(a.unique_id());

            (
                // 若head也是pair，尝试遍历并查看是否会构成环路。
                // 为避免误判共享子结构，构建新的visited，并从此节点开始，若能重新回到该节点，即为有环。
                a.head().is_pair() && {
                    let mut new_visited = HashSet::new();
                    new_visited.insert(a.unique_id());
                    iter(a.head(), &mut new_visited)
                }
            ) || (a.tail().is_pair() && iter(a.tail(), visited))
            // 习题其实仅考察单链表，以下即为习题预期解答。
            // iter(a.tail(), visited)
        } else {
            false
        }
    }
    iter(x, &mut HashSet::new())
}

fn main() {
    let x = pair!["a", "b"];
    let y = pair![x.clone(), x.clone()];
    println!("shared substructure has_cycle(y): {}", has_cycle(y));
    let y = pair![x.clone(), pair![x.clone(), x.clone()]];
    println!("shared substructure has_cycle(y): {}", has_cycle(y));
    let y = pair![x.clone(), pair![x.clone(), pair![x.clone(), x.clone()]]];
    println!("shared substructure has_cycle(y): {}", has_cycle(y));
    let y = pair![
        x.clone(),
        pair![x.clone(), pair![x.clone(), pair![x.clone(), x.clone()]]]
    ];
    println!("shared substructure has_cycle(y): {}", has_cycle(y));

    let x = list![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let y = x.tail().tail().tail().tail();
    let z = x.tail().tail().tail().tail().tail().tail().tail();
    println!("y: {}\nz: {}", y, z);
    z.set_tail(y.clone());
    println!("cycle in tail has_cycle(x): {}", has_cycle(x.clone()));

    let x = list![1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    let y = x.tail().tail().tail().tail();
    let z = x.tail().tail().tail().tail().tail().tail().tail();
    println!("y: {}\nz: {}", y, z);
    z.set_head(y.clone());
    println!("cycle in head has_cycle(x): {}", has_cycle(z.head()));
    // 1 2 3 4 5 6 7 pointer
    //         |        |
    //         |--------|
    println!("cycle in head has_cycle(x): {}", has_cycle(x.clone()));
    // println!("{}", x.tail().tail().tail().tail().tail().tail().tail()); // will infinite loop
    // println!(
    //     "{}",
    //     x.tail().tail().tail().tail().tail().tail().tail().tail()
    // );
}
```
#### 测试结果
```
shared substructure has_cycle(y): false
shared substructure has_cycle(y): false
shared substructure has_cycle(y): false
shared substructure has_cycle(y): false
y: (5, (6, (7, (8, (9, (10, Nil))))))
z: (8, (9, (10, Nil)))
cycle in tail has_cycle(x): true
y: (5, (6, (7, (8, (9, (10, Nil))))))
z: (8, (9, (10, Nil)))
cycle in head has_cycle(x): true
cycle in head has_cycle(x): true
```

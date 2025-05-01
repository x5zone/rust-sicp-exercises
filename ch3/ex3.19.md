# 3.3.1 可变的表结构
## 练习3.19
请重做练习3.18，采用一种只需要常量空间的算法（这需要一个聪明的想法）​。

## 解答
相比练习 3.18 的解答，这里使用了 **Floyd** 的循环检测算法（龟兔赛跑算法），其核心思想是利用两个指针（`fast` 和 `slow`）在链表中移动：

* 慢指针每次移动一步。
* 快指针每次移动两步。
* 如果链表中存在环，快指针最终会与慢指针相遇。

该算法的优点是只需要常量空间（无需额外的数据结构），且时间复杂度为 $O(n)$。

#### 扩展的链表结构
* 类似习题3.18，本解答扩展了问题，包含了3种链表结构。

#### 代码实现
```rust
use sicp_rs::prelude::*;

fn has_cycle(x: List) -> bool {
    fn iter(fast: &List, slow: &List) -> bool {
        // 如果快指针或慢指针到达链表末尾，则无环
        if !fast.is_pair() || !slow.is_pair() {
            return false;
        }
        // 快指针无法继续移动，说明无环
        if !(fast.tail().is_pair() || (fast.head().is_pair() && fast.head().tail().is_pair())) {
            return false;
        }
        if fast.unique_id() == slow.unique_id() {
            return true;
        }
        // 仅可通过递归方式实现。若通过while循环方式，在head为pair时，指针会出现两个可前进方向。
        // 而通过递归方式实现，在两个可前进方向时，可自然的进行分叉。
        (
            // 快指针通过 `head` 移动，慢指针通过 `head` 移动
            fast.head().is_pair()
                && slow.head().is_pair()
                && fast.head().tail().is_pair()
                && iter(&fast.head().tail(), &slow.head())
        ) || (
            // 快指针通过 `head` 移动，慢指针通过 `tail` 移动
            fast.head().is_pair()
                && fast.head().tail().is_pair()
                && iter(&fast.head().tail(), &slow.tail())
        ) || (fast.tail().is_pair() && iter(&fast.tail().tail(), &slow.tail()))
        // 习题预期的解答如下：
        // 快指针和慢指针均通过 `tail` 移动
        // (fast.tail().is_pair() && iter(&fast.tail().tail(), &slow.tail()))
    }
    x.is_pair() && iter(&x.tail(), &x)
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
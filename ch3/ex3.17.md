# 3.3.1 可变的表结构
## 练习3.17
请设计出练习3.16中count_pairs函数的一个正确版本，使它对任何结构都能正确返回不同序对的个数。​（提示：遍历有关的结构，维护一个辅助数据结构，用它记录已经统计过的序对的轨迹。​）

## 解答
#### 问题分析
* 需要序对的唯一标识（可以是序对的地址）。
* 需要一个辅助数据结构来记录已经统计过的序对（可以是一个哈希表）。

#### rust代码
```rust
use sicp_rs::prelude::*;
use std::collections::HashSet;

fn count_pairs(x: List, visited: &mut HashSet<u64>) -> i32 {
    let x_unique_id = x.unique_id(); // unique_id 实际上底层数据指针

    if x.is_pair() && !visited.contains(&x_unique_id) {
        visited.insert(x_unique_id);
        1 + count_pairs(x.head(), visited) + count_pairs(x.tail(), visited)
    } else {
        0
    }
}
fn main() {
    let x = pair!("a", "b");
    println!(
        "pairs: {}",
        count_pairs(pair![1, pair![2, pair![3, 4]]], &mut HashSet::new())
    );
    println!(
        "pairs: {}",
        count_pairs(pair![1, pair![x.clone(), pair![3, 4]]], &mut HashSet::new())
    );
    println!(
        "pairs: {}",
        count_pairs(
            pair![1, pair![x.clone(), pair![x.clone(), 4]]],
            &mut HashSet::new()
        )
    );
    println!(
        "pairs: {}",
        count_pairs(
            pair![1, pair![x.clone(), pair![x.clone(), x.clone()]]],
            &mut HashSet::new()
        )
    );
    println!(
        "pairs: {}",
        count_pairs(
            pair![x.clone(), pair![x.clone(), pair![x.clone(), x.clone()]]],
            &mut HashSet::new()
        )
    );

    let y = pair![1, 2];
    y.set_tail(y.clone());
    println!("never return: {}", count_pairs(y, &mut HashSet::new()));
}
// pairs: 3
// pairs: 4
// pairs: 4
// pairs: 4
// pairs: 4
// never return: 1
```
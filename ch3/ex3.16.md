# 3.3.1 可变的表结构
## 练习3.16
Ben Bitdiddle决定写一个函数来统计任何表结构里的序对个数。​“这太简单了，​”他说，​“任何表结构里的序对的个数，就是其head部分的统计值加上其tail部分的统计值，再加上1，以计入当前这个序对。​”所以Ben写出了下面这个函数：
```javascript
function count_pairs(x) {
    return ! is_pair(x)
           ? 0
           : count_pairs(head(x)) + 
             count_pairs(tail(x)) +
             1;
}
```
请说明这个函数并不正确。请画出几个表示表结构的盒子指针图，它们都正好由3个序对构成，而Ben的函数对它们将分别返回3、4、7，或者根本就不返回。

## 解答
#### 为什么这个函数不正确？

1. 重复计数问题：
    * 如果表结构中存在共享子结构，那么`count_pairs`会重复计数共享部分的序对。
    * 共享结构的重复计数会导致返回值比实际的序对数更大。

2. 循环结构问题：
    * 如果表结构中存在循环（例如某个序对的`tail`指向自身或其他部分），`count_pairs`将陷入无限递归，导致程序无法返回。

#### 盒子指针图
```
shared: a -> b
3:      1 -> 2 -> 3 -> 4
4:      1 -> 2 -> 3 -> shared
7:      shared -> shared -> shared -> shared

cycle: a -> b -> c
       ^         |
       |---------|
```

#### rust代码
```rust
use sicp_rs::prelude::*;

fn count_pairs(x: List) -> i32 {
    if x.is_pair() {
        1 + count_pairs(x.head()) + count_pairs(x.tail())
    } else {
        0
    }
}
fn main() {
    let x = pair!("a", "b");
    println!("pairs: {}", count_pairs(pair![1, pair![2, pair![3, 4]]]));
    println!(
        "pairs: {}",
        count_pairs(pair![1, pair![x.clone(), pair![3, 4]]])
    );
    println!(
        "pairs: {}",
        count_pairs(pair![1, pair![x.clone(), pair![x.clone(), 4]]])
    );
    println!(
        "pairs: {}",
        count_pairs(pair![1, pair![x.clone(), pair![x.clone(), x.clone()]]])
    );
    println!(
        "pairs: {}",
        count_pairs(pair![
            x.clone(),
            pair![x.clone(), pair![x.clone(), x.clone()]]
        ])
    );

    let y = pair![1,2];
    y.set_tail(y.clone());
    // println!("never return: {}", count_pairs(y));
}
// pairs: 3
// pairs: 4
// pairs: 5
// pairs: 6
// pairs: 7
```
# 1.2.3 增长的阶
## 练习1.14
请画出一棵树，展示1.2.2节的函数count_change把11美分换成硬币时产生的计算过程。相对于被换现金量的增加，这一计算过程的空间和步数增长的阶各是什么？
```javascript
function count_change(amount) {
    return cc(amount, 5);
}
function cc(amount, kinds_of_coins) {
    return amount === 0 ? 
            1 :
            amount < 0 || kinds_of_coins === 0? 
            0 :
            cc(amount, kinds_of_coins - 1) + cc(amount - first_denomination(kinds_of_coins), kinds_of_coins);
}
function first_denomination(kinds_of_coins) {
    return kinds_of_coins === 1? 1 :
        kinds_of_coins === 2? 5 :
        kinds_of_coins === 3? 10 :
        kinds_of_coins === 4? 25 :
        kinds_of_coins === 5? 50 : 
        0;
}
```

## 解答
- 空间增长阶即为树的深度，每次递归都优先用1分硬币，所以树的深度为amount。
- 步数增长阶即为树的节点数，最坏情况下均为1分硬币，所以树的节点数为$2^{amount}$。
- 附上记忆化搜索版本的rust代码：
-- 记忆化搜索树的深度为amount
-- 记忆化搜索的空间增长阶为$O({amount})$
-- 记忆化搜索的步数增长阶为$O({amount})$
```rust
use std::collections::HashMap;
fn count_change(amount: i32) -> i32 {
    let mut kv: HashMap<(i32, i32), i32> = HashMap::new();
    let res = cc(amount, 5, &mut kv);
    res
}
fn cc(amount: i32, kind_of_coins: i32, kv: &mut HashMap<(i32, i32), i32>) -> i32 {
    if amount == 0 {
        return 1;
    }
    if amount < 0 || kind_of_coins == 0 {
        return 0;
    }
    if let Some(&v) = kv.get(&(amount, kind_of_coins)) {
        return v;
    }
    let left = cc(amount, kind_of_coins - 1, kv);
    kv.insert((amount, kind_of_coins - 1), left);
    let fd = first_denomination(kind_of_coins);
    let right = cc(amount - fd, kind_of_coins, kv);
    kv.insert((amount - fd, kind_of_coins), right);
    kv.insert((amount, kind_of_coins), left + right);
    left + right
}
fn first_denomination(kind_of_coins: i32) -> i32 {
    match kind_of_coins {
        1 => 1,
        2 => 5,
        3 => 10,
        4 => 25,
        5 => 50,
        _ => 0,
    }
}
```

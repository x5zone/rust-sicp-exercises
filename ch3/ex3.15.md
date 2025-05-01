# 3.3.1 可变的表结构
## 练习3.15
请画出盒子指针图，表示set_to_wow对上面结构z1和z2的作用。
```javascript
const x = list("a", "b");
const z1 = pair(x, x);
const z2 = pair(list("a", "b"), list("a", "b"));

function set_to_wow(x) {
    set_head(head(x), "wow");
    return x;
}
z1; 
//[["a", ["b", null]], ["a", ["b", null]]]

set_to_wow(z1); 
//[["wow", ["b", null]], ["wow", ["b", null]]]

z2; 
//[["a", ["b", null]], ["a", ["b", null]]]

set_to_wow(z2); 
//[["wow", ["b", null]], ["a", ["b", null]]]
```

## 解答
#### 盒子指针图
```
[z1_head, z1_tail]
   \       /
    \     / 
  [a->b->null]      
   |
  wow  // set_to_wow(z1) 

[z1_head,     z1_tail]
    |             |
[a->b->null]  [a->b->null]
 |
wow   // set_to_wow(z2)
```

#### rust代码
```rust
use sicp_rs::prelude::*;

fn set_to_wow(x: List) -> List {
    x.head().set_head("wow".to_listv());
    x
}

fn main() {
    let x = list!["a", "b"];
    let z1 = pair![x.clone(), x.clone()];
    let z2 = pair![list!["a", "b"], list!["a", "b"]];
    println!("z1: {}\nz2: {}", z1, z2);
    println!("set_to_wow(z1): {}", set_to_wow(z1));
    println!("set_to_wow(z2): {}", set_to_wow(z2))
}
// z1: ((a, (b, Nil)), (a, (b, Nil)))
// z2: ((a, (b, Nil)), (a, (b, Nil)))
// set_to_wow(z1): ((wow, (b, Nil)), (wow, (b, Nil)))
// set_to_wow(z2): ((wow, (b, Nil)), (a, (b, Nil)))
```

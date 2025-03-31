# 3.1.1 局部状态变量
## 练习3.1
一个累加器是一个函数，用数值反复调用，它能把这些数值累加到一个和数里。每次调用累加器还将返回当前的累加和。请写一个生成累加器的函数make_accumulator，每个累加器维持一个独立的和数。make_accumulator的实参描述和的初始值，例如：
```javascript
const a = make_accumulator(5);
a(10); // 15
a(10); // 25
```

## 解答
本习题比较简单，不再赘述。
```rust
use std::{cell::RefCell, rc::Rc};

fn make_accumulator(init: i32) -> impl Fn(i32) -> i32 {
    let sum = Rc::new(RefCell::new(init));
    move |x| {
        let mut s = sum.borrow_mut();
        *s += x;
        *s
    }
}
fn main() {
    let a = make_accumulator(5);
    println!("{}", a(10));
    println!("{}", a(10));
}
```
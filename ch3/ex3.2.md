# 3.1.1 局部状态变量
## 练习3.2
对应用程序做软件测试时，能统计出计算中某个给定函数被调用的次数常常很有用。请写一个函数make_monitored，它以函数f为参数，这个函数本身也有一个参数。make_monitored返回另一个函数，比如称之为mf，它用一个内部计数器维持自己被调用的次数。如果调用mf的实参是特殊符号"how many calls"，mf就返回内部计数器的值；如果实参是特殊符号"reset count"，mf就把计数器重置为0；对任何其他实参，mf都返回函数f应用于相应实参的结果，并把内部计数器的值加一。例如，我们可能采用下面的方式做出函数sqrt的一个受监视的版本：
```javascript
const s = make_monitored(math_sqrt);
s(100); // 10
s("how many calls?"); // 1
```

## 解答
本习题比较简单，不再赘述。
```rust
use std::{cell::RefCell, rc::Rc};

use sicp_rs::prelude::*;
fn math_sqrt(x: List) -> List {
    x.try_as_basis_value::<f64>()
        .expect("sqrt: f64 expected")
        .sqrt()
        .to_listv()
}
fn make_monitored(f: impl Fn(List) -> List) -> impl Fn(List) -> List {
    let count = Rc::new(RefCell::new(0));
    move |x| {
        let mut c = count.borrow_mut();
        if x == "how-many-calls?".to_listv() {
            c.to_owned().to_listv()
        } else {
            *c += 1;
            f(x)
        }
    }
}
fn main() {
    let sqrt = make_monitored(math_sqrt);
    println!("{}", sqrt("how-many-calls?".to_listv()));   // 0.0
    println!("{}", sqrt(100.0.to_listv()));               // 10.0
    println!("{}", sqrt("how-many-calls?".to_listv()));   // 1.0
}
```
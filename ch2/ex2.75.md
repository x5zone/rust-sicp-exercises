# 2.4.3 数据导向的程序设计和可加性
## 练习2.75
请用消息传递的风格实现构造函数make_from_mag_ang。这个函数应该与上面给出的make_from_real_imag函数类似。
```javascript
function make_from_real_imag(x, y) {
    function dispatch(op) {
        return op === "real_part"
            ? x
            : op === "imag_part"
            ? y
            : op === "magnitude"
            ? math.sqrt(x * x + y * y)
            : op === "angle"
            ? math.atan2(y, x)
            : error("Unknown op -- MAKE_FROM_REAL_IMAG", op);
    }
    return dispatch;
}
function apply_generic(op, arg) {
    return head(arg)(op);
}
```

## 解答
* 这道题的核心是考察面向消息传递的风格，即通过一个闭包（dispatch 函数）根据不同的操作指令（op）返回对应的结果，而非直接实现复数运算的具体细节。

* 以下是用 Rust 实现 make_from_mag_ang 的完整代码。
```rust
use sicp_rs::prelude::*;

fn make_from_mag_ang(mag: List, ang: List) -> ClosureWrapper {
    let dispatch = move |op: &List| {
        let op = op.clone();
        if op == "real-part".to_listv() {
            println!("real-part");
            //mag * Math.cos(ang)
            let mag = mag.try_as_basis_value::<f64>().unwrap();
            let ang = ang.try_as_basis_value::<f64>().unwrap();
            Some((mag * ang.cos()).to_listv())
        } else if op == "imag-part".to_listv() {
            println!("imag-part");
            //mag * Math.sin(ang)
            let mag = mag.try_as_basis_value::<f64>().unwrap();
            let ang = ang.try_as_basis_value::<f64>().unwrap();
            Some((mag * ang.cos()).to_listv())
        } else if op == "magnitude".to_listv() {
            println!("magnitude");
            Some(mag.clone()) // 这里clone是为了避免所有权问题，若移动所有权，则closure会变为FnOnce类型
        } else if op == "angle".to_listv() {
            println!("angle");
            Some(ang.clone())
        } else {
            panic!("Unknown op -- MAKE_FROM_mag_ang {}", op)
        }
    };
    ClosureWrapper::new(dispatch)
}

fn main() {
    let x = make_from_mag_ang(1.0.to_listv(), 2.0.to_listv());
    x.call(&"real-part".to_listv());
    x.call(&"imag-part".to_listv());
    x.call(&"magnitude".to_listv());
    x.call(&"angle".to_listv());
}
```
* 代码解释
    * 核心思想：消息传递风格
        * dispatch 是一个闭包，根据传入的操作指令（op）返回对应的结果。
        * 通过 ClosureWrapper 封装闭包，实现类型擦除和统一调用接口。
    * 消息处理逻辑
        * "real-part"：计算实部，公式为 mag⋅cos⁡(ang)mag⋅cos(ang)。
        * "imag-part"：计算虚部，公式为 mag⋅sin⁡(ang)mag⋅sin(ang)。
        * "magnitude"：直接返回模长。
        * "angle"：直接返回角度。
    * 避免所有权问题
        * 使用 clone 确保 mag 和 ang 不会被移动，从而让闭包实现 Fn 而非 FnOnce。
    * List 类型的使用
        * List 是 sicp_rs 提供的类型，用于表示通用的数据结构。
        * 使用 .to_listv() 方法将基本类型（如 f64 和 &str）转换为 List。


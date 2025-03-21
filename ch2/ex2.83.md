# 2.5.2 不同类型数据的组合
## 练习2.83
假设你正在设计一个通用型算术包，其中需要处理如图2.25所示的类型塔，包括整数、有理数、实数和复数。请为每个类型（除了复数之外）设计一个函数，它能把该类型的对象提升到塔的更高一层。请说明如何安装一个通用的raise操作，使之能对各个类型工作（除复数外）​。
```
    复数
     |  
    实数
     |
    有理数
     |
    整数 
```

## 解答
#### 解题思路
1. 类型提升逻辑：
    * 整数到有理数：将整数$n$表示为$(n/1)$的有理数。
    * 有理数到实数：将有理数$(p/q)$转换为浮点数$p/q$。
    * 实数到复数：将实数$r$转换为复数$(r+0i)$。
2. 实现方法：
    * 为每种类型安装一个`raise`操作。
    * 使用`apply_generic`函数实现通用的`raise`操作，自动根据类型调用对应的提升函数。
#### 输出结果
```rust
integer (integer, 42) raised to rational: (rational, (42, 1))
rational (rational, (3, 4)) raised to real: 0.75
real 7.0 raised to complex: (complex, (rectangular, (7.0, 0.0)))
```
#### 完整代码
```rust
use std::rc::Rc;

use sicp_rs::{
    ch2::{
        ch2_4::apply_generic,
        ch2_5::{
            install_complex_packages, install_javascript_integer_package,
            install_javascript_number_package, install_polar_package, install_rational_package,
            install_rectangular_package, make_complex_from_real_imag, make_javascript_integer,
            make_javascript_number, make_rational,
        },
    },
    ch3::ch3_3::make_table_2d,
    prelude::*,
};
fn install_integer_raise_package(optable: Rc<dyn Fn(&str) -> ClosureWrapper>) -> Option<List> {
    let op_cloned = optable.clone();
    let get = move |args: List| optable("lookup").call(&args);
    let put = move |args: List| op_cloned("insert").call(&args);
    put(list![
        "raise",
        list!["integer"],
        ClosureWrapper::new(move |args| {
            let i = args.head();
            Some(make_rational(i, 1.to_listv(), get.clone()))
        })
    ]);
    Some("done".to_string().to_listv())
}
fn install_rational_raise_package(optable: Rc<dyn Fn(&str) -> ClosureWrapper>) -> Option<List> {
    let op_cloned = optable.clone();
    let get = move |args: List| optable("lookup").call(&args);
    let put = move |args: List| op_cloned("insert").call(&args);
    put(list![
        "raise",
        list!["rational"],
        ClosureWrapper::new(move |args| {
            let (numer_x, denom_x) = (args.head().head(), args.head().tail());
            let (numer_x, denom_x) = (
                numer_x
                    .try_as_basis_value::<i32>()
                    .expect("rational numerator must be i32"),
                denom_x
                    .try_as_basis_value::<i32>()
                    .expect("rational denominator must be i32"),
            );
            Some(make_javascript_number(
                ((*numer_x as f64) / (*denom_x as f64)).to_listv(),
                get.clone(),
            ))
        })
    ]);
    Some("done".to_string().to_listv())
}
fn install_javascript_number_raise_package(
    optable: Rc<dyn Fn(&str) -> ClosureWrapper>,
) -> Option<List> {
    let op_cloned = optable.clone();
    let get = move |args: List| optable("lookup").call(&args);
    let put = move |args: List| op_cloned("insert").call(&args);
    put(list![
        "raise",
        list!["javascript_number"],
        ClosureWrapper::new(move |args| {
            let i = args.head();

            Some(make_complex_from_real_imag(i, 0.0.to_listv(), get.clone()))
        })
    ]);

    Some("done".to_string().to_listv())
}
fn raise(x: &List, get: impl Fn(List) -> Option<List> + 'static) -> List {
    apply_generic(&"raise".to_listv(), &list![x.clone()], get).unwrap()
}
fn main() {
    let optable = make_table_2d();
    let op_cloned = optable.clone();
    let get = move |args: List| op_cloned("lookup").call(&args);
    let op_cloned = optable.clone();
    let put = move |args: List| op_cloned("insert").call(&args);
    let op_cloned = optable.clone();
    install_complex_packages(op_cloned);
    install_rectangular_package(put.clone());
    install_polar_package(put.clone());
    install_rational_package(put.clone());
    install_javascript_number_package(put.clone());
    install_javascript_integer_package(put.clone());
    install_integer_raise_package(optable.clone());
    install_rational_raise_package(optable.clone());
    install_javascript_number_raise_package(optable.clone());

    // 1. 测试整数提升为有理数
    let integer = make_javascript_integer(42.to_listv(), get.clone());
    let integer_raised = raise(&integer, get.clone());
    println!("integer {} raised to rational: {}", integer, integer_raised);

    // 2. 测试有理数提升为实数
    let rational = make_rational(3.to_listv(), 4.to_listv(), get.clone());
    let rational_raised = raise(&rational, get.clone());
    println!("rational {} raised to real: {}", rational, rational_raised);

    // 3. 测试实数提升为复数
    let real = make_javascript_number(7.0.to_listv(), get.clone());
    let real_raised = raise(&real, get.clone());
    println!("real {} raised to complex: {}", real, real_raised);
}
```
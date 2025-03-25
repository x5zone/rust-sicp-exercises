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
integer 42 raised to rational: (rational, (42, 1))
rational (rational, (3, 4)) raised to real: 0.75
real 7.0 raised to complex: (complex, (rectangular, (7.0, 0.0)))
```
#### 完整代码
##### main函数
```rust
use sicp_rs::{
    ch2::ch2_5::{
        ArithmeticContext, apply_generic, install_arithmetic_package, make_float, make_integer,
        make_rational,
    },
    prelude::*,
};
fn raise(x: &List, arith: &ArithmeticContext) -> List {
    // only basis types can be raised
    apply_generic(&"raise".to_listv(), &list![x.clone()], arith).unwrap()
}
fn main() {
    // 创建通用算术包上下文
    let arith = ArithmeticContext::new();
    install_arithmetic_package(&arith);

    // 1. 测试整数提升为有理数
    let integer = make_integer(42, &arith);
    let integer_raised = raise(&integer, &arith);
    println!("integer {} raised to rational: {}", integer, integer_raised);

    // 2. 测试有理数提升为实数
    let rational = make_rational(3.to_listv(), 4.to_listv(), &arith);
    let rational_raised = raise(&rational, &arith);
    println!("rational {} raised to real: {}", rational, rational_raised);

    // 3. 测试实数提升为复数
    let real = make_float(7.0, &arith);
    let real_raised = raise(&real, &arith);
    println!("real {} raised to complex: {}", real, real_raised);
}
```
##### 依赖lib
```rust
    arith.put("raise", list!["integer"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args| Some(make_rational(args.head(), 1.to_listv(), &arith)))
    });
    arith.put("raise", list!["rational"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args| {
            // 调用链中有apply_generic的调用，需要使用 tag 函数重新附加数据类型标签
            let n = arith.numer(&tag(args.head()));
            let d = arith.denom(&tag(args.head()));

            // 有理数的分子分母可能是更多类型，例如多项式
            if type_tag(&n) == "integer".to_listv() && type_tag(&d) == "integer".to_listv() {
                let n = n
                    .try_as_basis_value::<i32>()
                    .expect("raise rational with integer error");
                let d = d
                    .try_as_basis_value::<i32>()
                    .expect("raise rational with integer error");
                let f = (*n as f64) / (*d as f64);
                Some(make_float(f, &arith))
            } else {
                panic!(
                    "raise: rational to float error, not support {} to raise",
                    args
                );
            }
        })
    });
    arith.put("raise", list!["float"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args| {
            Some(make_complex_from_real_imag(
                args.head(),
                0.0.to_listv(),
                &arith,
            ))
        })
    });
```
# 2.5.1 通用型算术运算
## 练习2.80
请定义一个通用谓词is_equal_to_zero检查参数是否为0，并把它安装到通用算术包里。这一操作应该对常规的数、有理数和复数都能工作。

## 解答
#### 概述
本节习题与练习 2.79 的逻辑非常相似，只是从检查两个数是否相等扩展到检查一个数是否等于零，不再赘述。
#### 测试结果
运行代码后，输出结果如下：
```rust
0.0 == 0.0: true
1.0 == 0.0: false
(rational, (0, 1)) == 0.0: true
(rational, (1, 2)) == 0.0: false
(complex, (rectangular, (0.0, 2.0))) == 0.0: false
(complex, (rectangular, (0.0, 0.0))) == 0.0: true
(complex, (polar, (1.0, 2.0))) == 0.0: false
(complex, (polar, (0.0, 2.0))) == 0.0: true
```
#### Rust代码实现
##### main函数
```rust
use sicp_rs::{
    ch2::ch2_5::{
        ArithmeticContext, apply_generic, install_complex_package, install_float_package,
        install_integer_package, install_polar_package, install_rational_package,
        install_rectangular_package, make_complex_from_mag_ang, make_complex_from_real_imag,
        make_float, make_integer, make_rational,
    },
    prelude::*,
};
// 需要注意apply_generic的作用: apply_generic剥去标签，并根据标签进行分派。
fn is_equal_to_zero(x: &List, arith: &ArithmeticContext) -> List {
    apply_generic(&"is_equal_to_zero".to_listv(), &list![x.clone()], arith).unwrap()
}
fn main() {
    // 创建通用算术包上下文
    let arith = ArithmeticContext::new();
    install_integer_package(&arith);
    install_float_package(&arith);
    install_rational_package(&arith);
    install_polar_package(&arith);
    install_rectangular_package(&arith);
    install_complex_package(&arith);

    let check_equal_zero = |x| println!("{} == 0.0: {}", x, is_equal_to_zero(&x, &arith));

    // 验证float的equal规则

    check_equal_zero(make_float(0.0, &arith));
    check_equal_zero(make_float(1.0, &arith));
    // 验证rational的equal规则
    // rational接受整数，复数，多项式作为参数。
    assert_eq!(make_integer(1, &arith), 1.to_listv()); // make_integer返回原始整数的List包装
    let x = make_rational(0.to_listv(), 2.to_listv(), &arith);
    check_equal_zero(x);
    let x = make_rational(1.to_listv(), 2.to_listv(), &arith);
    check_equal_zero(x);

    // 验证complex的equal规则
    let x = make_complex_from_real_imag(0.0.to_listv(), 2.0.to_listv(), &arith);
    check_equal_zero(x);
    let x = make_complex_from_real_imag(0.0.to_listv(), 0.0.to_listv(), &arith);
    check_equal_zero(x);
    let x = make_complex_from_mag_ang(1.0.to_listv(), 2.0.to_listv(), &arith);
    check_equal_zero(x);
    let x = make_complex_from_mag_ang(0.0.to_listv(), 2.0.to_listv(), &arith);
    check_equal_zero(x);
}
```
##### 依赖lib
```rust
// install is_equal_to_zero
    // install is_equal_to_zero for i32&f64
    install_unary_op::<T>(
        "is_equal_to_zero",
        tag_name,     // "float" or "integer"
        move |x: T| (x == T::zero()).to_listv(),
        arith,
    );
// install is_equal_to_zero for rational
    arith.put("is_equal_to_zero", list!["rational"], {
        let (arith, tag) = (arith.clone(), tag.clone());
        ClosureWrapper::new(move |args| {
            // 调用链中有apply_generic的调用，需要使用 tag 函数重新附加数据类型标签
            let n = arith.numer(&tag(args.head()));
            Some((arith.is_equal_to_zero(&n) == true.to_listv()).to_listv())
        })
    });
// install is_equal_to_zero for complex
    arith.put("is_equal_to_zero", list!["rectangular"], {
        let arith = arith.clone();
        let extract = extract_real_imag.clone();
        ClosureWrapper::new(move |args| {
            let (r, i) = extract(&args.head());
            Some(
                (arith.is_equal_to_zero(&r) == true.to_listv()
                    && arith.is_equal_to_zero(&i) == true.to_listv())
                .to_listv(),
            )
        })
    });
    arith.put("is_equal_to_zero", list!["polar"], {
        let arith = arith.clone();
        let extract = extract_mag_ang.clone();
        ClosureWrapper::new(move |args| {
            let (m, _) = extract(&args.head());
            Some((arith.is_equal_to_zero(&m) == true.to_listv()).to_listv())
        })
    });
    arith.put("is_equal_to_zero", list!["complex"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args| Some(arith.is_equal_to_zero(&args.head())))
    });
```
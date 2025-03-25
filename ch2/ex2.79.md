# 2.5.1 通用型算术运算
## 练习2.79
请定义一个能检查两个数是否相等的通用型相等谓词is_equal，并把它安装到通用算术包里。这一操作应该对常规的数、有理数和复数都能工作。

## 解答
#### 实现目标
我们需要实现一个通用型相等谓词 is_equal，它能够检查以下三种类型的数是否相等：
1. 浮点数：直接比较数值是否相等（比较差值是否小于epsilon）。
2. 有理数：通过比较分子和分母的值判断相等性。
3. 复数：通过比较实部和虚部的值判断相等性。
要实现这一功能，我们需要在通用算术包中为每种类型安装相应的`equal`操作，并通过`apply_generic`实现标签剥离和类型分派的通用性。
#### 关键点`apply_generic`的作用
`apply_generic`是实现通用性和类型分派的核心。它的功能可以分为以下几步：
* 标签剥离：`apply_generic`会从带标签的数据中剥离出标签（如`"float"`、`"rational"`、`"complex"`），从而获取数值的具体类型。
* 类型分派：根据标签，`apply_generic`会在操作符表中查找对应的操作（如`equal`），并将操作应用到数值上。

在`is_equal`的实现中，`apply_generic`是实现通用性的重要部分：
```rust
fn is_equal(x: &List, y: &List, arith: &ArithmeticContext) -> List {
    apply_generic(&"is_equal".to_listv(), &list![x.clone(), y.clone()], arith).unwrap()
}
```
通过调用`apply_generic`，我们可以在不同类型的数值之间实现统一的相等性检查，而无需手动判断类型。
#### 测试结果
测试结果如下，验证了代码的正确性：
```rust
x: 1.0, y: 1.0, x==y: true
x: 1.0, y: 2.0, x==y: false
x: (rational, (1, 2)), y: (rational, (1, 2)), x==y: true
x: (rational, (1, 3)), y: (rational, (1, 2)), x==y: false
x: (complex, (rectangular, (1.0, 2.0))), y: (complex, (rectangular, (1.0, 2.0))), x==y: true
x: (complex, (rectangular, (1.0, 2.0))), y: (complex, (rectangular, (1.0, 3.0))), x==y: false
x: (complex, (polar, (1.0, 2.0))), y: (complex, (polar, (1.0, 2.0))), x==y: true
x: (complex, (polar, (1.0, 2.0))), y: (complex, (polar, (1.0, 3.0))), x==y: false
```
#### 代码实现
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
fn is_equal(x: &List, y: &List, arith: &ArithmeticContext) -> List {
    apply_generic(&"is_equal".to_listv(), &list![x.clone(), y.clone()], arith).unwrap()
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

    let check_equal = { |x, y| println!("x: {}, y: {}, x==y: {}", x, y, is_equal(&x, &y, &arith)) };

    // 验证float的equal规则
    let (x, y) = (make_float(1.0, &arith), make_float(1.0, &arith));
    check_equal(x, y);
    let (x, y) = (make_float(1.0, &arith), make_float(2.0, &arith));
    check_equal(x, y);
    // 验证rational的equal规则
    // rational接受整数，复数，多项式作为参数。
    assert_eq!(make_integer(1, &arith), 1.to_listv()); // make_integer返回原始整数的List包装
    let x = make_rational(1.to_listv(), 2.to_listv(), &arith);
    let y = make_rational(2.to_listv(), 4.to_listv(), &arith);
    check_equal(x, y);
    let x = make_rational(1.to_listv(), 3.to_listv(), &arith);
    let y = make_rational(2.to_listv(), 4.to_listv(), &arith);
    check_equal(x, y);
    // 验证complex的equal规则
    let x = make_complex_from_real_imag(1.0.to_listv(), 2.0.to_listv(), &arith);
    let y = make_complex_from_real_imag(1.0.to_listv(), 2.0.to_listv(), &arith);
    check_equal(x, y);

    let x = make_complex_from_real_imag(1.0.to_listv(), 2.0.to_listv(), &arith);
    let y = make_complex_from_real_imag(1.0.to_listv(), 3.0.to_listv(), &arith);
    check_equal(x, y);
    let x = make_complex_from_mag_ang(1.0.to_listv(), 2.0.to_listv(), &arith);
    let y = make_complex_from_mag_ang(1.0.to_listv(), 2.0.to_listv(), &arith);
    check_equal(x, y);

    let x = make_complex_from_mag_ang(1.0.to_listv(), 2.0.to_listv(), &arith);
    let y = make_complex_from_mag_ang(1.0.to_listv(), 3.0.to_listv(), &arith);
    check_equal(x, y);
}
```
##### 依赖lib
```rust
// install is_equal
// install is_equal for i32&f64
    install_binary_op::<T>(
        "is_equal",
        tag_name,    // "float" or "integer"
        move |x: T, y: T| (x.to_listv() == y.to_listv()).to_listv(),  // 转换成listv格式，以利用listv定义的浮点数比较方法
        arith,
    );
// install is_equal for rational
    arith.put("is_equal", list!["rational", "rational"], {
        let (arith, extract_xy_) = (arith.clone(), extract_xy_numer_denom.clone());
        ClosureWrapper::new(move |args| {
            let (n_x, d_x, n_y, d_y) = extract_xy_(args);
            Some(
                (arith.is_equal(&n_x, &n_y) == true.to_listv()         // 递归比较，亦支持分子分母为更多类型数据  
                    && arith.is_equal(&d_x, &d_y) == true.to_listv())
                .to_listv(),
            )
        })
    });
// install is_equal for complex
    arith.put("is_equal", list!["rectangular", "rectangular"], {
        let arith = arith.clone();
        let extract = extract_real_imag.clone();
        ClosureWrapper::new(move |args| {
            let (x, y) = (args.head(), args.tail().head());
            let ((r_x, i_x), (r_y, i_y)) = (extract(&x), extract(&y));
            Some(
                (arith.is_equal(&r_x, &r_y) == true.to_listv()
                    && arith.is_equal(&i_x, &i_y) == true.to_listv())
                .to_listv(),
            )
        })
    });
    arith.put("is_equal", list!["polar", "polar"], {
        let arith = arith.clone();
        let extract = extract_mag_ang.clone();
        ClosureWrapper::new(move |args| {
            let (x, y) = (args.head(), args.tail().head());
            let ((m_x, a_x), (m_y, a_y)) = (extract(&x), extract(&y));
            Some(
                (arith.is_equal(&m_x, &m_y) == true.to_listv()
                    && arith.is_equal(&a_x, &a_y) == true.to_listv())
                .to_listv(),
            )
        })
    });
    arith.put("is_equal", list!["complex", "complex"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args| Some(arith.is_equal(&args.head(), &args.tail().head())))
    });
```
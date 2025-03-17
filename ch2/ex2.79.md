# 2.5.1 通用型算术运算
## 练习2.79
请定义一个能检查两个数是否相等的通用型相等谓词is_equal，并把它安装到通用算术包里。这一操作应该对常规的数、有理数和复数都能工作。

## 解答
#### 实现目标
我们需要实现一个通用型相等谓词 is_equal，它能够检查以下三种类型的数是否相等：
1. 常规数（如浮点数）：直接比较数值是否相等。
2. 有理数：通过比较分子和分母的值判断相等性。
3. 复数：通过比较实部和虚部的值判断相等性。
要实现这一功能，我们需要在通用算术包中为每种类型安装相应的`equal`操作，并通过`apply_generic`实现标签剥离和类型分派的通用性。
#### 关键点`apply_generic`的作用
`apply_generic`是实现通用性和类型分派的核心。它的功能可以分为以下几步：
* 标签剥离：`apply_generic`会从带标签的数据中剥离出标签（如`"javascript_number"`、`"rational"`、`"complex"`），从而获取数值的具体类型。
* 类型分派：根据标签，`apply_generic`会在操作符表中查找对应的操作（如`equal`），并将操作应用到数值上。

在`is_equal`的实现中，`apply_generic`是实现通用性的重要部分：
```rust
fn is_equal(x: &List, y: &List, get: impl Fn(List) -> Option<List> + 'static) -> List {
    apply_generic(&"equal".to_listv(), &list![x.clone(), y.clone()], get).unwrap()
}
```
通过调用`apply_generic`，我们可以在不同类型的数值之间实现统一的相等性检查，而无需手动判断类型。
#### 测试结果
测试结果如下，验证了代码的正确性：
```rust
x: 1.0, y: 1.0, x==y: true
x: 1.0, y: 2.0, x==y: false
x: ("rational", (1, 2)), y: ("rational", (1, 2)), x==y: true
x: ("rational", (1, 3)), y: ("rational", (1, 2)), x==y: false
x: ("complex", ("rectangular", (1.0, 2.0))), y: ("complex", ("rectangular", (1.0, 2.0))), x==y: true
x: ("complex", ("rectangular", (1.0, 2.0))), y: ("complex", ("rectangular", (1.0, 3.0))), x==y: false
```
#### 代码实现
rust完整的代码如下：
```rust
use std::rc::Rc;

use sicp_rs::ch2::ch2_4::apply_generic;
use sicp_rs::ch2::ch2_5::imag_part;
use sicp_rs::ch2::ch2_5::install_complex_packages;
use sicp_rs::ch2::ch2_5::install_javascript_number_package;
use sicp_rs::ch2::ch2_5::install_polar_package;
use sicp_rs::ch2::ch2_5::install_rational_package;
use sicp_rs::ch2::ch2_5::install_rectangular_package;
use sicp_rs::ch2::ch2_5::make_complex_from_real_imag;
use sicp_rs::ch2::ch2_5::real_part;
use sicp_rs::ch3::ch3_3::make_table_2d;
use sicp_rs::prelude::*;

fn install_javascript_number_equal(put: impl Fn(List) -> Option<List> + 'static) -> Option<List> {
    let equal = ClosureWrapper::new(move |args: &List| {
        let x = args.head();
        let y = args.tail().head();
        Some((x == y).to_listv())
    });
    put(list![
        "equal",
        list!["javascript_number", "javascript_number"],
        equal
    ]);
    Some("done".to_string().to_listv())
}
fn install_rational_equal(optable: Rc<dyn Fn(&str) -> ClosureWrapper>) -> Option<List> {
    let op_cloned = optable.clone();
    let get = move |args: List| op_cloned("lookup").call(&args);
    let op_cloned = optable.clone();
    let put = move |args: List| op_cloned("insert").call(&args);
    let numer = get(list!["numer", list!["rational"]]).unwrap();
    let numer = numer.try_as_basis_value::<ClosureWrapper>().unwrap();
    let denom = get(list!["denom", list!["rational"]]).unwrap();
    let denom = denom.try_as_basis_value::<ClosureWrapper>().unwrap();
    let (numer_cloned, denom_cloned) = (numer.clone(), denom.clone());

    let get_numer_and_denom = move |args: &List| {
        let (x, y) = (args.head(), args.tail().head());
        let (numer_x, denom_x, numer_y, denom_y) = (
            numer_cloned.clone().call(&list![x.clone()]).unwrap(),
            denom_cloned.clone().call(&list![x]).unwrap(),
            numer_cloned.clone().call(&list![y.clone()]).unwrap(),
            denom_cloned.clone().call(&list![y]).unwrap(),
        );
        let (numer_x, denom_x, numer_y, denom_y) = (
            numer_x.try_as_basis_value::<i32>().unwrap(),
            denom_x.try_as_basis_value::<i32>().unwrap(),
            numer_y.try_as_basis_value::<i32>().unwrap(),
            denom_y.try_as_basis_value::<i32>().unwrap(),
        );
        (*numer_x, *denom_x, *numer_y, *denom_y)
    };
    let equal = ClosureWrapper::new(move |args: &List| {
        let (numer_x, denom_x, numer_y, denom_y) = get_numer_and_denom(args);
        Some((numer_x == numer_y && denom_x == denom_y).to_listv())
    });
    put(list!["equal", list!["rational", "rational"], equal]);
    Some("done".to_string().to_listv())
}

fn install_complex_equal(optable: Rc<dyn Fn(&str) -> ClosureWrapper>) -> Option<List> {
    let op_cloned = optable.clone();
    let get = move |args: List| op_cloned("lookup").call(&args);
    let op_cloned = optable.clone();
    let put = move |args: List| op_cloned("insert").call(&args);

    let get_real_and_imag = move |args: &List| {
        let (x, y) = (args.head(), args.tail().head());
        let (real_x, imag_x, real_y, imag_y) = (
            real_part(&x, get.clone()),
            imag_part(&x, get.clone()),
            real_part(&y, get.clone()),
            imag_part(&y, get.clone()),
        );
        let (real_x, imag_x, real_y, imag_y) = (
            real_x.try_as_basis_value::<f64>().unwrap(),
            imag_x.try_as_basis_value::<f64>().unwrap(),
            real_y.try_as_basis_value::<f64>().unwrap(),
            imag_y.try_as_basis_value::<f64>().unwrap(),
        );
        (*real_x, *imag_x, *real_y, *imag_y)
    };
    let equal = ClosureWrapper::new(move |args: &List| {
        let (real_x, imag_x, real_y, imag_y) = get_real_and_imag(args);
        Some((real_x == real_y && imag_x == imag_y).to_listv())
    });
    put(list!["equal", list!["complex", "complex"], equal]);
    Some("done".to_string().to_listv())
}

// 需要注意apply_generic的作用: apply_generic剥去标签，并根据标签进行分派。
fn is_equal(x: &List, y: &List, get: impl Fn(List) -> Option<List> + 'static) -> List {
    apply_generic(&"equal".to_listv(), &list![x.clone(), y.clone()], get).unwrap()
}
fn main() {
    // 创建操作符表
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
    install_complex_equal(optable.clone());
    install_rational_equal(optable.clone());
    install_javascript_number_equal(put.clone());

    // 验证javascript_number的equal规则
    let make_js_number = get(list!["make", "javascript_number"]).unwrap();
    let make_js_number = make_js_number
        .try_as_basis_value::<ClosureWrapper>()
        .unwrap();
    let x = make_js_number.call(&list![1.0]).unwrap();
    let y = make_js_number.call(&list![1.0]).unwrap();
    println!(
        "x: {}, y: {}, x==y: {}",
        x,
        y,
        is_equal(&x, &y, get.clone())
    );
    let x = make_js_number.call(&list![1.0]).unwrap();
    let y = make_js_number.call(&list![2.0]).unwrap();
    println!(
        "x: {}, y: {}, x==y: {}",
        x,
        y,
        is_equal(&x, &y, get.clone())
    );
    // 验证rational的equal规则
    let make_rational = get(list!["make", "rational"]).unwrap();
    let make_rational = make_rational
        .try_as_basis_value::<ClosureWrapper>()
        .unwrap();

    let x = make_rational.call(&list![1, 2]).unwrap();
    let y = make_rational.call(&list![2, 4]).unwrap();
    println!(
        "x: {}, y: {}, x==y: {}",
        x,
        y,
        is_equal(&x, &y, get.clone())
    );
    let x = make_rational.call(&list![1, 3]).unwrap();
    let y = make_rational.call(&list![2, 4]).unwrap();
    println!(
        "x: {}, y: {}, x==y: {}",
        x,
        y,
        is_equal(&x, &y, get.clone())
    );
    // 验证complex的equal规则
    let x = make_complex_from_real_imag(1.0.to_listv(), 2.0.to_listv(), get.clone());
    let y = make_complex_from_real_imag(1.0.to_listv(), 2.0.to_listv(), get.clone());
    println!(
        "x: {}, y: {}, x==y: {}",
        x,
        y,
        is_equal(&x, &y, get.clone())
    );

    let x = make_complex_from_real_imag(1.0.to_listv(), 2.0.to_listv(), get.clone());
    let y = make_complex_from_real_imag(1.0.to_listv(), 3.0.to_listv(), get.clone());
    println!(
        "x: {}, y: {}, x==y: {}",
        x,
        y,
        is_equal(&x, &y, get.clone())
    )
}
```
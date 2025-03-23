# 2.5.2 不同类型数据的组合
## 练习2.85
本节正文提到了“简化”数据对象表示的一种方法，就是使之在类型塔中尽可能下降。请设计一个函数drop（下落）​，它能在如练习2.83描述的类型塔中完成这一工作。这里的关键是以某种普适方法判断一个数据对象能否下降。举例说，复数1.5+0i至多可以下降到"real"，复数1+0i至多可以下降到"integer"，而复数2+3i不能下降。下面是一种确定对象能否下降的方案：首先定义一个运算project（投射）​，它把对象在类型塔中“向下压”​。例如，project复数就是丢掉其虚部。这样，如果一个数能下降，条件就是我们先project对它做投射，而后再把结果raise到原始类型，得到的东西与初始的东西相等。请阐述实现这一想法的具体细节，并写出一个drop函数，使它可以把一个对象尽可能下降。你需要设计各种投射函数，并需要把project作为通用型操作安装到系统里。你还需要使用通用型的相等谓词，例如练习2.79所描述的。最后，请利用drop重写练习2.84的apply_generic，使之可以“简化”得到的结果。

## 解答
#### 重要说明
1. 关于`apply_generic`的直接修改问题
    * 由于`apply_generic`函数的签名限制(影响较多历史习题解答)，无法直接在`apply_generic`内实现`drop`。因此，通过定义一个`apply_generic_drop_wrapper`函数来模拟。
2. 关于浮点数投射到有理数的问题
    * 由于自定义的浮点数比较函数`partial_eq`较为严格，`real -> rational`的投射操作容易失败。

#### 代码实现
以下是完整代码，包含所有函数的实现以及测试代码：
```rust
use std::{i32, rc::Rc};

use sicp_rs::{
    ch2::{
        ch2_4::{apply_generic, type_tag},
        ch2_5::{
            arithmetic_type_raise, install_arithmetic_package, is_arithmetic_type,
            make_complex_from_real_imag, make_javascript_integer, make_javascript_number,
            make_rational, raise, real_part,
        },
    },
    ch3::ch3_3::make_table_2d,
    prelude::*,
};

// 安装 project 投射操作
fn install_arithmetic_project_package(optable: Rc<dyn Fn(&str) -> ClosureWrapper>) -> Option<List> {
    let op_cloned = optable.clone();
    let get = move |args: List| optable("lookup").call(&args);
    let put = move |args: List| op_cloned("insert").call(&args);
    // project complex to real
    let get_cloned = get.clone();
    put(list![
        "project",
        list!["complex"],
        ClosureWrapper::new(move |args| {
            let real = real_part(&args.head(), get_cloned.clone());
            Some(make_javascript_number(real, get_cloned.clone()))
        })
    ]);
    // project real to rational
    let get_cloned = get.clone();
    put(list![
        "project",
        list!["javascript_number"],
        ClosureWrapper::new(move |args| {
            let real = args.head();
            let real = real.try_as_basis_value::<f64>().unwrap();
            let (numer, denom) = float_to_fraction(*real, i32::MAX);

            Some(make_rational(
                numer.to_listv(),
                denom.to_listv(),
                get_cloned.clone(),
            ))
        })
    ]);
    // project rational to integer
    let get_cloned = get.clone();
    put(list![
        "project",
        list!["rational"],
        ClosureWrapper::new(move |args| {
            let numer = args.head().head();
            let denom = args.head().tail();
            let numer = *numer.try_as_basis_value::<i32>().unwrap() as f64;
            let denom = *denom.try_as_basis_value::<i32>().unwrap() as f64;
            let i = (numer / denom).floor() as i32;
            Some(make_javascript_integer(i.to_listv(), get_cloned.clone()))
        })
    ]);

    Some("done".to_string().to_listv())
}
// 将浮点数转换为分数（分子和分母）
// 使用连续分数法（Continued Fraction Method）
// # 参数
// - `x`: 待转换的浮点数
// - `max_denominator`: 分母的最大值，用于限制精度
// # 返回值
// 返回一个元组 `(numerator, denominator)`，分别是分子和分母
fn float_to_fraction(x: f64, max_denominator: i32) -> (i32, i32) {
    // 如果输入为负数，先处理符号
    let negative = x < 0.0; // 判断是否为负数
    let mut x = x.abs(); // 如果是负数，取绝对值处理

    // 初始化分子和分母
    let mut numer0: i32 = 0; // 分子 numer_{-1}
    let mut numer1: i32 = 1; // 分子 numer_0
    let mut denom0: i32 = 1; // 分母 denom_{-1}
    let mut denom1: i32 = 0; // 分母 denom_0

    // 当前的整数部分
    let mut a = x.floor() as i32; // 提取整数部分 \( a_0 = \lfloor x \rfloor \)

    while denom1 < max_denominator {
        // 更新分子和分母
        // let numer2 = a * numer1 + numer0; // \( numer_{n+1} = a_n \cdot numer_n + numer_{n-1} \)
        // let denom2 = a * denom1 + denom0; // \( denom_{n+1} = a_n \cdot denom_n + denom_{n-1} \)

        // 检查乘法和加法是否会溢出
        if let Some(numer2) = a.checked_mul(numer1).and_then(|v| v.checked_add(numer0)) {
            if let Some(denom2) = a.checked_mul(denom1).and_then(|v| v.checked_add(denom0)) {
                // 如果没有溢出，更新分子和分母
                if denom2 > max_denominator {
                    break;
                }
                numer0 = numer1;
                numer1 = numer2;
                denom0 = denom1;
                denom1 = denom2;
            } else {
                // 如果分母计算溢出，终止计算
                break;
            }
        } else {
            // 如果分子计算溢出，终止计算
            break;
        }

        // 更新小数部分
        x = x - a as f64; // 计算小数部分
        if x.abs().to_listv() == 0.0.to_listv() {
            // 如果小数部分接近 0，停止迭代
            break;
        }

        x = 1.0 / x; // \( x = \frac{1}{x} \)
        a = x.floor() as i32; // 提取新的整数部分
    }

    // 如果是负数，调整符号
    if negative {
        (numer1 * -1, denom1)
    } else {
        (numer1, denom1)
    }
}
// 投射操作：将对象在类型塔中向下压
fn project(x: &List, get: impl Fn(List) -> Option<List> + 'static) -> List {
    if !is_arithmetic_type(x) || type_tag(x) == "integer".to_listv() {
        x.clone()
    } else {
        apply_generic(&"project".to_listv(), &list![x.clone()], get).unwrap()
    }
}

// drop 函数：将对象尽可能下降
fn drop(x: &List, optable: Rc<dyn Fn(&str) -> ClosureWrapper>) -> List {
    let op_cloned = optable.clone();
    let get = move |args: List| optable("lookup").call(&args);
    let new_x = project(x, get.clone());
    if raise(&new_x, get.clone()) == *x {
        drop(&new_x, op_cloned)
    } else {
        x.clone()
    }
}
fn apply_generic_drop_wrapper(
    op: &List,
    args: &List,
    optable: Rc<dyn Fn(&str) -> ClosureWrapper>,
) -> Option<List> {
    let op_cloned = optable.clone();
    let get = move |args: List| optable("lookup").call(&args);
    let (a1, a2) = (args.head(), args.tail().head());
    let (a1, a2) = if is_arithmetic_type(&a1) && is_arithmetic_type(&a2) {
        arithmetic_type_raise(a1.clone(), a2.clone(), op_cloned.clone())
    } else {
        (a1.clone(), a2.clone())
    };
    let res = apply_generic(op, &list![a1, a2], get);
    if let Some(res) = res {
        if is_arithmetic_type(&res) {
            Some(drop(&res, op_cloned))
        } else {
            Some(res)
        }
    } else {
        None
    }
}
fn main() {
    let optable = make_table_2d();
    install_arithmetic_package(optable.clone());
    install_arithmetic_project_package(optable.clone());

    let op_cloned = optable.clone();
    let get = move |args: List| op_cloned("lookup").call(&args);

    // 创建测试数据
    let complex1 = make_complex_from_real_imag(1.5.to_listv(), 0.0.to_listv(), get.clone());
    let complex2 = make_complex_from_real_imag(1.3.to_listv(), 0.0.to_listv(), get.clone());
    let complex3 = make_complex_from_real_imag(
        0.333333333333333333333333333.to_listv(),
        0.0.to_listv(),
        get.clone(),
    );
    let complex4 = make_complex_from_real_imag(1.0.to_listv(), 0.0.to_listv(), get.clone());
    let complex5 = make_complex_from_real_imag(2.0.to_listv(), 3.0.to_listv(), get.clone());

    // 测试 drop 函数
    println!("Original complex1: {}", complex1);
    println!("Dropped complex1: {}", drop(&complex1, optable.clone()));
    println!("Original complex2: {}", complex2);
    println!("Dropped complex2: {}", drop(&complex2, optable.clone()));
    println!("Original complex3: {}", complex3);
    println!("Dropped complex3: {}", drop(&complex3, optable.clone()));
    println!("Original complex4: {}", complex4);
    println!("Dropped complex4: {}", drop(&complex4, optable.clone()));
    println!("Original complex5: {}", complex5);
    println!("Dropped complex5: {}", drop(&complex5, optable.clone()));

    // 测试 apply_generic_drop_wrapper 函数
    let int1 = make_javascript_integer(5.to_listv(), get.clone());
    let rat1 = make_rational(3.to_listv(), 4.to_listv(), get.clone());
    let js_num1 = make_javascript_number(2.5.to_listv(), get.clone());

    let op = "add".to_listv();
    let args = list![int1.clone(), rat1.clone()];

    let result = apply_generic_drop_wrapper(&op, &args, optable.clone());
    println!(
        "Result of adding {} and {}: {}",
        int1,
        rat1,
        result.unwrap()
    );

    let args = list![rat1.clone(), js_num1.clone()];
    let result = apply_generic_drop_wrapper(&op, &args, optable.clone());
    println!(
        "Result of adding {} and {}: {}",
        rat1,
        js_num1,
        result.unwrap()
    );

    let args = list![js_num1.clone(), complex1.clone()];
    let result = apply_generic_drop_wrapper(&op, &args, optable.clone());
    println!(
        "Result of adding {} and {}: {}",
        js_num1,
        complex1,
        result.unwrap()
    );
}
```
#### 运行结果
```rust
Original complex1: (complex, (rectangular, (1.5, 0.0)))
Dropped complex1: (rational, (3, 2))
Original complex2: (complex, (rectangular, (1.3, 0.0)))
Dropped complex2: (rational, (13, 10))
Original complex3: (complex, (rectangular, (0.3333333333333333, 0.0)))
Dropped complex3: (rational, (1, 3))
Original complex4: (complex, (rectangular, (1.0, 0.0)))
Dropped complex4: (integer, 1)
Original complex5: (complex, (rectangular, (2.0, 3.0)))
Dropped complex5: (complex, (rectangular, (2.0, 3.0)))
Result of adding (integer, 5) and (rational, (3, 4)): (rational, (23, 4))
Result of adding (rational, (3, 4)) and 2.5: (rational, (13, 4))
Result of adding 2.5 and (complex, (rectangular, (1.5, 0.0))): (integer, 4)
```
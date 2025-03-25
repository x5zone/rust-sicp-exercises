# 2.5.2 不同类型数据的组合
## 练习2.85
本节正文提到了“简化”数据对象表示的一种方法，就是使之在类型塔中尽可能下降。请设计一个函数drop（下落）​，它能在如练习2.83描述的类型塔中完成这一工作。这里的关键是以某种普适方法判断一个数据对象能否下降。举例说，复数1.5+0i至多可以下降到"real"，复数1+0i至多可以下降到"integer"，而复数2+3i不能下降。下面是一种确定对象能否下降的方案：首先定义一个运算project（投射）​，它把对象在类型塔中“向下压”​。例如，project复数就是丢掉其虚部。这样，如果一个数能下降，条件就是我们先project对它做投射，而后再把结果raise到原始类型，得到的东西与初始的东西相等。请阐述实现这一想法的具体细节，并写出一个drop函数，使它可以把一个对象尽可能下降。你需要设计各种投射函数，并需要把project作为通用型操作安装到系统里。你还需要使用通用型的相等谓词，例如练习2.79所描述的。最后，请利用drop重写练习2.84的apply_generic，使之可以“简化”得到的结果。

## 解答
#### 输出结果
```rust
Original complex1: (complex, (rectangular, (1.5, 0.0)))
Dropped complex1: (rational, (3, 2))
Original complex2: (complex, (rectangular, (1.3, 0.0)))
Dropped complex2: (rational, (13, 10))
Original complex3: (complex, (rectangular, (0.3333333333333333, 0.0)))
Dropped complex3: (rational, (1, 3))
Original complex4: (complex, (rectangular, (1.0, 0.0)))
Dropped complex4: 1
Original complex5: (complex, (rectangular, (2.0, 3.0)))
Dropped complex5: (complex, (rectangular, (2.0, 3.0)))
result of adding 5 and (rational, (3, 4)): drop to (rational, (23, 4))
result of adding (rational, (3, 4)) and 2.5: drop to (rational, (13, 4))
result of adding 2.5 and (complex, (rectangular, (1.5, 0.0))): drop to 4
```
#### 代码实现
##### main函数
```rust
use sicp_rs::{
    ch2::ch2_5::{
        ArithmeticContext, install_arithmetic_package, make_complex_from_real_imag, make_float,
        make_integer, make_rational,
    },
    prelude::*,
};

fn main() {
    // 创建通用算术包上下文
    let arith = ArithmeticContext::new();
    install_arithmetic_package(&arith);

    // 创建测试数据
    let complex1 = make_complex_from_real_imag(1.5.to_listv(), 0.0.to_listv(), &arith);
    let complex2 = make_complex_from_real_imag(1.3.to_listv(), 0.0.to_listv(), &arith);
    let complex3 = make_complex_from_real_imag(
        0.333333333333333333333333333.to_listv(),
        0.0.to_listv(),
        &arith,
    );
    let complex4 = make_complex_from_real_imag(1.0.to_listv(), 0.0.to_listv(), &arith);
    let complex5 = make_complex_from_real_imag(2.0.to_listv(), 3.0.to_listv(), &arith);

    // 测试 drop 函数
    println!("Original complex1: {}", complex1);
    println!("Dropped complex1: {}", arith.drop(&complex1));
    println!("Original complex2: {}", complex2);
    println!("Dropped complex2: {}", arith.drop(&complex2));
    println!("Original complex3: {}", complex3);
    println!("Dropped complex3: {}", arith.drop(&complex3));
    println!("Original complex4: {}", complex4);
    println!("Dropped complex4: {}", arith.drop(&complex4));
    println!("Original complex5: {}", complex5);
    println!("Dropped complex5: {}", arith.drop(&complex5));

    let int1 = make_integer(5, &arith);
    let rat1 = make_rational(3.to_listv(), 4.to_listv(), &arith);
    let float1 = make_float(2.5, &arith);

    let args = list![int1.clone(), rat1.clone()];
    println!(
        "result of adding {} and {}: drop to {}",
        int1,
        rat1,
        arith.drop(&arith.apply_generic("add", &args).unwrap())
    );

    let args = list![rat1.clone(), float1.clone()];

    println!(
        "result of adding {} and {}: drop to {}",
        rat1,
        float1,
        arith.drop(&arith.apply_generic("add", &args).unwrap())
    );

    let args = list![float1.clone(), complex1.clone()];

    println!(
        "result of adding {} and {}: drop to {}",
        float1,
        complex1,
        arith.drop(&arith.apply_generic("add", &args).unwrap())
    );
}
```
##### 依赖lib
```rust
impl ArithmeticContext {
    pub fn project(&self, x: &List) -> List {
        // only project for basis arith type and if x is not an integer
        if !is_basis_arithmetic_type(x) || type_tag(x) == "integer".to_listv() {
            x.clone()
        } else {
            apply_generic(&"project".to_listv(), &list![x.clone()], self).unwrap()
        }
    }
    pub fn drop(&self, x: &List) -> List {
        let new_x = self.project(x);
        if self.is_equal(&self.raise(&new_x), &x) == true.to_listv()
            && type_tag(x) != "integer".to_listv()
        // integer已无法继续drop
        {
            self.drop(&new_x)
        } else {
            x.clone()
        }
    }
}
    // project complex to real
    arith.put("project", list!["complex"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args| {
            let real = arith.real_part(args);
            let real = if type_tag(&real).to_listv() == "integer".to_listv() {
                *(real.try_as_basis_value::<i32>().unwrap()) as f64
            } else if type_tag(&real) == "float".to_listv() {
                *real.try_as_basis_value::<f64>().unwrap()
            } else if type_tag(&real) == "rational".to_listv() {
                *(arith.raise(&real).try_as_basis_value::<f64>().unwrap())
            } else {
                eprintln!("project complex to real only support basis arithmetic type");
                return None;
            };

            Some(make_float(real, &arith))
        })
    });
    // project real to rational
    arith.put("project", list!["float"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args| {
            let real = args.head();
            let real = real.try_as_basis_value::<f64>().unwrap();
            let (numer, denom) = float_to_fraction(*real, i32::MAX);
            Some(make_rational(numer.to_listv(), denom.to_listv(), &arith))
        })
    });
    // project rational to integer
    arith.put("project", list!["rational"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args| {
            // 调用链中有apply_generic的调用，需要使用 tag 函数重新附加数据类型标签
            let n = arith.numer(&tag(args.head()));
            let d = arith.denom(&tag(args.head()));
            if type_tag(&n) == "integer".to_listv() && type_tag(&d) == "integer".to_listv() {
                let numer = *n.try_as_basis_value::<i32>().unwrap() as f64;
                let denom = *d.try_as_basis_value::<i32>().unwrap() as f64;
                let i = (numer / denom).floor() as i32;
                Some(make_integer(i, &arith))
            } else {
                eprintln!(
                    "project: rational to integer error: numer&denom only support integer found {}",
                    args
                );
                None
            }
        })
    });
// 将浮点数转换为分数（分子和分母）
// 使用连续分数法（Continued Fraction Method）
// # 参数
// - `x`: 待转换的浮点数
// - `max_denominator`: 分母的最大值，用于限制精度
// # 返回值
// 返回一个元组 `(numerator, denominator)`，分别是分子和分母
pub fn float_to_fraction(x: f64, max_denominator: i32) -> (i32, i32) {
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
```
#### 补充说明
关于浮点数投射到有理数的问题
* 由于自定义的浮点数比较函数`partial_eq`较为严格，`real -> rational`的投射操作容易失败。

# 2.5.2 不同类型数据的组合
## 练习2.86
假定我们希望处理复数，它们的实部、虚部、模和幅角都可以是常规数值、有理数，或者我们希望加入系统的任何其他数值类型。请完成这一设想，描述并实现系统需要做的各种修改。注意，你将不得不设法把普通运算，例如sine和cosine之类，也定义为在常规数和有理数上的通用运算。

## 解答
#### 基本思路

1. 通用数值类型的处理：
    * 复数的构成部分（`f64`）可直接以（`integer`,`rational`,`float`）等类型替换。
        ```rust
        arith.put("make_from_real_imag", list!["rectangular"], {
            let tag = tag.clone();
            ClosureWrapper::new(move |args| {
                let (x, y) = (args.head(), args.tail().head());
                // let x = *(x.try_as_basis_value::<f64>().unwrap());
                // let y = *(y.try_as_basis_value::<f64>().unwrap());
                // Some(tag(&pair![x, y]))
                Some(tag(&pair!(x, y))) //may be integer,rational,float
            })
        });
        ```
    * 任何数值类型都可通过**提升（raise）** 操作，将不同的数值类型提升到更通用的浮点数（`f64`）进行计算。这满足了题目要求：实部、虚部、模和幅角可以是常规数值、有理数或其他扩展类型。
    * 提升到`f64`后的结果可能无法直接返回到原有类型，但这仍然符合题意。

2. 操作的扩展：
    * 我们需要将常规运算（如`sqrt`、`sin`、`cos`等）定义为在常规数值和有理数上的通用操作。
    * 以`sqrt`（平方根）为例，我们为整数、有理数和浮点数分别实现了`sqrt`操作。

3. 复数的扩展：
    * 我们实现了扩展复数（`complex`），其实部和虚部可以是任意支持的数值类型。
    * 以直角坐标形式（`rectangular`）表示扩展复数，并实现了获取实部、虚部和模的操作。

4. 未完整实现的部分：
    * 由于代码量较大，完整实现所有操作（如`sin`、`cos`、幅角计算等）会显得冗长，因此这里只实现了`sqrt`和复数的部分功能（获取实部、虚部和模），其他操作可以按照类似的方式扩展。

#### 输出结果
```rust
test sqrt operation...
sqrt(9) = 3
sqrt(4/9) = (rational, (2, 3))

test complex numbers...
created complex number: (complex, (rectangular, ((rational, (3, 1)), 4)))
real part of complex: (rational, (3, 1))
imaginary part of complex: 4
magnitude of complex: 5
```

#### 代码实现
##### main函数
```rust
use sicp_rs::{
    ch2::ch2_5::{
        ArithmeticContext, install_arithmetic_package, make_complex_from_real_imag, make_integer,
        make_rational,
    },
    prelude::*,
};

fn main() {
    let arith = ArithmeticContext::new();
    install_arithmetic_package(&arith);

    // 测试 sqrt 操作
    println!("test sqrt operation...");
    let int_test = make_integer(9, &arith);
    println!("sqrt(9) = {}", arith.sqrt(&int_test));

    let rational_test = make_rational(4.to_listv(), 9.to_listv(), &arith);
    println!("sqrt(4/9) = {}", arith.sqrt(&rational_test));

    // 测试创建扩展复数
    println!("\ntest complex numbers...");
    let real_p = make_rational(3.to_listv(), 1.to_listv(), &arith); // 实部 3
    let imag_p = make_integer(4, &arith); // 虚部 4
    let complex = make_complex_from_real_imag(real_p.clone(), imag_p.clone(), &arith);
    println!("created complex number: {}", complex);

    // 测试复数的实部、虚部和模
    let real_result = arith.real_part(&complex);
    println!("real part of complex: {}", real_result);

    let imag_result = arith.imag_part(&complex);
    println!("imaginary part of complex: {}", imag_result);

    let magnitude_result = arith.magnitude(&complex);
    println!("magnitude of complex: {}", magnitude_result);
}
```
##### 依赖lib
```rust
impl ArithmeticContext {
    pub fn sqrt(&self, x: &List) -> List {
        assert!(
            is_basis_arithmetic_type(x) && type_tag(x) != "complex".to_listv(),
            "sqrt only for (integer, rational, float)"
        );
        self.apply_generic(&"sqrt", &list![x.clone()]).unwrap()
    }
}
    // sqrt integer
    arith.put("sqrt", list!["integer"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args| {
            let x = *(args
                .head()
                .try_as_basis_value::<i32>()
                .expect("sqrt integer: integer must be i32"));
            let x = arith.drop_to_type(
                &make_float((x as f64).sqrt(), &arith),
                "integer".to_string(),
            );
            // 返回值可能不是integer
            Some(x)
        })
    });
    // sqrt float
    arith.put("sqrt", list!["float"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args| {
            let x = *(args
                .head()
                .try_as_basis_value::<f64>()
                .expect("sqrt float: float must be f64"));
            Some(make_float(x.sqrt(), &arith))
        })
    });
    // sqrt rational
    arith.put("sqrt", list!["rational"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args| {
            // 调用链中有apply_generic的调用，需要使用 tag 函数重新附加数据类型标签
            let n = arith.numer(&tag(args.head()));
            let d = arith.denom(&tag(args.head()));
            // try drop to integer
            let (n, d) = (arith.drop(&n), arith.drop(&d));
            if type_tag(&n) == "integer".to_listv() && type_tag(&d) == "integer".to_listv() {
                let n = n
                    .try_as_basis_value::<i32>()
                    .expect("sqrt rational with integer error");
                let d = d
                    .try_as_basis_value::<i32>()
                    .expect("sqrt rational with integer error");
                let f = make_float(((*n as f64) / (*d as f64)).sqrt(), &arith);
                // 返回值可能不是rational
                Some(arith.drop_to_type(&f, "rational".to_string()))
            } else {
                panic!("sqrt rational error, not support {} to sqrt", args);
            }
        })
    });
    arith.put("magnitude", list!["rectangular"], {
        let extract = extract_real_imag.clone();
        let arith = arith.clone();
        ClosureWrapper::new(move |args| {
            let (real, imag) = extract(&args.head());
            if is_basis_arithmetic_type(&real)
                && type_tag(&real) != "complex".to_listv()
                && is_basis_arithmetic_type(&real)
                && type_tag(&real) != "complex".to_listv()
            {
                // sqrt only for (integer, rational, float)
                // (real*real + imag*imag).sqrt()
                let r2 = arith.mul(&real, &real);         // 使用通用算术包乘法
                let i2 = arith.mul(&imag, &imag);
                let x = arith.add(&r2, &i2);              // 使用通用算术包加法
                Some(arith.drop(&arith.sqrt(&x)))         // 使用通用算术包sqrt
            } else {
                panic!("complex magnitude not support for {}", args);
            }
        })
    });
    // 可对比magnitude与angle的不同点
    arith.put("angle", list!["rectangular"], {
        let extract = extract_real_imag.clone();
        ClosureWrapper::new(move |args| {
            let (real, imag) = extract(&args.head());
            if real.is_float_value() && imag.is_float_value() {
                let r = real
                    .try_as_basis_value::<f64>()
                    .expect("complex: float type only support f64");
                let i = imag
                    .try_as_basis_value::<f64>()
                    .expect("complex: float type only support f64");
                Some((i.atan2(*r)).to_listv())            // 转换为f64后直接计算
            } else {
                todo!("complex angle Now only support f64")
            }
        })
    });

```
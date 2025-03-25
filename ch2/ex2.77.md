# 2.5.1 通用型算术运算
## 练习2.77
Louis Reasoner试着求值magnitude(z)，其中z是图2.24里的那个对象。
![alt text](ex2.77.png)
令他吃惊的是，apply_generic得到的不是5而是一个错误信息，说没办法对类型("complex")做操作magnitude。他把这次交互的情况拿给AlyssaP.Hacker看，Alyssa说“问题出在没有为"complex"数定义复数的选择函数，而是只为"polar"和"rectangular"数定义了它们。你需要做的就是在complex 包里加入下面这些东西”​：
```javascript
put('real-part', list("complex"), real-part);
put('imag-part', list("complex"), imag-part);
put('magnitude', list("complex"), magnitude);
put('angle', list("complex"), angle);
```
请详细说明为什么这样做可行。作为例子，请考虑表达式magnitude(z)的求值过程，其中z就是图2.24展示的那个对象。请追踪这个求值过程中的所有函数调用，特别地，请看看apply_generic被调用了几次？每次调用分派到哪个函数？

## 解答
#### 为什么这样做可行？
`complex`类型的数实际上是通过`rectangular` 或`polar`表示的。通过为`"complex"`类型定义这些选择函数，它们会递归调用底层的`rectangular`或`polar`包中的对应函数，从而完成操作。
#### 以`magnitude(z)`为例的求值过程
假设`z`是图 2.24 中的对象，表示为：
```javascript
("complex", ("rectangular", (3.0, 4.0)))
```
我们追踪`magnitude(z)`的求值过程，特别是`apply_generic`的调用情况：
1. 调用`magnitude(z)`，函数`apply_generic`被调用。
    * 它提取`z`的类型标签，得到`"complex"`。
    * 调用`get("magnitude", list("complex"))`，找到`"complex"`类型的`magnitude`函数。
    * 剥去一层标签后，调用`"complex"`的`magnitude`函数。

2. `"complex"`的`magnitude`函数再次调用`apply_generic`。
    * 它提取被剥去标签后的类型标签，得到`"rectangular"`。
    * 调用`get("magnitude", list("rectangular"))`，找到`"rectangular"``类型的`magnitude`函数。
    * 调用`"rectangular"`的`magnitude`函数，计算结果为$\sqrt{3^2+4^2}=5.0$。

最终结果为`5.0`。

#### `apply_generic`的调用次数

在这个例子中，`apply_generic`被调用了**四次**：
1. 第一次处理`"complex"`类型，找到`"complex"`的`magnitude`函数。
2. 第二次处理`"rectangular"`类型，找到`"rectangular"`的`magnitude`函数。
3. 第二次处理`"rectangular"`类型，找到`"rectangular"`的`real_part`函数。
    * 取决于magnitude的具体实现，亦可直接解出实部，不调用real_part。
4. 第二次处理`"rectangular"`类型，找到`"rectangular"`的`imag_part`函数（取决于magnitude的具体实现）。

#### Rust输出
运行程序后，输出如下：
```rust
(complex, (rectangular, (3.0, 4.0)))
magnitude (complex, (rectangular, (3.0, 4.0)))
apply generic op:magnitude, args:((complex, (rectangular, (3.0, 4.0))), Nil)
magnitude ((rectangular, (3.0, 4.0)), Nil)
apply generic op:magnitude, args:((rectangular, (3.0, 4.0)), Nil)
apply generic op:real_part, args:((rectangular, (3.0, 4.0)), Nil)
apply generic op:imag_part, args:((rectangular, (3.0, 4.0)), Nil)
5.0
```
#### 完整代码
```rust
use sicp_rs::ch2::ch2_5::ArithmeticContext;
use sicp_rs::ch2::ch2_5::{attach_tag, contents, type_tag};

use sicp_rs::prelude::*;
// 通用型操作：根据操作符和参数调用对应的函数
fn apply_generic(op: &List, args: &List, arith: &ArithmeticContext) -> Option<List> {
    let args = if args.head().is_pair() && args.head().head().is_pair() {
        // 处理可能由于apply_generic导致的嵌套列表
        args.flatmap(|x| x.clone())
    } else {
        args.clone()
    };
    println!("apply generic op:{}, args:{}", op, args);
    let type_tags = args.map(|x| type_tag(x));
    if let Some(op) = arith.get(list![op.clone(), type_tags]) {
        op.call(&args.map(|x| contents(x)))
    } else {
        panic!(
            "apply_generic no method for these types op:{}, args:{}",
            op, args
        )
    }
}
fn real_part(z: &List, arith: &ArithmeticContext) -> List {
    apply_generic(&"real_part".to_listv(), &list![z.clone()], arith).unwrap()
}
fn imag_part(z: &List, arith: &ArithmeticContext) -> List {
    apply_generic(&"imag_part".to_listv(), &list![z.clone()], arith).unwrap()
}
fn magnitude(z: &List, arith: &ArithmeticContext) -> List {
    println!("magnitude {}", z);
    apply_generic(&"magnitude".to_listv(), &list![z.clone()], arith).unwrap()
}
fn install_rectangular_package(arith: &ArithmeticContext) -> Option<List> {
    let tag = |x: &List| attach_tag("rectangular", x);
    arith.put("make_from_real_imag", list!["rectangular"], {
        let tag = tag.clone();
        ClosureWrapper::new(move |args| {
            let (x, y) = (args.head(), args.tail().head());
            Some(tag(&pair!(x, y)))
        })
    });
    arith.put("real_part", list!["rectangular"], {
        ClosureWrapper::new(move |args| Some(args.head().head()))
    });
    arith.put("imag_part", list!["rectangular"], {
        ClosureWrapper::new(move |args| Some(args.head().tail()))
    });

    let extract_real_imag = {
        let arith = arith.clone();
        let tag = tag.clone();
        move |arg: &List| {
            // 使用 tag 函数重新附加数据类型标签：
            // apply_generic 在处理参数时会移除类型标签，
            // 这里通过 tag 函数重新为参数附加类型标签，以便后续操作能够识别数据类型。
            let args = tag(arg);
            let (real_x, imag_x) = (real_part(&args, &arith), imag_part(&args, &arith));
            (real_x, imag_x)
        }
    };
    arith.put("magnitude", list!["rectangular"], {
        let extract = extract_real_imag.clone();
        ClosureWrapper::new(move |args| {
            let (real, imag) = extract(&args.head());
            if real.is_float_value() && imag.is_float_value() {
                let r = real.try_as_basis_value::<f64>().unwrap();
                let i = imag.try_as_basis_value::<f64>().unwrap();
                Some((r * r + i * i).sqrt().to_listv())
            } else {
                panic!("Now only support f64")
            }
        })
    });
    Some("done".to_string().to_listv())
}

fn install_complex_package(arith: &ArithmeticContext) -> Option<List> {
    let tag = |x| attach_tag("complex", &x);
    arith.put("make_from_real_imag", list!["complex"], {
        let tag = tag.clone();
        let arith = arith.clone();
        ClosureWrapper::new(move |args| {
            let (x, y) = (args.head(), args.tail().head());
            if let Some(complex) = arith
                .get(list!["make_from_real_imag", list!["rectangular"]])
                .expect("make_from_real_imag rectangular failed get func")
                .call(&list![x.clone(), y.clone()])
            {
                Some(tag(complex))
            } else {
                panic!("make_from_real_imag rectangular failed for args:{}", args)
            }
        })
    });

    Some("done".to_string().to_listv())
}
fn make_complex_from_real_imag(x: List, y: List, arith: &ArithmeticContext) -> List {
    if let Some(complex) = arith
        .get(list!["make_from_real_imag", list!["complex"]])
        .expect("make_complex_from_real_imag: arith.get(list![\"make_from_real_imag\", list![\"complex\"]]) failed])")
        .call(&list![x.clone(), y.clone()])
    {
        complex
    } else {
        panic!("make_complex_from_real_imag failed for x:{}, y:{}", x, y)
    }
}

fn main() {
    // 创建通用算术包上下文
    let arith = ArithmeticContext::new();

    println!("{:?}", install_rectangular_package(&arith));
    println!("{:?}", install_complex_package(&arith));
    let a = make_complex_from_real_imag(3.0.to_listv(), 4.0.to_listv(), &arith);
    println!("{}", a);

    if true {
        let magnitude_wrapper = ClosureWrapper::new({
            let arith = arith.clone();
            move |x: &List| Some(magnitude(x, &arith))
        });
        arith.put("magnitude", list!["complex"], magnitude_wrapper);
    } else {
        println!(
            "apply_generic no method for these types op:magnitude, args:((complex, (rectangular, (3.0, 4.0))), Nil)"
        )
    }

    println!("{}", magnitude(&a, &arith))
}
```
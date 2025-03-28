# 2.5.3 实例：符号代数
## 练习2.94
利用div_terms实现函数remainder_terms，并用它定义上面的gcd_terms。再写一个函数gcd_poly计算两个多项式的多项式GCD（如果两个多项式的变元不同，这个函数应该报告错误）​。在系统中安装通用型操作greatest_common_divisor，使得遇到多项式时它能归约到gcd_poly，遇到常规数时能归约到常规的gcd。作为试验，请试试：
```javascript
function gcd(a, b) {
    return b === 0
           ? a
           : gcd(b, a % b);
}
function gcd_terms(a, b) {
    return is_empty_termlist(b)
           ? a
           : gcd_terms(b, remainder_terms(a, b));
}
const p1 = make_polynomial("x", list(make_term(4, 1), make_term(3, -1),
                                     make_term(2, -2), make_term(1, 2)));
const p2 = make_polynomial("x", list(make_term(3, 1), make_term(1, -1)));
greatest_common_divisor(p1, p2);
```
并用手工检查得到的结果。

## 解答
#### 手动检查
我们需要计算以下两个多项式的最大公约数：

$$\frac{x^4 - x^3 - 2x^2 + 2x}{x^3 - x} $$

化简过程如下：
$$= \frac{x(x^3-x^2-2x+2)}{x(x^2-1)} $$
$$= \frac{x(x^2(x-1)-2(x-1))}{x(x-1)(x+1)} $$
$$= \frac{x(x-1)(x^2-2)}{x(x-1)(x+1)} $$

最终结果：
$$ \text{GCD} = x(x - 1) = x^2 - x $$

#### 实现代码

##### lib代码

以下是实现`remainder_terms`、`gcd_terms` 和`gcd_poly`的代码：
```rust
// poly install gcd
    fn remainder_terms(a: &List, b: &List, arith: &ArithmeticContext) -> List {
        div_terms(a, b, arith).tail().head()
    }
    fn gcd_terms(a: &List, b: &List, arith: &ArithmeticContext) -> List {
        if is_empty_term_list(b) {
            a.clone()
        } else {
            gcd_terms(b, &remainder_terms(a, b, arith), arith)
        }
    }
    fn gcd_poly(p1: &List, p2: &List, arith: &ArithmeticContext) -> List {
        // integer and poly also can gcd, such as 2 and 2*x^2 + 2
        if is_same_variable(&variable(p1), &variable(p2)) {
            make_poly(
                variable_not_any(p1, p2),
                gcd_terms(&term_list(p1), &term_list(p2), arith),
            )
        } else {
            panic!(
                "{} Polys not in same var -- GCD-POLY",
                list![p1.clone(), p2.clone()]
            )
        }
    }
    arith.put("gcd", list!["polynomial", "polynomial"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let (p1, p2) = (args.head(), args.tail().head());
            Some(tag(&gcd_poly(&p1, &p2, &arith)))
        })
    });
// integer install gcd
    install_binary_op::<i32>(
        "gcd",
        "integer",
        {
            move |a, b| a.gcd(&b).to_listv()
        },
        arith,
    );
// arith.gcd support
impl ArithmeticContext {
    pub fn gcd(&self, x: &List, y: &List) -> List {
        self.apply_generic(&"gcd", &list![x.clone(), y.clone()]).unwrap()
    }
}
```

#### 输出结果
结果 $−x^2+x$ 是完全正确的，在数学上都是合法的 GCD，只是未归一化为首一形式。
```
==== Test: Polynomial GCD ====
Polynomial p1: (polynomial:1x^4 + -1x^3 + -2x^2 + 2x^1 + 0)
Polynomial p2: (polynomial:1x^3 + -1x^1 + 0)
GCD of p1 and p2: (polynomial:-1x^2 + 1x^1 + 0)

==== Test: Integer and Polynomial GCD ====
Integer: 2
Polynomial: (polynomial:2x^2 + 2)
GCD of integer and polynomial: (polynomial:2)

==== Test Completed ====
```

#### main函数
```rust
use sicp_rs::{
    ch2::ch2_5::{
        ArithmeticContext, install_arithmetic_package, install_dense_terms_package,
        install_polynomial_coercion, install_polynomial_package, install_sparse_terms_package,
        make_polynomial_from_sparse, make_terms_from_sparse, pretty_polynomial,
    },
    prelude::*,
};

fn main() {
    // 初始化 ArithmeticContext
    let mut arith = ArithmeticContext::new();

    install_arithmetic_package(&arith);
    install_sparse_terms_package(&arith);
    install_dense_terms_package(&arith);
    install_polynomial_package(&arith);
    install_polynomial_coercion(&mut arith);

    println!("==== Test: Polynomial GCD ====");

    // 测试两个多项式的最大公约数
    let p1 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(4.to_listv(), 1.to_listv()),  // x^4
                make_term(3.to_listv(), (-1).to_listv()), // -x^3
                make_term(2.to_listv(), (-2).to_listv()), // -2x^2
                make_term(1.to_listv(), 2.to_listv()),   // 2x
            ],
            &arith,
        ),
        &arith,
    );

    let p2 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(3.to_listv(), 1.to_listv()),  // x^3
                make_term(1.to_listv(), (-1).to_listv()), // -x
            ],
            &arith,
        ),
        &arith,
    );

    println!("Polynomial p1: {}", pretty_polynomial(&p1, &arith));
    println!("Polynomial p2: {}", pretty_polynomial(&p2, &arith));

    let gcd_poly = arith.gcd(&p1, &p2);
    println!("GCD of p1 and p2: {}", pretty_polynomial(&gcd_poly, &arith));

    println!("\n==== Test: Integer and Polynomial GCD ====");

    // 测试整数与多项式的最大公约数
    let integer = 2.to_listv();

    let poly = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(2.to_listv(), 2.to_listv()),  // 2x^2
                make_term(0.to_listv(), 2.to_listv()),  // 2
            ],
            &arith,
        ),
        &arith,
    );

    println!("Integer: {}", integer);
    println!("Polynomial: {}", pretty_polynomial(&poly, &arith));

    let gcd_integer_poly = arith.gcd(&integer, &poly);
    println!(
        "GCD of integer and polynomial: {}",
        pretty_polynomial(&gcd_integer_poly, &arith)
    );

    println!("\n==== Test Completed ====");
}
```
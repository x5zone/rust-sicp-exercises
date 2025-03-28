# 2.5.3 实例：符号代数
## 练习2.93
请修改有理数算术包，在其中使用通用型操作，但改写make_rat，使它不再企图把分式化简到最简形式。请对下面两个多项式调用make_rational生成有理函数，以检查你的系统：
```javascript
const p1 = make_polynomial("x", list(make_term(2, 1), make_term(0, 1)));
const p2 = make_polynomial("x", list(make_term(3, 1), make_term(0, 1)));
const rf = make_rational(p2, p1);
```
现在用add把rf与它自己相加。你会看到这个加法函数不能把分式化简到最简形式。

## 解答

#### `make_rat`函数
如习题2.92所示，`make_rat`函数不试图化简分式到最简形式，除非分子和分母均为整数。对于其他类型（如多项式、复数等），直接将分子和分母写入结果：
```rust
    arith.put("make", list!["rational"], {
        let arith = arith.clone();
        let tag = tag.clone();
        ClosureWrapper::new(move |args| {
            let (n, d) = (args.head(), args.tail().head());
            assert!(
                type_tag(&n) != "float".to_listv() && type_tag(&d) != "float".to_listv(),
                "make rational: numer and denom must not float"  // 分子分母为浮点数，数学意义不存在
            );
            if arith.is_equal_to_zero(&d) == true.to_listv() {
                panic!("make rational: zero denominator");
            }

            if type_tag(&n) == "integer".to_listv() && type_tag(&d) == "integer".to_listv() {
                let (n, d) = (
                    n.try_as_basis_value::<i32>()
                        .expect("make rational with integer error"),
                    d.try_as_basis_value::<i32>()
                        .expect("make rational with integer error"),
                );
                // 计算最大公约数
                let g = (*n).gcd(d);
                Some(tag(pair!(n / g, d / g)))
            } else {
                // 对于其他类型（如多项式），直接写入分子和分母
                Some(tag(pair!(n.clone(), d.clone())))         
            }
        })
    });
```

#### 测试代码
```rust
use sicp_rs::{
    ch2::ch2_5::{
        ArithmeticContext, install_arithmetic_package, install_dense_terms_package,
        install_polynomial_coercion, install_polynomial_package, install_sparse_terms_package,
        make_polynomial_from_sparse, make_rational, make_term, make_terms_from_sparse,
        pretty_polynomial,
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

    println!("==== Test: Rational Function Creation and Addition ====");

    // 多项式 p1: x^2 + 1
    let p1 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(2.to_listv(), 1.to_listv()), // x^2
                make_term(0.to_listv(), 1.to_listv()), // 1
            ],
            &arith,
        ),
        &arith,
    );

    // 多项式 p2: x^3 + 1
    let p2 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(3.to_listv(), 1.to_listv()), // x^3
                make_term(0.to_listv(), 1.to_listv()), // 1
            ],
            &arith,
        ),
        &arith,
    );

    println!("Polynomial p1: {}", pretty_polynomial(&p1, &arith));
    println!("Polynomial p2: {}", pretty_polynomial(&p2, &arith));

    // 创建有理函数 rf = p2 / p1
    let rf = make_rational(p2.clone(), p1.clone(), &arith);
    println!("Rational Function rf:");
    println!(
        "  Numerator: {}",
        pretty_polynomial(&arith.numer(&rf), &arith)
    );
    println!(
        "  Denominator: {}",
        pretty_polynomial(&arith.denom(&rf), &arith)
    );

    // 将 rf 与自身相加
    let rf_add = arith.add(&rf, &rf);
    println!("Rational Function rf + rf:");
    println!(
        "  Numerator: {}",
        pretty_polynomial(&arith.numer(&rf_add), &arith)
    );
    println!(
        "  Denominator: {}",
        pretty_polynomial(&arith.denom(&rf_add), &arith)
    );

    println!("\n==== Test Completed ====");
}
```

#### 输出结果
```rust
==== Test: Rational Function Creation and Addition ====
Polynomial p1: (polynomial:1x^2 + 1)
Polynomial p2: (polynomial:1x^3 + 1)
Rational Function rf:
  Numerator: (polynomial:1x^3 + 1)
  Denominator: (polynomial:1x^2 + 1)
Rational Function rf + rf:
  Numerator: (polynomial:2x^5 + 2x^3 + 2x^2 + 2)
  Denominator: (polynomial:1x^4 + 2x^2 + 1)

==== Test Completed ====
```
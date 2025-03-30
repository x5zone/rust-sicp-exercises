# 2.5.3 实例：符号代数
## 练习2.97
至此，我们已经弄清楚了如何把一个有理函数化简到最简形式：
* 用取自练习2.96的gcd_terms版本计算分子和分母的GCD；
* 在得到了GCD之后，用它去除分子和分母之前，先把分子和分母都乘以同一个整数化因子，使得除以这个GCD不会引进非整数的系数。作为整数化因子，你可以用得到的GCD的首项系数的1+O1-O2次幂。其中O2是这个GCD的次数，O1是分子与分母中的次数较大的那个。这样就能保证用这个GCD去除分子和分母时不会引进非整数。
* 这一操作得到的结果分子和分母都具有整数的系数。这些系数通常会由于整数化因子而变得非常大。所以最后一步就是消去这个多余的因子，为此，我们需要先算出分子和分母中所有系数的（整数）最大公约数，而后除去这个公约数。

a.请将上述算法实现为一个函数reduce_terms，它以两个项表n和d为参数，返回一个包含nn和dd的表，它们分别是由n和d通过上面说明的算法简化得到的最简形式。再请另写一个与add_poly类似的函数reduce_poly，它检查两个多项式的变元是否相同。如果是，reduce_poly就剥去变元，并把问题交给reduce_terms，最后为reduce_terms返回的表里的两个项表重新加上变元。
b.请定义一个类似reduce_terms的函数，它的功能就像make_rat对整数做的事情：
```javascript
function reduce_integers(n, d) {
    const g = gcd(n, d);
    return list(n / g, d / g);
}
```
并把reduce定义为一个通用型操作，它调用apply_generic完成分派到reduce_poly（对polynomial参数）或reduce_integers（对javascript_number参数）的工作。现在你很容易让有理数算术包把分式简化到最简形式，为此只需让make_rat在组合给定的分子和分母构造出有理数之前也调用reduce。现在这个系统就能处理整数或多项式的有理表达式了。为了测试你的程序，请先试验下面的扩充练习：
```javascript
const p1 = make_polynomial("x", list(make_term(1, 1), make_term(0, 1)));
const p2 = make_polynomial("x", list(make_term(3, 1), make_term(0, -1)));
const p3 = make_polynomial("x", list(make_term(1, 1)));
const p4 = make_polynomial("x", list(make_term(2, 1), make_term(0, -1)));

const rf1 = make_rational(p1, p2);
const rf2 = make_rational(p3, p4);

add(rf1, rf2);
```
看看能否得到正确结果，结果是否被正确地化简为最简形式。

## 解答
#### 多项式的定义

在多项式代数中，多项式的**最大公因式（GCD）** 是指两个多项式的最高次项的最大公因式，它满足以下几个条件：

1. 多项式形式最简
    * 多项式 GCD 不包含多项式系数的公共因子（即系数被约简到最简形式）。例如：$gcd(2x,2x^2+2x)=x$，其中 $x$ 是多项式的最大公因式，而系数 $2$ 已被约简掉。

2. 唯一性
    * 在一个约定的系数域（如整数或有理数）中，GCD 是唯一的。如果系数未约简，则 GCD 不唯一。

3. 性质
    * 如果 $d(x)$ 是多项式 $a(x)$ 和 $b(x)$ 的最大公因式，则 $d(x)$ 是 $a(x)$ 和 $b(x)$ 的所有公因式的倍数。
        * 这里的“最大”是指：
            * $d(x)$ 的次数最高；
            * $d(x)$ 的系数被约简到最简形式。

    * $d(x)$ 的系数约简后，最高次项的系数为 $1$（标准化）。

#### 解题思路

为解决$gcd(2x, 2x^2+2x) = x$的问题，在习题2.96中已完成了以下两步:

1. 得到最简的 GCD：
    * 找到分子和分母的最大公因式（多项式 GCD）。
    * 消除所有系数的公共因子，使得 GCD 的系数是最简形式。
    * 例如 $gcd(2x, 2x^2+2x) = x$，其中多项式gcd是$x$，系数多项式是$2$。

2. 化简分子和分母所有系数的公共 GCD：
    * 在计算 GCD 时，已经将分子和分母的系数的最大公约数乘回到最终的 GCD 中，从而间接完成了对分子和分母的化简。

那么实际上已经完成了本习题中`reduce_terms`的功能。换句话说，`gcd_terms` 已经是一个扩展版的`reduce`，它不仅计算了 GCD，还完成了化简分子和分母的所有系数的公共因子。
```rust
    fn gcd_terms(a: &List, b: &List, arith: &ArithmeticContext) -> List {
        if is_empty_term_list(b) {
            a.clone()
        } else {
            //let result = gcd_terms(b, &remainder_terms(a, b, arith), arith);
            let result = gcd_terms(b, &pseudoremainder_terms(a, b, arith), arith);

            // 计算最简 GCD
            let simplified_gcd = simplify_terms_coeffs(&result, arith);
            // 计算 poly1 和 poly2 的所有系数的 GCD
            let coeff_gcd1 = term_list_coeffs_gcd(a, arith);
            let coeff_gcd2 = term_list_coeffs_gcd(b, arith);
            let coeff_gcd = arith.gcd(&coeff_gcd1, &coeff_gcd2);
            // simplify(gcd(2, 2x^2)) = 1; simplify从答案的所有系数中清除公因子，所以需要再乘回系数gcd
            // 将系数 GCD 乘回最简 GCD
            let coeff_gcd_term =
                make_terms_from_sparse(&list![make_term(0.to_listv(), coeff_gcd)], arith);
            let final_gcd = mul_terms(&simplified_gcd, &coeff_gcd_term, arith);

            let final_first_coeff = coeff(&pure_first_term(&arith.first_term(&final_gcd)));
            let final_gcd = if final_first_coeff < 0.to_listv() {
                negative_terms(&final_gcd, arith)
            } else {
                final_gcd
            };
            final_gcd
        }
    }
```
#### a. 实现 reduce_terms 和 reduce_poly
###### reduce_terms

`reduce_terms(n, d)`接受两个项表$n$ 和 $d$，返回化简后的两个项表 $nn$ 和 $dd$。实现如下：
```rust
    fn reduce_terms(n: &List, d: &List, arith: &ArithmeticContext) -> (List, List) {
        let g = gcd_terms(n, d, arith);
        // gcd中已包含了系数的最大公约数，所以直接用gcd去除即可
        let (nn, dd) = (
            div_terms(n, &g, arith).head(),
            div_terms(d, &g, arith).head(),
        );
        (nn, dd)
```
###### reduce_poly

`reduce_poly(n, d)` 会检查两个多项式是否具有相同的变元。如果是，将其剥去变元，并调用`reduce_terms`化简项表，再将变元加回去。实现如下：
```rust
    fn reduce_poly(n: &List, d: &List, arith: &ArithmeticContext) -> (List, List) {
        if is_same_variable(&variable(n), &variable(d)) {
            let (nn, dd) = reduce_terms(&term_list(n), &term_list(d), arith);
            let var_tag = variable_not_any(n, d);
            (make_poly(var_tag.clone(), nn), make_poly(var_tag, dd))
        } else {
            panic!(
                "{} Polys not in same var -- REDUCE-POLY",
                list![n.clone(), d.clone()]
            )
        }
    }
```

###### 将 `reduce` 注册为通用操作

将`reduce`定义为一个通用型操作，并分派到`reduce_poly`（针对多项式）或`reduce_integers`（针对整数）。实现如下：
```rust
    install_binary_op::<i32>(
        "reduce",
        "integer",
        move |a, b| list![a/(a.gcd(&b)),b/(a.gcd(&b))],
        arith,
    );

    arith.put("reduce", list!["polynomial", "polynomial"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let (p1, p2) = (args.head(), args.tail().head());
            let (p1, p2) = reduce_poly(&p1, &p2, &arith);
            Some(list![tag(&p1), tag(&p2)])
        })
    });
```

#### b. 修改 make_rat
将`make_rat`修改为调用`reduce(n, d)`，确保在构造有理数之前完成化简。实现如下：
```rust
    arith.put("make", list!["rational"], {
        let arith = arith.clone();
        let tag = tag.clone();
        ClosureWrapper::new(move |args| {
            let (n, d) = (args.head(), args.tail().head());
            assert!(
                type_tag(&n) != "float".to_listv() && type_tag(&d) != "float".to_listv(),
                "make rational: numer and denom must not float"
            );
            if arith.is_equal_to_zero(&d) == true.to_listv() {
                panic!("make rational: zero denominator");
            }

            let (n_tag, d_tag) = (type_tag(&n).to_string(), type_tag(&d).to_string());
            match (&n_tag[..], &d_tag[..]) {
                ("integer", "integer") | ("polynomial", "polynomial") => {
                    let res = arith.reduce(&n, &d);
                    let (n, d) = (res.head(), res.tail().head());
                    Some(tag(pair!(n, d)))
                }
                // complex
                _ => Some(tag(pair!(n.clone(), d.clone()))),
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

    // 测试整数化简
    println!("==== Testing Integer Reduction ====");
    let n = 12.to_listv();
    let d = 18.to_listv();
    let reduced = arith.reduce(&n, &d);
    println!("Reduced integers: {}", reduced); // 应输出 (2, 3)
    // 测试有理数化简
    println!("\n==== Testing Rational Number Reduction ====");
    let rational = make_rational(12.to_listv(), 18.to_listv(), &arith);
    println!("Reduced rational number: {}", rational); // 应输出 (2, 3)

    // 测试多项式化简
    println!("\n==== Testing Polynomial Reduction ====");
    let p1 = make_polynomial_from_sparse(
        // x + 1
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(1.to_listv(), 1.to_listv()), // x^1
                make_term(0.to_listv(), 1.to_listv()), // x^0
            ],
            &arith,
        ),
        &arith,
    );

    let p2 = make_polynomial_from_sparse(
        // x^3 - 1 = (x-1)(x^2 + x + 1)
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(3.to_listv(), 1.to_listv()),    // x^3
                make_term(0.to_listv(), (-1).to_listv()), // -x^0
            ],
            &arith,
        ),
        &arith,
    );
    println!("Polynomial p1: {}", pretty_polynomial(&p1, &arith));
    println!("Polynomial p2: {}", pretty_polynomial(&p2, &arith));
    let reduced_poly = arith.reduce(&p1, &p2);
    println!("Reduced polynomials:");
    println!(
        "Numerator: {}",
        pretty_polynomial(&reduced_poly.head(), &arith)
    );
    println!(
        "Denominator: {}",
        pretty_polynomial(&reduced_poly.tail().head(), &arith)
    );

    // 测试多项式有理表达式化简
    println!("\n==== Testing Polynomial Rational Reduction ====");
    let p3 = make_polynomial_from_sparse(
        // x^1
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(1.to_listv(), 1.to_listv()), // x^1
            ],
            &arith,
        ),
        &arith,
    );

    let p4 = make_polynomial_from_sparse(
        // x^2 - 1
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(2.to_listv(), 1.to_listv()),    // x^2
                make_term(0.to_listv(), (-1).to_listv()), // (-1)
            ],
            &arith,
        ),
        &arith,
    );

    let rational_poly = make_rational(p3.clone(), p4.clone(), &arith);
    println!("Reduced polynomial rational:");
    println!("Polynomial p3: {}", pretty_polynomial(&p3, &arith));
    println!("Polynomial p4: {}", pretty_polynomial(&p4, &arith));
    println!(
        "Numerator: {}",
        pretty_polynomial(&arith.numer(&rational_poly), &arith)
    );
    println!(
        "Denominator: {}",
        pretty_polynomial(&arith.denom(&rational_poly), &arith)
    );

    // 测试加法
    println!("\n==== Testing Rational Polynomial Addition ====");

    let rf1 = make_rational(p1.clone(), p2.clone(), &arith);
    let rf2 = make_rational(p3.clone(), p4.clone(), &arith);

    let sum = arith.add(&rf1, &rf2);
    println!("Sum of rational polynomials:");
    println!(
        "Numerator: {}",
        pretty_polynomial(&arith.numer(&sum), &arith)
    );
    println!(
        "Denominator: {}",
        pretty_polynomial(&arith.denom(&sum), &arith)
    );

    println!("\n==== Test Completed ====");
}
```

#### 测试输出
```
==== Testing Integer Reduction ====
Reduced integers: (2, (3, Nil))

==== Testing Rational Number Reduction ====
Reduced rational number: (rational, (2, 3))

==== Testing Polynomial Reduction ====
Polynomial p1: (polynomial:1x^1 + 1)
Polynomial p2: (polynomial:1x^3 + -1)
Reduced polynomials:
Numerator: (polynomial:1x^1 + 1)
Denominator: (polynomial:1x^3 + -1)

==== Testing Polynomial Rational Reduction ====
Reduced polynomial rational:
Polynomial p3: (polynomial:1x^1 + 0)
Polynomial p4: (polynomial:1x^2 + -1)
Numerator: (polynomial:1x^1 + 0)
Denominator: (polynomial:1x^2 + -1)

==== Testing Rational Polynomial Addition ====
Sum of rational polynomials:
Numerator: (polynomial:1x^3 + 2x^2 + 3x^1 + 1)
Denominator: (polynomial:1x^4 + 1x^3 + -1x^1 + -1)

==== Test Completed ====
```
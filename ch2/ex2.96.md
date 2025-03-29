# 2.5.3 实例：符号代数
## 练习2.96
练习2.95揭示的问题是可以解决的，为此，我们只需要对GCD算法（它只能用于整系数多项式）做如下修改：在GCD计算中执行任何多项式除法之前，我们先把被除式乘以一个整数常数因子，这个因子的选择要保证在除的过程中不出现分数。这样做，GCD得到的结果将比实际结果多一个整数常数因子。但在有理函数化简到最简形式时，这个因子不会造成问题，因为要用GCD的结果去除分子和分母，所以这个常数因子会被消除。说得更准确些，如果P和Q是多项式，令O1是P的次数（P的最高次项的次数）​，O2是Q的次数，令c是Q的首项系数。可以证明，如果给P乘上一个整数化因子$c^{1+O1-O2}$，得到的多项式用div_terms算法除以Q就不会产生分数。把被除式乘以这样的常数后除以除式，这个操作有时被称为P对Q的伪除，得到的余式也相应地称为伪余。

a.请实现函数pseudoremainder_terms，它与remainder_terms类似，但是如上所述，在调用div_terms前先给被除式乘以那个整数化因子。请修改gcd_terms使之能使用pseudoremainder_terms，并检验修改后的greatest_common_divisor能不能正确处理练习2.95的例子，产生一个整系数的结果。
b.现在的GCD保证能得到整系数，但其系数比P1的系数大，请修改gcd_terms，使它能从答案的所有系数中清除公因子，采用的方法就是把这些系数都除以它们的（整数的）最大公约数。

## 解答
#### 问题分析

###### 1. 伪除法 (`pseudoremainder_terms`)：
* 为了避免分数的出现，在多项式除法前对被除式乘以一个整数化因子，从而使计算保持在整系数范围内。
* 伪除法的结果是伪余式（比实际余式多一个整数常数因子）。

###### 2. GCD 的化简：
* 修改后的 GCD 算法可以正确处理整系数多项式，但可能会导致系数膨胀。
* 为了化简结果，需要从答案的所有系数中清除最大公约数。

#### 代码实现

###### 伪除法的实现
> **伪除法中间结果溢出警告**
    > * 伪除法会在计算过程中生成一个整数化因子，该因子的大小取决于除式的首项系数和多项式的次数差。当首项系数较大或次数差较大时，因子的值可能会迅速膨胀，导致中间结果过大甚至溢出。
    > * 为了避免溢出，请确保输入的多项式较为简单，或者使用支持大整数的实现（如 Rust 的 num-bigint 库）。在极端情况下，可能需要对算法进行优化或手动简化输入的多项式。
```rust
    fn integerizing_factor(t1: &List, t2: &List, arith: &ArithmeticContext) -> List {
        let order1 = order(&pure_first_term(&t1));
        let (order2, coeff2) = (order(&pure_first_term(&t2)), coeff(&pure_first_term(&t2)));

        let exp = arith.sub(&arith.add(&1.to_listv(), &order1), &order2);
        assert_eq!(
            type_tag(&exp),
            "integer".to_listv(),
            "integerizing_factor: exp should be integer"
        );
        // 1+o1-o2，可能存在负指数
        let exp = if *exp.try_as_basis_value::<i32>().unwrap() < 0 {
            0.to_listv()
        } else {
            exp
        };
        let factor = arith.pow(&coeff2, &exp);

        if type_tag(&factor) == "sparse".to_listv() || type_tag(&factor) == "dense".to_listv() {
            factor
        } else {
            make_terms_from_sparse(&list![make_term(0.to_listv(), factor)], arith)
        }
    }
    fn pseudoremainder_terms(p: &List, q: &List, arith: &ArithmeticContext) -> List {
        let (t1, t2) = (arith.first_term(&p), arith.first_term(&q));
        let factor = integerizing_factor(&t1, &t2, arith);

        // 伪除法：乘以因子后再除
        // factor & p type are all terms
        div_terms(&mul_terms(&factor, &p, arith), q, arith)
            .tail()
            .head()
    }
```
###### GCD 的实现
```rust
    fn gcd_terms(a: &List, b: &List, arith: &ArithmeticContext) -> List {
        if is_empty_term_list(b) {
            a.clone()
        } else {
            //let result = gcd_terms(b, &remainder_terms(a, b, arith), arith);
            let result = gcd_terms(b, &pseudoremainder_terms(a, b, arith), arith);
            // return result； 此处提前return即为问题a。
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
            final_gcd
        }
    }
```
###### 系数 GCD 的计算
```rust
    fn term_list_coeffs_gcd(term_list: &List, arith: &ArithmeticContext) -> List {
        // 找到 term_list 的 GCD
        if is_empty_term_list(term_list) {
            return 1.to_listv();
        }
        // 典型List reduce过程，但依赖terms选择函数，故手动实现。
        fn iter(first: &List, term_list: &List, arith: &ArithmeticContext) -> List {
            if is_empty_term_list(term_list) {
                return first.clone();
            }

            let coeff2: List = coeff(&pure_first_term(&arith.first_term(term_list)));
            let gcd = if arith.is_equal_to_zero(&coeff2) == true.to_listv() {
                first.clone()
            } else {
                arith.gcd(&first, &coeff2)
            };
            iter(&gcd, &arith.rest_terms(term_list), arith)
        }
        let first_gcd = coeff(&pure_first_term(&arith.first_term(term_list)));
        iter(&first_gcd, term_list, arith)
    }
```
###### 化简系数
```rust
    fn normalize_terms_coeffs(term_list: &List, gcd: List, arith: &ArithmeticContext) -> List {
        // 将 term_list 的每个 coeff 除以 gcd
        let gcd_term = make_terms_from_sparse(&list![make_term(0.to_listv(), gcd)], arith);
        let res = div_terms(term_list, &gcd_term, arith);

        assert!(
            is_empty_term_list(&res.tail().head()),
            "normalize_terms_coeffs: div_terms by gcd remainder should be 0"
        );
        res.head()
    }

    fn simplify_terms_coeffs(term_list: &List, arith: &ArithmeticContext) -> List {
        let gcd = term_list_coeffs_gcd(term_list, &arith);
        normalize_terms_coeffs(term_list, gcd, &arith)
    }
```

#### 测试代码
```rust
use sicp_rs::{
    ch2::ch2_5::{
        ArithmeticContext, install_arithmetic_package, install_dense_terms_package,
        install_polynomial_coercion, install_polynomial_package, install_sparse_terms_package,
        make_polynomial_from_sparse, make_term, make_terms_from_dense, make_terms_from_sparse,
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

    println!("==== Test: Polynomial GCD ====");

    // 测试两个多项式的最大公约数
    let p1 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_dense(&list![1, -2, 1], &arith), // 1*x^2 + (-2)*x^1 + 1*x^0
        &arith,
    );

    let p2 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(2.to_listv(), 11.to_listv()),  // 11*x^2
                make_term(0.to_listv(), (7).to_listv()), // 7*x^0
            ],
            &arith,
        ),
        &arith,
    );
    let p3 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(1.to_listv(), 13.to_listv()),  // 13*x^1
                make_term(0.to_listv(), (5).to_listv()), // 5*x^0
            ],
            &arith,
        ),
        &arith,
    );
    let q1 = arith.mul(&p1, &p2);
    let q2 = arith.mul(&p1, &p3);
    println!("Polynomial q1: {}", pretty_polynomial(&q1, &arith));
    println!("Polynomial q2: {}", pretty_polynomial(&q2, &arith));
    let gcd_poly = arith.gcd(&q1, &q2);
    println!("GCD of q1 and q2: {}", pretty_polynomial(&gcd_poly, &arith));

    println!("\n==== Test Completed ====");
}
```
#### 输出结果
###### 步骤 a：伪除法
```
Polynomial q1: (polynomial:11x^4 + -22x^3 + 18x^2 + -14x^1 + 7)
Polynomial q2: (polynomial:13x^3 + -21x^2 + 3x^1 + 5)
GCD of q1 and q2: (polynomial:1458x^2 + -2916x^1 + 1458)
```
###### 步骤 b：化简系数
```
Polynomial q1: (polynomial:11x^4 + -22x^3 + 18x^2 + -14x^1 + 7)
Polynomial q2: (polynomial:13x^3 + -21x^2 + 3x^1 + 5)
GCD of q1 and q2: (polynomial:1x^2 + -2x^1 + 1)
```

# 2.5.3 实例：符号代数
## 练习2.87
请在通用算术包中为多项式安装is_equal_to_zero，这将使adjoin_term也能用于系数本身也是多项式的多项式。

## 解答
#### 基本思路
多项式为零的条件：
* 多项式为空（没有项）。
* 多项式的每一项的系数为零。

#### 输出结果
```rust
 polynomial representation: (polynomial, x, sparse, (2, 4), (1, 3), (0, 7.0))

test polynomial multiplication and addition...
 (polynomial:4x^2 + 3x^1 + 7.0) + (polynomial:5x^2 + 2.0x^1 + 10.0) = (polynomial:9x^2 + 5.0x^1 + 17.0)
 (polynomial:4x^2 + 3x^1 + 7.0) * (polynomial:5x^2 + 2.0x^1 + 10.0) = (polynomial:20x^4 + 23.0x^3 + 81.0x^2 + 44.0x^1 + 70.0)

polynomial as coeff: (polynomial:5x^2 + (polynomial:5x^2 + 2.0x^1 + 10.0)x^1 + 10.0)

zero (polynomial:0x^2 + 0x^1 + 0.0) is_equal_to_zero true, as coeff: (polynomial:5x^2 + (polynomial:0x^2 + 0x^1 + 0.0)x^1 + 10.0)
// add zero terms that cancel coefficients, by `adjoin_term` function
 (polynomial:5x^2 + (polynomial:0x^2 + 0x^1 + 0.0)x^1 + 10.0) + (polynomial:5x^2 + (polynomial:0x^2 + 0x^1 + 0.0)x^1 + 10.0) = (polynomial:10x^2 + 20.0)
zero (polynomial:Nil) is_equal_to_zero true, as coeff: (polynomial:5x^2 + (polynomial:5x^2 + 2.0x^1 + 10.0)x^1 + 10.0)
 (polynomial:5x^2 + (polynomial:5x^2 + 2.0x^1 + 10.0)x^1 + 10.0) + (polynomial:5x^2 + (polynomial:5x^2 + 2.0x^1 + 10.0)x^1 + 10.0) = (polynomial:10x^2 + (polynomial:10x^2 + 4.0x^1 + 20.0)x^1 + 20.0)
```

#### 代码实现
##### `adjoin_term`函数
```rust
// lib code
// fn install_sparse_terms_package
    fn adjoin_term(term: List, term_list: List, arith: &ArithmeticContext) -> List {
        // 通用算术包的is_equal_to_zero自动分派，无需修改
        if arith.is_equal_to_zero(&coeff(&term)) == true.to_listv() {
            term_list
        } else {
            pair![term, term_list]
        }
    }
    arith.put("adjoin_term", list!["sparse", "sparse"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let (t1, l) = (args.head().head(), args.tail().head());
            Some(tag(&adjoin_term(t1, l, &arith)))
        })
    });
```
##### 安装`is_equal_to_zero`函数
```rust
// lib code
// fn install_polynomial_package
    fn is_equal_to_zero(term_list: &List, arith: &ArithmeticContext) -> List {
        if is_empty_term_list(term_list) {
            true.to_listv()
        } else {
            // [sparse [term]]-> term
            let t = pure_first_term(&arith.first_term(term_list)); // [sparse [term]]
            if arith.is_equal_to_zero(&coeff(&t)) == false.to_listv() {
                false.to_listv()
            } else {
                is_equal_to_zero(&arith.rest_terms(term_list), &arith)
            }
        }
    }
    arith.put("is_equal_to_zero", list!["polynomial"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let term_list = term_list(&args.head());
            Some(is_equal_to_zero(&term_list, &arith))
        })
    });
```

##### main函数
```rust
use sicp_rs::{
    ch2::ch2_5::{
        ArithmeticContext, install_arithmetic_package, install_polynomial_package,
        install_sparse_terms_package, make_float, make_integer, make_polynomial_from_sparse,
        make_term, pretty_polynomial,
    },
    prelude::*,
};

fn main() {
    let arith = ArithmeticContext::new();
    install_arithmetic_package(&arith);
    install_sparse_terms_package(&arith);
    install_polynomial_package(&arith);

    let p1 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &list![
            make_term(2.to_listv(), make_integer(4, &arith)),
            make_term(1.to_listv(), make_integer(3, &arith)),
            make_term(0.to_listv(), make_float(7.0, &arith)),
        ],
        &arith,
    );
    let p2 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &list![
            make_term(2.to_listv(), make_integer(5, &arith)),
            make_term(1.to_listv(), make_float(2.0, &arith)),
            make_term(0.to_listv(), make_float(10.0, &arith)),
        ],
        &arith,
    );
    println!("polynomial representation: {}\n", p1.pretty_print());

    // 测试多项式的乘法和加法
    println!("test polynomial multiplication and addition...");
    println!(
        " {} + {} = {}",
        pretty_polynomial(&p1, &arith),
        pretty_polynomial(&p2, &arith),
        pretty_polynomial(&arith.add(&p1, &p2), &arith)
    );
    println!(
        " {} * {} = {}\n",
        pretty_polynomial(&p1, &arith),
        pretty_polynomial(&p2, &arith),
        pretty_polynomial(&arith.mul(&p1, &p2), &arith)
    );
    let p3 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &list![
            make_term(2.to_listv(), make_integer(5, &arith)),
            make_term(1.to_listv(), p2.clone()),
            make_term(0.to_listv(), make_float(10.0, &arith)),
        ],
        &arith,
    );
    println!("polynomial as coeff: {}\n", pretty_polynomial(&p3, &arith));
    let zero = make_polynomial_from_sparse(
        &"x".to_listv(),
        &list![
            make_term(2.to_listv(), make_integer(0, &arith)),
            make_term(1.to_listv(), make_integer(0, &arith)),
            make_term(0.to_listv(), make_float(0.0, &arith)),
        ],
        &arith,
    );
    let p3 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &list![
            make_term(2.to_listv(), make_integer(5, &arith)),
            make_term(1.to_listv(), zero.clone()),
            make_term(0.to_listv(), make_float(10.0, &arith)),
        ],
        &arith,
    );
    println!(
        "zero {} is_equal_to_zero {}, as coeff: {}\n {} + {} = {}",
        pretty_polynomial(&zero, &arith),
        arith.is_equal_to_zero(&zero),
        pretty_polynomial(&p3, &arith),
        pretty_polynomial(&p3, &arith),
        pretty_polynomial(&p3, &arith),
        pretty_polynomial(&arith.add(&p3, &p3), &arith)
    );
    let zero = make_polynomial_from_sparse(&"x".to_listv(), &List::Nil, &arith);
    let p3 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &list![
            make_term(2.to_listv(), make_integer(5, &arith)),
            make_term(1.to_listv(), p2),
            make_term(0.to_listv(), make_float(10.0, &arith)),
        ],
        &arith,
    );
    println!(
        "zero {} is_equal_to_zero {}, as coeff: {}\n {} + {} = {}",
        pretty_polynomial(&zero, &arith),
        arith.is_equal_to_zero(&zero),
        pretty_polynomial(&p3, &arith),
        pretty_polynomial(&p3, &arith),
        pretty_polynomial(&p3, &arith),
        pretty_polynomial(&arith.add(&p3, &p3), &arith)
        // p3 + p1 will panic because now not support raising numbers to polynomials.
        // pretty_polynomial(&arith.add(&p3, &p1), &arith)
    );
}
```
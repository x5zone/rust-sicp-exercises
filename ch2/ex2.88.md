# 2.5.3 实例：符号代数
## 练习2.88
请扩充多项式系统，加入多项式的减法。​（提示：你可能发现，定义一个通用的求负操作非常有用。​）

## 解答
#### 输出结果
```rust
polynomial representation: (polynomial, x, sparse, (2, 4), (1, 3), (0, 7.0))

(polynomial:4x^2 + 3x^1 + 7.0) - (polynomial:5x^2 + 2.0x^1 + 10.0) = (polynomial:-1x^2 + 1.0x^1 + -3.0)
```
#### 代码实现
##### `negative`函数和`sub`函数
```rust
// lib code
// fn install_polynomial_package
    // `negative_terms` 递归地对每一项的系数取负，并重新组装成新的多项式
    fn negative_terms(l: &List, arith: &ArithmeticContext) -> List {
        if is_empty_term_list(l) {
            make_empty_term_list(arith) //[sparse, List::Nil]
        } else {
            let t1 = arith.first_term(l);
            let (order1, coeff1) = (order(&pure_first_term(&t1)), coeff(&pure_first_term(&t1)));
            // coeff可能为多项式或任意类型值，使用通用算术包求负操作递归求负
            let first_term =
                make_terms_from_sparse(&list![make_term(order1, arith.negative(&coeff1))], arith);

            arith.adjoin_term(&first_term, &negative_terms(&arith.rest_terms(l), &arith))
        }
    }
    // install negative&sub
    arith.put("negative", list!["polynomial"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let variable = variable(&args.head());
            let term_list = term_list(&args.head());
            Some(tag(&make_poly(
                variable,
                negative_terms(&term_list, &arith),
            )))
        })
    });
    arith.put("sub", list!["polynomial", "polynomial"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let (p1, p2) = (args.head(), args.tail().head());
            // 需要补上被apply_generic剥去的标签
            let (p1, p2) = (tag(&p1), arith.negative(&tag(&p2)));
            Some(arith.add(&p1, &p2))
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
    println!(
        "{} - {} = {}",
        pretty_polynomial(&p1, &arith),
        pretty_polynomial(&p2, &arith),
        pretty_polynomial(&arith.sub(&p1, &p2), &arith)
    );
}
```
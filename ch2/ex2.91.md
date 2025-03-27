# 2.5.3 实例：符号代数
## 练习2.91
一个单变元多项式可以除以另一个多项式，产生一个商式和一个余式。例如：
$$\frac{x^5 - 1}{x^2 - 1} = x^3 + x, \text{余式} x - 1$$
除法可以通过长除完成，也就是说，用被除式的最高次项除以除式的最高次项，得到商式的第一项；然后用这个结果乘以除式，再从被除式中减去这个乘积。剩下的工作就是用减得到的差作为新的被除式，重复上述做法，产生随后的结果。当除式的次数超过被除式的次数时结束，此时的被除式就是余式。还有，如果被除式是0，就返回0作为商和余式。
我们可以基于add_poly和mul_poly的模型，设计一个除法函数div_poly。这个函数先检查两个多项式的未定元是否相同，如果相同就剥去变元，把问题送给函数div_terms，由它执行项表上的除法运算。div_poly最后把变元重新附加到div_terms返回的结果上。把div_terms设计为同时计算除法的商式和余式可能更方便。div_terms可以以两个项表为参数，返回包含一个商式项表和一个余式项表的表。请填充下面函数div_terms中空缺的部分，完成这个定义，并基于它实现div_poly。该函数应该以两个多项式为参数，返回一个包含商和余式多项式的表。
```javascript
function div_terms(L1, L2) {
    if (is_empty_termlist(L1)) {
        return list(the_empty_termlist, the_empty_termlist);
    } else {
        const t1 = first_term(L1);
        const t2 = first_term(L2);
        if (order(t2) > order(t1)) {
            return list(the_empty_termlist, L1);
        } else {
            const new_c = div(coeff(t1), coeff(t2));
            const new_o = order(t1) - order(t2);
            const rest_of_result = ⟨⟨compute rest of result recursively⟩⟩;
            ⟨⟨form and return complete result⟩⟩
        }
    }
}
```

## 解答

#### 代码实现
##### `div_terms`函数
```rust
    fn div_terms(l1: &List, l2: &List, arith: &ArithmeticContext) -> List {
        if is_empty_term_list(l1) {
            list![make_empty_term_list(arith), make_empty_term_list(arith)] //[sparse, List::Nil]
        } else {
            let t1 = arith.first_term(&l1);
            let (order1, coeff1) = (order(&pure_first_term(&t1)), coeff(&pure_first_term(&t1)));
            let t2 = arith.first_term(&l2);
            let (order2, coeff2) = (order(&pure_first_term(&t2)), coeff(&pure_first_term(&t2)));
            if order2.get_basis_value() > order1.get_basis_value() {
                list![
                    make_empty_term_list(arith), //[sparse, List::Nil]
                    l1.clone()
                ]
            } else {
                let new_c = arith.div(&coeff1, &coeff2);
                let new_o = arith.sub(&order1, &order2);

                let first_term = make_terms_from_sparse(&list![make_term(new_o, new_c)], arith);
                let divisor = add_terms(
                    l1,
                    &negative_terms(&mul_terms(&first_term, l2, arith), arith),
                    arith,
                );

                let rest_of_result = div_terms(&divisor, l2, arith);
                list![
                    add_terms(&first_term, &rest_of_result.head(), arith),
                    rest_of_result.tail().head()
                ]
            }
        }
    }
```
##### `div_poly`函数
```rust
    fn div_poly(p1: &List, p2: &List, arith: &ArithmeticContext) -> List {
        if is_same_variable(&variable(p1), &variable(p2)) {
            let result = div_terms(&term_list(p1), &term_list(p2), arith);
            list![
                make_poly(variable(p1), result.head(),),
                make_poly(variable(p1), result.tail().head(),),
            ]
        } else {
            panic!(
                "{} Polys not in same var -- DIV-POLY",
                list![p1.clone(), p2.clone()]
            )
        }
    }
```
##### 注册`div`运算
```rust 
    arith.put("div", list!["polynomial", "polynomial"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let (p1, p2) = (args.head(), args.tail().head());
            let result = div_poly(&p1, &p2, &arith);
            Some(list![tag(&result.head()), tag(&result.tail().head())])
        })
    });
```
##### main函数测试
```rust
use sicp_rs::{
    ch2::ch2_5::{
        ArithmeticContext, install_arithmetic_package, install_dense_terms_package,
        install_polynomial_package, install_sparse_terms_package, make_empty_term_list,
        make_polynomial_from_sparse, make_term, make_terms_from_sparse, pretty_polynomial,
    },
    prelude::*,
};

fn main() {
    // 初始化ArithmeticContext
    let arith = ArithmeticContext::new();
    install_arithmetic_package(&arith);
    install_sparse_terms_package(&arith);
    install_dense_terms_package(&arith);
    install_polynomial_package(&arith);

    // 测试1：多项式除法
    println!("==== Test 1: Polynomial Division ====");
    let dividend_sparse = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(5.to_listv(), 1.to_listv()),    // x^5
                make_term(0.to_listv(), (-1).to_listv())  // -1
            ],
            &arith,
        ),
        &arith,
    );

    let divisor_sparse = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(2.to_listv(), 1.to_listv()),    // x^2
                make_term(0.to_listv(), (-1).to_listv())  // -1
            ],
            &arith,
        ),
        &arith,
    );

    println!(
        "Dividend Polynomial: {}",
        pretty_polynomial(&dividend_sparse, &arith)
    );
    println!(
        "Divisor Polynomial: {}",
        pretty_polynomial(&divisor_sparse, &arith)
    );

    let result = arith.div(&dividend_sparse, &divisor_sparse);
    let quotient = result.head(); // 商式
    let remainder = result.tail().head(); // 余式
    println!(
        "Quotient Polynomial: {}",
        pretty_polynomial(&quotient, &arith)
    );
    println!(
        "Remainder Polynomial: {}",
        pretty_polynomial(&remainder, &arith)
    );

    // 验证：商和余式的正确性
    let reconstructed_dividend = arith.add(&arith.mul(&quotient, &divisor_sparse), &remainder);

    println!(
        "Reconstructed Dividend (Quotient * Divisor + Remainder): {}",
        pretty_polynomial(&reconstructed_dividend, &arith)
    );
    println!("{}\n{}", reconstructed_dividend, dividend_sparse);
    println!(
        "Is Reconstruction Equal to Original Dividend: {}",
        arith.is_equal(&reconstructed_dividend, &dividend_sparse)
    );

    // 测试2：零多项式除法
    println!("\n==== Test 2: Zero Polynomial Division ====");
    let zero_poly =
        make_polynomial_from_sparse(&"x".to_listv(), &make_empty_term_list(&arith), &arith);

    let zero_div_result = arith.div(&zero_poly, &divisor_sparse);
    let zero_quotient = zero_div_result.head();
    let zero_remainder = zero_div_result.tail().head();

    println!(
        "Zero Polynomial Quotient: {}",
        pretty_polynomial(&zero_quotient, &arith)
    );
    println!(
        "Zero Polynomial Remainder: {}",
        pretty_polynomial(&zero_remainder, &arith)
    );

    println!("\n==== All Tests Completed Successfully ====");
}
```
##### 测试输出
```rust
==== Test 1: Polynomial Division ====
Dividend Polynomial: (polynomial:1x^5 + -1)
Divisor Polynomial: (polynomial:1x^2 + -1)
Quotient Polynomial: (polynomial:1x^3 + 1x^1 + )
Remainder Polynomial: (polynomial:1x^1 + -1)
Reconstructed Dividend (Quotient * Divisor + Remainder): (polynomial:1x^5 + -1)
(polynomial, (x, (sparse, ((5, (1, Nil)), ((0, (-1, Nil)), Nil)))))
(polynomial, (x, (sparse, ((5, (1, Nil)), ((0, (-1, Nil)), Nil)))))
Is Reconstruction Equal to Original Dividend: true

==== Test 2: Zero Polynomial Division ====
Zero Polynomial Quotient: (polynomial:Nil)
Zero Polynomial Remainder: (polynomial:Nil)

==== All Tests Completed Successfully ====
```
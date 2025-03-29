# 2.5.3 实例：符号代数
## 练习2.95
定义了下面多项式P1、P2和P3：
$$P1:x2-2x+1$$
$$P2:11x2+7$$
$$P3:13x+5$$
现在定义Q1为P1和P2的乘积，Q2为P1和P3的乘积，然后用greatest_common_divisor（练习2.94）求出Q1和Q2的GCD。请注意，得到的回答与P1不同。这个例子把非整数操作引进了计算过程，从而引起GCD算法的困难。要理解这里出现了什么情况，请试着手工追踪gcd_terms在计算GCD或做试除时的情况。

## 解答

#### 问题解析

$$Q1=P1*P2=11x^4 + -22x^3 + 18x^2 + -14x^1 + 7$$
$$Q2=P1*P3=13x^3 + -21x^2 + 3x^1 + 5$$

在代码中，问题出现在 Rust 的整数除法规则：当整数相除时，结果会直接舍弃小数部分，得到一个整数。这导致了以下情况：

* 在 `div_terms` 函数中，计算多项式的首项系数时，使用了整数除法：
    ```rust
    let new_c = arith.div(&coeff1, &coeff2);
    ```
    例如，当 $11/13$ 时，Rust 的整数除法会返回 $0$，而不是浮点数 $0.846...$。这使得后续计算中的首项系数变为 $0$，从而导致`dividend`的结果始终是原来的被除式，无法继续简化。

* 由于`dividend`无法正确计算，`div_terms` 函数进入无限循环，无法完成 GCD 的计算。

#### 追踪执行过程
执行过程追踪参看代码注释。
```rust
    fn div_terms(l1: &List, l2: &List, arith: &ArithmeticContext) -> List {
        // l1:  (polynomial:11x^4 + -22x^3 + 18x^2 + -14x^1 + 7)
        // l2:  (polynomial:13x^3 + -21x^2 + 3x^1 + 5)
        if is_empty_term_list(l1) {
            list![make_empty_term_list(arith), make_empty_term_list(arith)] //[sparse, List::Nil]
        } else {
            // t1: 11x^4
            // t2: 13x^3
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
                // new_c = integer(11) / integer(13) = integer(0)
                // new_o = integer(4)  - integer(3)  = integer(1) 
                let new_c = arith.div(&coeff1, &coeff2);
                let new_o = arith.sub(&order1, &order2);
 
                // first_term = 0*x^1 = 0
                let first_term = make_terms_from_sparse(&list![make_term(new_o, new_c)], arith);
                // dividend = l1 - 0*l2 = l1
                let dividend = add_terms(
                    l1,
                    &negative_terms(&mul_terms(&first_term, l2, arith), arith),
                    arith,
                );
                // rest_of_resullt = div_terms(l1, l2) -> so infinite loop
                let rest_of_result = div_terms(&dividend, l2, arith);
                list![
                    add_terms(&first_term, &rest_of_result.head(), arith),
                    rest_of_result.tail().head()
                ]
            }
        }
    }
```
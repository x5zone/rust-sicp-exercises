# 2.5.3 实例：符号代数
## 练习2.92
请扩充多项式程序包，加入强制的变量序，使多项式的加法和乘法都能处理包含不同变量的多项式。​（这个工作绝不简单！）
> 例如，这里可能有x的多项式，其系数是y的多项式；也可能有y的多项式，其系数是x的多项式。这些类型中哪个类型都并不自然地位于另一类型“之上”​，然而我们却常需要对不同集合的成员求和。有几种方法可以完成这项工作。一种可能是把一个多项式变换到另一个的类型，通过展开并重新安排多项式里的项，使两个多项式具有相同的主变元。我们还可以对变元排序，给多项式强行加入一个类型塔结构，并永远把所有多项式都变换到某种“规范形式”​，以最高优先级的变元作为主变元，把优先级较低的变元藏在系数里。这种策略可以工作得很好。但是，做这种变换，有可能不必要地扩大了多项式，使它更难读，操作效率更低。

#### 扩充练习：有理函数
我们可以扩充前面做的通用算术系统，把有理函数也包括进来。有理函数也就是“分式”​，其分子和分母都是多项式，例如：
$$\frac{x + 1}{x^3 - 1}$$
这个系统应该能做有理函数的加减乘除，例如可以完成下面的计算：
$$\frac{x + 1}{x^3 - 1} + \frac{x^2 + 2x^2 + 3x + 1}{x^3 - x - 1}$$
（这里的和式已经做了简化，删除了公因子。如果按基本的“交叉乘法”​，得到的分子是一个4次多项式，分母是一个5次多项式。​）

如果我们修改前面的有理数程序包，使它能使用通用型操作，那么就能完成我们希望做的事情，除了无法把分式化简到最简形式。

## 解答
#### 问题分析

在符号代数中，多项式的加法和乘法需要支持不同变量的多项式。例如，$x^2+2x+1$ 和 $y^3+y$ 的相加，需要将 $y$ 的多项式作为 $x$ 多项式的系数嵌套起来。类似地，有理函数也需要支持分子和分母为多项式的情况，并能够进行加减乘除运算。

实现这一功能的要点包括：

1. 对齐变量：需要处理不同变量的多项式。例如，$x$ 的多项式与 $y$ 的多项式相加时，需要将变量对齐。
2. 递归处理系数：多项式的系数可以是另一个多项式，这需要递归处理。
3. 类型强制转换：需要将数字（如整数、浮点数等）强制转换为多项式，以便统一操作。
4. 有理函数扩展：支持分子和分母为多项式的有理函数，并实现其加减乘除。

#### 解决方案

###### 1. 变量对齐
为了对齐变量，我们需要一种机制，将一个多项式嵌套到另一个多项式的系数中。例如，对于 $x^2+2x+1$ 和 $y^3+y$ 的相加，我们可以将 $y^3+y$ 嵌套为 $x$ 的多项式的常数项。实现这一点的关键是 `align_variable` 函数：
        
```rust
    fn align_variable(var_x: &List, p2: &List, arith: &ArithmeticContext) -> List {
        // (y, (sparse, term_list)) -> (poly, y, (sparse, term_list)) and now can use as coeff
        // 确保 p2 是一个合法的多项式
        let p2 = tag(p2);
        // return (x, (sparse, [[0, y_poly as coeff]]))
        make_poly(
            var_x.clone(),
            make_terms_from_sparse(&list![make_term(0.to_listv(), p2)], arith),
        )
    }
```

这里的核心思想是将 $y^3+y$ 转换为 $x^0⋅(y^3+y)$，从而使其能够与 $x^2+2x+1$ 相加。

###### 2. 多项式加法

多项式加法需要对齐变量后递归处理。如果两个多项式的变量不同，则需要调用 `align_variable` 将其中一个多项式嵌套为另一个多项式的系数：
```rust
    fn add_poly(p1: &List, p2: &List, arith: &ArithmeticContext) -> List {
        if is_same_variable(&variable(p1), &variable(p2)) {
            // 变量相同，直接进行项的加法
            make_poly(
                variable_not_any(p1, p2),  // any为数字的变元
                add_terms(&term_list(p1), &term_list(p2), arith),
            )
        } else {
            // 变量不同，进行对齐
            let (p1, p2) = if variable(p1).get_basis_value() < variable(p2).get_basis_value() {
                (p1.clone(), align_variable(&variable(p1), p2, arith))
            } else {
                (align_variable(&variable(p2), p1, arith), p1.clone())
            };
            add_poly(&p1, &p2, arith)
            // 旧的实现
            // panic!(
            //     "{} Polys not in same var -- ADD-POLY",
            //     list![p1.clone(), p2.clone()]
            // )
        }
    }
```

###### 3. 多项式乘法

多项式乘法的逻辑与加法类似，但需要对齐后进行项的乘法：
```rust
    fn mul_poly(p1: &List, p2: &List, arith: &ArithmeticContext) -> List {
        if is_same_variable(&variable(p1), &variable(p2)) {
            make_poly(
                variable_not_any(p1, p2),
                mul_terms(&term_list(p1), &term_list(p2), arith),
            )
        } else {
            let (p1, p2) = if variable(p1).get_basis_value() < variable(p2).get_basis_value() {
                (p1.clone(), align_variable(&variable(p1), p2, arith))
            } else {
                (align_variable(&variable(p2), p1, arith), p1.clone())
            };
            mul_poly(&p1, &p2, arith)
        }
    }
```


###### 4. 类型强制转换

为了支持数字与多项式的混合运算，需要将数字强制转换为多项式。这里引入了一个特殊的变量 `any`，表示“任意变量”。当一个数字被转换为多项式时，它会被表示为 $any^0⋅num$：
```rust
// may be integer + poly and integer with variable any
// integer -> (poly, (any, (0, integer))) as poly: any^0 * integer  
// integer(5) + poly(x+3) -> poly(x+8) and variable is x not any
pub fn variable_not_any(p1: &List, p2: &List) -> List {
    if variable(p1) == "any".to_listv() {
        variable(p2)
    } else {
        variable(p1)
    }
}
// v1:any^0 + 5 v2: x+ 1 has same variable 
pub fn is_same_variable(v1: &List, v2: &List) -> bool {
    is_variable(v1)
        && is_variable(v2)
        && (v1 == v2 || v1 == &"any".to_listv() || v2 == &"any".to_listv())
}
pub fn install_polynomial_coercion(arith: &mut ArithmeticContext) -> Option<List> {
    let mut put_helper = |type_x| {
        arith.put_coercion(&type_x, &"polynomial".to_listv(), {
            let arith = arith.clone();
            ClosureWrapper::new(move |args| {
                let x = args.head();

                Some(make_polynomial_from_sparse(
                    &"any".to_listv(),
                    &list![make_term(0.to_listv(), x,)],
                    &arith,
                ))
            })
        })
    };
    put_helper("integer".to_listv());
    put_helper("float".to_listv());
    put_helper("rational".to_listv());
    put_helper("complex".to_listv());

    Some("done".to_string().to_listv())
}
```

###### 5. 有理函数扩展

有理函数的实现中，分子和分母可以是多项式。通过允许任意类型的分子和分母（除了浮点数），我们可以支持有理函数的加减乘除：
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
                let g = (*n).gcd(d);
                Some(tag(pair!(n / g, d / g)))
            } else {
                // may be complex or polynomial
                Some(tag(pair!(n.clone(), d.clone())))          // 这一行代码为更多类型提供了支持
            }
        })
    });
```

#### 完整测试代码
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

    println!("==== Test 1: Polynomial Addition with Different Variables ====");
    // 多项式1：x^2 + 2x + 1
    let poly1 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(2.to_listv(), 1.to_listv()), // x^2
                make_term(1.to_listv(), 2.to_listv()), // 2x^1
                make_term(0.to_listv(), 1.to_listv()), // 1
            ],
            &arith,
        ),
        &arith,
    );
    // 多项式2：y^3 + y
    let poly2 = make_polynomial_from_sparse(
        &"y".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(3.to_listv(), 1.to_listv()), // y^3
                make_term(1.to_listv(), 1.to_listv()), // y^1
            ],
            &arith,
        ),
        &arith,
    );

    println!("Polynomial 1: {}", pretty_polynomial(&poly1, &arith));
    println!("Polynomial 2: {}", pretty_polynomial(&poly2, &arith));
    // 多项式加法
    let add_result = arith.add(&poly1, &poly2);
    println!(
        "Addition Result: {}",
        pretty_polynomial(&add_result, &arith)
    );

    println!("\n==== Test 2: Polynomial Multiplication with Different Variables ====");
    // 多项式3：z^2 + 3z + 2
    let poly3 = make_polynomial_from_sparse(
        &"z".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(2.to_listv(), 1.to_listv()), // z^2
                make_term(1.to_listv(), 3.to_listv()), // 3z^1
                make_term(0.to_listv(), 2.to_listv()), // 2
            ],
            &arith,
        ),
        &arith,
    );

    println!("Polynomial 3: {}", pretty_polynomial(&poly3, &arith));

    // 多项式乘法
    let mul_result = arith.mul(&poly1, &poly3);
    println!(
        "Multiplication Result: {}",
        pretty_polynomial(&mul_result, &arith)
    );

    println!("\n==== Test 3: Coercion of Numbers to Polynomials ====");
    // 测试 num 转换为多项式
    let num = 5.to_listv();
    let coerced_poly_func = arith
        .get_coercion(&"integer".to_listv(), &"polynomial".to_listv())
        .unwrap();
    let coerced_poly = coerced_poly_func.call(&list![num.clone()]).unwrap();
    println!("Number: {}", num);
    println!(
        "Coerced Polynomial: {}, pretty print {}",
        coerced_poly.pretty_print(),
        pretty_polynomial(&coerced_poly, &arith)
    );

    println!("\n==== Test 4: Polynomial with Nested Coefficients ====");
    // 嵌套多项式：x^2 + (y^2 + y)*x + (y^3 + y)
    let nested_coeff = make_polynomial_from_sparse(
        &"y".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(2.to_listv(), 1.to_listv()), // y^2
                make_term(1.to_listv(), 1.to_listv()), // y^1
            ],
            &arith,
        ),
        &arith,
    );

    let nested_poly = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(2.to_listv(), 1.to_listv()),         // x^2
                make_term(1.to_listv(), nested_coeff.clone()), // (y^2 + y)*x
                make_term(0.to_listv(), nested_coeff),         // y^3 + y
            ],
            &arith,
        ),
        &arith,
    );

    println!(
        "Nested Polynomial: {}",
        pretty_polynomial(&nested_poly, &arith)
    );
    println!("\n==== Test 5: Rational Function Operations ====");
    // 有理函数1： (x + 1) / (x^3 - 1)
    let numerator1 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(1.to_listv(), 1.to_listv()), // x
                make_term(0.to_listv(), 1.to_listv()), // 1
            ],
            &arith,
        ),
        &arith,
    );

    let denominator1 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(3.to_listv(), 1.to_listv()),    // x^3
                make_term(0.to_listv(), (-1).to_listv()), // -1
            ],
            &arith,
        ),
        &arith,
    );

    let rational1 = make_rational(numerator1.clone(), denominator1.clone(), &arith);

    // 有理函数2： (x^2 + 2x^2 + 3x + 1) / (x^3 - x - 1)
    let numerator2 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(2.to_listv(), 2.to_listv()), // 2x^2
                make_term(1.to_listv(), 3.to_listv()), // 3x
                make_term(0.to_listv(), 1.to_listv()), // 1
            ],
            &arith,
        ),
        &arith,
    );

    let denominator2 = make_polynomial_from_sparse(
        &"x".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(3.to_listv(), 1.to_listv()),    // x^3
                make_term(1.to_listv(), (-1).to_listv()), // -x
                make_term(0.to_listv(), (-1).to_listv()), // -1
            ],
            &arith,
        ),
        &arith,
    );

    let rational2 = make_rational(numerator2.clone(), denominator2.clone(), &arith);

    println!("Rational Function 1:");
    println!("  Numerator: {}", pretty_polynomial(&arith.numer(&rational1), &arith));
    println!("  Denominator: {}", pretty_polynomial(&arith.denom(&rational1), &arith));

    println!("Rational Function 2:");
    println!("  Numerator: {}", pretty_polynomial(&arith.numer(&rational2), &arith));
    println!("  Denominator: {}", pretty_polynomial(&arith.denom(&rational2), &arith));

    // 有理函数加法
    let rational_add = arith.add(&rational1, &rational2);
    println!("Rational Addition Result:");
    println!(
        "  Numerator: {}",
        pretty_polynomial(&arith.numer(&rational_add), &arith)
    );
    println!(
        "  Denominator: {}",
        pretty_polynomial(&arith.denom(&rational_add), &arith)
    );

    // 有理函数乘法
    let rational_mul = arith.mul(&rational1, &rational2);
    println!("Rational Multiplication Result:");
    println!(
        "  Numerator: {}",
        pretty_polynomial(&arith.numer(&rational_mul), &arith)
    );
    println!(
        "  Denominator: {}",
        pretty_polynomial(&arith.denom(&rational_mul), &arith)
    );

    println!("\n==== All Tests Completed Successfully ====");
}
```

#### 输出结果
```rust
==== Test 1: Polynomial Addition with Different Variables ====
Polynomial 1: (polynomial:1x^2 + 2x^1 + 1)
Polynomial 2: (polynomial:1y^3 + 1y^1 + 0)
Addition Result: (polynomial:1x^2 + 2x^1 + (polynomial:1y^3 + 1y^1 + 1))

==== Test 2: Polynomial Multiplication with Different Variables ====
Polynomial 3: (polynomial:1z^2 + 3z^1 + 2)
Multiplication Result: (polynomial:(polynomial:1z^2 + 3z^1 + 2)x^2 + (polynomial:2z^2 + 6z^1 + 4)x^1 + (polynomial:1z^2 + 3z^1 + 2))

==== Test 3: Coercion of Numbers to Polynomials ====
Number: 5
Coerced Polynomial: (polynomial, any, sparse, (0, 5)), pretty print (polynomial:5)

==== Test 4: Polynomial with Nested Coefficients ====
Nested Polynomial: (polynomial:1x^2 + (polynomial:1y^2 + 1y^1 + 0)x^1 + (polynomial:1y^2 + 1y^1 + 0))

==== Test 5: Rational Function Operations ====
Rational Function 1:
  Numerator: (polynomial:1x^1 + 1)
  Denominator: (polynomial:1x^3 + -1)
Rational Function 2:
  Numerator: (polynomial:2x^2 + 3x^1 + 1)
  Denominator: (polynomial:1x^3 + -1x^1 + -1)
Rational Addition Result:
  Numerator: (polynomial:2x^5 + 4x^4 + 2x^3 + -3x^2 + -5x^1 + -2)
  Denominator: (polynomial:1x^6 + -1x^4 + -2x^3 + 1x^1 + 1)
Rational Multiplication Result:
  Numerator: (polynomial:2x^3 + 5x^2 + 4x^1 + 1)
  Denominator: (polynomial:1x^6 + -1x^4 + -2x^3 + 1x^1 + 1)

==== All Tests Completed Successfully ====
```

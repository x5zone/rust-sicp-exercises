# 2.5.3 实例：符号代数
## 练习2.90
假定我们希望有一个多项式系统，希望它对稠密多项式和稀疏多项式都是高效的。做好这件事的一种方法就是允许我们的系统里同时存在两种项表表示。这时遇到的情况类似2.4节复数的例子，那里同时允许直角坐标表示和极坐标表示。为了完成这一工作，我们必须能分辨不同类型的项表，并把针对项表的操作通用化。请重新设计我们的多项式系统，实现这种推广。这项工作需要付出很多努力，而不仅是做一些局部修改。

## 解答
#### 基本思路
1. 核心设计：

    * 对比 2.4 节复数的例子，稠密和稀疏的标记应定义在`term_list`层级，而不是`poly`层级。
        * > To do this we must distinguish different types of term lists and make the operations on term lists generic. 
        * 由习题英文原文亦可知标记应定义在`term_list`层级。
    * 如果标记定义在`poly`层级，操作`term_list`时会频繁解包和重新封装，增加复杂度。
    * 构造函数：
        * `poly`：标记为多项式，包含变量和`term_list`。
        * `term_list`：标记为稠密或稀疏，包含具体的项表。
    * 选择函数：
        * `term_list`提供接口：`first_term`、`rest_term`、`adjoin_term`。
        * 多项式操作（如加法、乘法等）依赖`term_list`的选择函数实现。

2.  实现步骤：

    * 为稠密和稀疏项表分别定义选择函数和构造函数。
    * 在多项式层面实现加法、乘法、减法、取负等操作，调用`term_list`的选择函数。
    * 支持稠密与稀疏项表的混合运算（运算定义在`poly`层级即可）。

#### 实现代码

##### lib函数
```rust
pub fn install_sparse_terms_package(arith: &ArithmeticContext) -> Option<List> {
    fn first_term(term_list: &List) -> List {
        term_list.head()
    }
    fn adjoin_term(term: List, term_list: List, arith: &ArithmeticContext) -> List {
        if arith.is_equal_to_zero(&coeff(&term)) == true.to_listv() {
            term_list.clone()
        } else {
            pair![term.clone(), term_list.clone()]
        }
    }
    fn tag(x: &List) -> List {
        attach_tag("sparse", x)
    }
    arith.put("first_term", list!["sparse"], {
        ClosureWrapper::new(move |args: &List| {
            // always return sparse term_list, as [sparse, [term]], not [sparse, term]
            // head: term_list ;
            let p = args.head();
            let term_list = list![first_term(&p)];
            Some(tag(&term_list))
        })
    });
    arith.put("rest_terms", list!["sparse"], {
        ClosureWrapper::new(move |args: &List| {
            // head: term_list ;
            let p = args.head();
            let term_list = rest_terms(&p);
            Some(tag(&term_list))
        })
    });
    arith.put("adjoin_term", list!["sparse", "sparse"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let (t1, l) = (args.head().head(), args.tail().head());
            Some(tag(&adjoin_term(t1, l, &arith)))
        })
    });
    arith.put("make_terms_from_sparse", list!["sparse"], {
        ClosureWrapper::new(move |args: &List| {
            let p = args.head();
            Some(tag(&p))
        })
    });
    Some("done".to_string().to_listv())
}
pub fn install_dense_terms_package(arith: &ArithmeticContext) -> Option<List> {
    fn order_dense(term_list: &List) -> List {
        if term_list.is_empty() {
            0.to_listv()
        } else {
            ((term_list.length() - 1) as i32).to_listv()
        }
    }
    fn coeff_dense(term_list: &List) -> List {
        if term_list.is_empty() {
            0.to_listv()
        } else {
            term_list.head()
        }
    }
    fn first_term_dense(term_list: &List) -> List {
        make_term(order_dense(term_list), coeff_dense(term_list))
    }
    fn adjoin_term_dense(term: List, term_list: List, arith: &ArithmeticContext) -> List {
        if arith.is_equal_to_zero(&coeff(&term)) == true.to_listv() {
            term_list
        } else {
            let term_order = order(&term);
            let term_coeff = coeff(&term);
            let term_list_order = order_dense(&term_list);
            assert!(
                term_order.get_basis_value() >= term_list_order.get_basis_value(),
                "adjoin_term: term_list is ordered. The new term must maintain this order by having an order >= all existing terms."
            );
            if term_order == term_list_order {
                // new term_list
                if term_list.is_empty() {
                    list![term_coeff]
                } else {
                    pair![arith.add(&term_list.head(), &term_coeff), term_list.tail()]
                }
            } else {
                // term_order > term_list_order
                adjoin_term_dense(term, pair![0, term_list], arith)
            }
        }
    }
    fn tag(x: &List) -> List {
        attach_tag("dense", x)
    }
    fn sparse_tag(x: &List) -> List {
        attach_tag("sparse", x)
    }
    arith.put("first_term", list!["dense"], {
        ClosureWrapper::new(move |args: &List| {
            // always return sparse term_list, as [sparse, [term]], not [sparse, term]
            let p = args.head();
            let term_list = list![first_term_dense(&p)];
            Some(sparse_tag(&term_list))
        })
    });
    arith.put("rest_terms", list!["dense"], {
        ClosureWrapper::new(move |args: &List| {
            // head: term_list ;
            let p = args.head();
            let term_list = rest_terms(&p);
            Some(tag(&term_list))
        })
    });
    arith.put("adjoin_term", list!["sparse", "dense"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let (t1, l) = (args.head().head(), args.tail().head());
            Some(tag(&adjoin_term_dense(t1, l, &arith)))
        })
    });
    arith.put("make_terms_from_dense", list!["dense"], {
        ClosureWrapper::new(move |args: &List| {
            let p = args.head();
            Some(tag(&p))
        })
    });
    Some("done".to_string().to_listv())
}
pub fn install_polynomial_package(arith: &ArithmeticContext) -> Option<List> {
    fn add_terms(l1: &List, l2: &List, arith: &ArithmeticContext) -> List {
        if is_empty_term_list(l1) {
            l2.clone()
        } else if is_empty_term_list(l2) {
            l1.clone()
        } else {
            let t1 = arith.first_term(&l1);
            let (order1, coeff1) = (order(&pure_first_term(&t1)), coeff(&pure_first_term(&t1)));
            let t2 = arith.first_term(&l2);
            let (order2, coeff2) = (order(&pure_first_term(&t2)), coeff(&pure_first_term(&t2)));

            if order1.get_basis_value() > order2.get_basis_value() {
                arith.adjoin_term(&t1, &add_terms(&arith.rest_terms(&l1), l2, arith))
            } else if order1.get_basis_value() < order2.get_basis_value() {
                arith.adjoin_term(&t2, &add_terms(l1, &arith.rest_terms(&l2), &arith))
            } else {
                let first_term = make_terms_from_sparse(
                    &list![make_term(order1, arith.add(&coeff1, &coeff2))],
                    arith,
                );

                arith.adjoin_term(
                    &first_term,
                    &add_terms(&arith.rest_terms(l1), &arith.rest_terms(l2), &arith),
                )
            }
        }
    }
    fn mul_term_by_all_terms(t1: &List, l: &List, arith: &ArithmeticContext) -> List {
        if is_empty_term_list(l) {
            make_empty_term_list(arith) //[sparse, List::Nil]
        } else {
            let (order1, coeff1) = (order(&pure_first_term(&t1)), coeff(&pure_first_term(&t1)));
            let t2 = arith.first_term(&l);
            let (order2, coeff2) = (order(&pure_first_term(&t2)), coeff(&pure_first_term(&t2)));
            let first_term = make_terms_from_sparse(
                &list![make_term(
                    arith.add(&order1, &order2),
                    arith.mul(&coeff1, &coeff2)
                )],
                arith,
            );
            arith.adjoin_term(
                &first_term,
                &mul_term_by_all_terms(&t1, &arith.rest_terms(&l), &arith),
            )
        }
    }
    fn mul_terms(l1: &List, l2: &List, arith: &ArithmeticContext) -> List {
        if is_empty_term_list(l1) {
            make_empty_term_list(arith) //[sparse, List::Nil]
        } else {
            add_terms(
                &mul_term_by_all_terms(&arith.first_term(l1), l2, &arith),
                &mul_terms(&arith.rest_terms(l1), l2, &arith),
                &arith,
            )
        }
    }
    fn negative_terms(l: &List, arith: &ArithmeticContext) -> List {
        if is_empty_term_list(l) {
            make_empty_term_list(arith) //[sparse, List::Nil]
        } else {
            let t1 = arith.first_term(l);
            let (order1, coeff1) = (order(&pure_first_term(&t1)), coeff(&pure_first_term(&t1)));
            let first_term =
                make_terms_from_sparse(&list![make_term(order1, arith.negative(&coeff1))], arith);

            arith.adjoin_term(&first_term, &negative_terms(&arith.rest_terms(l), &arith))
        }
    }
    fn add_poly(p1: &List, p2: &List, arith: &ArithmeticContext) -> List {
        if is_same_variable(&variable(p1), &variable(p2)) {
            make_poly(
                variable(p1),
                add_terms(&term_list(p1), &term_list(p2), arith),
            )
        } else {
            panic!(
                "{} Polys not in same var -- ADD-POLY",
                list![p1.clone(), p2.clone()]
            )
        }
    }

    fn mul_poly(p1: &List, p2: &List, arith: &ArithmeticContext) -> List {
        if is_same_variable(&variable(p1), &variable(p2)) {
            make_poly(
                variable(p1),
                mul_terms(&term_list(p1), &term_list(p2), arith),
            )
        } else {
            panic!(
                "{} Polys not in same var -- MUL-POLY",
                list![p1.clone(), p2.clone()]
            )
        }
    }
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

    fn tag(x: &List) -> List {
        attach_tag("polynomial", x)
    }

    arith.put("add", list!["polynomial", "polynomial"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let (p1, p2) = (args.head(), args.tail().head());
            Some(tag(&add_poly(&p1, &p2, &arith)))
        })
    });

    arith.put("mul", list!["polynomial", "polynomial"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let (p1, p2) = (args.head(), args.tail().head());
            Some(tag(&mul_poly(&p1, &p2, &arith)))
        })
    });

    arith.put("is_equal_to_zero", list!["polynomial"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let term_list = term_list(&args.head());
            Some(is_equal_to_zero(&term_list, &arith))
        })
    });
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
    arith.put("make_polynomial_from_dense", list!["polynomial"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let (variable, term_list) = (args.head(), args.tail().head());
            let term_list = if term_list.is_empty() {
                make_terms_from_dense(&term_list, &arith)
            } else if type_tag(&term_list) == "sparse".to_listv() {
                eprintln!("warning: try to make dense terms, but found sparse terms arg");
                term_list
            } else if type_tag(&term_list) == "dense".to_listv() {
                term_list
            } else {
                make_terms_from_dense(&term_list, &arith)
            };
            Some(tag(&make_poly(variable, term_list)))
        })
    });
    arith.put("make_polynomial_from_sparse", list!["polynomial"], {
        let arith = arith.clone();
        ClosureWrapper::new(move |args: &List| {
            let (variable, term_list) = (args.head(), args.tail().head());
            let term_list = if term_list.is_empty() {
                make_terms_from_sparse(&term_list, &arith)
            } else if type_tag(&term_list) == "sparse".to_listv() {
                term_list
            } else if type_tag(&term_list) == "dense".to_listv() {
                eprintln!("warning: try to make sparse terms, but found dense terms arg");
                term_list
            } else {
                make_terms_from_sparse(&term_list, &arith)
            };
            Some(tag(&make_poly(variable, term_list)))
        })
    });
    Some("done".to_string().to_listv())
}
```

##### main函数
```rust
use sicp_rs::{
    ch2::ch2_5::{
        ArithmeticContext, install_arithmetic_package, install_dense_terms_package,
        install_polynomial_package, install_sparse_terms_package, make_empty_term_list,
        make_polynomial_from_dense, make_polynomial_from_sparse, make_term, make_terms_from_dense,
        make_terms_from_sparse, pretty_polynomial,
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

    // 测试1：创建稀疏多项式和稠密多项式
    println!("==== Test 1: Create Sparse and Dense Polynomials ====");
    let sparse_term_list = make_terms_from_sparse(
        &list![
            make_term(2.to_listv(), 4.to_listv()),
            make_term(1.to_listv(), 3.to_listv()),
            make_term(0.to_listv(), 7.to_listv())
        ],
        &arith,
    );
    let dense_term_list = make_terms_from_dense(
        &list![
            7.to_listv(), // x^0
            3.to_listv(), // x^1
            4.to_listv()  // x^2
        ],
        &arith,
    );
    let sparse_poly = make_polynomial_from_sparse(&"x".to_listv(), &sparse_term_list, &arith);
    let dense_poly = make_polynomial_from_dense(&"x".to_listv(), &dense_term_list, &arith);
    println!("Sparse Polynomial: {}", sparse_poly);
    println!(
        "Sparse Polynomial: {}",
        pretty_polynomial(&sparse_poly, &arith)
    );
    println!("Dense Polynomial: {}", dense_poly);
    println!(
        "Dense Polynomial: {}",
        pretty_polynomial(&dense_poly, &arith)
    );

    // 测试2：加法
    println!("\n==== Test 2: Polynomial Addition ====");
    let sum_poly = arith.add(&sparse_poly, &dense_poly);
    println!(
        "Sum of Sparse and Dense Polynomials: {}",
        pretty_polynomial(&sum_poly, &arith)
    );

    // 测试3：乘法
    println!("\n==== Test 3: Polynomial Multiplication ====");
    let product_poly = arith.mul(&sparse_poly, &dense_poly);
    println!(
        "Product of Sparse and Dense Polynomials: {}",
        pretty_polynomial(&product_poly, &arith)
    );

    // 测试4：减法
    println!("\n==== Test 4: Polynomial Subtraction ====");
    let diff_poly = arith.sub(&sparse_poly, &dense_poly);
    println!(
        "Difference of Sparse and Dense Polynomials: {}",
        pretty_polynomial(&diff_poly, &arith)
    );

    // 测试5：取负
    println!("\n==== Test 5: Polynomial Negation ====");
    let neg_sparse_poly = arith.negative(&sparse_poly);
    let neg_dense_poly = arith.negative(&dense_poly);
    println!(
        "Negative Sparse Polynomial: {}",
        pretty_polynomial(&neg_sparse_poly, &arith)
    );
    println!(
        "Negative Dense Polynomial: {}",
        pretty_polynomial(&neg_dense_poly, &arith)
    );

    // 测试6：混合运算 (稀疏 + 稠密)
    println!("\n==== Test 6: Mixed Operations (Sparse + Dense) ====");
    let mixed_sum = arith.add(&sparse_poly, &dense_poly);
    let mixed_product = arith.mul(&sparse_poly, &dense_poly);
    let mixed_diff = arith.sub(&sparse_poly, &dense_poly);
    println!(
        "Mixed Sum (Sparse + Dense): {}",
        pretty_polynomial(&mixed_sum, &arith)
    );
    println!(
        "Mixed Product (Sparse * Dense): {}",
        pretty_polynomial(&mixed_product, &arith)
    );
    println!(
        "Mixed Difference (Sparse - Dense): {}",
        pretty_polynomial(&mixed_diff, &arith)
    );

    // 测试7：零多项式判定
    println!("\n==== Test 7: Zero Polynomial Detection ====");
    let zero_poly =
        make_polynomial_from_sparse(&"x".to_listv(), &make_empty_term_list(&arith), &arith);
    println!("Zero Polynomial: {}", pretty_polynomial(&zero_poly, &arith));
    println!("Is Zero Polynomial: {}", arith.is_equal_to_zero(&zero_poly));

    // 测试8：复杂嵌套多项式
    println!("\n==== Test 8: Nested Polynomials ====");
    let nested_poly = make_polynomial_from_sparse(
        &"y".to_listv(),
        &make_terms_from_sparse(
            &list![
                make_term(1.to_listv(), sparse_poly.clone()),
                make_term(0.to_listv(), dense_poly.clone())
            ],
            &arith,
        ),
        &arith,
    );
    println!(
        "Nested Polynomial: {}",
        pretty_polynomial(&nested_poly, &arith)
    );

    println!("\n==== All Tests Completed Successfully ====");
}
```

#### 代码输出
```rust
==== Test 1: Create Sparse and Dense Polynomials ====
Sparse Polynomial: (polynomial, (x, (sparse, ((2, (4, Nil)), ((1, (3, Nil)), ((0, (7, Nil)), Nil))))))
Sparse Polynomial: (polynomial:4x^2 + 3x^1 + 7)
Dense Polynomial: (polynomial, (x, (dense, (7, (3, (4, Nil))))))
Dense Polynomial: (polynomial:7x^2 + 3x^1 + 4)

==== Test 2: Polynomial Addition ====
Sum of Sparse and Dense Polynomials: (polynomial:11x^2 + 6x^1 + 11)

==== Test 3: Polynomial Multiplication ====
Product of Sparse and Dense Polynomials: (polynomial:28x^4 + 33x^3 + 74x^2 + 33x^1 + 28)

==== Test 4: Polynomial Subtraction ====
Difference of Sparse and Dense Polynomials: (polynomial:-3x^2 + 3)

==== Test 5: Polynomial Negation ====
Negative Sparse Polynomial: (polynomial:-4x^2 + -3x^1 + -7)
Negative Dense Polynomial: (polynomial:-7x^2 + -3x^1 + -4)

==== Test 6: Mixed Operations (Sparse + Dense) ====
Mixed Sum (Sparse + Dense): (polynomial:11x^2 + 6x^1 + 11)
Mixed Product (Sparse * Dense): (polynomial:28x^4 + 33x^3 + 74x^2 + 33x^1 + 28)
Mixed Difference (Sparse - Dense): (polynomial:-3x^2 + 3)

==== Test 7: Zero Polynomial Detection ====
Zero Polynomial: (polynomial:Nil)
Is Zero Polynomial: true

==== Test 8: Nested Polynomials ====
Nested Polynomial: (polynomial:(polynomial:4x^2 + 3x^1 + 7)x^1 + (polynomial:7x^2 + 3x^1 + 4))

==== All Tests Completed Successfully ====
```
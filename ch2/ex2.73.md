# 2.4.3 数据导向的程序设计和可加性
## 练习2.73
在2.3.2节，我们描述了一个执行符号求导的程序：
```javascript
function deriv(exp, variable) {
    return is_number(exp)
           ? 0
           : is_variable(exp)
           ? is_same_variable(exp, variable) ? 1 : 0
           : is_sum(exp)
           ? make_sum(deriv(addend(exp), variable), 
                      deriv(augend(exp), variable))
           : is_product(exp)
           ? make_sum(make_product(multiplier(exp), 
                                   deriv(multiplicand(exp), variable)),
                      make_product(deriv(multiplier(exp), variable), 
                                   multiplicand(exp)))
           // more rules can be added here
           : error(exp, "unknown expression type -- deriv");
}
deriv(list("*", list("*", "x", "y"), list("+", "x", 4)), "x");
list("+", list("*", list("*", x, y), list("+", 1, 0)),
          list("*", list("+", list("*", x, 0), list("*", 1, y)),
                    list("+",  x, 4)))
```
可以认为，这个程序也是在执行一种基于被求导表达式类型的分派工作。在这里，数据的“类型标签”就是其代数运算符（例如"+"）​，需要执行的操作是deriv。我们可以把这个程序变换到数据导向的风格，把其中的基本求导函数重新写成：
```javascript
function deriv(exp, variable) {
    return is_number(exp)
           ? 0
           : is_variable(exp)
           ? is_same_variable(exp, variable) ? 1 : 0
           : get("deriv", operator(exp))(operands(exp), variable);
}
function operator(exp) { return head(exp); }

function operands(exp) { return tail(exp); }
```
a.请解释我们在上面究竟做了些什么。为什么我们不能把谓词is_number和is_variable也类似地搬到数据导向的分派中？
b.请写出针对求和式与乘积式的求导函数，以及上面程序所需要的，用于把这些函数安装到表格里的辅助代码。
c.请选择另外的某种你希望包括的求导规则，例如对乘幂（练习2.56）求导等，并把它安装到这一数据导向的系统里。
d.在这一简单的代数运算器中，表达式的类型就是构造它们的代数运算符。假定我们想以另一种相反的方式做索引，使deriv里完成分派的代码行的形式如下：
```javascript
get(operator(exp), "deriv")(operands(exp), variable);
```
求导系统还需要做哪些相应的改动？

## 解答
a. 数据导向,根据表达式中的运算符查表获得相应的求导函数. 谓词函数对于表达式做判断,数据导向需要标签数据,如果谓词类似这样`("num",4)`的形式,也可以做数据导向,根据标签做判断,但这是多此一举,内容已足够代表标签.
b&c. rust代码如下:
```rust
use std::rc::Rc;

use num::Num;
use num::pow::Pow;
use sicp_rs::ch2::ch2_3::{
    addend, augend, base, exponent, is_number, is_same_variable, is_variable, make_exp,
    make_product, make_sum, multiplicand, multiplier,
};
use sicp_rs::ch3::ch3_3::make_table_2d;
use sicp_rs::prelude::*;

/// 获取表达式的运算符
fn operator(exp: &List) -> List {
    exp.head()
}

/// 获取表达式的操作数
fn operands(exp: &List) -> List {
    //ch2.56节代码中直接对exp取操作数,故若使用历史代码并同时使用operands,会多取一次tail
    exp.tail()
}

/// 通用的求导函数，基于数据导向分派
fn deriv<T: Num + Clone + std::fmt::Debug + 'static>(
    exp: &List,
    variable: &List,
    optable: &impl Fn(List) -> Option<List>,
) -> List {
    if is_number(exp) {
        T::zero().to_listv()
    } else if is_variable(exp) {
        if is_same_variable(exp, variable) {
            T::one().to_listv()
        } else {
            T::zero().to_listv()
        }
    } else {
        // 从操作符表中获取对应的求导规则
        if let Some(op) = optable(list!["deriv", operator(exp).clone()]) {
            if let Ok(op) = op.try_as_basis_value::<ClosureWrapper>() {
                if let Some(result) = op.call(&list![exp.clone(), variable.clone()]) {
                    return result;
                }
            }
        }
        panic!("unknown operator -- DERIV, exp {}", exp)
    }
}

/// 求和表达式的求导规则
fn deriv_sum<T: Num + Clone + std::fmt::Debug + 'static>(
    exp: &List,
    variable: &List,
    optable: impl Fn(List) -> Option<List>,
) -> List {
    make_sum::<T>(
        deriv::<T>(&addend(exp), variable, &optable),
        deriv::<T>(&augend(exp), variable, &optable),
    )
}

/// 乘积表达式的求导规则
fn deriv_product<T: Num + Clone + std::fmt::Debug + 'static>(
    exp: &List,
    variable: &List,
    optable: impl Fn(List) -> Option<List>,
) -> List {
    make_sum::<T>(
        make_product::<T>(
            multiplier(exp),
            deriv::<T>(&multiplicand(exp), variable, &optable),
        ),
        make_product::<T>(
            deriv::<T>(&multiplier(exp), variable, &optable),
            multiplicand(exp),
        ),
    )
}

/// 幂表达式的求导规则
fn deriv_exp<T: Num + Clone + std::fmt::Debug + Pow<T, Output = T> + 'static>(
    exp: &List,
    variable: &List,
    optable: impl Fn(List) -> Option<List>,
) -> List {
    make_product::<T>(
        make_product::<T>(
            exponent(exp),
            make_exp::<T>(
                base(exp),
                make_sum::<T>(exponent(exp), (T::zero() - T::one()).to_listv()),
            ),
        ),
        deriv::<T>(&base(exp), variable, &optable),
    )
}

fn main() {
    // 创建操作符表
    let optable: Rc<dyn Fn(&str) -> ClosureWrapper> = make_table_2d();
    let op_cloned = optable.clone();
    let get = move |args: List| optable("lookup").call(&args);
    let put = move |args: List| op_cloned("insert").call(&args);

    // 安装求导规则
    let install_rule = |op: String, rule: ClosureWrapper| {
        put(list!["deriv", op, rule]);
    };

    // 安装求和规则
    let get_cloned = get.clone();
    install_rule(
        "+".to_string(),
        ClosureWrapper::new(move |args: &List| {
            Some(deriv_sum::<f64>(
                &args.head(),
                &args.tail().head(),
                &get_cloned,
            ))
        }),
    );

    // 安装乘积规则
    let get_cloned = get.clone();
    install_rule(
        "*".to_string(),
        ClosureWrapper::new(move |args: &List| {
            Some(deriv_product::<f64>(
                &args.head(),
                &args.tail().head(),
                &get_cloned,
            ))
        }),
    );

    // 安装幂运算规则
    let get_cloned = get.clone();
    install_rule(
        "**".to_string(),
        ClosureWrapper::new(move |args: &List| {
            Some(deriv_exp::<f64>(
                &args.head(),
                &args.tail().head(),
                &get_cloned,
            ))
        }),
    );

    // 测试求导规则
    let exp1 = list!("*", list!("*", "x", "y"), list!("+", "x", 4.0));
    println!(
        "{}",
        deriv::<f64>(&exp1, &"x".to_listv(), &get).pretty_print()
    );

    let exp2 = list!("**", "x", list!("+", "y", 3.0));
    println!(
        "{}",
        deriv::<f64>(&exp2, &"x".to_listv(), &get).pretty_print()
    );

    let exp3 = list!("**", "x", "n");
    println!(
        "{}",
        deriv::<f64>(&exp3, &"x".to_listv(), &get).pretty_print()
    );
}
// Output
// ("+", ("*", "x", "y"), ("*", "y", ("+", "x", 4.0)))
// ("*", ("+", "y", 3.0), ("**", "x", ("+", ("+", "y", 3.0), -1.0)))
// ("*", "n", ("**", "x", ("+", "n", -1.0)))
```
d. 仅需修改put语句即可.
```rust
//put(list!["deriv", op, rule]); 修改为
put(list![op, "deriv", rule]);
```

## 额外的for rust
* 每个闭包的类型都不同,故若想以std::any的形式存储闭包,则会在downcast_ref时遇到困难,因为无论如何都很难给出一个正确的类型.我通过将闭包类型擦除后包在结构体中来解决了这个问题.
* 复杂的闭包中的闭包,很可能编译器较难以推断生命周期,可将闭包提出来,赋值给变量,再将变量传入闭包,以便于编译器推断生命周期.




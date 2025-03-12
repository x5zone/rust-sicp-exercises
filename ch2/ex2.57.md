# 2.3.2 实例：符号求导
## 练习2.57
请扩充我们的求导程序，使之能处理任意多个项（两项或更多项）的求和与乘积。这样，上面的最后一个例子就可以表示为：
```javascript
deriv(list("*", "x", "y", list("+", "x", 3)), "x");
```
请试着通过只修改求和与乘积的表示，完全不修改函数deriv的方式完成这一扩充。例如，让一个和式的addend是它的第一项，而其augend是和式中的其余项。
参考代码:
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
                                   deriv(multiplicand(exp),
                                         variable)),
                      make_product(deriv(multiplier(exp),
                                         variable),
                                   multiplicand(exp)))
           : error(exp, "unknown expression type -- deriv");
}
```

## 解答
* 题目的意思为从a+b,更改为支持a+b+c+d+...的形式.
* 题目中list的表示为:`(*, (x, (y, ((+, (x, (3, Nil))), Nil))))`，可见对于该表达式而言,这是一个完整的子表,依次遍历即可.
* 以`deriv(multiplicand(exp)`为例,`multiplicand(exp)`在第一次迭代时,值为`(y, ((+, (x, (3, Nil))), Nil))`,很糟糕的是,此时已经丢失了`*`,该子表达式在进一步求导的过程中,无法判断是乘法还是加法.
* 同理`deriv(augend(exp)`也丢失了`+`.
* 对于`deriv(addend(exp)`和`deriv(multiplier(exp)`而言,并不需要多担心,addend和multiplier要么是一个数,要么是包含完整信息的一个子表达式.
* 完成此题需要补上丢失的信息,那么可供修改的函数为`augend`和`multiplicand`.(初始时,我没读懂题意,以为题目让修改`make_sum`和`make_product`,但并没有起什么作用.本题目中,只需要修改`augend`和`multiplicand`即可)
* rust代码&输出如下：
```rust
// 依赖代码见习题2.53
// 第一个版本如下(暂时编译不过,需要修改函数签名)
// fn augend<T: Float + Debug + Display + 'static>(s: &List) -> &List {
//     // tail.tail获取一个子表达式，该子表达式是一个两项或更多的加法表达式,但该表达式起始并没有"+"项.
//     let sub_expr = s.tail().tail();
//     fn iter<T: Float + Debug + Display + 'static>(s: &List) -> &List {
//         match s {
//             List::Nil => &List::value(T::zero()),
//             List::Cons(current, next) => {
//                 &make_sum::<T>(&current,&iter::<T>(next))  
//             }
//             List::V(_) => s,
//         }
//     }
//     iter::<T>(sub_expr).head()
// }
// fn multiplicand<T: Float + Debug + Display + 'static>(s: &List) -> &List {
//     // tail.tail获取一个子表达式，该子表达式是一个两项或更多的加法表达式,但该表达式起始并没有"*"项.
//     let sub_expr = s.tail().tail();
//     fn iter<T: Float + Debug + Display + 'static>(s: &List) -> &List {
//         match s {
//             List::Nil => &List::value(T::one()),
//             List::Cons(current, next) => {
//                 &make_product::<T>(&current,iter::<T>(next))
//             }
//             List::V(_) => s,
//         }
//     }
//     iter::<T>(sub_expr).head()
// }
// 从中可看出共有模式,这是典型的accumulate模式.第二个版本如下:
fn augend<T: Float + Debug + Display + 'static>(s: &List) -> Box<List> {
    // tail.tail获取一个子表达式，该子表达式是一个两项或更多的加法表达式,但该表达式起始并没有"+"项.
    let sub_expr = s.tail().tail();
    Box::new(sub_expr.accumulate(
        |current, result| make_sum::<T>(&current, &result),
        List::value(T::zero()),
    ))
}
fn multiplicand<T: Float + Debug + Display + 'static>(s: &List) -> Box<List> {
    // tail.tail获取一个子表达式，该子表达式是一个两项或更多的加法表达式,但该表达式起始并没有"*"项.
    let sub_expr = s.tail().tail();
    Box::new(sub_expr.accumulate(
        |current, result| make_product::<T>(&current, &result),
        List::value(T::one()),
    ))
}
fn main() {
    println!("{}", list!(v!["*"], v!["x"], v!["y"], v!("+", "x", 3)));
    //deriv(list("*", "x", "y", list("+", "x", 3)), "x");
    println!(
        "{}",
        deriv::<f64>(
            &list!(v!["*"], v!["x"], v!["y"], v!("+", "x", 3.0)),
            &v!["x"]
        )
    );
    // deriv(list("*", list("*", "x", "y"), list("+", "x", 3)), "x");
    println!(
        "{}",
        deriv::<f64>(
            &list![v!["*"], v!["*", "x", "y"], v!["+", "x", "3"]],
            &v!["x"]
        )
    );
}
// Output
// (*, (x, (y, ((+, (x, (3, Nil))), Nil)))) 
// (+, ((*, (x, (y, Nil))), ((*, (y, ((+, (x, (3, Nil))), Nil))), Nil))) 
// (+, ((*, (x, (y, Nil))), ((*, (y, ((+, (x, (3, Nil))), Nil))), Nil)))
```

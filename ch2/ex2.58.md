# 2.3.2 实例：符号求导
## 练习2.58
假设我们希望修改求导程序，使它能用于常规的数学公式，其中的"+"和"*"采用中缀记法而不是前缀。由于求导程序的定义基于抽象的数据，我们可以修改它，使之能用于不同的表达式表示，只需要换一套工作在求导函数需要处理的代数表达式的新表示形式上的谓词、选择函数和构造函数。
a.请说明怎样做出这些函数，实现在中缀表示形式上的代数表达式求导。例如下面的例子：
```javascript
list("x", "+", list(3, "*", list("x", "+", list("y", "+", 2))))
```
为了简化工作，你可以假定"+"和"*"总具有两个运算对象，而且表达式里已经加了所有括号。
b.如果我们希望处理某种接近标准的中缀表示法，其中可以略去不必要的括号，并假定乘法具有比加法更高的优先级，例如
```javascript
list("x", "+", 3, "*", list("x", "+", "y", "+", 2))
```
问题就会变困难许多。你能为这种表示方式设计好适当的谓词、选择函数和构造函数，使我们的求导程序仍能工作吗？

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
* a小问比较简单,只略作修改即可,rust代码&输出如下：
```rust
// 依赖代码见习题2.53
// 谓词
fn is_sum(x: &List) -> bool {
    x.is_pair()
        && (x
            .tail()  // 新增一个tail()方法,获取第二项
            .head()
            .value_as::<String>()
            .unwrap_or(&"".to_string())
            == "+"
            || x.tail().head().value_as::<&str>().unwrap_or(&"") == &"+")
}
fn is_product(x: &List) -> bool {
    x.is_pair()
        && (x
            .tail() // 新增一个tail()方法,获取第二项
            .head()
            .value_as::<String>()
            .unwrap_or(&"".to_string())
            == "*"
            || x.tail().head().value_as::<&str>().unwrap_or(&"") == &"*")
}
// 选择函数
fn addend(s: &List) -> &List {
    s.head()
}
fn augend(s: &List) -> &List {
    s.tail().tail().head()
}
fn multiplier(s: &List) -> &List {
    s.head()
}
fn multiplicand(s: &List) -> &List {
    s.tail().tail().head()
}
// 构造函数
fn make_sum<T: Float + Debug + Display + 'static>(a1: &List, a2: &List) -> List {
    if number_equal::<T>(a1, &List::value(T::zero())) {
        return a2.clone();
    } else if number_equal::<T>(a2, &List::value(T::zero())) {
        return a1.clone();
    } else if a1.is_value() && a2.is_value() {
        if let (Ok(a1), Ok(a2)) = (a1.value_as::<T>(), a2.value_as::<T>()) {
            return List::value(*a1 + *a2);
        }
    }
    // 只需要修改这一行,调整为中缀表达式即可
    return List::from_slice(&[a1.clone(), v!["+"], a2.clone()]);
}
fn make_product<T: Float + Debug + Display + 'static>(m1: &List, m2: &List) -> List {
    if number_equal::<T>(m1, &List::value(T::zero()))
        || number_equal::<T>(m2, &List::value(T::zero()))
    {
        return List::value(T::zero());
    } else if number_equal::<T>(m1, &List::value(T::one())) {
        return m2.clone();
    } else if number_equal::<T>(m2, &List::value(T::one())) {
        return m1.clone();
    } else if m1.is_value() && m2.is_value() {
        if let (Ok(m1), Ok(m2)) = (m1.value_as::<T>(), m2.value_as::<T>()) {
            return List::value(*m1 * *m2);
        }
    }
    // 只需要修改这一行,调整为中缀表达式即可
    return List::from_slice(&[m1.clone(), v!["*"], m2.clone()]);
}

fn main() {
    println!(
        "{}",
        list!(
            v!["x"],
            v!["+"],
            list!(v![3], v!["*"], list!(v!["x"], v!["+"], v!("y", "+", 2)))
        )
    );
    //deriv(list("x", "+", list(3, "*", list("x", "+", list("y", "+", 2)))));
    println!(
        "{}",
        deriv::<f64>(
            &list!(
                v!["x"],
                v!["+"],
                list!(v![3.0], v!["*"], list!(v!["x"], v!["+"], v!("y", "+", 2.0)))
            ),
            &v!["x"]
        )
    );
}
// Output
// (x, (+, ((3, (*, ((x, (+, ((y, (+, (2, Nil))), Nil))), Nil))), Nil))) 
// 4
```
* b小问分析如下:
* 构造一个表达式$x+3*(x+y+2)*3+x$,并代入运算.
* is_sum为真,addend取出$x$,而augend应该取出什么?
    * 根据deriv函数的定义,如果仅取出$3$,或者取出$3*(x+y+2)*3$,都会在求导中丢失数据.所以augend必然为取出剩余所有,也即为`expr.tail().tail()`,值为 $3*(x+y+2)*3+x$.
    * 对比augend历史定义(`expr.tail().tail().head()`),需要注意此时我们丢掉了一个`head()`,后续需要补上.
    * addend + augend(剩余所有)也符合原本的表达式语义.
* 根据执行流程,接下来需要执行$deriv(3*(x+y+2)*3+x)$.此时的应该是乘法还是加法?
    * 此时应该判断为加法,将$3*(x+y+2)*3$视为一个用括号包住的子表达式.
    * 若判断为乘法,multiplicand同理augend,也取出剩余所有表达式.但此时,$a*b+c$在递归迭代的过程中,最后的$+c$极其难以处理(亲身经历).
    * multiplier * multiplicand(剩余所有),此时已不符合原表达式的语义了.
    * 综上,此时应该判断为加法.is_product为假,is_sum为真(递归判断后续是否有$+$即可).
* is_sum为真,addend应取出$3*(x+y+2)*3$,augend应取出$x$.
    * addend类似谓词is_sum的实现,除非遇见$+$号,否则一直迭代.
    * augend是剩余所有,若表达式已到达结尾,需要补上`head()`.
* multiplicand可能会取出一项或更多的中缀乘法表达式,所以需要类似2.57节中的accumulate运算,将多项乘法合并.
* 综上,谓词,选择函数,构造函数的实现已经比较清晰了.rust代码和测试如下:
```rust
// 依赖代码见习题2.53
fn is_expect_sign(x: &List, s: &str) -> bool {
    x.value_as::<String>().unwrap_or(&"".to_string()) == &s.to_string()
        || x.value_as::<&str>().unwrap_or(&"") == &s
}
fn is_sum(x: &List) -> bool {
    if !x.is_pair() {
        false
    } else if is_expect_sign(x.tail().head(), "+") {
        true
    } else if is_expect_sign(x.tail().head(), "*") {
        // 只有后面还有加号,乘法可以理解为用括号包住的子表达式
        // 递归判断被加数子表达式是否为加法
        is_sum(x.tail().tail())
    } else {
        false
    }
}
fn is_product(x: &List) -> bool {
    if !x.is_pair() {
        false
    } else if is_expect_sign(x.tail().head(), "+") {
        false
    } else if is_expect_sign(x.tail().head(), "*") && !is_sum(x) {
        // 乘法只应处理被括号包住,全部为乘法的子表达式
        // x*y*z+3->is_sum
        true
    } else {
        false
    }
}
fn addend(s: &List) -> List {
    // 不能直接取head,可能类似为3*x*y*z+5的结构
    let (addend_expr, sign, augend_expr) = (s.head(), s.tail().head(), s.tail().tail());
    match (addend_expr, sign, augend_expr) {
        (_, List::V(_), _) => {
            if is_expect_sign(sign, "*") {
                return List::pair(
                    addend_expr.clone(),
                    List::pair(sign.clone(), addend(augend_expr)),
                );
            } else if is_expect_sign(sign, "+") {
                return addend_expr.clone();
            }
            panic!("addend should not be here, sign is invalid, {}", s);
        }
        _ => panic!("addend should not be here, {}", s),
    }
}
fn augend(s: &List) -> List {
    // 不能直接取tail.tail.head,可能类似为3*x*y*z+5的结构
    let (addend_expr, sign, augend_expr) = (s.head(), s.tail().head(), s.tail().tail());
    match (addend_expr, sign, augend_expr) {
        (_, List::V(_), _) => {
            if is_expect_sign(sign, "*") {
                augend(augend_expr)
            } else if is_expect_sign(sign, "+") {
                if augend_expr.tail().is_empty() {
                    // tail is List::Nil
                    // 当表达式处理到结尾时,必须取一次head(),必须保持head()的语义
                    // 否则类似 (x,None)这样的表达式就会被求导
                    augend_expr.head().clone()
                } else {
                    //假设一个长表达式,后续还有"*",此时必须带上,避免丢弃
                    augend_expr.clone()
                }
            } else {
                panic!("augend should not be here, sign is invalid, {}", s);
            }
        }
        _ => panic!("augend should not be here, {}", s),
    }
}
fn multiplier(s: &List) -> &List {
    s.head()
}
fn multiplicand<T: Float + Debug + Display + 'static>(s: &List) -> List {
    // tail.tail获取一个子表达式，该子表达式是一项或更多的中缀乘法表达式.
    let micand = s.tail().tail();
    match micand {
        List::Cons(_, _) => make_product::<T>(micand.head(), &multiplicand::<T>(micand)),
        List::Nil => List::value(T::one()),
        List::V(_) => micand.clone(),
    }
}
fn make_sum<T: Float + Debug + Display + 'static>(a1: &List, a2: &List) -> List {
    if number_equal::<T>(a1, &List::value(T::zero())) {
        return a2.clone();
    } else if number_equal::<T>(a2, &List::value(T::zero())) {
        return a1.clone();
    } else if a1.is_value() && a2.is_value() {
        if let (Ok(a1), Ok(a2)) = (a1.value_as::<T>(), a2.value_as::<T>()) {
            return List::value(*a1 + *a2);
        }
    }
    return List::from_slice(&[a1.clone(), v!["+"], a2.clone()]);
}
fn make_product<T: Float + Debug + Display + 'static>(m1: &List, m2: &List) -> List {
    if number_equal::<T>(m1, &List::value(T::zero()))
        || number_equal::<T>(m2, &List::value(T::zero()))
    {
        return List::value(T::zero());
    } else if number_equal::<T>(m1, &List::value(T::one())) {
        return m2.clone();
    } else if number_equal::<T>(m2, &List::value(T::one())) {
        return m1.clone();
    } else if m1.is_value() && m2.is_value() {
        if let (Ok(m1), Ok(m2)) = (m1.value_as::<T>(), m2.value_as::<T>()) {
            return List::value(*m1 * *m2);
        }
    }
    return List::from_slice(&[m1.clone(), v!["*"], m2.clone()]);
}
fn main() {
    //deriv(list("x", "+", list(3, "*", list("x", "+", list("y", "+", 2)))));
    println!(
        "{}",
        deriv::<f64>(
            &list!(
                v!["x"],
                v!["+"],
                v![3.0],
                v!["*"],
                v!["x", "+", "y", "+", 2.0],
                v!["*"],
                v![3.0], //如果此处写的是3,就会downcast失败,从而最终非法表达式=.=
                v!["+"],
                v!["x"],
            ),
            &v!["x"]
        )
    );
    //deriv(list("x", "+", list(3, "*", list("x", "+", list("y", "+", 2)))));
    println!(
        "{}",
        deriv::<f64>(
            &list!(
                v!["x"],
                v!["+"],
                list!(v![3.0], v!["*"], list!(v!["x"], v!["+"], v!("y", "+", 2.0)))
            ),
            &v!["x"]
        )
    );
}
// Output:
// x+3*(x+y+2)*3+x
// 11
// x+3*(x+y+2)
// 4
```
# 2.3.2 实例：符号求导
## 练习2.56
请说明如何扩充上面的基本求导规则，以便处理更多种类的表达式。例如，实现下面的求导规则：
$$\frac{\mathrm{d}(u^n)}{\mathrm{d}x} = n u^{n-1} \left( \frac{\mathrm{d}u}{\mathrm{d}x} \right)$$
请给程序deriv增加一个新子句，并以适当的方式定义函数is_exp、base、exponent和make_exp，实现这个求导规则（你可以考虑用符号"**"表示乘幂）​。请把如下规则也构造到程序里：任何东西的0次幂都是1，而它们的1次幂都是其自身。

参考代码:
```javascript
function is_variable(x) { return is_string(x); }

function is_same_variable(v1, v2) {
    return is_variable(v1) && is_variable(v2) && v1 === v2;
}

function is_sum(x) {
    return is_pair(x) && head(x) === "+";
}

function number_equal(exp, num) {
    return is_number(exp) && exp === num;
}

function make_sum(a1, a2) {
    return number_equal(a1, 0)
           ? a2
           : number_equal(a2, 0)
           ? a1
           : is_number(a1) && is_number(a2)
           ? a1 + a2
           : list("+", a1, a2);
}

function make_product(m1, m2) {
    return number_equal(m1, 0) || number_equal(m2, 0)
           ? 0
           : number_equal(m1, 1)
           ? m2
           : number_equal(m2, 1)
           ? m1
           : is_number(m1) && is_number(m2)
           ? m1 * m2
           : list("*", m1, m2);
}


function addend(s) { return head(tail(s)); }

function augend(s) { return head(tail(tail(s))); }

function is_product(x) {
    return is_pair(x) && head(x) === "*";
}

function multiplier(s) { return head(tail(s)); }

function multiplicand(s) { return head(tail(tail(s))); }
list("x", "+", 3, "*", list("x", "+", "y", "+", 2), "*", 3, "+", "x")
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

deriv(list("*", list("*", "x", "y"), list("+", "x", 3)), "x");
```
## 解答
* rust代码&输出如下：
```rust
// 依赖代码见习题2.53
fn is_exp(x: &List) -> bool {
    x.is_pair()
        && (x.head().value_as::<String>().unwrap_or(&"".to_string()) == "**"
            || x.head().value_as::<&str>().unwrap_or(&"") == &"**")
}
fn base(s: &List) -> &List {
    s.tail().head()
}
fn exponent(s: &List) -> &List {
    s.tail().tail().head()
}
fn make_exp<T: Float + Debug + Display + 'static>(base: &List, exp: &List) -> List {
    if number_equal::<T>(exp, &List::value(T::zero())) {
        // 任何数的0次幂都为1
        return List::value(T::one());
    } else if number_equal::<T>(exp, &List::value(T::one())) {
        // 任何数的1次幂都为它本身
        return base.clone();
    } else if base.is_value() && exp.is_value() {
        // 如果均为常数,则直接计算
        if let (Ok(base), Ok(exp)) = (base.value_as::<T>(), exp.value_as::<T>()) {
            return List::value(base.powf(*exp));
        }
    }
    return List::from_slice(&[v!["**"], base.clone(), exp.clone()]);
}
fn deriv<T: Float + Debug + Display + 'static>(exp: &List, variable: &List) -> List {
    if exp.is_value() {
        if let Ok(_) = exp.value_as::<T>() {
            return List::value(T::zero());
        } else if is_variable(exp) {
            if is_same_variable(exp, variable) {
                return List::value(T::one());
            } else {
                return List::value(T::zero());
            }
        }
    } else if is_sum(exp) {
        return make_sum::<T>(
            &deriv::<T>(addend(exp), variable),
            &deriv::<T>(augend(exp), variable),
        );
    } else if is_product(exp) {
        return make_sum::<T>(
            &make_product::<T>(multiplier(exp), &deriv::<T>(multiplicand(exp), variable)),
            &make_product::<T>(&deriv::<T>(multiplier(exp), variable), multiplicand(exp)),
        );
    } else if is_exp(exp) {
        let base = base(exp);
        let exp = exponent(exp);
        let exp_1 = make_sum::<T>(exp, &List::value(T::zero() - T::one()));
        return make_product::<T>(
            &make_product::<T>(exp, &make_exp::<T>(base, &exp_1)),
            &deriv::<T>(base, variable),
        );
    }
    panic!("unknown expression type -- DERIV {}", exp);
}
fn main() {
    // 幂运算规则测试
    let exp = list![v!["**"], v!["x"], v![3.0]]; // x^3
    println!("x^3 的导数: {}", deriv::<f64>(&exp, &v!["x"])); // 3 * x^2

    let exp = list![v!["**"], v!["x"], v!["n"]]; // x^n
    println!("x^n 的导数: {}", deriv::<f64>(&exp, &v!["x"])); // n * x^(n-1)
    // deriv(list("*", list("*", "x", "y"), list("+", "x", 3)), "x");
    println!(
        "复杂表达式: {}",
        deriv::<f64>(
            &list![v!["*"], v!["*", "x", "y"], v!["+", "x", "3"]],
            &v!["x"]
        )
    );
}
// Output
// x^3 的导数: (*, (3, ((**, (x, (2, Nil))), Nil)))
// x^n 的导数: (*, (n, ((**, (x, ((+, (n, (-1, Nil))), Nil))), Nil)))
// 复杂表达式: (+, ((*, (x, (y, Nil))), ((*, (y, ((+, (x, (3, Nil))), Nil))), Nil)))
fn is_variable(x: &List) -> bool {
    x.is_value() && x.get_value().is_string()
}
fn is_same_variable(v1: &List, v2: &List) -> bool {
    is_variable(v1) && v1.equals(v2)
}
fn is_sum(x: &List) -> bool {
    x.is_pair()
        && (x.head().value_as::<String>().unwrap_or(&"".to_string()) == "+"
            || x.head().value_as::<&str>().unwrap_or(&"") == &"+")
}
fn is_product(x: &List) -> bool {
    x.is_pair()
        && (x.head().value_as::<String>().unwrap_or(&"".to_string()) == "*"
            || x.head().value_as::<&str>().unwrap_or(&"") == &"*")
}
fn addend(s: &List) -> &List {
    s.tail().head()
}
fn augend(s: &List) -> &List {
    s.tail().tail().head()
}
fn multiplier(s: &List) -> &List {
    s.tail().head()
}
fn multiplicand(s: &List) -> &List {
    s.tail().tail().head()
}
fn number_equal<T: Float + 'static>(exp: &List, num: &List) -> bool {
    if exp.is_value() && num.is_value() {
        if let (Ok(exp), Ok(num)) = (exp.value_as::<T>(), num.value_as::<T>()) {
            return (*exp - *num).abs() < T::epsilon();
        }
    }
    return false;
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
    return List::from_slice(&[v!["+"], a1.clone(), a2.clone()]);
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
    return List::from_slice(&[v!["*"], m1.clone(), m2.clone()]);
}
```
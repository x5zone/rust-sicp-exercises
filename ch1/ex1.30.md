# 1.3.1 函数作为参数
## 练习1.30
上面声明的sum函数将产生一个线性递归。我们可以重写该函数，使之能迭代地执行。请说明应该怎样填充下面声明中空缺的表达式，完成这一工作。
```javascript
function sum(term, a, next, b) {
    function iter(a, result) {
        return <??>
            ? <??>
            : iter(<??>,<??>)
    }
    return iter(<??>,<??>)
}
function sum_original(term, a, next, b) {
    return a > b
       ? 0
       : term(a) + sum(term, next(a), next, b);
}
```
## 解答
* javascript版本填空如下:
```javascript
function sum(term, a, next, b) {
    function iter(a, result) {
        return a > b
            ? result
            : iter(next(a),result+term(a))
    }
    return iter(a,0)
}
```
* rust版本改起来更简单
```rust
fn sum_iter<F, G>(term: F, mut a: f64, next: G, b: f64) -> f64
where
    F: Fn(f64) -> f64,
    G: Fn(f64) -> f64,
{
    let mut res = 0.0;
    while a < b {
        res += term(a);
        a = next(a);
    }
    res
}
fn sum_simpson_iter<F: Fn(i32) -> f64>(term: F, k: i32) -> f64 {
    let mut res = 0.0;
    for i in 0..=k {
        res += term(i);
    }
    res
}
```
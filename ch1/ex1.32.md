# 1.3.1 函数作为参数
## 练习1.32
a.请说明，sum和product（练习1.31）都是另一个称为accumulate的更一般概念的特殊情况，accumulate使用某些普适的累积函数组合起一系列项：
```javascript
accumulate(combiner, null_value, term, a, next, b);
```
accumulate取与sum和product一样的项和范围描述参数，再加一个（两个参数的）combiner函数，它说明如何组合当前项与前面各项的积累结果，还有一个null_value参数，它说明在所有的项都用完时的基本值。请声明accumulate，并说明我们能怎样通过简单调用accumulate的方式写出sum和product的声明。
b.如果你的accumulate函数生成的是递归计算过程，那么请写一个生成迭代计算过程的函数。如果它生成迭代计算过程，请写一个生成递归计算过程的函数。

## 解答
```rust
fn accumlate<F,G,H>(combiner: H, null_value: f64,term: F, a: f64, next: G, b: f64) -> f64
where
    F: Fn(f64) -> f64,
    G: Fn(f64) -> f64,
    H: Fn(f64,f64) -> f64
{
    if a > b {
        return null_value;
    } else {
        combiner(term(a),accumlate(combiner, null_value, term, next(a), next, b))
    }
}
fn accumlate_iter<F,G,H>(combiner: H, null_value: f64,term: F, mut a: f64, next: G, b: f64) -> f64
where
    F: Fn(f64) -> f64,
    G: Fn(f64) -> f64,
    H: Fn(f64,f64) -> f64
{
    let mut res = null_value;
    while a < b {
        res = combiner(res,term(a));
        a = next(a);
    }
    res
}
fn product<F, G>(term: F, a: f64, next: G, b: f64) -> f64
where
    F: Fn(f64) -> f64,
    G: Fn(f64) -> f64,
{
    let combiner = |x,y| x*y;
    accumlate(combiner, 1.0, term, a, next, b)
}
fn sum<F, G>(term: F, a: f64, next: G, b: f64) -> f64
where
    F: Fn(f64) -> f64,
    G: Fn(f64) -> f64,
{
    let combiner = |x,y| x+y;
    accumlate(combiner, 0.0, term, a, next, b)
}
```
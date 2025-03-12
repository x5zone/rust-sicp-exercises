# 1.3.1 函数作为参数
## 练习1.31
a.函数sum是可以用高阶函数表示的大量类似抽象中最简单的一个。请写一个类似的称为product的函数，它返回某个函数在给定范围中各个点上的值的乘积。请说明如何利用product声明factorial。再请根据下面公式计算π的近似值：
$$\frac{\pi}{4} = \frac{2 \cdot 4 \cdot 4 \cdot 6 \cdot 6 \cdot 8 \cdot \cdots}{3 \cdot 3 \cdot 5 \cdot 5 \cdot 7 \cdot 7 \cdot \cdots}$$
b.如果你的product函数生成的是一个递归计算过程，那么请写一个生成迭代计算过程的函数。如果它生成迭代计算过程，请写一个生成递归计算过程的函数。

## 解答
* rust代码如下:
```rust
fn product<F, G>(term: F, a: f64, next: G, b: f64) -> f64
where
    F: Fn(f64) -> f64,
    G: Fn(f64) -> f64,
{
    if a > b {
        return 1.0;
    } else {
        term(a) * product(term, next(a), next, b)
    }
}
fn product_iter<F, G>(term: F, mut a: f64, next: G, b: f64) -> f64
where
    F: Fn(f64) -> f64,
    G: Fn(f64) -> f64,
{
    let mut res = 1.0;
    while a < b {
        res *= term(a);
        a = next(a);
    }
    res
}
fn factorial(a: f64, b: f64) -> f64 {
    let term = |x| ((x - 1.0) * (x + 1.0)) / (x * x);
    let next = |x| x + 2.0;
    product_iter(term, a, next, b)
}
```
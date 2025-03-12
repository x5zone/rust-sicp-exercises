# 1.3.1 函数作为参数
## 练习1.29
辛普森规则是另一种数值积分方法，比上面的规则更精确。使用辛普森规则，函数f在范围a和b之间的定积分的近似值是：$$\frac{h}{3} \left[ y_0 + 4y_1 + 2y_2 + 4y_3 + 2y_4 + \cdots + 2y_{n-2} + 4y_{n-1} + y_n \right]$$其中的h=(b-a)/n，n是某个偶数，而$y_k=f(a+kh)$。​（采用较大的n能提高近似精度。​）请声明一个具有参数f、a、b和n，采用辛普森规则计算并返回积分值的函数。用你的函数求cube在0和1之间的积分（取n=100和n=1000）​，并用得到的值与上面用integral函数得到的结果比较。
```javascript
function integral(f, a, b, dx) {
    function add_dx(x) {
        return x + dx;
    }
    return sum(f, a + dx / 2, add_dx, b) * dx;
}
function cube(x) {
    return x * x * x;
}
function sum(term, a, next, b) {
    return a > b
       ? 0
       : term(a) + sum(term, next(a), next, b);
}
function sum_cubes(a, b) {
    return integral(cube, a, b, (b - a) / 1000);
}
```
##  解答
* rust代码如下:
```rust
fn main() {
    for i in [10, 100, 1000, 10000] {
        println!("n: {} integral: {}", i, sum_cubes(0_f64, 1_f64, i));
        println!("n: {} simpson:  {}", i, sum_simpson_cubes(0_f64, 1_f64, i));
    }
}
fn sum<F, G>(term: F, a: f64, next: G, b: f64) -> f64
where
    F: Fn(f64) -> f64,
    G: Fn(f64) -> f64,
{
    if a > b {
        return 0.0;
    } else {
        term(a) + sum(term, next(a), next, b)
    }
}
fn integral(f: impl Fn(f64) -> f64, a: f64, b: f64, dx: f64) -> f64 {
    sum(f, a + dx / 2.0, |x| x + dx, b) * dx
}
fn sum_cubes(a: f64, b: f64, n: i32) -> f64 {
    let cube = |x| x * x * x;
    integral(cube, a, b, (b - a) / (n as f64))
}
fn simpson_rule(f: impl Fn(f64) -> f64, a: f64, b: f64, n: i32) -> f64 {
    let h = (b - a) / (n as f64);
    let term = |k: i32| {
        let res = f(a + k as f64 * h);
        if k == 0 || k == n {
            1.0 * res
        } else if k % 2 == 0 {
            2.0 * res
        } else {
            4.0 * res
        }
    };
    h / 3.0 * sum_simpson(term, n)
}
fn sum_simpson<F: Fn(i32) -> f64>(term: F, k: i32) -> f64 {
    if k < 0 {
        0.0
    } else {
        term(k) + sum_simpson(term, k - 1)
    }
}
fn sum_simpson_cubes(a: f64, b: f64, n: i32) -> f64 {
    let cube = |x| x * x * x;
    simpson_rule(cube, a, b, n)
}
```
* output如下:
```
n: 100  integral: 0.24998750000000042
n: 100  simpson:  0.25000000000000006
n: 1000 integral: 0.249999875000001
n: 1000 simpson:  0.25000000000000006
```
* 综上，辛普森规则更精确。
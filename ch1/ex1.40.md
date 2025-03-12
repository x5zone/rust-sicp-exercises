# 1.3.4 函数作为返回值
## 练习1.40
请声明一个函数cubic，它可以和newtons_method函数一起用在下面的形式的表达式里：
```javascript
function deriv(g) {
    return x => (g(x + dx) - g(x)) / dx;
}
function newton_transform(g) {
    return x => x - g(x) / deriv(g)(x);
}
const tolerance = 0.00001;
function fixed_point(f, first_guess) {
    function close_enough(x, y) {
        return abs(x - y) < tolerance;
    }
    function try_with(guess) {
        const next = f(guess);
        return close_enough(guess, next)
            ? next
            : try_with(next);
    }
    return try_with(first_guess);
}
function newtons_method(g, guess) {
    return fixed_point(newton_transform(g), guess);
}
newtons_method(cubic(a,b,c),1)
```
以逼近三次方程$x^3+ax^2+bx+c$的零点。

## 解答
* 令$g(x) = x^3+ax^2+bx+c$，$f(x)=x-\frac{g(x)}{D_{g(x)}}$，则$g(x)=0$的一个解就是函数$f(x)$的一个不动点。
* 由上可知，$g(x)$即为题目所求三次方程$x^3+ax^2+bx+c$。
* `fixed_point(newton_transform(g)`中，`newton_transform(g)`即为$f(x)$,而参数g为$x^3+ax^2+bx+c$
* 可得cubic(a,b,c):
```javascript
function cubic(a,b,c) {
    return x => x*x*x+a*x*x+b*x+c;
}
```
* 对应的rust代码如下:
```rust
use core::f64;
use num::{pow::Pow, Float};
use rand::{thread_rng, Rng};
use std::fmt::Display;
fn main() {
    let mut rng = thread_rng();
    let mut test_vec = Vec::<(f64, f64, f64)>::new();
    for _ in 0..20 {
        let (a, b, c) = (rng.gen(), rng.gen(), rng.gen());
        test_vec.push((a, b, c))
    }
    for (a, b, c) in test_vec.into_iter() {
        let x = newtons_method(&cubic(a, b, c), 1.0);
        let y = cubic(a, b, c)(x);
        println!("{} = f({})", y, x);
    }
}
fn cubic(a: f64, b: f64, c: f64) -> impl Fn(f64) -> f64 {
    move |x| x.pow(3) + a * x.pow(2) + b * x + c
}
fn deriv<T, F>(g: F) -> impl Fn(T) -> T
where
    T: Float + Display,
    F: Fn(T) -> T,
{
    let dx = T::from(TOLERANCE).unwrap();
    move |x| (g(x + dx) - g(x)) / dx
}
fn newton_transform<'a, T, F>(g: &'a F) -> impl Fn(T) -> T + 'a
where
    T: Float + Display,
    F: Fn(T) -> T,
{
    move |x| x - g(x) / deriv(g)(x)
}
fn newtons_method<'a, T, F>(g: &'a F, guess: T) -> T
where
    T: Float + Display,
    F: Fn(T) -> T,
{
    fixed_point(newton_transform(g), guess)
}
const TOLERANCE: f64 = 0.00001;
fn close_enough<T: Float + Display>(x: T, y: T) -> bool {
    if let Some(b) = (x - y).abs().to_f64() {
        b < TOLERANCE
    } else {
        false
    }
}
fn average_damp<'a, T, F>(f: &'a F) -> impl Fn(T) -> T + 'a
where
    T: Float + Display,
    F: Fn(T) -> T,
{
    move |x| (x + f(x)) / (T::one() + T::one())
}
fn fixed_point<T, F>(f: F, mut guess: T) -> T
where
    T: Float + Display,
    F: Fn(T) -> T,
{
    loop {
        let next = average_damp(&f)(guess);
        assert!(next.is_finite());

        if close_enough(guess, next) {
            return next;
        }
        guess = next;
    }
}
```
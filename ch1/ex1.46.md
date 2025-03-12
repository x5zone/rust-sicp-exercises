# 1.3.4 函数作为返回值
## 练习1.46
本章描述的一些数值算法都是迭代式改进的实例。迭代式改进是一种非常通用的计算策略，它说：为了计算某些东西，我们可以从对答案的某个初始猜测开始，检查这一猜测是否足够好，如果不行就改进这一猜测，将改进后的猜测作为新猜测继续这一计算过程。请写一个函数iterative_improve，它以两个函数为参数：其中一个表示评判猜测是否足够好的方法，另一个表示改进猜测的方法。iterative_improve的返回值应该是函数，它以某个猜测为参数，通过不断改进，直至得到的猜测足够好为止。利用iterative_improve重写1.1.7节的sqrt函数和1.3.3节的fixed_point函数。
```javascript
function sqrt_iter(guess, x) {
    return is_good_enough(guess, x)
           ? guess
           : sqrt_iter(improve(guess, x),
                      x);
}
function improve(guess, x) {
    return average(guess, x / guess);
}
function average(x, y) {
    return (x + y) / 2;
}
function is_good_enough(guess, x) {
    return abs(square(guess) - x) < 0.001;
}
function sqrt(x) {
    return sqrt_iter(1.0, x);
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
```

## 解答
* iterative_improve整体函数和fixed_point函数类似，该函数是抽象出了sqrt_iter和fixed_point函数的公共部分。
* python代码如下:
```python
def iterative_improve(good_enough,imporve):
    def try_with(guess):
        next = imporve(guess)
        if good_enough(next):
            return next
        else:
            return try_with(next)
    return try_with

def fixed_point(f,first_guess):
    def close_enough(x):
        return abs(x-f(x)) < 0.00001
    return iterative_improve(close_enough,f)(first_guess)

def sqrt(x):
    def good_enough(v):
        return abs(v*v-x) < 0.00001
    def imporve(v):
        print("imporve",v)
        return (v+x/v)/2
    return iterative_improve(good_enough,imporve)(1.0)
```
* rust代码如下(给出冗余代码以便于编译通过):
```rust
fn main() {
    println!("{}", nth_root(1024.0_f64, 10));
    println!("{}", sqrt(1024.0_f64));
}
fn iterative_improve<T, F, G>(good_enough: F, improve: G) -> impl Fn(T) -> T
where
    T: Float + Display,
    F: Fn(T) -> bool,
    G: Fn(T) -> T,
{
    move |guess: T| {
        let mut next = improve(guess);
        while !good_enough(next) {
            next = improve(next);
        }
        next
    }
}
fn sqrt<T>(x: T) -> T
where
    T: Float + Display,
{
    let good_enough = |guess: T| close_enough(guess * guess, x);
    let improve = |guess: T| (guess + x / guess) / (T::one() + T::one());
    iterative_improve(good_enough, improve)(T::one())
}
fn fixed_point<T, F>(f: F, guess: T) -> T
where
    T: Float + Display,
    F: Fn(T) -> T,
{
    let good_enough = |guess: T| close_enough(guess, f(guess));
    let improve = |guess: T| f(guess);
    iterative_improve(good_enough, improve)(guess)
}

const TOLERANCE: f64 = 0.00001;
fn close_enough<T: Float + Display>(x: T, y: T) -> bool {
    if let Some(b) = (x - y).abs().to_f64() {
        b < TOLERANCE
    } else {
        false
    }
}

fn average_damp<T, F>(f: F) -> Box<dyn Fn(T) -> T>
//Box<dyn Fn(T) -> T>
where
    T: Float + Copy,
    F: Fn(T) -> T + 'static, //'static 是必须的，因为我们要把闭包放到 Box 中
{
    Box::new(move |x| (x + f(x)) / (T::one() + T::one()))
}
// 对输入f进行n次平滑
fn n_average_damp<T, F>(f: F, n: i32) -> Box<dyn Fn(T) -> T>
where
    T: Float + Copy + 'static,
    F: Fn(T) -> T + Copy + 'static,
{
    Box::new(move |x: T| {
        let mut n_f: Box<dyn Fn(T) -> T> = Box::new(f); // 初始值是 f
        for _ in 0..n {
            n_f = average_damp(n_f); // 每次平滑后返回的类型仍然是 Box<dyn Fn(T) -> T>
        }
        n_f(x)
    })
}

fn nth_root<T>(x: T, n: i32) -> T
where
    T: Float + Display + 'static,
{
    let n_pow = move |y: T| x / y.powi(n - 1);
    let k = n.to_f64().unwrap().sqrt().ceil().to_i32().unwrap();
    let n_damp = n_average_damp(n_pow, k);
    fixed_point(n_damp, T::one())
}
```
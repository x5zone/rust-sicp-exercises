# 1.3.3 函数作为通用的方法
## 练习1.35
请证明黄金分割率ϕ（1.2.2节）是变换x↦1+1/x不动点。请利用这一事实，通过函数fixed_point计算ϕ的值。
> x↦1+1/x中↦为映射到，是数学上写lambda表达式的方法。
```javascript
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
* 证明略。
* rust代码如下:
```rust
fn main() {
    println!("{}",fixed_point(&test, 1.0));
}
fn test(x: f64) -> f64 {
    1.0 + 1.0 / x
}
use num::Float;
const TOLERANCE: f64 = 0.00001;
fn fixed_point<T, F>(f: &F, guess: T) -> T
where
    T: Float,
    F: Fn(T) -> T,
{
    let close_enough = |x: T, y: T| {
        if let Some(b) = (x - y).abs().to_f64() {
            b < TOLERANCE
        } else {
            false
        }
    };
    //1.函数中定义函数的话，无法捕获环境变量，参数仍要全部传递，等于重写一遍
    //2.rust闭包实现递归较为麻烦
    //3.故直接尾递归fixed_point函数
    let next = f(guess);
    if close_enough(guess, next) {
        next
    } else {
        fixed_point(f, next)
    }
}
```
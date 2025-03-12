# 1.1.7 实例:用牛顿法求平方根
## 练习1.8
求立方根的牛顿法基于如下事实，如果y是x的立方根的一个近似值，那么下式能给出一个更好的近似值：$$\frac{x / y^2 + 2y}{3}$$请利用这个公式，实现一个类似平方根函数的求立方根的函数。
## 解答
- 代码如下：
```rust
fn main() {
    println!("{}", cbrt_iter(1.0, 1000.0));
}

fn cbrt_iter(guess: f64, x: f64) -> f64 {
    let improve = (x/(guess * guess) +2.0 * guess)/3.0;
    if is_good_enough(guess, improve) {
        guess
    } else {
        cbrt_iter(improve, x)
    }
}

fn is_good_enough(guess: f64, improve: f64) -> bool {
    (guess - improve).abs()/guess < 0.001
}
```
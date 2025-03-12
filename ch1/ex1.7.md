# 1.1.7 实例:用牛顿法求平方根
## 练习1.7
在计算很小的数的平方根时，用is_good_enough检测不是很有效。还有，在实际计算机里，算术运算总以一定的有限精度进行。这会使我们的检测不适合用于对很大的数的计算。请解释上述论断，并用例子说明对很小的和很大的数，这种检测都可能失效。实现is_good_enough的另一策略是监视猜测值在一次迭代中的变化情况，当变化的值相对于猜测值之比很小时就结束。请设计一个采用这种终止测试方式的平方根函数。对很大的和很小的数，这一策略都能工作得更好吗？

## 解答
- 对于很大的数，会因为递归深度过深而栈溢出；对于很小的数，无论是多少，受限于is_good_enough的精度(0.001)，会得出一个错误的结果(结果的平方约等于0.001)。
- 当变化的值相对于猜测值之比很小(1%)时就结束，这一策略正常工作。
- 代码如下：
```rust
fn main() {
    println!("{}", sqrt_iter(1.0, 1.9e-100));
}

fn sqrt_iter(guess: f64, x: f64) -> f64 {
    if is_good_enough(guess, x) {
        guess
    } else {
        sqrt_iter(improve(guess, x), x)
    }
}

fn is_good_enough(guess: f64, x: f64) -> bool {
    //((guess * guess) - x).abs() < 0.001
    let nextguess = (guess + (x / guess)) / 2.0;
    (guess - nextguess).abs()/guess < 0.001
}

fn improve(guess: f64, x: f64) -> f64 {
    (guess + (x / guess)) / 2.0
}
```

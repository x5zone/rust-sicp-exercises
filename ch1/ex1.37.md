# 1.3.3 函数作为通用的方法
## 练习1.37
无穷连分式是具有如下形式的表达式：
$$f = \frac{N_1}{D_1 + \frac{N_2}{D_2 + \frac{N_3}{D_3 + \cdots}}}$$
作为例子，我们可以证明当所有的$N_i$和$D_i$都等于1时，这个无穷连分式的值是1/ϕ，其中的ϕ就是黄金分割率（见1.2.2节的说明）​。逼近给定无穷连分式的一种方法是在给定数目的项之后截断，这样的截断式称为k项的有限连分式，其形式是：
$$f = \frac{N_1}{D_1 + \frac{N_2}{D_2 + \cdots + \frac{N_K}{D_K}}}$$


a.假定n和d都是只有一个参数（项的下标i）的函数，它们分别返回连分式的项$N_i$和$D_i$。请声明一个函数cont_frac，使得对cont_frac(n,_d,_k)的求值计算k项有限连分式的值。通过如下调用检查你的函数对顺序的k值是否逼近1/ϕ：
```JavaScript
cont_frac(i => 1, i=> 1, k);
```
你需要取多大的k才能保证得到的近似值具有十进制的4位精度？

b.如果你的cont_frac函数产生递归计算过程，那么请另写一个产生迭代计算的函数。如果它产生迭代计算，请另写一个函数，使之产生一个递归计算过程。

## 解答
* 需要k需要大于等于10，即可保证得到4位精度。
```rust
fn main() {
    let golden_ratio = (1.0 + 5.0_f64.sqrt()) / 2.0;
    for k in 2..=20 {
        if close_enough(
            1.0 / golden_ratio,
            cont_frac_iter(|_| 1.0_f64, |_| 1.0, k, 1),
        ) {
            println!("step : {}", k);
            break;
        }
    }
}
use num::Float;
fn cont_frac<T, F, G>(n: F, d: G, k: i32, step: i32) -> T
where
    T: Float + Display,
    F: Fn(i32) -> T,
    G: Fn(i32) -> T,
{
    if step == k {
        n(step) / d(step)
    } else {
        n(step) / (d(step) + cont_frac(n, d, k, step + 1))
    }
}
fn cont_frac_iter<T, F, G>(n: F, d: G, k: i32, mut step: i32) -> T
where
    T: Float + Display,
    F: Fn(i32) -> T,
    G: Fn(i32) -> T,
{
    step = k;
    let mut res = T::zero();
    while step > 0 {
        res = n(step) / (d(step) + res);
        step -= 1;
    }
    res
}
const TOLERANCE: f64 = 0.0001;
fn close_enough<T: Float + Display>(x: T, y: T) -> bool {
    if let Some(b) = (x - y).abs().to_f64() {
        b < TOLERANCE
    } else {
        false
    }
}
```
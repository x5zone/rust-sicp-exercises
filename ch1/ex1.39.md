# 1.3.3 函数作为通用的方法
## 练习1.39
1770年，德国数学家J.H.Lambert发表了正切函数的连分式表示：
$$\tan x = \cfrac{x}{1 - \cfrac{x^2}{3 - \cfrac{x^2}{5 - \cfrac{x^2}{\dots}}}}$$
其中x用弧度表示。请声明一个函数tan_cf(x,_k)，它基于Lambert公式计算正切函数的近似值。k描述计算的项数，就像练习1.37一样。

## 解答
* 仅给出相比1.38新增代码。
```rust
fn main() {
    for k in 2..=20 {
        let val = tan_cf(1.5_f64, k);
        if close_enough(1.5_f64.tan(), val) {
            println!("step : {}", k);
            break;
        } 
    }
}
fn tan_cf(x: f64, _k: i32) -> f64 {
    let mut n = |k| if k == 1 { x } else { x * x * (-1_f64) };
    let mut d = |k| (2 * k - 1) as f64;
    cont_frac_iter(&mut n, &mut d, _k, _k)
}
```
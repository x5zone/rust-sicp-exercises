# 1.3.3 函数作为通用的方法
## 练习1.38
1737年瑞士数学家莱昂哈·德欧拉发表了论文DeFractionibus Continuis，文中给出了e-2的一个连分式展开，其中e是自然对数的底。在这一连分式中，$N_i$全都是1，而$D_i$顺序的是1,2, 1, 1, 4, 1, 1, 6, 1, 1, 8,…。请写一个程序，其中使用你在练习1.37中做的cont_frac函数，该程序基于欧拉的展开计算e的近似值。

## 解答
```rust
fn main() {
    for k in 2..=20 {
        let val = cont_frac_iter(&mut |_| 1.0_f64, &mut generate_d(), k, 1);
        if close_enough(E, 2.0 + val) {
            println!("step : {}", k);
            break;
        }
    }
}
fn extend_seq<T: Float>(v: &mut Vec<T>, k: usize) {
    assert!(v.len() > 3);
    //if k > v.len() 无需判断，不符合条件的话for循环会为空
    for i in (v.len() - 3)..=(k + 2) {
        if close_enough(v[i + 1], T::one()) && close_enough(v[i + 2], T::one()) {
            // x 1 1 y=x+1+1
            v.push(v[i] + v[i + 1] + v[i + 2]);
        } else {
            v.push(T::one())
        }
    }
}
fn generate_d() -> impl FnMut(i32) -> f64 {
    // 1,2, 1, 1, 4, 1, 1, 6, 1, 1, 8...
    let mut v = vec![1.0, 2.0, 1.0, 1.0, 4.0];
    let d = move |k_: i32| {
        let k = k_.to_usize().unwrap();
        extend_seq(&mut v, k);
        v[k - 1]
    };
    d
}
use num::{Float, ToPrimitive};

fn cont_frac_iter<T, F, G>(n: &mut F, d: &mut G, k: i32, mut step: i32) -> T
where
    T: Float + Display,
    F: FnMut(i32) -> T,
    G: FnMut(i32) -> T,
{
    step = k;
    let mut res = T::zero();
    while step > 0 {
        res = n(step) / (d(step) + res);
        step -= 1;
    }
    res
}
const TOLERANCE: f64 = 0.00001;
fn close_enough<T: Float + Display>(x: T, y: T) -> bool {
    if let Some(b) = (x - y).abs().to_f64() {
        b < TOLERANCE
    } else {
        false
    }
}
```
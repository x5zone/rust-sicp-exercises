# 1.3.3 函数作为通用的方法
## 练习1.36
请修改fixed_point，使它能用练习1.22介绍的基本函数newline和display打印出计算中产生的近似值序列。然后，通过找x↦log(1000)/log(x)不动点的方法确定$x^x=1000$的一个根（请利用JavaScript的基本函数math_log，它计算参数的自然对数值）​。请比较一下采用均值阻尼和不用均值阻尼时的计算步数。​（注意，你不能用猜测1去启动fixed_point，因为这将导致除以log(1)=0。​）
> 逼近一个解的过程中，取用一些序列值的平均值的技术称为均值阻尼。

## 解答:
* 不使用均值阻尼时，分别用了13，33步；使用均值阻尼时，分别用了9，8步。使用均值阻尼更快逼近。
* rust代码如下，仅给出相比1.35节新增部分。
```rust
fn main() {
    println!("{}", fixed_point(&phi, 1.0, 0, true));
    println!("{}", fixed_point(&exproot(1000.0), 2.0, 0, true));
}
fn exproot(value: f64) -> impl Fn(f64) -> f64 {
    move |x| value.log2() / x.log2()
}
fn fixed_point<T, F>(f: &F, guess: T, step: i32, mean_damping: bool) -> T
where
    T: Float + Display,
    F: Fn(T) -> T,
{    
    let mut next = f(guess);
    if mean_damping {
        next = (next + guess) / T::from(2.0).unwrap();
    }
    println!("step {} guess {}->{}", step, guess, next);
```
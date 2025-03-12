# 2.1.4 扩展练习：区间算术
## 练习2.13
请证明，在误差为很小的百分值的情况下，存在一个简单公式，利用它可以从两个被乘区间的误差算出乘积的百分数误差。你可以假定所有的数为正，以简化问题。
经过相当多的工作后，AlyssaP.Hacker发布了她的最后系统。几年之后，在她已经忘记了这个系统之后，接到一个愤怒的用户 Lem E.Tweakit发疯似的电话。看来Lem注意到并联电阻的公式可以写成两个代数上等价的公式：
$$ \frac{R_1 R_2}{R_1 + R_2} $$
和$$ \frac{1}{\frac{1}{R_1} + \frac{1}{R_2}} $$
他写了两个程序，以不同的方式计算并联电阻值：
```javascript
function par1(r1,r2) {
    return div_interval(mul_interval(r1,r2),
                        add_interval(r1,r2))
}
function par2(r1,r2) {
    const one = make_interval(1,1);
    return div_interval(one,
                        add_interval(div_interval(one,r1),
                                     div_interval(one,r2)));
}
```
Lem抱怨说，Alyssa的程序对两种不同计算方法给出不同的值。这确实是很严重的问题。
## 解答
* 简单公式为: $c.percent = a.percent * b.percent$
* 本习题没有提出更多问题，仅交代背景，问题在下一习题。
* rust代码如下:
```rust
fn mul_interval_percent<T>(x: Fy<T>, y: Fy<T>) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    //你可以假定所有的数为正，以简化问题。
    assert!(lower_bound(x.clone()) > T::zero() && upper_bound(x.clone()) > T::zero(),"x must be positive");
    assert!(lower_bound(y.clone()) > T::zero() && upper_bound(y.clone()) > T::zero(),"y must be positive");
    make_center_percent(
        center(x.clone()) * center(y.clone()),
        percent(x.clone()) * percent(y.clone()),
    )
}
fn par1<T>(r1: Fy<T>, r2: Fy<T>) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    assert!(lower_bound(r1.clone()) > T::zero() && upper_bound(r1.clone()) > T::zero());
    assert!(lower_bound(r2.clone()) > T::zero() && upper_bound(r2.clone()) > T::zero());
    div_interval(
        mul_interval(r1.clone(), r2.clone()),
        add_interval(r1.clone(), r2.clone()),
    )
}
fn par2<T>(r1: Fy<T>, r2: Fy<T>) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    assert!(lower_bound(r1.clone()) > T::zero() && upper_bound(r1.clone()) > T::zero());
    assert!(lower_bound(r2.clone()) > T::zero() && upper_bound(r2.clone()) > T::zero());
    let one = make_interval(T::one(), T::one());

    div_interval(
        one.clone(),
        add_interval(
            div_interval(one.clone(), r1.clone()),
            div_interval(one.clone(), r2.clone()),
        ),
    )
}
```
# 2.1.4 扩展练习：区间算术
## 练习2.16
请给出一个一般性的解释：为什么等价的代数表达式可能导致不同计算结果？你能设计出一个区间算术包，使之没有这种缺陷吗？或者这件事情根本不可能做到？​（警告：这个问题非常难。​）

## 解答
* 一般性解释:由于区间运算的特性（特别是误差的累积和放大），代数等价的表达式可能会生成不同的区间结果。习题2.15就展示了这个现象。
* 可以改善区间算术包，但不可能没有这种缺陷。
    * 改善的思路: 像习题2.15一样，合理的重排序区间运算的顺序。
    * 非常难，那我就不做这道题了，哈。
* 附上习题2.7~习题2.16的完整代码如下:
```rust
use std::{any::TypeId, rc::Rc};

use num::Num;
type Fx<T> = Rc<dyn Fn(T, T) -> T>;
type Fy<T> = Rc<dyn Fn(Fx<T>) -> T>;
fn pair<T>(x: T, y: T) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    Rc::new(move |m| m(x, y))
}

fn head<T>(z: Fy<T>) -> T {
    z(Rc::new(move |p, _q| p))
}

fn tail<T>(z: Fy<T>) -> T {
    z(Rc::new(move |_p, q| q))
}
fn make_interval<T>(a: T, b: T) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    pair(a, b)
}
fn make_center_width<T>(c: T, w: T) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    make_interval(c - w, c + w)
}
fn center<T>(i: Fy<T>) -> T
where
    T: Copy + Num + PartialOrd + 'static,
{
    (lower_bound(i.clone()) + upper_bound(i.clone())) / (T::one() + T::one())
}
fn width<T>(i: Fy<T>) -> T
where
    T: Copy + Num + PartialOrd + 'static,
{
    (upper_bound(i.clone()) - lower_bound(i.clone())) / (T::one() + T::one())
}
fn make_center_percent<T>(c: T, p: T) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    assert!(
        (TypeId::of::<T>() == TypeId::of::<f32>() || TypeId::of::<T>() == TypeId::of::<f64>()),
        "percent only works with floating-point types!"
    );

    make_interval(c - c * p, c + c * p)
}
fn percent<T>(i: Fy<T>) -> T
where
    T: Copy + Num + PartialOrd + 'static,
{
    assert!(
        (TypeId::of::<T>() == TypeId::of::<f32>() || TypeId::of::<T>() == TypeId::of::<f64>()),
        "percent only works with floating-point types!"
    );

    width(i.clone()) / center(i.clone())
}
fn upper_bound<T>(interval: Fy<T>) -> T {
    tail(interval)
}
fn lower_bound<T>(interval: Fy<T>) -> T {
    head(interval)
}
fn add_interval<T>(x: Fy<T>, y: Fy<T>) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    make_interval(
        lower_bound(x.clone()) + lower_bound(y.clone()),
        upper_bound(x.clone()) + upper_bound(y.clone()),
    )
}
fn sub_interval<T>(x: Fy<T>, y: Fy<T>) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    make_interval(
        lower_bound(x.clone()) - upper_bound(y.clone()),
        upper_bound(x.clone()) - lower_bound(y.clone()),
    )
}
fn mul_interval<T>(x: Fy<T>, y: Fy<T>) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    let p1 = lower_bound(x.clone()) * lower_bound(y.clone());
    let p2 = lower_bound(x.clone()) * upper_bound(y.clone());
    let p3 = upper_bound(x.clone()) * lower_bound(y.clone());
    let p4 = upper_bound(x.clone()) * upper_bound(y.clone());
    let maxf = |x, y| if x > y { x } else { y };
    let minf = |x, y| if x < y { x } else { y };
    make_interval(
        minf(minf(minf(p1, p2), p3), p4),
        maxf(maxf(maxf(p1, p2), p3), p4),
    )
}
fn mul_interval_percent<T>(x: Fy<T>, y: Fy<T>) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    //你可以假定所有的数为正，以简化问题。
    assert!(lower_bound(x.clone()) > T::zero() && upper_bound(x.clone()) > T::zero());
    assert!(lower_bound(y.clone()) > T::zero() && upper_bound(y.clone()) > T::zero());
    make_center_percent(
        center(x.clone()) * center(y.clone()),
        percent(x.clone()) * percent(y.clone()),
    )
}
fn div_interval<T>(x: Fy<T>, y: Fy<T>) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    assert!(!(lower_bound(y.clone()) < T::zero() && upper_bound(y.clone()) > T::zero()));
    assert!(lower_bound(y.clone()) != T::zero());
    assert!(upper_bound(y.clone()) != T::zero());
    mul_interval(
        x.clone(),
        make_interval(
            T::one() / upper_bound(y.clone()),
            T::one() / lower_bound(y.clone()),
        ),
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
fn main() {
    let a = make_center_percent(2.0, 0.0001);
    let b = make_center_percent(2.0, 0.0001);
    let print_helper = |result: Fy<f64>| {
        println!(
            "result center:{:.3} percent:{:.5} ",
            center(result.clone()),
            percent(result.clone())
        )
    };
}
```
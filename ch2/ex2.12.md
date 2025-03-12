# 2.1.4 扩展练习：区间算术
## 练习2.12
请声明一个构造函数make_center_percent，它以一个中心点和一个百分比为参数，产生所需的区间。你还需要声明一个选择函数percent，通过它可以得到给定区间的百分数误差，选择函数center与前面一样。

## 解答
* rust代码如下:
```rust
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
```
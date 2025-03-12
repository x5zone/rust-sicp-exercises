# 2.1.4 扩展练习：区间算术
## 练习2.9
区间的宽度是其上界和下界之差的一半。区间宽度是有关区间描述的值的非精确性的一种度量。对某些算术运算，两个区间的组合结果的宽度是参数区间宽度的函数，而对其他运算，组合区间的宽度不是参数区间宽度的函数。请证明，两个区间的和（与差）的宽度是被加（或减）区间的宽度的函数。举例说明，对乘法和除法，情况并非如此。

## 解答
* 线性函数怎么叠加都是线性函数，所以一定存在：两个区间的和（与差）的宽度是被加（或减）区间的宽度的函数。更复杂的运算，只要其中没有引入非线性，就仍是线性的。
* 乘法和除法之所以不是，是因为min和max这两个函数引入的非线性。
* 证明略(手动推导也算简单，感兴趣的还可以看看sigmoid激活函数对神经网络引入的非线性的重要性的论述)。
* rust代码如下(非完整代码，更多代码参见习题2.7，习题2.8，ps:需要给前述代码补上几个PartialEq trait即可):
    * 如代码所示，宽度完全一致的几个区间，相乘后，得到的宽度并不一致。
```rust
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
fn div_interval<T>(x: Fy<T>, y: Fy<T>) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    mul_interval(
        x.clone(),
        make_interval(
            T::one() / upper_bound(y.clone()),
            T::one() / lower_bound(y.clone()),
        ),
    )
}
fn main() {
   // 定义四个宽度相同的区间 a, b, c, d
   let a = make_interval(1.0, 3.0); // 区间 a: [1.0, 3.0]
   let b = make_interval(4.0, 6.0); // 区间 b: [4.0, 6.0]
   let c = make_interval(-1.0, 1.0); // 区间 c: [-1.0, 1.0]
   let d = make_interval(0.0, 2.0); // 区间 d: [0.0, 2.0]

   // 计算 a * b 和 c * d
   let mul_a_b = mul_interval(a.clone(), b.clone());
   let mul_c_d = mul_interval(c.clone(), d.clone());

   // 打印结果
   println!(
       "Multiplication of a and b: [{}, {}]",
       lower_bound(mul_a_b.clone()),
       upper_bound(mul_a_b.clone())
   );
   println!(
       "Multiplication of c and d: [{}, {}]",
       lower_bound(mul_c_d.clone()),
       upper_bound(mul_c_d.clone())
   );

   // 计算宽度
   let width = |interval: Fy<f64>| upper_bound(interval.clone()) - lower_bound(interval.clone());
   let width_a_b = width(mul_a_b.clone());
   let width_c_d = width(mul_c_d.clone());

   println!("Width of a * b: {}", width_a_b);
   println!("Width of c * d: {}", width_c_d);

   // 验证非线性
   if (width_a_b - width_c_d).abs() > 1e-6 {
       println!("Nonlinearity detected: widths are not equal!");
   } else {
       println!("No nonlinearity detected: widths are equal.");
   }
}
```


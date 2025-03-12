# 2.1.4 扩展练习：区间算术
## 练习2.10
Ben Bitdiddle是一个专业程序员，他看了Alyssa工作后评论说，除以一个横跨0的区间的意义不清楚。请修改Alyssa的代码，检查这种情况并在发现时报错。
```javascript
function div_interval(x, y) {
    return mul_interval(x,
                         make_interval(1 / upper_bound(y),
                                       1 / lower_bound(y)));
}
```

# 解答
* 假设区间为$[-1,1]$，依代码所示，会构造如下一个新的区间$[1,-1]$，而该区间显然是一个错误的区间，其下界大于上界！
    * 另当分母可能为0时，假设值落在0附近，除以0就得到了无穷大。所以其实本质上包含0的区间的倒数实际是 两个不相连的区间（如 $(−∞,−a]∪[b,+∞)$）
* rust代码如下(相比习题2.9，增加了几个断言):
```rust
fn div_interval<T>(x: Fy<T>, y: Fy<T>) -> Fy<T>
where
    T: Copy + Num + PartialOrd + 'static,
{
    assert!(!(lower_bound(y.clone())<T::zero()&&upper_bound(y.clone())>T::zero()));
    assert!(lower_bound(y.clone())!=T::zero());
    assert!(upper_bound(y.clone())!=T::zero());
    mul_interval(
        x.clone(),
        make_interval(
            T::one() / upper_bound(y.clone()),
            T::one() / lower_bound(y.clone()),
        ),
    )
}
```
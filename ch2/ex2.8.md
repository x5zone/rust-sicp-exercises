# 2.1.4 扩展练习：区间算术
## 练习2.8
请通过类似于Alyssa的推理，说明应该怎样计算两个区间的差。请声明相应的减法函数sub_interval。
```javascript
function add_interval(x, y) {
    return make_interval(lower_bound(x) + lower_bound(y),
                         upper_bound(x) + upper_bound(y))
}
```

## 解答
* > Alyssa先写了一个做区间加法的函数，她推断说，和的最小值应该是两个区间的下界之和，其最大值应该是两个区间的上界之和
* 推理过程如下:
    * 设区间x为(a,b)，区间y为(c,d)
    * 若y区间极限小，且基本约等于c，那么区间减法显而易见：(a-c,b-c)
    * 若y区间极限小，且基本约等于d，那么区间减法显而易见：(a-d,b-d)
    * x-y区间的lower_bound应为min(a-c,a-d),即a-d
    * x-y区间的upper_bound应为max(b-c,b-d),即b-c
* 先给出一个js版本的解答:
```javascript
function sub_interval(x, y) {
    return make_interval(lower_bound(x) - upper_bound(y),
                         upper_bound(x) - lower_bound(y))
}
```
* rust版本的代码如下(剩余部分代码参见习题2.7):
```rust
fn add_interval<T>(x: Fy<T>, y: Fy<T>) -> Fy<T>
where
    T: Copy + Num + 'static,
{
    make_interval(
        lower_bound(x.clone()) + lower_bound(y.clone()),
        upper_bound(x.clone()) + upper_bound(y.clone()),
    )
}
fn sub_interval<T>(x: Fy<T>, y: Fy<T>) -> Fy<T>
where
    T: Copy + Num + 'static,
{
    make_interval(
        lower_bound(x.clone()) - upper_bound(y.clone()),
        upper_bound(x.clone()) - lower_bound(y.clone()),
    )
}
```
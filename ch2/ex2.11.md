# 2.1.4 扩展练习：区间算术
## 练习2.11
在看了这些东西之后，Ben又说出了下面这段有些神秘的话：​“通过监测区间的端点，有可能把mul_interval分解为9种情况，其中只有一种情况需要做两次乘法”​。请根据Ben的建议重写这个函数。
排除了自己程序里的错误后，Alyssa给一个潜在用户演示自己的程序。但那个用户却说她的程序解决的问题根本不对。他希望能有一个程序，可用于处理那种用一个中间值和一个附加误差的形式表示的数，也就是说，希望程序能处理3.5±0.15而不是[3.35,3.65]​。Alyssa回到自己的办公桌解决了这个问题。她另外提供了一套构造函数和选择函数：
```javascript
function make_center_width(c, w) {
    return make_interval(c - w, c + w);
}
function center(i) {
    return (lower_bound(i) + upper_bound(i)) / 2;
}
function width(i) {
    return (upper_bound(i) - lower_bound(i)) / 2;
}
```
不幸的是，Alyssa的大多数用户是工程师，现实中的工程师经常遇到只有很小的非精确性的测量值，而且常以区间宽度对区间中点的比值作为度量值。工程师常采用基于部件参数的百分数误差描述部件，就像前面说的电阻值的描述方式。

## 解答
* >​“通过监测区间的端点，有可能把mul_interval分解为9种情况，其中只有一种情况需要做两次乘法”​。请根据Ben的建议重写这个函数。
    * 这无非是根据区间的正负号去划分情况。例如当两个区间均在正区间的话，就只需要做两次乘法，而无需求min，max。但是，划分这9种情况能让代码复杂冗长，难以阅读也难以维护，所以这个实在没有必要写了。
* 新的rust版本的构造函数和选择函数如下:
```rust
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
```
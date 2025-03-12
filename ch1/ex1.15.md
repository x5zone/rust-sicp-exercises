# 1.2.3 增长的阶
## 练习1.15
当角度（用弧度描述）x足够小的时候，其正弦值可以用$\sin x≈x$计算，而三角恒等式
$
\sin x = 3 \sin \frac{x}{3} - 4 \sin^3 \frac{x}{3}
$可以减小sin的参数的大小（为完成这一练习，如果一个角不大于0.1弧度，我们就认为它“足够小”​）​。这些想法都体现在下面的函数里：
```javascript
function cube(x) {
    return x * x * x;
}
function p(x) {
    return 3 * x - 4 * cube(x);
}
function sine(angle) {
    return !(abs(angle) > 0.1) ? angle : p(sine(angle / 3))
}    
```
a. 在求值sine(12.15)时p将被调用多少次？
b. 在求值sine(a)时，由函数sine产生的计算过程使用的空间和步数（作为a的函数）增长的阶是什么？

## 解答
- a. $12.15/3.0/3.0/3.0/3.0/3.0 < 0.1$，调用了5次。
- b. 空间增长阶为$O(\log{a})$，步数增长阶为$O(\log{a})$。
    - 每次都除以3，所以是对数阶。
```rust
fn p(x: f64) -> f64 {
    3.0 * x - 4.0 * x * x * x
}
fn sine(angle: f64) -> f64 {
    if angle.abs() <= 0.1 {
        angle
    } else {
        p(sine(angle / 3.0))
    }
}
```    
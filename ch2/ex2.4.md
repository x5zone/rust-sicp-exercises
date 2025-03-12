# 2.1.3 数据是什么意思？
## 练习2.4
下面是序对的另一种函数式表示。请针对这种表示方式，验证对任意的x和y，head(pair(x,y))都将产生x。
```javascript
function pair(x,y) {
    return m => m(x,y);
}
function head(z) {
    return z((p,q)=>p);
}
```
对应的tail应该如何定义？​（提示：在验证这一表示确实能行时，可以利用1.1.5节介绍的代换模型。​）

## 解答:
* js的代码如下:
```javascript
function tail(z) {
    return z((p,q)=>q);
}
```
* rust的代码如下(刚开始我没明白pair的返回类型是什么，通过rust的代码写一遍这个返回类型就清晰了，Pair的类型 Fn(Fn)->T):
```rust
fn pair<T, U>(x: T, y: U) -> impl Fn(&dyn Fn(T, U) -> T) -> T
where
    T: Copy,
    U: Copy,
{
    move |m| m(x, y)
}

fn head<T, U>(z: impl Fn(&dyn Fn(T, U) -> T) -> T) -> T {
    z(&|p, _q| p)
}

fn tail<T, U>(z: impl Fn(&dyn Fn(T, U) -> U) -> U) -> U {
    z(&|_p, q| q)
}
```
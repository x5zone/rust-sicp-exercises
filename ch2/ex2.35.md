# 2.2.3 序列作为约定的接口
## 练习2.35
请把2.2.2节的count_leaves重新声明为一个累积：
```javascript
function count_leaves(t) {
    return accumulate(<??>, <??>, map(<??>, <??>));
}
```
参考
```javascript
function count_leaves(x) {
    return is_null(x)
        ? 0
        : !is_pair(x)
        ? 1
        : count_leaves(head(x)) + count_leaves(tail(x));
}
function accumulate(op, initial, sequence) {
    return is_null(sequence)
        ? initial
        : op(head(sequence),
             accumulate(op, initial, tail(sequence)));
}
```

## 解答
* 对比参考代码中的count_leaves和accumulate，可以肯定的是，填空中一定要体现**is_pair**函数，否则我们根本无从得知当前节点是否是一个叶子。
* accumulate(op,initial,sequence)，initial毫无疑问就是0。接下来需要思考的问题是: 在哪里判断节点是否为叶子？
* 另一个需要注意的问题是:map和accumulate代码都只是遍历一维列表，而非遍历树形结构的，无论我们在op中做什么，都没办法改变accumulate遍历一维列表的逻辑。题目中其实已经提示我们了，sequence参数中的**map**。
* 综上，op仍是计数逻辑，无外乎x+y或者1+y。而map中填空需要完成的工作有两个:1.判断是否为叶子; 2.递归调用count_leaves。
* 由于count_leaves函数的返回值为叶子个数，所以op也可以确定，应为x+y，x即为子树的叶子个数。
* 填空如下：
```javascript
function count_leaves(x) {
    return accumulate((x, y) => x + y, 0, map(y => is_pair(y)? count_leaves(y) : 1 , x));
}
```
* 可参考的习题有: 练习2.28，练习2.31
* rust代码如下:
```rust
//依赖代码见习题2.17和习题2.33
fn count_leaves<T: Clone + Debug + Num>(t: &List<T>) -> List<T> {
    t.map(|y| match y {
        List::V(_) => List::V(T::one()),
        List::Cons(_, _) => count_leaves(y),
        List::Nil => List::V(T::zero()),
    })
    .accumulate(
        |x: &List<T>, y: List<T>| List::V(x.value() + y.value()),
        List::V(T::zero()),
    )
}
fn main() {
    use List::*;
    let l = List::from_slice(&[
        V(1),
        List::from_slice(&[V(2), List::from_slice(&[V(3), V(4)]), V(5)]),
        List::from_slice(&[V(6), V(7)]),
    ]);
    println!("count_leaves: {}", count_leaves(&l));
}
// Output
// 7
```
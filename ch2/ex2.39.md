# 2.2.3 序列作为约定的接口
## 练习2.39
请基于练习2.38的fold_right和fold_left完成下面两个有关函数reverse（练习2.18）的声明：
```javascript
function reverse(sequence) {
    return fold_right(<??>, null, sequence);
}
function reverse(sequence) {
    return fold_left(<??>, null, sequence);
}
```

## 解答
* fold_left：从左到右分组，$((a⋅b)⋅c)⋅d$。
* fold_right：从右到左分组，$a⋅(b⋅(c⋅d))$。
* 填空如下:
```javascript
function reverse(sequence) {
    return fold_right(（x, y）=> append(y, x), null, sequence);
}
function reverse(sequence) {
    return fold_left((x, y) => pair(x, y), null, sequence);
}
```
* rust代码如下:
```rust
//依赖代码见习题2.17&习题2.38
fn reverse_fr<T: Clone + Debug>(t: &List<T>) -> List<T> {
    t.accumulate(
        |current, result| result.append(&List::from_slice(&[(*current).clone()])),
        List::Nil,
    )
}
fn reverse_fl<T: Clone + Debug>(t: &List<T>) -> List<T> {
    t.fold_left(
        |result, current| List::pair((*current).clone(), result),
        List::Nil,
    )
}
fn main() {
    use List::*;
    let l = List::from_slice(&[V(1), V(2), V(3), V(4), V(5), V(6), V(7)]);
    println!("{}", l);
    println!("{}", reverse_fl(&l));
    println!("{}", reverse_fr(&l));
}
// Output
//(1, (2, (3, (4, (5, (6, (7, Nil)))))))
//(7, (6, (5, (4, (3, (2, (1, Nil)))))))
//(7, (6, (5, (4, (3, (2, (1, Nil)))))))
```

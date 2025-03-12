# 2.2.1 序列的表示
## 练习2.21
函数square_list以一个数值表为参数，返回每个数的平方构成的表：
```javascript
square_list(list(1,2,3,4));
[1, [4, [9, [16, null]]]]
```
下面是square_list的两个不同声明，请填充其中空缺的表达式以完成它们：
```javascript
function square_list(items) {
    return is_null(items)
        ? null
        : pair(<??>, <??>);
}
function square_list(items) {
    return map(<??>, <??>);
}
```
背景代码:
```javascript
function map(fun, items) {
    return is_null(items)
       ? null
        : pair(fun(head(items)),
               map(fun, tail(items)));
}
```

## 解答
* 填空如下:
```javascript
function square_list(items) {
    return is_null(items)
        ? null
        : pair(head(items)*head(items), square(tail(items)));
}
function square_list(items) {
    return map(x => x * x, items);
}
```
* rust版本的代码如下:
```rust
// 其余代码参见习题2.17
impl<T> List<T>
where
    T: Clone + Debug,
{
    fn map<U, F>(&self, fun: F) -> List<U>
    where
        U: Clone + Debug,
        F: Fn(&List<T>) -> List<U>,
    {
        match self {
            List::Nil => List::Nil,
            List::Cons(value, next) => List::pair(fun(value), next.map(fun)),
            List::V(_) => fun(self),
        }
    }
}
fn square_list<T: Clone + Debug + Num>(items: &List<T>) -> List<T> {
    items.map(|x| List::V(x.value() * x.value()))
}
fn main() {
    use List::{Cons, Nil, V};
    println!(
        "{}",
        square_list(&List::from_slice(&[V(1), V(2), V(3), V(4)]))
    );
}
//output: (1, (4, (9, (16, Nil))))
```

# 2.2.1 序列的表示
## 练习2.23
函数for_each与map类似，它也以一个函数和一个元素表为参数，但是它并不返回结果的表，只是把这个函数从左到右逐个应用于表中元素，并且把函数应用返回的值都丢掉。for_each通常用于那些执行某些动作的函数，如打印等。请看下面的例子：
```javascript
for_each(x => display(x), list(57, 321, 88));
57
321
88
```
调用函数for_each的返回值（上面没有显示）可以是任何东西，例如逻辑值真。请给出一个for_each的实现。

## 解答
* 和练习2.21中map的实现基本是一致的，代码如下:
```rust
// 其余代码参见习题2.17
impl<T> List<T>
where
    T: Clone + Debug,
{
    fn for_each<F>(&self, fun: F) -> ()
    where
        F: Fn(&List<T>) -> (),
    {
        match self {
            List::Nil => (),
            List::Cons(value, next) => {
                fun(value);
                next.for_each(fun)
            }
            List::V(_) => fun(self),
        };
    }
}
fn main() {
    use List::{Cons, Nil, V};

    List::from_slice(&[V(1), V(2), V(3), V(4)]).for_each(|x| println!("{}", x));
}
// Output:
// 1
// 2
// 3
// 4
```
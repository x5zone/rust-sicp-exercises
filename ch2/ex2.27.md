# 2.2.2 层次结构
## 练习2.27
请修改你在练习2.18做的reverse函数，做一个deep_reverse函数。它以一个表为参数，返回另一个表作为值。结果表中的元素反转，所有的子树也反转。例如：
```javascript
const x = list(list(1,2),list(3,4))

x;
list(list(1,2),list(3,4))

reverse(x);
list(list(3,4),list(1,2))

deep_reverse(x);
list(list(3,4),list(2,1))
```
补充:
```javascript
function reverse(items) {
    function reverse_iter(items, result) {
        return is_null(items)
            ? result
            : reverse_iter(tail(items), pair(head(items),result))
    }
    return reverse_iter(items, null)
}
```

## 解答
* python代码&输出如下:
```python
def reverse(items):
    def reverse_iter(items,result):
        if items is None or len(items) == 0:
            return result
        else:
            return reverse_iter(tail(items),pair(head(items),result))
    return reverse_iter(items,None)
def deep_reverse(items):
    def deep_reverse_iter(items,result):
        if items is None or len(items) == 0:
            return result
        else:
            head_value = head(items)
            if isinstance(head_value,tuple):
                head_value = deep_reverse(head_value)
            return deep_reverse_iter(tail(items),pair(head_value,result))
    return deep_reverse_iter(items,None)
print(x)
print(reverse(x))
print(deep_reverse(x))
#Output
#x:
#((1, (2, None)), ((3, (4, None)), None))
#reverse(x):
#((3, (4, None)), ((1, (2, None)), None))
#deep_reverse(x):
#((4, (3, None)), ((2, (1, None)), None))
```
* rust版本的代码如下(输出与python版本一致):
```rust
// 其余代码参见习题2.17
impl<T> List<T>
where
    T: Clone + Debug,
{
    fn reverse_with<F: Fn(&List<T>) -> List<T>>(&self, fun: F) -> Self {
        fn reverse_with_iter<T: Clone + Debug, F>(l: &List<T>, result: List<T>, fun: F) -> List<T>
        where
            F: Fn(&List<T>) -> List<T>,
        {
            match l {
                List::Nil => result,
                List::Cons(value, _) => {
                    let value = fun(value);
                    reverse_with_iter(l.tail(), List::pair(value, result), fun)
                }
                List::V(_) => panic!("reverse_with_iter only accept list, not value"),
            }
        }
        reverse_with_iter(self, List::Nil, fun)
    }
    fn reverse(&self) -> Self {
        self.reverse_with(|x| (*x).clone())
    }
    fn deep_reverse(&self) -> Self {
        self.reverse_with(|x| match (*x).clone() {
            List::Cons(_, _) => x.deep_reverse(),
            List::V(t) => List::V(t),
            List::Nil => List::Nil,
        })
    }
}
fn main() {
    use List::{Cons, Nil, V};
    let l = List::from_slice(&[
        List::from_slice(&[V(1), V(2)]),
        List::from_slice(&[V(3), V(4)]),
    ]);
    println!("{}", l);
    println!("{}", l.reverse());
    println!("{}", l.deep_reverse());
}
```

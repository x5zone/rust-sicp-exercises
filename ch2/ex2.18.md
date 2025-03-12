# 2.2.1 序列的表示
## 练习2.18
请声明一个函数reverse，它以一个表为参数，返回的表包含的元素与参数表一样，但它们排列的顺序与参数表相反：
```javascript
reverse(list(1,4,9,16,25));
list(25,16,9,4,1)
```

## 解答
* js的代码如下(关键点就是在递归到整个list结束时，返回整个新的list，所以要通过参数来传递):
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
* rust代码如下(其余代码参见习题2.17)：
```rust
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
}
fn main() {
    use List::{Cons, Nil, V};
    println!(
        "{}",
        List::reverse(&List::from_slice(&[V(1), V(4), V(9), V(16), V(25)]))
    );
}
// Output:
// (25, (16, (9, (4, (1, Nil)))))
```

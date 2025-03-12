# 2.2.2 层次结构
## 练习2.28
请写一个函数fringe，它以一个树（表示为一个表）为参数，返回一个表，该表里的元素就是这棵树的所有树叶，按从左到右的顺序排列。例如：
```javascript
const x = list(list(1, 2)), list(3, 4));

fringe(x);
list(1, 2, 3, 4)

fringe(list(x, x));
list(1, 2, 3, 4, 1, 2, 3, 4)
```

## 解答
* python版本的代码如下:
```python
def append(list1, list2):
    if list1 is None or len(list1) == 0:
        return list2
    else:
        return pair(head(list1), append(tail(list1),list2))
def fringe(items):
    if items is None:
        return None
    elif not(isinstance(items,tuple)):
        return pair(items,None)
    else:
        return append(fringe(head(items)),fringe(tail(items)))
x = list(list(1,2),list(3,4))
print(fringe(x))
print(fringe(list(x,x)))
#Output
#(1, (2, (3, (4, None))))
#(1, (2, (3, (4, (1, (2, (3, (4, None))))))))
```
* rust版本的代码如下(输出与python一致):
```rust
//依赖代码见习题2.17
fn fringe<T: Clone + Debug>(items: &List<T>) -> List<T> {
    match items {
        List::Nil => List::Nil,
        List::Cons(left, right) => fringe(left).append(&fringe(right)),
        _ => List::pair((*items).clone(), List::Nil),
    }
}
fn main() {
    use List::{Cons, Nil, V};
    let x = List::from_slice(&[
        List::from_slice(&[V(1), V(2)]),
        List::from_slice(&[V(3), V(4)]),
    ]);
    println!("{}", fringe(&x));
    println!("{}", fringe(&List::from_slice(&[x.clone(), x.clone()])));
}
```

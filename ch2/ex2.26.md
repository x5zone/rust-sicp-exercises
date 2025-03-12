# 2.2.2 层次结构
## 练习2.26
假设x和y定义为如下的两个表：
```javascript
const x = list(1, 2, 3);
const y = list(4, 5, 6);
```
解释器对下面各个表达式将打印出什么结果？
```javascript
append(x, y)
pair(x, y)
list(x, y)
```

补充
```javascript
function append(list1, list2) {
    return is_null(list1)
        ? list2
        : pair(head(list1), append(tail(list1), list2));
}
```
## 解答
* python代码及输出如下:
```python
def pair(a, b):
    return (a,b)
def head(l):
    return l[0]
def tail(l):
    return l[1]
def list(*args):
    if len(args) == 0:
        return None
    else:
        return pair(args[0],list(*args[1:]))
def append(list1, list2):
    if list1 is None or len(list1) == 0:
        return list2
    else:
        return pair(head(list1), append(tail(list1),list2))
x = list(1,2,3)
y = list(4,5,6)
print(append(x,y))
print(pair(x,y))
print(list(x,y))
#Output
#(1, (2, (3, (4, (5, (6, None))))))
#((1, (2, (3, None))), (4, (5, (6, None))))
#((1, (2, (3, None))), ((4, (5, (6, None))), None))
```
* rust代码如下:
```rust
// 其余代码参见习题2.17
impl<T> List<T>
where
    T: Clone + Debug,
{
    fn append(&self, other: &Self) -> Self {
        match self {
            List::Nil => (*other).clone(),
            List::Cons(value, next) => Self::pair((**value).clone(), next.append(other)),
            List::V(_) => {
                eprintln!("self is a value, not a list, convert it to list");
                Self::pair((*self).clone(), Self::Nil).append(other)
            }
        }
    }
}
fn main() {
    use List::{Cons, Nil, V};
    let x = List::from_slice(&[V(1), V(2), V(3)]);
    let y = List::from_slice(&[V(4), V(5), V(6)]);
    println!("{}", x.append(&y));
    println!("{}", List::pair(x.clone(), y.clone()));
    println!("{}", List::from_slice(&[x.clone(), y.clone()]));
}
// Output
// (1, (2, (3, (4, (5, (6, Nil)))))) 
// ((1, (2, (3, Nil))), (4, (5, (6, Nil))))
// ((1, (2, (3, Nil))), ((4, (5, (6, Nil))), Nil))
```
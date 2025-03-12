# 2.2.1 序列的表示
## 练习2.17
请声明一个函数last_pair，对给定的（非空）表，它返回只包含表中最后一个元素的表：
```javascript
last_pair(list(23,72,149,34));
list(34)
```
一些可能相关的背景代码:
```javascript
function list_ref(items, n) {
    return n === 0
        ? head(items)
        : list_ref(tail(items), n-1);
}
function length(items) {
    return is_null(items)
        ? 0
        : 1 + length(tail(items));
}
function append(list1, list2) {
    return is_null(list1)
        ? list2
        : pair(head(list1),append(tail(list1),list2));
}
const squares = list(1, 4, 9, 16, 25)
list_ref(squares, 3)
16
```

## 解答
* 先给出一个js版本的答案:
```javascript
function last_pair(items) {
    //题目已假设表非空
    return is_null(tail(items))
        ? head(items)
        : last_pair(tail(items))
}
```
* 接下来给出rust版本的代码(使用enum构建了一个链表):
    * V(T)是为了将T类型转换成List<T>类型，从而V(T)和List<T>均可以塞入链表中。
```rust
#[derive(Debug, Clone)]
enum List<T> {
    Cons(Box<List<T>>, Box<List<T>>),
    V(T), // Value T as List<T> type
    Nil,
}
impl<T> fmt::Display for List<T>
where
    T: Clone + Display,
{
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            List::Cons(v, next) => {
                write!(f, "({}, {})", v, next)
            }
            List::V(t) => write!(f, "{}", t),
            List::Nil => write!(f, "Nil"),
        }
    }
}
impl<T> List<T>
where
    T: Clone + Debug,
{
    fn pair(a: List<T>, b: List<T>) -> List<T> {
        List::Cons(Box::new(a), Box::new(b))
    }
    fn head(&self) -> &Self {
        match self {
            List::Cons(current, _) => &current,
            List::Nil => &List::Nil,
            List::V(_) => {
                //panic!("only list can call head"),
                eprintln!("only list can call head");
                self
            }
        }
    }
    fn tail(&self) -> &Self {
        match self {
            List::Cons(_, next) => next,
            List::Nil => &List::Nil,
            List::V(_) => {
                //panic!("only list can call tail"),
                eprintln!("only list can call tail");
                self
            }
        }
    }
    fn value(&self) -> T {
        match self {
            List::V(v) => (*v).clone(),
            List::Nil => panic!("only value can call List::value, but it's a Nil"),
            List::Cons(_, _) => panic!("only value can call List::value, but it's a list"),
        }
    }
    // 传入List<T>类型,以确保既可以传入[V(1),V(2)],也可以传入[List1,List2]
    fn from_slice(items: &[List<T>]) -> Self
    where
        T: Clone,
    {
        if items.len() == 0 {
            List::Nil
        } else {
            Self::pair(items[0].clone(), Self::from_slice(&items[1..]))
        }
    }
    // 传入Iterator<Item = List<T>>类型,以确保既可以传入[V(1),V(2)],也可以传入[List1,List2]
    fn from_iterator<I: Iterator<Item = List<T>>>(items: &mut I) -> Self {
        match items.next() {
            Some(v) => List::pair(v.clone(), List::from_iterator(items)),
            None => List::Nil,
        }
    }
}

fn last_pair<T: Clone + Debug>(l: &List<T>) -> List<T> {
    match l.tail() {
        List::Nil => l.clone(),
        // v是tail(l)的next，所以此处需要注意不能直接递归v，否则相当于两步next了
        List::Cons(_, v) => last_pair(l.tail()),
        _ => panic!("last_pair only accept list, not value"),
    }
}
fn main() {
    //let list = pair(23, pair(72, pair(149, pair(34, List::Nil))));
    use List::{Cons, Nil, V};
    println!(
        "{}",
        last_pair(&List::from_slice(&[V(23), V(72), V(149), V(34)]))
    );
}
// Output:
// (34, Nil)
```
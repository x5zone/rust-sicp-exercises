# 2.2.2 层次结构
## 练习2.32
我们可以用元素互不相同的表来表示集合，因此一个集合的所有子集可以表示为一个表的表。比如说，假定集合为list(1,2,3)，其所有子集的集合就是
```javascript
list(null, list(3), list(2), list(2,3), 
    list(1), list(1,3), list(1,2), 
    list(1,2,3))
```
请完成下面的函数声明，该函数生成一个集合的所有子集的集合。请解释它为什么能完成这项工作。
```javascript
function subsets(s) {
    if (is_null(s))
        return list(null);
    else {
        const rest = subsets(tail(s));
        return append(rest, map(<??>, rest));
    }
}
```

## 解答
* 填空如下:
```javascript
function subsets(s) {
    if (is_null(s))
        return list(null);
    else {
        const rest = subsets(tail(s));
        return append(rest, map(y => list(head(s), y), rest));
    }
}
```
* 由归纳法可证，设当前递归执行到数组的第n个元素并已返回:
    * 设i=n，j=n+1，则head(s)为j，tail(s)为i。
    * 设subsets已返回前n个元素的所有子集，为rest。
    * pair(j,every subset in rest)得到包含j的所有子集。ps: j与null的并集即为只包含j的集合。
    * rest(不包含j的所有子集) + pair(j, every subset in rest)，得到前n+1个元素的所有子集。
    * 以上，归纳得证。 

* rust代码如下:
```rust
//依赖代码见习题2.17
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
fn subsets<T>(s: &List<T>) -> List<T>
where
    T: Clone + Debug + Num,
{
    match s {
        List::Nil => List::from_slice(&[List::Nil]),
        _ => {
            let rest = subsets(s.tail());
            rest.append(&rest.map(|x| {
                List::from_slice(&[(*s.head()).clone(), (*x).clone()])
            }))
        }
    }
}
//测试代码
fn main() {
    use List::{Cons, Nil, V};
    let mut current = subsets(&List::from_slice(&[V(1),V(2),V(3)]));
    print!("{{");
    let mut first = true;
    while let List::Cons(next_head, next_tail) = current {
        if first {
            print!("[{}]", next_head);
            first = false;
        } else {
            print!(", [{}]", next_head);
        }

        current = *next_tail;
    }
    println!("}}");
}
//输出(fmt稍作修改,去除了对nil的打印)
//{[], [3, ], [2, ], [2, 3, ], [1, ], [1, 3, ], [1, 2, ], [1, 2, 3, ]}
```
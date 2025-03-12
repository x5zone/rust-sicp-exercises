# 2.2.2 层次结构
## 练习2.25
请给出能从下面各个表里取出7的head和tail组合：
```javascript
list(1, 3, list(5, 7), 9)

list(list(7))

list(1, list(2, list(3, list(4, list(5, list(6, 7))))))
```

## 解答
* python代码&解答如下:
```python
# pair&list定义参见练习2.20
a = list(1, 3, list(5, 7), 9)
b = list(list(7))
c = list(1, list(2, list(3, list(4, list(5, list(6, 7))))))
print(a, head(tail(head(tail(tail(a))))))
print(b, head(head(b)))
# 以list(5,list(6,7))为例:
# list(5,子表)->pair(5,递归处理子表)->pair(5,pair(子表,None))->故每个list调用都需要一对 head(tail())
print(c, head(tail(head(tail(head(tail(head(tail(head(tail(head(tail(c)))))))))))))
# output
# (1, (3, ((5, (7, None)), (9, None)))) 7
# ((7, None), None) 7
# (1, ((2, ((3, ((4, ((5, ((6, (7, None)), None)), None)), None)), None)), None)) 7
```
* russt代码如下:
```rust
// 其余代码参见习题2.17
fn main() {
    use List::{Cons, Nil, V};
    //list(1, 3, list(5, 7), 9)
    //list(list(7))
    //list(1, list(2, list(3, list(4, list(5, list(6, 7))))))
    let l1 = List::from_slice(&[V(1), V(3), List::from_slice(&[V(5), V(7)]), V(9)]);
    let l2 = List::from_slice(&[List::from_slice(&[V(7)])]);
    let l3 = List::from_slice(&[
        V(1),
        List::from_slice(&[
            V(2),
            List::from_slice(&[
                V(3),
                List::from_slice(&[
                    V(4),
                    List::from_slice(&[V(5), List::from_slice(&[V(6), V(7)])]),
                ]),
            ]),
        ]),
    ]);
    println!("{}", l1.tail().tail().head().tail().head());
    println!("{}", l2.head().head());
    println!(
        "{}",
        l3.tail()
            .head()
            .tail()
            .head()
            .tail()
            .head()
            .tail()
            .head()
            .tail()
            .head()
            .tail()
            .head()
    );
}
```
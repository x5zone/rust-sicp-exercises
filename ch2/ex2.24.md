# 2.2.2 层次结构
## 练习2.24
假定我们需要求值表达式list（1, list(2, list(3, 4))）​，请给出解释器打印的结果，画出对应的盒子指针结构，并把它解释为一棵树（参看图2.6）​。

## 解答
* 用于求值的的python代码如下:
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
```
* 输出为:
    ```
    (1, ((2, ((3, (4, None)), None)), None))
    ```
* 盒子结构为:
    ```
    -----   -----
    |1|.|-> |.|/|
    -----   -----
             |
            -----    -----
            |2|.| -> |.|/| 
            -----    -----
                      |
                     -----   -----
                     |3|.|-> |4|/|  
                     -----   -----
    ```
* 由盒子结构立可得树形结构(保持和输出一致的左右子树关系，pair_or_tree(left,right))。
    ```
        .
       / \
      1   .
         / \
        .   None    
       / \
      2   .
         / \
        .   None  
       / \
      3   .
         / \
        4   None 
    ```
* rust代码如下:
```rust
// 其余代码参见习题2.17
fn main() {
    use List::{Cons, Nil, V};
    //list（1, list(2, list(3, 4))）
    let l = List::from_slice(&[
        V(1),
        List::from_slice(&[V(2), List::from_slice(&[V(3), V(4)])]),
    ]);
    println!("{}", l);
}
// Output:
// (1, ((2, ((3, (4, Nil)), Nil)), Nil))
```


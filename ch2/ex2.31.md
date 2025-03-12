# 2.2.2 层次结构
## 练习2.31
请把你对练习2.30的解答进一步抽象为一个函数tree_map，使它能支持我们采用下面的形式声明square_tree：
```javascript
function square_tree(tree) {
    return tree_map(square, tree)
}
```

## 解答
* 参考练习2.30，js代码如下:
```javascript
function tree_map(fun, tree) {
    return map(subtree => is_pair(subtree)
                           ? tree_map(subtree)
                           : fun(subtree),
               tree);
```
* rust代码如下:
```rust
//依赖代码见习题2.17
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
    fn tree_map<U, F>(&self, fun: F) -> List<U>
    where
        U: Clone + Debug,
        F: Fn(&List<T>) -> List<U> + Clone,
    {
        self.map(|x| match x {
            List::Cons(_, _) => x.tree_map(fun.clone()),
            List::V(_) => fun(x),
            List::Nil => List::Nil,
        })
    }
}
//测试代码如下:
fn main() {
    use List::{Cons, Nil, V};
    let l = List::from_slice(&[
        V(1),
        List::from_slice(&[V(2), List::from_slice(&[V(3), V(4)]), V(5)]),
        List::from_slice(&[V(6), V(7)]),
    ]);
    println!(
        "{}",
        l.tree_map(|tree| match tree {
            List::V(t) => List::V((*t).clone() * (*t).clone()),
            _ => panic!("only value can reach here"),
        })
    );
}
// Output
// (1, ((4, ((9, (16, Nil)), (25, Nil))), ((36, (49, Nil)), Nil)))
```
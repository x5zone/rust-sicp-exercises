# 2.2.2 层次结构
## 练习2.30
请声明一个函数square_tree，它与练习2.21中的函数square_list类似，也就是说，它应该具有下面的行为：
```javascript
square_tree(
    list(1,
        list(2, list(3, 4), 5),
        list(6, 7)));
list(1,
    list(4, list(9, 16), 25),
    list(36, 49))
```
请以两种方式声明square_tree，直接做（也就是说不用高阶函数）​，以及用map和递归。

背景参考:
```javascript
function scale_tree(tree, factor) {
    return is_null(tree)
        ? null
        : !is_pair(tree)
         ? tree * factor
         : pair(scale_tree(head(tree), factor),
                scale_tree(tail(tree), factor));    
}
scale_tree(list(1,
                list(2, list(3, 4), 5),
                list(6, 7)),
           10);
list(10,
     list(20, list(30, 40), 50),
     list(60, 70))
function scale_tree(tree, factor) {
    return map(subtree => is_pair(subtree)
                           ? scale_tree(subtree, factor)
                           : subtree * factor,
               tree);
}
```

## 解答
* 结合上面的scale_tree，js代码如下:
```javascript
function square_tree(tree) {
    return is_null(tree)
        ? null
        : !is_pair(tree)
         ? tree * tree
         : pair(square_tree(head(tree)),
                square_tree(tail(tree)));    
}
function square_tree(tree) {
    return map(subtree => is_pair(subtree)
                           ? square_tree(subtree)
                           : subtree * subtree,
               tree);
}
```
* rust版本的代码如下:
```rust
//依赖代码见习题2.17&习题2.21
fn square_tree<T>(tree: &List<T>) -> List<T>
where
    T: Clone + Debug + Num + Display,
{
    match tree {
        List::Nil => List::Nil,
        List::V(t) => List::V((*t).clone() * (*t).clone()),
        List::Cons(left, right) => List::pair(square_tree(left), square_tree(right)),
    }
}
fn map_square_tree<T>(tree: &List<T>) -> List<T>
where
    T: Clone + Debug + Num + Display,
{
    tree.map(|tree| match tree {
        List::V(t) => List::V((*t).clone() * (*t).clone()),
        _ => map_square_tree(&tree),
    })
}
//测试代码如下:
fn main() {
    use List::{Cons, Nil, V};
    let l = List::from_slice(&[
        V(1),
        List::from_slice(&[V(2), List::from_slice(&[V(3), V(4)]), V(5)]),
        List::from_slice(&[V(6), V(7)]),
    ]);
    println!("{}", l);
    println!("{}", square_tree(&l));
    println!("{}", map_square_tree(&l));
}
// Output:
// (1, ((2, ((3, (4, Nil)), (5, Nil))), ((6, (7, Nil)), Nil))) 
// (1, ((4, ((9, (16, Nil)), (25, Nil))), ((36, (49, Nil)), Nil)))
// (1, ((4, ((9, (16, Nil)), (25, Nil))), ((36, (49, Nil)), Nil)))
```
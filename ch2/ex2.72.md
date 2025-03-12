# 2.3.4 实例：Huffman编码树
## 练习2.72
考虑你在练习2.68中设计的编码函数。编码一个符号，计算步数的增长速度如何？这里必须计入遇到每个结点时检查符号表所需的步数。一般性地回答这个问题非常困难。考虑一类特殊情况，其中n个符号的相对频度如练习2.71所述。请给出编码最频繁符号所需的步数和编码最不频繁符号所需的步数的增长速度（作为n的函数）​。

参考代码
```rust
fn encode_symbol(symbol: &List, tree: &List) -> List {
    if is_leaf(tree) {
        return List::Nil;
    }
    let left_symbols = symbols(left_branch(tree));
    let right_symbols = symbols(right_branch(tree));
    if is_element_of_set(symbol, &left_symbols) {
        List::pair(v![0], encode_symbol(symbol, left_branch(tree)))
    } else if is_element_of_set(symbol, &right_symbols) {
        List::pair(v![1], encode_symbol(symbol, right_branch(tree)))
    } else {
        panic!("invalid symbol {}", symbol)
    }
}
```
## 解答
* 以习题2.71中的相对频度: 检查最频繁符号,是否在左右子树中的符号表中,第一次即命中.最坏情况下检查了所有的符号,所以复杂度为$O(n)$.
* 检查最不频繁的符号,会一直迭代到这颗倾斜的Huffman树的最深层才命中叶子节点的符号表,迭代过程检查步数依次为:$n,n-1,n-2,...,2,1$.所以最坏情况下,最不频繁符号的复杂度为$O(n^2)$.
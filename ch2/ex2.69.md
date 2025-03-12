# 2.3.4 实例：Huffman编码树
## 练习2.69
下面的函数以一个符号-频度对偶的表为参数（其中任何符号都不会出现在多于一个对偶中）​，并根据Huffman算法生成出Huffman编码树。
```javascript
function generate_huffman_tree(pairs) {
    return successive_merge(make_leaf_set(pairs));
}
```
make_leaf_set是前面定义的函数，它把对偶表变换为叶的有序集合，successive_merge是需要你写的函数，它用make_code_tree反复归并集合中权重最小的两个元素，直至集合里只剩下一个元素为止。这个元素就是我们需要的Huffman树。​（这一函数稍微有点技巧性，但并不复杂。如果你发现自己设计了一个很复杂的函数，那么几乎可以肯定是在什么地方搞错了。你应该尽可能地利用有序的集合表示这一事实。​）

## 解答
* rust代码&输出如下:
```rust
// 其余依赖代码见习题2.53&习题2.67&习题2.68
fn successive_merge(leaf_list: &List) -> List {
    if leaf_list.tail().is_empty() {
        // only one leaf, it is the final huffman tree
        return leaf_list.head().clone();
    }
    let (first_leaf, second_leaf) = (leaf_list.head(), leaf_list.tail().head());

    let code_tree = make_code_tree(first_leaf, second_leaf);

    successive_merge(&adjoin_set_huffman(&code_tree, leaf_list.tail().tail()))
}
fn generate_huffman_tree(pairs: &List) -> List {
    successive_merge(&make_leaf_set(pairs))
}
fn main() {
    let sample_pairs = list![
        v!["A".to_string(), 4],
        v!["B".to_string(), 2],
        v!["D".to_string(), 1],
        v!["C".to_string(), 1],
    ];
    let sample_tree = generate_huffman_tree(&sample_pairs);
    println!("{}", sample_tree);

    let message = v![
        "A".to_string(),
        "D".to_string(),
        "A".to_string(),
        "B".to_string(),
        "B".to_string(),
        "C".to_string(),
        "A".to_string()
    ];
    println!("{}", encode(&message, &sample_tree));
    println!("{}", decode(&encode(&message, &sample_tree), &sample_tree));
}
// Output:
// (code_tree, ((leaf, (A, (4, Nil))), ((code_tree, ((leaf, (B, (2, Nil))), ((code_tree, ((leaf, (C, (1, Nil))), ((leaf, (D, (1, Nil))), ((C, (D, Nil)), (2, Nil))))), ((B, (C, (D, Nil))), (4, Nil))))), ((A, (B, (C, (D, Nil)))), (8, Nil)))))
// (0, (1, (1, (1, (0, (1, (0, (1, (0, (1, (1, (0, (0, Nil)))))))))))))
// (A, (D, (A, (B, (B, (C, (A, Nil)))))))
```
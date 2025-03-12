# 2.3.4 实例：Huffman编码树
## 练习2.68
函数encode以一个消息和一棵树为参数，生成被编码消息对应的二进制位的表：
```javascript
function encode(message, tree) {
    return is_null(message)
           ? null
           : append(encode_symbol(head(message), tree),
                    encode(tail(message), tree));
}
```
其中的函数encode_symbol需要你写，它根据给定的树产生给定符号的二进制位表。如果遇到未出现在树中的符号，你设计的encode_symbol应该报告错误。用你在练习2.67中得到的结果检查你的函数，工作中使用同样的树，看看得到的结果是不是原来的消息。

## 解答
* rust代码&输出如下:
```rust
// 其余依赖代码见习题2.53&习题2.67
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
fn encode(message: &List, tree: &List) -> List {
    if message.is_empty() {
        List::Nil
    } else {
        encode_symbol(message.head(), tree).append(&encode(message.tail(), tree))
    }
}
fn main() {
    let sample_tree = make_code_tree(
        &make_leaf("A".to_string(), 4),
        &make_code_tree(
            &make_leaf("B".to_string(), 2),
            &make_code_tree(
                &make_leaf("D".to_string(), 1),
                &make_leaf("C".to_string(), 1),
            ),
        ),
    );
    // because of type, &str != String, but they may be equal
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
}
// Output:
// (0, (1, (1, (0, (0, (1, (0, (1, (0, (1, (1, (1, (0, Nil)))))))))))))
fn is_eq_element(item: &Box<dyn ListV>, v_any: &Box<dyn ListV>) -> bool {
    item.as_ref() == v_any.as_ref()
}
fn is_element_of_set(item: &List, x: &List) -> bool {
    match x {
        List::Nil => false,
        List::Cons(current, next) => {
            if let List::V(c) = current.as_ref() {
                if is_eq_element(&item.get_value(), &c) {
                    return true;
                }
            }
            is_element_of_set(item, next)
        }
        List::V(v) => {
            //panic!("is_element_of_set only accept list, not value");
            eprintln!("is_element_of_set only accept list, not value");
            if is_eq_element(&item.get_value(), &v) {
                return true;
            } else {
                return false;
            }
        }
    }
}
```
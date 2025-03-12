# 2.3.4 实例：Huffman编码树
## 练习2.67
声明了下面的编码树和样例消息：
```javascript
const sample_tree = make_code_tree(make_leaf("A", 4),
                                   make_code_tree(make_leaf("B", 2),
                                                  make_code_tree(
                                                      make_leaf("D", 1),
                                                      make_leaf("C", 1))));
const sample_message = list(0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0);
```
请用函数decode完成该消息的编码，并给出编码的结果。

参考代码:
```javascript
function make_leaf(symbol, weight) {
    return list("leaf", symbol, weight);
}
function is_leaf(object) {
    return head(object) === "leaf";
}
function symbol_leaf(x) { return head(tail(x)); }

function weight_leaf(x) { return head(tail(tail(x))); }

function make_code_tree(left, right) {
    return list("code_tree", left, right,
                append(symbols(left), symbols(right)),
                weight(left) + weight(right));
}
function left_branch(tree) { return head(tail(tree)); }

function right_branch(tree) { return head(tail(tail(tree))); }

function symbols(tree) {
    return is_leaf(tree)
           ? list(symbol_leaf(tree))
           : head(tail(tail(tail(tree))));
}
function weight(tree) {
    return is_leaf(tree)
           ? weight_leaf(tree)
           : head(tail(tail(tail(tail(tree)))));
}
function decode(bits, tree) {
    function decode_1(bits, current_branch) {
        if (is_null(bits)) {
            return null;
        } else {
            const next_branch = choose_branch(head(bits),
                                              current_branch);
            return is_leaf(next_branch)
                   ? pair(symbol_leaf(next_branch),
                          decode_1(tail(bits), tree))
                   : decode_1(tail(bits), next_branch);
        }
    }
    return decode_1(bits, tree);
}

function choose_branch(bit, branch) {
    return bit === 0
           ? left_branch(branch)
           : bit === 1
           ? right_branch(branch)
           : error(bit, "bad bit -- choose_branch");
}
function adjoin_set(x, set) {
    return is_null(set)
           ? list(x)
           : weight(x) < weight(head(set))
           ? pair(x, set)
           : pair(head(set), adjoin_set(x, tail(set)));
}
function make_leaf_set(pairs) {
    if (is_null(pairs)) {
        return null;
    } else {
        const first_pair = head(pairs);
        return adjoin_set(
                   make_leaf(head(first_pair),        // symbol
                             head(tail(first_pair))), // frequency
                   make_leaf_set(tail(pairs)));
    }
}
```

## 解答
* rust代码&输出如下:
```rust
// 其余依赖代码见习题2.53
fn main() {
    let sample_tree = make_code_tree(
        &make_leaf("A".to_string(), 4),
        &make_code_tree(
            &make_leaf("B".to_string(), 2),
            &make_code_tree(&make_leaf("D".to_string(), 1), &make_leaf("C".to_string(), 1)),
        ),
    );
    let sample_message = v![0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0];
    println!("{}", decode(&sample_message, &sample_tree));
}
// Output:
// (A, (D, (A, (B, (B, (C, (A, Nil)))))))
fn left_branch(tree: &List) -> &List {
    return tree.tail().head();
}
fn right_branch(tree: &List) -> &List {
    return tree.tail().tail().head();
}
fn make_leaf(symbol: String, weight: i32) -> List {
    v!["leaf", symbol, weight]
}
fn is_leaf(object: &List) -> bool {
    object.head().get_value() == v!["leaf"].get_value()
}
fn symbol_leaf(x: &List) -> String {
    x.tail()
        .head()
        .value_as::<String>()
        .expect("symbol_leaf must be string")
        .clone()
}
fn weight_leaf(x: &List) -> i32 {
    x.tail()
        .tail()
        .head()
        .value_as::<i32>()
        .expect("weight_leaf must be i32")
        .clone()
}
fn symbols(tree: &List) -> List {
    if is_leaf(tree) {
        list![v![symbol_leaf(tree)]]
    } else {
        tree.tail().tail().tail().head().clone()
    }
}
fn weight(tree: &List) -> i32 {
    if is_leaf(tree) {
        weight_leaf(tree)
    } else {
        tree.tail()
            .tail()
            .tail()
            .tail()
            .head()
            .value_as::<i32>()
            .expect("weight must be i32")
            .clone()
    }
}
fn make_code_tree(left: &List, right: &List) -> List {
    list![
        v!["code_tree"],
        left.clone(),
        right.clone(),
        symbols(left).append(&symbols(right)),
        v![weight(left) + weight(right)]
    ]
}
fn choose_branch<'a>(bit: &List, branch: &'a List) -> &'a List {
    let bit_value = bit.value_as::<i32>().expect("bit must be i32").clone();
    if bit_value == 0 {
        return left_branch(branch);
    } else if bit_value == 1 {
        return right_branch(branch);
    } else {
        panic!("bit must be 0 or 1")
    }
}
fn decode(bits: &List, tree: &List) -> List {
    fn decode_1(bits: &List, current_branch: &List, tree: &List) -> List {
        if bits.is_empty() {
            return List::Nil;
        } else {
            let next_branch = choose_branch(bits.head(), current_branch);
            if is_leaf(next_branch) {
                return List::pair(
                    v![symbol_leaf(next_branch)],
                    decode_1(bits.tail(), tree, tree),
                );
            } else {
                return decode_1(bits.tail(), next_branch, tree);
            }
        }
    }
    decode_1(bits, tree, tree)
}
fn adjoin_set_huffman(x: &List, set: &List) -> List {
    if set.is_empty() {
        return list![x.clone()];
    } else {
        if weight(x) < weight(set.head()) {
            return List::pair(x.clone(), set.clone());
        } else {
            return List::pair(set.head().clone(), adjoin_set_huffman(x, set.tail()));
        }
    }
}
fn make_leaf_set(pairs: &List) -> List {
    if pairs.is_empty() {
        return List::Nil;
    } else {
        let first_pair = pairs.head();
        return adjoin_set_huffman(
            &make_leaf(
                first_pair
                    .head()
                    .value_as::<String>()
                    .expect("symbol must be a string")
                    .clone(), // symbol
                first_pair
                    .tail()
                    .head()
                    .value_as::<i32>()
                    .expect("weight must be a i32")
                    .clone(), // weight
            ),
            &make_leaf_set(pairs.tail()),
        );
    }
}
```
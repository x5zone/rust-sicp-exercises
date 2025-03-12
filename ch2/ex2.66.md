# 2.3.3 实例：集合的表示
## 练习2.66
假设用二叉树结构实现记录的集合，其中的记录按作为键值的数值排序。请实现相应的lookup函数。
```javascript
function lookup(given_key, set_of_records) {
    return is_null(set_of_records)
           ? false
           : equal(given_key, key(head(set_of_records)))
           ? head(set_of_records)
           : lookup(given_key, tail(set_of_records));
}
```
## 解答
* rust代码&输出如下:
```rust
// 其余依赖代码见习题2.53&习题2.63&习题2.64&习题2.65
fn key(record: &List) -> i32 {
    record.head().value_as::<i32>().unwrap().clone()
}
fn make_record(key: i32, name: &str, age: i32) -> List {
    v![key, name.to_string(), age]
}
fn lookup(give_key: i32, set_of_records: &List) -> Option<List> {
    if set_of_records.is_empty() {
        return None;
    } else {
        let key = key(entry(set_of_records));
        if key == give_key {
            return Some(entry(set_of_records).clone());
        } else if key < give_key {
            return lookup(give_key, right_branch(set_of_records));
        } else {
            return lookup(give_key, left_branch(set_of_records));
        }
    }
}
fn main() {
    let elts = list![
        v![1, "a", 2],
        v![3, "b", 4],
        v![5, "c", 6],
        v![7, "d", 8]
    ];
    let records = list_to_tree(&elts);
    print_tree(&records);
    println!("{:?}", lookup(3, &records));
    println!("{:?}", lookup(9, &records));
}
// Output:
// (3, (b, (4, Nil)))
// (1, (a, (2, Nil))) (5, (c, (6, Nil)))
// . . . (7, (d, (8, Nil)))
// Some(Cons(V(3), Cons(V("b"), Cons(V(4), Nil))))
// None
```
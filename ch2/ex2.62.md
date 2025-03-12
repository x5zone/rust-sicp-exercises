# 2.3.3 实例：集合的表示
## 练习2.62
请给出在集合的排序表示上union_set的一个Θ(n)实现。

## 解答
* rust代码&输出如下：
```rust
// 其余依赖代码见习题2.53
fn union_set_ord(x: &List, y: &List) -> Box<List> {
    if x.is_empty() {
        Box::new(y.clone())
    } else if y.is_empty() {
        Box::new(x.clone())
    } else if x.head().get_value() == y.head().get_value() {
        Box::new(List::pair(
            x.head().clone(),
            union_set_ord(x.tail(), y.tail()).as_ref().clone(),
        ))
    } else if x.head().get_value() < y.head().get_value() {
        Box::new(List::pair(
            x.head().clone(),
            union_set_ord(x.tail(), y).as_ref().clone(),
        ))
    } else {
        // x.head() > y.head()
        Box::new(List::pair(
            y.head().clone(),
            union_set_ord(x, y.tail()).as_ref().clone(),
        ))
    }
}
// 测试用例
fn main() {
    let empty = List::Nil;
    let set1 = v![1, 3, 5]; // 当前v!宏的设计有些含混,传递单个参数时会生成List::V,传递多个参数时会生成List,后续待修改
    let set2 = v![2, 4, 6];
    let set3 = v![1, 3, 5, 7];
    let set4 = v![5, 6, 7, 8];
    let set5 = v![1, 3, 5];

    println!(
        "union({}, {}) = {}",
        empty,
        empty,
        union_set_ord(&empty, &empty)
    );

    println!(
        "union({}, {}) = {}",
        empty,
        set1,
        union_set_ord(&empty, &set1)
    );
    println!(
        "union({}, {}) = {}",
        set1,
        empty,
        union_set_ord(&set1, &empty)
    );

    println!(
        "union({}, {}) = {}",
        set1,
        set2,
        union_set_ord(&set1, &set2)
    );

    println!(
        "union({}, {}) = {}",
        set3,
        set4,
        union_set_ord(&set3, &set4)
    );

    println!(
        "union({}, {}) = {}",
        set1,
        set5,
        union_set_ord(&set1, &set5)
    );

    println!(
        "union({}, {}) = {}",
        set1,
        set3,
        union_set_ord(&set1, &set3)
    );
}
// Output:
// union(Nil, Nil) = Nil
// union(Nil, (1, (3, (5, Nil)))) = (1, (3, (5, Nil)))
// union((1, (3, (5, Nil))), Nil) = (1, (3, (5, Nil)))
// union((1, (3, (5, Nil))), (2, (4, (6, Nil)))) = (1, (2, (3, (4, (5, (6, Nil))))))
// union((1, (3, (5, (7, Nil)))), (5, (6, (7, (8, Nil))))) = (1, (3, (5, (6, (7, (8, Nil))))))
// union((1, (3, (5, Nil))), (1, (3, (5, Nil)))) = (1, (3, (5, Nil)))
// union((1, (3, (5, Nil))), (1, (3, (5, (7, Nil))))) = (1, (3, (5, (7, Nil))))
```
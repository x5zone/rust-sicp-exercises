# 2.3.3 实例：集合的表示
## 练习2.61
请给出排序表示时adjoin_set的实现。通过类似is_element_of_set的方法，说明如何利用排序的优势得到一个函数，其所需平均步数可能是未排序表示时的一半。
```javascript
function is_element_of_set(x, set) {
    return is_null(set)
           ? false
           : x === head(set)
           ? true
           : x < head(set)
           ? false
           : // x > head(set)
           is_element_of_set(x, tail(set)); 
}
function intersection_set(set1, set2) {
    if (is_null(set1) || is_null(set2)) {
        return null;
    } else {
        const x1 = head(set1);
        const x2 = head(set2);
        return x1 === x2
            ? pair(x1, intersection_set(tail(set1), tail(set2)))  
            : x1 < x2
            ? intersection_set(tail(set1), set2)
            : // x2 < x1 
            intersection_set(set1, tail(set2));
    }
}
```

## 解答
* rust代码&输出如下：
```rust
// 其余依赖代码见习题2.53
impl PartialEq for dyn ListV {
    fn eq(&self, other: &Self) -> bool {
        // 我知道这样比较字符串有点蠢.尝试了Reflect,bevy_reflect要求整个类型树都支持反射，这太严格了
        // 在不穷举类型的前提下,不知道还有没有简洁的最小化改动的方法,可以比较这两个泛型值是否相等?如果有,请教教孩子
        self.type_id() == other.type_id() && self.fmt_as_string() == other.fmt_as_string()
        // self.as_any().downcast_ref::<String>() == other.as_any().downcast_ref::<String>()
        // || self.as_any().downcast_ref::<i32>() == other.as_any().downcast_ref::<i32>()
        // || self.as_any().downcast_ref::<f64>() == other.as_any().downcast_ref::<f64>()
    }
}
// 后续会通过列举类型来实现PartialOrd,当前只支持字符串比较以进行模拟
impl PartialOrd for dyn ListV {
    fn partial_cmp(&self, other: &Self) -> Option<std::cmp::Ordering> {
        if self.type_id() == other.type_id() {
            // 类似PartialEq,字符串比较
            return self.fmt_as_string().partial_cmp(&other.fmt_as_string());
        }
        None
    }
}
fn addjoin_set_ord(item: &List, set: &List) -> Box<List> {
    if set.is_empty() {
        Box::new(List::pair(item.clone(), List::Nil))
    } else if item.get_value() == set.head().get_value() {
        Box::new(set.clone())
    } else if item.get_value() < set.head().get_value() {
        // addjoin(4,[1,3,5,7]) -> pair[4,[5,7].clone()]
        Box::new(List::pair(item.clone(), set.clone()))
    } else {
        // item > set.head()
        // addjoin(4,[1,3,5,7]) -> pair[3,addjoin(4,[5,7])]
        Box::new(List::pair(
            set.head().clone(),
            *addjoin_set_ord(item, set.tail()),
        ))
    }
}
fn main() {
    let l1 = List::Nil;
    let l2 = list![v![5]];
    let l3 = v![2, 4];
    let l4 = v![1, 3, 7, 9];
    println!("l1: {} addjoin_ord {}", l1, addjoin_set_ord(&v![1], &l1));
    println!("l2: {} addjoin_ord {}", l2, addjoin_set_ord(&v![1], &l2));
    println!("l2: {} addjoin_ord {}", l2, addjoin_set_ord(&v![6], &l2));
    println!("l3: {} addjoin_ord {}", l3, addjoin_set_ord(&v![1], &l3));
    println!("l3: {} addjoin_ord {}", l3, addjoin_set_ord(&v![3], &l3));
    println!("l3: {} addjoin_ord {}", l3, addjoin_set_ord(&v![5], &l3));
    println!("l4: {} addjoin_ord {}", l4, addjoin_set_ord(&v![1], &l4));
    println!("l4: {} addjoin_ord {}", l4, addjoin_set_ord(&v![4], &l4));
}
// Output
// l1: Nil addjoin_ord (1, Nil)
// l2: (5, Nil) addjoin_ord (1, (5, Nil))
// l2: (5, Nil) addjoin_ord (5, (6, Nil))
// l3: (2, (4, Nil)) addjoin_ord (1, (2, (4, Nil)))
// l3: (2, (4, Nil)) addjoin_ord (2, (3, (4, Nil)))
// l3: (2, (4, Nil)) addjoin_ord (2, (4, (5, Nil)))
// l4: (1, (3, (7, (9, Nil)))) addjoin_ord (1, (3, (7, (9, Nil))))
// l4: (1, (3, (7, (9, Nil)))) addjoin_ord (1, (3, (4, (7, (9, Nil)))))
```
* 与is_element_of_set道理几乎一致,可能会在检索的开始处就停止,最坏的情况下需要遍历整个集合,平均而言可以期望需要检查集合的一半元素.
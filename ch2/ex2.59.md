# 2.3.3 实例：集合的表示
## 练习2.59
请为用不排序的表表示的集合实现union_set操作。

参考代码:
```javascript
function is_element_of_set(x, set) {
    return is_null(set)
           ? false
           : equal(x, head(set))
           ? true
           : is_element_of_set(x, tail(set));
}
function addjoin_set(x, set) {
    return is_element_of_set(x, set)
          ? set
           : pair(x, set);
}
function intersection_set(set1, set2) {
    return is_null(set1) || is_null(set2)
         ? null
           : is_element_of_set(head(set1), set2)
          ? pair(head(set1), intersection_set(tail(set1), set2))
           : intersection_set(tail(set1), set2);
}
```

## 解答
* rust代码&输出如下:
```rust
// 依赖代码见习题2.53
impl PartialEq for dyn ListV {
    fn eq(&self, other: &Self) -> bool {
        // 我知道这样比较字符串有点蠢.尝试了Reflect,bevy_reflect要求整个类型树都支持反射，这太严格了
        // 在不穷举类型的前提下,不知道还有没有简洁的最小化改动的方法,可以比较这两个泛型值是否相等?如果有,请教教孩子
        // 泪奔,回头我发到网上,等待好心的大佬们解答
        self.type_id() == other.type_id() && self.fmt_as_string() == other.fmt_as_string()
        // self.as_any().downcast_ref::<String>() == other.as_any().downcast_ref::<String>()
        // || self.as_any().downcast_ref::<i32>() == other.as_any().downcast_ref::<i32>()
        // || self.as_any().downcast_ref::<f64>() == other.as_any().downcast_ref::<f64>()
    }
}
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
fn addjoin_set(item: &List, set: &List) -> Box<List> {
    if is_element_of_set(item, set) {
        Box::new(set.clone())
    } else {
        Box::new(List::pair(List::value(item.clone()), set.clone()))
    }
}
// 当前实现的List数据结构依赖Box,而按照sicp的递归的格式写以下代码会造成多次冗余拷贝,后续会更改List为Rc,避免多次拷贝
fn intersection_set(x: &List, y: &List) -> Box<List> {
    if x.is_empty() || y.is_empty() {
        Box::new(List::Nil)
    } else if is_element_of_set(x.head(), y) {
        Box::new(List::pair(
            x.head().clone(),
            intersection_set(x.tail(), y).as_ref().clone(),
        ))
    } else {
        Box::new(intersection_set(x.tail(), y).as_ref().clone())
    }
}
fn union_set(x: &List, y: &List) -> Box<List> {
    if x.is_empty() {
        Box::new(y.clone())
    } else if y.is_empty() {
        Box::new(x.clone())
    } else  {
        addjoin_set(x.head(), &union_set(x.tail(), y))
    } 
}
// 测试用例
fn main() {
    let l1 = v![1, 2, "3"];
    let l2 = v![3, 2, "3"];
    println!(
        "l1: {}, addjoin_set: {}",
        l1,
        addjoin_set(&v![4], &l1)
    );
    println!(
        "l1: {},l2: {}, intersection: {}",
        l1,
        l2,
        intersection_set(&l1, &l2)
    );
    println!("l1: {},l2: {}, union: {}", l1, l2, union_set(&l1, &l2));
}
// Output
// l1: (1, (2, (3, Nil))), addjoin_set: (4, (1, (2, (3, Nil))))
// l1: (1, (2, (3, Nil))),l2: (3, (2, (3, Nil))), intersection: (2, (3, Nil))
// l1: (1, (2, (3, Nil))),l2: (3, (2, (3, Nil))), union: (1, (3, (2, (3, Nil))))
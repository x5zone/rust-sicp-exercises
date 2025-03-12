# 2.3.1 字符串
## 练习2.54
两个表equal，如果它们包含同样元素，而且这些元素按同样顺序排列。例如：
```javascript
equal(list("this","is","a","list"),list("this","is","a","list"))
```
是真，而
```javascript
equal(list("this","is","a","list"),list("this",list("is","a"),"list"))
```
是假。说得更准确些，我们可以从数和串的基本等词=\==出发，以递归的方式定义equal：a和b是equal的，如果它们都是数或者都是串，而且它们满足===；或者它们都是序对，而且head(a)与head(b)是equal的，tail(a)和tail(b)也是equal的。请利用这一思想，把equal实现为一个函数。

## 解答
* rust代码&输出如下：
```rust
// 其余依赖代码见习题2.53
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
// 后续已挪入List模块中
fn equals(x: &List, y: &List) -> bool {
    match (x, y) {
        (List::Nil, List::Nil) => true,
        (List::Cons(x1, x2), List::Cons(y1, y2)) => equals(x1, y1) && equals(x2, y2),
        (List::V(x1), List::V(y1)) => x1.as_ref() == y1.as_ref(),
        _ => false,
    }
}
fn main() {
    println!(
        "{}",
        v!["this", "is", "a", "list"].equals(&v!["this", "is", "a", "list"])
    );

    println!(
        "{}",
        v!["this", "is", "a", "list"].equals(&list![v!["this"], v!["is", "a"], v!["list"]])
    );
}
// Output
// true
// false
```
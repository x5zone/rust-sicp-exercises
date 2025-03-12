# 2.3.1 字符串
## 练习2.53
对下面各表达式求值的结果是什么？请分别用盒子记法和表记法说明。
```javascript
list("a", "b", "c")
list(list("george"))
tail(list(list("x1","x2"),list("y1","y2")))
tail(head（list(list("x1","x2"),list("y1","y2")))
member("red",list("blue","shoes","yellow","socks"))
member("red",list("red","shoes","yellow","socks"))
```

## 解答
* rust代码&输出如下:
```rust
fn member<T: PartialEq + Any + Display>(item: T, x: &List) -> &List {
    let is_eq = |v_any: &Box<dyn ListV>| {
        let v = v_any.as_ref().as_any().downcast_ref::<T>();
        if let Some(v) = v {
            *v == item
        } else {
            false
        }
    };

    match x {
        List::Nil => &List::Nil,
        List::Cons(current, next) => {
            if let List::V(c) = current.as_ref() {
                if is_eq(&c) {
                    return x;
                }
            }
            member(item, next)
        }
        List::V(v) => {
            //panic!("member only accept list, not value");
            eprintln!("member only accept list, not value");
            if is_eq(v) {
                return x;
            } else {
                &List::Nil
            }
        }
    }
}
fn main() {
    //v!宏用于将单个值转换为Value类型,或者将多个值转换为List类型
    //list!宏用于将多个list转换为List类型
    //v!宏和list!宏都可以接受单个值或者多个值作为参数
    //较难以一个宏完成类似于sicp中的宏一样的功能,尝试单个宏时,因为rust模板匹配解析,总会存在将list包裹在Value类型中的情况,所以这里使用两个宏
    println!("{}", v!["a", "b", "c"]);
    println!("{}", list![list![v!["george"]]]);
    println!("{}", list![v!["x1", "x2"], v!["y1", "y2"]].tail());
    println!("{}", list![v!["x1", "x2"], v!["y1", "y2"]].head().tail());
    println!("{}", member("red", &v!["blue", "shoes", "yellow", "socks"]));
    println!("{}", member("red", &v!["red", "shoes", "yellow", "socks"]));
}
// Output
// (a, (b, (c, Nil)))
// ((george, Nil), Nil)
// ((y1, (y2, Nil)), Nil)
// (x2, Nil)
// Nil
// (red, (shoes, (yellow, (socks, Nil))))
```
* 依赖代码如下:
```rust
#![allow(dead_code)]

use std::{
    any::{Any, TypeId},
    fmt::{self, Debug, Display},
};

use num::Float;
// 定义一个可以被用作特征对象的 ListV 特征
pub trait ListV: Any + Debug {
    fn clone_box(&self) -> Box<dyn ListV>;
    fn as_any(&self) -> &dyn Any;
    fn fmt_as_string(&self) -> String;
    fn is_string(&self) -> bool;
}
macro_rules! is_type {
    ($value:expr, $ty:ty) => {
        $value.as_any().downcast_ref::<$ty>().is_some()
    };
}
impl<T> ListV for T
where
    T: Any + Debug + Display + Clone + 'static,
{
    fn clone_box(&self) -> Box<dyn ListV> {
        Box::new((*self).clone())
    }
    fn as_any(&self) -> &dyn Any {
        self
    }
    fn fmt_as_string(&self) -> String {
        format!("{}", self)
    }
    fn is_string(&self) -> bool {
        is_type!(self, String) || is_type!(self, &str)
    }
}

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

impl Clone for List {
    fn clone(&self) -> Self {
        match self {
            List::Cons(a, b) => List::Cons(a.clone(), b.clone()),
            List::V(v) => List::V(v.as_ref().clone_box()),
            List::Nil => List::Nil,
        }
    }
}
impl fmt::Display for List {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            List::Cons(v, next) => {
                write!(f, "({}, {})", v, next)
            }
            List::V(t) => write!(f, "{}", t.as_ref().fmt_as_string()),
            List::Nil => write!(f, "Nil"),
        }
    }
}

#[derive(Debug)]
pub enum List {
    Cons(Box<List>, Box<List>),
    V(Box<dyn ListV>), // Value as List type
    Nil,
}
#[macro_export]
macro_rules! v {
    // 单个值直接返回 `List::value`
    ($val:expr) => {
        List::value($val)
    };
    // 多个值使用 `from_slice`
    ($($val:expr),+ $(,)?) => {
        List::from_slice(&[$(List::value($val)),*])
    };
}
macro_rules! list {
    ($($val:expr),* $(,)?) => {
        List::from_slice(&[ $($val),* ])
    };
}

impl List {
    pub fn pair(a: List, b: List) -> List {
        List::Cons(Box::new(a), Box::new(b))
    }
    pub fn is_pair(&self) -> bool {
        match self {
            // (x,nil) is a pair?
            List::Cons(_, _) => true,
            _ => false,
        }
    }
    pub fn head(&self) -> &Self {
        match self {
            List::Cons(current, _) => &current,
            List::Nil => &List::Nil,
            List::V(_) => {
                //panic!("only list can call head"),
                eprintln!("only list can call head");
                self
            }
        }
    }
    pub fn tail(&self) -> &Self {
        match self {
            List::Cons(_, next) => next,
            List::Nil => &List::Nil,
            List::V(_) => {
                //panic!("only list can call tail"),
                eprintln!("only list can call tail");
                self
            }
        }
    }
    pub fn value<T: ListV>(v: T) -> Self {
        List::V(Box::new(v))
    }
    pub fn is_empty(&self) -> bool {
        match self {
            List::Nil => true,
            _ => false,
        }
    }
    pub fn is_value(&self) -> bool {
        match self {
            List::V(_) => true,
            _ => false,
        }
    }
    pub fn get_value(&self) -> Box<dyn ListV> {
        match self {
            List::V(v) => v.as_ref().clone_box(),
            _ => {
                panic!("only value can call get_value");
            }
        }
    }

    pub fn value_as<T: 'static>(&self) -> Result<&T, &'static str> {
        match self {
            List::V(v) => v
                .as_ref()
                .as_any()
                .downcast_ref::<T>()
                .ok_or("Type mismatch"),
            List::Nil => Err("Cannot call value_as on Nil"),
            List::Cons(_, _) => Err("Cannot call value_as on Cons"),
        }
    }
    pub fn type_id(&self) -> Option<TypeId> {
        match self {
            List::V(v) => Some(v.as_ref().type_id()),
            _ => None,
        }
    }
    fn equals(&self, other: &List) -> bool {
        match (self, other) {
            (List::Nil, List::Nil) => true,
            (List::Cons(x1, x2), List::Cons(y1, y2)) => x1.equals(y1) && x2.equals(y2),
            (List::V(x1), List::V(y1)) => x1.as_ref() == y1.as_ref(),
            _ => false,
        }
    }
    // 传入List类型,以确保既可以传入[V(1),V(2)],也可以传入[List1,List2]
    pub fn from_slice(items: &[List]) -> Self {
        items
            .iter()
            .rfold(List::Nil, |acc, item| List::pair(item.clone(), acc))
    }
    // 传入Iterator<Item = List<T>>类型,以确保既可以传入[V(1),V(2)],也可以传入[List1,List2]
    pub fn from_iterator<I: Iterator<Item = List>>(items: &mut I) -> Self {
        match items.next() {
            Some(v) => List::pair(v.clone(), List::from_iterator(items)),
            None => List::Nil,
        }
    }
    pub fn append(&self, other: &Self) -> Self {
        match self {
            List::Nil => (*other).clone(),
            List::Cons(value, next) => Self::pair((**value).clone(), next.append(other)),
            List::V(_) => {
                eprintln!("self is a value, not a list, convert it to list");
                Self::pair((*self).clone(), Self::Nil).append(other)
            }
        }
    }
    pub fn map<F>(&self, fun: F) -> List
    where
        F: Fn(&List) -> List,
    {
        match self {
            List::Nil => List::Nil,
            List::Cons(value, next) => List::pair(fun(value), next.map(fun)),
            List::V(_) => fun(self),
        }
    }
    pub fn accumulate<F, U>(&self, fun: F, initial: U) -> U
    where
        F: Fn(&List, U) -> U + Clone,
    {
        match self {
            List::Nil => initial,
            List::Cons(value, next) => {
                let f = fun.clone();
                fun(value, next.accumulate(f, initial))
            }
            List::V(_) => panic!("accumulate only accept list, not value"),
            //{
            //  eprintln!("accumulate only accept list, not value");
            //  fun(self, initial)},
            //}
        }
    }
    pub fn filter<F>(&self, fun: F) -> List
    where
        F: Fn(&List) -> bool,
    {
        self.accumulate(
            |current, result| {
                if fun(current) {
                    List::pair((*current).clone(), result)
                } else {
                    result
                }
            },
            List::Nil,
        )
    }
    pub fn flatmap<F>(&self, fun: F) -> List
    where
        F: Fn(&List) -> List,
    {
        self.map(fun)
            .accumulate(|current, result| result.append(&current), List::Nil)
    }
    pub fn for_each<F>(&self, fun: F) -> ()
    where
        F: Fn(&List) -> (),
    {
        match self {
            List::Nil => (),
            List::Cons(value, next) => {
                fun(value);
                next.for_each(fun)
            }
            List::V(_) => fun(self),
        };
    }
    pub fn fold_left<U, F>(&self, fun: F, initial: U) -> U
    where
        F: Fn(U, &List) -> U + Clone,
    {
        fn iter<U, F>(op: F, result: U, rest: &List) -> U
        where
            F: Fn(U, &List) -> U + Clone,
        {
            match rest {
                List::Nil => result,
                List::Cons(value, next) => iter(op.clone(), op(result, value), next),
                List::V(_) => panic!("flod_left only accept list, not value"),
            }
        }
        iter(fun, initial, self)
    }
    pub fn accumulate_n<F>(&self, op: F, initial: List) -> List
    where
        F: Fn(&List, List) -> List + Clone,
    {
        match self.head() {
            List::Nil => List::Nil,
            List::Cons(_, _) => {
                let l1 = self
                    .map(|y| (*y.head()).clone())
                    .accumulate(op.clone(), initial.clone());
                let l2 = self
                    .map(|y| (*y.tail()).clone())
                    .accumulate_n(op.clone(), initial.clone());
                List::pair(l1, l2)
            }
            List::V(_) => panic!("accumulate_n only accept list, not value"),
            //{
            //  eprintln!("accumulate_n only accept list, not value");
            //  fun(self, initial)},
            //}
        }
    }
    fn reverse_with<F: Fn(&List) -> List>(&self, fun: F) -> Self {
        fn reverse_with_iter<F>(l: &List, result: List, fun: F) -> List
        where
            F: Fn(&List) -> List,
        {
            match l {
                List::Nil => result,
                List::Cons(value, _) => {
                    let value = fun(value);
                    reverse_with_iter(l.tail(), List::pair(value, result), fun)
                }
                List::V(_) => panic!("reverse_with_iter only accept list, not value"),
            }
        }
        reverse_with_iter(self, List::Nil, fun)
    }
    pub fn reverse(&self) -> Self {
        self.reverse_with(|x| (*x).clone())
    }
    pub fn deep_reverse(&self) -> Self {
        self.reverse_with(|x| match (*x).clone() {
            List::Cons(_, _) => x.deep_reverse(),
            List::V(t) => List::V(t),
            List::Nil => List::Nil,
        })
    }
    pub fn length(&self) -> usize {
        match self {
            List::Nil => 0,
            List::Cons(_, next) => 1 + next.length(),
            List::V(_) => 1,
        }
    }
    pub fn deep_length(&self) -> usize {
        match self {
            List::Nil => 0,
            List::Cons(current, next) => current.deep_length() + next.deep_length(),
            List::V(_) => 1,
        }
    }
}
``` 
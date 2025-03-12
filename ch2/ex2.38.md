# 2.2.3 序列作为约定的接口
## 练习2.38
函数accumulate也被称为fold_right，因为它把序列里的第一个元素组合到右边所有元素的组合结果上。与之对应的也有一个fold_left，它与fold_right类似，但却是按相反的方向组合元素：
```javascript
function fold_left(op, init, sequence) {
    function iter(result, rest) {
        return is_null(rest)
           ? result
           : iter(op(result, head(rest)),
                  tail(rest));  
    }
    return iter(init, sequence);
}
```
下面各个表达式的值是什么？
```javascript
fold_right(divide, 1, list(1, 2, 3));
fold_left(divide, 1, list(1, 2, 3));
fold_right(list, null, list(1, 2, 3));
fold_left(list, null, list(1, 2, 3));
```
为保证fold_right和fold_left对任何序列都产生同样结果，函数op应该满足什么性质？

## 解答
* fold_right: divide(1,divide(2,divide(3,1))) = 1.5  //把序列里的第一个元素组合到右边所有元素的组合结果上
* fold_left:  divide(divide(divide(1,1),2),3) = 0.16 //把序列里的最后一个元素组合到左边所有元素的组合结果上
* fold_right: list(1,list(2,list(3,Nil))) = (1, ((2, ((3, (Nil, Nil)), Nil)), Nil)) 
* fold_left:  list(list(list(Nil,1),2),3) = (((Nil, (1, Nil)), (2, Nil)), (3, Nil))
* rust代码如下:
```rust
//依赖代码见习题2.17
impl<T> List<T>
where
    T: Clone + Debug,
{
    fn accumulate<U, F>(&self, fun: F, initial: List<U>) -> List<U>
    where
        U: Clone + Debug,
        F: Fn(&List<T>, List<U>) -> List<U> + Clone,
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
    fn fold_left<U, F>(&self, fun: F, initial: List<U>) -> List<U>
    where
        U: Clone + Debug,
        F: Fn(List<U>, &List<T>) -> List<U> + Clone,
    {
        fn iter<T, U, F>(op: F, result: List<U>, rest: &List<T>) -> List<U>
        where
            U: Clone + Debug,
            T: Clone + Debug,
            F: Fn(List<U>, &List<T>) -> List<U> + Clone,
        {
            match rest {
                List::Nil => result,
                List::Cons(value, next) => iter(op.clone(), op(result, value), next),
                List::V(_) => panic!("flod_left only accept list, not value"),
            }
        }
        iter(fun, initial, self)
    }
}
fn main() {
    use List::*;
    let l = List::from_slice(&[V(1.0), V(2.0), V(3.0)]);
    println!("{}", l.accumulate(|x, y| V(y.value() / x.value()), V(1.0)));
    println!("{}", l.fold_left(|x, y| V(y.value() / x.value()), V(1.0)));
    println!(
        "{}",
        l.accumulate(|x, y| List::from_slice(&[(*x).clone(), y]), List::Nil)
    );
    println!(
        "{}",
        l.fold_left(|x, y| List::from_slice(&[x, (*y).clone()]), List::Nil)
    );
    println!("{}", l.accumulate(|x, y| V(y.value() * x.value()), V(1.0)));
    println!("{}", l.fold_left(|x, y| V(y.value() * x.value()), V(1.0)));
}
// Output
//1.5 
//0.16666666666666666 
//(1, ((2, ((3, (Nil, Nil)), Nil)), Nil)) 
//(((Nil, (1, Nil)), (2, Nil)), (3, Nil))
//6
//6
```
* 由输出可以看出，fold_left和fold_right对任何序列都产生同样结果，函数op应该满足结合律。
    * 结合律：$(a⋅b)⋅c=a⋅(b⋅c)$，与操作的分组方式无关。
    * fold_left 和 fold_right 的区别在于操作的分组方式：
        * fold_left：从左到右分组，$((a⋅b)⋅c)⋅d$。
        * fold_right：从右到左分组，$a⋅(b⋅(c⋅d))$。
    * 交换律$a⋅b=b⋅a$可不可以？
        * $a⋅b=min(a,b)+1$ 满足交换律，但并不满足结合律，代入序列[3,2,1]分别计算fold_right&fold_left结果并不相同。
        * "a"+"b"="ab"字符串拼接运算，满足结合律，但不满足交换律。代入序列["a","b","c"]分别计算fold_right&fold_left结果相同。
        * 综上，交换律不成立。
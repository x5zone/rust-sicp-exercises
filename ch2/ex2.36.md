# 2.2.3 序列作为约定的接口
## 练习2.36
函数accumulate_n与accumulate类似，但是其第三个参数是一个序列的序列，我们还假定其中每个小序列的元素个数相同。这个函数应该用指定的累积过程组合起每个序列里的第一个元素，而后再组合每个序列的第二个元素，并如此做下去。它返回以得到的所有结果为元素的序列。例如，如果s是包含4个序列的序列
```javascript
list(list(1, 2, 3), list(4, 5, 6), list(7, 8, 9), list(10, 11, 12))
```
那么accumulate_n(plus, 0, s)的值就应该是序列list(22, 26, 30)。请填充下面accumulate_n声明中缺失的表达式：
```javascript
function accumulate_n(op, init, seqs) {
    return is_null(head(seqs))
       ? null
        : pair(accumulate(op, init, <??>),
               accumulate_n(op, init, <??>));
}
```

## 解答
* 从题目可知`accumulate(plus, 0, <??>)`返回值必为一个数字，且整个递归迭代结束时，返回值为30(3+6+9+12)，所以最后一次递归迭代结束时，`<??>`为`list(3,6,9,12)`。
* 现在考虑第一次迭代，`accumulate(plus, 0, <??>)`返回值为22(1+4+7+10)，`<??>`为`list(1,4,7,10)`。
* 考虑以上模式，`map(y => head(y), seqs)`可取出每个子表的首个元素，符合要求，即为应填写的答案。
* accumulate收集子表首个元素，而accumulate_n可通过`map(y => tail(y), seqs)`来移动位置，然后再次递归调用accumulate，完成对子表第二个元素的收集。
* 综上，填空如下:
```javascript
function accumulate_n(op, init, seqs) {
    return is_null(head(seqs))
       ? null
        : pair(accumulate(op, init, map(y => head(y), seqs)),
               accumulate_n(op, init, map(y => tail(y), seqs)));
}
```
* rust代码&测试代码如下:
```rust
//依赖代码见习题2.17和习题2.33
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
    fn accumulate_n<U, F>(&self, op: F, initial: List<U>) -> List<U>
    where
        U: Clone + Debug,
        F: Fn(&List<T>, List<U>) -> List<U> + Clone,
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
}
//测试
fn main() {
    use List::*;
    let seqs = List::from_slice(&[
        List::from_slice(&[V(1), V(2), V(3)]),
        List::from_slice(&[V(4), V(5), V(6)]),
        List::from_slice(&[V(7), V(8), V(9)]),
        List::from_slice(&[V(10), V(11), V(12)]),
    ]);
    println!(
        "accumulate_n: {}",
        seqs.accumulate_n(|x, y| List::V(x.value() + y.value()), V(0),)
    );
}
//Output
//accumulate_n: (22, (26, (30, Nil)))
```

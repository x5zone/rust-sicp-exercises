# 2.2.3 序列作为约定的接口
## 练习2.33
下面是一些把基本表操作看作累积的声明，请填充空缺的表达式，完成它们：
```javascript
function map(f, sequence) {
    return accumulate((x, y) => <??>),
                        null, sequence);
}
function append(seq1, seq2) {
    return accumulate(pair, <??>, <??>);
}
function length(sequence) {
    return accumulate(<??>, 0, sequence);
}
```

参考
```javascript
function accumulate(op, initial, sequence) {
    return is_null(sequence)
        ? initial
        : op(head(sequence),
             accumulate(op, initial, tail(sequence)));
}
```

## 解答
* 需要注意op输入的两个参数，op(当前元素,累积结果)。
* 填空如下:
```javascript
function map(f, sequence) {
    return accumulate((x, y) => pair(f(x), y),
                        null, sequence);
}
function append(seq1, seq2) {
    return accumulate(pair, seq2, seq1);
}
function length(sequence) {
    return accumulate((x, y) => y + 1, 0, sequence);
}
```
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
    fn length(&self) -> usize {
        self.accumulate(|_, y| List::V(y.value() + 1), List::V(0))
            .value()
    }
    fn acc_map<U, F>(&self, fun: F) -> List<U>
    where
        U: Clone + Debug,
        F: Fn(&List<T>) -> List<U> + Clone,
    {
        self.accumulate(|x, y| List::pair(fun(x), y), List::Nil)
    }
    fn acc_append(&self, other: &Self) -> Self {
        self.accumulate(|x, y| List::pair((*x).clone(), y), other.clone())
    }
}
// 已经有旧版本的append和map代码, 和acc版本进行简单对比测试，输出均一致。测试代码此处就不给出了。
```
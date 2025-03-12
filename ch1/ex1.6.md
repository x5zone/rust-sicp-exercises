# 1.1.7 实例:用牛顿法求平方根
## 练习1.6
Alyssa P.Hacker不喜欢条件表达式的语法，因为其中涉及符号?和:。她问：​“为什么我不能直接声明一个常规的条件函数，其应用的工作方式就像条件表达式呢？​”Alyssa的朋友Eva Lu Ator断言确实可以这样做，并声明了一个名为conditional的函数：
```javascript
function conditional(predicate, then_clause, else_clause) {
    return predicate ? then_clause : else_clause;
}
```
Eva给Alyssa演示了她的程序：
```javascript
conditional(2 === 3, 0, 5);
5
conditional(1 === 1, 0, 5);
0
```
她很高兴地用自己的conditional函数重写了求平方根的程序:
```javascript
function sqrt_iter(guess, x) {
    return conditional(
        is_good_enough(guess, x),
        guess,
        sqrt_iter(improve(guess, x), x)
    );
}
```
当Alyssa试着用这个函数去计算平方根时会发生什么情况？请给出解释。

## 解答
 > “完全展开而后归约”的求值模型称为正则序求值，与之相对的是解释器实际使用的方式，​“先求出实参而后应用”​，这称为应用序求值。
- 会发生无限递归后栈溢出，因为javascript为应用序求值，所以会先计算sqrt_iter的第二个参数，导致无限递归。
- 栈溢出代码如下：
```rust
fn main() {
    println!("{}",sqrt_iter(1.0, 2.0));
}

fn conditional<F>(predicate: bool, then_clause: F, else_clause: F) -> F {
    if predicate {
        then_clause
    } else {
        else_clause
    }
}

fn sqrt_iter(guess: f64, x: f64) -> f64 {
    conditional(
        is_good_enough(guess, x),
        guess,
        sqrt_iter(improve(guess, x), x),
    )
}

fn is_good_enough(guess: f64, x: f64) -> bool {
    let abs = (guess * guess) - x;
    abs.abs() < 0.001
}

fn improve(guess: f64, x: f64) -> f64 {
    (guess + (x / guess)) / 2.0
}
```
- 通过闭包来延迟执行
```rust
fn conditional(
    predicate: bool,
    then_clause: Box<dyn Fn() -> f64>,
    else_clause: Box<dyn Fn() -> f64>,
) -> f64 {
    if predicate {
        then_clause()
    } else {
        else_clause() // 实际的执行延迟到ifelse语句中
    }
}

fn sqrt_iter(guess: f64, x: f64) -> f64 {
    conditional(
        is_good_enough(guess, x),
        Box::new(move|| guess),
        Box::new(move|| sqrt_iter(improve(guess, x), x)),
    )
}
```

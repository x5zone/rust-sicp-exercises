# 2.2.3 序列作为约定的接口
## 练习2.34
对一个给定的x的多项式，求出其在某个x处的值也可以形式化为一种累积。假设需要求下面多项式的值：
$$a_nx^n + a_{n-1}x^{n-1} + \cdots + a_1x + a_0$$
采用著名的Horner规则的计算过程具有如下的结构：
$$(\cdots(a_nx + a_{n-1})x + \cdots + a_1)x + a_0$$
换句话说，我们从$a_n$开始，将其乘以x，再加上$a_{n-1}$，再乘以x，如此下去，直到处理完$a_0$。请填充下面的程序模板，做出一个使用Horner规则求多项式的值的函数。假定多项式的系数安排在一个序列里，从$a_0$直至$a_n$。
```javascript
function horner_eval(x, coefficient_sequence) {
    return accumulate((this_coeff, higher_terms) => <??>,
                        0,
                        coefficient_sequence);
}
```
例如，为了计算$1+3x+5x^3+x^5$在x=2的值，你需要求值：
```javascript
horner_eval(2, list(1, 3, 0, 5, 0, 1));
```

## 解答
* 填空如下:
```javascript
function horner_eval(x, coefficient_sequence) {
    return accumulate((this_coeff, higher_terms) => higher_terms*x+this_coeff,
                        0,
                        coefficient_sequence);
}
```
* rust代码&测试代码如下:
```rust
//依赖代码见习题2.17和习题2.33
fn horner_eval<T: Clone + Debug + Num>(x: T, coefficient_sequence: &List<T>) -> List<T> {
    coefficient_sequence.accumulate(
        |this_coeff, higher_terms| List::V(higher_terms.value() * x.clone() + this_coeff.value()),
        List::V(T::zero()),
    )
}
fn main() {
    use List::*;
    let coeff_seq = List::from_slice(&[
        List::V(1),
        List::V(3),
        List::V(0),
        List::V(5),
        List::V(0),
        List::V(1),
    ]);
    println!("horner_eval: {}", horner_eval(2, &coeff_seq));
}
//Output
//horner_eval: 79
```

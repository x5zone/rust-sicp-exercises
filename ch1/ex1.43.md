# 1.3.4 函数作为返回值
## 练习1.43
如果f是一个数值函数，n是一个正整数，我们可以构造f的n次重复应用，也就是说，这个函数在x的值应该是f（f（…(f(x))…）​）​。举例说，如果f是函数x↦x+1，n次重复应用f就是函数x↦x+n。如果f是求数的平方的函数，n次重复应用f就求出其参数的$2^n$次幂。请写一个函数，其输入是一个计算f的函数和一个正整数n，返回的是计算f的n次重复应用的那个函数。你的函数应该能以如下方式使用：
```javascript
repeated(square,2)(5);
625
```
提示：你可能发现，利用练习1.42的compose可能带来一些方便。

## 解答
* python代码:
```python
def square(x): return x*x 
def compose(f,g): return lambda x: f(g(x))
def repeated(f,n): 
    if n == 1:
        return f
    else: 
        return compose(f,repeated(f,n-1))
print(repeated(square,2)(5))
```
* rust代码
    * rust无法使用python类似风格，这是因为rust要求ifelse中的返回类型都是一致的，而每个闭包的类型都是不一致的。
    * 如果对repeated的返回类型使用`Box<dyn Fn(T) -> T>`的方式，又会面对生命周期的问题。
```rust
fn square<T: Num + Copy>(x: T) -> T {
    x * x
}
fn repeated<T, F>(f: F, n: u32) -> impl Fn(T) -> T
where
    T: Num + Copy,
    F: Fn(T) -> T,
{
    move |x| {
        let mut result = x;
        for _ in 0..n {
            result = f(result);
        }
        result
    }
}
// println!("{}", repeated(square, 2)(5_i32));
```
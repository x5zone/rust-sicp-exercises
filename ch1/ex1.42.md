# 1.3.4 函数作为返回值
## 练习1.42
令f和g是两个单参数的函数，f在g之后的复合定义为函数x↦f(g(x))。请声明一个函数compose实现函数复合。例如，如果inc是将参数加1的函数，那么就有：
```javascript
compose(square, inc)(6);
49
```

## 解答
* python代码如下:
```python
def inc(x):    return x+1
def square(x): return x*x 
def compose(f,g): return lambda x: f(g(x))
print(compose(square,inc)(6))
```
* rust版本的代码如下:
```rust
fn inc<T: Num + Copy>(x: T) -> T {
    x + T::one()
}
fn square<T: Num + Copy>(x: T) -> T {
    x * x
}
fn compose<J, Q, K, F, G>(f: F, g: G) -> impl Fn(J) -> K
where
    J: Num + Copy,
    Q: Num + Copy,
    K: Num + Copy,
    G: Fn(J) -> Q,
    F: Fn(Q) -> K,
{
    move |x| f(g(x))
}
// println!("{}",compose(square,inc)(6_i32));
```

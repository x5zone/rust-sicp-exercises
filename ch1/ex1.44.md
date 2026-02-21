# 1.3.4 函数作为返回值
## 练习1.44
平滑一个函数的思想是信号处理中的一个重要概念。如果f是函数，dx是某个很小的数值，那么f的平滑版本也是函数，它在点x的值就是f(x-d x)、f(x)和f(x+d x)的平均值。请写一个函数smooth，其参数是一个计算f的函数，返回f经过平滑后的那个函数。有时我们可能发现，重复地平滑一个函数，得到经过n次平滑的函数（也就是说，对平滑后的函数再做平滑，等等）也很有价值。请说明怎样利用smooth和练习1.43的repeated，构造出能对给定的函数做n次平滑的函数。

## 解答
* 根据题意应该是这样？假设手动进行3次平滑:
```python
smooth(f) #平滑后得到的函数 设为g
smooth(smooth(f)) #再次平滑 即为smooth(g)
smooth(smooth(smooth(f))) #第3次平滑
```
* python代码如下:
```python
def compose(f,g): return lambda x: f(g(x))
def repeated(f,n): 
    if n == 1:
        return f
    else: 
        return compose(f,repeated(f,n-1))
def smooth(f): return lambda x: (f(x+0.00001)+f(x-0.00001))/2
def n_smooth(f,n): return lambda x: repeated(smooth, n)(f)(x)
# 假设调用以n=3调用n_smooth
# repeated(smooth,3):
# n==1: smooth(x)
# n==2: compose(f,smooth(x)) -> smooth(smooth(x))
# n==3: smooth(smooth(smooth(x)))
# 以上可得，需要先对smooth进行repeated，然后再应用f
# 同理易得，若先对f进行平滑后，得到smooth(f(x)),再repeated2次，可得smooth(f(smooth(f(x))))，这显然不符合题意
```
* rust
    * 首先使用1.43节的repeated函数，在rust里面做不到，原因见注释。仿着repeated写了一个n_smooth
    * 闭包的类型神烦，静态分发的代码我写不出来=。=以后这种高阶函数的题，不用rust了。。。
    * Box&lt;dyn Fn&gt;这个，因为"Rust 要求放入 Box&lt;dyn Trait&gt; 的闭包必须是 'static 的，也就是说，闭包不能依赖任何短生命周期的数据"，所以写了一大堆'static。
```rust
use num::Float;

fn main() {
    let f = |x: f64| x * x; // 定义一个平方函数
    let smoothed = n_smooth(f, 3); // 对 f 进行 3 次平滑
    println!("{}", smoothed(2.0)); // 打印结果
}

fn repeated<T, F>(f: F, n: u32) -> impl Fn(T) -> T
where
    T: Float + Copy,
    F: Fn(T) -> T, //T的类型为Float，而非Fn，故smooth无法作用为repeated的参数
{
    move |x| {
        let mut result = x;
        for _ in 0..n {
            result = f(result);
        }
        result
    }
}

const DX: f64 = 0.00001;
fn smooth<T, F>(f: F) -> Box<dyn Fn(T) -> T>
//Box<dyn Fn(T) -> T>
where
    T: Float + Copy,
    F: Fn(T) -> T + 'static, //'static 是必须的，因为我们要把闭包放到 Box 中
{
    Box::new(move |x| {
        let dx = T::from(DX).unwrap();
        (f(x + dx) + f(x - dx)) / (T::one() + T::one())
    })
}
// 对输入f进行n次平滑
fn n_smooth<T, F>(f: F, n: u32) -> Box<dyn Fn(T) -> T>
where
    T: Float + Copy + 'static,
    F: Fn(T) -> T + Copy + 'static,
{
    Box::new(move |x: T| {
        let mut n_f: Box<dyn Fn(T) -> T> = Box::new(f); // 初始值是 f
        for _ in 0..n {
            n_f = smooth(n_f); // 每次平滑后返回的类型仍然是 Box<dyn Fn(T) -> T>
        }
        n_f(x)
    })
}
```

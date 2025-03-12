# 2.1.3 数据是什么意思？
## 练习2.6
如果觉得序对可以只用函数表示还不够令人震惊，那么请考虑，在一个可以对函数做各种操作的语言里，我们完全可以没有数（至少在只考虑非负整数的情况下）​，以下面的方式实现0和加一操作：
```javascript
const zero = f => x => x;
function add_1(n) {
    return f => x => f(n(f)(x));
}
```
这一表示形式被称为Church计数，这个名字来源于其发明人——逻辑学家Alonzo Church。λ演算也是Church的发明。请直接声明one和two（不用zero和add_1）​。​（提示：请利用代换去求值add_1(zero)。​）请给出加法函数+的一个直接声明（不通过反复应用add_1）​。

## 
* python版本的解答如下:
```python
zero = lambda f : lambda x: x
# 为帮助理解，重写zero为函数形式
def zero_helper(f):
    def tmp(x):
        return x
    return tmp
def add_1(n):
    return lambda f: lambda x : f(n(f)(x))
# 设n为zero，首先执行n(f), 设得到的返回值为y -> lambda f: lambda x : f(y(x))
# y = zero(f) => lambda x:x
# one = add_1(zero) => lambda f: lambda x : f(lambda x: x(x))
# one = add_1(zero) => lambda f: lambda x : f(x)
# zero vs one
# lambda f : lambda x : x
# lambda f : lambda x : f(x)
# 通过以上对比得知，该计数为对f调用次数的计数

one = lambda f: lambda x : f(x)
two = lambda f: lambda x : f(f(x))

# 对比add_1(n), 即为(n+1): lambda f: lambda x : f(n(f)(x))
# n(f)为执行了n次f，而1为执行1次f，我们只需要将f改为m(f)即可
add = lambda m: lambda n: lambda f: lambda x: m(f)(n(f)(x))

# 转换为整数辅助函数
def to_int(n):
    # 对函数执行次数计数，那么用一个每次加1的函数，即可得到函数执行次数
    return n(lambda x: x + 1)(0)

print("zero:", to_int(zero))  # 0
print("one:", to_int(one))    # 1
print("two:", to_int(two))    # 2

three = add(one)(two)
print("one + two =", to_int(three))  # 3

five = add(two)(three)
print("two + three =", to_int(five))  # 5
```
* "在一个可以对函数做各种操作的语言里"，显然rust不是这样的语言，写起来就有些复杂了=.=rust代码如下:
```rust
use std::rc::Rc;

// 定义一个 Church 数字类型：函数接受一个函数并返回另一个函数
type Fx = Rc<dyn Fn(i32) -> i32>;
type Church = Rc<dyn Fn(Fx) -> Fx>;

fn zero() -> Church {
    Rc::new(|_f| Rc::new(|x| x))
}
fn add_1(n: Church) -> Church {
    Rc::new(move |f| {
        let n = n.clone();
        Rc::new(move |x| f.clone()(n.clone()(f.clone())(x)))
    })
}
fn one() -> Church {
    Rc::new(move |f| Rc::new(move |x| f.clone()(x)))
}
fn add(m: Church, n: Church) -> Church {
    Rc::new(move |f| {
        let m = m.clone();
        let n = n.clone();
        Rc::new(move |x| {
            //避免有太多括号，例如上文中n.clone()(f.clone())，提前clone好
            let m = m.clone();
            let n = n.clone();
            let f1 = f.clone();
            let f2 = f.clone();
            m(f1)(n(f2)(x))
        })
    })
}
fn to_int(n: Church) -> i32 {
    n(Rc::new(move |x| x + 1))(0)
}
fn main() {
    let zero = zero();
    let one = one();
    let two = add_1(one.clone());

    println!("zero: {}", to_int(zero.clone())); // 输出 0
    println!("one: {}", to_int(one.clone())); // 输出 1
    println!("two: {}", to_int(two.clone())); // 输出 2

    let three = add(one.clone(), two.clone());
    println!("one + two = {}", to_int(three.clone())); // 输出 3

    let five = add(two.clone(), three.clone());
    println!("two + three = {}", to_int(five.clone())); // 输出 5
}
```

# 1.2.1 线性递归和迭代
## 练习1.10
下面的函数计算一个称为Ackermann函数的数学函数：
```javascript
function A(x, y) {
    return y === 0
        ? 0
        : x === 0
        ? 2 * y
        : y === 1
        ? 2
        : A(x - 1, A(x, y - 1));
}
```
下面各语句的值是什么：
```
A(1, 10);
A(2, 4);
A(3, 3);
```
请考虑下面的函数，其中的A就是上面声明的函数：
```javascript
function f(n) {
    return A(0, n);
}
function g(n) {
    return A(1, n);
}
function h(n) {
    return A(2, n);
}
function k(n) {
    return 5 * n * n;
}
```
请给出函数f、g和h对给定整数值n计算的函数的简洁数学定义。例如，k(n)计算$5n^2$。

## 解答
- 函数值如下：
  - $A(1,10)=1024$
  - $A(2,4)=65536$
  - $A(3,3)=65536$
- 函数定义如下：
  - $f(n)=A(0,n)=2n$
  - $g(n)=A(1,n)=2^n$
  - $h(n)=A(2,n)=2^{2^n}$
  - $k(n)=5n^2$
- ackermann函数是非原始递归函数(有非原始，自然也有原始递归函数了，此处不再详述)。
- rust写了个打印代换模型的代码，未仔细验证，仅供参考，如下：
```rust
fn A(x: i32, y: i32, p: String) -> i32 {
    let prefix;
    if !p.ends_with(",") && p.len() > 0 {
        prefix = p + ",";
    } else {
        prefix = p;
    }
    if y == 0 {
        println!("{}(A({},{})=0)", prefix, x, y);
        return 0;
    } else if x == 0 {
        println!("{}(A({},{})=2*{})", prefix, x, y, y);
        return 2 * y;
    } else if y == 1 {
        println!("{}(A({},{})=2)", prefix, x, y);
        return 2;
    } else {
        println!("{}A({},{})", prefix, x, y);
        return A(x - 1, A(x, y - 1, format!("{}A({}", prefix, x - 1)), prefix);
    }
}
```
output如下：
```
A(2,3)
A(1,A(2,2)
A(1,A(1,(A(2,1)=2)
A(1,A(1,2)
A(1,A(0,(A(1,1)=2)
A(1,(A(0,2)=2*2)
A(1,4)
A(0,A(1,3)
A(0,A(0,A(1,2)
A(0,A(0,A(0,(A(1,1)=2)
A(0,A(0,(A(0,2)=2*2)
A(0,(A(0,4)=2*4)
(A(0,8)=2*8)
Results: A(2,3):16
```


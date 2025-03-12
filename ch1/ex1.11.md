# 1.2.2 树形递归
## 练习1.11
函数$f$由如下规则定义：如果$n<3$，那么$f(n)=n$；如果$n≥3$，那么$f(n)=f(n-1)+2f(n-2)+3f(n-3)$。请写一个JavaScript函数，它通过一个递归计算过程计算$f$。再写一个函数，通过迭代计算过程计算$f$。

## 解答
- 代码如下，解释参见注释：
```rust
fn f_recu(n: i32) -> i32 {
    if n < 3 {
        n
    } else {
        //此处有重复计算，即可存储中间结果，从而迭代化
        f_recu(n - 1) + 2 * f_recu(n - 2) + 3 * f_recu(n - 3)
    }
}
/*
递归转换迭代需要额外存储一些信息
f(3) result =   x  + 2 *   y  + 3 *   z
f(3) result = f(2) + 2 * f(1) + 3 * f(0) //令x,y,z = (f(2), f(1), f(0))
f(4) result = f(3) + 2 * f(2) + 3 * f(1) //令x,y,z = (f(3), f(2), f(1)) => z=y,y=x,x=result
f(5) result = f(4) + 2 * f(3) + 3 * f(2) //令x,y,z = (f(4), f(3), f(2))
f(6) result = f(5) + 2 * f(4) + 3 * f(3) //令x,y,z = (f(5), f(4), f(3))
*/
fn f_iter(n: i32) -> i32 {
    if n < 3 {
        return n;
    }
    let mut x = 2; //f(2)
    let mut y = 1; //f(1)
    let mut z = 0; //f(0)
    let mut result = 0;
    for _ in 3..=n {
        result = x + 2 * y + 3 * z;
        z = y;
        y = x;
        x = result;
    }
    result
}
```
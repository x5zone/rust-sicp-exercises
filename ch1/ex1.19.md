# 1.2.4 求幂
## 练习1.19
存在只需要对数步就能求出斐波那契数的巧妙算法。请回忆1.2.2节fib_iter产生的计算过程中状态变量a和b的变换规则$a←a+b$和$b←a$，我们把这种变换称为T变换。可以看到，从1和0开始把T反复应用n次，将产生一对数$Fib(n+1)$和$Fib(n)$。换句话说，斐波那契数可以通过将$T^n$（变换T的n次方）应用于对偶$(1,0)$而得到。现在把T看作变换族$T_{pq}$中$p=0$且$q=1$的特殊情况，其中$T_{pq}$是对偶$(a, b)$按$a←bq+aq+ap$和$b←bp+aq$规则的变换。请证明，如果应用变换$T_{pq}$两次，其效果等同于应用同样形式的变换$T_{p'q'}$一次，其中的$p'$和$q'$可以由p和q算出来。这就指明了一种计算这种变换的平方的路径，使我们可以通过连续求平方的方法计算$T^n$，就像fast_expt函数里所做的那样。把所有这些放到一起，就得到了下面的函数，其运行只需要对数的步数
```javascript
function fib(n) {
    return fib_iter(1,0,0,1,n);
}
function fib_iter(a,b,p,q,count) {
    return count === 0
    ? b
    : is_even(count)
    ? fib_iter(a, b,
        <?,?>, //compute p'
        <?,?>, //compute q'
        count / 2)
    : fib_iter(b*q+a*q+a*p,
        b*p+a*q,
        p,q,
        count - 1)
}
```
## 解答
- $b←bp+aq$，进行再一次代换后 $b←(bp+aq)p+(bq+aq+ap)q$，化简后可得 $b←b(pp+qq)+a(2pq+qq)$
- $a←bq+aq+ap$，进行再一次代换后 $a←(bp+aq)q+(bq+aq+ap)q+(bq+aq+ap)p$，化简后可得 $a←b(2pq+qq)+a(2qq+2pq+pp)$
- 易得$p'= pp+qq,q'=(2pq+qq)$，由此可次使用$p'q'$对a代换进行验证。$a←b(2pq+qq)+a(2pq+qq)+a(pp+qq)$，化简后可得$a←b(2pq+qq)+a(2qq+2pq+pp)$，得证。
- 应补充代码为:
```javascript
fib_iter(a, b,
        p*p+q*q, //compute p'
        2*p*q+q*q, //compute q'
        count / 2)

```
- 本节主要是数学证明推导，rust代码略。
    - 迭代实现版本代码，参考习题1.16即可。

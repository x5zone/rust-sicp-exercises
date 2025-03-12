# 1.2.5 最大公约数
## 练习1.20
```javascript
function gcd(a,b) {
    return b === 0 ? a : gcd(b, remainder(a,b));
}
function remainder(a,b) {
    return a % b
}
```
一个函数产生的计算过程当然依赖解释器使用的规则。作为例子，请考虑上面给出的迭代式gcd函数，假定解释器采用1.1.5节介绍的正则序解释这个函数（对条件表达式的正则序求值规则在练习1.5中说明）​。请采用（正则序的）代换方法展示求值表达式gcd(206, 40)时产生的计算过程，并标出实际执行的remainder运算。采用正则序求值gcd(206, 40)，需要执行多少次remainder运算？如果采用应用序求值呢？

## 解答
- > “完全展开而后归约”的求值模型称为正则序求值，与之相对的是解释器实际使用的方式，​“先求出实参而后应用”​，这称为应用序求值。
- > 无论解释器实际使用的是正则序还是应用序，条件表达式的求值规则总是一样的，其中的谓词部分先行求值，再根据其结果确定随后求值的子表达式部分。from习题1.5
- > Instead it would first substitute operand expressions for parameters until it obtained an expression involving only primitive operators, and would then perform the evaluation。from SICP
- 应用序求值，remainder执行4次。
```rust
fn gcd(a: i32, b: i32) -> i32 {
    if b == 0 {
        return a;
    }
    gcd(b, remainder(a, b))
}
static mut cnt: i32 = 0;
fn remainder(a: i32, b: i32) -> i32 {
    unsafe {
        cnt += 1;
    }
    return a % b;
}
```
- 正则序求值
- > 正则序会延迟计算参数，直到参数的值被真正需要时才会计算。在控制流判断中，条件表达式的值必须被计算，以决定程序的执行路径。from chatGPT
- > 即使在条件表达式中计算了b的值，这个值也仅用于判断条件的真假，不会传播到其他地方。from chatGPT
    - 修改代码后可知，如该值会传播到其余各处，则remainder计算次数会和应用序一致，即4次。
- 模拟执行代码(就不给出rust版本了，rust没有eval函数)
```python
jr_cnt,gr_cnt = 0,0
def jr(a,b):
    global jr_cnt
    jr_cnt += 1
    print(f"judge compute remainder {jr_cnt}th, with a={a}, b={b}")
    return a % b
def gr(a,b):
    global gr_cnt 
    gr_cnt += 1
    print(f"gcd compute remainder {gr_cnt}th, with a={a}, b={b}")
    return a % b

a,b,left = "206","40",False
for _ in range(100):
    """return b == 0?"""
    #条件表达式必须被计算
    if(0==eval(b.replace("r","jr"))):
        left = True
    # 即使在条件表达式中计算了b的值，这个值也仅用于判断条件的真假，不会传播到其他地方。验证可修改以上几行代码

    """a: gcd(b,r(a,b))"""
    print(f"{a}: gcd({b}, r({a}, {b}))")
    # 只包含原始运算符的表达式才会求值，那么包含gcd的子表达式永不会求值，只会继续递归迭代
    if left == True:
        print("The result: %s"%eval(a.replace("r","gr")))
        break
    # 迭代更新a，b
    tmp_a = a
    a = b
    b = "r(%s,%s)"%(tmp_a,b)
```
- output：
```
judge compute remainder 14th, with a=4, b=2
gcd compute remainder 4th, with a=6, b=4
```
- 综上，正则序执行过程中，条件判断remainder执行14次，最终求值a表达式remainder执行4次，共计18次。

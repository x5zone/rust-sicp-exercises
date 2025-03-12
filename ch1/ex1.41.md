# 1.3.4 函数作为返回值
## 练习1.41
请声明一个函数double，它以一个只有一个参数的函数为参数，返回另一个函数，后一函数将连续地应用原来的那个参数函数两次。例如，如果inc是一个给参数加1的函数，double(inc)将给参数加2。下面这个语句返回什么值：
```javascript
double(double(double))(inc)(5);
```

## 解答
* python的代码如下,最终值为21。
```python
def double(f): return lambda x: f(f(x)) #？{f(x);f(x)} 连续的应用？
def inc(x):    return x+1
print(double(double(double))(inc)(5))
```
* 对于静态类型的rust而言:
    * double函数的入参和出参类型一致(```double(double(double))```可知，第3个double是第2个double的入参，第2个double函数的出参是第一个double的入参。即double本身的类型和出参和入参是完全一致的，设这个类型为Fn_x。
    * ```double(double(double))```不妨设这个函数为g，易知g的类型与double也是完全一致的，也为Fn_x，而inc为g的入参，由此可知，inc的类型Fn(i32)->i32，即为Fn_x，这显然不可能。
    * 我觉的rust写这一题是写不出来的，实在想不到有什么办法可以实现?

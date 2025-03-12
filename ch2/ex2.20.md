# 2.2.1 序列的表示
## 练习2.20
由于存在高阶函数，允许函数有多个参数的功能已不再是严格必需的，只允许一个参数就足够了。如果我们有一个函数（例如plus）自然情况下它应该有两个参数。我们可以写出该函数的一个变体，一次只送给它一个参数。该变体对第一个参数的应用返回一个函数，该函数随后可以应用于第二个参数。对多个参数就这样做下去。这种技术称为curry化，该名字出自美国数学与逻辑学家Haskell BrooksCurry，在一些程序设计语言里被广泛使用，如Haskell和OCalm。下面是在JavaScript里plus的curry化版本：
```javascript
function plus_curried(x) {
    return y => x + y
}
```
请写一个函数brooks，它的第一个参数是需要curry化的函数，第二个参数是一个实参的表，经过curry化的函数应该按给定顺序，一个个地应用于这些实际参数。例如，brooks的如下应用应该等价于plus_curried(3)(4)：
```javascript
brooks(plus_curried, list(3,4));
7
```
做好了函数brooks，我们也可以carry化函数brooks自身！请写一个函数carried_brooks，它可以按下面的方式应用：
```javascript
brooks_curried(list(plus_curried, 3, 4));
7
```
有了这个carried_brooks，下面两个语句的求值结果是什么？
```javascript
brooks_curried(list(brooks_curried,
                    list(plus_curried, 3, 4)));
brooks_curried(list(brooks_curried,
                    list(brooks_curried,
                        list(plus_curried, 3, 4))));                    
```

## 解答
* 先给出一个python版本的代码:
```python
def pair(a, b):
    return (a,b)
def head(l):
    return l[0]
def tail(l):
    return l[1]
def list(*args):
    if len(args) == 0:
        return None
    else:
        return pair(args[0],list(*args[1:]))
def plus_curried(x):
    return lambda y: x +y
def brooks(fun, l):
    if tail(l) is None:
        return fun(head(l))
    else: 
        return brooks(fun(head(l)),tail(l))
def brooks_curried(l):
    return brooks(head(l),tail(l))

print(list(1,2,3,4))
print(brooks(plus_curried, list(3,4)))
print(brooks_curried(list(plus_curried, 3, 4)))
print(brooks_curried(list(brooks_curried,
                    list(plus_curried, 3, 4))))
print(brooks_curried(list(brooks_curried,
                    list(brooks_curried,
                        list(plus_curried, 3, 4)))))
```
* 输出均为7。
* rust版本的代码，因为"list(plus_curried, 3, 4)"这样的异构列表，将需要进行大量的类型体操。
    * 通过enum等，还是有可能实现的，但确实比较复杂，此处就不再给出具体实现了。
        ```rust
        enum ListElement {
            Function(Rc<dyn Fx>>), // 函数类型
            Value(i32), // 整数类型
        }
        ```
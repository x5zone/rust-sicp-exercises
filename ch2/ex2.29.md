# 2.2.2 层次结构
## 练习2.29
一个二叉活动体由两个分支组成，一个是左分支，另一个是右分支。每个分支是一根长度确定的杆，杆上或者吊一个重量，或者吊着另一个二叉活动体。我们可以用复合数据对象表示这种二叉活动体，或者基于两个分支构造它们（例如用list）​：
```javascript
function make_mobile(left, right) {
    return list(left, right)
}
```
一个分支可以基于一个length（它应该是一个数）加上一个structure构造出来，这个structure或者是一个数（表示一个简单重量）​，或者是另一个活动体：
```javascript
function make_branch(length, structure) {
    return list(length, structure)
}
```
a.请写出相应的选择函数left_branch和right_branch，它们分别返回参数活动体的两个分支。还有branch_length和branch_structure，它们返回参数分支的两个成分。
b.基于你的选择函数声明一个函数total_weight，它返回参数活动体的总重量。
c.一个活动体称为是平衡的，如果其左分支的力矩等于其右分支的力矩（也就是说，如果其左杆的长度乘以吊在杆上的重量，等于这个活动体右边的这种乘积）​，而且其每个分支上吊着的子活动体也都平衡。请设计一个函数，它检查一个二叉活动体是否平衡。
d.假定我们改变活动体的表示，采用下面的构造方式：
```javascript
function make_mobile(left, right) {
    return pair(left, right)
}
function make_branch(length, structure) {
    return pair(length, structure)
}
```
你需要对自己的程序做多少修改，才能把它改为使用这种新表示？

## 解答
* 题目的意思为，对于输入的序列，是活动体和分支的组合。对于读入的任意一个pair，该pair可能是二叉活动体，也可能是分支，区分活动体和分支通过head(pair)是不是数字来判断。
* a: 选择函数
```python
def left_branch(m):
    return head(m)
def right_branch(m):
    return head(tail(m))
def branch_length(b):
    return head(b)
def branch_structure(b):
    return head(tail(b))
```
* b: total_weight
```python
def check_num(x):
    return isinstance(x,int) or isinstance(x,float) 
def total_weight(mo):
    # check if a branch
    if check_num(branch_length(mo)):
        # check if a structure
        if check_num(branch_structure(mo)):
            return branch_structure(mo)
        else:
            return total_weight(branch_structure(mo))
    else: # else mobile
        return total_weight(left_branch(mo))+total_weight(right_branch(mo))
```
* c: check_balance
```python
def check_balance(mo):
    if not(check_num(branch_length(mo))): # mobile
        left_moment,left_weight,left_balance = check_balance(left_branch(mo))
        right_moment,right_weight,right_balance =  check_balance(right_branch(mo))
        if not(left_balance) or not(right_balance) or left_moment != right_moment:
            return (0,0,False)
        else:
            return (0,left_weight+right_weight,True)
    else: # branch 
        if check_num(branch_structure(mo)):
            return (branch_length(mo)*branch_structure(mo),branch_structure(mo),True)
        else: # branch-mobile
            _, weight,balance = check_balance(branch_structure(mo))
            return (branch_length(mo)*weight,weight,balance)
```
* d: 仅需要修改选择函数即可。
```python
def left_branch(m):
    return head(m)
def right_branch(m):
    return tail(m)
def branch_length(b):
    return head(b)
def branch_structure(b):
    return tail(b)
```
* 附上简单的测试代码:
```python
# 测试
mo1 = ((10, 5), (15, 8))
mo2 = ((10, 5), (15, ((20, 3), (10, 6))))
mo3 = ((10, ((5, 2), (10, 1))), (10, ((5, 2), (10, 1))))
mo4 = ((10, ((5, 2), (3, 3))), (15, ((6, 3), (2, 2))))

print("weight:", total_weight(mo1))  # 13
print("balance:", check_balance(mo1))  # False
print("weight:", total_weight(mo2))  # 14
print("balance:", check_balance(mo2))  # False
print("weight:", total_weight(mo3))  # 6
print("balance:", check_balance(mo3))  # True
print("weight:", total_weight(mo4))  # 10
print("balance:", check_balance(mo4))  # False
```
* rust版本的代码如下:
```rust
//依赖代码见习题2.17
fn left_branch<T: Clone + Debug>(l: &List<T>) -> &List<T> {
    l.head()
}
fn right_branch<T: Clone + Debug>(l: &List<T>) -> &List<T> {
    l.tail().head()
}
fn branch_length<T: Clone + Debug>(l: &List<T>) -> &List<T> {
    l.head()
}
fn branch_structure<T: Clone + Debug>(l: &List<T>) -> &List<T> {
    l.tail().head()
}
fn branch_or_mobile<T: Clone + Debug>(x: &List<T>) -> bool {
    match x {
        List::Cons(left, _) => matches!(**left, List::V(_)), // branch
        List::V(_) => true,                                  //branch structure weight
        _ => false,
    }
}
fn total_weight<T>(mo: &List<T>) -> T
where
    T: Clone + Debug + Num + Display,
{
    if branch_or_mobile(mo) {
        if branch_or_mobile(branch_structure(mo)) {
            match branch_structure(mo) {
                List::V(weight) => (*weight).clone(),
                _ => panic!("invalid branch structure"),
            }
        } else {
            total_weight(branch_structure(mo))
        }
    } else {
        total_weight(left_branch(mo)) + total_weight(right_branch(mo))
    }
}
fn check_balance<T: Copy>(mo: &List<T>) -> bool
where
    T: Clone + Debug + Num + Display,
{
    fn balance_iter<T: Copy>(mo: &List<T>) -> (T, T, bool)
    where
        T: Clone + Debug + Num + Display,
    {
        let get_value = |x: &List<T>| match x {
            List::V(value) => *value,
            _ => panic!("invalid branch structure"),
        };
        if branch_or_mobile(mo) {
            //branch
            if branch_or_mobile(branch_structure(mo)) {
                let weight = get_value(branch_structure(mo));
                let moment = get_value(branch_length(mo)) * weight;
                (moment, weight, true)
            } else {
                //branch-mobile
                let (_, weight, balance) = balance_iter(branch_structure(mo));
                (get_value(branch_length(mo)) * weight, weight, balance)
            }
        } else {
            //mobile
            let (left_moment, left_weight, left_balance) = balance_iter(left_branch(mo));
            if !left_balance {
                //quick return
                return (T::zero(), T::zero(), false);
            }
            let (right_moment, right_weight, right_balance) = balance_iter(right_branch(mo));
            return (
                T::zero(),
                left_weight + right_weight,
                right_balance && (left_moment == right_moment),
            );
        }
    }
    let (_, _, flag) = balance_iter(mo);
    flag
}
fn main() {
    use List::{Cons, Nil, V};
    let mo1 = List::from_slice(&[
        List::from_slice(&[V(10), V(5)]),
        List::from_slice(&[V(15), V(8)]),
    ]);

    let mo2 = List::from_slice(&[
        List::from_slice(&[V(10), V(5)]),
        List::from_slice(&[
            V(15),
            List::from_slice(&[
                List::from_slice(&[V(20), V(3)]),
                List::from_slice(&[V(10), V(6)]),
            ]),
        ]),
    ]);

    let mo3 = List::from_slice(&[
        List::from_slice(&[
            V(10),
            List::from_slice(&[
                List::from_slice(&[V(5), V(2)]),
                List::from_slice(&[V(10), V(1)]),
            ]),
        ]),
        List::from_slice(&[
            V(10),
            List::from_slice(&[
                List::from_slice(&[V(5), V(2)]),
                List::from_slice(&[V(10), V(1)]),
            ]),
        ]),
    ]);

    let mo4 = List::from_slice(&[
        List::from_slice(&[
            V(10),
            List::from_slice(&[
                List::from_slice(&[V(5), V(2)]),
                List::from_slice(&[V(3), V(3)]),
            ]),
        ]),
        List::from_slice(&[
            V(15),
            List::from_slice(&[
                List::from_slice(&[V(6), V(3)]),
                List::from_slice(&[V(2), V(2)]),
            ]),
        ]),
    ]);
    println!("mo1 weight: {}", total_weight(&mo1)); // 13
    println!("mo1 balance: {}", check_balance(&mo1)); // false

    println!("mo2 weight: {}", total_weight(&mo2)); // 14
    println!("mo2 balance: {}", check_balance(&mo2)); // false

    println!("mo3 weight: {}", total_weight(&mo3)); // 6
    println!("mo3 balance: {}", check_balance(&mo3)); // true

    println!("mo4 weight: {}", total_weight(&mo4)); // 10
    println!("mo4 balance: {}", check_balance(&mo4)); // false
}
```
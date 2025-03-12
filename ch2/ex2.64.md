# 2.3.3 实例：集合的表示
## 练习2.64
下面的函数list_to_tree把一个有序表变换为一棵平衡二叉树。其中辅助函数partial_tree以整数n和一个至少包含n个元素的表为参数，构造出一棵包含该表前n个元素的平衡树。由partial_tree返回的结果是一个序对（用pair构造）​，其head是构造出的树，其tail是没有包含在树里那些元素的表。
```javascript
function entry(tree) { return head(tree); }

function left_branch(tree) { return head(tail(tree)); }

function right_branch(tree) { return head(tail(tail(tree))); }

function make_tree(entry, left, right) { 
    return list(entry, left, right);
}

function list_to_tree(elements) {
    return head(partial_tree(elements, length(elements)));
}
function partial_tree(elts, n) {
    if (n === 0) {
        return pair(null, elts);
    } else {
        const left_size = math_floor((n - 1) / 2);
        const left_result = partial_tree(elts, left_size);
        const left_tree = head(left_result);
        const non_left_elts = tail(left_result);
        const right_size = n - (left_size + 1);
        const this_entry = head(non_left_elts);
        const right_result = partial_tree(tail(non_left_elts), right_size);
        const right_tree = head(right_result);
        const remaining_elts = tail(right_result);
        return pair(make_tree(this_entry, left_tree, right_tree),
                    remaining_elts);
    }
}
```
a.请简要并尽可能清楚地解释为什么partial_tree能完成所需的工作。请画出把list_to_tree应用于表list(1, 3, 5, 7, 9, 11)生成的树。
b.list_to_tree转换n个元素的表，所需的步数以什么量级增长？

## 解答
* a: 可使用归纳法证明,如下:
    * 易知当n=[0,1]时均满足条件.
        * 当n=2时,`left_result=paritial_tree(elts, 0) && right_result=paritial_tree(elts, 1)`,左子树和右子树子问题均满足条件,`this_entry(head(non_left_elts))`会取出比right_reult更靠前的数字(上升序列表中即更小的数字),`pair(make_tree())`仍满足条件.
        * 当n=3时,`left_result=paritial_tree(elts, 1) && right_result=paritial_tree(elts, 1)`,左子树和右子树子问题均满足条件,`this_entry(head(non_left_elts))`会取出比right_reult更靠前的数字(上升序列表中即更小的数字),`pair(make_tree())`仍满足条件.
    * 现在设n=k,且由递推可知,left_result子问题已正确求解,right_result子问题也已正确求解,且`this_entry(head(non_left_elts))`会取出比right_reult更靠前的数字(上升序列表中即更小的数字),且左右子树的size符合平衡条件,所以`pair(make_tree())`仍满足条件.故得证.
    * ist_to_tree应用于表list(1, 3, 5, 7, 9, 11)生成的树如下:
        ```
        // (5, ((1, (Nil, ((3, (Nil, (Nil, Nil))), Nil))), ((9, ((7, (Nil, (Nil, Nil))), ((11, (Nil, (Nil, Nil))), Nil))), Nil)))
        //                     5
        //          1                       9
        // Nil             3       7               11
        ```
* b: 因为每个节点都需要添加到树中,故步数增长为$O(n)$.
    * 对比二分查找的时间复杂度$O(logn)$:二分查找也是每个子问题的规模缩小一半,但并不访问所有元素,例如若数据在left_branch,则right_branch就会被彻底忽略.
* rust代码如下:
```rust
// 其余依赖代码见习题2.53
fn entry(tree: &List) -> &List {
    return tree.head();
}
fn left_branch(tree: &List) -> &List {
    return tree.tail().head();
}
fn right_branch(tree: &List) -> &List {
    return tree.tail().tail().head();
}
fn make_tree(entry: List, left: List, right: List) -> List {
    list![entry, left, right]
}
fn list_to_tree(elements: &List) -> List {
    partial_tree(elements, elements.length()).head().clone()
}
fn partial_tree(elts: &List, n: usize) -> List {
    if n == 0 {
        return List::pair(List::Nil, elts.clone());
    } else {
        let left_size = (n - 1) / 2;
        let left_result = partial_tree(elts, left_size);
        let left_tree = left_result.head();
        let non_left_elts = left_result.tail();
        let right_size = n - left_size - 1;
        let this_entry = non_left_elts.head();
        let right_result = partial_tree(non_left_elts.tail(), right_size);
        let right_tree = right_result.head();
        let remaining_elts = right_result.tail();
        List::pair(
            make_tree(this_entry.clone(), left_tree.clone(), right_tree.clone()),
            remaining_elts.clone(),
        )
    }
}
// 测试用例
fn main() {
    println!("{}", list_to_tree(&v![1, 3, 5, 7, 9, 11]));
    let tree = list_to_tree(&v![1, 3, 5, 7, 9, 11]);
    println!("\t\t    {}", entry(&tree));
    println!(
        "\t{}\t\t\t{}",
        entry(left_branch(&tree)),
        entry(right_branch(&tree))
    );
    println!(
        "{}\t\t{}\t{}\t\t{}",
        entry(left_branch(left_branch(&tree))),
        entry(right_branch(left_branch(&tree))),
        entry(left_branch(right_branch(&tree))),
        entry(right_branch(right_branch(&tree)))
    );
}
```
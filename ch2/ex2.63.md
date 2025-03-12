# 2.3.3 实例：集合的表示
## 练习2.63
下面两个函数都能把树变换为表：
```javascript
function tree_to_list_1(tree) {
    return is_null(tree)
        ? null
        : append(tree_to_list_1(left_branch(tree)),
              pair(entry(tree),
                  tree_to_list_1(right_branch(tree))));
}
function tree_to_list_2(tree) {
    function copy_to_list(tree, result_list) {
        return is_null(tree)
            ? result_list //注意此处不是返回null,而是返回result_list,从而避免了引入过多null
            : copy_to_list(left_branch(tree),
                  pair(entry(tree),
                      copy_to_list(right_branch(tree), result_list)));
    }
    return copy_to_list(tree, null);
}
```
a.这两个函数对所有的树都生成同样的结果吗？如果不是，它们生成的结果有什么不同？它们对图2.16中的那些树生成怎样的表？
b.把n个结点的平衡树变换为表时，这两个函数所需的步数具有同样量级的增长速度吗？如果不一样，哪个增长得慢些？

参考代码:
```javascript
function entry(tree) { return head(tree); }
function left_branch(tree) { return head(tail(tree)); }
function right_branch(tree) { return head(tail(tail(tree))); }
function make_tree(entry, left, right) { 
    return list(entry, left, right);
}
```

## 解答
* a: 这两个函数生成的结果一致.
    * tree_to_list_1函数为典型的中序遍历(左中右).
    * tree_to_list_2函数首先会对参数求值,也就是先对右子树求值,但因为递归过程中将结果存至result,并在函数逐层返回时,将entry添加到list的头部,再添加left_branch,所以执行结果的顺序为中序遍历(左中右).
    * 对于图2.16中的树,两个函数的生成结果为:list![1,3,5,7,9,11].(代码略)
* b: 从访问节点的角度来考虑,具有一致的算法复杂度;但在实际执行过程中,tree_to_list_2的步数更少,增长的更慢(anyway,如果append具有$O(1)$的复杂度,两个函数就具有同样量级的增长速度了,这完全受限于具体实现).
    * 假设为节点树为$n$,深度为$\log(n)$的平衡树,对于tree_to_list_1函数,递归深度最大为$\log(n)$.
    * 对于tree_to_list_2函数,第一次递归迭代时,会首先递归迭代计算right_branch至结束,right_branch的递归深度最大为$\log(n)$.当right_branch返回时,根节点的右子树已全部计算完成.tree_to_list_2接下来会去递归迭代计算left_branch,深度同样为$\log(n)$.故,tree_to_list_2函数的递归深度最大为$\log(n)$.
    * 从节点的数量考虑,tree_to_list_1对每个节点同样也只访问一次,但是结合append的代码,每次执行append操作,都会对list1(左子树)进行遍历,从而新增了很多冗余的pair操作.以pair操作次数计算步数的话,在树的每一层,左子树的节点均约等于$n/2$(以i层为例,左子树的节点数为总节点数-(i-1)层以上的所有节点数,再除以2),而树的深度为$\log(n)$,所以,执行pair的次数为$(n/2)*\log(n)$,即$$O(n\log(n))$.
        * append函数:
        ```javascript
        function append(list1, list2) {
            return is_null(list1)
            ? list2
            : pair(head(list1), append(tail(list1), list2));
        }
    * 对于tree_to_list_2函数,每次递归迭代都会将一个节点pair添加至result,所以,tree_to_list_2函数的步数与节点数成正比,为$O(n)$.
    
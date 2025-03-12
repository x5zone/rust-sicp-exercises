# 2.3.3 实例：集合的表示
## 练习2.65
利用练习2.63和练习2.64的结果，给出对采用（平衡）二叉树方式实现的集合的union_set和intersection_set操作的Θ(n)实现。

## 解答
* 习题2.63,习题2.64,习题2.64中的函数的时间复杂度均为$O(n)$,依次调用这些函数即可完成二叉树集合的交集和并集,且时间复杂度还是$O(n)$.
* rust代码如下&输出如下:
```rust
// 其余依赖代码见习题2.53&习题2.63&习题2.64
fn unison_set_tree(x: &List, y: &List) -> List {
    if x.is_empty() {
        y.clone()
    } else if y.is_empty() {
        x.clone()
    } else {
        let x_ord_list = tree_to_list(x);
        let y_ord_list = tree_to_list(y);
        let union_list = union_set_ord(&x_ord_list, &y_ord_list);
        list_to_tree(&union_list)
    }
}
fn intersection_set_tree(x: &List, y: &List) -> List {
    if x.is_empty() || y.is_empty() {
        List::Nil
    } else {
        let x_ord_list = tree_to_list(x);
        let y_ord_list = tree_to_list(y);
        let intersection_list = intersection_set_ord(&x_ord_list, &y_ord_list);
        list_to_tree(&intersection_list)
    }
}
fn tree_to_list(tree: &List) -> List {
    fn copy_to_list(tree: &List, result: List) -> List {
        if tree.is_empty() {
            // return result避免了再转换为列表时,引入了过多的Nil
            return result;
        } else {
            let left_tree = left_branch(tree);
            let right_tree = right_branch(tree);
            let this_entry = entry(tree);
            let right_reulst = copy_to_list(right_tree, result);
            copy_to_list(left_tree, List::pair(this_entry.clone(), right_reulst))
        }
    }
    copy_to_list(tree, List::Nil)
}
fn union_set_ord(x: &List, y: &List) -> Box<List> {
    if x.is_empty() {
        Box::new(y.clone())
    } else if y.is_empty() {
        Box::new(x.clone())
    } else if x.head().get_value() == y.head().get_value() {
        Box::new(List::pair(
            x.head().clone(),
            union_set_ord(x.tail(), y.tail()).as_ref().clone(),
        ))
    } else if x.head().get_value() < y.head().get_value() {
        Box::new(List::pair(
            x.head().clone(),
            union_set_ord(x.tail(), y).as_ref().clone(),
        ))
    } else {
        // x.head() > y.head()
        Box::new(List::pair(
            y.head().clone(),
            union_set_ord(x, y.tail()).as_ref().clone(),
        ))
    }
}
fn intersection_set_ord(x: &List, y: &List) -> Box<List> {
    if x.is_empty() || y.is_empty() {
        Box::new(List::Nil)
    } else if x.head().get_value() == y.head().get_value() {
        Box::new(List::pair(
            x.head().clone(),
            intersection_set_ord(x.tail(), y.tail()).as_ref().clone(),
        ))
    } else if x.head().get_value() < y.head().get_value() {
        intersection_set_ord(x.tail(), y)
    } else {
        // x.head() > y.head()
        intersection_set_ord(x, y.tail())
    }
}
fn main() {
    println!("test1:");
    let tree1 = List::Nil;
    let tree2 = List::Nil;

    let union_result = unison_set_tree(&tree1, &tree2);
    let intersection_result = intersection_set_tree(&tree1, &tree2);

    print_tree::<i32>(&union_result); // 应该输出：Empty Tree
    print_tree::<i32>(&intersection_result); // 应该输出：Empty Tree
    println!("test2:");
    let tree1 = list_to_tree(&v![1, 3, 5, 7]);
    let tree2 = List::Nil;

    print_tree::<i32>(&tree1);
    print_tree::<i32>(&tree2);

    let union_result = unison_set_tree(&tree1, &tree2);
    let intersection_result = intersection_set_tree(&tree1, &tree2);

    print_tree::<i32>(&union_result); // 应该输出：Tree 1 的内容
    print_tree::<i32>(&intersection_result); // 应该输出：Empty Tree
    println!("test3:");
    let tree1 = list_to_tree(&v![1, 3, 5, 7]);
    let tree2 = list_to_tree(&v![3, 5, 8, 9]);

    print_tree::<i32>(&tree1);
    print_tree::<i32>(&tree2);
    let union_result = unison_set_tree(&tree1, &tree2);
    let intersection_result = intersection_set_tree(&tree1, &tree2);

    print_tree::<i32>(&union_result); // 应该输出：1 3 5 7 8 9 的树结构
    print_tree::<i32>(&intersection_result); // 应该输出：3 5 的树结构
    println!("test4:");
    let tree1 = list_to_tree(&v![1, 2, 3, 4]);
    let tree2 = list_to_tree(&v![1, 2, 3, 4]);

    print_tree::<i32>(&tree1);
    print_tree::<i32>(&tree2);

    let union_result = unison_set_tree(&tree1, &tree2);
    let intersection_result = intersection_set_tree(&tree1, &tree2);

    print_tree::<i32>(&union_result); // 应该输出：Tree 1 或 Tree 2 的内容
    print_tree::<i32>(&intersection_result); // 应该输出：Tree 1 或 Tree 2 的内容
    println!("test5:");
    let tree1 = list_to_tree(&v![1, 3, 5]);
    let tree2 = list_to_tree(&v![2, 4, 6]);

    print_tree::<i32>(&tree1);
    print_tree::<i32>(&tree2);

    let union_result = unison_set_tree(&tree1, &tree2);
    let intersection_result = intersection_set_tree(&tree1, &tree2);

    print_tree::<i32>(&union_result); // 应该输出：1 2 3 4 5 6 的树结构
    print_tree::<i32>(&intersection_result); // 应该输出：Empty Tree
}
// Output:
// test1:
// Empty Tree
// Empty Tree
// test2:
// 3
// 1 5
// . . . 7
// Empty Tree
// 3
// 1 5
// . . . 7
// Empty Tree
// test3:
// 3
// 1 5
// . . . 7
// 5
// 3 8
// . . . 9
// 5
// 1 8
// . 3 7 9
// 3
// . 5
// test4:
// 2
// 1 3
// . . . 4
// 2
// 1 3
// . . . 4
// 2
// 1 3
// . . . 4
// 2
// 1 3
// . . . 4
// test5:
// 3
// 1 5
// 4
// 2 6
// 3
// 1 5
// . 2 4 6
// Empty Tree
// 打印二叉树的函数
fn print_tree<T: Any + Debug + Display + Clone + 'static>(tree: &List) {
    if tree.is_empty() {
        println!("Empty Tree");
        return;
    }

    // 使用队列进行层序遍历
    let mut queue = VecDeque::new();
    queue.push_back(tree.clone());

    while !queue.is_empty() {
        let level_size = queue.len();
        let mut level = Vec::new();

        for _ in 0..level_size {
            if let Some(node) = queue.pop_front() {
                if node.is_empty() {
                    level.push(".".to_string()); // 用 "." 表示空节点
                } else {
                    let value = entry(&node).value_as::<T>().unwrap().clone();
                    level.push(format!("{}", value));

                    // 将左右子节点加入队列
                    queue.push_back(left_branch(&node).clone());
                    queue.push_back(right_branch(&node).clone());
                }
            }
        }

        // 打印当前层
        if !level.iter().all(|x| x == ".") {
            // 如果整层都是空节点，则停止打印
            println!("{}", level.join(" "));
        }
    }
}
```
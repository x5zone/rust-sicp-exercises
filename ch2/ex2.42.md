# 2.2.3 序列作为约定的接口
## 练习2.42
“八皇后谜题”问怎样把八个皇后摆在国际象棋盘上，使得没有一个皇后能攻击另一个（也就是说，任意两个皇后都不在同一行、同一列，或者同一斜线上）​。该谜题的一个解如图2.8所示。解决这个谜题的一种方法是按一个方向考虑棋盘，每次在一列中放入一个皇后。如果现在已经放好了k-1个皇后，第k个皇后就必须放在不会攻击任何已在棋盘上的皇后的位置。我们可以递归地描述这一处理过程：假定我们已经生成了在棋盘前k-1列放k-1个皇后的所有可能方法，现在对其中的每种方法，生成把下一皇后放在第k列中每一行的扩充集合。然后过滤它们，只留下使第k列的皇后与其他皇后相安无事的扩充。这样就生成了k个皇后放在前k列的所有安全序列。继续这一过程就能得到该谜题的所有解，而不是一个解。
我们把这个解法实现为一个函数queens，令它返回在n×n的棋盘上放好n个皇后的所有解的序列。函数queens有一个内部函数queen_cols，它返回在棋盘的前k列中放好皇后的所有位置的序列。
```javascript
function queens(board_size) {
    function queen_cols(k) {
        return k === 0
           ? list(empty_board)
           : filter(positions => is_safe(k, positions),
                    flatmap(rest_of_queens =>
                            map(new_row =>
                                adjoin_position(new_row, k, rest_of_queens),
                                enumerate_interval(1, board_size)),
                            queen_cols(k - 1)));
    }
    return queen_cols(board_size);
}
```
在这个函数里，参数rest_of_queens是在前k-1列放置k-1个皇后的一种方式，new_row是在第k列放置皇后时考虑的行编号。要完成这个程序，我们需要设计一种棋盘位置集合的表示方法；还要实现函数adjoin_position，其功能是把一个新的行列位置加入一个位置集合；还有empty_board表示空的位置集合。你还需要写一个函数is_safe，它确定在一个位置集合中，位于第k列的皇后相对于其他列的皇后是安全的。​（请注意，我们只需检查新皇后是否安全——其他皇后都已经保证相安无事了。​）

## 解答
* rust代码如下:
```rust
//依赖代码见习题2.17&2.36&2.40
impl<T> List<T>
where
    T: Clone + Debug,
{
    fn list_to_vec(list: &List<T>) -> Vec<T> {
        let mut vec = Vec::new();
        let mut current = list;
        while let List::Cons(value, next) = current {
            vec.push(value.value());
            current = next;
        }
        vec
    }
}
fn enumerate_interval(n: i32) -> List<i32> {
    let mut arr = Vec::new();
    for i in 1..=n {
        arr.push(List::V(i));
    }
    List::from_slice(&arr)
}
fn is_safe(k: i32, board_size: i32, positions: &List<i32>) -> bool {
    let krow = positions.head().value(); //假设k列在表头,即每次新增k+1时,都添加到表头
    let mut current = positions.tail();
    //(1,(2,(3,(4,Nil))))
    let mut i = 1;
    while let List::Cons(row, next) = current {
        let irow = row.value();
        if irow == krow {
            // 在同一行
            return false;
        }
        if (krow + i <= board_size && krow + i == irow) || (krow - i > 0 && krow - i == irow) {
            // 在同一斜线(例如k-1列，斜线位置在krow+1和krow-1)
            return false;
        }
        i += 1;
        current = next;
    }
    return true;
}
fn adjoin_position(new_row: i32, k: i32, rest_of_queens: &List<i32>) -> List<i32> {
    List::pair(List::V(new_row), List::Nil).append(rest_of_queens)
}
fn queens(board_size: i32) -> List<i32> {
    fn queen_cols(k: i32, board_size: i32) -> List<i32> {
        if k == 0 {
            List::pair(List::Nil, List::Nil)
        } else {
            queen_cols(k - 1, board_size)
                .flatmap(|rest_of_queens| {
                    enumerate_interval(board_size)
                        .map(|new_row| adjoin_position(new_row.value(), k, rest_of_queens))
                })
                .filter(|positions| is_safe(k, board_size, positions))
        }
    }
    return queen_cols(board_size, board_size);
}
fn main() {
    use List::*;
    let pretty_solutions = |solutions| {
        let mut result = Vec::new();
        let mut current = &solutions;
        while let Cons(solution, next) = current {
            result.push(List::list_to_vec(solution));
            current = next;
        }
        result
    };
    println!("queens(4) :{:?}", pretty_solutions(queens(4)));
    println!("queens(5) :{:?}", pretty_solutions(queens(5)));
    println!("queens(6) :{:?}", pretty_solutions(queens(6)));
    println!("queens(7) :{:?}", pretty_solutions(queens(7)));
    return;
}
// Output
// queens(4) :[[2, 4, 1, 3], [3, 1, 4, 2]]
// queens(5) :[[3, 5, 2, 4, 1], [4, 2, 5, 3, 1], [4, 1, 3, 5, 2], [5, 3, 1, 4, 2], [1, 4, 2, 5, 3], [5, 2, 4, 1, 3], [1, 3, 5, 2, 4], [2, 5, 3, 1, 4], [2, 4, 1, 3, 5], [3, 1, 4, 2, 5]]
// queens(6) :[[2, 4, 6, 1, 3, 5], [3, 6, 2, 5, 1, 4], [4, 1, 5, 2, 6, 3], [5, 3, 1, 6, 4, 2]]
// queens(7) :[[3, 5, 7, 2, 4, 6, 1], [4, 7, 3, 6, 2, 5, 1], [5, 2, 6, 3, 7, 4, 1], [6, 4, 2, 7, 5, 3, 1], [4, 6, 1, 3, 5, 7, 2], [5, 1, 4, 7, 3, 6, 2], [6, 3, 7, 4, 1, 5, 2], [6, 4, 7, 1, 3, 5, 2], [6, 3, 1, 4, 7, 5, 2], [6, 3, 5, 7, 1, 4, 2], [7, 5, 3, 1, 6, 4, 2], [5, 1, 6, 4, 2, 7, 3], [6, 2, 5, 1, 4, 7, 3], [7, 4, 1, 5, 2, 6, 3], [1, 6, 4, 2, 7, 5, 3], [5, 7, 2, 4, 6, 1, 3], [4, 7, 5, 2, 6, 1, 3], [1, 5, 2, 6, 3, 7, 4], [3, 1, 6, 2, 5, 7, 4], [2, 7, 5, 3, 1, 6, 4], [6, 1, 3, 5, 7, 2, 4], [5, 7, 2, 6, 3, 1, 4], [7, 3, 6, 2, 5, 1, 4], [4, 1, 3, 6, 2, 7, 5], [3, 1, 6, 4, 2, 7, 5], [7, 2, 4, 6, 1, 3, 5], [1, 4, 7, 3, 6, 2, 5], [2, 6, 3, 7, 4, 1, 5], [3, 7, 2, 4, 6, 1, 5], [1, 3, 5, 7, 2, 4, 6], [2, 5, 3, 1, 7, 4, 6], [2, 5, 7, 4, 1, 3, 6], [2, 4, 1, 7, 5, 3, 6], [2, 5, 1, 4, 7, 3, 6], [3, 7, 4, 1, 5, 2, 6], [4, 2, 7, 5, 3, 1, 6], [2, 4, 6, 1, 3, 5, 7], [3, 6, 2, 5, 1, 4, 7], [4, 1, 5, 2, 6, 3, 7], [5, 3, 1, 6, 4, 2, 7]]
```
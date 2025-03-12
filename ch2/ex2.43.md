# 2.2.3 序列作为约定的接口
## 练习2.43
Louis Reasoner做练习2.42时遇到了麻烦，他的queens函数看起来能行，但却运行得极慢（Louis居然无法忍耐到它解出6×6棋盘的问题）​。Louis请EvaLu Ator帮忙时，她指出他在flatmap里交换了嵌套映射的顺序，把它写成了：
```javascript
flatmap(new_row =>
        map(rest_of_queens =>
            adjoin_position(new_row, rest_of_queens),
            queens(k - 1)),
        enumerate_interval(1, board_size));
```        
请解释，为什么这样交换顺序会使程序运行得非常慢。请估算， 用Louis的程序去解决八皇后问题大约需要多少时间，假定练习2.42中的程序需用时间T求解这一谜题。

## 解答
* rust代码如下:
```rust
fn queens1(board_size: i32) -> List<i32> {
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
fn queens2(board_size: i32) -> List<i32> {
    fn queen_cols(k: i32, board_size: i32) -> List<i32> {
        if k == 0 {
            List::pair(List::Nil, List::Nil)
        } else {
            enumerate_interval(board_size)
                .flatmap(|new_row| {
                    queen_cols(k - 1, board_size)
                        .map(|rest_of_queens| adjoin_position(new_row.value(), k, rest_of_queens))
                })
                .filter(|positions| is_safe(k, board_size, positions))
        }
    }
    return queen_cols(board_size, board_size);
}
```
* 对比代码可知，版本1仅调用一次queen_cols(k-1)；而对于版本2，假设是6*6的棋盘，flatmap展开enumerate_interval有6个new_row，其中每个new_row在flatmap的op中，都会调用一次queen_cols，多执行了5次。假设版本1执行时间为T，那么版本2代码的执行时间为6T。
* 综上，假设T是版本1的运行时间，那么版本2的运行时间是 n⋅T(n为棋盘大小)。对于 6×6 棋盘，版本2的运行时间为 6T，而对于 8×8 棋盘，运行时间为 8T。

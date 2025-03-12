# 1.2.2 树形递归
## 练习1.12
下面的数值模式称为帕斯卡三角形：
```
     1
    1 1
   1 2 1
  1 3 3 1
 1 4 6 4 1
```
三角形两个斜边上的数都是1，内部的每个数是位于它上面的两个数之和。请写一个函数，它通过一个递归计算过程计算帕斯卡三角形。

## 解答
- 这道习题是希望给出某个具体位置的数值，并不是让画出整个三角形=。=
```rust
fn main() {
    for row in 0..=4 {
        for col in 0..=row {
            print!("{} ",yh_triangle(col,row)); 
        }
        println!();
    }
}
fn yh_triangle(col:i32,row:i32) -> i32{
    if col == 0 || row == col {
        return 1;
    }
    return yh_triangle(col-1,row-1) + yh_triangle(col,row-1);
}
```
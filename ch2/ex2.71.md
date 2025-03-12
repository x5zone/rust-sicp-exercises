# 2.3.4 实例：Huffman编码树
## 练习2.71
假定我们有一棵n个符号的字母表的Huffman树，其中各个符号的相对频度分别是$1, 2,4,…, 2^{n-1}$。请对n=5和n=10勾勒出树的形式。对这样的树（对一般的n）​，编码出现最频繁的符号用了多少个二进制位？最不频繁的符号呢？

## 解答
* 如输出所示,编码最频繁的用1位二进制,编码最不频繁的使用n-1位二进制.
* huffman树绘图可参看输出位编码,此处省略.
* rust代码&输出如下:
```rust
// 其余依赖代码见习题2.53&习题2.67&习题2.68&习题2.69
fn main() {
    let m1 = List::from_iterator(&mut (1..=5).map(|i| v![i.to_string(), 2_i32.pow(i - 1)]));
    let m2 = List::from_iterator(&mut (1..=10).map(|i| v![i.to_string(), 2_i32.pow(i - 1)]));
    println!("{}", m1);
    let m1_tree = generate_huffman_tree(&m1);
    println!("{}", m1_tree);
    (1..=5).for_each(|i| {
        let enc = encode(&list![v![i.to_string()]], &m1_tree);
        println!("{} encode-> {}, encode len:{}", i, enc, enc.length());
    });
    let m2_tree = generate_huffman_tree(&m2);
    println!("{}", m2_tree);
    (1..=10).for_each(|i| {
        let enc = encode(&list![v![i.to_string()]], &m2_tree);
        println!("{} encode-> {}, encode len:{}", i, enc, enc.length());
    });
}
// Output:
// ((1, (1, Nil)), ((2, (2, Nil)), ((3, (4, Nil)), ((4, (8, Nil)), ((5, (16, Nil)), Nil)))))
// (code_tree, ((code_tree, ((code_tree, ((code_tree, ((leaf, (1, (1, Nil))), ((leaf, (2, (2, Nil))), ((1, (2, Nil)), (3, Nil))))), ((leaf, (3, (4, Nil))), ((1, (2, (3, Nil))), (7, Nil))))), ((leaf, (4, (8, Nil))), ((1, (2, (3, (4, Nil)))), (15, Nil))))), ((leaf, (5, (16, Nil))), ((1, (2, (3, (4, (5, Nil))))), (31, Nil)))))
// 1 encode-> (0, (0, (0, (0, Nil)))), encode len:4
// 2 encode-> (0, (0, (0, (1, Nil)))), encode len:4
// 3 encode-> (0, (0, (1, Nil))), encode len:3
// 4 encode-> (0, (1, Nil)), encode len:2
// 5 encode-> (1, Nil), encode len:1
// (code_tree, ((code_tree, ((code_tree, ((code_tree, ((code_tree, ((code_tree, ((code_tree, ((code_tree, ((code_tree, ((leaf, (1, (1, Nil))), ((leaf, (2, (2, Nil))), ((1, (2, Nil)), (3, Nil))))), ((leaf, (3, (4, Nil))), ((1, (2, (3, Nil))), (7, Nil))))), ((leaf, (4, (8, Nil))), ((1, (2, (3, (4, Nil)))), (15, Nil))))), ((leaf, (5, (16, Nil))), ((1, (2, (3, (4, (5, Nil))))), (31, Nil))))), ((leaf, (6, (32, Nil))), ((1, (2, (3, (4, (5, (6, Nil)))))), (63, Nil))))), ((leaf, (7, (64, Nil))), ((1, (2, (3, (4, (5, (6, (7, Nil))))))), (127, Nil))))), ((leaf, (8, (128, Nil))), ((1, (2, (3, (4, (5, (6, (7, (8, Nil)))))))), (255, Nil))))), ((leaf, (9, (256, Nil))), ((1, (2, (3, (4, (5, (6, (7, (8, (9, Nil))))))))), (511, Nil))))), ((leaf, (10, (512, Nil))), ((1, (2, (3, (4, (5, (6, (7, (8, (9, (10, Nil)))))))))), (1023, Nil)))))
// 1 encode-> (0, (0, (0, (0, (0, (0, (0, (0, (0, Nil))))))))), encode len:9
// 2 encode-> (0, (0, (0, (0, (0, (0, (0, (0, (1, Nil))))))))), encode len:9
// 3 encode-> (0, (0, (0, (0, (0, (0, (0, (1, Nil)))))))), encode len:8
// 4 encode-> (0, (0, (0, (0, (0, (0, (1, Nil))))))), encode len:7
// 5 encode-> (0, (0, (0, (0, (0, (1, Nil)))))), encode len:6
// 6 encode-> (0, (0, (0, (0, (1, Nil))))), encode len:5
// 7 encode-> (0, (0, (0, (1, Nil)))), encode len:4
// 8 encode-> (0, (0, (1, Nil))), encode len:3
// 9 encode-> (0, (1, Nil)), encode len:2
// 10 encode-> (1, Nil), encode len:1
```
# 2.3.4 实例：Huffman编码树
## 练习2.70
下面带有相对频度的8个符号的字母表，是为了有效编码20世纪50年代的摇滚歌曲中的词语而设计的。​（注意，​“字母表”中的“符号”不必是单个字母。​）
```
A 	2 	        NA        16
BOOM 	1 	 	SHA 	  3
GET 	2 	 	YIP 	  9
JOB 	2 	 	WAH 	  1 
```
请用（练习2.69的）generate_huffman_tree函数生成对应的Huffman树，用（练习2.68的）encode编码下面这个消息：
```
Get a job
Sha na na na na na na na na
Get a job
Sha na na na na na na na na
Wah yip yip yip yip yip yip yip yip yip
Sha boom
```
这一编码需要多少个二进制位？如果对这8个符号的字母表采用定长编码，完成这个歌曲的编码最少需要多少个二进制位？

## 解答
* huffman编码长度为84;若采用定长编码,则每个单词需要3位来表示,共36个单词,即需要108个二进制位.
* rust代码&输出如下:
```rust
// 其余依赖代码见习题2.53&习题2.67&习题2.68&习题2.69
fn main() {
    let sample_pairs: List = list![
        v!["a".to_string(), 2],
        v!["na".to_string(), 16],
        v!["boom".to_string(), 1],
        v!["sha".to_string(), 3],
        v!["get".to_string(), 2],
        v!["yip".to_string(), 9],
        v!["job".to_string(), 2],
        v!["wah".to_string(), 1]
    ];
    let message = List::from_iterator(
        &mut "Get a job
Sha na na na na na na na na
Get a job
Sha na na na na na na na na
Wah yip yip yip yip yip yip yip yip yip
Sha boom"
            .split_whitespace()
            .map(|s| v![s.to_string().to_ascii_lowercase()]),
    );

    let sample_tree = generate_huffman_tree(&sample_pairs);
    println!("{}", sample_tree);

    println!("{}", encode(&message, &sample_tree));
    println!(
        "message len {}, encode len {}",
        message.length(),
        encode(&message, &sample_tree).length()
    );
    println!("{}", decode(&encode(&message, &sample_tree), &sample_tree));
}
// Output:
// (code_tree, ((leaf, (na, (16, Nil))), ((code_tree, ((leaf, (yip, (9, Nil))), ((code_tree, ((code_tree, ((leaf, (a, (2, Nil))), ((code_tree, ((leaf, (wah, (1, Nil))), ((leaf, (boom, (1, Nil))), ((wah, (boom, Nil)), (2, Nil))))), ((a, (wah, (boom, Nil))), (4, Nil))))), ((code_tree, ((leaf, (sha, (3, Nil))), ((code_tree, ((leaf, (job, (2, Nil))), ((leaf, (get, (2, Nil))), ((job, (get, Nil)), (4, Nil))))), ((sha, (job, (get, Nil))), (7, Nil))))), ((a, (wah, (boom, (sha, (job, (get, Nil)))))), (11, Nil))))), ((yip, (a, (wah, (boom, (sha, (job, (get, Nil))))))), (20, Nil))))), ((na, (yip, (a, (wah, (boom, (sha, (job, (get, Nil)))))))), (36, Nil)))))
// (1, (1, (1, (1, (1, (1, (1, (0, (0, (1, (1, (1, (1, (0, (1, (1, (1, (0, (0, (0, (0, (0, (0, (0, (0, (0, (1, (1, (1, (1, (1, (1, (1, (0, (0, (1, (1, (1, (1, (0, (1, (1, (1, (0, (0, (0, (0, (0, (0, (0, (0, (0, (1, (1, (0, (1, (0, (1, (0, (1, (0, (1, (0, (1, (0, (1, (0, (1, (0, (1, (0, (1, (0, (1, (0, (1, (1, (1, (0, (1, (1, (0, (1, (1, Nil))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))))
// message len 36, encode len 84
// (get, (a, (job, (sha, (na, (na, (na, (na, (na, (na, (na, (na, (get, (a, (job, (sha, (na, (na, (na, (na, (na, (na, (na, (na, (wah, (yip, (yip, (yip, (yip, (yip, (yip, (yip, (yip, (yip, (sha, (boom, Nil))))))))))))))))))))))))))))))))))))
```

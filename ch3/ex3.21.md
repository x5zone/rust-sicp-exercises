# 3.3.2 队列的表示
## 练习3.21
Ben Bitdiddle决定对上面描述的队列实现做些测试，他顺序地给JavaScript解释器输入了下面的语句，并查看执行情况：
```javascript
const q1 = make_queue(); 

insert_queue(q1, "a"); 

[["a", null], ["a", null]]

insert_queue(q1, "b"); 

[["a", ["b", null]], ["b", null]]

delete_queue(q1); 

[["b", null], ["b", null]]

delete_queue(q1); 

[null, ["b", null]]
```
“不对，​”他抱怨说，​“解释器的响应说明最后一个项被插入队列两次，因为我把两个项都删除了，但是第二个还在那里。因此这时该表还不空，但它应该已经空了。​”Eva Lu Ator说是Ben错误理解了出现的情况。​“这里根本没有一个项进入队列两次的事，​”她解释说，​“问题只是标准的JavaScript打印函数不知道如何理解队列的表示。如果你希望看到队列的正确打印结果，就必须自己为队列定义一个打印函数。​”请解释Eva Lu说的是什么意思，特别是说明，为什么Ben的例子产生上面的输出结果。请定义一个函数print_queue，它以一个队列为输入，打印出队列里的项的序列。

## 解答

#### 问题分析

Eva Lu Ator的解释是正确的。Ben遇到的问题源于以下两个原因：

###### 1. 队列的表示：
* 队列是通过两个指针（`front_ptr` 和 `rear_ptr`）来表示的。
* 删除操作只修改了队列的头指针（`front_ptr`），而队列的尾指针（`rear_ptr`）仍然指向之前的最后一个元素。这种设计是合理的，因为队列的操作只关心头指针是否为空来判断队列是否为空，而尾指针的状态不会影响队列的逻辑。

###### 2. 标准打印函数的限制：
* JavaScript的默认打印函数无法正确解释这种队列表示。它会显示队列的内部结构，包括头指针和尾指针的内容，这可能导致误解。
* Ben看到的输出包含尾指针指向的内容，而他误以为这些内容仍然是队列的一部分。

#### 解决方案

为了让队列的内容更直观，我们可以定义一个自定义的打印函数`print_queue`，它通过打印`front_ptr`来显示队列中的元素序列。

#### 代码实现
```rust
use sicp_rs::ch3::ch3_3::{delete_queue, front_ptr, insert_queue, make_queue};
use sicp_rs::prelude::*;

// pub fn delete_queue(queue: &List) -> List {
//     if is_empty_queue(queue) {
//         panic_with_location("delete_queue called with an empty queue", queue)
//     } else {
//         set_front_ptr(queue, front_ptr(queue).tail());
//         queue.clone()
//     }
// }
fn print_queue(q: &List) {
    println!("{}", front_ptr(q))
}
fn main() {
    let q1 = make_queue();
    insert_queue(&q1, "a".to_listv());
    println!("{}", q1);
    insert_queue(&q1, "b".to_listv());
    println!("{}", q1);
    delete_queue(&q1);
    println!("{}", q1);
    delete_queue(&q1);
    println!("{}", q1);
    print_queue(&q1);
}
```
#### 输出结果
```
((a, Nil), (a, Nil))
((a, (b, Nil)), (b, Nil))
((b, Nil), (b, Nil))
(Nil, (b, Nil))
Nil
```
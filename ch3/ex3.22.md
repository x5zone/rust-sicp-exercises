# 3.3.2 队列的表示
## 练习3.22
除了可以用指针的序对表示队列外，我们也可以把队列构造为一个带有局部状态的函数。这里的局部状态由指向一个常规表的开始和结束的指针组成。这样，函数make_queue将具有下面的形式：
```javascript
function make_queue() {
    let front_ptr = ...;
    let rear_ptr = ...;
    ⟨⟨declarations of internal functions⟩⟩
    function dispatch(m) {……}
    return dispatch;    
}
```
请完成make_queue的声明，并提供采用这一表示方式的队列操作的实现。

## 解答
#### 消息传递风格的队列实现

消息传递风格是一种常见的设计模式，特别是在《SICP》中广泛使用。这种风格将数据结构的操作封装为消息，通过发送消息来操作和访问数据结构的内部状态。

#### 代码实现
在Rust中，由于所有权和借用规则的限制，实现消息传递风格的队列稍显复杂。以下是具体实现：
```rust
use std::{cell::RefCell, rc::Rc};

use sicp_rs::prelude::*;

fn make_queue() -> impl Fn(&str) -> ClosureWrapper { // ClosureWrapper：Rc<dyn Fn(&List) -> Option<List>>
    let front_ptr = Rc::new(RefCell::new(List::Nil));
    let rear_ptr = Rc::new(RefCell::new(List::Nil));

    let set_front_ptr = {
        let front_ptr = front_ptr.clone();
        move |item: List| *front_ptr.clone().borrow_mut() = item
    };
    let set_rear_ptr = {
        let rear_ptr = rear_ptr.clone();
        move |item: List| *rear_ptr.clone().borrow_mut() = item
    };
    let is_empty_queue = {
        let front_ptr = front_ptr.clone();
        move || front_ptr.borrow().is_empty()
    };
    let insert_queue = {
        let is_empty_queue = is_empty_queue.clone();
        let rear_ptr = rear_ptr.clone();
        let set_rear_ptr = set_rear_ptr.clone();
        let set_front_ptr = set_front_ptr.clone();
        move |item: List| {
            let new_pair = pair![item, List::Nil];
            if is_empty_queue() {
                set_front_ptr(new_pair.clone());
                set_rear_ptr(new_pair.clone());
            } else {
                rear_ptr.borrow().set_tail(new_pair.clone());
                set_rear_ptr(new_pair.clone());
            }
        }
    };
    let delete_queue = {
        let is_empty_queue = is_empty_queue.clone();
        let front_ptr = front_ptr.clone();
        let set_front_ptr = set_front_ptr.clone();
        move || {
            if is_empty_queue() {
                panic!("delete_queue called with an empty queue");
            } else {
                let new_front_ptr = front_ptr.borrow().tail();
                set_front_ptr(new_front_ptr.clone());
            }
        }
    };

    let dispatch = move |msg: &str| match msg {
        "insert_queue" => {
            let insert_queue = insert_queue.clone();
            ClosureWrapper::new(move |item: &List| {
                insert_queue(item.clone());
                Some("ok".to_listv())
            })
        }
        "delete_queue" => {
            let delete_queue = delete_queue.clone();
            ClosureWrapper::new(move |_| {
                delete_queue();
                Some("ok".to_listv())
            })
        }
        "print_queue" => {
            let front_ptr = front_ptr.clone();
            ClosureWrapper::new(move |_| {
                println!("{}", front_ptr.borrow());
                Some("ok".to_listv())
            })
        }
        _ => panic!("unknown message"),
    };
    dispatch
}
fn main() {
    let q1 = make_queue();
    q1("insert_queue").call(&"a".to_listv());
    q1("print_queue").call(&List::Nil);
    q1("insert_queue").call(&"b".to_listv());
    q1("print_queue").call(&List::Nil);
    q1("delete_queue").call(&List::Nil);
    q1("print_queue").call(&List::Nil);
    q1("delete_queue").call(&List::Nil);
    q1("print_queue").call(&List::Nil);
}
```

#### 输出结果
```
(a, Nil)
(a, (b, Nil))
(b, Nil)
Nil
```
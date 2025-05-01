# 3.3.2 队列的表示
## 练习3.23
双端队列(deque)也是数据项的序列，其中的项可以从前端或者后端插入和删除。双端队列的操作包括构造函数make_deque，谓词is_mpty_deque，选择函数front_deque和rear_deque，变动函数front_insert_deque、rear_insert_deque、front_delete_deque和rear_delete_deque。请说明如何用序对表示双端队列，并给出各个操作的实现。所有操作都应该在Θ(1)步内完成工作。
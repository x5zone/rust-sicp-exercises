import os

def count_lines_and_words(directory):
    total_lines = 0
    total_words = 0

    # 遍历目录及其子目录
    for root, _, files in os.walk(directory):
        for file in files:
            # 筛选以 "ex" 开头的 .md 文件
            if file.startswith("ex") and file.endswith(".md"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        total_lines += len(lines)
                        total_words += sum(len(line.split()) for line in lines)
                except Exception as e:
                    print(f"无法读取文件 {file_path}: {e}")

    return total_lines, total_words

if __name__ == "__main__":
    directory = "."  # 当前目录
    lines, words = count_lines_and_words(directory)
    print(f"总行数: {lines}")
    print(f"总字数: {words}")


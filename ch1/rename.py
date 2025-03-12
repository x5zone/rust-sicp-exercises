import os

def rename_md_files():
    # 获取当前目录下的所有文件
    files = os.listdir('.')
    
    for file in files:
        # 检查文件是否以 "练习" 开头并以 ".md" 结尾
        if file.startswith("练习") and file.endswith(".md"):
            # 构造新的文件名，将 "练习" 替换为 "ex"
            new_name = file.replace("练习", "ex", 1)  # 只替换第一个出现的 "练习"
            
            # 重命名文件
            os.rename(file, new_name)
            print(f"重命名: {file} -> {new_name}")

if __name__ == "__main__":
    rename_md_files()

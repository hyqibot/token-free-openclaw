# Nuitkatopyd.py
import os
import subprocess
import sys
from pathlib import Path

def compile_to_pyd(source_dir):
    """将目录下的所有.py文件编译成.pyd文件"""
    source_path = Path(source_dir)
    
    # 遍历目录中的所有Python文件
    for py_file in source_path.rglob("*.py"):
        # 跳过__init__.py文件
        if py_file.name == "__init__.py":
            continue
            
        # 跳过__pycache__目录
        if "__pycache__" in str(py_file):
            continue
            
        # 保存当前工作目录
        original_cwd = os.getcwd()
        
        try:
            # 切换到.py文件所在目录
            os.chdir(py_file.parent)
            
            # 构建编译命令
            cmd = [
                sys.executable, "-m", "nuitka",
                "--module",  # 编译为模块
                "--remove-output",  # 删除临时文件
                "--nofollow-imports",  # 不跟随导入
                "--no-pyi-file",  # 不生成.pyi文件
                py_file.name  # 文件名
            ]
            
            print(f"正在编译: {py_file.name}")
            
            # 执行编译命令
            result = subprocess.run(cmd, check=True, capture_output=True, text=True, timeout=6000)
            
            # 重命名生成的文件
            pyd_files = list(Path('.').glob(f"{py_file.stem}*.pyd"))
            if pyd_files:
                original_pyd = pyd_files[0]
                new_pyd_name = f"{py_file.stem}.pyd"
                original_pyd.rename(new_pyd_name)
                print(f"✓ 成功编译并重命名: {new_pyd_name}")
            else:
                print(f"⚠ 编译成功但未找到生成的.pyd文件: {py_file.name}")
            
        except subprocess.CalledProcessError as e:
            print(f"✗ 编译失败: {py_file.name}")
            if e.stderr:
                print(f"  错误信息: {e.stderr}")
                
        except Exception as e:
            print(f"✗ 发生异常: {e}")
            
        finally:
            # 恢复原始工作目录
            os.chdir(original_cwd)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("用法: python Nuitkatopyd.py <目录路径>")
        print("示例: python Nuitkatopyd.py ./easytrader/utils")
        sys.exit(1)
    
    target_dir = sys.argv[1]
    print(f"开始编译目录: {target_dir}")
    compile_to_pyd(target_dir)
    print("编译完成！")
import os

# 1. Folders and files to completely ignore (keeps the file size small)
EXCLUDE_DIRS = {'.git', 'node_modules', '__pycache__', '.venv', 'dist', 'build', '.idea', '.vscode'}
EXCLUDE_FILES = {'bundler.py', 'complete_project.txt', 'package-lock.json', 'yarn.lock'}
TEXT_EXTENSIONS = {'.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md', '.txt', '.java', '.c', '.cpp', '.cs', '.go'}

output_filename = "complete_project.txt"

print("🔍 Scanning project files...")

with open(output_filename, "w", encoding="utf-8") as outfile:
    for root, dirs, files in os.walk("."):
        # Modifying dirs in-place lets os.walk skip excluded directories entirely
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if file in EXCLUDE_FILES:
                continue
                
            # Get file extension
            _, ext = os.path.splitext(file)
            
            # Only read text/code files, skip binary files like images, PDFs, zips
            if ext.lower() not in TEXT_EXTENSIONS:
                continue
                
            file_path = os.path.join(root, file)
            # Make the file path look clean (e.g., ./src/main.py)
            clean_path = os.path.relpath(file_path, ".")
            
            # Write a clear separator so DeepSeek knows where a new file begins
            outfile.write(f"\n\n=========================================\n")
            outfile.write(f"FILE: {clean_path}\n")
            outfile.write(f"=========================================\n\n")
            
            try:
                with open(file_path, "r", encoding="utf-8") as infile:
                    outfile.write(infile.read())
                print(f"✅ Added: {clean_path}")
            except Exception as e:
                outfile.write(f"[Error reading file content: {str(e)}]\n")

print(f"\n🎉 Done! Your entire project is saved in: {output_filename}")
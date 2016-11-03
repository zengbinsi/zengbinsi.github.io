#!/bin/bash
# 曾彬思
# 当前脚本主要用于遍历个人博客的文件，然后更新BlogPagesPath.js文件。
# 每次更新博客后都要手动运行一遍，然后提交到zengbinsi.github.io仓库

# 注意：当脚本权限不足时（提示：Permission denied），可以在终端中输入”chmod 777 shell脚本文件“的命令获取权限，然后再执行脚本。



echo "===================================="
echo "开始操作"

#1.脚本当前目录
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# 最终的输出目录
resultPath=$dir"/BlogPagesPath.js"





# 备份旧文件
echo "备份旧文件"
if [ -f $resultPath ];then
   mv -f $resultPath $dir"/BlogPagesPath.js_old"
   # rm -f $resultPath 
fi




# 博客目录
dirBlog="$dir/../../res/BlogPages"
# 博客目录的前缀
dirBlogPre="$dir/../../"
# 博客目录的前缀长度，用于截取路径字符串
dirBlogPreLen="${#dirBlogPre}"




echo "===================================="
# 开始写入文件
echo "开始写入文件..."
#写入文件头
echo "写入文件头..."
echo "// 博客路径" >> $resultPath
echo "var blogPagePathRoot = \"res/BlogPages/\";" >> $resultPath
echo "" >> $resultPath
echo "// 博客数据" >> $resultPath
echo "var BlogPagesPath = [" >> $resultPath




# 遍历文件夹的文件目录【包括子目录文件】
echo "写入博客文件数据..."
for filename in `find $dirBlog` 
do
if [ ! -d $filename ];then
	# 判断文件拓展名
	if [ "${filename##*.}"x = "html"x ]; then
		echo "    {" >> $resultPath
		echo "        name : \"`basename $filename .html`\"," >> $resultPath
		echo "        path : \"${filename:$dirBlogPreLen}\"" >> $resultPath
		echo "    }," >> $resultPath
	fi 
fi
done
 



# 写入文件尾
echo "写入文件尾..."
echo "    {" >> $resultPath
echo "    }" >> $resultPath
echo "];" >> $resultPath



echo "操作成功！"






echo "===================================="
# 将博客工程打包

# 博客工程根目录
dir_blog_code_project="$dir/../../"
# 博客发布目录
dir_blog_release="$dir/../../../blog"
# zengbinsi.github.io本地根目录
dir_zengbinsi_github_io="$dir/../../../"

echo "开始编译博客工程"
cd $dir_blog_code_project
cocos compile -p web -m release
echo "编译成功！"


echo "移除旧的博客发布代码"
rm -rfv "$dir_blog_release"

echo "正在复制新的发布工程到博客发布目录"
mv -fv "$dir_blog_code_project/publish/html5" "$dir_blog_release"
rm -rfv "$dir_blog_code_project/publish"

echo "===================================="





echo "正在提交更改..."

cd "$dir_zengbinsi_github_io" # /Users/zengbinsi/workspace/00_git/zengbinsi.github.io
echo "添加您的修改..."
git add .

echo "添加修改成功，正在提交..." 
git commit -m "【更新日志】1、更新博客。" 

git remote add origin https://github.com/zengbinsi/zengbinsi.github.io.git

echo "提交成功，正在推送至远端分支..."
git push -u origin master


echo "========================================================="
echo "【代码提交成功，博客发布成功！】"
echo "========================================================="






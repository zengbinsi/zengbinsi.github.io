#!/bin/bash
# 曾彬思
# 当前脚本主要用于遍历个人博客的文件，然后更新BlogPagesPath.js文件。
# 每次更新博客后都要手动运行一遍，然后提交到zengbinsi.github.io仓库

# 注意：当脚本权限不足时（提示：Permission denied），可以在终端中输入”chmod 777 shell脚本文件“的命令获取权限，然后再执行脚本。



echo "===================================="
echo "开始操作"

#1.脚本当前目录
dir="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
# zengbinsi.github.io本地根目录
dir_zengbinsi_github_io="$dir/../"
# 博客文件信息列表文件
blogPagesPath="$dir_zengbinsi_github_io/blog_code/src/common/BlogPagesPath.js"





# 备份旧文件
echo "备份旧文件"
if [ -f $blogPagesPath ];then
   mv -f $blogPagesPath $blogPagesPath"_old"
   # rm -f $blogPagesPath 
fi




# 博客目录
dirBlog="$dir_zengbinsi_github_io/blogs"
# 博客目录的前缀
dirBlogPre="$dir/../../"
# 博客目录的前缀长度，用于截取路径字符串
dirBlogPreLen="${#dir_zengbinsi_github_io}"




echo "===================================="
# 开始写入文件
echo "开始写入文件..."
#写入文件头
echo "写入文件头..."
echo "// 博客路径" >> $blogPagesPath
echo "var blogPagePathRoot = \"/../blogs/\";" >> $blogPagesPath
echo "" >> $blogPagesPath
echo "// 博客数据" >> $blogPagesPath
echo "var BlogPagesPath = [" >> $blogPagesPath




# 遍历文件夹的文件目录【包括子目录文件】
echo "写入博客文件数据..."
for filename in `find $dirBlog` 
do
if [ ! -d $filename ];then
	# 判断文件拓展名
	if [ "${filename##*.}"x = "html"x ]; then
		echo "    {" >> $blogPagesPath
		echo "        name : \"`basename $filename .html`\"," >> $blogPagesPath
		echo "        path : \"${filename:$dirBlogPreLen}\"" >> $blogPagesPath
		echo "    }," >> $blogPagesPath
	fi 
fi
done
 



# 写入文件尾
echo "写入文件尾..."
echo "    {" >> $blogPagesPath
echo "    }" >> $blogPagesPath
echo "];" >> $blogPagesPath



echo "操作成功！"






echo "===================================="
# 将博客工程打包

# 博客工程根目录
dir_blog_code_project="$dir_zengbinsi_github_io/blog_code/"
# 博客发布目录
dir_blog_release="$dir_zengbinsi_github_io/blog_site"


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






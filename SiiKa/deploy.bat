@echo off
echo 准备部署《硬币合成大师》到GitHub Pages...

REM 创建部署文件夹
mkdir deploy
echo 创建部署文件夹成功

REM 复制必要文件到部署文件夹
xcopy /Y index.html deploy\
xcopy /Y /E /I src deploy\src\
xcopy /Y /E /I assets deploy\assets\
xcopy /Y /E /I libs deploy\libs\
echo 复制文件成功

echo 部署准备完成！
echo.
echo 请按照以下步骤手动上传至GitHub:
echo 1. 打开浏览器访问 https://github.com/new
echo 2. 仓库名称输入: Siika
echo 3. 选择"Public"公开选项
echo 4. 点击"Create repository"
echo 5. 在新页面中, 点击"uploading an existing file"
echo 6. 将deploy文件夹中的所有文件拖拽上传
echo 7. 点击"Commit changes"
echo 8. 前往Settings - Pages, 设置Source为main分支
echo.
echo 完成后, 您的游戏将在几分钟内发布到:
echo https://DIiiiiiiiid.github.io/Siika/
echo.
pause 
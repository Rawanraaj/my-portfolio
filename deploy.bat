@echo off
echo.
echo  ========================================
echo   Pushing Portfolio to GitHub + Vercel
echo  ========================================
echo.

cd /d "c:\Users\Dell\Downloads\my-portfolio"

echo  [1/3] Staging all changes...
git add -A

echo  [2/3] Committing...
set /p msg="  Enter commit message (or press Enter for default): "
if "%msg%"=="" set msg=Update portfolio

git commit -m "%msg%"

echo  [3/3] Pushing to GitHub...
git push origin main

echo.
echo  ✅ Done! Vercel will auto-deploy in ~30 seconds.
echo  🌐 https://niroulakoportfolio.vercel.app
echo.
pause

@echo off
chcp 65001
echo ===================================================
echo     GitHub Upload Automation Script - سكربت الرفع التلقائي
echo ===================================================
echo.

echo [1/5] Initializing Git Repository...
git init
if %errorlevel% neq 0 (
    echo Error: Git is not installed or not in PATH!
    pause
    exit /b
)

echo.
echo [2/5] Adding Files...
git add .

echo.
echo [3/5] Committing Files...
git commit -m "Initial launch of Traof System Prototype"

echo.
echo ===================================================
echo IMPORTANT: Please create a new repository on GitHub.
echo Go to: https://github.com/new
echo Copy the HTTPS URL (e.g., https://github.com/user/repo.git)
echo ===================================================
echo.

set /p RepoUrl=Paste your GitHub Repository URL here: 

if "%RepoUrl%"=="" (
    echo Error: No URL provided. Exiting.
    pause
    exit /b
)

echo.
echo [4/5] Adding Remote Origin...
git branch -M main
git remote remove origin 2>nul
git remote add origin %RepoUrl%

echo.
echo [5/5] Pushing to GitHub...
echo (You may be asked to sign in to GitHub in a browser window)
git push -u origin main

echo.
if %errorlevel% equ 0 (
    echo ===================================================
    echo       SUCCESS! Upload Complete.  تم الرفع بنجاح
    echo ===================================================
) else (
    echo ===================================================
    echo       UPLOAD FAILED. Please check errors above.
    echo ===================================================
)

pause

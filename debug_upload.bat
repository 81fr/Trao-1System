@echo off
chcp 65001 >nul
color 0f
echo ==========================================================
echo       GitHub Upload Diagnostic Tool - أداة تشخيص الرفع
echo ==========================================================
echo.

echo [1] Checking for Git installation...
git --version
if %errorlevel% neq 0 (
    color 4f
    echo.
    echo [ERROR] Git is NOT installed!
    echo خطأ: برنامج Git غير مثبت على جهازك.
    echo.
    echo Please install it from: https://git-scm.com/download/win
    echo Download "64-bit Git for Windows Setup" and install it, then run this script again.
    echo.
    pause
    exit /b
)

echo [OK] Git is installed.
echo.
echo [2] Getting Repository URL...
echo Please ensure you have created a NEW repository on GitHub.
echo.
set /p RepoUrl=Paste the GitHub HTTPS URL here (Right Click to Paste): 

if "%RepoUrl%"=="" (
    color 6f
    echo.
    echo [WARNING] No URL entered! You must paste the URL.
    echo.
    pause
    exit /b
)

echo.
echo [3] Executing Git commands...
echo ----------------------------------------
git init
git add .
git commit -m "Initial launch"
git branch -M main
git remote remove origin 2>nul
git remote add origin %RepoUrl%
echo.
echo [4] Pushing code...
git push -u origin main
echo ----------------------------------------

if %errorlevel% neq 0 (
    color 4f
    echo.
    echo [ERROR] Something went wrong during the push.
    echo Read the red error messages above.
    echo.
) else (
    color 2f
    echo.
    echo [SUCCESS] Code uploaded successfully!
    echo.
)

pause

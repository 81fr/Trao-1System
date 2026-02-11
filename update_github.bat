@echo off
chcp 65001
echo ===================================================
echo     Updating GitHub Repository - تحديث المستودع
echo ===================================================
echo.
echo [1/3] Adding changes...
git add .
echo.
echo [2/3] Committing changes...
git commit -m "Fix icons, Add Branding, Fix Save Button Logic"
echo.
echo [3/3] Pushing to GitHub...
git push origin main
echo.
if %errorlevel% equ 0 (
    echo ===================================================
    echo       SUCCESS! Update Complete. تم التحديث بنجاح
    echo ===================================================
) else (
    echo ===================================================
    echo       UPDATE FAILED. Please check errors above.
    echo ===================================================
)
timeout /t 10

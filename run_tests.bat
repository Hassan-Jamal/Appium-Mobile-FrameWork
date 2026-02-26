@echo off
setlocal

:: Set paths to local tools
set "PROJECT_ROOT=%~dp0"
set "JAVA_HOME=%PROJECT_ROOT%tools\jdk-17.0.2"
set "ANDROID_HOME=%PROJECT_ROOT%tools"
set "NODE_HOME=%PROJECT_ROOT%tools\node\node-v20.11.0-win-x64"

:: Update PATH
set "PATH=%JAVA_HOME%\bin;%ANDROID_HOME%\cmdline-tools\latest\bin;%ANDROID_HOME%\platform-tools;%NODE_HOME%;%PATH%"

:: Verify prerequisites
echo Checking environment...
call java -version
call adb --version
call node -v

:: Check for connected devices
echo.
echo Checking for connected Android devices...
call adb devices
echo.

:: Run Tests
echo Running Signup Tests...
call npx wdio config/wdio.android.conf.ts --spec tests/signup.spec.ts

endlocal

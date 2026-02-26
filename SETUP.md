# FavorApp Automation Setup Guide

This document provides a comprehensive guide for setting up the Appium mobile automation framework for **FavorApp**.

---

## 📋 Prerequisites

Before starting, ensure you have the following installed and configured:

1.  **Node.js**: Version 20.x or higher.
    - *Used during this project*: Portable Node.js v20.11.0.
2.  **Java JDK 17**: Required for Android automation.
    - *Used during this project*: OpenJDK 17.0.2.
3.  **Android SDK**:
    - **Platform Tools**: `adb` for device communication.
    - **Build Tools**: Version 34.0.0.
    - **Platforms**: `android-34`.
4.  **Appium**:
    - Globally installed via npm: `npm install -g appium`.
    - **UiAutomator2 Driver**: `appium driver install uiautomator2`.
5.  **Physical Android Device**:
    - Developer Options enabled.
    - USB Debugging turned ON.
    - Connected via USB and authorized.

---

## ⚙️ Environment Configuration

### 1. Environment Variables
Ensure the following variables are set in your session or system:

- `JAVA_HOME`: Path to JDK 17 folder.
- `ANDROID_HOME`: Path to the root of your Android SDK folder.
- `PATH`: Must include entries for:
    - `%JAVA_HOME%\bin`
    - `%ANDROID_HOME%\platform-tools`
    - `%ANDROID_HOME%\cmdline-tools\latest\bin`

### 2. Project `.env` File
Create a `.env` file in the project root with the following details:
```env
# App Configuration
APP_PACKAGE=com.favorappllc.mobile
APP_ACTIVITY=com.favorappllc.mobile.MainActivity
APK_PATH=./apps/FavorApp.apk

# Test Data
TEST_USER_EMAIL=your-email@example.com
TEST_USER_PASSWORD=your-password
```

---

## 🚀 Running the Tests

### 1. Automated Script (Recommended)
We have created a `run_tests.bat` file that automatically sets the environment variables and executes the tests.

```powershell
.\run_tests.bat
```

### 2. Manual Command
To run only specific tests:
```powershell
npx wdio config/wdio.android.conf.ts --spec tests/signup.spec.ts
```

---

## 🛠️ Key Fixes & Workarounds

### 🛡️ Bypassing Google Play Licensing
The production version of FavorApp has a security check (`LicenseActivity`). If Appium tries to reinstall the app, it triggers a redirection to the Play Store.
- **Fix**: Use `"appium:noReset": true`.
- **Pre-condition**: Manually install the app from the Play Store on your phoné first and open it once to the login screen.

### 📜 PowerShell Execution Policy
If you get an error that `appium.ps1 cannot be loaded because running scripts is disabled`, run this in an Administrator PowerShell:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### 🔌 Port 4723 Conflicts
If Appium fails to start because the port is in use, use:
```powershell
$proc = Get-NetTCPConnection -LocalPort 4723 -ErrorAction SilentlyContinue; if ($proc) { Stop-Process -Id $proc.OwningProcess -Force }
```

---

## 🔍 Locators Strategy
FavorApp uses a mix of **Accessibility IDs** and **XPath** for robust automation.
- **Checkbox (Terms & Conditions)**: Managed via a specific `android.view.ViewGroup` with a content-description encompassing the policy text.
- **Input Fields**: Managed via XPath targeting `android.widget.EditText` with specific `text` attributes (e.g., `"Enter your email"`).

---

## 📁 Project Structure
- `/pages`: Page Object Model files (SignupPage, LoginPage, HomePage).
- `/tests`: Mocha spec files.
- `/config`: WebdriverIO and Appium configuration.
- `/apps`: Storage for the `.apk` file.
- `/tools`: Local JDK and Android SDK components.

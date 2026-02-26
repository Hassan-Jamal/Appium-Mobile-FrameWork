# 📱 Appium Mobile Automation Framework

> **Production-ready** mobile test automation framework built with **Appium v2 + WebdriverIO + Mocha + UIAutomator2 + Allure Reports** using the **Page Object Model (POM)** design pattern in **TypeScript**.

---
Presentation Link: https://mobile-automation-comple-7xxeldg.gamma.site/

## 📑 Table of Contents

- [Tech Stack](#-tech-stack)
- [Prerequisites](#-prerequisites)
  - [1. Java Development Kit (JDK)](#1-java-development-kit-jdk-17)
  - [2. Node.js & npm](#2-nodejs--npm)
  - [3. Android SDK & Android Studio](#3-android-sdk--android-studio)
  - [4. Appium v2](#4-appium-v2)
  - [5. Appium Inspector](#5-appium-inspector)
  - [6. Allure Commandline](#6-allure-commandline)
- [Environment Variables (PATH)](#-environment-variables-path-setup)
- [Verify Your Setup](#-verify-your-setup)
- [Project Setup](#-project-setup)
- [Project Structure](#-project-structure)
- [Configuration](#-configuration)
- [Running Tests](#-running-tests)
- [Allure Reports](#-allure-reports)
- [Appium Inspector](#-using-appium-inspector)
- [Troubleshooting](#-troubleshooting)

---

## 🧰 Tech Stack

| Tool                | Purpose                                     | Version   |
| ------------------- | ------------------------------------------- | --------- |
| **Appium v2**       | Mobile automation server                    | `^2.4.1`  |
| **WebdriverIO v8**  | Test runner & browser/mobile client         | `^8.28.6` |
| **Mocha**           | BDD/TDD test framework                     | via WDIO  |
| **UIAutomator2**    | Android automation driver                   | `^2.36.1` |
| **XCUITest**        | iOS automation driver *(optional)*          | `^5.12.1` |
| **Appium Inspector** | GUI element inspector for locators         | Latest    |
| **Allure Reports**  | Beautiful, interactive test reports         | `^2.27.0` |
| **TypeScript**      | Type-safe scripting language                | `^5.3.3`  |
| **Node.js**         | JavaScript runtime                          | `>=18.x`  |
| **POM**             | Page Object Model design pattern            | —         |

---

## 📋 Prerequisites

> ⚠️ **IMPORTANT:** Complete **ALL** steps below in order before cloning and running this project.

---

### 1. Java Development Kit (JDK 17)

Appium and the Android SDK require a JDK.

#### Windows

1. Download JDK 17 (LTS) from [Oracle](https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html) or [Adoptium](https://adoptium.net/temurin/releases/?version=17).
2. Run the installer (`.msi`) and follow the wizard.
3. Set the **`JAVA_HOME`** environment variable:
   - Open **Settings → System → About → Advanced System Settings → Environment Variables**.
   - Under **System Variables**, click **New**:
     - Variable name: `JAVA_HOME`
     - Variable value: `C:\Program Files\Java\jdk-17` *(adjust to your install path)*
   - Edit the **`Path`** variable and add: `%JAVA_HOME%\bin`

#### macOS

```bash
brew install openjdk@17
echo 'export JAVA_HOME=$(/usr/libexec/java_home -v 17)' >> ~/.zshrc
source ~/.zshrc
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install openjdk-17-jdk -y
echo 'export JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64' >> ~/.bashrc
source ~/.bashrc
```

#### ✅ Verify

```bash
java -version
# Expected: openjdk version "17.x.x" or java version "17.x.x"

echo %JAVA_HOME%        # Windows (CMD)
echo $JAVA_HOME          # macOS / Linux
```

---

### 2. Node.js & npm

This framework requires **Node.js v18+**.

#### Windows

1. Download the LTS installer from [nodejs.org](https://nodejs.org/en/download/).
2. Run the `.msi` installer — it auto-adds `node` and `npm` to your PATH.
3. *(Optional)* Install via **nvm-windows** for managing multiple Node versions:
   ```
   # Install nvm-windows from https://github.com/coreybutler/nvm-windows/releases
   nvm install 18
   nvm use 18
   ```

#### macOS

```bash
brew install node@18
# Or use nvm:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
nvm install 18
nvm use 18
```

#### Linux

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

#### ✅ Verify

```bash
node -v    # Expected: v18.x.x or higher
npm -v     # Expected: 9.x.x or higher
```

---

### 3. Android SDK & Android Studio

Required for Android device/emulator automation.

#### Step-by-Step

1. **Download & Install Android Studio** from [developer.android.com](https://developer.android.com/studio).
2. During installation, ensure these components are checked:
   - ✅ Android SDK
   - ✅ Android SDK Platform-Tools
   - ✅ Android SDK Build-Tools
   - ✅ Android Emulator
   - ✅ Intel HAXM (or Hyper-V on Windows)
3. Open Android Studio → **More Actions → SDK Manager**:
   - **SDK Platforms** tab → Check **Android 14.0 (API 34)** *(or your target version)*
   - **SDK Tools** tab → Check:
     - ✅ Android SDK Build-Tools 34
     - ✅ Android SDK Command-line Tools
     - ✅ Android SDK Platform-Tools
     - ✅ Android Emulator
   - Click **Apply** to download & install.

4. **Create an Emulator** (if not using a real device):
   - Android Studio → **More Actions → Virtual Device Manager**
   - Click **Create Virtual Device** → Choose **Pixel 7** (or any device)
   - Select system image: **API 34 (Android 14)** → **Finish**
   - Click ▶️ to start the emulator

5. **Set Environment Variables**:

   **Windows:**
   - `ANDROID_HOME` = `C:\Users\<you>\AppData\Local\Android\Sdk`
   - Add to `Path`:
     ```
     %ANDROID_HOME%\platform-tools
     %ANDROID_HOME%\tools
     %ANDROID_HOME%\tools\bin
     %ANDROID_HOME%\emulator
     %ANDROID_HOME%\build-tools\34.0.0
     ```

   **macOS / Linux:**
   ```bash
   echo 'export ANDROID_HOME=$HOME/Library/Android/sdk'    >> ~/.zshrc   # macOS
   # echo 'export ANDROID_HOME=$HOME/Android/Sdk'          >> ~/.bashrc  # Linux
   echo 'export PATH=$ANDROID_HOME/platform-tools:$PATH'   >> ~/.zshrc
   echo 'export PATH=$ANDROID_HOME/tools:$PATH'            >> ~/.zshrc
   echo 'export PATH=$ANDROID_HOME/tools/bin:$PATH'        >> ~/.zshrc
   echo 'export PATH=$ANDROID_HOME/emulator:$PATH'         >> ~/.zshrc
   source ~/.zshrc
   ```

#### ✅ Verify

```bash
adb version          # Expected: Android Debug Bridge version 1.0.xx
adb devices          # Should list connected devices/emulators
emulator -list-avds  # Should list available AVDs
```

---

### 4. Appium v2

The mobile automation server that connects your tests to devices.

#### Install Globally

```bash
npm install -g appium@latest
```

#### Install Required Drivers

```bash
# Android driver (UIAutomator2)
appium driver install uiautomator2

# iOS driver (XCUITest) — macOS only
appium driver install xcuitest
```

#### ✅ Verify

```bash
appium -v                  # Expected: 2.x.x
appium driver list         # Should show uiautomator2 (installed)
```

#### Start Appium Server (Manual)

```bash
appium --relaxed-security --allow-insecure=adb_shell
```

> 💡 **Note:** This framework auto-starts Appium via the WebdriverIO Appium Service — you don't need to start it manually unless debugging.

---

### 5. Appium Inspector

A GUI tool to inspect app elements and find locators (IDs, XPaths, accessibility IDs, etc.)

#### Install

1. Download the latest release from [Appium Inspector GitHub Releases](https://github.com/appium/appium-inspector/releases).
2. Install the `.exe` (Windows), `.dmg` (macOS), or `.AppImage` (Linux).

#### How to Configure

1. Open Appium Inspector after starting your Appium server.
2. Set the **Remote Host**, **Port**, and **Path**:
   - Remote Host: `127.0.0.1`
   - Remote Port: `4723`
   - Remote Path: `/`
3. Add **Desired Capabilities** (JSON):

   ```json
   {
     "platformName": "Android",
     "appium:automationName": "UiAutomator2",
     "appium:deviceName": "Pixel_7_API_34",
     "appium:platformVersion": "14.0",
     "appium:appPackage": "com.favorappllc.mobile",
     "appium:appActivity": "com.favorappllc.mobile.MainActivity",
     "appium:noReset": true
   }
   ```

4. Click **Start Session** — you'll see a live mirror of your device/emulator.
5. Click on any UI element to see its **locator strategies** (id, xpath, accessibility id, class name, etc.)

> 💡 **Tip:** Use `accessibility id` or `id` locators over XPath whenever possible for faster, more stable tests.

---

### 6. Allure Commandline

Generates beautiful interactive test reports.

#### Install

**Option A — via npm (recommended):**

```bash
npm install -g allure-commandline
```

**Option B — via Scoop (Windows):**

```bash
scoop install allure
```

**Option C — via Homebrew (macOS):**

```bash
brew install allure
```

> ⚠️ Allure requires **Java** to be installed (see JDK step above).

#### ✅ Verify

```bash
allure --version   # Expected: 2.x.x
```

---

## 🌐 Environment Variables (PATH) Setup

Here's a complete summary of all required environment variables:

| Variable        | Example Value (Windows)                                 | Purpose               |
| --------------- | ------------------------------------------------------- | --------------------- |
| `JAVA_HOME`     | `C:\Program Files\Java\jdk-17`                          | JDK location          |
| `ANDROID_HOME`  | `C:\Users\<you>\AppData\Local\Android\Sdk`              | Android SDK location  |
| `Path` addition | `%JAVA_HOME%\bin`                                       | Java binaries         |
| `Path` addition | `%ANDROID_HOME%\platform-tools`                         | ADB tool              |
| `Path` addition | `%ANDROID_HOME%\tools\bin`                               | SDK manager / AVD mgr |
| `Path` addition | `%ANDROID_HOME%\emulator`                               | Emulator binary       |
| `Path` addition | `%ANDROID_HOME%\build-tools\34.0.0`                     | Build tools           |

#### Quick One-Shot Setup (Windows CMD — Run as Administrator)

```cmd
setx JAVA_HOME "C:\Program Files\Java\jdk-17" /M
setx ANDROID_HOME "%LOCALAPPDATA%\Android\Sdk" /M
```

> 🔄 **Restart your terminal** after setting environment variables.

---

## ✅ Verify Your Setup

Run all checks in one go to confirm everything is ready:

```bash
java -version              # Java 17+
node -v                    # Node 18+
npm -v                     # npm 9+
adb version                # ADB installed
adb devices                # Device/emulator visible
appium -v                  # Appium 2+
appium driver list         # uiautomator2 installed
allure --version           # Allure 2+
```

**Expected Output Example:**

```
openjdk version "17.0.10" 2024-01-16
v18.19.0
9.8.0
Android Debug Bridge version 1.0.41
List of devices attached
emulator-5554   device
2.4.1
✔ uiautomator2@2.36.1 [installed (npm)]
2.27.0
```

---

## 🚀 Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Hassan-Jamal/Appium-Mobile-FrameWork.git
cd Appium-Mobile-FrameWork
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
# Copy the example env file
cp .env.example .env        # macOS/Linux
copy .env.example .env      # Windows
```

Edit `.env` with your device/emulator details:

```env
# ── Android ──────────────────────────────────
ANDROID_DEVICE_NAME=Pixel_7_API_34          # Your AVD name or real device name
ANDROID_PLATFORM_VERSION=14.0              # Android version on the device
APP_PACKAGE=com.favorappllc.mobile         # Target app package
APP_ACTIVITY=com.favorappllc.mobile.MainActivity
APK_PATH=./apps/FavorApp.apk              # Path to your .apk file

# ── Appium Server ─────────────────────────────
APPIUM_HOST=localhost
APPIUM_PORT=4723

# ── Test Config ───────────────────────────────
DEFAULT_TIMEOUT=30000
IMPLICIT_WAIT=5000
MAX_RETRIES=2
```

### 4. Place Your APK/IPA

Put your app binary in the `apps/` folder:

```
apps/
  └── FavorApp.apk     # Android
  └── FavorApp.ipa     # iOS (macOS only)
```

### 5. Start Emulator or Connect Device

```bash
# Start an emulator
emulator -avd Pixel_7_API_34

# OR connect a real device via USB and enable USB Debugging
adb devices   # Confirm device is listed
```

---

## 📁 Project Structure

```
appium-mobile-framework/
├── apps/                         # APK/IPA app binaries
│   └── FavorApp.apk
├── config/                       # WebdriverIO configuration files
│   ├── wdio.base.conf.ts         #   Base/shared config
│   ├── wdio.android.conf.ts      #   Android-specific config
│   ├── wdio.ios.conf.ts          #   iOS-specific config
│   └── wdio.parallel.conf.ts     #   Parallel execution config
├── pages/                        # Page Object Model classes
│   ├── BasePage.ts               #   Base class with common methods
│   ├── HomePage.ts               #   Home page locators & actions
│   ├── LoginPage.ts              #   Login page locators & actions
│   ├── SignupPage.ts             #   Signup page locators & actions
│   ├── ProfilePage.ts           #   Profile page locators & actions
│   └── CrudPage.ts              #   CRUD operations page
├── tests/                        # Test spec files (Mocha)
│   ├── login.spec.ts             #   Login test scenarios
│   ├── signup.spec.ts            #   Signup test scenarios
│   ├── crud.spec.ts              #   CRUD operations tests
│   ├── navigation.spec.ts       #   Navigation flow tests
│   └── post_login_flow.spec.ts  #   Post-login flow tests
├── utils/                        # Utility/helper functions
│   ├── appInstaller.ts           #   APK/IPA installation helpers
│   ├── gestures.ts               #   Touch gestures (swipe, scroll, tap)
│   ├── testData.ts               #   Test data generators (Faker.js)
│   └── waitHelpers.ts            #   Custom wait strategies
├── fixtures/                     # Static test fixtures
├── test-data/                    # Test data files
├── scripts/                      # Utility scripts
│   ├── install-apk.ts            #   Script to install APK on device
│   └── install-ipa.ts            #   Script to install IPA on device
├── jenkins/                      # Jenkins CI/CD pipeline configs
├── .github/                      # GitHub Actions workflows
├── allure-results/               # Raw Allure test results (auto-generated)
├── allure-report/                # Generated Allure HTML report
├── screenshots/                  # Auto-captured failure screenshots
├── .env.example                  # Environment variables template
├── .env                          # Your local env config (git-ignored)
├── .gitignore                    # Git ignore rules
├── package.json                  # npm dependencies & scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # You are here!
```

---

## ⚙️ Configuration

### WebdriverIO Config Files

| File                       | Purpose                              |
| -------------------------- | ------------------------------------ |
| `wdio.base.conf.ts`       | Shared base configuration            |
| `wdio.android.conf.ts`    | Android-specific capabilities & settings |
| `wdio.ios.conf.ts`        | iOS-specific capabilities & settings |
| `wdio.parallel.conf.ts`   | Multi-device parallel execution      |

### Key Capabilities (Android)

```typescript
{
  platformName: 'Android',
  'appium:automationName': 'UiAutomator2',
  'appium:deviceName': 'Pixel_7_API_34',
  'appium:platformVersion': '14.0',
  'appium:app': './apps/FavorApp.apk',
  'appium:appPackage': 'com.favorappllc.mobile',
  'appium:appActivity': 'com.favorappllc.mobile.MainActivity',
  'appium:noReset': true,
  'appium:fullReset': false,
}
```

---

## 🧪 Running Tests

### Run All Android Tests

```bash
npm run test:android
```

### Run Specific Test Suites

```bash
# Login tests only
npm run test:android:login

# CRUD tests only
npm run test:android:crud

# Navigation tests only
npm run test:android:navigation
```

### Run a Single Spec File

```bash
npx wdio run config/wdio.android.conf.ts --spec tests/signup.spec.ts
```

### Run iOS Tests (macOS Only)

```bash
npm run test:ios
```

### Run Tests in Parallel

```bash
npm run test:parallel
```

### Using the Windows Batch Script

```bash
run_tests.bat
```

---

## 📊 Allure Reports

### Generate & Open Report

```bash
# Generate the HTML report from results
npm run allure:generate

# Open the report in your browser
npm run allure:open

# Or do both in one command
npm run allure:report
```

### Clean Previous Results

```bash
npm run clean
```

### Report Features

- ✅ Test pass/fail overview with pie charts
- 📸 Auto-attached failure screenshots
- 📝 Step-by-step test execution details
- 📈 Historical trend graphs (when running multiple times)
- 🏷️ Test categorization by suite, severity, feature

---

## 🔍 Using Appium Inspector

Appium Inspector is essential for finding UI element locators during test development.

### Step-by-Step Workflow

1. **Start your emulator/device** and ensure the target app is installed
2. **Start Appium server:**
   ```bash
   appium --relaxed-security --allow-insecure=adb_shell
   ```
3. **Open Appium Inspector** and configure:
   - Remote Host: `127.0.0.1`
   - Remote Port: `4723`
   - Remote Path: `/`
4. **Add capabilities** (see [section above](#how-to-configure))
5. **Start Session** → navigate the app and click elements to get locators
6. **Copy locators** into your Page Object files

### Locator Strategy Priority

| Priority | Strategy         | Example                              | Speed  |
| -------- | ---------------- | ------------------------------------ | ------ |
| 1️⃣       | `accessibility id` | `~loginButton`                     | ⚡ Fast |
| 2️⃣       | `id`             | `com.app:id/loginBtn`                | ⚡ Fast |
| 3️⃣       | `class name`     | `android.widget.Button`             | 🔶 Med  |
| 4️⃣       | `xpath`          | `//android.widget.Button[@text="Login"]` | 🐢 Slow |

---

## 🏗️ Page Object Model (POM)

This framework follows POM for maintainable, reusable test code.

### Structure

```
BasePage (abstract)          ← Common methods (click, type, wait, scroll)
  ├── LoginPage              ← Login-specific locators & methods
  ├── SignupPage             ← Signup-specific locators & methods
  ├── HomePage               ← Home page locators & methods
  ├── ProfilePage            ← Profile page locators & methods
  └── CrudPage               ← CRUD operations locators & methods
```

### Example Page Object

```typescript
// pages/LoginPage.ts
import BasePage from './BasePage';

class LoginPage extends BasePage {
    // ── Locators ──
    get emailInput()    { return $('~emailInput'); }
    get passwordInput() { return $('~passwordInput'); }
    get loginButton()   { return $('~loginButton'); }

    // ── Actions ──
    async login(email: string, password: string): Promise<void> {
        await this.type(await this.emailInput, email);
        await this.type(await this.passwordInput, password);
        await this.click(await this.loginButton);
    }
}

export default new LoginPage();
```

---

## 🐛 Troubleshooting

### Common Issues & Fixes

| Issue | Cause | Solution |
| ----- | ----- | -------- |
| `adb: command not found` | Android SDK not in PATH | Add `%ANDROID_HOME%\platform-tools` to PATH |
| `JAVA_HOME not set` | JDK path not configured | Set `JAVA_HOME` env variable (see above) |
| `Appium server not started` | Port conflict / not installed | Run `appium -v` to verify, check port `4723` is free |
| `Device not found` | Emulator not running / USB debugging off | Start emulator or enable USB Debugging on device |
| `UiAutomator2 not installed` | Driver missing | Run `appium driver install uiautomator2` |
| `Session creation failed` | Wrong capabilities | Double-check `appPackage`, `appActivity`, `deviceName` |
| `Element not found` | Wrong locator / element not loaded | Use Appium Inspector to verify locators, add waits |
| `ECONNREFUSED 127.0.0.1:4723` | Appium not running | Start Appium server or check service config |
| `allure: command not found` | Allure CLI not installed | Run `npm install -g allure-commandline` |
| `Build tools not found` | SDK Build-Tools missing | Install via Android Studio SDK Manager |

### Debug Tips

1. **Check Appium logs:** `appium-android.log` in project root
2. **Run with verbose logging:**
   ```bash
   appium --log-level debug
   ```
3. **Screenshot on failure:** Already configured — check `screenshots/` folder
4. **Validate capabilities:** Use Appium Inspector before running tests

---

## 📜 Available npm Scripts

| Command                      | Description                            |
| ---------------------------- | -------------------------------------- |
| `npm run test:android`       | Run all tests on Android               |
| `npm run test:ios`           | Run all tests on iOS                   |
| `npm run test:parallel`      | Run tests on multiple devices          |
| `npm run test:android:login` | Run only login test suite              |
| `npm run test:android:crud`  | Run only CRUD test suite               |
| `npm run test:android:navigation` | Run only navigation test suite    |
| `npm run allure:generate`    | Generate Allure HTML report            |
| `npm run allure:open`        | Open Allure report in browser          |
| `npm run allure:report`      | Generate + open Allure report          |
| `npm run clean`              | Remove `allure-results` & `allure-report` |
| `npm run lint`               | Run ESLint on TypeScript files         |
| `npm run lint:fix`           | Auto-fix lint issues                   |
| `npm run type-check`         | TypeScript type check (no emit)        |
| `npm run install:apk`        | Install APK on connected device        |
| `npm run install:ipa`        | Install IPA on connected device        |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Made with ❤️ by Hassan Jamal
  <br />
  <strong>"Pressure Creates Legends, Stay Under it."</strong>
</p>

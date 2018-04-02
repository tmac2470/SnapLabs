# Snap Lab Android App

## Prerequisites

Install Ionic and cordova:

    npm install -g cordova ionic

Check the system configuration use:

    ionic info

Make sure you have the following configuration:

cli packages:

    @ionic/cli-utils  : 1.19.2
    ionic (Ionic CLI) : 3.20.0

global packages:

    cordova (Cordova CLI) : 8.0.0

local packages:

    @ionic/app-scripts : 1.3.7
    Cordova Platforms  : android 6.4.0 ios 4.4.0
    Ionic Framework    : ionic-angular 3.3.0

System:

    Android SDK Tools : 26.1.1
    Node              : v7.8.0
    npm               : 4.2.0
    OS                : macOS High Sierra
    Xcode             : Xcode 9.3 Build version 9E145

Environment Variables:

    ANDROID_HOME : <PATH>/Library/Android/sdk

Misc:

    backend : legacy


## Basics

- The app uses the `cordova-plugin-bluetoothle` plugin to  connect to sensor tags.
- Since we're using CC2650 sensor tags, the code to read/write values to the sensors only targets these sensors. The app may or may not work with any other types of sensor tags.
- The connection to the app happens in the `connect.component`. All connected devices are stored in the local storage.
- The main logic has been written in the `investigation.details` component. Each sensor tag needs to be checked for connectivity before running any other check. Once connection has been estabilished read the investigation JSON and:
    - Gather all the sensors that need to be enabled.
    - Check whether graphs or grids are required.
    - Start the notifications for each sensor by writing a value to it. For example enable luxometer by writing the enable bits to it `0x01`.
    - After writing the bits to enable a sensor write the period to it. For example we need the luxometer to send data only in the intervals of 1500ms so you need to write an equivalent of 1500ms to it.
- When plotting graphs
    - Graphs are run when the `Start graphs` button has been clicked.
- When plotting grids
    - Grids can register a value once you tap them.

- Regarding data collection
    - The sensors output 16 bit data arrays that need to be transformed to get the values in the target units.
    - This transformation is specific to each sensor and the proof can be found here `http://processors.wiki.ti.com/index.php/CC2650_SensorTag_User%27s_Guide`.


## Start the app

    npm start

## Build the development versions of the app

    npm run build:android:dev


## Build the production versions of the app

    - ionic cordova build android --prod --release
    - Copy android-release-unsigned.apk to build tools (path below)

    - Build a certificate if you don't have one : keytool -genkey -v -keystore snap-prod-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias snap-prod-key
    - cd <PATH>Library/Android/sdk/build-tools/27.0.3
    - jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore snap-prod-key.jks android-release-unsigned.apk snap-prod-key
    - ./zipalign -v 4 android-release-unsigned.apk Snaplabs.apk
    - ./apksigner verify Snaplabs.apk


## Generate the app splashscreens and icon

* Add a new splash.png and icon.png under `resources` folder before doing this step.

      npm run resources

# Fix android ssl issue for testing
- http://ivancevich.me/articles/ignoring-invalid-ssl-certificates-on-cordova-android-ios/
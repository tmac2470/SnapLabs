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
    Node              : v9.9.0
    npm               : 5.6.0
    OS                : macOS High Sierra
    Xcode             : Xcode 9.2 Build version 9C40b

Environment Variables:

    ANDROID_HOME : <PATH>/Library/Android/sdk

Misc:

    backend : legacy

## Start the app

    npm start

## Build the development versions of the app

    npm run build:android:dev
    npm run build:ios:dev

## Build the production versions of the app

    npm run build:android:prod
    npm run build:ios:prod

## Generate the app splashscreens and icon

* Add a new splash.png and icon.png under `resources` folder before doing this step.

      npm run resources

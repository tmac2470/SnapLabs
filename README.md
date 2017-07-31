## Prerequisites
Install Ionic and cordova:

    npm install -g cordova ionic

Check the system configuration use:

    ionic info

Make sure you have the following configuration:
    global packages:

        Cordova CLI : 7.0.1

    local packages:

        @ionic/app-scripts : 1.3.7
        Cordova Platforms  : android 6.2.3 ios 4.4.0
        Ionic Framework    : ionic-angular 3.3.0

    System:

        Android SDK Tools : 26.0.2
        Node              : v7.8.0
        OS                : macOS Sierra
        Xcode             : Xcode 8.3.3 Build version 8E3004b
        ios-deploy        : 1.9.1
        ios-sim           : 5.0.13
        npm               : 4.2.0

## Start the app
    npm start

## Build the development versions of the app
    npm run build:android:dev
    npm run build:ios:dev

## Build the production versions of the app
    npm run build:android:prod
    npm run build:ios:prod

## Generate the app splashscreens and icon

- Add a new splash.png and icon.png under `resources` folder before doing this step.

      npm run resources
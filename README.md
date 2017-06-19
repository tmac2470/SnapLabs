## Prerequisites
Install Ionic and cordova:

    npm install -g cordova ionic

Check the system configuration use:

    ionic info

Make sure you have the following configuration:

    global packages:

        @ionic/cli-utils : 1.4.0
        Cordova CLI      : 7.0.1
        Ionic CLI        : 3.4.0

    local packages:

        @ionic/app-scripts              : 1.3.7
        @ionic/cli-plugin-cordova       : 1.4.0
        @ionic/cli-plugin-ionic-angular : 1.3.1
        Cordova Platforms               : android 6.2.3
        Ionic Framework                 : ionic-angular 3.3.0

    System:

        Node       : v6.8.1
        OS         : macOS Sierra
        Xcode      : Xcode 8.3.3 Build version 8E3004b
        ios-deploy : 1.9.1
        ios-sim    : 5.0.13
        npm        : 3.10.8

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
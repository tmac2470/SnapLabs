# Snaplabs iOS app

- iOS apps can only be built on a Mac and needs Xcode and Apple developer account.
- As of yet there are no alternatives for Windows users. You can try running OSX on a virtual machine but this approach is not recommended nor has been tested.

## To start the project
- brew install node
- brew install watchman
- npm install -g react-native-cli
- Download Xcode.
- Supply the apple developer account credentials to Xcode.
- Now open the project (ios folder) in Xcode.
- Choose your device and run the project (Menu -> Product -> Run)

## Basics
- The app follows the basics from the Android app.
- The only difference here is the way we use iOS bluetooth module to handle the connections.
    - Once a sensor tag is connected from the connect page we save its info in the local store (redux)
    - When you exit the connect page app disconnects from the sensor tag to prevent any memory leaks
    - Now once you enter the investigation details page the bluetooth module is activated and any previously connected sensor tags are reconnected provided they're still ON.


## Building the app
- Open the app in Xcode.
- Click on `Product` in Menu and then `Archive`
- Let the process run and then in the new dialog box select `Export`
- For testing purposes export to development team.
- If wanting to release to App Store upload the app to App store from the same dialog box.
    - This dialog box would only open once an app is built.
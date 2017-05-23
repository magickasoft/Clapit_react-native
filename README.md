
# clapit

### Getting started

This app is built using React Native from the ground-up.  It depends on Node Package Manager and CocoaPods for the iOS app.  Currently it is built for iOS.

Pre-installation notes:
Install node 4.x and npm 2.x (npm version 3.x has issues in time of writing)

Installation:
* Clone repo
* `npm install`
* `cd ios`
* `pod install`
* `cd ..`
* `npm start`

Now open `ios/clapitnative.xcworkspace` and you should be good-to-go.  

### Targets

There are only 2 targets, `clapitnative` and `clapitnativeextension`.  `clapitnative` is the app itself, and `clapitnativextension` is the Share extension.  

`clapitnative` starts with AppDelegate.m.

`clapitnativeextension` starts with ShareViewController.m.

Both essentially let React Native take over.  ShareViewController needs to do more handling of the data that comes in, but it eventually passes it on to RN code.  

### JavaScript

Everything goes through `index.io.js`, this is where both `Clapit` and `ClapitExtension` are registered.  They map to `clapitnative` and `clapitnativeextension`, respectively.

From there, `Clapit` goes to `wrapper.js`, while `ClapitExtension` goes to `extension.js`.  (Not to be confused with `js/extension.js`.  More on this later.)

### Redux

Redux is used to maintain the state of the app  persists the state in `NSUserDefaults` that is shared between App and Extension. This is done through the `SharedStorageManager` Objective-C class, which is used in both `wrapper` and `extension` as a param in `persistStore`.  

Throughout the JavaScript code `containers` are used when state needs to be mapped to a component, and components can be associated with a `container` but can also stand alone.  For more information please see: [Presentational and Container Components](http://redux.js.org/docs/basics/UsageWithReact.html)

Both `wrapper` and `extension` load state and until state is fully hydrated it will not show anything but a blank view (which most of the times is never seen as state hydrates pretty quickly.)

### App and Extension (js/extension, that is)

`wrapper` "wraps" `App` with state, while `extension` wraps `Extension` which is loaded from `js/extension`...  reading that may be confusing, but `extension` wraps `js/extension` with state.  

`js/extension` is used in both App and Extension.  It is the share screen that pops up when you share from outside the app like in Safari, or when you're inside the app and you touch Post to share an image.

##### Recommendedation

`js/extension` was initially intended to support both App and Extension, and while it does this, it has made it a huge component with nearly 800 lines in one file.  I think it best in a future refactor to divide  `js/extension` into at least 2 files, one for when it's called within the app, and one for when it's called from outside the app -- as structuring around one-way data flow seems to make things a lot simpler.  

Aside from that, I'd even consider breaking it down into 3 more files, one for images, one for video, and one for web.  (This is important as we don't want this beast to grow any more complex!)


### XCode Schemes

There are 3 main schemes:

* `clapitnative` for debugging / running in Simulator or Device
* `clapitnative-release` for sending new builds to TestFlight / AppStore
* `clapitnative-apphub` for sending existing builds to TestFlight and using it to test AppHub builds (updating code without going through AppStore approval)


### clapitnative Scheme

When running the app in this mode, it will run in React Native's debug mode, and will not attempt to load AppHub updates.  Data will be loaded from the server `localhost` by default.

To run on device with real-time JavaScript updates:
* Change AppDelegate.m `localhost` to your IP address
* Change ShareViewController.m `localhost` to your IP address
* Change `RCTWebSocketExecutor.m` `localhost` to your IP address

Now when you recompile, you can take advantage of Debugging on Chrome, Live Reloads, and Hot Reloads on your device.


### clapitnative-release Scheme

This is used for sending builds to TestFlight, and can also be used prior to that for testing on your device as well.  It will take longer as it compiles JavaScript 2x, once for App and once for Extension (ideally they could be shared if put within the same `NSBundle` as they do share a group...) but it's not currently implemented.

**Note** that new builds are only necessary when:
* There's a bug that needs to be fixed in Objective-C
* New Objective-C / Swift functionality is needed
* React Native (or another native library) needs to be updated

Other than that, please use **AppHub** to do updates.  More on that below.


### clapitnative-apphub Scheme

This will create a build just like `clapitnative-release` except under a different BundleID so it can run alongside `clapit` on your phone, and also this is where you'll want to test new AppHub updates before sending them out.  

Ideally, when creating a `clapitnative-apphub` build, it will mirror the exact same code (both native and JavaScript) as the current `clapitnative-release` build that's in the AppStore.  This will ensure maximum compatibility when sending out a live update.  

Another difference with `clapitnative-apphub` is that it currently uses a different AppHub app than `clapitnative-release`.  This is due to a mistake I made in the current app by keeping `debugBuildsEnabled = YES` in what went to the AppStore.  It's been corrected, however it may be safer to keep it this way at least for the next couple of AppStore releases.  


### AppHub

The app is currently configured so that it can update itself either through the App or through the Extension (`AppDelegate.m` and `ShareViewController.m`.)  When the code is updated, it is saved in a place shared between App and Extension, so that when one is updated the other is also updated.  

`AppHubManager` is used in `app.js` to periodically check for new builds.  If one exists when it is called, `app.js` will pop a message to let the user apply it right away if they want to.  If they don't want to it will leave them alone and apply itself after they put the app in the background, prior to bringing the app back into the foreground.  If they kill the app it will automatically use the new code when it is launched again.

There are 2 apps in AppHub -- `clapit` and  `clapit-test`.

If you push a build to `clapit` and enable it for either debug or all, it will go to all users who are using the current version in the AppStore.  (Be careful!)

If you push a build to `clapit-test` it will only go to users who are using a `clapitnative-apphub` build.  


### Fabric.io

To see where things are crashing, use Fabric.io.  It will show you Objective-C lines on where stuff is crashing, and the username / email of the users for whom it crashed.  

When JavaScript crashes, all of these are lumped into `RCTAssert.m` line `133`.  So following directions here for creating a sourcemap:

 http://stackoverflow.com/questions/34715106/how-to-added-sourcemap-in-react-native-for-production
 
```
 react-native bundle --platform ios --entry-file index.ios.js --dev false --bundle-output ./ios/main.jsbundle --assets-dest ./ios --sourcemap-output ./sourcemap.js

```

if we receive an error like this on Fabric.io:
```
Fatal Exception: RCTFatalException: Unhandled JS Exception: null is not an object (evaluating 'i.status')
Unhandled JS Exception: null is not an object (evaluating 'i.status'), stack: <unknown>@580:12071 value@25:3724 <unknown>@25:1482 k@25:411 value@25:1452
RCTFatal
 Raw
```

we'll want to see `580:12071` from here...  so we take it and plug it into the Node.js code from the previous link.

We'll get something like:

```
{ source: '/js/extension.js',
  line: 576,
  column: 45,
  name: 'status' }
```

which leads to:

```
if(err || res.status != 200) {
  this._handlePostError(err, res.status)
 return
}
```

Update: A utility file called, checkError.js is useful for printing the stack information

### Push Notifications

The provisioning profile and certificates are already in place for the AppStore build (and the AppHub build) to use Push Notifications as long as it's installed via TestFlight / AppStore.  The calls are already there as well in `app.js`.  What needs to happen is `onRegister` `token` needs to be sent to the server, and the server needs to store it and decide when to send out a Push Notification to the user.  

Here's where you can use whatever works on the server -- even plug into AWS SNS if you want to.  This can be enabled through an AppHub update.  

If there's any other questions feel free to email me at ewindsor AT gmail.com.  Thank you!

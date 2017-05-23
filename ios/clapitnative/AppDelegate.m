/**
 * Copyright (c) 2015-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

#import "AppDelegate.h"
#import "RCTRootView.h"
#import "RCTLinkingManager.h"
//#import "RCTPushNotificationManager.h"
#import "RCTJavaScriptLoader.h"
#import <FBSDKCoreKit/FBSDKCoreKit.h>
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>
#import <asl.h>
#import "RCTLog.h"

#import "AppHub.h"
#import "../Pods/Kochava/TrackAndAd.h"

//firebase notification
#import "RNFIRMessaging.h"
#import "Mixpanel.h"

@implementation AppDelegate {
    RCTBridge *_bridge;
}
@synthesize kochavaTracker;

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  
  NSDictionary *initialProperties;
  self.hasNewVersion = NO;
  
  BOOL debugIsEnabled = [[NSUserDefaults standardUserDefaults] boolForKey:@"APPHUB_DEBUG"];
  [[AppHub buildManager] setDebugBuildsEnabled:debugIsEnabled];
  
#ifdef APPHUB
  [AppHub buildManager].debugBuildsEnabled = YES;
  [AppHub setApplicationID:@"Vjok55qv7ovFHRSsv9rL"];
#else
  [AppHub setApplicationID:@"ziXyQhFYZYs6V9FaQXYw"];
#endif
  
  [AppHub buildManager].cellularDownloadsEnabled = YES;

   //uncomment this to test release builds without being rewritten by apphub builds
   //[AppHub buildManager].automaticPollingEnabled = NO;

#ifdef DEBUG
  initialProperties = @{@"production":[NSNumber numberWithBool:NO], @"debug":[NSNumber numberWithBool:YES]};
#else
  initialProperties = @{@"production":[NSNumber numberWithBool:YES], @"debug":[NSNumber numberWithBool:NO]};
#endif
  
  _bridge = [[RCTBridge alloc] initWithDelegate:self
                                  launchOptions:launchOptions];
  
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:_bridge
                                                   moduleName:@"Clapit"
                                            initialProperties:initialProperties];
  
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
  [self.window makeKeyAndVisible];
  
  [[FBSDKApplicationDelegate sharedInstance] application:application
                           didFinishLaunchingWithOptions:launchOptions];

#ifdef DEBUG
  // USED ONLY FOR DEBUGGING
  [FBSDKSettings enableLoggingBehavior:FBSDKLoggingBehaviorAppEvents];
#endif
  
  [Fabric with:@[[Crashlytics class]]];
  //Add the following lines
  RCTSetLogThreshold(RCTLogLevelInfo);
  RCTSetLogFunction(CrashlyticsReactLogFunction);
  
  // Register a callback for when a new build becomes available.
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(newBuildDidBecomeAvailable:)
                                               name:AHBuildManagerDidMakeBuildAvailableNotification
                                             object:nil];
  
  // called from AppHubManager
  [[NSNotificationCenter defaultCenter] addObserver:self
                                           selector:@selector(reloadBridgeNotificationHandler:)
                                               name:@"reloadBridge"
                                             object:nil];
  NSDictionary *initDict = [NSDictionary dictionaryWithObjectsAndKeys:
                              @"koclapit-2ait", @"kochavaAppId",
                              @"1", @"enableLogging",
                              nil];
  kochavaTracker = [[KochavaTracker alloc] initKochavaWithParams:initDict];
  
  //firebase
  [FIRApp configure];

#ifdef DEBUG
   [Mixpanel sharedInstanceWithToken:@"23e6d9f0bf35e1f4308927110dbfc498"];
#else
   [Mixpanel sharedInstanceWithToken:@"a6052cd4d26b0d8b8ccc0609efe815d2"];
#endif

   Mixpanel *mixpanel = [Mixpanel sharedInstance];

   if ([[[UIDevice currentDevice] systemVersion] floatValue] >= 8.0)
   {
       [[UIApplication sharedApplication] registerUserNotificationSettings:[UIUserNotificationSettings settingsForTypes:(UIUserNotificationTypeSound | UIUserNotificationTypeAlert | UIUserNotificationTypeBadge) categories:nil]];
       [[UIApplication sharedApplication] registerForRemoteNotifications];
   }
   // This code will work in iOS 7.0 and below:
   else
   {
       [[UIApplication sharedApplication] registerForRemoteNotificationTypes: (UIRemoteNotificationTypeNewsstandContentAvailability| UIRemoteNotificationTypeBadge | UIRemoteNotificationTypeSound | UIRemoteNotificationTypeAlert)];
   }

  [mixpanel identify:mixpanel.distinctId];

  return YES;
}

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url sourceApplication:(NSString *)sourceApplication annotation:(id)annotation {
  if([[FBSDKApplicationDelegate sharedInstance] application:application
                                                                openURL:url
                                                      sourceApplication:sourceApplication
                                                             annotation:annotation
      ]) {
    return YES;
  }

  return [RCTLinkingManager application:application
                                openURL:url
                      sourceApplication:sourceApplication
                             annotation:annotation];
}

- (void)applicationWillEnterForeground:(UIApplication *)application {
  [self reloadBridge:NO];
}

// firebase notification
- (void)application:(UIApplication *)application didReceiveRemoteNotification:(NSDictionary *)notification fetchCompletionHandler:(void (^)(UIBackgroundFetchResult))handler {
  [[NSNotificationCenter defaultCenter] postNotificationName:FCMNotificationReceived object:self userInfo:notification];
  handler(UIBackgroundFetchResultNewData);
}

- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
    Mixpanel *mixpanel = [Mixpanel sharedInstance];
    [mixpanel.people addPushDeviceToken:deviceToken];
}

- (void)reloadBridge:(BOOL)force {
  if(force || self.hasNewVersion) {
    self.hasNewVersion = NO;
    [_bridge reload];
  }
}

// Required to enable install tracking

- (void)applicationDidBecomeActive:(UIApplication *)application {
  [FBSDKAppEvents activateApp];
}


#pragma mark - NSNotificationCenter

-(void) newBuildDidBecomeAvailable:(NSNotification *)notification {
  // Show an alert view when a new build becomes available. The user can choose to "Update" the app, or "Cancel".
  // If the user presses "Cancel", their app will update when they close the app.
  
  self.hasNewVersion = YES;
  
//  AHBuild *build = notification.userInfo[AHBuildManagerBuildKey];
//  NSString *alertMessage = [NSString stringWithFormat:@"There's a new update available.\n\nUpdate description:\n\n %@", build.buildDescription];
//  
//  UIAlertView *alert = [[UIAlertView alloc] initWithTitle:@"Great news!"
//                                                  message:alertMessage
//                                                 delegate:self
//                                        cancelButtonTitle:@"Cancel"
//                                        otherButtonTitles:@"Update", nil];
//  
//  dispatch_async(dispatch_get_main_queue(), ^{
//    // Show the alert on the main thread.
//    [alert show];
//  });
}

- (void)reloadBridgeNotificationHandler:(NSNotification *)notification {
  [self reloadBridge:YES];
}


#pragma mark - RCTBridgeDelegate
- (NSURL *)sourceURLForBridge:(__unused RCTBridge *)bridge
{
  NSURL *jsCodeLocation;
  NSString *groupIdentifier = @"group.com.clapit.Clapit";
  
#ifdef APPHUB
  groupIdentifier = @"group.com.clapit.ClapitTest";
#endif

#ifdef DEBUG
  jsCodeLocation = [NSURL URLWithString:@"http://localhost:8081/index.ios.bundle?platform=ios&dev=true"];
#else
  AHBuild *build = [[AppHub buildManager] currentBuildForGroupIdentifier:groupIdentifier];
  jsCodeLocation = [build.bundle URLForResource:@"main" withExtension:@"jsbundle"];
#endif
  

  return jsCodeLocation;
}

- (void)loadSourceForBridge:(RCTBridge *)bridge
                  withBlock:(RCTSourceLoadBlock)loadCallback
{
  [RCTJavaScriptLoader loadBundleAtURL:[self sourceURLForBridge:bridge]
                            onComplete:loadCallback];
}

#pragma mark - UIAlertViewDelegate

-(void) alertView:(UIAlertView *)alertView clickedButtonAtIndex:(NSInteger)buttonIndex {
  if (buttonIndex == 1) {
    self.hasNewVersion = NO;
    // The user pressed "update".
    [_bridge reload];
  }
}


RCTLogFunction CrashlyticsReactLogFunction = ^(
                                               RCTLogLevel level,
                                               __unused RCTLogSource source,
                                               NSString *fileName,
                                               NSNumber *lineNumber,
                                               NSString *message
                                               )
{
  NSString *log = RCTFormatLog([NSDate date], level, fileName, lineNumber, message);
  
  
#ifdef DEBUG
  fprintf(stderr, "%s\n", log.UTF8String);
  fflush(stderr);
#else
  CLS_LOG(@"REACT LOG: %s", log.UTF8String);
#endif
  
  int aslLevel;
  switch(level) {
    case RCTLogLevelTrace:
      aslLevel = ASL_LEVEL_DEBUG;
      break;
    case RCTLogLevelInfo:
      aslLevel = ASL_LEVEL_NOTICE;
      break;
    case RCTLogLevelWarning:
      aslLevel = ASL_LEVEL_WARNING;
      break;
    case RCTLogLevelError:
      aslLevel = ASL_LEVEL_ERR;
      break;
    case RCTLogLevelFatal:
      aslLevel = ASL_LEVEL_CRIT;
      break;
  }
  asl_log(NULL, NULL, aslLevel, "%s", message.UTF8String);
  
  
};



@end

//
//  AppHubManager.m
//  clapitnative
//
//  Created by Elijah Windsor on 4/29/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "AppHub.h"
#import "AppHubManager.h"
#import "AppDelegate.h"

@implementation AppHubManager

RCT_EXPORT_METHOD(hasNewVersion:(RCTResponseSenderBlock)callback) {
  dispatch_async(dispatch_get_main_queue(), ^{
    AppDelegate *appDelegate = (AppDelegate *)[[UIApplication sharedApplication]delegate];
    
    callback(@[[NSNull null], [NSNumber numberWithBool:appDelegate.hasNewVersion]]);
  });
}

RCT_EXPORT_METHOD(reloadBridge) {
    dispatch_async(dispatch_get_main_queue(), ^{
      [[NSNotificationCenter defaultCenter]postNotificationName:@"reloadBridge" object:nil];
    });
}

RCT_EXPORT_METHOD(setDebugMode:(BOOL)isEnabled) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [self _setDebugMode:isEnabled];
  });
}

RCT_EXPORT_METHOD(isDebugMode:(RCTResponseSenderBlock)callback) {
  dispatch_async(dispatch_get_main_queue(), ^{
    BOOL debugIsEnabled = [[NSUserDefaults standardUserDefaults] boolForKey:@"APPHUB_DEBUG"];
    callback(@[[NSNull null], @(debugIsEnabled)]);
  });
}

- (void)_setDebugMode:(BOOL)isEnabled {
  [[AppHub buildManager] setDebugBuildsEnabled:isEnabled];
  [[NSUserDefaults standardUserDefaults] setBool:isEnabled forKey:@"APPHUB_DEBUG"];

  // Optional: fetch the build right away to update instantly.
  [[AppHub buildManager] fetchBuildWithCompletionHandler:nil];
}

RCT_EXPORT_MODULE();

@end

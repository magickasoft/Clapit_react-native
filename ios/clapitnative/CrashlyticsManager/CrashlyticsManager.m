//
//  CrashlyticsManager.m
//  clapitnative
//
//  Created by Elijah Windsor on 5/2/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "CrashlyticsManager.h"
#import <Fabric/Fabric.h>
#import <Crashlytics/Crashlytics.h>

@implementation CrashlyticsManager

RCT_EXPORT_METHOD(logUser:(NSDictionary *)userInfo) {
  NSString *username = userInfo[@"username"];
  NSString *userIdentifier = userInfo[@"id"];
  NSString *userEmail = userInfo[@"email"];
  
  [CrashlyticsKit setUserIdentifier:userIdentifier];
  [CrashlyticsKit setUserName:username];
  [CrashlyticsKit setUserEmail:userEmail];
}

RCT_EXPORT_METHOD(forceCrash) {
  [[Crashlytics sharedInstance] crash];
}

RCT_EXPORT_MODULE();

@end

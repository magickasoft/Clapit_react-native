//
//  TwitterManager.m
//  clapitnative
//
//  Created by Elijah Windsor on 3/31/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "TwitterManager.h"
#import <TwitterKit/TwitterKit.h>
#import "AppDelegate.h"

@implementation TwitterManager

RCT_EXPORT_METHOD(startWithConsumerKeyAndSecret:(NSString *)consumerKey consumerSecret:(NSString *)consumerSecret)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [[Twitter sharedInstance]startWithConsumerKey:consumerKey consumerSecret:consumerSecret];
  });
}

RCT_EXPORT_METHOD(loginWithCompletion:(RCTResponseSenderBlock)callback)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    [[Twitter sharedInstance]logInWithCompletion:^(TWTRSession * _Nullable session, NSError * _Nullable error) {
      if(error || !session) {  // TODO: figure out real error?  prob. cancelled i assume, for now.  for our purposes cancelled is fine
        callback(@[@{@"cancelled":@YES}]);
        return;
      }
      
      NSDictionary *sessionData = @{@"userID": session.userID, @"userName": session.userName, @"authToken": session.authToken, @"authTokenSecret": session.authTokenSecret};

      callback(@[@{@"cancelled":@NO, @"session": sessionData}]);
    }];
  });
}

RCT_EXPORT_METHOD(logout) {
  dispatch_async(dispatch_get_main_queue(), ^{
    [[Twitter sharedInstance]logOut];
  });
}

RCT_EXPORT_METHOD(requestEmail:(RCTResponseSenderBlock)callback) {
  TWTRShareEmailViewController *emailVc = [[TWTRShareEmailViewController alloc]initWithCompletion:^(NSString * _Nullable email, NSError * _Nullable error) {
    if(error || !email) {
      callback(@[@{@"cancelled":@YES}]);
      return;
    }

    callback(@[@{@"canelled": @NO, @"email": email}]);
  }];
  
  dispatch_async(dispatch_get_main_queue(), ^{
    AppDelegate *appDelegate = [[UIApplication sharedApplication]delegate];
    
    [appDelegate.window.rootViewController presentViewController:emailVc animated:YES completion:nil];
  });
}


RCT_EXPORT_MODULE();

@end

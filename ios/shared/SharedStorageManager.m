//
//  SharedStorageManager.m
//  clapitnative
//
//  Created by Elijah Windsor on 4/14/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "SharedStorageManager.h"

@implementation SharedStorageManager

RCT_EXPORT_METHOD(setItem:(NSString *)key value:(NSString *)value callback:(RCTResponseSenderBlock)callback) {
  NSUserDefaults *userDefaults = [self getUserDefaults];
  
  [userDefaults setObject:value forKey:key];
  
  callback(@[[NSNull null]]);
}

RCT_EXPORT_METHOD(getItem:(NSString *)key callback:(RCTResponseSenderBlock)callback) {
  NSUserDefaults *userDefaults = [self getUserDefaults];

  callback(@[[NSNull null], [userDefaults objectForKey:key]]);
}

RCT_EXPORT_METHOD(removeItem:(NSString *)key callback:(RCTResponseSenderBlock)callback) {
  NSUserDefaults *userDefaults = [self getUserDefaults];
  
  [userDefaults removeObjectForKey:key];
  
  callback(@[[NSNull null]]);
}

RCT_EXPORT_METHOD(getAllKeys:(RCTResponseSenderBlock)callback) {
  NSUserDefaults *userDefaults = [self getUserDefaults];
  

  callback(@[[NSNull null], [[userDefaults dictionaryRepresentation]allKeys]]);
}


RCT_EXPORT_METHOD(synchronize:(RCTResponseSenderBlock)callback) {
  NSUserDefaults *userDefaults = [self getUserDefaults];
  
  [userDefaults synchronize];
  
  callback(@[[NSNull null]]);
}

- (NSUserDefaults *)getUserDefaults {
  NSString *groupIdentifier = @"group.com.clapit.Clapit";
  
#ifdef APPHUB
  groupIdentifier = @"group.com.clapit.ClapitTest";
#endif
  
  return [[NSUserDefaults alloc]initWithSuiteName:groupIdentifier];
}

RCT_EXPORT_MODULE();

@end

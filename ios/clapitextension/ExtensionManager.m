//
//  ExtensionManager.m
//  clapitnative
//
//  Created by Elijah Windsor on 4/11/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "ExtensionManager.h"

@implementation ExtensionManager


RCT_EXPORT_METHOD(closeExtension) {
  [[NSNotificationCenter defaultCenter] postNotificationName:@"closeExtension" object:nil];
}

RCT_EXPORT_METHOD(showUploadError) {
  [[NSNotificationCenter defaultCenter] postNotificationName:@"showUploadError" object:nil];
}

RCT_EXPORT_METHOD(showLoginNeeded) {
  [[NSNotificationCenter defaultCenter] postNotificationName:@"showLoginNeeded" object:nil];
}

RCT_EXPORT_MODULE()

@end

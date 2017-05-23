//
//  SharedStorageManager.h
//  clapitnative
//
//  Created by Elijah Windsor on 4/14/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "RCTBridgeModule.h"
#import <Foundation/Foundation.h>

@interface SharedStorageManager : NSObject<RCTBridgeModule>

@property(strong, nonnull) NSString *suiteName;

@end

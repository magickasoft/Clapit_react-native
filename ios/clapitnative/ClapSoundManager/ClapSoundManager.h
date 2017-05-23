//
//  ClapSoundManager.h
//  clapitnative
//
//  Created by Elijah Windsor on 4/8/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "RCTBridgeModule.h"
#import <AudioToolbox/AudioToolbox.h>

@interface ClapSoundManager : NSObject<RCTBridgeModule> {
  SystemSoundID soundID;
}

@end

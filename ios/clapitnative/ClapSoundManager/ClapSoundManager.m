//
//  ClapSoundManager.m
//  clapitnative
//
//  Created by Elijah Windsor on 4/8/16.
//  Copyright © 2016 Facebook. All rights reserved.
//

#import "ClapSoundManager.h"

@implementation ClapSoundManager

-(id)init {
  if(self = [super init]) {
    NSURL *fileURL = [[NSBundle mainBundle] URLForResource:@"clap" withExtension:@"m4a"];
    if (fileURL != nil)
    {
      SystemSoundID theSoundID;
      OSStatus error = AudioServicesCreateSystemSoundID((__bridge CFURLRef)fileURL, &theSoundID);
      if (error == kAudioServicesNoError)
        soundID = theSoundID;
    }
  }
  
  return self;
}

RCT_EXPORT_METHOD(playClap) {
  AudioServicesPlaySystemSound(soundID);
}

RCT_EXPORT_MODULE()

@end

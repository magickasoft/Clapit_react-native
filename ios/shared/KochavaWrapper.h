//
// Created by Roman Mandryk on 21/06/2016.
//

#import "RCTBridgeModule.h"
#import <Foundation/Foundation.h>
#import "../Pods/Kochava/TrackAndAd.h"

@interface KochavaWrapper : NSObject<RCTBridgeModule>

@property(readonly) KochavaTracker *kochavaTracker;

@end